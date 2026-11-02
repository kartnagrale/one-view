package com.neml.agrianalytix.dto;
import java.math.BigDecimal;
import java.util.Map;
public record TrendPointDto(
        String period,
        long auctions,
        Map<String,BigDecimal> auctionQtyByUom,
        Map<String,BigDecimal> tradeQtyByUom,
        BigDecimal tradeValue,
        BigDecimal openPrice,
        BigDecimal highPrice,
        BigDecimal lowPrice,
        BigDecimal closePrice,
        BigDecimal avgPrice
) {
    public TrendPointDto(String period, long auctions, Map<String,BigDecimal> auctionQtyByUom, Map<String,BigDecimal> tradeQtyByUom, BigDecimal tradeValue) {
        this(period, auctions, auctionQtyByUom, tradeQtyByUom, tradeValue, BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO);
    }
}
