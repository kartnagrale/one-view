import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/auth.service';
import { DashboardApiService } from '../../core/dashboard-api.service';
import { MarketMapping, ProjectSource } from '../../core/models';

@Component({
  selector: 'app-mappings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- Page Header -->
    <div class="page-head">
      <div>
        <div class="eyebrow">MarketWatch Configuration</div>
        <h1>Data Mapping Console</h1>
        <p>Maintain business dimensions and entity relationships to enrich analytics without touching transactional tables.</p>
      </div>
      <button class="new-btn" (click)="newMapping()" [disabled]="!canEdit">
        <span class="icon">+</span> New mapping
      </button>
    </div>

    <!-- Business Precedence Notice -->
    <section class="callout">
      <div class="callout-icon">💡</div>
      <div class="callout-content">
        <b>Mapping Precedence Architecture</b>
        <span><code>Project + Market Code</code> establishes base enrichment. <code>Commodity Code</code> and <code>Contract</code> are optional granular refinements. The most specific active mapping wins during auction processing.</span>
      </div>
    </section>

    <!-- Main Mappings Table Card -->
    <section class="card table-card">
      <div class="table-tools">
        <div class="tools-info">
          <h2>Configuration Registry</h2>
          <span class="count-pill">{{ mappings.length }} registered rules</span>
        </div>
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input [(ngModel)]="search" placeholder="Search client, market, commodity, contract..." />
        </div>
      </div>

      <!-- Table or Empty State -->
      <div class="table-wrap" *ngIf="filtered().length; else emptyState">
        <table>
          <thead>
            <tr>
              <th>Project</th>
              <th>Global Client</th>
              <th>Market Code</th>
              <th>Commodity</th>
              <th>Display Name</th>
              <th>Contract</th>
              <th>State / Warehouse</th>
              <th>Status</th>
              <th>Updated</th>
              <th class="actions-th">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let m of filtered()">
              <td>
                <span class="source-badge" [attr.data-source]="m.source">
                  {{ sourceLabel(m.source) }}
                </span>
              </td>
              <td>
                <b class="client-name">{{ m.globalClient }}</b>
              </td>
              <td>
                <span class="code-tag">{{ m.marketCode }}</span>
              </td>
              <td>
                <span [class.muted-txt]="!m.commodityCode">{{ m.commodityCode || 'Any' }}</span>
              </td>
              <td>
                <b>{{ m.commodityDisplayName || '—' }}</b>
              </td>
              <td>
                <span [class.muted-txt]="!m.contractCode">{{ m.contractCode || 'Any' }}</span>
              </td>
              <td>
                <b>{{ m.state || '—' }}</b>
                <small class="wh-sub">{{ m.warehouse || m.location || '—' }}</small>
              </td>
              <td>
                <span class="status-pill" [class.active]="m.active">
                  <span class="status-dot"></span>
                  {{ m.active ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td>
                <div class="audit-meta">
                  <span>{{ m.updatedBy || 'System' }}</span>
                  <small>{{ m.updatedAt | date:'mediumDate' }}</small>
                </div>
              </td>
              <td class="row-actions">
                <button class="btn-edit" (click)="edit(m)" [disabled]="!canEdit" title="Edit mapping">Edit</button>
                <button class="btn-del" (click)="remove(m)" [disabled]="!canEdit" title="Delete mapping">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Empty State Template -->
      <ng-template #emptyState>
        <div class="empty-container">
          <div class="empty-art">🗺️</div>
          <h3>No configuration mappings found</h3>
          <p>{{ search ? 'No mappings match your search query "' + search + '".' : 'MarketWatch mappings connect client and commodity codes to standardized enterprise entities.' }}</p>
          <button class="btn-create-empty" (click)="newMapping()" [disabled]="!canEdit" *ngIf="!search">
            + Create First Mapping
          </button>
        </div>
      </ng-template>
    </section>

    <!-- Slide-Over Drawer for Create / Edit (Prevents table crushing) -->
    <div class="drawer-backdrop" *ngIf="editing" (click)="editing = null">
      <div class="drawer-panel" (click)="$event.stopPropagation()">
        <div class="drawer-head">
          <div>
            <span class="drawer-eyebrow">{{ editing.id ? 'EDIT RULE #' + editing.id : 'NEW CONFIGURATION' }}</span>
            <h2>{{ editing.id ? 'Edit Mapping Rule' : 'Create Mapping Rule' }}</h2>
            <p>Define enterprise dimension enrichment for auction records</p>
          </div>
          <button class="close-btn" (click)="editing = null" aria-label="Close">×</button>
        </div>

        <div class="drawer-body">
          <!-- Fieldset 1: Source & Core -->
          <div class="form-section">
            <h4 class="section-title">1. Project & Core Identifiers</h4>
            <div class="field-row">
              <label>
                <span>Target Project *</span>
                <select [(ngModel)]="editing.source">
                  <option value="MASTER">Market (AuctionV2)</option>
                  <option value="SUGAR">Sugar (SpotLite)</option>
                  <option value="NCDFI">NCDFI (SpotLite)</option>
                </select>
              </label>
              <label>
                <span>Global Client *</span>
                <input [(ngModel)]="editing.globalClient" placeholder="e.g. NAFED / NCCF / BHEL" />
              </label>
            </div>
            <label class="full-field">
              <span>Market Code *</span>
              <input [(ngModel)]="editing.marketCode" placeholder="e.g. NFUP, NCCS, APOL" />
            </label>
          </div>

          <!-- Fieldset 2: Commodity Refinements -->
          <div class="form-section">
            <h4 class="section-title">2. Commodity & Contract Refinements</h4>
            <div class="field-row">
              <label>
                <span>Commodity Code</span>
                <input [(ngModel)]="editing.commodityCode" placeholder="e.g. JOWARKRAM" />
              </label>
              <label>
                <span>Display Commodity Name</span>
                <input [(ngModel)]="editing.commodityDisplayName" placeholder="e.g. Jowar - Kharif" />
              </label>
            </div>
            <label class="full-field">
              <span>Contract Code</span>
              <input [(ngModel)]="editing.contractCode" placeholder="Optional specific contract filter" />
            </label>
          </div>

          <!-- Fieldset 3: Location & Logistics -->
          <div class="form-section">
            <h4 class="section-title">3. Logistics & Location</h4>
            <div class="field-row three-col">
              <label>
                <span>State</span>
                <input [(ngModel)]="editing.state" placeholder="e.g. MH, MP" />
              </label>
              <label>
                <span>Location</span>
                <input [(ngModel)]="editing.location" placeholder="e.g. Nagpur" />
              </label>
              <label>
                <span>Warehouse</span>
                <input [(ngModel)]="editing.warehouse" placeholder="e.g. Central WH" />
              </label>
            </div>
          </div>

          <!-- Fieldset 4: Metadata & Active Status -->
          <div class="form-section">
            <h4 class="section-title">4. Governance & Status</h4>
            <label class="full-field">
              <span>Business Notes / Rationale</span>
              <input [(ngModel)]="editing.notes" placeholder="Business context, ticket reference or ownership" />
            </label>

            <div class="toggle-card">
              <div>
                <b>Active Status</b>
                <p>When active, this rule immediately influences dashboard metric grouping.</p>
              </div>
              <label class="switch">
                <input type="checkbox" [(ngModel)]="editing.active" />
                <span class="slider"></span>
              </label>
            </div>
          </div>
        </div>

        <!-- Sticky Drawer Footer -->
        <div class="drawer-foot">
          <button class="btn-cancel" (click)="editing = null">Cancel</button>
          <button class="btn-save" (click)="save()" [disabled]="!valid()">
            {{ editing.id ? 'Update Mapping' : 'Create Mapping' }}
          </button>
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

    .new-btn {
      height: 42px;
      border-radius: 12px;
      padding: 0 18px;
      font-weight: 750;
      font-size: 13px;
      background: #6366f1;
      color: #ffffff;
      box-shadow: 0 4px 14px rgba(99, 102, 241, 0.3);
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }

    .new-btn:hover {
      background: #4f46e5;
    }

    .new-btn:disabled {
      opacity: 0.45;
      cursor: not-allowed;
    }

    .callout {
      display: flex;
      gap: 14px;
      align-items: flex-start;
      padding: 16px 18px;
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      border-radius: 14px;
      margin-bottom: 18px;
      font-size: 13px;
      color: #166534;
      line-height: 1.5;
    }

    .callout-icon {
      font-size: 20px;
    }

    .callout b {
      display: block;
      color: #15803d;
      margin-bottom: 2px;
    }

    .callout code {
      background: rgba(255, 255, 255, 0.7);
      border: 1px solid #86efac;
      padding: 2px 6px;
      border-radius: 6px;
      font-family: var(--font-mono);
      font-size: 11px;
    }

    /* Table Card */
    .table-card {
      border: 1px solid var(--line);
      border-radius: 18px;
      background: #ffffff;
      overflow: hidden;
      box-shadow: var(--shadow);
    }

    .table-tools {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 18px 22px;
      border-bottom: 1px solid var(--line);
      flex-wrap: wrap;
      gap: 12px;
    }

    .tools-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .tools-info h2 {
      font-size: 17px;
      font-weight: 800;
      margin: 0;
      color: var(--text);
    }

    .count-pill {
      font-size: 11px;
      font-weight: 750;
      background: #f1f5f9;
      color: #475569;
      padding: 4px 10px;
      border-radius: 999px;
    }

    .search-box {
      display: flex;
      align-items: center;
      gap: 8px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 0 12px;
      width: 320px;
    }

    .search-box input {
      border: 0;
      background: transparent;
      outline: none;
      height: 38px;
      width: 100%;
      font-size: 13px;
      color: #0f172a;
    }

    .search-icon {
      font-size: 13px;
      color: #94a3b8;
    }

    .table-wrap {
      overflow-x: auto;
      width: 100%;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
    }

    th {
      background: #f8fafc;
      padding: 12px 16px;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #64748b;
      font-weight: 800;
      border-bottom: 1px solid var(--line);
      white-space: nowrap;
    }

    td {
      padding: 14px 16px;
      font-size: 13px;
      border-bottom: 1px solid #f1f5f9;
      color: #1e293b;
      vertical-align: middle;
    }

    tr:hover td {
      background: #fafafa;
    }

    .source-badge {
      display: inline-flex;
      padding: 3px 8px;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 800;
    }

    .source-badge[data-source="MASTER"] {
      background: #eef2ff;
      color: #4f46e5;
    }

    .source-badge[data-source="SUGAR"] {
      background: #ecfdf5;
      color: #059669;
    }

    .source-badge[data-source="NCDFI"] {
      background: #eff6ff;
      color: #2563eb;
    }

    .client-name {
      color: #0f172a;
      font-weight: 750;
    }

    .code-tag {
      display: inline-block;
      padding: 3px 7px;
      border-radius: 6px;
      background: #f1f5f9;
      color: #334155;
      font-family: var(--font-mono);
      font-size: 11px;
      font-weight: 700;
    }

    .muted-txt {
      color: #94a3b8;
    }

    .wh-sub {
      display: block;
      color: #64748b;
      font-size: 11px;
      margin-top: 2px;
    }

    .status-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 3px 9px;
      border-radius: 999px;
      font-size: 11px;
      font-weight: 750;
      background: #f1f5f9;
      color: #64748b;
    }

    .status-pill.active {
      background: #ecfdf5;
      color: #059669;
    }

    .status-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: currentColor;
    }

    .audit-meta span {
      display: block;
      font-size: 12px;
      color: #334155;
    }

    .audit-meta small {
      font-size: 10px;
      color: #94a3b8;
    }

    .actions-th {
      text-align: right;
    }

    .row-actions {
      text-align: right;
      white-space: nowrap;
    }

    .btn-edit, .btn-del {
      border: 0;
      background: transparent;
      padding: 5px 9px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 750;
      margin-left: 4px;
    }

    .btn-edit {
      color: #6366f1;
      background: #f5f3ff;
    }

    .btn-edit:hover {
      background: #ede9fe;
    }

    .btn-del {
      color: #ef4444;
      background: #fef2f2;
    }

    .btn-del:hover {
      background: #fee2e2;
    }

    /* Empty State */
    .empty-container {
      padding: 60px 20px;
      text-align: center;
      color: #64748b;
    }

    .empty-art {
      font-size: 42px;
      margin-bottom: 12px;
    }

    .empty-container h3 {
      font-size: 17px;
      font-weight: 800;
      color: #0f172a;
      margin: 0 0 6px;
    }

    .empty-container p {
      font-size: 13px;
      max-width: 480px;
      margin: 0 auto 18px;
      line-height: 1.5;
    }

    .btn-create-empty {
      background: #6366f1;
      color: #ffffff;
      padding: 10px 20px;
      border-radius: 10px;
      font-weight: 800;
      font-size: 13px;
    }

    /* Slide-Over Drawer */
    .drawer-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.45);
      backdrop-filter: blur(4px);
      -webkit-backdrop-filter: blur(4px);
      z-index: 100;
      display: flex;
      justify-content: flex-end;
      animation: fadeIn 0.2s ease-out;
    }

    .drawer-panel {
      width: min(520px, 100vw);
      height: 100%;
      background: #ffffff;
      box-shadow: -10px 0 35px rgba(0, 0, 0, 0.15);
      display: flex;
      flex-direction: column;
      animation: slideInRight 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }

    @keyframes slideInRight {
      from { transform: translateX(100%); }
      to { transform: translateX(0); }
    }

    .drawer-head {
      padding: 24px 28px;
      border-bottom: 1px solid var(--line);
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }

    .drawer-eyebrow {
      font-size: 10px;
      font-weight: 850;
      color: #6366f1;
      letter-spacing: 0.8px;
      text-transform: uppercase;
    }

    .drawer-head h2 {
      margin: 4px 0 2px;
      font-size: 20px;
      font-weight: 850;
      color: #0f172a;
    }

    .drawer-head p {
      margin: 0;
      font-size: 12px;
      color: #64748b;
    }

    .close-btn {
      width: 34px;
      height: 34px;
      border-radius: 10px;
      background: #f1f5f9;
      color: #475569;
      font-size: 20px;
      display: grid;
      place-items: center;
      line-height: 1;
    }

    .close-btn:hover {
      background: #e2e8f0;
      color: #0f172a;
    }

    .drawer-body {
      flex: 1;
      overflow-y: auto;
      padding: 24px 28px;
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .form-section {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .section-title {
      margin: 0;
      font-size: 12px;
      text-transform: uppercase;
      font-weight: 850;
      color: #475569;
      letter-spacing: 0.5px;
      padding-bottom: 6px;
      border-bottom: 1px solid #f1f5f9;
    }

    .field-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }

    .field-row.three-col {
      grid-template-columns: 1fr 1fr 1fr;
    }

    label {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    label span {
      font-size: 11px;
      font-weight: 750;
      color: #475569;
      letter-spacing: 0.3px;
    }

    input, select {
      height: 42px;
      border: 1px solid #cbd5e1;
      border-radius: 10px;
      padding: 0 12px;
      font-size: 13px;
      color: #0f172a;
      outline: none;
      transition: all 0.15s ease;
      background: #ffffff;
    }

    input:focus, select:focus {
      border-color: #6366f1;
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
    }

    .full-field {
      grid-column: 1 / -1;
    }

    .toggle-card {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 14px 16px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
    }

    .toggle-card b {
      display: block;
      font-size: 13px;
      color: #1e293b;
    }

    .toggle-card p {
      margin: 2px 0 0;
      font-size: 11px;
      color: #64748b;
    }

    /* Switch toggle */
    .switch {
      position: relative;
      display: inline-block;
      width: 44px;
      height: 24px;
    }

    .switch input {
      opacity: 0;
      width: 0;
      height: 0;
    }

    .slider {
      position: absolute;
      cursor: pointer;
      inset: 0;
      background-color: #cbd5e1;
      transition: 0.2s;
      border-radius: 24px;
    }

    .slider:before {
      position: absolute;
      content: "";
      height: 18px;
      width: 18px;
      left: 3px;
      bottom: 3px;
      background-color: white;
      transition: 0.2s;
      border-radius: 50%;
    }

    input:checked + .slider {
      background-color: #10b981;
    }

    input:checked + .slider:before {
      transform: translateX(20px);
    }

    .drawer-foot {
      padding: 20px 28px;
      border-top: 1px solid var(--line);
      background: #f8fafc;
      display: flex;
      justify-content: flex-end;
      gap: 12px;
    }

    .btn-cancel {
      height: 42px;
      border: 1px solid #cbd5e1;
      background: #ffffff;
      color: #475569;
      padding: 0 16px;
      border-radius: 10px;
      font-weight: 750;
      font-size: 13px;
    }

    .btn-save {
      height: 42px;
      background: #6366f1;
      color: #ffffff;
      padding: 0 20px;
      border-radius: 10px;
      font-weight: 800;
      font-size: 13px;
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.25);
    }

    .btn-save:disabled {
      opacity: 0.45;
      cursor: not-allowed;
    }

    @media (max-width: 768px) {
      .field-row, .field-row.three-col {
        grid-template-columns: 1fr;
      }
      .page-head {
        flex-direction: column;
        gap: 12px;
      }
      .search-box {
        width: 100%;
      }
    }
  `]
})
export class MappingsComponent implements OnInit {
  mappings: MarketMapping[] = [];
  editing: MarketMapping | null = null;
  search = '';
  canEdit = false;

  constructor(private api: DashboardApiService, private auth: AuthService) {}

  ngOnInit(): void {
    this.canEdit = this.auth.hasRole('MARKETWATCH');
    this.load();
  }

  load(): void {
    this.api.mappings().subscribe(x => (this.mappings = x));
  }

  newMapping(): void {
    this.editing = {
      source: 'MASTER',
      globalClient: '',
      marketCode: '',
      active: true
    };
  }

  edit(m: MarketMapping): void {
    this.editing = { ...m };
  }

  valid(): boolean {
    return !!this.editing?.globalClient?.trim() && !!this.editing?.marketCode?.trim();
  }

  save(): void {
    if (!this.editing || !this.valid()) return;
    const req = this.editing.id
      ? this.api.updateMapping(this.editing)
      : this.api.createMapping(this.editing);
    req.subscribe(() => {
      this.editing = null;
      this.load();
    });
  }

  remove(m: MarketMapping): void {
    if (m.id == null || !confirm(`Delete mapping for ${m.globalClient} / ${m.marketCode}?`)) return;
    this.api.deleteMapping(m.id).subscribe(() => this.load());
  }

  filtered(): MarketMapping[] {
    const q = this.search.toLowerCase().trim();
    if (!q) return this.mappings;
    return this.mappings.filter(m =>
      [m.globalClient, m.marketCode, m.commodityCode, m.commodityDisplayName, m.contractCode, m.state, m.warehouse]
        .some(v => (v || '').toLowerCase().includes(q))
    );
  }

  sourceLabel(src: ProjectSource): string {
    switch (src) {
      case 'MASTER': return 'Market';
      case 'SUGAR': return 'Sugar';
      case 'NCDFI': return 'NCDFI';
      default: return src;
    }
  }
}
