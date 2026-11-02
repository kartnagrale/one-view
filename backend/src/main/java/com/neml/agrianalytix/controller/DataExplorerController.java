package com.neml.agrianalytix.controller;

import com.neml.agrianalytix.domain.ProjectSource;
import com.neml.agrianalytix.dto.*;
import com.neml.agrianalytix.service.DashboardQueryService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;

@RestController
@RequestMapping("/api/v1")
public class DataExplorerController {
    private final DashboardQueryService service;
    public DataExplorerController(DashboardQueryService service) { this.service = service; }

    @GetMapping("/auctions")
    public PageDto<AuctionRowDto> auctions(@RequestParam(defaultValue="ALL") ProjectSource source,
            @RequestParam(required=false) String globalClient,@RequestParam(required=false) String marketCode,
            @RequestParam(required=false) String commodity,@RequestParam(required=false) String contract,
            @RequestParam(required=false) String state,@RequestParam(required=false) String warehouse,
            @RequestParam(required=false) String scheme,@RequestParam(required=false) String side,
            @RequestParam(required=false) String marketType,@RequestParam(required=false) String auctionMode,
            @RequestParam(required=false) String qtyUnit,
            @RequestParam(required=false) @DateTimeFormat(iso=DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required=false) @DateTimeFormat(iso=DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(required=false) String search,@RequestParam(defaultValue="0") int page,@RequestParam(defaultValue="25") int size) {
        var f=DashboardFilter.normalize(source,globalClient,marketCode,commodity,contract,state,warehouse,scheme,side,marketType,auctionMode,qtyUnit,from,to);
        return service.auctions(f,search,page,size);
    }

    @GetMapping("/participants")
    public PageDto<ParticipantRowDto> participants(@RequestParam(defaultValue="ALL") ProjectSource source,
            @RequestParam(required=false) String globalClient,@RequestParam(required=false) String marketCode,
            @RequestParam(required=false) String state,@RequestParam(required=false) String search,
            @RequestParam(defaultValue="0") int page,@RequestParam(defaultValue="25") int size) {
        var f=DashboardFilter.normalize(source,globalClient,marketCode,null,null,state,null,null,null,null,null,null,null,null);
        return service.participants(f,search,page,size);
    }
}
