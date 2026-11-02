export type ProjectSource = 'ALL' | 'MASTER' | 'SUGAR' | 'NCDFI';
export type RankingType = 'CLIENT' | 'COMMODITY' | 'PARTICIPANT' | 'STATE' | 'MARKET';

export interface DashboardFilter {
  source: ProjectSource; globalClient?: string; marketCode?: string; commodity?: string; contract?: string;
  state?: string; warehouse?: string; scheme?: string; side?: string; marketType?: string;
  auctionMode?: string; qtyUnit?: string; from?: string; to?: string;
}
export interface QuantityMetric { uom: string; offeredQty: number; approvedQty: number; tradedQty: number; averageTradePrice: number; clearanceRate: number; }
export interface Summary {
  totalAuctions: number; approvedAuctions: number; forwardAuctions: number; reverseAuctions: number; registeredBidders: number; participatingBidders: number;
  quantitiesByUom: QuantityMetric[]; totalTradeValue: number; approvalRate: number; dataAsOf: string;
}
export interface TrendPoint {
  period: string;
  auctions: number;
  auctionQtyByUom: Record<string, number>;
  tradeQtyByUom: Record<string, number>;
  tradeValue: number;
  openPrice?: number;
  highPrice?: number;
  lowPrice?: number;
  closePrice?: number;
  avgPrice?: number;
}
export interface RankingItem { key: string; label: string; auctions: number; quantity: number; tradeValue: number; }
export interface CommodityTicker { commodity: string; averagePrice: number; changePct: number; trades: number; }
export interface PriceDiscovery { mode: string; commodity: string; market: string; auctionId: string; price: number; quantity: number; qtyUnit: string; }
export interface FilterOptions {
  globalClients: string[]; markets: string[]; commodities: string[]; contracts: string[]; states: string[]; warehouses: string[];
  schemes: string[]; sides: string[]; marketTypes: string[]; auctionModes: string[]; quantityUnits: string[]; dataAsOf: string;
}
export interface AuctionRow {
  source: ProjectSource; auctionId: string; auctionDate: string; globalClient: string; organization: string; market: string;
  commodity: string; contract: string; state: string; warehouse: string; auctionMode: string; qtyUnit: string;
  auctionQty: number; auctionPrice: number; bidders: number; approvedQty: number; tradePrice: number; tradeValue: number; status: string;
}
export interface ParticipantRow { source: ProjectSource; orgId: string; orgName: string; state: string; district: string; mobile: string; email: string; gst: string; pan: string; marketCount: number; participated: boolean; }
export interface Page<T> { items: T[]; total: number; page: number; size: number; }
export interface ReportDefinition { id: string; title: string; description: string; module: string; suggestedFilters: string[]; containsSensitiveParticipantData: boolean; }
export interface SourceStatus { source: ProjectSource; configured: boolean; healthy: boolean; auctionRows: number; participantRows: number; lastSuccess: string; lastError?: string; }
export interface CurrentUser { username: string; roles: string[]; internal: boolean; }
export interface MarketMapping {
  id?: number; source: ProjectSource; globalClient: string; marketCode: string; commodityCode?: string; commodityDisplayName?: string;
  contractCode?: string; state?: string; location?: string; warehouse?: string; active: boolean; notes?: string; updatedBy?: string; updatedAt?: string;
}

export type InsightType = 'ANOMALY' | 'OPPORTUNITY' | 'TREND' | 'BENCHMARK' | 'RISK';
export type InsightSeverity = 'HIGH' | 'MEDIUM' | 'LOW' | 'POSITIVE';

export interface AiInsightItem {
  id: string;
  type: InsightType;
  severity: InsightSeverity;
  title: string;
  description: string;
  metricHighlight: string;
  affectedCommodity?: string;
  affectedState?: string;
  suggestedQuestion: string;
}

export interface AiAnalysisResponse {
  executiveNarrative: string;
  marketHealthScore: number;
  healthScoreLabel: string;
  insights: AiInsightItem[];
  suggestedQuestions: string[];
  summaryStats: Record<string, any>;
  dataAsOf: string;
}

export interface AiDataBadge {
  label: string;
  value: string;
  type: 'neutral' | 'positive' | 'negative' | 'primary';
}

export interface AiChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  suggestedFollowUps?: string[];
  dataBadges?: AiDataBadge[];
}

export interface AiChatRequest {
  message: string;
  conversationHistory: AiChatMessage[];
  filter?: DashboardFilter;
}

export interface AiChatResponse {
  answer: string;
  suggestedFollowUps: string[];
  dataBadges: AiDataBadge[];
  matchedDimensions: string[];
  confidenceScore: number;
}
