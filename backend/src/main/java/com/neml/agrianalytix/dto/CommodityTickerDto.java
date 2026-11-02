package com.neml.agrianalytix.dto;
import java.math.BigDecimal;
public record CommodityTickerDto(String commodity, BigDecimal averagePrice, double changePct, long trades) {}
