package com.neml.agrianalytix.controller;

import com.neml.agrianalytix.domain.ProjectSource;
import com.neml.agrianalytix.dto.AiInsightDto.*;
import com.neml.agrianalytix.dto.DashboardFilter;
import com.neml.agrianalytix.service.AiAnalysisService;
import com.neml.agrianalytix.service.AiChatService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/v1/ai")
public class AiAnalyticsController {

    private final AiAnalysisService analysisService;
    private final AiChatService chatService;

    public AiAnalyticsController(AiAnalysisService analysisService, AiChatService chatService) {
        this.analysisService = analysisService;
        this.chatService = chatService;
    }

    @GetMapping("/analysis")
    public AnalysisResponse analysis(
            @RequestParam(defaultValue = "ALL") ProjectSource source,
            @RequestParam(required = false) String globalClient,
            @RequestParam(required = false) String marketCode,
            @RequestParam(required = false) String commodity,
            @RequestParam(required = false) String contract,
            @RequestParam(required = false) String state,
            @RequestParam(required = false) String warehouse,
            @RequestParam(required = false) String scheme,
            @RequestParam(required = false) String side,
            @RequestParam(required = false) String marketType,
            @RequestParam(required = false) String auctionMode,
            @RequestParam(required = false) String qtyUnit,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to
    ) {
        var filter = DashboardFilter.normalize(source, globalClient, marketCode, commodity, contract, state, warehouse, scheme, side, marketType, auctionMode, qtyUnit, from, to);
        return analysisService.analyze(filter);
    }

    @PostMapping("/chat")
    public ChatResponse chat(@RequestBody ChatRequest request) {
        return chatService.chat(request);
    }
}
