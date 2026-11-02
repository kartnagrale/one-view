package com.neml.agrianalytix.repository;

import com.neml.agrianalytix.domain.AuctionFact;
import com.neml.agrianalytix.domain.ParticipantFact;
import com.neml.agrianalytix.domain.ProjectSource;

import java.time.LocalDate;
import java.util.List;

public interface AnalyticsRepository {
    List<AuctionFact> fetchAuctions(ProjectSource source, LocalDate from);
    List<ParticipantFact> fetchParticipants(ProjectSource source);
}
