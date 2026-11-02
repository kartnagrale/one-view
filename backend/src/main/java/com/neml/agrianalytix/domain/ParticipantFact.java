package com.neml.agrianalytix.domain;
import java.util.Set;
public record ParticipantFact(
        ProjectSource source, String orgId, String orgName, String state, String district,
        String mobile, String email, String address, String gst, String pan,
        long marketCount, boolean participated, Set<String> marketCodes, Set<String> globalClients
) {}
