import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RankingItem } from '../core/models';
import { INDIA_MAP_LOCATIONS, INDIA_MAP_VIEWBOX, IndiaMapLocation } from './india-map.data';

export interface StateMapMeta {
  loc: IndiaMapLocation;
  code: string;
  name: string;
  filterValue: string;
  tradeValue: number;
  auctions: number;
  tradeQty: number;
  isActive: boolean;
  tier: number; // 0 = inactive, 1 = low, 2 = mid, 3 = high, 4 = top
  sharePct: number;
}

@Component({
  selector: 'app-india-map',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="india-map-container" #containerRef>
      <!-- Section Header -->
      <div class="map-header">
        <div class="header-left">
          <div class="title-row">
            <span class="map-icon">🗺️</span>
            <div>
              <h3>National Geographic Trading Footprint</h3>
              <p>Interactive state-wise agricultural commodity auctions & trade turnover across India</p>
            </div>
          </div>
        </div>

        <div class="header-right">
          <!-- Metric Toggle (Value vs Auctions) -->
          <div class="metric-toggle">
            <button
              type="button"
              [class.active]="metricMode === 'VALUE'"
              (click)="metricMode = 'VALUE'">
              ₹ Trade Turnover
            </button>
            <button
              type="button"
              [class.active]="metricMode === 'AUCTIONS'"
              (click)="metricMode = 'AUCTIONS'">
              Auctions Held
            </button>
          </div>

          <!-- Active Filter Pill if a state is selected -->
          <div class="active-filter-badge" *ngIf="activeState">
            <span class="dot-pulse"></span>
            <span>Filtered: <b>{{ getActiveStateName() }}</b></span>
            <button type="button" class="btn-clear-state" (click)="clearSelection()" title="Clear state filter">
              ✕
            </button>
          </div>
        </div>
      </div>

      <!-- Main Map & Leaderboard Layout -->
      <div class="map-content-grid">
        <!-- SVG Map Column -->
        <div class="svg-map-wrapper" (mouseleave)="clearHover()">
          <svg
            #svgRef
            [attr.viewBox]="viewBox"
            class="india-svg"
            (mousemove)="onMouseMove($event)">

            <defs>
              <!-- State Glow Filter for Selected State -->
              <filter id="stateGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="0" stdDeviation="4" flood-color="#4f46e5" flood-opacity="0.65" />
              </filter>

              <!-- State Hover Glow -->
              <filter id="hoverGlow" x="-15%" y="-15%" width="130%" height="130%">
                <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#0f172a" flood-opacity="0.3" />
              </filter>
            </defs>

            <!-- State Paths Layer -->
            <g class="states-layer">
              <path
                *ngFor="let s of stateMetaList"
                [attr.d]="s.loc.path"
                [attr.id]="'state-' + s.loc.id"
                [class.has-data]="s.tier > 0"
                [class.tier-1]="s.tier === 1"
                [class.tier-2]="s.tier === 2"
                [class.tier-3]="s.tier === 3"
                [class.tier-4]="s.tier === 4"
                [class.is-selected]="isStateSelected(s)"
                [class.is-hovered]="hoveredState?.loc?.id === s.loc.id"
                [attr.filter]="isStateSelected(s) ? 'url(#stateGlow)' : (hoveredState?.loc?.id === s.loc.id ? 'url(#hoverGlow)' : null)"
                (mouseenter)="onStateEnter(s, $event)"
                (click)="onStateClick(s)"
                class="state-path" />
            </g>
          </svg>

          <!-- Interactive Tooltip -->
          <div
            class="map-tooltip"
            *ngIf="hoveredState"
            [style.left.px]="tooltipX"
            [style.top.px]="tooltipY">
            <div class="tooltip-title">
              <strong>{{ hoveredState.name }}</strong>
              <span class="code-pill">{{ hoveredState.code }}</span>
            </div>

            <div class="tooltip-stats" *ngIf="hoveredState.auctions > 0; else noDataTip">
              <div class="tip-row">
                <span>Trade Turnover:</span>
                <b>{{ crore(hoveredState.tradeValue) }}</b>
              </div>
              <div class="tip-row">
                <span>Auctions Held:</span>
                <b>{{ hoveredState.auctions | number }}</b>
              </div>
              <div class="tip-row">
                <span>National Share:</span>
                <b>{{ hoveredState.sharePct | number:'1.1-1' }}%</b>
              </div>
            </div>

            <ng-template #noDataTip>
              <div class="tip-empty">No auction transactions recorded in selected filters.</div>
            </ng-template>

            <div class="tooltip-hint">
              <span *ngIf="!isStateSelected(hoveredState)">👉 Click to filter dashboard by {{ hoveredState.name }}</span>
              <span *ngIf="isStateSelected(hoveredState)">✕ Click to clear state filter</span>
            </div>
          </div>

          <!-- Map Legend Bar -->
          <div class="map-legend-bar">
            <span class="legend-title">Turnover Scale:</span>
            <div class="legend-items">
              <div class="l-item"><span class="swatch inactive"></span> No Data</div>
              <div class="l-item"><span class="swatch tier-1"></span> Low</div>
              <div class="l-item"><span class="swatch tier-2"></span> Moderate</div>
              <div class="l-item"><span class="swatch tier-3"></span> High</div>
              <div class="l-item"><span class="swatch tier-4"></span> Top Tier</div>
            </div>
          </div>
        </div>

        <!-- Leaderboard & Metrics Side Panel -->
        <div class="map-side-panel">
          <!-- Top Snapshot Stats -->
          <div class="side-kpi-row">
            <div class="side-kpi">
              <span class="sk-label">ACTIVE STATES</span>
              <strong class="sk-val">{{ activeStatesCount }}</strong>
              <small class="sk-sub">of 36 states & UTs</small>
            </div>
            <div class="side-kpi">
              <span class="sk-label">TOP PERFORMER</span>
              <strong class="sk-val" *ngIf="topState">{{ topState.name }}</strong>
              <strong class="sk-val" *ngIf="!topState">—</strong>
              <small class="sk-sub" *ngIf="topState">{{ crore(topState.tradeValue) }} turnover</small>
              <small class="sk-sub" *ngIf="!topState">No active state</small>
            </div>
          </div>

          <!-- Quick State Search Box -->
          <div class="state-search-box">
            <span class="search-ico">🔍</span>
            <input
              type="text"
              [(ngModel)]="searchQuery"
              placeholder="Search Indian state (e.g. Maharashtra, MP, Gujarat)..." />
            <button
              type="button"
              class="btn-clear-search"
              *ngIf="searchQuery"
              (click)="searchQuery = ''">
              ×
            </button>
          </div>

          <!-- Top States Ranked List -->
          <div class="leaderboard-section">
            <div class="lb-head">
              <h4>State Rankings Leaderboard</h4>
              <span class="lb-count">{{ rankedList.length }} States</span>
            </div>

            <div class="lb-list" *ngIf="rankedList.length; else noRankings">
              <div
                class="lb-item"
                *ngFor="let s of rankedList; index as idx"
                [class.selected]="isStateSelected(s)"
                (click)="onStateClick(s)">
                <div class="lb-rank" [class.gold]="idx === 0" [class.silver]="idx === 1" [class.bronze]="idx === 2">
                  {{ idx + 1 }}
                </div>
                <div class="lb-info">
                  <div class="lb-name-row">
                    <b>{{ s.name }}</b>
                    <span class="lb-code">{{ s.code }}</span>
                  </div>
                  <div class="lb-bar-wrap">
                    <div
                      class="lb-bar-fill"
                      [style.width.%]="topState?.tradeValue ? (s.tradeValue / topState!.tradeValue) * 100 : 0"></div>
                  </div>
                  <div class="lb-meta-row">
                    <small>{{ s.auctions }} auctions</small>
                    <small>{{ s.sharePct | number:'1.1-1' }}% of total</small>
                  </div>
                </div>
                <div class="lb-val">
                  <strong>{{ crore(s.tradeValue) }}</strong>
                  <button type="button" class="btn-filter-tag" [class.active]="isStateSelected(s)">
                    {{ isStateSelected(s) ? '✓ Filtered' : 'Filter' }}
                  </button>
                </div>
              </div>
            </div>

            <ng-template #noRankings>
              <div class="empty-side">No state transaction data found for current filters.</div>
            </ng-template>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }

    .india-map-container {
      background: var(--surface, #ffffff);
      border: 1px solid var(--border, #e2e8f0);
      border-radius: 18px;
      padding: 22px;
      box-shadow: 0 4px 18px rgba(15, 23, 42, 0.04);
      margin-bottom: 24px;
    }

    /* Map Header */
    .map-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 14px;
      padding-bottom: 16px;
      border-bottom: 1px solid #f1f5f9;
      margin-bottom: 18px;
    }

    .title-row {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .map-icon {
      font-size: 26px;
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      width: 44px;
      height: 44px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .title-row h3 {
      margin: 0;
      font-size: 17px;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.3px;
    }

    .title-row p {
      margin: 3px 0 0;
      font-size: 12px;
      color: #64748b;
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }

    .metric-toggle {
      display: inline-flex;
      background: #f1f5f9;
      padding: 3px;
      border-radius: 10px;
      gap: 2px;
    }

    .metric-toggle button {
      padding: 6px 14px;
      font-size: 11.5px;
      font-weight: 750;
      border-radius: 8px;
      color: #64748b;
      cursor: pointer;
      border: none;
      background: transparent;
      transition: all 0.15s ease;
    }

    .metric-toggle button:hover {
      color: #0f172a;
    }

    .metric-toggle button.active {
      background: #ffffff;
      color: #4338ca;
      box-shadow: 0 1px 4px rgba(15, 23, 42, 0.08);
      font-weight: 800;
    }

    .active-filter-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: #eef2ff;
      border: 1px solid #c7d2fe;
      color: #3730a3;
      padding: 5px 12px;
      border-radius: 999px;
      font-size: 11.5px;
      font-weight: 700;
    }

    .dot-pulse {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #4f46e5;
      animation: pulse 1.5s infinite;
    }

    @keyframes pulse {
      0% { transform: scale(0.9); opacity: 0.8; }
      50% { transform: scale(1.4); opacity: 1; }
      100% { transform: scale(0.9); opacity: 0.8; }
    }

    .btn-clear-state {
      background: transparent;
      border: none;
      color: #6366f1;
      font-weight: 900;
      cursor: pointer;
      font-size: 13px;
      padding: 0 2px;
      line-height: 1;
    }

    .btn-clear-state:hover {
      color: #dc2626;
    }

    /* Grid Layout */
    .map-content-grid {
      display: grid;
      grid-template-columns: 1.15fr 0.85fr;
      gap: 24px;
      align-items: start;
    }

    /* SVG Map Column */
    .svg-map-wrapper {
      position: relative;
      background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
      border: 1px solid #e2e8f0;
      border-radius: 14px;
      padding: 16px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 480px;
      overflow: hidden;
    }

    .india-svg {
      width: 100%;
      max-height: 440px;
      display: block;
      filter: drop-shadow(0 2px 6px rgba(15, 23, 42, 0.06));
    }

    /* SVG State Path Styling */
    .state-path {
      fill: #f1f5f9;
      stroke: #cbd5e1;
      stroke-width: 0.8;
      stroke-linejoin: round;
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .state-path:hover {
      stroke: #1e293b;
      stroke-width: 1.8;
      filter: brightness(1.08);
    }

    /* Choropleth 4-tier palette */
    .state-path.tier-1 {
      fill: #e0e7ff; /* Very soft lavender */
      stroke: #c7d2fe;
    }

    .state-path.tier-2 {
      fill: #a5b4fc; /* Soft Indigo */
      stroke: #818cf8;
    }

    .state-path.tier-3 {
      fill: #6366f1; /* Royal Indigo */
      stroke: #4f46e5;
    }

    .state-path.tier-4 {
      fill: #4338ca; /* Deep Velvet Indigo */
      stroke: #3730a3;
    }

    /* Selected state glowing highlight */
    .state-path.is-selected {
      fill: #f59e0b !important; /* Golden Amber highlight */
      stroke: #b45309 !important;
      stroke-width: 2.5 !important;
    }

    /* Floating Tooltip */
    .map-tooltip {
      position: absolute;
      pointer-events: none;
      background: rgba(15, 23, 42, 0.94);
      backdrop-filter: blur(10px);
      color: #ffffff;
      padding: 12px 16px;
      border-radius: 12px;
      border: 1px solid rgba(255, 255, 255, 0.15);
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.4);
      z-index: 50;
      min-width: 210px;
      transform: translate(12px, 12px);
    }

    .tooltip-title {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 10px;
      margin-bottom: 8px;
      padding-bottom: 6px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.12);
    }

    .tooltip-title strong {
      font-size: 13px;
      font-weight: 800;
      color: #f8fafc;
    }

    .code-pill {
      font-size: 10px;
      font-weight: 800;
      background: rgba(99, 102, 241, 0.35);
      color: #a5b4fc;
      border: 1px solid rgba(99, 102, 241, 0.5);
      padding: 1px 6px;
      border-radius: 4px;
    }

    .tooltip-stats {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .tip-row {
      display: flex;
      justify-content: space-between;
      font-size: 11.5px;
    }

    .tip-row span {
      color: #94a3b8;
    }

    .tip-row b {
      color: #38bdf8;
      font-family: var(--font-mono, monospace);
    }

    .tip-empty {
      font-size: 11px;
      color: #94a3b8;
      font-style: italic;
    }

    .tooltip-hint {
      margin-top: 8px;
      padding-top: 6px;
      border-top: 1px dashed rgba(255, 255, 255, 0.15);
      font-size: 10.5px;
      color: #a7f3d0;
      font-weight: 600;
    }

    /* Map Legend Bar */
    .map-legend-bar {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      margin-top: 14px;
      padding: 6px 14px;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 999px;
      font-size: 10.5px;
      color: #64748b;
    }

    .legend-title {
      font-weight: 800;
      color: #475569;
    }

    .legend-items {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .l-item {
      display: flex;
      align-items: center;
      gap: 5px;
    }

    .swatch {
      width: 12px;
      height: 12px;
      border-radius: 3px;
      border: 1px solid rgba(0, 0, 0, 0.1);
    }

    .swatch.inactive { background: #f1f5f9; }
    .swatch.tier-1 { background: #e0e7ff; }
    .swatch.tier-2 { background: #a5b4fc; }
    .swatch.tier-3 { background: #6366f1; }
    .swatch.tier-4 { background: #4338ca; }

    /* Side Panel */
    .map-side-panel {
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .side-kpi-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }

    .side-kpi {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 12px;
      display: flex;
      flex-direction: column;
    }

    .sk-label {
      font-size: 9.5px;
      font-weight: 800;
      color: #64748b;
      letter-spacing: 0.5px;
    }

    .sk-val {
      font-size: 16px;
      font-weight: 850;
      color: #0f172a;
      margin: 2px 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .sk-sub {
      font-size: 11px;
      color: #6366f1;
      font-weight: 600;
    }

    /* State Search Box */
    .state-search-box {
      display: flex;
      align-items: center;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 0 10px;
      height: 36px;
      gap: 8px;
    }

    .search-ico {
      font-size: 13px;
      color: #94a3b8;
    }

    .state-search-box input {
      border: none;
      background: transparent;
      outline: none;
      font-size: 12px;
      color: #0f172a;
      width: 100%;
    }

    .btn-clear-search {
      border: none;
      background: transparent;
      color: #94a3b8;
      font-size: 14px;
      cursor: pointer;
    }

    /* Leaderboard */
    .leaderboard-section {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    .lb-head {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      background: #f8fafc;
      border-bottom: 1px solid #e2e8f0;
    }

    .lb-head h4 {
      margin: 0;
      font-size: 13px;
      font-weight: 800;
      color: #1e293b;
    }

    .lb-count {
      font-size: 11px;
      font-weight: 750;
      color: #4338ca;
      background: #eef2ff;
      border: 1px solid #c7d2fe;
      padding: 1px 8px;
      border-radius: 999px;
    }

    .lb-list {
      max-height: 330px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
    }

    .lb-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 14px;
      border-bottom: 1px solid #f1f5f9;
      cursor: pointer;
      transition: background 0.15s ease;
    }

    .lb-item:last-child {
      border-bottom: none;
    }

    .lb-item:hover {
      background: #f8fafc;
    }

    .lb-item.selected {
      background: #fffbeb;
      border-left: 3px solid #f59e0b;
    }

    .lb-rank {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: #f1f5f9;
      color: #64748b;
      font-size: 11px;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .lb-rank.gold { background: #fef3c7; color: #b45309; }
    .lb-rank.silver { background: #f1f5f9; color: #475569; }
    .lb-rank.bronze { background: #ffedd5; color: #c2410c; }

    .lb-info {
      flex: 1;
      min-width: 0;
    }

    .lb-name-row {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-bottom: 4px;
    }

    .lb-name-row b {
      font-size: 12.5px;
      color: #1e293b;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .lb-code {
      font-size: 10px;
      font-weight: 800;
      color: #6366f1;
      background: #eef2ff;
      padding: 0 5px;
      border-radius: 4px;
    }

    .lb-bar-wrap {
      width: 100%;
      height: 4px;
      background: #f1f5f9;
      border-radius: 999px;
      overflow: hidden;
      margin-bottom: 4px;
    }

    .lb-bar-fill {
      height: 100%;
      background: linear-gradient(90deg, #6366f1, #38bdf8);
      border-radius: 999px;
      transition: width 0.3s ease;
    }

    .lb-meta-row {
      display: flex;
      justify-content: space-between;
      font-size: 10.5px;
      color: #94a3b8;
    }

    .lb-val {
      text-align: right;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 3px;
      flex-shrink: 0;
    }

    .lb-val strong {
      font-size: 12.5px;
      font-weight: 800;
      color: #0f172a;
      font-family: var(--font-mono, monospace);
    }

    .btn-filter-tag {
      font-size: 10px;
      font-weight: 750;
      color: #6366f1;
      background: #eef2ff;
      border: 1px solid #c7d2fe;
      padding: 2px 7px;
      border-radius: 5px;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .btn-filter-tag:hover {
      background: #6366f1;
      color: #ffffff;
    }

    .btn-filter-tag.active {
      background: #f59e0b;
      border-color: #d97706;
      color: #ffffff;
    }

    .empty-side {
      padding: 20px;
      text-align: center;
      font-size: 12px;
      color: #94a3b8;
    }

    @media (max-width: 1024px) {
      .map-content-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class IndiaMapComponent implements OnChanges {
  @Input() statesData: RankingItem[] = [];
  @Input() activeState: string = '';
  @Output() stateSelect = new EventEmitter<string>();

  @ViewChild('containerRef') containerRef?: ElementRef;
  @ViewChild('svgRef') svgRef?: ElementRef;

  viewBox = INDIA_MAP_VIEWBOX;
  locations = INDIA_MAP_LOCATIONS;

  metricMode: 'VALUE' | 'AUCTIONS' = 'VALUE';
  searchQuery = '';

  stateMetaList: StateMapMeta[] = [];
  hoveredState: StateMapMeta | null = null;
  tooltipX = 0;
  tooltipY = 0;

  ngOnChanges(changes: SimpleChanges): void {
    this.rebuildStateMeta();
  }

  rebuildStateMeta(): void {
    const dataMap = new Map<string, RankingItem>();

    // Index statesData by normalized keys (both code/key and full name lowercase)
    for (const item of (this.statesData || [])) {
      const codeKey = (item.key || '').trim().toLowerCase();
      const labelKey = (item.label || '').trim().toLowerCase();
      if (codeKey) dataMap.set(codeKey, item);
      if (labelKey) dataMap.set(labelKey, item);
    }

    // Determine max values for tiering
    let maxVal = 1;
    let maxAuc = 1;
    let totalTradeVal = 0;

    for (const item of (this.statesData || [])) {
      const v = Number(item.tradeValue || 0);
      const a = Number(item.auctions || 0);
      if (v > maxVal) maxVal = v;
      if (a > maxAuc) maxAuc = a;
      totalTradeVal += v;
    }

    this.stateMetaList = this.locations.map(loc => {
      // Look up by id, code, or name
      const item = dataMap.get(loc.id.toLowerCase())
        || dataMap.get(loc.code.toLowerCase())
        || dataMap.get(loc.name.toLowerCase());

      const tradeValue = item ? Number(item.tradeValue || 0) : 0;
      const auctions = item ? Number(item.auctions || 0) : 0;
      const tradeQty = item ? Number(item.quantity || 0) : 0;
      const sharePct = totalTradeVal > 0 ? (tradeValue / totalTradeVal) * 100 : 0;

      // Tier: 4 = top tier, 1 = low, 0 = no data
      let tier = 0;
      if (tradeValue > 0 || auctions > 0) {
        const ratio = this.metricMode === 'VALUE' ? (tradeValue / maxVal) : (auctions / maxAuc);
        if (ratio >= 0.55) tier = 4;
        else if (ratio >= 0.28) tier = 3;
        else if (ratio >= 0.10) tier = 2;
        else tier = 1;
      }

      const filterValue = item ? (item.label || item.key) : loc.name;

      return {
        loc,
        code: loc.code,
        name: loc.name,
        filterValue,
        tradeValue,
        auctions,
        tradeQty,
        isActive: tradeValue > 0 || auctions > 0,
        tier,
        sharePct
      };
    });
  }

  get activeStatesCount(): number {
    return this.stateMetaList.filter(s => s.tradeValue > 0 || s.auctions > 0).length;
  }

  get topState(): StateMapMeta | null {
    const active = this.stateMetaList.filter(s => s.tradeValue > 0);
    if (!active.length) return null;
    return [...active].sort((a, b) => b.tradeValue - a.tradeValue)[0];
  }

  get rankedList(): StateMapMeta[] {
    let list = this.stateMetaList.filter(s => s.tradeValue > 0 || s.auctions > 0);

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.trim().toLowerCase();
      list = list.filter(s => s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q));
    }

    return list.sort((a, b) => {
      if (this.metricMode === 'VALUE') {
        return b.tradeValue - a.tradeValue;
      }
      return b.auctions - a.auctions;
    });
  }

  isStateSelected(s: StateMapMeta): boolean {
    if (!this.activeState) return false;
    const active = this.activeState.trim().toLowerCase();
    return s.code.toLowerCase() === active
      || s.name.toLowerCase() === active
      || s.loc.id.toLowerCase() === active
      || (Boolean(s.filterValue) && s.filterValue.toLowerCase() === active);
  }

  getActiveStateName(): string {
    if (!this.activeState) return '';
    const match = this.stateMetaList.find(s => this.isStateSelected(s));
    return match ? match.name : this.activeState;
  }

  onStateClick(s: StateMapMeta): void {
    if (this.isStateSelected(s)) {
      // Toggle off if clicked again
      this.stateSelect.emit('');
    } else {
      // Emit state name / key (e.g. "Maharashtra", "Madhya Pradesh")
      this.stateSelect.emit(s.filterValue || s.name);
    }
  }

  clearSelection(): void {
    this.stateSelect.emit('');
  }

  onStateEnter(s: StateMapMeta, event: MouseEvent): void {
    this.hoveredState = s;
    this.updateTooltipPos(event);
  }

  onMouseMove(event: MouseEvent): void {
    if (this.hoveredState) {
      this.updateTooltipPos(event);
    }
  }

  private updateTooltipPos(event: MouseEvent): void {
    if (!this.svgRef) return;
    const rect = this.svgRef.nativeElement.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Boundary check so tooltip stays inside visible wrapper
    const tipWidth = 230;
    let posX = x + 15;
    if (posX + tipWidth > rect.width) {
      posX = x - tipWidth - 15;
    }

    this.tooltipX = Math.max(10, posX);
    this.tooltipY = Math.max(10, y - 40);
  }

  clearHover(): void {
    this.hoveredState = null;
  }

  crore(v: number): string {
    return `₹${(Number(v || 0) / 10000000).toFixed(2)} Cr`;
  }
}
