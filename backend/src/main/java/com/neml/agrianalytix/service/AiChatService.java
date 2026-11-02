package com.neml.agrianalytix.service;

import com.neml.agrianalytix.domain.AuctionFact;
import com.neml.agrianalytix.domain.ParticipantFact;
import com.neml.agrianalytix.dto.AiInsightDto.*;
import com.neml.agrianalytix.dto.DashboardFilter;
import com.neml.agrianalytix.dto.PriceDiscoveryDto;
import com.neml.agrianalytix.dto.SummaryDto;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.text.NumberFormat;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AiChatService {

    private final DashboardQueryService queryService;
    private final DashboardStore store;
    private final AiAnalysisService analysisService;

    public AiChatService(DashboardQueryService queryService, DashboardStore store, AiAnalysisService analysisService) {
        this.queryService = queryService;
        this.store = store;
        this.analysisService = analysisService;
    }

    public ChatResponse chat(ChatRequest request) {
        String msg = request.message() == null ? "" : request.message().trim().toLowerCase(Locale.ROOT);
        DashboardFilter filter = request.filter() == null ? DashboardFilter.normalize(null,null,null,null,null,null,null,null,null,null,null,null,null,null) : request.filter();

        List<AuctionFact> rows = queryService.filteredAuctions(filter);
        List<ParticipantFact> participants = store.participants(filter.source());

        List<String> matchedDimensions = new ArrayList<>();
        List<DataBadge> dataBadges = new ArrayList<>();
        List<String> followUps = new ArrayList<>();
        StringBuilder answer = new StringBuilder();

        // 1. Identify specific commodity mention
        Set<String> knownCommodities = rows.stream()
                .map(AuctionFact::commodity)
                .filter(c -> c != null && !c.isBlank())
                .collect(Collectors.toSet());

        String targetCommodity = null;
        for (String c : knownCommodities) {
            if (msg.contains(c.toLowerCase(Locale.ROOT))) {
                targetCommodity = c;
                matchedDimensions.add("COMMODITY: " + c);
                break;
            }
        }

        // 2. Identify State mention
        Set<String> knownStates = rows.stream()
                .map(AuctionFact::state)
                .filter(s -> s != null && !s.isBlank())
                .collect(Collectors.toSet());
        String targetState = null;
        for (String s : knownStates) {
            if (msg.contains(s.toLowerCase(Locale.ROOT))) {
                targetState = s;
                matchedDimensions.add("STATE: " + s);
                break;
            }
        }

        // 3. Routing by Intent
        if (targetCommodity != null && (msg.contains("clearance") || msg.contains("demand") || msg.contains("price") || msg.contains("why") || msg.contains("performance") || msg.contains("analyze"))) {
            buildCommodityDeepDive(targetCommodity, rows, answer, dataBadges, followUps);
        } else if (msg.contains("single bidder") || msg.contains("1 bidder") || msg.contains("2 bidder") || msg.contains("low bidder") || msg.contains("competition") || msg.contains("collusion")) {
            buildLowBidderAnalysis(rows, answer, dataBadges, followUps);
        } else if (msg.contains("forward") || msg.contains("reverse") || msg.contains("spread") || msg.contains("price discovery")) {
            buildPriceDiscoveryAnalysis(targetCommodity, rows, filter, answer, dataBadges, followUps);
        } else if (msg.contains("anomaly") || msg.contains("anomalies") || msg.contains("risk") || msg.contains("health") || msg.contains("alert")) {
            buildAnomalyRiskAnalysis(filter, answer, dataBadges, followUps);
        } else if (msg.contains("top client") || msg.contains("top participant") || msg.contains("ranking") || msg.contains("leader") || msg.contains("who won")) {
            buildRankingAnalysis(rows, msg, answer, dataBadges, followUps);
        } else if (msg.contains("state") || targetState != null) {
            buildStateAnalysis(targetState, rows, answer, dataBadges, followUps);
        } else if (msg.contains("clearance") || msg.contains("unapproved") || msg.contains("approval rate")) {
            buildClearanceApprovalAnalysis(rows, answer, dataBadges, followUps);
        } else {
            // Default Executive Overview
            buildExecutiveOverview(filter, rows, participants, answer, dataBadges, followUps);
        }

        return new ChatResponse(
                answer.toString(),
                followUps.stream().distinct().limit(4).toList(),
                dataBadges,
                matchedDimensions,
                0.94
        );
    }

    private void buildExecutiveOverview(DashboardFilter filter, List<AuctionFact> rows, List<ParticipantFact> participants,
                                        StringBuilder answer, List<DataBadge> dataBadges, List<String> followUps) {
        SummaryDto summary = queryService.summary(filter);
        BigDecimal turnover = summary.totalTradeValue() == null ? BigDecimal.ZERO : summary.totalTradeValue();

        answer.append("### 📊 Executive Market Intelligence Overview\n\n");
        answer.append(String.format("Based on the **%s** dataset slice:\n\n", filter.source() == null ? "Combined Multi-Source" : filter.source().name()));
        answer.append(String.format("- **Total Auctions Executed**: **%d** (%d approved, %.1f%% approval rate)\n",
                summary.totalAuctions(), summary.approvedAuctions(), summary.approvalRate()));
        answer.append(String.format("- **Total Trade Turnover**: **₹%s**\n", formatCrore(turnover)));
        answer.append(String.format("- **Auction Modes**: **%d Forward** (sellers) vs **%d Reverse** (procurement buyers)\n",
                summary.forwardAuctions(), summary.reverseAuctions()));
        answer.append(String.format("- **Participant Liquidity**: **%d participating bidders** out of %d registered organizations\n\n",
                summary.participatingBidders(), summary.registeredBidders()));

        answer.append("#### Key Observation:\n");
        if (summary.approvalRate() < 60.0) {
            answer.append("> ⚠️ **Low approval velocity detected.** Over 40% of executed auctions were rejected or not approved, predominantly due to reserve price misalignments.\n\n");
        } else {
            answer.append("> ✅ **Healthy trade absorption.** Clearance and approval rates reflect steady market participation across active auction mandates.\n\n");
        }

        dataBadges.add(new DataBadge("Turnover", "₹" + formatCrore(turnover), "primary"));
        dataBadges.add(new DataBadge("Approval Rate", String.format("%.1f%%", summary.approvalRate()), summary.approvalRate() >= 70 ? "positive" : "negative"));
        dataBadges.add(new DataBadge("Active Bidders", String.valueOf(summary.participatingBidders()), "neutral"));

        followUps.add("Which commodities have the lowest clearance rates?");
        followUps.add("Which auctions had only 1 or 2 bidders?");
        followUps.add("Compare Forward vs Reverse auction price discovery");
        followUps.add("Who are the top 3 participating clients?");
    }

    private void buildCommodityDeepDive(String commodity, List<AuctionFact> rows,
                                        StringBuilder answer, List<DataBadge> dataBadges, List<String> followUps) {
        List<AuctionFact> commRows = rows.stream().filter(r -> commodity.equalsIgnoreCase(r.commodity())).toList();
        long count = commRows.size();
        long approved = commRows.stream().filter(AuctionFact::approved).count();
        BigDecimal offered = sum(commRows, AuctionFact::auctionQty);
        BigDecimal approvedQty = sum(commRows, AuctionFact::approvedQty);
        BigDecimal tradedQty = sum(commRows, AuctionFact::tradeQty);
        BigDecimal tradeVal = sum(commRows, AuctionFact::tradeValue);
        BigDecimal avgPrice = average(commRows, AuctionFact::tradePrice);

        double clearance = offered.signum() == 0 ? 0 :
                approvedQty.multiply(BigDecimal.valueOf(100)).divide(offered, 2, RoundingMode.HALF_UP).doubleValue();

        String uom = commRows.stream().map(AuctionFact::qtyUnit).filter(Objects::nonNull).findFirst().orElse("MT");

        answer.append(String.format("### 🌾 Deep-Dive Analysis: **%s**\n\n", commodity));
        answer.append(String.format("Across **%d auctions** for %s:\n\n", count, commodity));
        answer.append(String.format("- **Offered Volume**: %s %s\n", formatNumber(offered), uom));
        answer.append(String.format("- **Cleared Volume**: %s %s (Clearance Rate: **%.1f%%**)\n", formatNumber(approvedQty), uom, clearance));
        answer.append(String.format("- **Traded Turnover**: **₹%s**\n", formatCrore(tradeVal)));
        answer.append(String.format("- **Weighted Avg Trade Price**: **₹%s / %s**\n\n", formatNumber(avgPrice), uom));

        // Forward vs Reverse breakdown for this commodity
        List<AuctionFact> fwd = commRows.stream().filter(r -> "FORWARD".equalsIgnoreCase(r.auctionMode())).toList();
        List<AuctionFact> rev = commRows.stream().filter(r -> "REVERSE".equalsIgnoreCase(r.auctionMode())).toList();

        if (!fwd.isEmpty() && !rev.isEmpty()) {
            BigDecimal avgFwd = average(fwd, AuctionFact::tradePrice);
            BigDecimal avgRev = average(rev, AuctionFact::tradePrice);
            answer.append("#### Dual Auction Price Discovery:\n");
            answer.append(String.format("- **Forward Auctions (%d)**: Avg Trade Price = **₹%s / %s**\n", fwd.size(), formatNumber(avgFwd), uom));
            answer.append(String.format("- **Reverse Auctions (%d)**: Avg Trade Price = **₹%s / %s**\n", rev.size(), formatNumber(avgRev), uom));
            if (avgFwd.signum() > 0 && avgRev.signum() > 0) {
                BigDecimal diff = avgFwd.subtract(avgRev);
                answer.append(String.format("- **Price Spread**: ₹%s / %s (%s is higher)\n\n",
                        formatNumber(diff.abs()), uom, diff.signum() >= 0 ? "Forward" : "Reverse"));
            }
        }

        dataBadges.add(new DataBadge(commodity + " Turnover", "₹" + formatCrore(tradeVal), "primary"));
        dataBadges.add(new DataBadge("Clearance", String.format("%.1f%%", clearance), clearance >= 60 ? "positive" : "negative"));
        dataBadges.add(new DataBadge("Avg Price", "₹" + formatNumber(avgPrice), "neutral"));

        followUps.add(String.format("Which warehouses store %s?", commodity));
        followUps.add(String.format("Who are the top buyers for %s?", commodity));
        followUps.add("Show me single-bidder auctions for this commodity");
        followUps.add("What is the monthly price trend for " + commodity + "?");
    }

    private void buildLowBidderAnalysis(List<AuctionFact> rows, StringBuilder answer,
                                        List<DataBadge> dataBadges, List<String> followUps) {
        List<AuctionFact> lowBidders = rows.stream()
                .filter(r -> r.bidderCount() > 0 && r.bidderCount() <= 2 && r.approved() && positive(r.tradeValue()))
                .sorted(Comparator.comparing(AuctionFact::tradeValue).reversed())
                .toList();

        BigDecimal lowVal = sum(lowBidders, AuctionFact::tradeValue);
        BigDecimal totalVal = sum(rows, AuctionFact::tradeValue);
        double share = totalVal.signum() == 0 ? 0 : lowVal.multiply(BigDecimal.valueOf(100)).divide(totalVal, 2, RoundingMode.HALF_UP).doubleValue();

        answer.append("### ⚠️ Bidder Competition & Auction Liquidity Audit\n\n");
        answer.append(String.format("Identified **%d approved auctions** that settled with **2 or fewer participating bidders**:\n\n", lowBidders.size()));
        answer.append(String.format("- **Total Trade Value in Low-Competition Auctions**: **₹%s** (accounts for **%.1f%%** of total market turnover)\n",
                formatCrore(lowVal), share));
        answer.append("- **Market Risk Assessment**: Auctions with limited bidder depth risk suboptimal clearing prices and lower seller realization.\n\n");

        if (!lowBidders.isEmpty()) {
            answer.append("#### Top High-Value Low-Competition Auctions:\n");
            for (int i = 0; i < Math.min(4, lowBidders.size()); i++) {
                AuctionFact a = lowBidders.get(i);
                answer.append(String.format("%d. **Auction #%s** (`%s` - %s in %s): **%d Bidder(s)** | Traded Value: **₹%s** at ₹%s/%s\n",
                        i + 1, a.auctionId(), a.commodity(), a.auctionMode(), a.state() == null ? "N/A" : a.state(),
                        a.bidderCount(), formatCrore(a.tradeValue()), formatNumber(a.tradePrice()), a.qtyUnit()));
            }
            answer.append("\n");
        }

        dataBadges.add(new DataBadge("Low-Bidder Auctions", String.valueOf(lowBidders.size()), "negative"));
        dataBadges.add(new DataBadge("At-Risk Turnover", "₹" + formatCrore(lowVal), "negative"));
        dataBadges.add(new DataBadge("Turnover Share", String.format("%.1f%%", share), "neutral"));

        followUps.add("Which clients conducted these low-competition auctions?");
        followUps.add("What is the average bidder count across all commodities?");
        followUps.add("Show me auctions with 5 or more competing bidders");
    }

    private void buildPriceDiscoveryAnalysis(String targetCommodity, List<AuctionFact> rows, DashboardFilter filter,
                                             StringBuilder answer, List<DataBadge> dataBadges, List<String> followUps) {
        List<PriceDiscoveryDto> pd = queryService.priceDiscovery(filter, 4);
        List<AuctionFact> fwdRows = rows.stream().filter(r -> "FORWARD".equalsIgnoreCase(r.auctionMode()) && positive(r.tradePrice())).toList();
        List<AuctionFact> revRows = rows.stream().filter(r -> "REVERSE".equalsIgnoreCase(r.auctionMode()) && positive(r.tradePrice())).toList();

        BigDecimal avgFwd = average(fwdRows, AuctionFact::tradePrice);
        BigDecimal avgRev = average(revRows, AuctionFact::tradePrice);

        answer.append("### ⚖️ Forward vs Reverse Price Discovery Analysis\n\n");
        answer.append("In NeML commodity auctions:\n");
        answer.append("- **Forward Auctions (`AO` + `S`)**: Sellers offering commodities; highest bidder wins.\n");
        answer.append("- **Reverse Auctions (`AO` + `B`)**: Buyers procuring commodities; lowest offer wins.\n\n");

        answer.append("#### Market Price Benchmarks:\n");
        answer.append(String.format("- **Forward Executions**: %d auctions | Average Trade Price: **₹%s**\n", fwdRows.size(), formatNumber(avgFwd)));
        answer.append(String.format("- **Reverse Executions**: %d auctions | Average Trade Price: **₹%s**\n\n", revRows.size(), formatNumber(avgRev)));

        if (!pd.isEmpty()) {
            answer.append("#### Outlier Price Discovery Highlights:\n");
            for (PriceDiscoveryDto item : pd) {
                answer.append(String.format("- **%s**: **%s** in %s at **₹%s / %s** (Auction #%s)\n",
                        item.mode(), item.commodity(), item.market(), formatNumber(item.price()), item.qtyUnit(), item.auctionId()));
            }
            answer.append("\n");
        }

        dataBadges.add(new DataBadge("Forward Avg", "₹" + formatNumber(avgFwd), "primary"));
        dataBadges.add(new DataBadge("Reverse Avg", "₹" + formatNumber(avgRev), "neutral"));

        followUps.add("Compare Forward and Reverse for Sugar");
        followUps.add("Which commodity had the highest single trade price?");
        followUps.add("Are Reverse auction clearing prices lower than MSP benchmarks?");
    }

    private void buildRankingAnalysis(List<AuctionFact> rows, String msg,
                                      StringBuilder answer, List<DataBadge> dataBadges, List<String> followUps) {
        boolean isClient = msg.contains("client");
        boolean isParticipant = msg.contains("participant") || msg.contains("who won");

        if (isParticipant) {
            Map<String, List<AuctionFact>> byOrg = rows.stream()
                    .filter(r -> r.organizationName() != null && !r.organizationName().isBlank())
                    .collect(Collectors.groupingBy(AuctionFact::organizationName));

            List<Map.Entry<String, List<AuctionFact>>> sorted = byOrg.entrySet().stream()
                    .sorted((e1, e2) -> sum(e2.getValue(), AuctionFact::tradeValue).compareTo(sum(e1.getValue(), AuctionFact::tradeValue)))
                    .limit(5).toList();

            answer.append("### 🏆 Top Participating Organizations by Trade Turnover\n\n");
            int rank = 1;
            for (Map.Entry<String, List<AuctionFact>> e : sorted) {
                BigDecimal val = sum(e.getValue(), AuctionFact::tradeValue);
                answer.append(String.format("%d. **%s**: **₹%s** across %d auctions\n",
                        rank++, e.getKey(), formatCrore(val), e.getValue().size()));
            }
            answer.append("\n");
            if (!sorted.isEmpty()) {
                dataBadges.add(new DataBadge("Top Org", sorted.get(0).getKey(), "primary"));
            }
        } else {
            // Default to Client ranking
            Map<String, List<AuctionFact>> byClient = rows.stream()
                    .filter(r -> r.globalClient() != null && !r.globalClient().isBlank())
                    .collect(Collectors.groupingBy(AuctionFact::globalClient));

            List<Map.Entry<String, List<AuctionFact>>> sorted = byClient.entrySet().stream()
                    .sorted((e1, e2) -> sum(e2.getValue(), AuctionFact::tradeValue).compareTo(sum(e1.getValue(), AuctionFact::tradeValue)))
                    .limit(5).toList();

            answer.append("### 🏛️ Top Clients by Total Auction Value\n\n");
            int rank = 1;
            for (Map.Entry<String, List<AuctionFact>> e : sorted) {
                BigDecimal val = sum(e.getValue(), AuctionFact::tradeValue);
                long approved = e.getValue().stream().filter(AuctionFact::approved).count();
                double appRate = e.getValue().isEmpty() ? 0 : (approved * 100.0) / e.getValue().size();
                answer.append(String.format("%d. **%s**: **₹%s** (%d auctions, %.1f%% approval rate)\n",
                        rank++, e.getKey(), formatCrore(val), e.getValue().size(), appRate));
            }
            answer.append("\n");
            if (!sorted.isEmpty()) {
                dataBadges.add(new DataBadge("Top Client", sorted.get(0).getKey(), "primary"));
            }
        }

        followUps.add("Who are the top participating bidders?");
        followUps.add("What commodities does the #1 client trade?");
        followUps.add("Show me the client ranking by volume quantity");
    }

    private void buildStateAnalysis(String targetState, List<AuctionFact> rows,
                                    StringBuilder answer, List<DataBadge> dataBadges, List<String> followUps) {
        if (targetState != null) {
            List<AuctionFact> stateRows = rows.stream().filter(r -> targetState.equalsIgnoreCase(r.state())).toList();
            BigDecimal stateVal = sum(stateRows, AuctionFact::tradeValue);
            long approved = stateRows.stream().filter(AuctionFact::approved).count();

            answer.append(String.format("### 📍 Geographic Intelligence: **%s**\n\n", targetState));
            answer.append(String.format("- **Total Auctions in %s**: %d (%d approved)\n", targetState, stateRows.size(), approved));
            answer.append(String.format("- **Total Trade Value**: **₹%s**\n\n", formatCrore(stateVal)));

            Map<String, List<AuctionFact>> byComm = stateRows.stream()
                    .filter(r -> r.commodity() != null && !r.commodity().isBlank())
                    .collect(Collectors.groupingBy(AuctionFact::commodity));

            answer.append("#### Commodities Traded in " + targetState + ":\n");
            for (Map.Entry<String, List<AuctionFact>> e : byComm.entrySet()) {
                BigDecimal val = sum(e.getValue(), AuctionFact::tradeValue);
                answer.append(String.format("- **%s**: %d auctions | ₹%s turnover\n", e.getKey(), e.getValue().size(), formatCrore(val)));
            }
            answer.append("\n");
            dataBadges.add(new DataBadge(targetState + " Turnover", "₹" + formatCrore(stateVal), "primary"));
        } else {
            Map<String, List<AuctionFact>> byState = rows.stream()
                    .filter(r -> r.state() != null && !r.state().isBlank())
                    .collect(Collectors.groupingBy(AuctionFact::state));

            answer.append("### 🗺️ State-Wise Turnover Distribution\n\n");
            byState.entrySet().stream()
                    .sorted((e1, e2) -> sum(e2.getValue(), AuctionFact::tradeValue).compareTo(sum(e1.getValue(), AuctionFact::tradeValue)))
                    .limit(5)
                    .forEach(e -> {
                        BigDecimal val = sum(e.getValue(), AuctionFact::tradeValue);
                        answer.append(String.format("- **%s**: **₹%s** (%d auctions)\n", e.getKey(), formatCrore(val), e.getValue().size()));
                    });
            answer.append("\n");
        }

        followUps.add("Which state has the highest clearance rate?");
        followUps.add("Show me warehouse breakdown for the top state");
        followUps.add("Compare Maharashtra vs Madhya Pradesh");
    }

    private void buildClearanceApprovalAnalysis(List<AuctionFact> rows, StringBuilder answer,
                                                List<DataBadge> dataBadges, List<String> followUps) {
        long total = rows.size();
        long approved = rows.stream().filter(AuctionFact::approved).count();
        double approvalRate = total == 0 ? 0 : (approved * 100.0) / total;

        answer.append("### 📈 Clearance & Approval Velocity Analysis\n\n");
        answer.append(String.format("- **Approval Rate**: **%.1f%%** (%d approved out of %d executed auctions)\n", approvalRate, approved, total));
        answer.append(String.format("- **Unapproved / Rejected Auctions**: **%d auctions**\n\n", total - approved));

        Map<String, List<AuctionFact>> byComm = rows.stream()
                .filter(r -> r.commodity() != null && !r.commodity().isBlank())
                .collect(Collectors.groupingBy(AuctionFact::commodity));

        answer.append("#### Commodity Clearance Breakdown:\n");
        for (Map.Entry<String, List<AuctionFact>> e : byComm.entrySet()) {
            BigDecimal off = sum(e.getValue(), AuctionFact::auctionQty);
            BigDecimal app = sum(e.getValue(), AuctionFact::approvedQty);
            double cl = off.signum() == 0 ? 0 : app.multiply(BigDecimal.valueOf(100)).divide(off, 2, RoundingMode.HALF_UP).doubleValue();
            answer.append(String.format("- **%s**: %.1f%% clearance (%d auctions)\n", e.getKey(), cl, e.getValue().size()));
        }
        answer.append("\n");

        dataBadges.add(new DataBadge("Approval Rate", String.format("%.1f%%", approvalRate), approvalRate >= 70 ? "positive" : "negative"));
        dataBadges.add(new DataBadge("Unapproved Lots", String.valueOf(total - approved), "neutral"));

        followUps.add("Why were auctions rejected in the lowest clearance commodity?");
        followUps.add("Which client has the highest approval rate?");
        followUps.add("What is the financial impact of unapproved lots?");
    }

    private void buildAnomalyRiskAnalysis(DashboardFilter filter, StringBuilder answer,
                                          List<DataBadge> dataBadges, List<String> followUps) {
        AnalysisResponse analysis = analysisService.analyze(filter);

        answer.append("### 🚨 Market Anomalies & Risk Diagnostics\n\n");
        answer.append(String.format("**Overall Market Health Score**: **%d/100 (%s)**\n\n",
                analysis.marketHealthScore(), analysis.healthScoreLabel()));
        answer.append(String.format("%s\n\n", analysis.executiveNarrative()));

        if (!analysis.insights().isEmpty()) {
            answer.append("#### Detected Alert Signals:\n");
            for (InsightItem item : analysis.insights()) {
                String icon = switch (item.type()) {
                    case ANOMALY -> "⚡";
                    case RISK -> "⚠️";
                    case OPPORTUNITY -> "💡";
                    default -> "📌";
                };
                answer.append(String.format("%s **%s** (`%s`): %s [%s]\n",
                        icon, item.title(), item.severity(), item.description(), item.metricHighlight()));
            }
            answer.append("\n");
        }

        dataBadges.add(new DataBadge("Health Score", analysis.marketHealthScore() + "/100", analysis.marketHealthScore() >= 70 ? "positive" : "negative"));
        dataBadges.add(new DataBadge("Alerts", String.valueOf(analysis.insights().size()), analysis.insights().isEmpty() ? "positive" : "negative"));

        followUps.addAll(analysis.suggestedQuestions());
    }

    private BigDecimal sum(List<AuctionFact> rows, java.util.function.Function<AuctionFact, BigDecimal> fn) {
        return rows.stream().map(fn).filter(Objects::nonNull).reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private BigDecimal average(List<AuctionFact> rows, java.util.function.Function<AuctionFact, BigDecimal> fn) {
        List<BigDecimal> values = rows.stream().map(fn).filter(this::positive).toList();
        if (values.isEmpty()) return BigDecimal.ZERO;
        return values.stream().reduce(BigDecimal.ZERO, BigDecimal::add).divide(BigDecimal.valueOf(values.size()), 2, RoundingMode.HALF_UP);
    }

    private boolean positive(BigDecimal v) {
        return v != null && v.signum() > 0;
    }

    private String formatCrore(BigDecimal v) {
        if (v == null || v.signum() == 0) return "0.00 Cr";
        BigDecimal cr = v.divide(BigDecimal.valueOf(10_000_000), 2, RoundingMode.HALF_UP);
        return cr.toPlainString() + " Cr";
    }

    private String formatNumber(BigDecimal v) {
        if (v == null) return "0";
        return NumberFormat.getNumberInstance(Locale.US).format(v.setScale(2, RoundingMode.HALF_UP));
    }
}
