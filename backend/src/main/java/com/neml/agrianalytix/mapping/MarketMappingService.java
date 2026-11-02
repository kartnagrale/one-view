package com.neml.agrianalytix.mapping;

import com.neml.agrianalytix.domain.AuctionFact;
import com.neml.agrianalytix.domain.ParticipantFact;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;

@Service
public class MarketMappingService {
    private final MarketMappingRepository repository;
    public MarketMappingService(MarketMappingRepository repository) { this.repository = repository; }

    public List<MarketMapping> list() { return repository.findAll(); }
    public MarketMapping save(Long id, MarketMappingRequest request, String user) { return repository.save(id, request, user); }
    public void delete(long id) { repository.delete(id); }

    public List<AuctionFact> enrich(List<AuctionFact> facts) {
        List<MarketMapping> mappings = repository.findAll().stream().filter(MarketMapping::active).toList();
        if (mappings.isEmpty()) return facts;
        return facts.stream().map(f -> enrichOne(f, mappings)).toList();
    }


    public List<ParticipantFact> enrichParticipants(List<ParticipantFact> participants) {
        List<MarketMapping> mappings = repository.findAll().stream().filter(MarketMapping::active).toList();
        if (mappings.isEmpty()) return participants;
        return participants.stream().map(p -> {
            var mappedClients = mappings.stream()
                    .filter(m -> m.source() == p.source())
                    .filter(m -> p.marketCodes().stream().anyMatch(code -> eq(code, m.marketCode())))
                    .map(MarketMapping::globalClient).filter(v -> !blank(v))
                    .collect(java.util.stream.Collectors.toSet());
            if (mappedClients.isEmpty()) return p;
            return new ParticipantFact(p.source(), p.orgId(), p.orgName(), p.state(), p.district(), p.mobile(), p.email(),
                    p.address(), p.gst(), p.pan(), p.marketCount(), p.participated(), p.marketCodes(), java.util.Set.copyOf(mappedClients));
        }).toList();
    }

    private AuctionFact enrichOne(AuctionFact f, List<MarketMapping> mappings) {
        var best = mappings.stream()
                .filter(m -> m.source() == f.source())
                .filter(m -> eq(m.marketCode(), f.marketCode()))
                .filter(m -> blank(m.commodityCode()) || eq(m.commodityCode(), f.commodity()))
                .filter(m -> blank(m.contractCode()) || eq(m.contractCode(), f.contract()))
                .max(Comparator.comparingInt(this::specificity));
        if (best.isEmpty()) return f;
        var m = best.get();
        return new AuctionFact(f.source(), f.auctionId(), f.auctionDate(), f.auctionDateTime(),
                choose(m.globalClient(), f.globalClient()), f.marketCode(), choose(m.commodityDisplayName(), f.commodity()),
                f.contract(), choose(m.state(), f.state()), choose(m.warehouse(), f.warehouse()), choose(m.location(), f.location()),
                f.scheme(), f.season(), f.side(), f.marketType(), f.auctionType(), f.auctionMode(), f.qtyUnit(),
                f.organizationId(), f.organizationName(), f.auctionQty(), f.auctionPrice(), f.bidderCount(), f.approvedQty(),
                f.tradeQty(), f.tradePrice(), f.tradeValue(), f.approved());
    }

    private int specificity(MarketMapping m) { return (blank(m.commodityCode()) ? 0 : 2) + (blank(m.contractCode()) ? 0 : 1); }
    private boolean eq(String a, String b) { return a != null && b != null && a.equalsIgnoreCase(b); }
    private boolean blank(String v) { return v == null || v.isBlank(); }
    private String choose(String mapped, String original) { return blank(mapped) ? original : mapped; }
}
