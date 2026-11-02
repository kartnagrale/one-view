package com.neml.agrianalytix.dto;
import java.time.Instant;
import java.util.List;
public record FilterOptionsDto(List<String> globalClients, List<String> markets, List<String> commodities,
        List<String> contracts, List<String> states, List<String> warehouses, List<String> schemes,
        List<String> sides, List<String> marketTypes, List<String> auctionModes, List<String> quantityUnits, Instant dataAsOf) {}
