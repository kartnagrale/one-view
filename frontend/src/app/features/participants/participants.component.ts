import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DashboardApiService } from '../../core/dashboard-api.service';
import { DashboardFilter, FilterOptions, Page, ParticipantRow, ProjectSource } from '../../core/models';
import { SearchableSelectComponent } from '../../shared/searchable-select.component';

@Component({
  selector: 'app-participants',
  standalone: true,
  imports: [CommonModule, FormsModule, SearchableSelectComponent],
  template: `
    <!-- Top Header -->
    <div class="page-head">
      <div>
        <div class="eyebrow">Participant Intelligence</div>
        <h1>Registered & Participating Organisations</h1>
        <p>Market mappings, verified membership, and real transacting participation across Market, Sugar, and NCDFI.</p>
      </div>
      <div class="head-actions">
        <button type="button" class="refresh-btn" (click)="load(data.page)" [disabled]="loading">
          <span class="spin-icon" [class.spinning]="loading">↻</span>
          <span>Refresh Directory</span>
        </button>
      </div>
    </div>

    <!-- Security & Governance Notice Banner -->
    <div class="notice-card">
      <div class="notice-icon">🛡️</div>
      <div class="notice-body">
        <b>Authenticated Internal Directory View</b>
        <p>Mobile, email, GST, and PAN attributes are restricted to verified internal analysts. In production, this directory is secured through NeML Single Sign-On (SSO) and Active Directory.</p>
      </div>
    </div>

    <!-- Modern Filter Bar matching Dashboard UI -->
    <section class="filter-card card">
      <!-- Row 1: Segmented Project Selector -->
      <div class="filter-head">
        <div class="project-selector-wrap">
          <span class="context-label">PROJECT SOURCE:</span>
          <div class="project-selector">
            <button
              type="button"
              class="proj-btn"
              [class.active]="filter.source === 'ALL'"
              (click)="selectSource('ALL')">
              <span class="dot all-dot"></span> All Projects
            </button>
            <button
              type="button"
              class="proj-btn"
              [class.active]="filter.source === 'MASTER'"
              (click)="selectSource('MASTER')">
              <span class="dot market-dot"></span> Market
            </button>
            <button
              type="button"
              class="proj-btn"
              [class.active]="filter.source === 'SUGAR'"
              (click)="selectSource('SUGAR')">
              <span class="dot sugar-dot"></span> Sugar
            </button>
            <button
              type="button"
              class="proj-btn"
              [class.active]="filter.source === 'NCDFI'"
              (click)="selectSource('NCDFI')">
              <span class="dot ncdfi-dot"></span> NCDFI
            </button>
          </div>
        </div>

        <div class="head-right-actions">
          <span class="results-badge" *ngIf="!loading">
            <b>{{ data.total | number }}</b> matching organisations
          </span>
        </div>
      </div>

      <!-- Active Filter Chips Row -->
      <div class="active-chips-bar" *ngIf="activeFilterCount > 0">
        <span class="active-label">FILTERED BY:</span>
        <div class="chips-list">
          <span class="filter-chip" *ngIf="filter.source && filter.source !== 'ALL'">
            <span class="chip-key">Project:</span>
            <strong class="chip-val">{{ filter.source }}</strong>
            <button type="button" class="chip-remove" (click)="removeFilter('source')">×</button>
          </span>

          <span class="filter-chip" *ngIf="filter.globalClient">
            <span class="chip-key">Client:</span>
            <strong class="chip-val">{{ filter.globalClient }}</strong>
            <button type="button" class="chip-remove" (click)="removeFilter('globalClient')">×</button>
          </span>

          <span class="filter-chip" *ngIf="filter.marketCode">
            <span class="chip-key">Market:</span>
            <strong class="chip-val">{{ filter.marketCode }}</strong>
            <button type="button" class="chip-remove" (click)="removeFilter('marketCode')">×</button>
          </span>

          <span class="filter-chip" *ngIf="filter.state">
            <span class="chip-key">State:</span>
            <strong class="chip-val">{{ filter.state }}</strong>
            <button type="button" class="chip-remove" (click)="removeFilter('state')">×</button>
          </span>

          <span class="filter-chip" *ngIf="search">
            <span class="chip-key">Keyword:</span>
            <strong class="chip-val">{{ search }}</strong>
            <button type="button" class="chip-remove" (click)="removeFilter('search')">×</button>
          </span>

          <button type="button" class="btn-clear-all" (click)="clearFilters()">
            Clear All
          </button>
        </div>
      </div>

      <!-- Filter Controls Grid -->
      <div class="filter-grid">
        <!-- 1. Global Client (Searchable Select) -->
        <div class="field-item">
          <app-searchable-select
            label="GLOBAL CLIENT"
            allLabel="All Clients"
            [options]="options.globalClients"
            [value]="filter.globalClient || ''"
            (valueChange)="onClientChange($event)">
          </app-searchable-select>
        </div>

        <!-- 2. Market Code (Searchable Select) -->
        <div class="field-item">
          <app-searchable-select
            label="MARKET CODE"
            allLabel="All Markets"
            [options]="options.markets"
            [value]="filter.marketCode || ''"
            (valueChange)="onMarketChange($event)">
          </app-searchable-select>
        </div>

        <!-- 3. State (Searchable Select) -->
        <div class="field-item">
          <app-searchable-select
            label="STATE"
            allLabel="All States"
            [options]="options.states"
            [value]="filter.state || ''"
            (valueChange)="onStateChange($event)">
          </app-searchable-select>
        </div>

        <!-- 4. Text Search Input -->
        <div class="field-item search-field">
          <label class="field-label">SEARCH NAME OR ID</label>
          <div class="search-input-wrap">
            <span class="search-glyph">🔍</span>
            <input
              type="text"
              class="search-input"
              [(ngModel)]="search"
              (keyup.enter)="load(0)"
              placeholder="Search Organisation / Org ID..." />
            <button
              type="button"
              class="clear-input-btn"
              *ngIf="search"
              (click)="search = ''; load(0)">
              ×
            </button>
          </div>
        </div>
      </div>

      <!-- Filter Footer Actions -->
      <div class="filter-foot">
        <div class="foot-left">
          <span class="tip-text">Press <b>Enter</b> or click <b>Apply Filters</b> to query matching participants</span>
        </div>
        <div class="foot-right">
          <button type="button" class="btn-reset" (click)="clearFilters()">
            <span>↻</span> Reset
          </button>
          <button type="button" class="btn-apply" (click)="load(0)">
            <span>✓</span> Apply Filters
          </button>
        </div>
      </div>
    </section>

    <!-- KPI Summary Grid -->
    <div class="kpi-grid">
      <article class="kpi-card card">
        <div class="kpi-icon blue-bg">👥</div>
        <div class="kpi-info">
          <span class="kpi-title">TOTAL MATCHING</span>
          <strong class="kpi-num tabular-num">{{ data.total | number }}</strong>
          <span class="kpi-sub">Organisations registered</span>
        </div>
      </article>

      <article class="kpi-card card">
        <div class="kpi-icon emerald-bg">⚡</div>
        <div class="kpi-info">
          <span class="kpi-title">ACTIVE ON CURRENT PAGE</span>
          <strong class="kpi-num tabular-num">{{ participatedOnPageCount }}</strong>
          <span class="kpi-sub">Transacted in auctions</span>
        </div>
      </article>

      <article class="kpi-card card">
        <div class="kpi-icon indigo-bg">🏢</div>
        <div class="kpi-info">
          <span class="kpi-title">ACTIVE PROJECT</span>
          <strong class="kpi-num text-source">{{ filter.source === 'ALL' ? 'Combined (3)' : filter.source }}</strong>
          <span class="kpi-sub">Data source scope</span>
        </div>
      </article>

      <article class="kpi-card card">
        <div class="kpi-icon purple-bg">📑</div>
        <div class="kpi-info">
          <span class="kpi-title">PAGE POSITION</span>
          <strong class="kpi-num tabular-num">{{ data.page + 1 }} / {{ totalPages }}</strong>
          <span class="kpi-sub">{{ pageSize }} records per page</span>
        </div>
      </article>
    </div>

    <!-- Data Table Section -->
    <section class="table-card card">
      <!-- Table Tools Bar -->
      <div class="table-tools">
        <div class="tools-left">
          <h2>Participant Directory</h2>
          <span class="records-tag">{{ data.total | number }} Total Records</span>
        </div>

        <div class="tools-right">
          <label class="page-size-selector">
            <span>Rows per page:</span>
            <select [ngModel]="pageSize" (ngModelChange)="onPageSizeChange($event)">
              <option [ngValue]="25">25</option>
              <option [ngValue]="50">50</option>
              <option [ngValue]="100">100</option>
            </select>
          </label>
        </div>
      </div>

      <!-- Scrollable Table Container -->
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Org ID</th>
              <th>Organisation & Project</th>
              <th>State & District</th>
              <th>Markets</th>
              <th>Participation</th>
              <th>Mobile</th>
              <th>Email</th>
              <th>GST</th>
              <th>PAN</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let r of data.items">
              <td>
                <span class="org-id-pill">{{ r.orgId }}</span>
              </td>
              <td>
                <div class="org-name-cell">
                  <b>{{ r.orgName }}</b>
                  <span class="source-badge" [ngClass]="r.source.toLowerCase()">
                    {{ r.source }}
                  </span>
                </div>
              </td>
              <td>
                <div class="location-cell">
                  <span class="state-val">{{ r.state || '—' }}</span>
                  <small class="district-val" *ngIf="r.district">{{ r.district }}</small>
                </div>
              </td>
              <td>
                <span class="market-count-pill" [class.has-markets]="r.marketCount > 0">
                  {{ r.marketCount }} {{ r.marketCount === 1 ? 'market' : 'markets' }}
                </span>
              </td>
              <td>
                <span class="status-badge" [class.participated]="r.participated">
                  <span class="status-dot"></span>
                  {{ r.participated ? 'Participated' : 'Registered only' }}
                </span>
              </td>
              <td class="tabular-num text-secondary">
                {{ r.mobile || '—' }}
              </td>
              <td class="text-secondary email-cell" [title]="r.email">
                {{ r.email || '—' }}
              </td>
              <td class="tabular-num text-secondary">
                {{ r.gst || '—' }}
              </td>
              <td class="tabular-num text-secondary">
                {{ r.pan || '—' }}
              </td>
            </tr>

            <!-- Empty State -->
            <tr *ngIf="!data.items.length && !loading">
              <td colspan="9" class="empty-cell">
                <div class="empty-box">
                  <span class="empty-icon">👥</span>
                  <h3>No matching organisations found</h3>
                  <p>Try adjusting your search query, project source, or client filters.</p>
                  <button type="button" class="btn-empty-reset" (click)="clearFilters()">
                    Reset All Filters
                  </button>
                </div>
              </td>
            </tr>

            <!-- Loading State -->
            <tr *ngIf="loading">
              <td colspan="9" class="empty-cell">
                <div class="empty-box">
                  <span class="spin-icon spinning large">↻</span>
                  <h3>Loading participants...</h3>
                  <p>Fetching records from memory analytics repository.</p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Modern Pagination Bar -->
      <div class="table-pager">
        <div class="pager-summary">
          Showing <b>{{ showingStart }}</b> to <b>{{ showingEnd }}</b> of <b>{{ data.total | number }}</b> organisations
        </div>

        <div class="pager-controls">
          <button
            type="button"
            class="pager-btn"
            (click)="load(0)"
            [disabled]="data.page === 0 || loading"
            title="First Page">
            «
          </button>
          <button
            type="button"
            class="pager-btn"
            (click)="load(data.page - 1)"
            [disabled]="data.page === 0 || loading">
            ← Previous
          </button>

          <span class="page-indicator">
            Page <b>{{ data.page + 1 }}</b> of <b>{{ totalPages }}</b>
          </span>

          <button
            type="button"
            class="pager-btn"
            (click)="load(data.page + 1)"
            [disabled]="(data.page + 1) * pageSize >= data.total || loading">
            Next →
          </button>
          <button
            type="button"
            class="pager-btn"
            (click)="load(totalPages - 1)"
            [disabled]="(data.page + 1) * pageSize >= data.total || loading"
            title="Last Page">
            »
          </button>
        </div>
      </div>
    </section>
  `,
  styles: [`
    /* Header */
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

    .spin-icon.large {
      font-size: 28px;
      color: #6366f1;
      margin-bottom: 8px;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    /* Notice Card */
    .notice-card {
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      border-radius: 14px;
      padding: 12px 18px;
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      gap: 14px;
    }

    .notice-icon {
      font-size: 20px;
      flex-shrink: 0;
    }

    .notice-body b {
      display: block;
      font-size: 13px;
      font-weight: 850;
      color: #166534;
      margin-bottom: 2px;
    }

    .notice-body p {
      margin: 0;
      font-size: 12px;
      color: #15803d;
      line-height: 1.4;
    }

    /* Modern Filter Card */
    .filter-card {
      margin-bottom: 18px;
      padding: 16px 20px;
    }

    .filter-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      flex-wrap: wrap;
      padding-bottom: 14px;
      border-bottom: 1px solid var(--line);
    }

    .project-selector-wrap {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }

    .context-label {
      font-size: 11px;
      font-weight: 850;
      color: var(--muted);
      letter-spacing: 0.6px;
    }

    .project-selector {
      display: inline-flex;
      background: #f1f5f9;
      padding: 4px;
      border-radius: 12px;
      gap: 4px;
    }

    .proj-btn {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      padding: 7px 14px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 750;
      color: #475569;
      background: transparent;
      border: 0;
      cursor: pointer;
      transition: all 0.15s ease;
      white-space: nowrap;
    }

    .proj-btn:hover {
      color: #0f172a;
      background: rgba(255, 255, 255, 0.6);
    }

    .proj-btn.active {
      background: #ffffff;
      color: #0f172a;
      box-shadow: 0 1px 4px rgba(15, 23, 42, 0.08);
      font-weight: 850;
    }

    .dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
    }

    .all-dot { background: #6366f1; }
    .market-dot { background: #0ea5e9; }
    .sugar-dot { background: #10b981; }
    .ncdfi-dot { background: #f59e0b; }

    .results-badge {
      font-size: 12.5px;
      color: #475569;
      background: #f8fafc;
      border: 1px solid var(--line);
      border-radius: 10px;
      padding: 6px 12px;
    }

    .results-badge b {
      color: #0f172a;
    }

    /* Active Filter Chips */
    .active-chips-bar {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 0;
      border-bottom: 1px solid #f1f5f9;
      flex-wrap: wrap;
    }

    .active-label {
      font-size: 10px;
      font-weight: 850;
      color: #64748b;
      letter-spacing: 0.5px;
    }

    .chips-list {
      display: flex;
      align-items: center;
      gap: 6px;
      flex-wrap: wrap;
    }

    .filter-chip {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      background: #eef2ff;
      border: 1px solid #c7d2fe;
      border-radius: 999px;
      padding: 3px 10px 3px 12px;
      font-size: 11px;
      color: #4338ca;
    }

    .chip-key {
      font-weight: 600;
      opacity: 0.8;
    }

    .chip-val {
      font-weight: 800;
    }

    .chip-remove {
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: transparent;
      border: 0;
      color: #6366f1;
      font-size: 14px;
      line-height: 1;
      cursor: pointer;
      display: grid;
      place-items: center;
      padding: 0;
      margin-left: 2px;
    }

    .chip-remove:hover {
      background: #6366f1;
      color: #ffffff;
    }

    .btn-clear-all {
      font-size: 11px;
      font-weight: 750;
      color: #ef4444;
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: 999px;
      padding: 3px 10px;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .btn-clear-all:hover {
      background: #fee2e2;
    }

    /* Filter Controls Grid */
    .filter-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 14px;
      padding-top: 14px;
    }

    .field-item {
      display: flex;
      flex-direction: column;
    }

    .field-label {
      font-size: 10px;
      font-weight: 850;
      text-transform: uppercase;
      letter-spacing: 0.6px;
      color: #64748b;
      margin-bottom: 5px;
    }

    .search-input-wrap {
      position: relative;
      display: flex;
      align-items: center;
    }

    .search-glyph {
      position: absolute;
      left: 11px;
      font-size: 13px;
      color: #94a3b8;
      pointer-events: none;
    }

    .search-input {
      width: 100%;
      height: 40px;
      border: 1px solid #cbd5e1;
      border-radius: 10px;
      padding: 0 32px 0 34px;
      font-size: 12.5px;
      font-weight: 650;
      color: #0f172a;
      background: #ffffff;
      outline: none;
      transition: all 0.15s ease;
    }

    .search-input:focus {
      border-color: #6366f1;
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.12);
    }

    .clear-input-btn {
      position: absolute;
      right: 8px;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      border: 0;
      background: #f1f5f9;
      color: #64748b;
      font-size: 14px;
      display: grid;
      place-items: center;
      cursor: pointer;
      line-height: 1;
    }

    .clear-input-btn:hover {
      background: #e2e8f0;
      color: #0f172a;
    }

    /* Filter Footer */
    .filter-foot {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 14px;
      margin-top: 14px;
      border-top: 1px solid #f1f5f9;
      gap: 12px;
      flex-wrap: wrap;
    }

    .tip-text {
      font-size: 11.5px;
      color: #64748b;
    }

    .tip-text b {
      color: #334155;
    }

    .foot-right {
      display: flex;
      gap: 8px;
    }

    .btn-reset {
      height: 38px;
      padding: 0 14px;
      border-radius: 10px;
      border: 1px solid var(--line);
      background: #ffffff;
      color: #475569;
      font-size: 12px;
      font-weight: 750;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .btn-reset:hover {
      background: #f8fafc;
      border-color: #cbd5e1;
    }

    .btn-apply {
      height: 38px;
      padding: 0 18px;
      border-radius: 10px;
      border: 0;
      background: linear-gradient(135deg, #6366f1, #4f46e5);
      color: #ffffff;
      font-size: 12px;
      font-weight: 800;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      box-shadow: 0 2px 8px rgba(99, 102, 241, 0.25);
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .btn-apply:hover {
      filter: brightness(1.08);
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.35);
    }

    /* KPI Grid */
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 14px;
      margin-bottom: 18px;
    }

    .kpi-card {
      padding: 16px 18px;
      display: flex;
      align-items: center;
      gap: 14px;
    }

    .kpi-icon {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      display: grid;
      place-items: center;
      font-size: 18px;
      flex-shrink: 0;
    }

    .blue-bg { background: #eff6ff; color: #3b82f6; }
    .emerald-bg { background: #ecfdf5; color: #10b981; }
    .indigo-bg { background: #eef2ff; color: #6366f1; }
    .purple-bg { background: #faf5ff; color: #a855f7; }

    .kpi-title {
      display: block;
      font-size: 10px;
      font-weight: 850;
      text-transform: uppercase;
      letter-spacing: 0.6px;
      color: var(--muted);
    }

    .kpi-num {
      display: block;
      font-size: 22px;
      font-weight: 900;
      color: #0f172a;
      letter-spacing: -0.5px;
      line-height: 1.2;
      margin: 2px 0;
    }

    .text-source {
      font-size: 18px;
      color: #6366f1;
    }

    .kpi-sub {
      display: block;
      font-size: 11px;
      color: #64748b;
    }

    /* Table Section */
    .table-card {
      overflow: hidden;
      margin-bottom: 24px;
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

    .page-size-selector {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
      color: #64748b;
      font-weight: 650;
    }

    .page-size-selector select {
      height: 32px;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      padding: 0 8px;
      font-size: 12px;
      font-weight: 750;
      color: #1e293b;
      background: #ffffff;
      outline: none;
    }

    .table-wrap {
      overflow-x: auto;
      background: #ffffff;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
      min-width: 1100px;
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

    .org-id-pill {
      display: inline-block;
      font-family: var(--font-mono);
      font-size: 11.5px;
      font-weight: 750;
      color: #6366f1;
      background: #eef2ff;
      border: 1px solid #e0e7ff;
      padding: 3px 8px;
      border-radius: 7px;
    }

    .org-name-cell {
      display: flex;
      flex-direction: column;
      gap: 3px;
    }

    .org-name-cell b {
      color: #0f172a;
      font-weight: 800;
      font-size: 13px;
    }

    .source-badge {
      display: inline-block;
      align-self: flex-start;
      font-size: 9.5px;
      font-weight: 850;
      text-transform: uppercase;
      padding: 2px 6px;
      border-radius: 6px;
    }

    .source-badge.master { background: #e0f2fe; color: #0369a1; }
    .source-badge.sugar { background: #dcfce7; color: #15803d; }
    .source-badge.ncdfi { background: #fef3c7; color: #b45309; }

    .location-cell {
      display: flex;
      flex-direction: column;
    }

    .state-val {
      font-weight: 750;
      color: #1e293b;
    }

    .district-val {
      font-size: 11px;
      color: #64748b;
    }

    .market-count-pill {
      display: inline-block;
      font-size: 11px;
      font-weight: 750;
      color: #64748b;
      background: #f1f5f9;
      padding: 3px 8px;
      border-radius: 999px;
    }

    .market-count-pill.has-markets {
      background: #e0e7ff;
      color: #4f46e5;
    }

    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 11px;
      font-weight: 800;
      padding: 4px 10px;
      border-radius: 999px;
      background: #f1f5f9;
      color: #64748b;
    }

    .status-badge.participated {
      background: #ecfdf5;
      color: #059669;
    }

    .status-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: currentColor;
    }

    .email-cell {
      max-width: 180px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    /* Empty Cell */
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

    .btn-empty-reset {
      margin-top: 8px;
      padding: 8px 16px;
      border-radius: 10px;
      background: #6366f1;
      color: #ffffff;
      font-size: 12px;
      font-weight: 750;
      border: 0;
      cursor: pointer;
    }

    /* Pager */
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

    /* Responsive Breakpoints */
    @media (max-width: 1200px) {
      .filter-grid {
        grid-template-columns: repeat(2, 1fr);
      }
      .kpi-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 768px) {
      .page-head {
        flex-direction: column;
        gap: 12px;
      }
      .filter-grid {
        grid-template-columns: 1fr;
      }
      .kpi-grid {
        grid-template-columns: 1fr;
      }
      .filter-head {
        flex-direction: column;
        align-items: stretch;
      }
      .project-selector {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
      }
      .proj-btn {
        justify-content: center;
      }
      .table-pager {
        flex-direction: column;
        align-items: center;
      }
    }
  `]
})
export class ParticipantsComponent implements OnInit {
  filter: DashboardFilter = { source: 'ALL' };
  options: FilterOptions = this.emptyOptions();
  search = '';
  loading = false;
  pageSize = 25;
  data: Page<ParticipantRow> = { items: [], total: 0, page: 0, size: 25 };

