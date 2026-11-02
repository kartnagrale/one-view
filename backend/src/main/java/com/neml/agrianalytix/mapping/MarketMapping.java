package com.neml.agrianalytix.mapping;

import com.neml.agrianalytix.domain.ProjectSource;
import java.time.Instant;

public record MarketMapping(
        Long id,
        ProjectSource source,
        String globalClient,
        String marketCode,
        String commodityCode,
        String commodityDisplayName,
        String contractCode,
        String state,
        String location,
        String warehouse,
        boolean active,
        String notes,
        String updatedBy,
        Instant updatedAt
) {}
