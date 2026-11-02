package com.neml.agrianalytix.dto;
import java.math.BigDecimal;
public record PriceDiscoveryDto(String mode, String commodity, String market, String auctionId,
        BigDecimal price, BigDecimal quantity, String qtyUnit) {}