  constructor(private api: DashboardApiService) {}

  ngOnInit(): void {
    this.loadOptions('ALL');
    this.load(0);
  }

  loadOptions(source: ProjectSource): void {
    this.api.filters(source).subscribe(x => (this.options = x));
  }

  selectSource(source: ProjectSource): void {
    this.filter.source = source;
    this.loadOptions(source);
    this.load(0);
  }

  onClientChange(val: string): void {
    this.filter.globalClient = val || undefined;
  }

  onMarketChange(val: string): void {
    this.filter.marketCode = val || undefined;
  }

  onStateChange(val: string): void {
    this.filter.state = val || undefined;
  }

  load(page: number): void {
    if (page < 0) return;
    this.loading = true;
    this.api.participants(this.filter, this.search, page, this.pageSize).subscribe({
      next: x => {
        this.data = x;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  onPageSizeChange(newSize: number): void {
    this.pageSize = newSize;
    this.load(0);
  }

  clearFilters(): void {
    this.filter = { source: 'ALL' };
    this.search = '';
    this.loadOptions('ALL');
    this.load(0);
  }

  removeFilter(key: keyof DashboardFilter | 'search'): void {
    if (key === 'search') {
      this.search = '';
    } else if (key === 'source') {
      this.filter.source = 'ALL';
      this.loadOptions('ALL');
    } else {
      delete this.filter[key];
    }
    this.load(0);
  }

  get activeFilterCount(): number {
    let count = 0;
    if (this.filter.source && this.filter.source !== 'ALL') count++;
    if (this.filter.globalClient) count++;
    if (this.filter.marketCode) count++;
    if (this.filter.state) count++;
    if (this.search) count++;
    return count;
  }

  get participatedOnPageCount(): number {
    return this.data.items.filter(i => i.participated).length;
  }

  get totalPages(): number {
    if (!this.data.total || this.pageSize <= 0) return 1;
    return Math.ceil(this.data.total / this.pageSize);
  }

  get showingStart(): number {
    if (!this.data.total) return 0;
    return this.data.page * this.pageSize + 1;
  }

  get showingEnd(): number {
    return Math.min((this.data.page + 1) * this.pageSize, this.data.total);
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
