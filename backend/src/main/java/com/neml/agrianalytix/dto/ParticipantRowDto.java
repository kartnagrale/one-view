package com.neml.agrianalytix.dto;
import com.neml.agrianalytix.domain.ProjectSource;
public record ParticipantRowDto(ProjectSource source, String orgId, String orgName, String state, String district,
        String mobile, String email, String gst, String pan, long marketCount, boolean participated) {}
