# Real Database Integration Checklist

The business rules are now confirmed. Remaining work is deployment/infrastructure validation, not product-rule discovery.

## Confirmed topology

- Market URL: `https://market.neml.in/`
  - `auctionv2replica`
  - `participant-masterv2_replica`
  - both are reached through one physical PostgreSQL connection
- Sugar URL: `https://sugar.neml.in/SpotLite/`
  - `sugarpgprd`
- NCDFI URL: `https://members.ncdfiemarket.com/SpotLite/`
  - `ncdfiprd21`

## Confirmed auction rule

- Auction order: `ord_ord_type='AO'`
- Bids: `ord_ord_type='AB'`
- AO + `ord_ord_side='S'` => FORWARD
- AO + `ord_ord_side='B'` => REVERSE

## Confirmed mapping ownership

MarketWatch maintains mappings through the AGRI-ANALYTIX Mapping Console. The configuration is stored in an app-owned `agri_analytix.market_mapping` table, ideally on the same Market physical DB so no fourth physical connection is introduced.

## Confirmed refresh SLA

15 minutes. Source queries run on schedule; dashboard requests read the in-memory snapshot.

## Confirmed sensitive data rule

Authenticated internal users can see participant mobile/email/PAN/GST. Mapping mutation requires MarketWatch role.

## Confirmed quantity rule

Do not combine quantities across different UOMs. Filter, KPI, trend payload and export all preserve UOM.

## Permissions

Recommended Market DB service account privileges:

- `SELECT` on approved tables/views in `auctionv2replica`
- `SELECT` on approved tables/views in `participant-masterv2_replica`
- `SELECT/INSERT/UPDATE/DELETE` only on `agri_analytix.market_mapping`
- no write access to auction or participant operational tables

Sugar and NCDFI accounts should remain SELECT-only.

## Still required before production

1. Actual JDBC host/database names and secrets.
2. Network/firewall access from the AGRI-ANALYTIX deployment environment.
3. Validation of source-specific column names against the deployed schemas.
4. Validation against known approved business extracts for representative requests.
5. Final NeML SSO/AD integration and role mapping for `INTERNAL` / `MARKETWATCH`.
6. Decide historical purge/back-up table onboarding scope for day-one history.
7. DBA decision on whether app startup may auto-create `agri_analytix` schema/table; otherwise run `docs/mapping-schema.sql` manually.
