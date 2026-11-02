package com.neml.agrianalytix.service;

import com.neml.agrianalytix.domain.AuctionFact;
import com.neml.agrianalytix.dto.DashboardFilter;
import com.neml.agrianalytix.dto.ReportDefinitionDto;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.util.List;

@Service
public class ReportService {
    private final DashboardQueryService dashboard;

    public ReportService(DashboardQueryService dashboard) {
        this.dashboard = dashboard;
    }

    public List<ReportDefinitionDto> catalog() {
        return List.of(
                new ReportDefinitionDto("auction-trade-performance", "Auction & Trade Performance",
                        "Auctions listed, approved auctions, offered quantity, sold quantity, trade value and clearance trends.",
                        "Auction Analytics", List.of("Date range","Global client","Market","Commodity","State"), false),
                new ReportDefinitionDto("participant-intelligence", "Participant Intelligence",
                        "Registered vs participated bidders, participant state distribution and market/global-client mapping.",
                        "Participants", List.of("Global client","Market","State"), true),
                new ReportDefinitionDto("order-book", "Order Book",
                        "Detailed auction/order view with price, quantity, status, bidder count and trade outcome.",
                        "Operations", List.of("Date range","Project","Market","Commodity","Contract"), false),
                new ReportDefinitionDto("commodity-contract", "Commodity & Contract Analysis",
                        "Commodity codes, contracts, auction quantity, confirmed quantity, prices and bidder counts.",
                        "Commodity Intelligence", List.of("Commodity","Contract","Market","Season","Scheme"), false),
                new ReportDefinitionDto("client-market", "Client & Market Analytics",
                        "Client-specific trade value, quantity, market participation, state footprint and rankings.",
                        "Decision Intelligence", List.of("Global client","Market","Date range"), false),
                new ReportDefinitionDto("nafed-nccf-pss-psf", "NAFED / NCCF PSS-PSF",
                        "Scheme/commodity participation, monthly auction bands, offered vs sold quantity and approval statistics.",
                        "Institutional Reports", List.of("Global client","Scheme","Commodity","Date range"), false),
                new ReportDefinitionDto("scrap-ewaste-hazardous", "Scrap / E-Waste / Hazardous",
                        "Organizations, material categories, FY-wise auctions, successful trades and participant lists.",
                        "Special Markets", List.of("Financial year","Commodity/contract","Market","State"), true),
                new ReportDefinitionDto("bid-load", "Bid Load & Concurrency",
                        "Bid counts in selected windows, last-five-minute activity and maximum concurrent bids per second.",
                        "Platform Analytics", List.of("Date range","Global client","Market"), false),
                new ReportDefinitionDto("financial-year-comparison", "Financial Year Comparison",
                        "Auction quantity, trade quantity, approved quantity and value compared across financial years/projects.",
                        "Executive MIS", List.of("Project","Financial year","Commodity"), false),
                new ReportDefinitionDto("transaction-mis", "Transaction & Charge MIS",
                        "Participant-wise transaction value/volume, side, commodity, contract and transaction charges where available.",
                        "MIS", List.of("Date range","Participant","Commodity","Side"), true)
        );
    }

    public byte[] exportAuctionWorkbook(DashboardFilter filter) {
        List<AuctionFact> rows = dashboard.filteredAuctions(filter);
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Auction Analytics");
            String[] headers = {"Source","Auction ID","Date","Global Client","Organisation","Market","Commodity","Contract",
                    "State","Warehouse","Side","Auction Mode","Market Type","Qty Unit","Auction Qty","Auction Price","Bidder Count",
                    "Approved Qty","Trade Qty","Trade Price","Trade Value","Approved"};
            Row header = sheet.createRow(0);
            CellStyle headerStyle = workbook.createCellStyle();
            Font font = workbook.createFont();
            font.setBold(true);
            headerStyle.setFont(font);
            for (int c=0;c<headers.length;c++) {
                Cell cell = header.createCell(c);
                cell.setCellValue(headers[c]);
                cell.setCellStyle(headerStyle);
            }

            int r = 1;
            for (AuctionFact a : rows) {
                Row row = sheet.createRow(r++);
                int c = 0;
                row.createCell(c++).setCellValue(a.source().name());
                row.createCell(c++).setCellValue(n(a.auctionId()));
                row.createCell(c++).setCellValue(a.auctionDate() == null ? "" : a.auctionDate().toString());
                row.createCell(c++).setCellValue(n(a.globalClient()));
                row.createCell(c++).setCellValue(n(a.organizationName()));
                row.createCell(c++).setCellValue(n(a.marketCode()));
                row.createCell(c++).setCellValue(n(a.commodity()));
                row.createCell(c++).setCellValue(n(a.contract()));
                row.createCell(c++).setCellValue(n(a.state()));
                row.createCell(c++).setCellValue(n(a.warehouse()));
                row.createCell(c++).setCellValue(n(a.side()));
                row.createCell(c++).setCellValue(n(a.auctionMode()));
                row.createCell(c++).setCellValue(n(a.marketType()));
                row.createCell(c++).setCellValue(n(a.qtyUnit()));
                row.createCell(c++).setCellValue(a.auctionQty().doubleValue());
                row.createCell(c++).setCellValue(a.auctionPrice().doubleValue());
                row.createCell(c++).setCellValue(a.bidderCount());
                row.createCell(c++).setCellValue(a.approvedQty().doubleValue());
                row.createCell(c++).setCellValue(a.tradeQty().doubleValue());
                row.createCell(c++).setCellValue(a.tradePrice().doubleValue());
                row.createCell(c++).setCellValue(a.tradeValue().doubleValue());
                row.createCell(c).setCellValue(a.approved() ? "Yes" : "No");
            }
            sheet.createFreezePane(0,1);
            for (int c=0;c<headers.length;c++) sheet.autoSizeColumn(c);
            workbook.write(out);
            return out.toByteArray();
        } catch (Exception e) {
            throw new IllegalStateException("Unable to generate workbook", e);
        }
    }

    private String n(String v) { return v == null ? "" : v; }
}
