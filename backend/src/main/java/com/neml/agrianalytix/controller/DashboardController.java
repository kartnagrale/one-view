package com.neml.agrianalytix.controller;

import com.neml.agrianalytix.domain.ProjectSource;
import com.neml.agrianalytix.domain.RankingType;
import com.neml.agrianalytix.dto.*;
import com.neml.agrianalytix.service.DashboardQueryService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/dashboard")
public class DashboardController {
    private final DashboardQueryService service;
    public DashboardController(DashboardQueryService service) { this.service = service; }

    @GetMapping("/filters")
    public FilterOptionsDto filters(@RequestParam(defaultValue = "ALL") ProjectSource source) { return service.filterOptions(source); }

    @GetMapping("/summary")
    public SummaryDto summary(@RequestParam(defaultValue="ALL") ProjectSource source,
            @RequestParam(required=false) String globalClient,@RequestParam(required=false) String marketCode,
            @RequestParam(required=false) String commodity,@RequestParam(required=false) String contract,
            @RequestParam(required=false) String state,@RequestParam(required=false) String warehouse,
            @RequestParam(required=false) String scheme,@RequestParam(required=false) String side,
            @RequestParam(required=false) String marketType,@RequestParam(required=false) String auctionMode,
            @RequestParam(required=false) String qtyUnit,
            @RequestParam(required=false) @DateTimeFormat(iso=DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required=false) @DateTimeFormat(iso=DateTimeFormat.ISO.DATE) LocalDate to) {
        return service.summary(filter(source,globalClient,marketCode,commodity,contract,state,warehouse,scheme,side,marketType,auctionMode,qtyUnit,from,to));
    }

    @GetMapping("/trends")
    public List<TrendPointDto> trends(@RequestParam(defaultValue="ALL") ProjectSource source,
            @RequestParam(required=false) String globalClient,@RequestParam(required=false) String marketCode,
            @RequestParam(required=false) String commodity,@RequestParam(required=false) String contract,
            @RequestParam(required=false) String state,@RequestParam(required=false) String warehouse,
            @RequestParam(required=false) String scheme,@RequestParam(required=false) String side,
            @RequestParam(required=false) String marketType,@RequestParam(required=false) String auctionMode,
            @RequestParam(required=false) String qtyUnit,
            @RequestParam(required=false) @DateTimeFormat(iso=DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required=false) @DateTimeFormat(iso=DateTimeFormat.ISO.DATE) LocalDate to) {
        return service.trends(filter(source,globalClient,marketCode,commodity,contract,state,warehouse,scheme,side,marketType,auctionMode,qtyUnit,from,to));
    }

    @GetMapping("/rankings")
    public List<RankingItemDto> rankings(@RequestParam(defaultValue="ALL") ProjectSource source,
            @RequestParam(defaultValue="CLIENT") RankingType type,@RequestParam(defaultValue="10") int limit,
            @RequestParam(required=false) String globalClient,@RequestParam(required=false) String marketCode,
            @RequestParam(required=false) String commodity,@RequestParam(required=false) String contract,
            @RequestParam(required=false) String state,@RequestParam(required=false) String warehouse,
            @RequestParam(required=false) String scheme,@RequestParam(required=false) String side,
            @RequestParam(required=false) String marketType,@RequestParam(required=false) String auctionMode,
            @RequestParam(required=false) String qtyUnit,
            @RequestParam(required=false) @DateTimeFormat(iso=DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required=false) @DateTimeFormat(iso=DateTimeFormat.ISO.DATE) LocalDate to) {
        return service.rankings(filter(source,globalClient,marketCode,commodity,contract,state,warehouse,scheme,side,marketType,auctionMode,qtyUnit,from,to),type,limit);
    }

    @GetMapping("/price-discovery")
    public List<PriceDiscoveryDto> priceDiscovery(@RequestParam(defaultValue="ALL") ProjectSource source,@RequestParam(defaultValue="5") int limit,
            @RequestParam(required=false) String globalClient,@RequestParam(required=false) String marketCode,
            @RequestParam(required=false) String commodity,@RequestParam(required=false) String contract,
            @RequestParam(required=false) String state,@RequestParam(required=false) String warehouse,
            @RequestParam(required=false) String scheme,@RequestParam(required=false) String side,
            @RequestParam(required=false) String marketType,@RequestParam(required=false) String auctionMode,
            @RequestParam(required=false) String qtyUnit,
            @RequestParam(required=false) @DateTimeFormat(iso=DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required=false) @DateTimeFormat(iso=DateTimeFormat.ISO.DATE) LocalDate to) {
        return service.priceDiscovery(filter(source,globalClient,marketCode,commodity,contract,state,warehouse,scheme,side,marketType,auctionMode,qtyUnit,from,to),limit);
    }

    @GetMapping("/tickers")
    public List<CommodityTickerDto> tickers(@RequestParam(defaultValue="ALL") ProjectSource source,@RequestParam(defaultValue="6") int limit,
            @RequestParam(required=false) String globalClient,@RequestParam(required=false) String marketCode,
            @RequestParam(required=false) String commodity,@RequestParam(required=false) String contract,
            @RequestParam(required=false) String state,@RequestParam(required=false) String warehouse,
            @RequestParam(required=false) String scheme,@RequestParam(required=false) String side,
            @RequestParam(required=false) String marketType,@RequestParam(required=false) String auctionMode,
            @RequestParam(required=false) String qtyUnit,
            @RequestParam(required=false) @DateTimeFormat(iso=DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required=false) @DateTimeFormat(iso=DateTimeFormat.ISO.DATE) LocalDate to) {
        return service.tickers(filter(source,globalClient,marketCode,commodity,contract,state,warehouse,scheme,side,marketType,auctionMode,qtyUnit,from,to),limit);
    }

    private DashboardFilter filter(ProjectSource source,String globalClient,String marketCode,String commodity,String contract,String state,
            String warehouse,String scheme,String side,String marketType,String auctionMode,String qtyUnit,LocalDate from,LocalDate to) {
        return DashboardFilter.normalize(source,globalClient,marketCode,commodity,contract,state,warehouse,scheme,side,marketType,auctionMode,qtyUnit,from,to);
    }
}
