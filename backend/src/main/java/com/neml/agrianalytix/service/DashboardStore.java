package com.neml.agrianalytix.service;

import com.neml.agrianalytix.domain.AuctionFact;
import com.neml.agrianalytix.domain.ParticipantFact;
import com.neml.agrianalytix.domain.ProjectSource;
import com.neml.agrianalytix.dto.SourceStatusDto;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.time.LocalDate;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicReference;

@Component
public class DashboardStore {
    private final Map<ProjectSource, AtomicReference<List<AuctionFact>>> auctions = new ConcurrentHashMap<>();
    private final Map<ProjectSource, AtomicReference<List<ParticipantFact>>> participants = new ConcurrentHashMap<>();
    private final Map<ProjectSource, SourceStatusDto> status = new ConcurrentHashMap<>();
    private final AtomicReference<Instant> dataAsOf = new AtomicReference<>(Instant.EPOCH);

    public DashboardStore() {
        for (ProjectSource source : ProjectSource.values()) {
            if (source == ProjectSource.ALL) continue;
            auctions.put(source, new AtomicReference<>(List.of()));
            participants.put(source, new AtomicReference<>(List.of()));
            status.put(source, new SourceStatusDto(source, false, false, 0, 0, null, null));
        }
    }

    public void replace(ProjectSource source, List<AuctionFact> auctionRows, List<ParticipantFact> participantRows, boolean configured) {
        auctions.get(source).set(List.copyOf(auctionRows));
        participants.get(source).set(List.copyOf(participantRows));
        Instant now = Instant.now();
        dataAsOf.set(now);
        status.put(source, new SourceStatusDto(source, configured, true, auctionRows.size(), participantRows.size(), now, null));
    }


    /**
     * Replace only the refresh window while preserving older history already loaded in memory.
     * This avoids re-querying years of auction data every few minutes while still re-reading a
     * recent window so approvals/trade outcomes that settle later are corrected.
     */
    public void merge(ProjectSource source, List<AuctionFact> refreshedRows, LocalDate refreshFrom,
                      List<ParticipantFact> participantRows, boolean configured) {
        List<AuctionFact> existing = auctions.get(source).get();
        Map<String, AuctionFact> merged = new LinkedHashMap<>();
        for (AuctionFact row : existing) {
            if (row.auctionDate() == null || row.auctionDate().isBefore(refreshFrom)) {
                merged.put(auctionKey(row), row);
            }
        }
        for (AuctionFact row : refreshedRows) merged.put(auctionKey(row), row);
        replace(source, new ArrayList<>(merged.values()), participantRows, configured);
    }

    private String auctionKey(AuctionFact row) {
        return row.source().name() + "|" + Objects.toString(row.auctionId(), "") + "|" +
                Objects.toString(row.organizationId(), "") + "|" + Objects.toString(row.marketCode(), "");
    }

    public void markFailure(ProjectSource source, boolean configured, Exception error) {
        SourceStatusDto previous = status.get(source);
        status.put(source, new SourceStatusDto(source, configured, false,
                auctions.get(source).get().size(), participants.get(source).get().size(),
                previous == null ? null : previous.lastSuccess(), error.getMessage()));
    }

    public List<AuctionFact> auctions(ProjectSource source) {
        if (source == null || source == ProjectSource.ALL) {
            return auctions.values().stream().flatMap(ref -> ref.get().stream()).toList();
        }
        return auctions.get(source).get();
    }

    public List<ParticipantFact> participants(ProjectSource source) {
        if (source == null || source == ProjectSource.ALL) {
            return participants.values().stream().flatMap(ref -> ref.get().stream()).toList();
        }
        return participants.get(source).get();
    }

    public Instant dataAsOf() { return dataAsOf.get(); }
    public List<SourceStatusDto> statuses() { return status.values().stream().sorted(Comparator.comparing(s -> s.source().name())).toList(); }
}
