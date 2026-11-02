package com.neml.agrianalytix.dto;
import java.util.List;
public record ReportDefinitionDto(String id, String title, String description, String module,
        List<String> suggestedFilters, boolean containsSensitiveParticipantData) {}
