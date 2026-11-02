import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { DashboardApiService } from '../../core/dashboard-api.service';
import { ReportDefinition, SourceStatus } from '../../core/models';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Top Header -->
    <div class="page-head">
      <div>
        <div class="eyebrow">Reusable MIS</div>
        <h1>Report Studio</h1>
        <p>The recurring SQL requests are grouped into reusable, filter-driven business reports.</p>
      </div>
      <div class="head-actions">
        <button type="button" class="refresh-btn" (click)="refreshSources()" [disabled]="refreshing">
          <span class="spin-icon" [class.spinning]="refreshing">↻</span>
          <span>Refresh Data Sources</span>
        </button>
      </div>
    </div>

    <!-- Data Sources Status Grid -->
    <section class="source-grid">
      <article class="source-card card" *ngFor="let s of sources">
        <div class="source-top">
          <div class="source-brand">
            <span class="source-dot" [ngClass]="s.source.toLowerCase()"></span>
            <b>{{ label(s.source) }}</b>
          </div>
          <span class="health-badge" [class.ok]="s.healthy">
            <span class="health-dot"></span>
            {{ s.healthy ? 'Ready & Live' : 'Needs attention' }}
          </span>
        </div>

        <div class="source-metrics">
          <div class="metric-box">
            <span>Auction Rows</span>
            <strong class="tabular-num">{{ s.auctionRows | number }}</strong>
          </div>
          <div class="metric-box">
            <span>Participants</span>
            <strong class="tabular-num">{{ s.participantRows | number }}</strong>
          </div>
        </div>

        <div class="source-foot">
          <small class="source-status-text">
            {{ s.configured ? 'Live database connection' : 'Demo snapshot' }} · {{ s.lastSuccess | date:'short' }}
          </small>
          <p class="error-text" *ngIf="s.lastError">{{ s.lastError }}</p>
        </div>
      </article>
    </section>

    <!-- Report Catalog Grid -->
    <section class="report-grid">
      <article class="report-card card" *ngFor="let r of reports">
        <div class="report-card-top">
          <div class="report-icon">{{ icon(r.id) }}</div>
          <span class="module-tag">{{ r.module }}</span>
        </div>

        <h2>{{ r.title }}</h2>
        <p class="report-desc">{{ r.description }}</p>

        <div class="filter-chips-wrap">
          <span class="suggested-tag" *ngFor="let f of r.suggestedFilters">{{ f }}</span>
        </div>

        <div class="report-card-foot">
          <span class="sensitivity-badge" [class.pii]="r.containsSensitiveParticipantData">
            {{ r.containsSensitiveParticipantData ? '🔒 Internal PII' : '✓ Dashboard-ready' }}
          </span>
          <button type="button" class="btn-open-report" (click)="downloadBaseReport()">
            <span>Open / Export</span>
            <span>↗</span>
          </button>
        </div>
      </article>
    </section>

    <!-- Strategic MIS Architecture Card -->
    <section class="rationale-card card">
      <div class="rationale-head">
        <div class="eyebrow">Design Principle</div>
        <h2>One Unified Engine Instead of Dozens of One-Off SQL Extracts</h2>
      </div>
      <p>
        Most analytical requests differ mainly by client, market code, commodity/contract, date range, state, scheme, side, or financial year. AGRI-ANALYTIX normalizes those dimensions once, keeps a refreshed read-only snapshot in memory, and lets users filter, drill down, and export without repeatedly querying production transaction tables.
      </p>
    </section>
  `,
  styles: [`
    .page-head {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 20px;
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

    .refresh-btn {
      height: 42px;
      border-radius: 12px;
      padding: 0 16px;
      font-weight: 750;
      font-size: 13px;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      border: 1px solid var(--line);
      background: #ffffff;
      color: #334155;
      box-shadow: var(--shadow-sm);
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .refresh-btn:hover {
      background: #f8fafc;
      border-color: #cbd5e1;
    }

    .spin-icon {
      font-size: 16px;
      display: inline-block;
    }

    .spin-icon.spinning {
      animation: spin 1s infinite linear;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    /* Sources Grid */
    .source-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      margin-bottom: 24px;
    }

    .source-card {
      padding: 18px 20px;
    }

    .source-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .source-brand {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .source-brand b {
      font-size: 14px;
      font-weight: 850;
      color: #0f172a;
    }

    .source-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }

    .source-dot.master { background: #0ea5e9; }
    .source-dot.sugar { background: #10b981; }
    .source-dot.ncdfi { background: #f59e0b; }

    .health-badge {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      font-size: 10.5px;
      font-weight: 800;
      border-radius: 999px;
      padding: 3px 9px;
      background: #fef2f2;
      color: #dc2626;
    }

    .health-badge.ok {
      background: #ecfdf5;
      color: #059669;
    }

    .health-dot {
      width: 5px;
      height: 5px;
      border-radius: 50%;
      background: currentColor;
    }

    .source-metrics {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin: 14px 0 12px;
    }

    .metric-box {
      background: #f8fafc;
      border: 1px solid #f1f5f9;
      padding: 10px 12px;
      border-radius: 12px;
    }

    .metric-box span {
      display: block;
      color: #64748b;
      font-size: 10px;
      font-weight: 750;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .metric-box strong {
      display: block;
      font-size: 18px;
      font-weight: 850;
      color: #0f172a;
      margin-top: 2px;
    }

    .source-status-text {
      color: #64748b;
      font-size: 11px;
    }

    .error-text {
      font-size: 11px;
      color: #ef4444;
      margin: 4px 0 0;
    }

    /* Reports Catalog Grid */
    .report-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      margin-bottom: 24px;
    }

    .report-card {
      padding: 20px;
      display: flex;
      flex-direction: column;
    }

    .report-card-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }

    .report-icon {
      width: 40px;
      height: 40px;
      border-radius: 12px;
      background: #eef2ff;
      color: #6366f1;
      display: grid;
      place-items: center;
      font-size: 18px;
    }

    .module-tag {
      text-transform: uppercase;
      color: #6366f1;
      font-size: 10px;
      letter-spacing: 0.6px;
      font-weight: 850;
      background: #f5f3ff;
      padding: 3px 8px;
      border-radius: 6px;
    }

    .report-card h2 {
      font-size: 15.5px;
      font-weight: 850;
      margin: 0 0 6px;
      color: #0f172a;
    }

    .report-desc {
      font-size: 12.5px;
      line-height: 1.55;
      color: #64748b;
      margin: 0;
      min-height: 54px;
    }

    .filter-chips-wrap {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
      margin: 14px 0 16px;
      flex: 1;
    }

    .suggested-tag {
      background: #f1f5f9;
      border-radius: 999px;
      padding: 3px 9px;
      color: #475569;
      font-size: 10.5px;
      font-weight: 650;
    }

    .report-card-foot {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-top: 1px solid #f1f5f9;
      padding-top: 14px;
      gap: 10px;
    }

    .sensitivity-badge {
      font-size: 11px;
      font-weight: 750;
      color: #059669;
      background: #ecfdf5;
      padding: 3px 8px;
      border-radius: 6px;
    }

    .sensitivity-badge.pii {
      color: #d97706;
      background: #fffbeb;
    }

    .btn-open-report {
      border: 0;
      border-radius: 10px;
      background: linear-gradient(135deg, #6366f1, #4f46e5);
      color: #ffffff;
      padding: 8px 14px;
      font-weight: 750;
      font-size: 11.5px;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      cursor: pointer;
      box-shadow: 0 2px 6px rgba(99, 102, 241, 0.25);
      transition: all 0.15s ease;
    }

    .btn-open-report:hover {
      filter: brightness(1.08);
      box-shadow: 0 4px 10px rgba(99, 102, 241, 0.35);
    }

    /* Rationale Card */
    .rationale-card {
      padding: 22px 26px;
      display: grid;
      grid-template-columns: 1fr 2fr;
      gap: 32px;
      align-items: center;
      background: linear-gradient(135deg, #faf5ff, #f0fdf4);
      border: 1px solid #e0e7ff;
    }

    .rationale-head h2 {
      margin: 4px 0 0;
      font-size: 18px;
      font-weight: 850;
      color: #0f172a;
    }

    .rationale-card p {
      color: #475569;
      line-height: 1.65;
      font-size: 13px;
      margin: 0;
    }

    @media (max-width: 1050px) {
      .source-grid { grid-template-columns: repeat(2, 1fr); }
      .report-grid { grid-template-columns: repeat(2, 1fr); }
      .rationale-card { grid-template-columns: 1fr; gap: 14px; }
    }

    @media (max-width: 700px) {
      .source-grid, .report-grid { grid-template-columns: 1fr; }
      .page-head { flex-direction: column; gap: 12px; }
    }
  `]
})
export class ReportsComponent implements OnInit {
  reports: ReportDefinition[] = [];
  sources: SourceStatus[] = [];
  refreshing = false;

  constructor(private api: DashboardApiService) {}

  ngOnInit(): void {
    this.api.reportCatalog().subscribe(x => (this.reports = x));
    this.api.sourceStatus().subscribe(x => (this.sources = x));
  }

  refreshSources(): void {
    this.refreshing = true;
    this.api.refresh().subscribe({
      next: x => {
        this.sources = x;
        this.refreshing = false;
      },
      error: () => {
        this.refreshing = false;
      }
    });
  }

  downloadBaseReport(): void {
    this.api.exportAuction({ source: 'ALL' }).subscribe(blob => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'AGRI-ANALYTIX-auction-report.xlsx';
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  label(source: string): string {
    return source === 'MASTER' ? 'Market / AuctionV2' : source;
  }

  icon(id: string): string {
    const icons: Record<string, string> = {
      'auction-trade-performance': '↗',
      'participant-intelligence': '◎',
      'order-book': '▤',
      'commodity-contract': '◈',
      'client-market': '⌁',
      'nafed-nccf-pss-psf': 'N',
      'scrap-ewaste-hazardous': '♻',
      'bid-load': '⚡',
      'financial-year-comparison': '▥',
      'transaction-mis': '₹'
    };
    return icons[id] || '◫';
  }
}
