package com.neml.agrianalytix.service;

import com.neml.agrianalytix.config.AgriAnalytixProperties;
import com.neml.agrianalytix.config.DataSourceRegistry;
import com.neml.agrianalytix.domain.AuctionFact;
import com.neml.agrianalytix.domain.ParticipantFact;
import com.neml.agrianalytix.domain.ProjectSource;
import com.neml.agrianalytix.repository.AnalyticsRepository;
import com.neml.agrianalytix.mapping.MarketMappingService;
import jakarta.annotation.PostConstruct;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DashboardRefreshService {
    private final AgriAnalytixProperties properties;
    private final DataSourceRegistry registry;
    private final AnalyticsRepository repository;
    private final DemoDataFactory demoData;
    private final DashboardStore store;
    private final MarketMappingService mappings;

    public DashboardRefreshService(AgriAnalytixProperties properties, DataSourceRegistry registry,
                                   AnalyticsRepository repository, DemoDataFactory demoData, DashboardStore store, MarketMappingService mappings) {
        this.properties = properties;
        this.registry = registry;
        this.repository = repository;
        this.demoData = demoData;
        this.store = store;
        this.mappings = mappings;
    }

    @PostConstruct
    public void initialLoad() { refreshAll(); }

    @Scheduled(fixedDelayString = "${agri.refresh-ms:900000}")
    public void scheduledRefresh() { refreshAll(); }

    public void refreshAll() {
        for (ProjectSource source : new ProjectSource[]{ProjectSource.MASTER, ProjectSource.SUGAR, ProjectSource.NCDFI}) {
            refresh(source);
        }
    }

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(DashboardRefreshService.class);

    public void refresh(ProjectSource source) {
        boolean configured = registry.isEnabled(source);
        try {
            if (configured) {
                boolean bootstrap = store.auctions(source).isEmpty();
                var refreshFrom = bootstrap
                        ? properties.getHistoryStart()
                        : java.time.LocalDate.now().minusDays(Math.max(1, properties.getRefreshLookbackDays()));
                List<AuctionFact> auctions;
                try {
                    auctions = mappings.enrich(repository.fetchAuctions(source, refreshFrom));
                    log.info("Fetched {} auctions for {}", auctions.size(), source);
                } catch (Exception ex) {
                    log.error("Failed to fetch auctions for {}: {}", source, ex.getMessage(), ex);
                    store.markFailure(source, configured, ex);
                    if (properties.isDemoMode()) {
                        log.info("Falling back to demo data for {} because demoMode is active", source);
                        store.replace(source, demoData.auctions(source), demoData.participants(source), false);
                    }
                    return;
                }

                List<ParticipantFact> participants = List.of();
                try {
                    participants = mappings.enrichParticipants(repository.fetchParticipants(source));
                    log.info("Fetched {} participants for {}", participants.size(), source);
                } catch (Exception ex) {
                    log.warn("Failed to fetch participants for {}: {}", source, ex.getMessage());
                }

                if (bootstrap) store.replace(source, auctions, participants, true);
                else store.merge(source, auctions, refreshFrom, participants, true);
            } else if (properties.isDemoMode()) {
                store.replace(source, demoData.auctions(source), demoData.participants(source), false);
            }
        } catch (Exception ex) {
            log.error("Error refreshing {}: {}", source, ex.getMessage(), ex);
            store.markFailure(source, configured, ex);
        }
    }
}
