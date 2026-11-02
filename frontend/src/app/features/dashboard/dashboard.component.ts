import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { DashboardApiService } from '../../core/dashboard-api.service';
import { CommodityTicker, DashboardFilter, FilterOptions, PriceDiscovery, ProjectSource, QuantityMetric, RankingItem, Summary, TrendPoint, AiAnalysisResponse } from '../../core/models';
import { FilterBarComponent } from '../../shared/filter-bar.component';
import { CandlestickChartComponent } from '../../shared/candlestick-chart.component';
import { IndiaMapComponent } from '../../shared/india-map.component';
import { AiCopilotService } from '../../core/ai-copilot.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, FilterBarComponent, CandlestickChartComponent, IndiaMapComponent],
  template: `
    <!-- Top Header -->
    <div class="page-head">
      <div>
        <div class="eyebrow">NeML Decision Intelligence</div>
        <h1>Commodity Auction & Analytics Hub</h1>
        <p>Unified multi-source intelligence across Market, Sugar and NCDFI. Synchronized every 15 minutes.</p>
      </div>
      <div class="head-actions">
        <button class="refresh-btn" (click)="refresh()" [disabled]="loading">
          <span class="spin-icon" [class.spinning]="loading">↻</span> Refresh snapshot
        </button>
        <button class="export-btn" (click)="download()">
          <span class="icon">↓</span> Export Excel
        </button>
      </div>
    </div>

    <!-- Filter Bar -->
    <app-filter-bar
      [options]="options"
      [filter]="filter"
      (apply)="onFilter($event)"
      (sourceChanged)="onSourceChanged($event)" />

    <!-- Snapshot Metadata Ribbon -->
    <div class="snapshot-row">
      <div class="snapshot-left">
        <span class="live-dot"></span>
        <b>{{ filter.source === 'ALL' ? 'Combined Market Snapshot' : filter.source + ' Project Snapshot' }}</b>
        <span class="separator">·</span>
        <span>Data as of {{ summary?.dataAsOf | date:'medium' }}</span>
      </div>
      <div class="snapshot-right">
        <span class="rule-pill">AO + S = Forward</span>
        <span class="rule-pill">AO + B = Reverse</span>
      </div>
    </div>

    <!-- Live Commodity Ticker Grid -->
    <section class="ticker-grid" *ngIf="tickers.length">
      <article class="ticker card" *ngFor="let t of tickers">
        <div class="ticker-top">
          <span class="ticker-name">{{ t.commodity }}</span>
          <span class="trades-count">{{ t.trades }} trades</span>
        </div>
        <strong class="ticker-price">{{ money(t.averagePrice) }}</strong>
        <div class="ticker-chg" [class.up]="t.changePct >= 0" [class.down]="t.changePct < 0">
          <span>{{ t.changePct >= 0 ? '▲ +' : '▼ ' }}{{ t.changePct | number:'1.2-2' }}%</span>
          <small>30d trend</small>
        </div>
      </article>
    </section>

    <!-- Executive KPI Grid -->
    <section class="kpi-grid">
      <article class="kpi card">
        <div class="kpi-icon purple">₹</div>
        <div class="kpi-info">
          <span>Total Trade Value</span>
          <strong>{{ crore(summary?.totalTradeValue || 0) }}</strong>
          <small>Approved trade turnover</small>
        </div>
      </article>

      <article class="kpi card">
        <div class="kpi-icon teal">A</div>
        <div class="kpi-info">
          <span>Auctions Executed</span>
          <strong>{{ summary?.totalAuctions | number }}</strong>
          <small>{{ summary?.approvedAuctions | number }} approved</small>
        </div>
      </article>

      <article class="kpi card">
        <div class="kpi-icon blue">◎</div>
        <div class="kpi-info">
          <span>Participants</span>
          <strong>{{ summary?.participatingBidders | number }}</strong>
          <small>{{ summary?.registeredBidders | number }} registered bidders</small>
        </div>
      </article>

      <article class="kpi card">
        <div class="kpi-icon green">✓</div>
        <div class="kpi-info">
          <span>Approval Rate</span>
          <strong>{{ summary?.approvalRate | number:'1.1-1' }}%</strong>
          <small>Successful auction outcomes</small>
        </div>
      </article>

      <article class="kpi card">
        <div class="kpi-icon orange">⇄</div>
        <div class="kpi-info">
          <span>Auction Classification</span>
          <strong>{{ summary?.forwardAuctions | number }} / {{ summary?.reverseAuctions | number }}</strong>
          <small>Forward (S) / Reverse (B)</small>
        </div>
      </article>
    </section>

    <!-- Main Analytics Grid: Candlestick Chart + Dual Price Discovery (Positioned Upside) -->
    <section class="main-grid">
      <!-- Candlestick & Trading Statistics Chart -->
      <article class="card trend-card">
        <app-candlestick-chart
          [data]="trends"
          [commodity]="filter.commodity || 'Combined Markets'"
          [title]="'Monthly Price Discovery & Auction Turnover Trend'">
        </app-candlestick-chart>
      </article>

      <!-- Dual-Auction Price Discovery Module -->
      <article class="card discovery-card">
        <div class="section-head">
          <div>
            <h2>Dual-Auction Price Discovery</h2>
            <p>Highest forward sale prices & lowest reverse procurement prices</p>
          </div>
          <span class="status-indicator">Real-time</span>
        </div>

        <div class="discovery-list" *ngIf="prices.length; else emptyPrices">
          <div
            class="price-card"
            *ngFor="let p of prices"
            [class.reverse]="p.mode.startsWith('REVERSE')">
            <div class="price-badge-row">
              <span class="mode-badge" [class.reverse-badge]="p.mode.startsWith('REVERSE')">
                {{ p.mode.startsWith('REVERSE') ? '▼ LOWEST REVERSE' : '▲ HIGHEST FORWARD' }}
              </span>
              <span class="vol-chip">{{ compact(p.quantity) }} {{ p.qtyUnit }}</span>
            </div>

            <div class="price-body">
              <div class="commodity-meta">
                <strong class="commodity-title">{{ p.commodity }}</strong>
                <div class="meta-pills">
                  <span class="code-pill">{{ p.market }}</span>
                  <span class="auction-id-pill">#{{ p.auctionId }}</span>
                </div>
              </div>
              <div class="price-val">
                <span class="price-label">Discovery Price</span>
                <strong>{{ money(p.price) }}</strong>
              </div>
            </div>
          </div>
        </div>

        <ng-template #emptyPrices>
          <div class="empty-mini">No price discovery records for the selected filters.</div>
        </ng-template>
      </article>
    </section>

    <!-- Geographic Footprint: Interactive India Map -->
    <section class="map-section">
      <app-india-map
        [statesData]="states"
        [activeState]="filter.state || ''"
        (stateSelect)="onStateSelect($event)">
      </app-india-map>
    </section>

    <!-- Quantity by UOM (Strict Separation per NeML Business Rules) -->
    <section class="uom-section card">
      <div class="section-head">
        <div>
          <div class="uom-title-row">
            <h2>Quantity by Unit of Measurement (UOM)</h2>
            <span class="pill-count">{{ summary?.quantitiesByUom?.length || 0 }} Registered Units</span>
          </div>
          <p>Strictly segregated by business unit — MT, KG, NOS are never combined.</p>
        </div>

        <div class="uom-head-actions">
          <button type="button" class="btn-show-all-uom" (click)="openUomModal()">
            <span class="btn-grid-icon">⊞</span>
            <span>Show All Units ({{ summary?.quantitiesByUom?.length || 0 }})</span>
            <span class="btn-arrow">↗</span>
          </button>
        </div>
      </div>

      <!-- Quick Filter Chips Row on Single Dashboard Page -->
      <div class="uom-chips-row">
        <span class="chips-row-label">QUICK VIEW:</span>
        <button
          type="button"
          class="uom-chip"
          [class.active]="selectedUomChip === ''"
          (click)="selectUomChip('')">
          Top 4 Units
        </button>
        <button
          type="button"
          class="uom-chip"
          *ngFor="let uom of quickUomChips"
          [class.active]="selectedUomChip === uom"
          (click)="selectUomChip(uom)">
          {{ uom }}
        </button>
        <button
          type="button"
          class="uom-chip more-chip"
          (click)="openUomModal()">
          + More Units ({{ (summary?.quantitiesByUom?.length || 0) > quickUomChips.length ? ((summary?.quantitiesByUom?.length || 0) - quickUomChips.length) : 0 }}) ↗
        </button>
      </div>

      <!-- Visible UOM Cards Grid (Top 4 by default or selected chip) -->
      <div class="uom-grid" *ngIf="visibleUomList.length; else noUomFound">
        <div class="uom-card" *ngFor="let q of visibleUomList">
          <div class="uom-header">
            <div class="uom-tag-wrap">
              <span class="uom-tag">{{ q.uom }}</span>
              <button
                type="button"
                class="btn-pin-filter"
                *ngIf="filter.qtyUnit !== q.uom"
                (click)="applyUomToDashboard(q.uom)"
                title="Filter entire dashboard by {{ q.uom }}">
                ⚡ Filter by {{ q.uom }}
              </button>
              <span class="active-filter-indicator" *ngIf="filter.qtyUnit === q.uom">
                ✓ Dashboard Filter
              </span>
            </div>
            <span
              class="clearance-badge"
              [class.high]="q.clearanceRate >= 70"
              [class.med]="q.clearanceRate >= 35 && q.clearanceRate < 70"
              [class.low]="q.clearanceRate < 35">
              {{ q.clearanceRate | number:'1.1-1' }}% Clearance
            </span>
          </div>

          <div class="uom-metric-main">
            <small>Offered Quantity</small>
            <strong>{{ compact(q.offeredQty) }} {{ q.uom }}</strong>
          </div>

          <!-- Progress bar for clearance -->
          <div class="progress-bar">
            <div class="progress-fill" [style.width.%]="q.clearanceRate"></div>
          </div>

          <div class="uom-breakdown">
            <div>
              <span>Approved</span>
              <b>{{ compact(q.approvedQty) }}</b>
            </div>
            <div>
              <span>Traded</span>
              <b>{{ compact(q.tradedQty) }}</b>
            </div>
          </div>

          <div class="uom-avg">
            <span>Average Trade Price</span>
            <strong>{{ money(q.averageTradePrice) }} / {{ q.uom }}</strong>
          </div>
        </div>
      </div>

      <ng-template #noUomFound>
        <div class="empty-mini">No unit of measurement records matching current selection.</div>
      </ng-template>

      <!-- Bottom Hint & Show All Action -->
      <div class="uom-foot-hint" *ngIf="summary?.quantitiesByUom?.length && (summary?.quantitiesByUom?.length || 0) > 4">
        <span>Displaying {{ visibleUomList.length }} of {{ summary?.quantitiesByUom?.length }} units to keep dashboard clean.</span>
        <button type="button" class="link-show-all" (click)="openUomModal()">
          Open UOM Explorer (All {{ summary?.quantitiesByUom?.length }} Units) →
        </button>
      </div>
    </section>

    <!-- Insight Grid: Top Clients, Top Commodities, Business Rules -->
    <section class="insight-grid">
      <!-- Most Traded Clients -->
      <article class="card list-card">
        <div class="section-head">
          <div>
            <h2>Most Traded Clients</h2>
            <p>Ranked by approved trade value turnover</p>
          </div>
        </div>
        <div class="rank-list" *ngIf="clients.length; else emptyRank">
          <div class="rank-row" *ngFor="let r of clients; index as i">
            <div class="rank-idx" [class.gold]="i === 0" [class.silver]="i === 1" [class.bronze]="i === 2">
              {{ i + 1 }}
            </div>
            <div class="rank-main">
              <b>{{ r.label }}</b>
              <small>{{ r.auctions }} auctions executed</small>
            </div>
            <div class="rank-val">
              <strong>{{ crore(r.tradeValue) }}</strong>
            </div>
          </div>
        </div>
      </article>

      <!-- Top Commodities -->
      <article class="card list-card">
        <div class="section-head">
          <div>
            <h2>Top Commodities</h2>
            <p>Ranked by trade turnover value</p>
          </div>
        </div>
        <div class="rank-list" *ngIf="commodities.length; else emptyRank">
          <div class="rank-row" *ngFor="let r of commodities; index as i">
            <div class="rank-idx" [class.gold]="i === 0" [class.silver]="i === 1" [class.bronze]="i === 2">
              {{ i + 1 }}
            </div>
            <div class="rank-main">
              <b>{{ r.label }}</b>
              <small>{{ r.auctions }} auctions executed</small>
            </div>
            <div class="rank-val">
              <strong>{{ crore(r.tradeValue) }}</strong>
            </div>
          </div>
        </div>
      </article>

      <!-- Business Rules Applied -->
      <article class="card rule-card">
        <div class="section-head">
          <div>
            <h2>Locked Business Rules</h2>
            <p>Authoritative NeML auction processing parameters</p>
          </div>
        </div>
        <div class="rule-body">
          <div class="rule-row">
            <b>Forward Auction</b>
            <span>Order Type <code>AO</code> + Side <code>S</code></span>
          </div>
          <div class="rule-row">
            <b>Reverse Auction</b>
            <span>Order Type <code>AO</code> + Side <code>B</code></span>
          </div>
          <div class="rule-row">
            <b>Mapping Owner</b>
            <span>MarketWatch Data Console</span>
          </div>
          <div class="rule-row">
            <b>UOM Separation</b>
            <span>Never aggregated across MT/KG/NOS</span>
          </div>
          <div class="rule-row">
            <b>Snapshot Refresh</b>
            <span>Every 15 minutes (In-memory)</span>
          </div>
          <div class="rule-row">
            <b>Sensitive Participant PII</b>
            <span>Restricted to internal authenticated sessions</span>
          </div>
        </div>
      </article>
    </section>

    <ng-template #emptyRank>
      <div class="empty-mini">No rankings available for selected filters.</div>
    </ng-template>

    <!-- Dedicated "Show All Units" Modal Dialog -->
    <div class="uom-modal-backdrop" *ngIf="isUomModalOpen" (click)="closeUomModal()">
      <div class="uom-modal-panel" (click)="$event.stopPropagation()">
        <!-- Modal Head -->
        <div class="modal-head">
          <div>
            <div class="modal-eyebrow">
              <span class="pulse-dot"></span>
              <span>NE-ML COMPREHENSIVE UOM REPOSITORY</span>
            </div>
            <h2>All Units of Measurement ({{ summary?.quantitiesByUom?.length || 0 }})</h2>
            <p>Complete multi-unit clearing, trade volume, and average trade price analytics.</p>
          </div>
          <button type="button" class="modal-close-btn" (click)="closeUomModal()" aria-label="Close">×</button>
        </div>

        <!-- Modal Search & Toolbar -->
        <div class="modal-toolbar">
          <div class="modal-search-box">
            <span class="search-icon">🔍</span>
            <input
              type="text"
              [(ngModel)]="uomModalSearch"
              placeholder="Search by UOM name (e.g. MT, KG, NOS, QTL, BAG)..." />
            <button
              type="button"
              class="clear-search-btn"
              *ngIf="uomModalSearch"
              (click)="uomModalSearch = ''">
              ×
            </button>
          </div>

          <!-- Sort dropdown -->
          <div class="modal-sort">
            <span class="sort-label">Sort:</span>
            <select [(ngModel)]="modalSortBy">
              <option value="VOLUME">Highest Trade Volume</option>
              <option value="OFFERED">Highest Offered Quantity</option>
              <option value="CLEARANCE">Clearance Rate %</option>
              <option value="PRICE">Average Price</option>
              <option value="NAME">Unit Name (A-Z)</option>
            </select>
          </div>
        </div>

        <!-- Filter Chips Row inside Show All Page (User explicitly requested: "and filters in chips which want see the UOM in show all page") -->
        <div class="modal-chips-bar">
          <span class="m-chip-label">FILTER BY UNIT CHIP:</span>
          <div class="m-chips-container">
            <button
              type="button"
              class="m-chip"
              [class.active]="modalUomChip === ''"
              (click)="modalUomChip = ''">
              All Units ({{ summary?.quantitiesByUom?.length || 0 }})
            </button>
            <button
              type="button"
              class="m-chip"
              *ngFor="let uom of allAvailableUoms"
              [class.active]="modalUomChip === uom"
              (click)="modalUomChip = uom">
              {{ uom }}
            </button>
          </div>
        </div>

        <!-- Scrollable Modal Body: Grid of all UOMs -->
        <div class="modal-body">
          <div class="modal-uom-grid" *ngIf="filteredModalUoms.length; else modalEmpty">
            <div class="modal-uom-card" *ngFor="let q of filteredModalUoms">
              <div class="uom-header">
                <div class="uom-tag-wrap">
                  <span class="uom-tag">{{ q.uom }}</span>
                </div>
                <span
                  class="clearance-badge"
                  [class.high]="q.clearanceRate >= 70"
                  [class.med]="q.clearanceRate >= 35 && q.clearanceRate < 70"
                  [class.low]="q.clearanceRate < 35">
                  {{ q.clearanceRate | number:'1.1-1' }}% Clearance
                </span>
              </div>

              <div class="uom-metric-main">
                <small>Offered Quantity</small>
                <strong>{{ compact(q.offeredQty) }} {{ q.uom }}</strong>
              </div>

              <!-- Progress bar for clearance -->
              <div class="progress-bar">
                <div class="progress-fill" [style.width.%]="q.clearanceRate"></div>
              </div>

              <div class="uom-breakdown">
                <div>
                  <span>Approved:</span>
                  <b>{{ compact(q.approvedQty) }}</b>
                </div>
                <div>
                  <span>Traded:</span>
                  <b>{{ compact(q.tradedQty) }}</b>
                </div>
              </div>

              <div class="uom-avg">
                <span>Average Trade Price</span>
                <strong>{{ money(q.averageTradePrice) }} / {{ q.uom }}</strong>
              </div>

              <!-- Quick action to filter the entire dashboard by this UOM -->
              <div class="modal-card-foot">
                <button
                  type="button"
                  class="btn-apply-dashboard-uom"
                  [class.active]="filter.qtyUnit === q.uom"
                  (click)="applyUomToDashboard(q.uom)">
                  {{ filter.qtyUnit === q.uom ? '✓ Active Dashboard Filter' : '⚡ Filter Dashboard by ' + q.uom }}
                </button>
              </div>
            </div>
          </div>

          <ng-template #modalEmpty>
            <div class="modal-empty-state">
              <span class="empty-icon">🔍</span>
              <h3>No Units Found</h3>
              <p>No unit matching "{{ uomModalSearch || modalUomChip }}" exists in this dataset.</p>
              <button type="button" class="btn-reset-modal" (click)="uomModalSearch = ''; modalUomChip = ''">
                Reset Search & Filters
              </button>
            </div>
          </ng-template>
        </div>

        <!-- Modal Footer -->
        <div class="modal-foot">
          <div class="modal-foot-info">
            Showing <b>{{ filteredModalUoms.length }}</b> of <b>{{ summary?.quantitiesByUom?.length || 0 }}</b> units
            <span *ngIf="modalUomChip || uomModalSearch">(Filtered)</span>
          </div>
          <button type="button" class="btn-close-modal" (click)="closeUomModal()">Close Explorer</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-head {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 18px;
    }

    .eyebrow {
      color: #6366f1;
      text-transform: uppercase;
      letter-spacing: 0.9px;
      font-size: 11px;
      font-weight: 850;
    }

    .page-head h1 {
      font-size: 28px;
      font-weight: 900;
      letter-spacing: -0.6px;
      margin: 4px 0;
      color: var(--text);
    }

    .page-head p {
      margin: 0;
      color: var(--muted);
      font-size: 14px;
    }

    .head-actions {
      display: flex;
      gap: 10px;
    }

    .head-actions button {
      height: 42px;
      border-radius: 12px;
      padding: 0 16px;
      font-weight: 750;
      font-size: 13px;
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }

    .refresh-btn {
      border: 1px solid var(--line);
      background: #ffffff;
      color: #334155;
      box-shadow: var(--shadow-sm);
    }

    .refresh-btn:hover {
      background: #f8fafc;
      border-color: #cbd5e1;
    }

    .spinning {
      display: inline-block;
      animation: spin 1s infinite linear;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    .export-btn {
      border: 0;
      background: linear-gradient(135deg, #0ea5e9, #059669);
      color: #ffffff;
      box-shadow: 0 4px 12px rgba(14, 165, 233, 0.25);
    }

    .export-btn:hover {
      filter: brightness(1.08);
    }

    .snapshot-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 12px;
      color: #64748b;
      padding: 10px 4px;
      margin-bottom: 8px;
    }

    .snapshot-left {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .snapshot-left b {
      color: #1e293b;
    }

    .separator {
      color: #cbd5e1;
    }

    .live-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #10b981;
      box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.15);
    }

    .snapshot-right {
      display: flex;
      gap: 8px;
    }

    .rule-pill {
      font-size: 11px;
      font-weight: 700;
      background: #f1f5f9;
      color: #475569;
      padding: 3px 9px;
      border-radius: 999px;
    }

    /* Live Commodity Ticker Grid */
    .ticker-grid {
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      gap: 12px;
      margin-bottom: 16px;
    }

    .ticker {
      padding: 14px 16px;
      border-radius: 14px;
      border: 1px solid var(--line);
      background: #ffffff;
    }

    .ticker:hover {
      border-color: #cbd5e1;
      box-shadow: var(--shadow-md);
    }

    .ticker-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .ticker-name {
      font-size: 12px;
      font-weight: 800;
      color: #1e293b;
    }

    .trades-count {
      font-size: 10px;
      color: #94a3b8;
    }

    .ticker-price {
      display: block;
      font-size: 18px;
      font-weight: 800;
      font-family: var(--font-mono);
      margin: 6px 0;
      color: #0f172a;
    }

    .ticker-chg {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 11px;
      font-weight: 750;
      font-family: var(--font-mono);
    }

    .ticker-chg small {
      font-size: 10px;
      color: #94a3b8;
      font-family: var(--font-main);
    }

    .up {
      color: #059669 !important;
    }

    .down {
      color: #dc2626 !important;
    }

    /* Executive KPI Grid */
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 14px;
      margin-bottom: 16px;
    }

    .kpi {
      display: flex;
      gap: 14px;
      align-items: center;
      padding: 18px 20px;
      border-radius: 16px;
      background: #ffffff;
      border: 1px solid var(--line);
    }

    .kpi:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
      border-color: #cbd5e1;
    }

    .kpi-icon {
      width: 46px;
      height: 46px;
      border-radius: 14px;
      display: grid;
      place-items: center;
      font-size: 20px;
      font-weight: 900;
      flex-shrink: 0;
    }

    .kpi-icon.purple { background: #eef2ff; color: #6366f1; }
    .kpi-icon.teal { background: #f0fdf4; color: #059669; }
    .kpi-icon.blue { background: #f0f9ff; color: #0284c7; }
    .kpi-icon.green { background: #ecfdf5; color: #10b981; }
    .kpi-icon.orange { background: #fffbeb; color: #d97706; }

    .kpi-info span {
      display: block;
      color: #64748b;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.4px;
    }

    .kpi-info strong {
      display: block;
      font-size: 22px;
      font-weight: 850;
      letter-spacing: -0.5px;
      margin: 3px 0;
      color: #0f172a;
    }

    .kpi-info small {
      color: #94a3b8;
      font-size: 11px;
    }

    /* UOM Section */
    .uom-section {
      padding: 22px;
      margin-bottom: 16px;
      background: #ffffff;
      border: 1px solid var(--line);
      border-radius: 18px;
    }

    .section-head {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 14px;
      flex-wrap: wrap;
      gap: 12px;
    }

    .uom-title-row {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .section-head h2 {
      font-size: 17px;
      font-weight: 800;
      letter-spacing: -0.3px;
      margin: 0;
      color: #0f172a;
    }

    .pill-count {
      font-size: 11px;
      font-weight: 800;
      color: #4338ca;
      background: #eef2ff;
      border: 1px solid #c7d2fe;
      padding: 2px 8px;
      border-radius: 999px;
    }

    .section-head p {
      font-size: 12px;
      color: #64748b;
      margin: 4px 0 0;
    }

    .uom-head-actions {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .btn-show-all-uom {
      height: 38px;
      padding: 0 16px;
      border-radius: 10px;
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      color: #1e293b;
      font-size: 12.5px;
      font-weight: 800;
      display: inline-flex;
      align-items: center;
      gap: 7px;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .btn-show-all-uom:hover {
      background: #eef2ff;
      border-color: #6366f1;
      color: #4338ca;
      box-shadow: 0 2px 8px rgba(99, 102, 241, 0.15);
    }

    .btn-grid-icon {
      font-size: 14px;
    }

    .btn-arrow {
      font-size: 13px;
      color: #6366f1;
      font-weight: 900;
    }

    /* UOM Quick View Chips Row */
    .uom-chips-row {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
      margin-bottom: 16px;
      padding-bottom: 12px;
      border-bottom: 1px dashed #e2e8f0;
    }

    .chips-row-label {
      font-size: 10.5px;
      font-weight: 850;
      color: #64748b;
      letter-spacing: 0.6px;
    }

    .uom-chip {
      padding: 5px 12px;
      border-radius: 8px;
      font-size: 11.5px;
      font-weight: 750;
      border: 1px solid #e2e8f0;
      background: #f8fafc;
      color: #475569;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .uom-chip:hover {
      border-color: #6366f1;
      color: #4338ca;
      background: #ffffff;
    }

    .uom-chip.active {
      background: #6366f1;
      border-color: #6366f1;
      color: #ffffff;
      box-shadow: 0 2px 8px rgba(99, 102, 241, 0.28);
    }

    .uom-chip.more-chip {
      border-style: dashed;
      color: #6366f1;
      background: #ffffff;
    }

    .uom-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 14px;
    }

    .uom-card {
      border: 1px solid #e2e8f0;
      border-radius: 14px;
      padding: 16px;
      background: #f8fafc;
      transition: all 0.2s ease;
    }

    .uom-card:hover {
      background: #ffffff;
      border-color: #cbd5e1;
      box-shadow: var(--shadow);
    }

    .uom-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }

    .uom-tag-wrap {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .uom-tag {
      font-size: 12px;
      font-weight: 900;
      color: #6366f1;
      background: #eef2ff;
      padding: 3px 9px;
      border-radius: 8px;
    }

    .btn-pin-filter {
      border: 1px solid #c7d2fe;
      background: #ffffff;
      color: #4338ca;
      font-size: 10px;
      font-weight: 800;
      padding: 2px 6px;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.12s ease;
    }

    .btn-pin-filter:hover {
      background: #6366f1;
      color: #ffffff;
      border-color: #6366f1;
    }

    .active-filter-indicator {
      font-size: 10px;
      font-weight: 850;
      color: #059669;
      background: #ecfdf5;
      padding: 2px 6px;
      border-radius: 6px;
    }

    .clearance-badge {
      font-size: 11px;
      font-weight: 800;
      padding: 3px 8px;
      border-radius: 999px;
    }

    .clearance-badge.high { color: #059669; background: #ecfdf5; }
    .clearance-badge.med { color: #0284c7; background: #f0f9ff; }
    .clearance-badge.low { color: #d97706; background: #fffbeb; }

    .uom-metric-main small {
      display: block;
      font-size: 11px;
      color: #64748b;
    }

    .uom-metric-main strong {
      display: block;
      font-size: 22px;
      font-weight: 850;
      color: #0f172a;
      margin: 2px 0 8px;
      font-family: var(--font-mono);
    }

    .progress-bar {
      height: 6px;
      background: #e2e8f0;
      border-radius: 999px;
      overflow: hidden;
      margin-bottom: 12px;
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #6366f1, #10b981);
      border-radius: 999px;
    }

    .uom-breakdown {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-top: 1px dashed #e2e8f0;
      border-bottom: 1px dashed #e2e8f0;
      margin-bottom: 10px;
      font-size: 11px;
    }

    .uom-breakdown span {
      color: #64748b;
      margin-right: 4px;
    }

    .uom-breakdown b {
      color: #1e293b;
      font-family: var(--font-mono);
    }

    .uom-avg {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 11px;
    }

    .uom-avg span {
      color: #64748b;
    }

    .uom-avg strong {
      color: #0f172a;
      font-family: var(--font-mono);
      font-size: 12px;
    }

    .uom-foot-hint {
      margin-top: 14px;
      padding-top: 12px;
      border-top: 1px solid #f1f5f9;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 12px;
      color: #64748b;
      flex-wrap: wrap;
      gap: 10px;
    }

    .link-show-all {
      border: 0;
      background: transparent;
      color: #6366f1;
      font-weight: 800;
      font-size: 12px;
      cursor: pointer;
      padding: 0;
    }

    .link-show-all:hover {
      text-decoration: underline;
    }

    /* =========================================================
       SHOW ALL UNITS MODAL STYLING
       ========================================================= */
    .uom-modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.55);
      backdrop-filter: blur(6px);
      -webkit-backdrop-filter: blur(6px);
      z-index: 1100;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
      animation: fadeIn 0.2s ease-out;
    }

    .uom-modal-panel {
      background: #ffffff;
      border-radius: 20px;
      width: 100%;
      max-width: 1060px;
      max-height: 88vh;
      display: flex;
      flex-direction: column;
      box-shadow: 0 24px 60px rgba(15, 23, 42, 0.35);
      border: 1px solid #e2e8f0;
      overflow: hidden;
      animation: slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }

    @keyframes slideUp {
      from { transform: translateY(20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }

    .modal-head {
      padding: 20px 24px 16px;
      border-bottom: 1px solid #f1f5f9;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      background: #ffffff;
    }

    .modal-eyebrow {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      font-size: 11px;
      font-weight: 850;
      color: #6366f1;
      letter-spacing: 0.8px;
    }

    .pulse-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #10b981;
      box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.25);
    }

    .modal-head h2 {
      font-size: 20px;
      font-weight: 900;
      margin: 4px 0 2px;
      color: #0f172a;
      letter-spacing: -0.4px;
    }

    .modal-head p {
      margin: 0;
      font-size: 13px;
      color: #64748b;
    }

    .modal-close-btn {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      border: 1px solid #e2e8f0;
      background: #f8fafc;
      color: #64748b;
      font-size: 20px;
      display: grid;
      place-items: center;
      cursor: pointer;
      line-height: 1;
      transition: all 0.15s ease;
    }

    .modal-close-btn:hover {
      background: #f1f5f9;
      color: #0f172a;
      border-color: #cbd5e1;
    }

    .modal-toolbar {
      padding: 12px 24px;
      background: #f8fafc;
      border-bottom: 1px solid #f1f5f9;
      display: flex;
      gap: 16px;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
    }

    .modal-search-box {
      position: relative;
      flex: 1;
      min-width: 260px;
      display: flex;
      align-items: center;
    }

    .modal-search-box .search-icon {
      position: absolute;
      left: 12px;
      font-size: 13px;
      color: #94a3b8;
      pointer-events: none;
    }

    .modal-search-box input {
      width: 100%;
      height: 40px;
      border: 1px solid #cbd5e1;
      border-radius: 10px;
      background: #ffffff;
      padding: 0 32px 0 36px;
      font-size: 13px;
      color: #0f172a;
      outline: none;
      transition: all 0.15s ease;
    }

    .modal-search-box input:focus {
      border-color: #6366f1;
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.12);
    }

    .clear-search-btn {
      position: absolute;
      right: 10px;
      border: 0;
      background: transparent;
      color: #94a3b8;
      font-size: 16px;
      cursor: pointer;
    }

    .modal-sort {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .sort-label {
      font-size: 12px;
      font-weight: 750;
      color: #64748b;
    }

    .modal-sort select {
      height: 40px;
      border: 1px solid #cbd5e1;
      border-radius: 10px;
      background: #ffffff;
      padding: 0 28px 0 12px;
      font-size: 12.5px;
      font-weight: 700;
      color: #334155;
      outline: none;
      cursor: pointer;
    }

    .modal-chips-bar {
      padding: 10px 24px;
      background: #ffffff;
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }

    .m-chip-label {
      font-size: 10.5px;
      font-weight: 850;
      color: #64748b;
      letter-spacing: 0.6px;
      flex-shrink: 0;
    }

    .m-chips-container {
      display: flex;
      align-items: center;
      gap: 6px;
      flex-wrap: wrap;
      max-height: 78px;
      overflow-y: auto;
      flex: 1;
    }

    .m-chip {
      font-size: 11px;
      font-weight: 750;
      padding: 4px 10px;
      border-radius: 6px;
      border: 1px solid #cbd5e1;
      background: #f8fafc;
      color: #475569;
      cursor: pointer;
      transition: all 0.12s ease;
    }

    .m-chip:hover {
      border-color: #6366f1;
      color: #4338ca;
    }

    .m-chip.active {
      background: #4f46e5;
      color: #ffffff;
      border-color: #4f46e5;
      box-shadow: 0 1px 4px rgba(79, 70, 229, 0.25);
    }

    .modal-body {
      flex: 1;
      overflow-y: auto;
      padding: 20px 24px;
      background: #f8fafc;
    }

    .modal-uom-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 14px;
    }

    .modal-uom-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 14px;
      padding: 16px;
      transition: all 0.15s ease;
      display: flex;
      flex-direction: column;
    }

    .modal-uom-card:hover {
      border-color: #cbd5e1;
      box-shadow: var(--shadow);
    }

    .modal-card-foot {
      margin-top: auto;
      padding-top: 12px;
    }

    .btn-apply-dashboard-uom {
      width: 100%;
      height: 34px;
      border-radius: 8px;
      border: 1px solid #c7d2fe;
      background: #eef2ff;
      color: #4338ca;
      font-size: 11.5px;
      font-weight: 800;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .btn-apply-dashboard-uom:hover {
      background: #6366f1;
      color: #ffffff;
      border-color: #6366f1;
    }

    .btn-apply-dashboard-uom.active {
      background: #ecfdf5;
      border-color: #a7f3d0;
      color: #059669;
    }

    .modal-empty-state {
      text-align: center;
      padding: 48px 20px;
    }

    .modal-empty-state .empty-icon {
      font-size: 36px;
      display: block;
      margin-bottom: 12px;
    }

    .modal-empty-state h3 {
      font-size: 16px;
      font-weight: 800;
      color: #0f172a;
      margin: 0 0 6px;
    }

    .modal-empty-state p {
      font-size: 13px;
      color: #64748b;
      margin: 0 0 16px;
    }

    .btn-reset-modal {
      height: 36px;
      padding: 0 16px;
      border-radius: 8px;
      border: 1px solid #cbd5e1;
      background: #ffffff;
      color: #334155;
      font-size: 12px;
      font-weight: 750;
      cursor: pointer;
    }

    .modal-foot {
      padding: 14px 24px;
      border-top: 1px solid #f1f5f9;
      background: #ffffff;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .modal-foot-info {
      font-size: 12px;
      color: #64748b;
    }

    .btn-close-modal {
      height: 36px;
      padding: 0 18px;
      border-radius: 9px;
      border: 1px solid #cbd5e1;
      background: #ffffff;
      color: #334155;
      font-size: 12.5px;
      font-weight: 750;
      cursor: pointer;
    }

    .btn-close-modal:hover {
      background: #f1f5f9;
    }

    /* Main Analytics Grid: Candlestick + Discovery */
    .main-grid {
      display: grid;
      grid-template-columns: 2.2fr 1fr;
      gap: 16px;
      margin-bottom: 16px;
    }

    .map-section {
      margin-bottom: 16px;
    }

    .trend-card {
      padding: 0;
      overflow: hidden;
      border: 1px solid var(--line);
    }

    .discovery-card {
      padding: 20px;
      border: 1px solid var(--line);
      background: #ffffff;
    }

    .status-indicator {
      font-size: 11px;
      font-weight: 750;
      color: #059669;
      background: #ecfdf5;
      padding: 3px 8px;
      border-radius: 999px;
    }

    .discovery-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-top: 14px;
    }

    .price-card {
      border: 1px solid #a7f3d0;
      background: #f0fdf4;
      border-radius: 14px;
      padding: 14px;
      transition: all 0.2s ease;
    }

    .price-card.reverse {
      border-color: #fde68a;
      background: #fffbeb;
    }

    .price-card:hover {
      box-shadow: var(--shadow);
      transform: translateY(-1px);
    }

    .price-badge-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }

    .mode-badge {
      font-size: 10px;
      font-weight: 850;
      color: #059669;
      letter-spacing: 0.4px;
    }

    .reverse-badge {
      color: #d97706 !important;
    }

    .vol-chip {
      font-size: 11px;
      font-weight: 700;
      background: rgba(255, 255, 255, 0.85);
      padding: 2px 8px;
      border-radius: 6px;
      color: #334155;
      font-family: var(--font-mono);
    }

    .price-body {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }

    .commodity-title {
      display: block;
      font-size: 14px;
      font-weight: 800;
      color: #0f172a;
      margin-bottom: 4px;
    }

    .meta-pills {
      display: flex;
      gap: 6px;
    }

    .code-pill {
      font-size: 11px;
      font-weight: 750;
      background: #eff6ff;
      color: #2563eb;
      padding: 2px 6px;
      border-radius: 6px;
    }

    .auction-id-pill {
      font-size: 11px;
      color: #64748b;
      font-family: var(--font-mono);
    }

    .price-val {
      text-align: right;
    }

    .price-label {
      display: block;
      font-size: 9px;
      text-transform: uppercase;
      color: #64748b;
      font-weight: 750;
      letter-spacing: 0.4px;
    }

    .price-val strong {
      display: block;
      font-size: 17px;
      font-weight: 850;
      color: #0f172a;
      font-family: var(--font-mono);
    }

    /* Insight Grid */
    .insight-grid {
      display: grid;
      grid-template-columns: 1fr 1fr 1.1fr;
      gap: 16px;
    }

    .list-card, .rule-card {
      padding: 20px;
      background: #ffffff;
      border: 1px solid var(--line);
    }

    .rank-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-top: 14px;
    }

    .rank-row {
      display: grid;
      grid-template-columns: 32px 1fr auto;
      gap: 12px;
      align-items: center;
      padding: 10px 12px;
      border-radius: 12px;
      background: #f8fafc;
      transition: all 0.15s ease;
    }

    .rank-row:hover {
      background: #f1f5f9;
    }

    .rank-idx {
      width: 28px;
      height: 28px;
      border-radius: 8px;
      background: #e2e8f0;
      color: #475569;
      display: grid;
      place-items: center;
      font-size: 12px;
      font-weight: 850;
    }

    .rank-idx.gold {
      background: #fef3c7;
      color: #d97706;
    }

    .rank-idx.silver {
      background: #f1f5f9;
      color: #475569;
    }

    .rank-idx.bronze {
      background: #ffedd5;
      color: #ea580c;
    }

    .rank-main b {
      display: block;
      font-size: 13px;
      color: #1e293b;
    }

    .rank-main small {
      font-size: 11px;
      color: #64748b;
    }

    .rank-val strong {
      font-size: 13px;
      font-weight: 800;
      color: #0f172a;
      font-family: var(--font-mono);
    }

    .rule-body {
      display: flex;
      flex-direction: column;
      gap: 11px;
      margin-top: 14px;
    }

    .rule-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 12px;
      background: #f8fafc;
      border-radius: 10px;
      font-size: 12px;
    }

    .rule-row b {
      color: #1e293b;
      font-weight: 750;
    }

    .rule-row span {
      color: #475569;
    }

    .rule-row code {
      background: #e2e8f0;
      padding: 2px 6px;
      border-radius: 4px;
      font-family: var(--font-mono);
      font-size: 11px;
    }

    .empty-mini {
      padding: 30px;
      text-align: center;
      color: #94a3b8;
      font-size: 12px;
    }

    @media (max-width: 1250px) {
      .ticker-grid { grid-template-columns: repeat(3, 1fr); }
      .kpi-grid { grid-template-columns: repeat(3, 1fr); }
      .uom-grid { grid-template-columns: repeat(2, 1fr); }
      .insight-grid { grid-template-columns: 1fr; }
    }

    @media (max-width: 950px) {
      .main-grid { grid-template-columns: 1fr; }
      .kpi-grid { grid-template-columns: 1fr 1fr; }
      .ticker-grid { grid-template-columns: 1fr 1fr; }
      .modal-uom-grid { grid-template-columns: repeat(2, 1fr); }
      .page-head { flex-direction: column; gap: 14px; }
      .snapshot-row { flex-direction: column; align-items: flex-start; gap: 8px; }
    }

    @media (max-width: 600px) {
      .page-head {
        margin-bottom: 12px;
      }
      .page-head h1 {
        font-size: 20px;
        line-height: 1.25;
        letter-spacing: -0.4px;
      }
      .page-head p {
        font-size: 12px;
      }
      .head-actions {
        display: grid;
        grid-template-columns: 1fr 1fr;
        width: 100%;
        gap: 8px;
      }
      .head-actions button {
        width: 100%;
        justify-content: center;
        height: 38px;
        font-size: 12px;
        padding: 0 10px;
      }
      .snapshot-row {
        font-size: 11px;
        gap: 6px;
      }
      .snapshot-right {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }
      .ticker-grid, .kpi-grid, .uom-grid, .modal-uom-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class DashboardComponent implements OnInit {
  filter: DashboardFilter = { source: 'ALL' };
  options: FilterOptions = this.emptyOptions();
  summary?: Summary;
  trends: TrendPoint[] = [];
  tickers: CommodityTicker[] = [];
  clients: RankingItem[] = [];
  commodities: RankingItem[] = [];
  states: RankingItem[] = [];
  prices: PriceDiscovery[] = [];
  aiAnalysis?: AiAnalysisResponse;
  loading = false;

  // UOM interactive states & methods
  selectedUomChip = '';
  isUomModalOpen = false;
  uomModalSearch = '';
  modalUomChip = '';
  modalSortBy: 'VOLUME' | 'OFFERED' | 'CLEARANCE' | 'PRICE' | 'NAME' = 'VOLUME';

  constructor(
    public api: DashboardApiService,
    public copilotService: AiCopilotService
  ) {}

  ngOnInit(): void {
    this.loadOptions('ALL');
    this.copilotService.setFilter(this.filter);
    this.load();
  }

  onFilter(f: DashboardFilter): void {
    this.filter = { ...f };
    this.copilotService.setFilter(this.filter);
    this.load();
  }

  onSourceChanged(s: ProjectSource): void {
    this.loadOptions(s);
  }

  loadOptions(s: ProjectSource): void {
    this.api.filters(s).subscribe(x => (this.options = x));
  }

  load(): void {
    this.loading = true;
    forkJoin({
      summary: this.api.summary(this.filter),
      trends: this.api.trends(this.filter),
      tickers: this.api.tickers(this.filter),
      clients: this.api.rankings(this.filter, 'CLIENT', 5),
      commodities: this.api.rankings(this.filter, 'COMMODITY', 5),
      states: this.api.rankings(this.filter, 'STATE', 50),
      prices: this.api.priceDiscovery(this.filter, 3),
      aiAnalysis: this.api.aiAnalysis(this.filter)
    }).subscribe({
      next: x => {
        Object.assign(this, x);
        this.loading = false;
      },
      error: () => (this.loading = false)
    });
  }

  onStateSelect(stateCode: string): void {
    if (!stateCode || this.filter.state === stateCode) {
      this.filter = { ...this.filter, state: undefined };
    } else {
      this.filter = { ...this.filter, state: stateCode };
    }
    this.copilotService.setFilter(this.filter);
    this.load();
  }

  openCopilot(question?: string): void {
    this.copilotService.open(question);
  }

  refresh(): void {
    this.loading = true;
    this.api.refresh().subscribe({
      next: () => this.load(),
      error: () => (this.loading = false)
    });
  }

  download(): void {
    this.api.exportAuction(this.filter).subscribe(blob => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'AGRI-ANALYTIX-auction-report.xlsx';
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  // --- UOM Interactive Getters & Actions ---
  get quickUomChips(): string[] {
    if (!this.summary?.quantitiesByUom?.length) return [];
    const sorted = [...this.summary.quantitiesByUom].sort((a, b) => (b.tradedQty || 0) - (a.tradedQty || 0));
    return sorted.slice(0, 8).map(x => x.uom);
  }

  get allAvailableUoms(): string[] {
    if (!this.summary?.quantitiesByUom?.length) return [];
    return this.summary.quantitiesByUom.map(x => x.uom).sort((a, b) => a.localeCompare(b));
  }

  get topUomList(): QuantityMetric[] {
    if (!this.summary?.quantitiesByUom?.length) return [];
    const sorted = [...this.summary.quantitiesByUom].sort((a, b) => (b.tradedQty || 0) - (a.tradedQty || 0));
    return sorted.slice(0, 4);
  }

  get visibleUomList(): QuantityMetric[] {
    if (!this.summary?.quantitiesByUom?.length) return [];
    if (!this.selectedUomChip) {
      return this.topUomList;
    }
    return this.summary.quantitiesByUom.filter(x => x.uom.toUpperCase() === this.selectedUomChip.toUpperCase());
  }

  get filteredModalUoms(): QuantityMetric[] {
    if (!this.summary?.quantitiesByUom?.length) return [];
    let list = [...this.summary.quantitiesByUom];

    if (this.modalUomChip) {
      list = list.filter(x => x.uom.toUpperCase() === this.modalUomChip.toUpperCase());
    }

    if (this.uomModalSearch.trim()) {
      const q = this.uomModalSearch.trim().toUpperCase();
      list = list.filter(x => x.uom.toUpperCase().includes(q));
    }

    switch (this.modalSortBy) {
      case 'VOLUME':
        list.sort((a, b) => (b.tradedQty || 0) - (a.tradedQty || 0));
        break;
      case 'OFFERED':
        list.sort((a, b) => (b.offeredQty || 0) - (a.offeredQty || 0));
        break;
      case 'CLEARANCE':
        list.sort((a, b) => (b.clearanceRate || 0) - (a.clearanceRate || 0));
        break;
      case 'PRICE':
        list.sort((a, b) => (b.averageTradePrice || 0) - (a.averageTradePrice || 0));
        break;
      case 'NAME':
        list.sort((a, b) => a.uom.localeCompare(b.uom));
        break;
    }

    return list;
  }

  selectUomChip(uom: string): void {
    this.selectedUomChip = uom;
  }

  openUomModal(): void {
    this.isUomModalOpen = true;
    this.uomModalSearch = '';
    this.modalUomChip = '';
  }

  closeUomModal(): void {
    this.isUomModalOpen = false;
  }

  applyUomToDashboard(uom: string): void {
    this.filter = { ...this.filter, qtyUnit: uom };
    this.load();
    this.closeUomModal();
  }

  money(v: number): string {
    return `₹${Number(v || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
  }

  crore(v: number): string {
    return `₹${(Number(v || 0) / 10000000).toFixed(2)} Cr`;
  }

  compact(v: number): string {
    return Intl.NumberFormat('en-IN', { notation: 'compact', maximumFractionDigits: 1 }).format(Number(v || 0));
  }

  private emptyOptions(): FilterOptions {
    return {
      globalClients: [],
      markets: [],
      commodities: [],
      contracts: [],
      states: [],
      warehouses: [],
      schemes: [],
      sides: [],
      marketTypes: [],
      auctionModes: [],
      quantityUnits: [],
      dataAsOf: ''
    };
  }
}
