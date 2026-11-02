package com.neml.agrianalytix.controller;

import com.neml.agrianalytix.domain.ProjectSource;
import com.neml.agrianalytix.dto.DashboardFilter;
import com.neml.agrianalytix.dto.ReportDefinitionDto;
import com.neml.agrianalytix.service.ReportService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/reports")
public class ReportsController {
    private final ReportService reports;
    public ReportsController(ReportService reports) { this.reports=reports; }
    @GetMapping("/catalog") public List<ReportDefinitionDto> catalog(){return reports.catalog();}

    @GetMapping(value="/auction-analytics.xlsx",produces="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
    public ResponseEntity<byte[]> export(@RequestParam(defaultValue="ALL") ProjectSource source,
            @RequestParam(required=false) String globalClient,@RequestParam(required=false) String marketCode,
            @RequestParam(required=false) String commodity,@RequestParam(required=false) String contract,
            @RequestParam(required=false) String state,@RequestParam(required=false) String warehouse,
            @RequestParam(required=false) String scheme,@RequestParam(required=false) String side,
            @RequestParam(required=false) String marketType,@RequestParam(required=false) String auctionMode,
            @RequestParam(required=false) String qtyUnit,
            @RequestParam(required=false) @DateTimeFormat(iso=DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required=false) @DateTimeFormat(iso=DateTimeFormat.ISO.DATE) LocalDate to) {
        var filter=DashboardFilter.normalize(source,globalClient,marketCode,commodity,contract,state,warehouse,scheme,side,marketType,auctionMode,qtyUnit,from,to);
        byte[] file=reports.exportAuctionWorkbook(filter);
        return ResponseEntity.ok().header(HttpHeaders.CONTENT_DISPOSITION,"attachment; filename=AGRI-ANALYTIX-auction-report.xlsx").contentLength(file.length).body(file);
    }
}
