# Confirmed Business Rules

1. Market has two schemas on one physical DB: `auctionv2replica` and `participant-masterv2_replica`.
2. Sugar uses `sugarpgprd`; NCDFI uses `ncdfiprd21`.
3. One auction consists of AO + AB activity. AO is the auction order; AB rows are bids.
4. AO side `S` = FORWARD. AO side `B` = REVERSE.
5. MarketWatch owns and maintains client/market/commodity/contract/location mappings through the Mapping Console.
6. Scheduled source refresh interval is 15 minutes.
7. Sensitive participant data is visible only to authenticated internal users.
8. Quantity metrics must always remain separated by UOM.
