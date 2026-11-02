# Open questions for production wiring

The codebase is usable now in demo mode. I need these answers before I would treat the real-database adapter as production-ready:

1. Is `participant-masterv2_replica` a separate PostgreSQL database/connection, or can it be queried from the Master/AuctionV2 database with cross-schema references?
2. Confirm the exact business rule for Forward vs Reverse auction classification. The prototype uses order side `S` for forward/highest-price and `B` for reverse/lowest-price unless `ord_auction_type` explicitly says otherwise.
3. Which source owns the final mapping `global client -> market code -> commodity/contract -> warehouse/location/state`? The design assumes MarketWatch is authoritative.
4. What refresh SLA do you want: 5, 10, 15, 30 or 60 minutes? The default is 15 minutes.
5. How much history must be in memory from day one? The default begins 2022-04-01. If full purge/history is mandatory, we should add incremental watermarks or a small analytics schema rather than refetch all history every cycle.
6. Which roles can view/export participant mobile, email, PAN, GST and address?
7. Do you want the current application to integrate NeML SSO immediately, or should v1 remain internal-network + read-only until the dashboard is validated?
8. Confirm whether quantities need a canonical conversion layer (MT/KG/NOS/etc.) before cross-commodity totals are shown.
