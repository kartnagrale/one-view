import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DashboardApiService } from '../../core/dashboard-api.service';
import { AuctionRow, DashboardFilter, FilterOptions, Page, ProjectSource } from '../../core/models';
import { FilterBarComponent } from '../../shared/filter-bar.component';

@Component({
  selector: 'app-auctions',
  standalone: true,
  imports: [CommonModule, FormsModule, FilterBarComponent],
  template: `
    <!-- Page Header -->
    <div class="page-head">
      <div>
        <div class="eyebrow">Operations Explorer</div>
        <h1>Auction Intelligence</h1>
        <p>Search, filter, and drill into AO auction-to-trade outcomes across Market, Sugar, and NCDFI.</p>
      </div>
      <div class="head-actions">
        <button class="export-btn" (click)="download()">
          <span class="icon">↓</span> Export Current View
        </button>
      </div>
    </div>

    <!-- Filter Bar Component (Unified across Dashboard and Auctions) -->
    <app-filter-bar
      [options]="options"
      [filter]="filter"
      (apply)="applyFilter($event)"
      (sourceChanged)="loadOptions($event)" />

    <!-- Table Card -->
    <section class="table-card card">
      <!-- Table Header Tools -->
      <div class="table-tools">
        <div class="tools-left">
          <h2>Auctions Log</h2>
          <span class="records-tag">{{ data.total | number }} Records in Active View</span>
        </div>

        <div class="search-wrap">
          <span class="search-glyph">🔍</span>
          <input
            type="text"
            [(ngModel)]="search"
            (keyup.enter)="load(0)"
            placeholder="Search auction, organisation, commodity..." />
          <button type="button" class="btn-search" (click)="load(0)">Search</button>
        </div>
      </div>

      <!-- Scrollable Table -->
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Auction ID & Contract</th>
              <th>Mode</th>
              <th>Client / Organisation</th>
              <th>Market</th>
              <th>Commodity</th>
              <th>State / Warehouse</th>
              <th class="num">Auction Qty</th>
              <th class="num">Bidders</th>
              <th class="num">Trade Price</th>
              <th class="num">Trade Value</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let r of data.items">
              <td>
                <div class="date-cell">
                  <b>{{ r.auctionDate | date:'dd MMM yy' }}</b>
                  <span class="source-badge" [ngClass]="r.source.toLowerCase()">{{ r.source }}</span>
                </div>
              </td>
              <td>
                <div class="auction-cell">
                  <b class="auction-id">{{ r.auctionId }}</b>
                  <small class="contract-code">{{ r.contract }}</small>
                </div>
              </td>
              <td>
                <span class="mode-pill" [class.reverse]="r.auctionMode === 'REVERSE'">
                  {{ r.auctionMode }}
                </span>
              </td>
              <td>
                <div class="org-cell">
                  <b *ngIf="r.globalClient">{{ r.globalClient }}</b>
                  <span [class.sub-org]="!!r.globalClient">{{ r.organization }}</span>
                </div>
              </td>
              <td>
                <span class="market-code-pill">{{ r.market }}</span>
              </td>
              <td>
                <b>{{ r.commodity }}</b>
              </td>
              <td>
                <div class="loc-cell">
                  <span>{{ r.state || '—' }}</span>
                  <small *ngIf="r.warehouse">{{ r.warehouse }}</small>
                </div>
              </td>
              <td class="num tabular-num">
                <b>{{ r.auctionQty | number:'1.0-2' }}</b>
                <span class="unit-label">{{ r.qtyUnit }}</span>
              </td>
              <td class="num tabular-num">
                <span class="bidders-count">{{ r.bidders }}</span>
              </td>
              <td class="num tabular-num font-mono">
                ₹{{ r.tradePrice | number:'1.0-2' }}
              </td>
              <td class="num tabular-num font-mono">
                <b>{{ crore(r.tradeValue) }}</b>
              </td>
              <td>
                <span class="status-pill" [class.ok]="r.status === 'Approved'">
                  <span class="dot"></span>
                  {{ r.status }}
                </span>
              </td>
            </tr>

            <!-- Empty Row -->
            <tr *ngIf="!data.items.length">
              <td colspan="12" class="empty-cell">
                <div class="empty-box">
                  <span class="empty-icon">⚡</span>
                  <h3>No auctions match the selected filters</h3>
                  <p>Try clearing your search query or selecting a different commodity / project.</p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="table-pager">
        <div class="pager-summary">
          Showing <b>{{ showingStart }}</b> to <b>{{ showingEnd }}</b> of <b>{{ data.total | number }}</b> records
          (Page {{ data.page + 1 }} of {{ totalPages }})
        </div>

        <div class="pager-controls">
          <button
            type="button"
            class="pager-btn"
            (click)="load(0)"
            [disabled]="data.page === 0"
            title="First Page">
            «
          </button>
          <button
            type="button"
            class="pager-btn"
            (click)="load(data.page - 1)"
            [disabled]="data.page === 0">
            ← Previous
          </button>

          <span class="page-indicator">
            Page <b>{{ data.page + 1 }}</b> of <b>{{ totalPages }}</b>
          </span>

          <button
            type="button"
            class="pager-btn"
            (click)="load(data.page + 1)"
            [disabled]="(data.page + 1) * data.size >= data.total">
            Next →
          </button>
        </div>
      </div>
    </section>
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

    .export-btn {
      height: 42px;
      border-radius: 12px;
      padding: 0 16px;
      font-weight: 750;
      font-size: 13px;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      border: 0;
      background: linear-gradient(135deg, #0ea5e9, #059669);
      color: #ffffff;
      box-shadow: 0 4px 12px rgba(14, 165, 233, 0.25);
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .export-btn:hover {
      filter: brightness(1.08);
      box-shadow: 0 6px 16px rgba(14, 165, 233, 0.35);
    }

    .table-card {
      margin-top: 18px;
      overflow: hidden;
    }

    .table-tools {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 20px;
      border-bottom: 1px solid var(--line);
      background: #ffffff;
      gap: 14px;
      flex-wrap: wrap;
    }

    .tools-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .tools-left h2 {
      margin: 0;
      font-size: 16px;
      font-weight: 850;
      color: #0f172a;
    }

    .records-tag {
      font-size: 11px;
      font-weight: 750;
      color: #64748b;
      background: #f1f5f9;
      padding: 3px 9px;
      border-radius: 999px;
    }

    .search-wrap {
      display: flex;
      align-items: center;
      position: relative;
    }

    .search-glyph {
      position: absolute;
      left: 12px;
      font-size: 13px;
      color: #94a3b8;
      pointer-events: none;
    }

    .search-wrap input {
      height: 38px;
      width: 280px;
      border: 1px solid #cbd5e1;
      border-right: 0;
      border-radius: 10px 0 0 10px;
      padding: 0 12px 0 34px;
      font-size: 12.5px;
      outline: none;
      transition: all 0.15s ease;
    }

    .search-wrap input:focus {
      border-color: #6366f1;
    }

    .btn-search {
      height: 38px;
      padding: 0 16px;
      border: 1px solid #6366f1;
      background: #6366f1;
      color: #ffffff;
      border-radius: 0 10px 10px 0;
      font-size: 12px;
      font-weight: 800;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .btn-search:hover {
      background: #4f46e5;
    }

    .table-wrap {
      overflow-x: auto;
      background: #ffffff;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
      min-width: 1300px;
    }

    thead th {
      background: #f8fafc;
      padding: 12px 16px;
      font-size: 11px;
      font-weight: 850;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #64748b;
      border-bottom: 1px solid var(--line);
      white-space: nowrap;
    }

    tbody td {
      padding: 13px 16px;
      font-size: 12.5px;
      border-bottom: 1px solid #f1f5f9;
      color: #334155;
      vertical-align: middle;
    }

    tbody tr:hover {
      background: #f8fafc;
    }

    .num {
      text-align: right;
    }

    .tabular-num {
      font-variant-numeric: tabular-nums;
    }

    .font-mono {
      font-family: var(--font-mono);
    }

    .date-cell {
      display: flex;
      flex-direction: column;
      gap: 3px;
    }

    .date-cell b {
      color: #0f172a;
      font-size: 12.5px;
    }

    .source-badge {
      display: inline-block;
      align-self: flex-start;
      font-size: 9px;
      font-weight: 850;
      text-transform: uppercase;
      padding: 2px 6px;
      border-radius: 5px;
    }

    .source-badge.master { background: #e0f2fe; color: #0369a1; }
    .source-badge.sugar { background: #dcfce7; color: #15803d; }
    .source-badge.ncdfi { background: #fef3c7; color: #b45309; }

    .auction-cell {
      display: flex;
      flex-direction: column;
    }

    .auction-id {
      font-family: var(--font-mono);
      color: #0f172a;
      font-size: 12.5px;
    }

    .contract-code {
      font-size: 11px;
      color: #64748b;
    }

    .mode-pill {
      display: inline-block;
      font-size: 10px;
      font-weight: 850;
      text-transform: uppercase;
      padding: 3px 8px;
      border-radius: 999px;
      background: #ecfdf5;
      color: #059669;
    }

    .mode-pill.reverse {
      background: #fffbeb;
      color: #d97706;
    }

    .org-cell {
      display: flex;
      flex-direction: column;
      max-width: 220px;
    }

    .org-cell b {
      color: #0f172a;
      font-size: 12.5px;
    }

    .sub-org {
      font-size: 11px;
      color: #64748b;
    }

    .market-code-pill {
      font-family: var(--font-mono);
      font-size: 11px;
      font-weight: 750;
      color: #6366f1;
      background: #eef2ff;
      padding: 3px 7px;
      border-radius: 6px;
    }

    .loc-cell {
      display: flex;
      flex-direction: column;
    }

    .loc-cell small {
      font-size: 10.5px;
      color: #64748b;
    }

    .unit-label {
      display: block;
      font-size: 10px;
      color: #64748b;
    }

    .bidders-count {
      display: inline-block;
      font-weight: 750;
      background: #f1f5f9;
      padding: 2px 7px;
      border-radius: 6px;
      font-size: 11.5px;
    }

    .status-pill {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      font-size: 11px;
      font-weight: 800;
      padding: 3px 8px;
      border-radius: 999px;
      background: #f1f5f9;
      color: #64748b;
    }

    .status-pill.ok {
      background: #ecfdf5;
      color: #059669;
    }

    .status-pill .dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: currentColor;
    }

    .empty-cell {
      text-align: center;
      padding: 48px 16px !important;
    }

    .empty-box {
      max-width: 380px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
    }

    .empty-icon {
      font-size: 36px;
      margin-bottom: 4px;
    }

    .empty-box h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 850;
      color: #0f172a;
    }

    .empty-box p {
      margin: 0;
      font-size: 12.5px;
      color: #64748b;
    }

    .table-pager {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 14px 20px;
      background: #ffffff;
      border-top: 1px solid var(--line);
      gap: 12px;
      flex-wrap: wrap;
    }

    .pager-summary {
      font-size: 12px;
      color: #64748b;
    }

    .pager-summary b {
      color: #0f172a;
    }

    .pager-controls {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .pager-btn {
      height: 34px;
      padding: 0 12px;
      border-radius: 8px;
      border: 1px solid #cbd5e1;
      background: #ffffff;
      color: #334155;
      font-size: 12px;
      font-weight: 750;
      cursor: pointer;
      transition: all 0.12s ease;
    }

    .pager-btn:hover:not(:disabled) {
      background: #f1f5f9;
      border-color: #94a3b8;
    }

    .pager-btn:disabled {
      opacity: 0.45;
      cursor: not-allowed;
    }

    .page-indicator {
      font-size: 12px;
      color: #64748b;
      padding: 0 6px;
    }

    .page-indicator b {
      color: #0f172a;
    }

    @media (max-width: 800px) {
      .page-head {
        flex-direction: column;
        gap: 12px;
      }
      .table-tools {
        flex-direction: column;
        align-items: stretch;
      }
      .search-wrap input {
        width: 100%;
      }
      .table-pager {
        flex-direction: column;
        align-items: center;
      }
    }
  `]
})
export class AuctionsComponent implements OnInit {
  filter: DashboardFilter = { source: 'ALL' };
  options: FilterOptions = this.emptyOptions();
  data: Page<AuctionRow> = { items: [], total: 0, page: 0, size: 25 };
  search = '';

  constructor(public api: DashboardApiService) {}

  ngOnInit(): void {
    this.loadOptions('ALL');
    this.load(0);
  }

  loadOptions(source: ProjectSource): void {
    this.api.filters(source).subscribe(x => (this.options = x));
  }

  applyFilter(f: DashboardFilter): void {
    this.filter = { ...f };
    this.load(0);
  }

  load(page: number): void {
    if (page < 0) return;
    this.api.auctions(this.filter, this.search, page, 25).subscribe(x => (this.data = x));
  }

  download(): void {
    this.api.exportAuction(this.filter).subscribe(blob => {
      const u = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = u;
      a.download = 'AGRI-ANALYTIX-auctions.xlsx';
      a.click();
      URL.revokeObjectURL(u);
    });
  }

  crore(v: number): string {
    return `₹${(Number(v || 0) / 10000000).toFixed(2)} Cr`;
  }

  get totalPages(): number {
    if (!this.data.total || this.data.size <= 0) return 1;
    return Math.ceil(this.data.total / this.data.size);
  }

  get showingStart(): number {
    if (!this.data.total) return 0;
    return this.data.page * this.data.size + 1;
  }

  get showingEnd(): number {
    return Math.min((this.data.page + 1) * this.data.size, this.data.total);
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
