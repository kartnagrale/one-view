package com.neml.agrianalytix.controller;

import com.neml.agrianalytix.mapping.*;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/mappings")
public class MappingController {
    private final MarketMappingService service;
    public MappingController(MarketMappingService service) { this.service = service; }

    @GetMapping
    public List<MarketMapping> list() { return service.list(); }

    @PostMapping
    @PreAuthorize("hasRole('MARKETWATCH')")
    public MarketMapping create(@Valid @RequestBody MarketMappingRequest request, Authentication auth) {
        return service.save(null, request, auth.getName());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('MARKETWATCH')")
    public MarketMapping update(@PathVariable long id, @Valid @RequestBody MarketMappingRequest request, Authentication auth) {
        return service.save(id, request, auth.getName());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('MARKETWATCH')")
    public void delete(@PathVariable long id) { service.delete(id); }
}
