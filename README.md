# AGRI-ANALYTIX v2

Centralized Commodity Auction Intelligence & Market Analytics platform built with Angular 17 and Java/Spring Boot.

This version incorporates the confirmed NeML business rules and physical database layout behind the recurring data requests.

## Confirmed source topology

Exactly **three physical PostgreSQL connections** are used:

1. **Market (`https://market.neml.in/`)**
   - `auctionv2replica` — auction/order/trade data
   - `participant-masterv2_replica` — participant, market and client mappings
   - Same physical database connection; the participant schema is cross-schema queried.
2. **Sugar (`https://sugar.neml.in/SpotLite/`)**
   - `sugarpgprd`
3. **NCDFI (`https://members.ncdfiemarket.com/SpotLite/`)**
   - `ncdfiprd21`

## Locked business rules

### Auction structure and direction
One auction has an **Order (`AO`)** and one or more **Bids (`AB`)**.

- `ord_ord_type = 'AO'` + `ord_ord_side = 'S'` → **FORWARD auction**
- `ord_ord_type = 'AO'` + `ord_ord_side = 'B'` → **REVERSE auction**

`AB` rows are used for bidder participation/counting; they are not counted as separate auctions.

### Mapping ownership
MarketWatch users maintain dashboard reference mappings in the AGRI-ANALYTIX **Mapping Console**. A mapping can define:

`Project → Global Client → Market Code → Commodity Code → Display Commodity → Contract → State → Location → Warehouse`

Commodity examples such as `JOWARKRAM` and `JOWARDRAM` remain source codes; the mapping layer provides business-friendly context without modifying auction-processing data.

### Refresh
- Scheduled every **15 minutes**.
- Dashboard API requests are served from the in-memory snapshot.
- Initial load can bootstrap historical data; later refreshes reconcile only a recent lookback window.
- Last-good data remains available if a source refresh fails.

### Sensitive participant data
- Every application API is authenticated.
- Logged-in internal users can see participant mobile, email, GST and PAN values.
- MarketWatch role is additionally allowed to create/update/delete mappings.
- The included Basic Auth is a local/development implementation. Replace it with NeML SSO/AD before production.

### Quantity UOM
**MT, KG, NOS and other quantity units are never combined.**

The backend returns quantity metrics grouped by UOM, filters include UOM, exports include UOM, and volume trend payloads preserve separate UOM buckets.

## Architecture

```text
                         MARKET PostgreSQL
              ┌───────────────────────────────────┐
              │ auctionv2replica                  │
              │ participant-masterv2_replica      │
              │ agri_analytix.market_mapping (*)  │
              └────────────────┬──────────────────┘
                               │
Sugar PostgreSQL ──────────────┼──── scheduled fetch / normalize / map ────┐
(sugarpgprd)                   │                                           │
                               │                                           ▼
NCDFI PostgreSQL ──────────────┘                                 In-Memory Snapshot
(ncdfiprd21)                                                              │
                                                                           ▼
                                                                  Spring Boot REST API
                                                                           │
                                                                           ▼
                                                                    Angular Dashboard

(*) AGRI-ANALYTIX-owned config table; operational source tables remain untouched.
```

No Kafka or ClickHouse is required for the dashboard path.

## Frontend modules

- Executive Dashboard
- Global filters: project, client, commodity, market, mode, UOM, state, warehouse, date
- Forward vs Reverse price-discovery module
- Quantity-by-UOM cards
- Auction Explorer
- Participant Intelligence
- Report Studio + Excel export
- **MarketWatch Mapping Console**
- Login/session UI

## Backend modules

- Three Hikari datasource pools, default one connection each
- Auction and participant normalization
- Exact AO/AB and Forward/Reverse business rules
- MarketWatch mapping enrichment
- 15-minute refresh service
- In-memory last-good snapshot
- UOM-safe aggregations
- Authenticated participant APIs
- Excel export with Auction Mode + Qty Unit
- Mapping CRUD restricted to `ROLE_MARKETWATCH`

## Run locally

### Backend

```bash
cd backend
mvn spring-boot:run
```

Demo credentials by default:

```text
Internal analyst: analyst / demo123
MarketWatch:      marketwatch / demo123
```

These are local defaults only; change them before any shared deployment.

### Frontend

```bash
cd frontend
npm install
npm start
```

Open `http://localhost:4200`.

## Real database configuration

Start from `.env.example` and set:

```text
AGRI_DEMO_MODE=false
MASTER_DB_ENABLED=true
SUGAR_DB_ENABLED=true
NCDFI_DB_ENABLED=true
```

The Market DB application account needs:

- `SELECT` on `auctionv2replica`
- `SELECT` on `participant-masterv2_replica`
- CRUD only on the dedicated `agri_analytix.market_mapping` table

If application DDL is not permitted, have the DBA run `docs/mapping-schema.sql` and set `AGRI_MAPPING_AUTO_INIT=false`.

## Validation before production

The supplied business query catalogue is preserved in `docs/reference-business-queries.txt`. Before rollout, compare dashboard results against known approved outputs for representative cases from Market, Sugar and NCDFI, especially:

- auction counts and AO/AB relationship
- registered vs participating bidders
- forward vs reverse price ranking
- trade value / approved quantity
- client-market-commodity mappings
- UOM-separated totals
- participant PII visibility and access control

