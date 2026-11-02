# AGRI-ANALYTIX Architecture

## Physical connections

AGRI-ANALYTIX deliberately uses three small PostgreSQL pools (default maximum pool size = 1 each):

- MASTER / Market physical DB: reads `auctionv2replica` + `participant-masterv2_replica`; writes only `agri_analytix.market_mapping`.
- SUGAR: reads `sugarpgprd`.
- NCDFI: reads `ncdfiprd21`.

## Data flow

`PostgreSQL sources → scheduled Spring fetchers → normalized AuctionFact / ParticipantFact → MarketWatch mapping enrichment → atomic in-memory snapshot → REST API → Angular`.

The scheduled refresh runs every 15 minutes. The source databases are not queried on each dashboard request.

## Auction semantics

Only `ord_ord_type='AO'` rows become AuctionFact records. `AB` rows are used to calculate bidder participation/count.

- AO + side=S → FORWARD
- AO + side=B → REVERSE

## UOM safety

Quantity aggregation is grouped by `ord_qty_unit`. No cross-UOM quantity total is exposed.

## Mapping

The app-owned `agri_analytix.market_mapping` table allows MarketWatch users to maintain the business mapping context used by the dashboard. Mapping rows can be generic at market level or more specific by commodity/contract. The most specific matching active row is applied.

## Security

All `/api/**` application endpoints require authentication except actuator health/info. Mapping mutation endpoints require `ROLE_MARKETWATCH`. The bundled Basic Auth is intended for local integration only; production should replace it with NeML identity infrastructure.
