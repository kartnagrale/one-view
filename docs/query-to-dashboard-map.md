# Business request → dashboard design map

The supplied request catalog contains recurring variants of the same analytical questions. Instead of creating one hardcoded screen/query per request, AGRI-ANALYTIX generalizes them into reusable dimensions, metrics and report modules.

| Business need seen repeatedly | Generalized dashboard capability |
|---|---|
| Client/NCCF/NAFED-specific metrics | Global Client filter + client leaderboard |
| Market-code specific participant lists | Market filter + Participants module |
| Registered vs participated bidders | Participant KPIs and status |
| Commodity/contract breakups | Commodity + Contract filters and rankings |
| Auction quantity / confirmed or approved quantity | Auction Qty, Approved Qty, Clearance % |
| Trade quantity / trade value / trade price | Trade KPIs + monthly trends |
| Auction/order approval or rejection | Approval KPI + detailed order table |
| Forward highest price / reverse lowest price | Dual-Auction Price Discovery |
| State, location, warehouse requests | State / Warehouse filters and drilldown |
| Scheme/season requests such as PSS/PSF | Scheme + Season dimensions |
| Monthly / Financial Year comparison | Trend chart + Financial Year report |
| Scrap, E-waste, hazardous reports | Special Markets report preset |
| Order Book / Trade Book extracts | Auction Intelligence table + XLSX export |
| Participant contact/PAN/GST extracts | Masked Participant Intelligence + RBAC-ready sensitive export |
| Bid-count and concurrency questions | Bid Load & Concurrency report module |
| Transaction charge MIS | Transaction & Charge MIS report module |
| "provide in Excel" requests | Server-side XLSX export |

## Core dimensions

`project source`, `global client`, `market code`, `commodity code`, `contract code`,
`state`, `location`, `warehouse`, `scheme`, `season`, `side`, `market type`,
`auction type`, `organisation`, `date/month/financial year`.

## Core measures

`auction count`, `approved auction count`, `bidder count`, `auction quantity`,
`approved quantity`, `trade quantity`, `auction price`, `trade price`,
`trade value`, `approval rate`, `clearance rate`, `registered participants`,
`participating participants`.

## Report presets included in v1

1. Auction & Trade Performance
2. Participant Intelligence
3. Order Book
4. Commodity & Contract Analysis
5. Client & Market Analytics
6. NAFED / NCCF PSS-PSF
7. Scrap / E-Waste / Hazardous
8. Bid Load & Concurrency
9. Financial Year Comparison
10. Transaction & Charge MIS

The supplied SQL remains valuable as the validation oracle for each metric. Source adapters should be checked against those queries before production rollout.
