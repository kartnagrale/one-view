package com.neml.agrianalytix.dto;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
public record SummaryDto(long totalAuctions, long approvedAuctions, long forwardAuctions, long reverseAuctions,
        long registeredBidders, long participatingBidders, List<QuantityMetricDto> quantitiesByUom,
        BigDecimal totalTradeValue, double approvalRate, Instant dataAsOf) {}
