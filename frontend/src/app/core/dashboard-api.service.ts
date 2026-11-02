import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuctionRow, CommodityTicker, DashboardFilter, FilterOptions, MarketMapping, Page, ParticipantRow, PriceDiscovery, RankingItem, RankingType, ReportDefinition, SourceStatus, Summary, TrendPoint, AiAnalysisResponse, AiChatRequest, AiChatResponse } from './models';

@Injectable({providedIn:'root'})
export class DashboardApiService {
  private readonly base='/api/v1';
  constructor(private http:HttpClient){}
  filters(source:string){return this.http.get<FilterOptions>(`${this.base}/dashboard/filters`,{params:{source}});}
  summary(f:DashboardFilter){return this.http.get<Summary>(`${this.base}/dashboard/summary`,{params:this.params(f)});}
  trends(f:DashboardFilter){return this.http.get<TrendPoint[]>(`${this.base}/dashboard/trends`,{params:this.params(f)});}
  rankings(f:DashboardFilter,type:RankingType,limit=5){return this.http.get<RankingItem[]>(`${this.base}/dashboard/rankings`,{params:this.params(f).set('type',type).set('limit',limit)});}
  tickers(f:DashboardFilter,limit=6){return this.http.get<CommodityTicker[]>(`${this.base}/dashboard/tickers`,{params:this.params(f).set('limit',limit)});}
  priceDiscovery(f:DashboardFilter,limit=3){return this.http.get<PriceDiscovery[]>(`${this.base}/dashboard/price-discovery`,{params:this.params(f).set('limit',limit)});}
  auctions(f:DashboardFilter,search='',page=0,size=25){return this.http.get<Page<AuctionRow>>(`${this.base}/auctions`,{params:this.params(f).set('search',search).set('page',page).set('size',size)});}
  participants(f:DashboardFilter,search='',page=0,size=25){return this.http.get<Page<ParticipantRow>>(`${this.base}/participants`,{params:this.params(f).set('search',search).set('page',page).set('size',size)});}
  reportCatalog(){return this.http.get<ReportDefinition[]>(`${this.base}/reports/catalog`);}
  sourceStatus(){return this.http.get<SourceStatus[]>(`${this.base}/admin/sources`);}
  refresh(){return this.http.post<SourceStatus[]>(`${this.base}/admin/refresh`,null);}
  exportAuction(f:DashboardFilter):Observable<Blob>{return this.http.get(`${this.base}/reports/auction-analytics.xlsx`,{params:this.params(f),responseType:'blob'});}
  mappings(){return this.http.get<MarketMapping[]>(`${this.base}/mappings`);}
  createMapping(m:MarketMapping){return this.http.post<MarketMapping>(`${this.base}/mappings`,m);}
  updateMapping(m:MarketMapping){return this.http.put<MarketMapping>(`${this.base}/mappings/${m.id}`,m);}
  deleteMapping(id:number){return this.http.delete<void>(`${this.base}/mappings/${id}`);}
  aiAnalysis(f:DashboardFilter){return this.http.get<AiAnalysisResponse>(`${this.base}/ai/analysis`,{params:this.params(f)});}
  aiChat(req:AiChatRequest){return this.http.post<AiChatResponse>(`${this.base}/ai/chat`,req);}

  private params(f:DashboardFilter):HttpParams{
    let p=new HttpParams().set('source',f.source||'ALL');
    const map:Record<string,string|undefined>={globalClient:f.globalClient,marketCode:f.marketCode,commodity:f.commodity,contract:f.contract,state:f.state,warehouse:f.warehouse,scheme:f.scheme,side:f.side,marketType:f.marketType,auctionMode:f.auctionMode,qtyUnit:f.qtyUnit,from:f.from,to:f.to};
    Object.entries(map).forEach(([k,v])=>{if(v)p=p.set(k,v)}); return p;
  }
}
