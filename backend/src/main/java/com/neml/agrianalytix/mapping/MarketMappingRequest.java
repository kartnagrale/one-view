package com.neml.agrianalytix.mapping;

import com.neml.agrianalytix.domain.ProjectSource;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record MarketMappingRequest(
        @NotNull ProjectSource source,
        @NotBlank String globalClient,
        @NotBlank String marketCode,
        String commodityCode,
        String commodityDisplayName,
        String contractCode,
        String state,
        String location,
        String warehouse,
        boolean active,
        String notes
) {}
