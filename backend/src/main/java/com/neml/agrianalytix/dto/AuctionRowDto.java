package com.neml.agrianalytix.dto;
import com.neml.agrianalytix.domain.ProjectSource;
import java.math.BigDecimal;
import java.time.LocalDate;
public record AuctionRowDto(ProjectSource source, String auctionId, LocalDate auctionDate, String globalClient,
        String organization, String market, String commodity, String contract, String state, String warehouse,
        String auctionMode, String qtyUnit, BigDecimal auctionQty, BigDecimal auctionPrice, long bidders, BigDecimal approvedQty,
        BigDecimal tradePrice, BigDecimal tradeValue, String status) {}
