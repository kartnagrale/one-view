package com.neml.agrianalytix.dto;
import java.math.BigDecimal;
public record RankingItemDto(String key, String label, long auctions, BigDecimal quantity, BigDecimal tradeValue) {}
