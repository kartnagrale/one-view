package com.neml.agrianalytix.dto;
import java.math.BigDecimal;
public record QuantityMetricDto(String uom, BigDecimal offeredQty, BigDecimal approvedQty, BigDecimal tradedQty,
        BigDecimal averageTradePrice, double clearanceRate) {}
