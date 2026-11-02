package com.neml.agrianalytix.service;

import com.neml.agrianalytix.domain.*;
import com.neml.agrianalytix.dto.*;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class DashboardQueryService {
    private final DashboardStore store;
    public DashboardQueryService(DashboardStore store) { this.store = store; }

    public SummaryDto summary(DashboardFilter filter) {
        List<AuctionFact> rows = filteredAuctions(filter);
        List<ParticipantFact> participants = filteredParticipants(filter);
        long approved = rows.stream().filter(AuctionFact::approved).count();
        long participating = participants.stream().filter(ParticipantFact::participated).count();

        Map<String,List<AuctionFact>> byUom = rows.stream().collect(Collectors.groupingBy(
                r -> hasText(r.qtyUnit()) ? r.qtyUnit().toUpperCase(Locale.ROOT) : "UNKNOWN", TreeMap::new, Collectors.toList()));
        List<QuantityMetricDto> quantities = byUom.entrySet().stream().map(e -> {
            BigDecimal offered = sum(e.getValue(), AuctionFact::auctionQty);
            BigDecimal approvedQty = sum(e.getValue(), AuctionFact::approvedQty);
            BigDecimal traded = sum(e.getValue(), AuctionFact::tradeQty);
            BigDecimal tradedValue = sum(e.getValue(), AuctionFact::tradeValue);
            BigDecimal avgPrice = traded.signum() == 0 ? BigDecimal.ZERO : tradedValue.divide(traded, 2, RoundingMode.HALF_UP);
            double clearance = offered.signum() == 0 ? 0 : approvedQty.multiply(BigDecimal.valueOf(100))
                    .divide(offered, 2, RoundingMode.HALF_UP).doubleValue();
            return new QuantityMetricDto(e.getKey(), offered, approvedQty, traded, avgPrice, clearance);
        }).toList();

        BigDecimal tradeValue = sum(rows, AuctionFact::tradeValue);
        long forward = rows.stream().filter(r -> "FORWARD".equalsIgnoreCase(r.auctionMode())).count();
        long reverse = rows.stream().filter(r -> "REVERSE".equalsIgnoreCase(r.auctionMode())).count();
        double approvalRate = rows.isEmpty() ? 0 : approved * 100.0 / rows.size();

        return new SummaryDto(rows.size(), approved, forward, reverse, participants.size(), participating, quantities,
                tradeValue, approvalRate, store.dataAsOf());
    }

    public FilterOptionsDto filterOptions(ProjectSource source) {
        List<AuctionFact> rows = store.auctions(source == null ? ProjectSource.ALL : source);
        return new FilterOptionsDto(unique(rows, AuctionFact::globalClient), unique(rows, AuctionFact::marketCode),
                unique(rows, AuctionFact::commodity), unique(rows, AuctionFact::contract), unique(rows, AuctionFact::state),
                unique(rows, AuctionFact::warehouse), unique(rows, AuctionFact::scheme), unique(rows, AuctionFact::side),
                unique(rows, AuctionFact::marketType), unique(rows, AuctionFact::auctionMode), unique(rows, AuctionFact::qtyUnit),
                store.dataAsOf());
    }

    public List<TrendPointDto> trends(DashboardFilter filter) {
        Map<YearMonth,List<AuctionFact>> grouped = filteredAuctions(filter).stream().filter(r -> r.auctionDate() != null)
                .collect(Collectors.groupingBy(r -> YearMonth.from(r.auctionDate()), TreeMap::new, Collectors.toList()));
        return grouped.entrySet().stream().map(e -> {
            List<AuctionFact> rows = e.getValue();
            List<AuctionFact> sorted = rows.stream()
                    .sorted(Comparator.comparing(AuctionFact::auctionDate, Comparator.nullsLast(Comparator.naturalOrder()))
                            .thenComparing(AuctionFact::auctionDateTime, Comparator.nullsLast(Comparator.naturalOrder())))
                    .toList();

            List<BigDecimal> prices = sorted.stream()
                    .map(r -> positive(r.tradePrice()) ? r.tradePrice() : r.auctionPrice())
                    .filter(this::positive)
                    .filter(p -> p.compareTo(new BigDecimal("10000000")) <= 0)
                    .toList();

            BigDecimal openPrice = prices.isEmpty() ? BigDecimal.ZERO : prices.get(0);
            BigDecimal closePrice = prices.isEmpty() ? BigDecimal.ZERO : prices.get(prices.size() - 1);
            BigDecimal highPrice = prices.stream().max(BigDecimal::compareTo).orElse(BigDecimal.ZERO);
            BigDecimal lowPrice = prices.stream().min(BigDecimal::compareTo).orElse(BigDecimal.ZERO);
            BigDecimal avgPrice = average(sorted, r -> positive(r.tradePrice()) ? r.tradePrice() : r.auctionPrice());

            return new TrendPointDto(
                    e.getKey().format(DateTimeFormatter.ofPattern("MMM yy")),
                    rows.size(),
                    sumByUom(rows, AuctionFact::auctionQty),
                    sumByUom(rows, AuctionFact::tradeQty),
                    sum(rows, AuctionFact::tradeValue),
                    openPrice,
                    highPrice,
                    lowPrice,
                    closePrice,
                    avgPrice
            );
        }).toList();
    }

    public List<RankingItemDto> rankings(DashboardFilter filter, RankingType type, int limit) {
        Function<AuctionFact,String> keyFn = switch (type) {
            case CLIENT -> AuctionFact::globalClient;
            case COMMODITY -> AuctionFact::commodity;
            case PARTICIPANT -> AuctionFact::organizationName;
            case STATE -> AuctionFact::state;
            case MARKET -> AuctionFact::marketCode;
        };
        Map<String,List<AuctionFact>> grouped = filteredAuctions(filter).stream().filter(r -> hasText(keyFn.apply(r)))
                .collect(Collectors.groupingBy(keyFn));
        return grouped.entrySet().stream().map(e -> new RankingItemDto(e.getKey(), e.getKey(), e.getValue().size(),
                        filter.qtyUnit() == null ? BigDecimal.ZERO : sum(e.getValue(), AuctionFact::tradeQty),
                        sum(e.getValue(), AuctionFact::tradeValue)))
                .sorted(Comparator.comparing(RankingItemDto::tradeValue).reversed())
                .limit(Math.max(1, Math.min(limit, 50))).toList();
    }

    public List<PriceDiscoveryDto> priceDiscovery(DashboardFilter filter, int limit) {
        List<AuctionFact> rows = filteredAuctions(filter).stream().filter(r -> positive(r.tradePrice())).toList();
        var forward = rows.stream().filter(r -> "FORWARD".equalsIgnoreCase(r.auctionMode()))
                .sorted(Comparator.comparing(AuctionFact::tradePrice).reversed()).limit(limit)
                .map(r -> new PriceDiscoveryDto("FORWARD / HIGHEST", r.commodity(), r.marketCode(), r.auctionId(), r.tradePrice(), r.tradeQty(), r.qtyUnit()));
        var reverse = rows.stream().filter(r -> "REVERSE".equalsIgnoreCase(r.auctionMode()))
                .sorted(Comparator.comparing(AuctionFact::tradePrice)).limit(limit)
                .map(r -> new PriceDiscoveryDto("REVERSE / LOWEST", r.commodity(), r.marketCode(), r.auctionId(), r.tradePrice(), r.tradeQty(), r.qtyUnit()));
        return java.util.stream.Stream.concat(forward, reverse).toList();
    }

    public List<CommodityTickerDto> tickers(DashboardFilter filter, int limit) {
        List<AuctionFact> base = filteredAuctions(filter);
        LocalDate max = base.stream().map(AuctionFact::auctionDate).filter(Objects::nonNull).max(LocalDate::compareTo).orElse(LocalDate.now());
        LocalDate split = max.minusDays(30), previousStart = split.minusDays(30);
        Map<String,List<AuctionFact>> grouped = base.stream().filter(r -> hasText(r.commodity())).collect(Collectors.groupingBy(AuctionFact::commodity));
        return grouped.entrySet().stream().map(e -> {
            List<AuctionFact> current = e.getValue().stream().filter(r -> r.auctionDate()!=null && !r.auctionDate().isBefore(split)).filter(r -> positive(r.tradePrice())).toList();
            List<AuctionFact> previous = e.getValue().stream().filter(r -> r.auctionDate()!=null && !r.auctionDate().isBefore(previousStart) && r.auctionDate().isBefore(split)).filter(r -> positive(r.tradePrice())).toList();
            BigDecimal c=average(current,AuctionFact::tradePrice), p=average(previous,AuctionFact::tradePrice);
            double change = p.signum()==0 ? 0 : c.subtract(p).multiply(BigDecimal.valueOf(100)).divide(p,2,RoundingMode.HALF_UP).doubleValue();
            return new CommodityTickerDto(e.getKey(),c,change,current.size());
        }).filter(t -> t.averagePrice().signum()>0).sorted(Comparator.comparing(CommodityTickerDto::trades).reversed()).limit(limit).toList();
    }

    public PageDto<AuctionRowDto> auctions(DashboardFilter filter, String search, int page, int size) {
        String q = search == null ? "" : search.trim().toLowerCase(Locale.ROOT);
        List<AuctionFact> rows = filteredAuctions(filter).stream().filter(r -> q.isEmpty() || contains(r.auctionId(),q) || contains(r.organizationName(),q)
                || contains(r.commodity(),q) || contains(r.marketCode(),q) || contains(r.globalClient(),q))
                .sorted(Comparator.comparing(AuctionFact::auctionDate, Comparator.nullsLast(Comparator.reverseOrder()))).toList();
        int safeSize=Math.max(10,Math.min(size,200)), safePage=Math.max(page,0), from=Math.min(safePage*safeSize,rows.size()), to=Math.min(from+safeSize,rows.size());
        List<AuctionRowDto> items=rows.subList(from,to).stream().map(r -> new AuctionRowDto(r.source(),r.auctionId(),r.auctionDate(),r.globalClient(),
                r.organizationName(),r.marketCode(),r.commodity(),r.contract(),r.state(),r.warehouse(),r.auctionMode(),r.qtyUnit(),r.auctionQty(),
                r.auctionPrice(),r.bidderCount(),r.approvedQty(),r.tradePrice(),r.tradeValue(),r.approved()?"Approved":"Not approved")).toList();
        return new PageDto<>(items,rows.size(),safePage,safeSize);
    }

    public PageDto<ParticipantRowDto> participants(DashboardFilter filter, String search, int page, int size) {
        String q=search==null?"":search.trim().toLowerCase(Locale.ROOT);
        List<ParticipantFact> rows=filteredParticipants(filter).stream().filter(r -> q.isEmpty()||contains(r.orgName(),q)||contains(r.orgId(),q)||contains(r.state(),q))
                .sorted(Comparator.comparing(ParticipantFact::orgName,String.CASE_INSENSITIVE_ORDER)).toList();
        int safeSize=Math.max(10,Math.min(size,200)), safePage=Math.max(page,0), from=Math.min(safePage*safeSize,rows.size()), to=Math.min(from+safeSize,rows.size());
        // Every API request is authenticated. Sensitive participant data is therefore returned to logged-in internal users.
        List<ParticipantRowDto> items=rows.subList(from,to).stream().map(r -> new ParticipantRowDto(r.source(),r.orgId(),r.orgName(),r.state(),r.district(),
                r.mobile(),r.email(),r.gst(),r.pan(),r.marketCount(),r.participated())).toList();
        return new PageDto<>(items,rows.size(),safePage,safeSize);
    }

    public List<AuctionFact> filteredAuctions(DashboardFilter f) {
        return store.auctions(f.source()).stream().filter(r -> eq(f.globalClient(),r.globalClient()) && eq(f.marketCode(),r.marketCode()) &&
                eq(f.commodity(),r.commodity()) && eq(f.contract(),r.contract()) && stateEq(f.state(),r.state()) && eq(f.warehouse(),r.warehouse()) &&
                eq(f.scheme(),r.scheme()) && eq(f.side(),r.side()) && eq(f.marketType(),r.marketType()) && eq(f.auctionMode(),r.auctionMode()) &&
                eq(f.qtyUnit(),r.qtyUnit()) && (f.from()==null || (r.auctionDate()!=null && !r.auctionDate().isBefore(f.from()))) &&
                (f.to()==null || (r.auctionDate()!=null && !r.auctionDate().isAfter(f.to())))).toList();
    }

    private List<ParticipantFact> filteredParticipants(DashboardFilter f) {
        return store.participants(f.source()).stream().filter(r -> stateEq(f.state(),r.state()) &&
                (f.marketCode()==null || r.marketCodes().stream().anyMatch(v -> v.equalsIgnoreCase(f.marketCode()))) &&
                (f.globalClient()==null || r.globalClients().stream().anyMatch(v -> v.equalsIgnoreCase(f.globalClient())))).toList();
    }

    private static final Map<String,String> STATE_ALIAS_MAP = Map.ofEntries(
            Map.entry("MH","MAHARASHTRA"), Map.entry("MP","MADHYA PRADESH"), Map.entry("GJ","GUJARAT"),
            Map.entry("RJ","RAJASTHAN"), Map.entry("UP","UTTAR PRADESH"), Map.entry("KA","KARNATAKA"),
            Map.entry("TS","TELANGANA"), Map.entry("PB","PUNJAB"), Map.entry("HR","HARYANA"),
            Map.entry("TN","TAMIL NADU"), Map.entry("AP","ANDHRA PRADESH"), Map.entry("WB","WEST BENGAL"),
            Map.entry("BR","BIHAR"), Map.entry("CG","CHHATTISGARH"), Map.entry("OR","ODISHA"),
            Map.entry("KL","KERALA"), Map.entry("JH","JHARKHAND"), Map.entry("AS","ASSAM"),
            Map.entry("DL","DELHI"), Map.entry("GA","GOA"), Map.entry("AR","ARUNACHAL PRADESH"),
            Map.entry("UT","UTTARAKHAND"), Map.entry("UK","UTTARAKHAND"), Map.entry("HP","HIMACHAL PRADESH")
    );

    private boolean stateEq(String wanted, String actual) {
        if (wanted == null) return true;
        if (actual == null) return false;
        if (actual.equalsIgnoreCase(wanted)) return true;
        String wUpper = wanted.trim().toUpperCase(Locale.ROOT);
        String aUpper = actual.trim().toUpperCase(Locale.ROOT);
        String aliasForWanted = STATE_ALIAS_MAP.get(wUpper);
        if (aliasForWanted != null && (aliasForWanted.equalsIgnoreCase(aUpper) || aliasForWanted.contains(aUpper) || aUpper.contains(aliasForWanted))) return true;
        for (Map.Entry<String,String> e : STATE_ALIAS_MAP.entrySet()) {
            if (e.getValue().equalsIgnoreCase(wUpper) && (e.getKey().equalsIgnoreCase(aUpper) || e.getValue().equalsIgnoreCase(aUpper))) return true;
        }
        return false;
    }

    private Map<String,BigDecimal> sumByUom(List<AuctionFact> rows, Function<AuctionFact,BigDecimal> fn) {
        return rows.stream().collect(Collectors.groupingBy(r -> hasText(r.qtyUnit())?r.qtyUnit().toUpperCase(Locale.ROOT):"UNKNOWN", TreeMap::new,
                Collectors.mapping(fn, Collectors.reducing(BigDecimal.ZERO, v -> v==null?BigDecimal.ZERO:v, BigDecimal::add))));
    }
    private List<String> unique(List<AuctionFact> rows, Function<AuctionFact,String> fn){return rows.stream().map(fn).filter(this::hasText).distinct().sorted(String.CASE_INSENSITIVE_ORDER).toList();}
    private BigDecimal sum(List<AuctionFact> rows, Function<AuctionFact,BigDecimal> fn){return rows.stream().map(fn).filter(Objects::nonNull).reduce(BigDecimal.ZERO,BigDecimal::add);}
    private BigDecimal average(List<AuctionFact> rows, Function<AuctionFact,BigDecimal> fn){var v=rows.stream().map(fn).filter(this::positive).toList();return v.isEmpty()?BigDecimal.ZERO:v.stream().reduce(BigDecimal.ZERO,BigDecimal::add).divide(BigDecimal.valueOf(v.size()),2,RoundingMode.HALF_UP);}
    private boolean eq(String wanted,String actual){return wanted==null || (actual!=null&&actual.equalsIgnoreCase(wanted));}
    private boolean positive(BigDecimal v){return v!=null&&v.signum()>0;}
    private boolean hasText(String v){return v!=null&&!v.isBlank();}
    private boolean contains(String v,String q){return v!=null&&v.toLowerCase(Locale.ROOT).contains(q);}
}
