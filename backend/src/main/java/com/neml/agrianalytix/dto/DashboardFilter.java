package com.neml.agrianalytix.dto;
import com.neml.agrianalytix.domain.ProjectSource;
import java.time.LocalDate;
public record DashboardFilter(
        ProjectSource source, String globalClient, String marketCode, String commodity, String contract,
        String state, String warehouse, String scheme, String side, String marketType, String auctionMode,
        String qtyUnit, LocalDate from, LocalDate to
) {
    public static DashboardFilter normalize(ProjectSource source, String globalClient, String marketCode,
            String commodity, String contract, String state, String warehouse, String scheme, String side,
            String marketType, String auctionMode, String qtyUnit, LocalDate from, LocalDate to) {
        return new DashboardFilter(source == null ? ProjectSource.ALL : source, n(globalClient), n(marketCode),
                n(commodity), n(contract), n(state), n(warehouse), n(scheme), n(side), n(marketType),
                n(auctionMode), n(qtyUnit), from, to);
    }
    private static String n(String v) { return v == null || v.isBlank() || "ALL".equalsIgnoreCase(v) ? null : v.trim(); }
}
