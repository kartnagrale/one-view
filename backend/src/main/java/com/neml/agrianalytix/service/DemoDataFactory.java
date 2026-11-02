package com.neml.agrianalytix.service;

import com.neml.agrianalytix.domain.AuctionFact;
import com.neml.agrianalytix.domain.ParticipantFact;
import com.neml.agrianalytix.domain.ProjectSource;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Component
public class DemoDataFactory {
    private static final String[] CLIENTS = {"NAFED","NCCF","MP MARKFED","BHEL","FCI","GUJCO","HAFED"};
    private static final String[] COMMODITIES = {"JOWARKRAM","JOWARDRAM","RICE1121","SOYABEAN","MAIZE","SUGAR","SCRAPMETAL","EWASTE"};
    private static final String[] STATES = {"MH","MP","GJ","RJ","UP","KA","TS","PB"};
    private static final String[] MARKETS = {"NFUP","NSUP","NCCS","HFSM","CWBG","APOL","AFTB"};
    private static final String[] WAREHOUSES = {"Nagpur WH","Indore WH","Rajkot WH","Kota WH","Lucknow WH"};
    private static final String[] UOMS = {"MT","KG","NOS"};

    public List<AuctionFact> auctions(ProjectSource source) {
        Random random = new Random(1000L + source.ordinal());
        List<AuctionFact> rows = new ArrayList<>();
        LocalDate start = LocalDate.now().minusMonths(12);
        for (int i = 0; i < 220; i++) {
            LocalDate date = start.plusDays(random.nextInt(365));
            String client = CLIENTS[random.nextInt(CLIENTS.length)];
            String commodity = COMMODITIES[random.nextInt(COMMODITIES.length)];
            String state = STATES[random.nextInt(STATES.length)];
            String market = MARKETS[random.nextInt(MARKETS.length)];
            boolean approved = random.nextDouble() > .25;
            boolean reverse = random.nextBoolean();
            String uom = UOMS[random.nextInt(UOMS.length)];
            BigDecimal qty = bd(25 + random.nextInt(600));
            BigDecimal auctionPrice = bd(1000 + random.nextInt(5000));
            BigDecimal tradeQty = approved ? qty.multiply(BigDecimal.valueOf(.55 + random.nextDouble() * .45)).setScale(2, BigDecimal.ROUND_HALF_UP) : BigDecimal.ZERO;
            BigDecimal tradePrice = approved ? auctionPrice.multiply(BigDecimal.valueOf(.90 + random.nextDouble() * .25)).setScale(2, BigDecimal.ROUND_HALF_UP) : BigDecimal.ZERO;
            BigDecimal tradeValue = tradeQty.multiply(tradePrice).setScale(2, BigDecimal.ROUND_HALF_UP);

            rows.add(new AuctionFact(
                    source, source.name().substring(0,1) + "-AUC-" + (10000 + i), date, date.atTime(11 + random.nextInt(7), random.nextInt(60)),
                    client, market, commodity, commodity + "-" + market, state, WAREHOUSES[random.nextInt(WAREHOUSES.length)],
                    state + " Location", client.equals("NAFED") ? (random.nextBoolean() ? "PSS" : "PSF") : "",
                    "K-" + (24 + random.nextInt(3)), reverse ? "B" : "S", random.nextBoolean() ? "EM" : "CM",
                    "E", reverse ? "REVERSE" : "FORWARD", uom, "ORG-" + (100 + random.nextInt(45)), "Institution " + (1 + random.nextInt(25)),
                    qty, auctionPrice, 2 + random.nextInt(35), tradeQty, tradeQty, tradePrice, tradeValue, approved
            ));
        }
        return rows;
    }

    public List<ParticipantFact> participants(ProjectSource source) {
        Random random = new Random(2000L + source.ordinal());
        List<ParticipantFact> rows = new ArrayList<>();
        for (int i=0;i<90;i++) {
            String state = STATES[random.nextInt(STATES.length)];
            rows.add(new ParticipantFact(source, "ORG-" + (1000 + i), "Participant " + (i+1), state,
                    "District " + (1 + random.nextInt(18)), "9XXXX" + String.format("%05d", random.nextInt(100000)),
                    "participant" + (i+1) + "@example.com", state + " registered address", "GST****" + i, "PAN****" + i,
                    1 + random.nextInt(6), random.nextDouble() > .28,
                    java.util.Set.of(MARKETS[random.nextInt(MARKETS.length)]),
                    java.util.Set.of(CLIENTS[random.nextInt(CLIENTS.length)])));
        }
        return rows;
    }

    private BigDecimal bd(double value) { return BigDecimal.valueOf(value).setScale(2, BigDecimal.ROUND_HALF_UP); }
}
