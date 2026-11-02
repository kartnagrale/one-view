package com.neml.agrianalytix.domain;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
public record AuctionFact(
        ProjectSource source, String auctionId, LocalDate auctionDate, LocalDateTime auctionDateTime,
        String globalClient, String marketCode, String commodity, String contract, String state,
        String warehouse, String location, String scheme, String season, String side, String marketType,
        String auctionType, String auctionMode, String qtyUnit, String organizationId, String organizationName,
        BigDecimal auctionQty, BigDecimal auctionPrice, long bidderCount, BigDecimal approvedQty,
        BigDecimal tradeQty, BigDecimal tradePrice, BigDecimal tradeValue, boolean approved
) {}
