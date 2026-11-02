package com.neml.agrianalytix.service;

import com.neml.agrianalytix.domain.AuctionFact;
import com.neml.agrianalytix.domain.ParticipantFact;
import com.neml.agrianalytix.dto.AiInsightDto;
import com.neml.agrianalytix.dto.AiInsightDto.*;
import com.neml.agrianalytix.dto.DashboardFilter;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AiAnalysisService {

    private final DashboardQueryService queryService;
    private final DashboardStore store;

    public AiAnalysisService(DashboardQueryService queryService, DashboardStore store) {
        this.queryService = queryService;
        this.store = store;
    }

    public AnalysisResponse analyze(DashboardFilter filter) {
        List<AuctionFact> rows = queryService.filteredAuctions(filter);
        List<ParticipantFact> participants = store.participants(filter.source());

        if (rows.isEmpty()) {
            return new AnalysisResponse(
                    "No auction data found matching the selected filter criteria. Adjust your filters to view AI market intelligence.",
                    50,
                    "INSUFFICIENT DATA",
                    List.of(new InsightItem(
                            "insufficient-data",
                            InsightType.BENCHMARK,
                            Severity.LOW,
                            "Dataset Empty for Current Slice",
                            "Try clearing or broadening the project, commodity, or date filters to allow the AI engine to evaluate auction liquidity.",
                            "0 records",
                            null,
                            null,
                            "What date ranges or commodities have active auctions?"
                    )),
                    List.of(
                            "What date ranges or commodities have active auctions?",
                            "Show me overall auction volume across all sources",
                            "Which commodities are traded most frequently?"
                    ),
                    Map.of("totalAuctions", 0, "totalTradeValue", BigDecimal.ZERO),
                    store.dataAsOf()
            );
        }

        List<InsightItem> insights = new ArrayList<>();
        List<String> suggestedQuestions = new ArrayList<>();

        // 1. Overall Aggregations
        long totalAuctions = rows.size();
        long approvedAuctions = rows.stream().filter(AuctionFact::approved).count();
        double approvalRate = totalAuctions == 0 ? 0 : (approvedAuctions * 100.0) / totalAuctions;
        BigDecimal totalTradeValue = rows.stream().map(AuctionFact::tradeValue).filter(Objects::nonNull).reduce(BigDecimal.ZERO, BigDecimal::add);

        // 2. Commodity Level Clearance & Volume
        Map<String, List<AuctionFact>> byCommodity = rows.stream()
                .filter(r -> r.commodity() != null && !r.commodity().isBlank())
                .collect(Collectors.groupingBy(AuctionFact::commodity));

        for (Map.Entry<String, List<AuctionFact>> entry : byCommodity.entrySet()) {
            String comm = entry.getKey();
            List<AuctionFact> commRows = entry.getValue();
            BigDecimal offered = sum(commRows, AuctionFact::auctionQty);
            BigDecimal approved = sum(commRows, AuctionFact::approvedQty);
            double clearance = offered.signum() == 0 ? 0 :
                    approved.multiply(BigDecimal.valueOf(100)).divide(offered, 2, RoundingMode.HALF_UP).doubleValue();

            if (clearance < 50.0 && offered.compareTo(BigDecimal.valueOf(100)) > 0) {
                insights.add(new InsightItem(
                        "clearance-drop-" + comm.toLowerCase(Locale.ROOT),
                        InsightType.ANOMALY,
                        Severity.HIGH,
                        "Low Clearance Rate in " + comm,
                        String.format("Only %.1f%% of offered volume was cleared for %s across %d auctions. Substantial supply remains unsold or rejected.", clearance, comm, commRows.size()),
                        String.format("%.1f%% Clearance", clearance),
                        comm,
                        null,
                        String.format("Why is %s clearance at only %.1f%% and which warehouses have unsold lots?", comm, clearance)
                ));
                suggestedQuestions.add(String.format("Why is %s clearance at only %.1f%%?", comm, clearance));
            } else if (clearance > 88.0 && commRows.size() >= 3) {
                insights.add(new InsightItem(
                        "strong-demand-" + comm.toLowerCase(Locale.ROOT),
                        InsightType.OPPORTUNITY,
                        Severity.POSITIVE,
                        "High Demand & Liquidity: " + comm,
                        String.format("%s demonstrates exceptional absorption with a %.1f%% clearance rate and %d approved transactions.", comm, clearance, commRows.size()),
                        String.format("%.1f%% Clearance", clearance),
                        comm,
                        null,
                        String.format("What is driving strong demand and high clearance for %s?", comm)
                ));
                suggestedQuestions.add(String.format("What is driving strong demand for %s?", comm));
            }
        }

        // 3. Forward vs Reverse Price Discovery Spread
        for (Map.Entry<String, List<AuctionFact>> entry : byCommodity.entrySet()) {
            String comm = entry.getKey();
            List<AuctionFact> fwd = entry.getValue().stream().filter(r -> "FORWARD".equalsIgnoreCase(r.auctionMode()) && positive(r.tradePrice())).toList();
            List<AuctionFact> rev = entry.getValue().stream().filter(r -> "REVERSE".equalsIgnoreCase(r.auctionMode()) && positive(r.tradePrice())).toList();

            if (!fwd.isEmpty() && !rev.isEmpty()) {
                BigDecimal avgFwd = average(fwd, AuctionFact::tradePrice);
                BigDecimal avgRev = average(rev, AuctionFact::tradePrice);
                if (avgFwd.signum() > 0 && avgRev.signum() > 0) {
                    BigDecimal spread = avgFwd.subtract(avgRev).abs();
                    double spreadPct = spread.multiply(BigDecimal.valueOf(100)).divide(avgRev, 2, RoundingMode.HALF_UP).doubleValue();
                    if (spreadPct > 8.0) {
                        insights.add(new InsightItem(
                                "fwd-rev-spread-" + comm.toLowerCase(Locale.ROOT),
                                InsightType.TREND,
                                Severity.MEDIUM,
                                "Dual-Auction Price Spread in " + comm,
                                String.format("Forward auction avg (₹%s) vs Reverse procurement avg (₹%s) shows a %.1f%% spread (₹%s). Indicates divergent price expectations between sellers and buyers.",
                                        avgFwd.toPlainString(), avgRev.toPlainString(), spreadPct, spread.toPlainString()),
                                String.format("₹%s Spread (%.1f%%)", spread.toPlainString(), spreadPct),
                                comm,
                                null,
                                String.format("What is the price spread between Forward and Reverse auctions for %s?", comm)
                        ));
                        suggestedQuestions.add(String.format("Compare Forward vs Reverse auction price discovery for %s", comm));
                    }
                }
            }
        }

        // 4. Single-Bidder / Low Competition Risk
        List<AuctionFact> lowBidderAuctions = rows.stream()
                .filter(r -> r.bidderCount() > 0 && r.bidderCount() <= 2 && r.approved() && positive(r.tradeValue()))
                .toList();
        if (!lowBidderAuctions.isEmpty()) {
            BigDecimal lowBidderValue = sum(lowBidderAuctions, AuctionFact::tradeValue);
            double lowBidderValPct = totalTradeValue.signum() == 0 ? 0 :
                    lowBidderValue.multiply(BigDecimal.valueOf(100)).divide(totalTradeValue, 2, RoundingMode.HALF_UP).doubleValue();

            if (lowBidderValPct > 15.0 || lowBidderAuctions.size() >= 5) {
                insights.add(new InsightItem(
                        "low-competition-risk",
                        InsightType.RISK,
                        Severity.HIGH,
                        "Low Bidder Competition on High-Value Trades",
                        String.format("%d approved auctions had 2 or fewer participating bidders, accounting for ₹%s (%.1f%% of trade turnover). Limited competition poses risk of suboptimal price discovery.",
                                lowBidderAuctions.size(), formatCrore(lowBidderValue), lowBidderValPct),
                        String.format("%d Auctions (%.1f%% Turnover)", lowBidderAuctions.size(), lowBidderValPct),
                        null,
                        null,
                        "Which auctions had only 1 or 2 bidders, and what were their clearing prices?"
                ));
                suggestedQuestions.add("Which auctions had only 1 or 2 bidders and what was their trade value?");
            }
        }

        // 5. Geographic Concentration
        Map<String, List<AuctionFact>> byState = rows.stream()
                .filter(r -> r.state() != null && !r.state().isBlank())
                .collect(Collectors.groupingBy(AuctionFact::state));
        for (Map.Entry<String, List<AuctionFact>> entry : byState.entrySet()) {
            String state = entry.getKey();
            BigDecimal stateValue = sum(entry.getValue(), AuctionFact::tradeValue);
            double stateValPct = totalTradeValue.signum() == 0 ? 0 :
                    stateValue.multiply(BigDecimal.valueOf(100)).divide(totalTradeValue, 2, RoundingMode.HALF_UP).doubleValue();
            if (stateValPct > 45.0 && byState.size() > 1) {
                insights.add(new InsightItem(
                        "state-concentration-" + state.toLowerCase(Locale.ROOT),
                        InsightType.TREND,
                        Severity.LOW,
                        "High Geographic Concentration in " + state,
                        String.format("%s accounts for %.1f%% of all trade turnover (₹%s) across %d auctions.",
                                state, stateValPct, formatCrore(stateValue), entry.getValue().size()),
                        String.format("%.1f%% State Share", stateValPct),
                        null,
                        state,
                        String.format("Why does %s dominate auction volume and what commodities are traded there?", state)
                ));
                suggestedQuestions.add(String.format("What commodities and clients dominate in %s?", state));
            }
        }

        // 6. Calculate Market Health Score (0 to 100)
        int score = calculateHealthScore(approvalRate, rows, lowBidderAuctions);
        String scoreLabel = score >= 80 ? "OPTIMAL" : score >= 65 ? "HEALTHY" : score >= 50 ? "MODERATE ATTENTION" : "HIGH RISK";

        // 7. Ensure at least 4 suggested questions
        if (suggestedQuestions.size() < 4) {
            suggestedQuestions.add("Give me an executive summary of auction performance");
            suggestedQuestions.add("Who are the top 3 clients by trade value?");
            suggestedQuestions.add("Which commodities have the highest clearance rates?");
            suggestedQuestions.add("Are there any unapproved high-value auctions?");
        }

        // 8. Generate Executive Narrative
        String narrative = String.format(
                "Aggregated analysis of %d auctions across %d commodities indicates %s market conditions with an overall approval rate of %.1f%% and ₹%s in trade value. %d anomalies and opportunity signals detected.",
                totalAuctions, byCommodity.size(), scoreLabel.toLowerCase(Locale.ROOT), approvalRate, formatCrore(totalTradeValue), insights.size()
        );

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalAuctions", totalAuctions);
        stats.put("approvedAuctions", approvedAuctions);
        stats.put("approvalRate", approvalRate);
        stats.put("totalTradeValue", totalTradeValue);
        stats.put("commodityCount", byCommodity.size());
        stats.put("stateCount", byState.size());
        stats.put("lowBidderAuctionsCount", lowBidderAuctions.size());

        return new AnalysisResponse(
                narrative,
                score,
                scoreLabel,
                insights,
                suggestedQuestions.stream().distinct().limit(8).toList(),
                stats,
                store.dataAsOf()
        );
    }

    private int calculateHealthScore(double approvalRate, List<AuctionFact> rows, List<AuctionFact> lowBidderAuctions) {
        double score = 50.0;
        // Approval rate contribution (max 30 pts)
        score += (approvalRate / 100.0) * 30.0;

        // Competition contribution (penalize if high percentage of low-bidder auctions)
        if (!rows.isEmpty()) {
            double lowBidderRatio = (double) lowBidderAuctions.size() / rows.size();
            score -= (lowBidderRatio * 20.0);
        }

        // Liquidity contribution (reward if volume is distributed)
        long commodities = rows.stream().map(AuctionFact::commodity).filter(Objects::nonNull).distinct().count();
        if (commodities >= 4) score += 10.0;
        else if (commodities >= 2) score += 5.0;

        // Cap score between 10 and 98
        return (int) Math.max(15, Math.min(98, Math.round(score)));
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
}
