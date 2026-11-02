package com.neml.agrianalytix.dto;
import com.neml.agrianalytix.domain.ProjectSource;
import java.time.Instant;
public record SourceStatusDto(ProjectSource source, boolean configured, boolean healthy, long auctionRows,
        long participantRows, Instant lastSuccess, String lastError) {}
