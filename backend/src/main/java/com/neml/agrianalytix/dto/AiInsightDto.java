package com.neml.agrianalytix.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Map;

public class AiInsightDto {

    public enum InsightType {
        ANOMALY, OPPORTUNITY, TREND, BENCHMARK, RISK
    }

    public enum Severity {
        HIGH, MEDIUM, LOW, POSITIVE
    }

    public record InsightItem(
            String id,
            InsightType type,
            Severity severity,
            String title,
            String description,
            String metricHighlight,
            String affectedCommodity,
            String affectedState,
            String suggestedQuestion
    ) {}

    public record AnalysisResponse(
            String executiveNarrative,
            int marketHealthScore, // 0 to 100
            String healthScoreLabel, // e.g. "OPTIMAL", "HEALTHY", "MODERATE ATTENTION", "HIGH RISK"
            List<InsightItem> insights,
            List<String> suggestedQuestions,
            Map<String, Object> summaryStats,
            Instant dataAsOf
    ) {}

    public record ChatMessage(
            String role, // "user" or "assistant"
            String content,
            String timestamp,
            List<String> suggestedFollowUps,
            List<DataBadge> dataBadges
    ) {}

    public record DataBadge(
            String label,
            String value,
            String type // "neutral", "positive", "negative", "primary"
    ) {}

    public record ChatRequest(
            String message,
            List<ChatMessage> conversationHistory,
            DashboardFilter filter
    ) {}

    public record ChatResponse(
            String answer,
            List<String> suggestedFollowUps,
            List<DataBadge> dataBadges,
            List<String> matchedDimensions,
            double confidenceScore
    ) {}
}
