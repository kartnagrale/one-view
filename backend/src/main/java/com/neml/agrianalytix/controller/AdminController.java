package com.neml.agrianalytix.controller;

import com.neml.agrianalytix.domain.ProjectSource;
import com.neml.agrianalytix.dto.SourceStatusDto;
import com.neml.agrianalytix.service.DashboardRefreshService;
import com.neml.agrianalytix.service.DashboardStore;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin")
public class AdminController {
    private final DashboardRefreshService refreshService;
    private final DashboardStore store;

    public AdminController(DashboardRefreshService refreshService, DashboardStore store) {
        this.refreshService = refreshService;
        this.store = store;
    }

    @GetMapping("/sources")
    public List<SourceStatusDto> sources() { return store.statuses(); }

    @PostMapping("/refresh")
    public List<SourceStatusDto> refresh(@RequestParam(defaultValue = "ALL") ProjectSource source) {
        if (source == ProjectSource.ALL) refreshService.refreshAll(); else refreshService.refresh(source);
        return store.statuses();
    }
}
