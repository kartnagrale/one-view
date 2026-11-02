import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DashboardFilter, FilterOptions, ProjectSource } from '../core/models';
import { SearchableSelectComponent } from './searchable-select.component';

export interface FilterDraft {
  source: ProjectSource;
  globalClient: string;
  marketCode: string;
  commodity: string;
  auctionMode: string;
  qtyUnit: string;
  state: string;
  warehouse: string;
  from: string;
  to: string;
}

export interface ActiveFilterTag {
  key: keyof FilterDraft;
  label: string;
  value: string;
}

@Component({
  selector: 'app-filter-bar',
  standalone: true,
  imports: [CommonModule, FormsModule, SearchableSelectComponent],
  template: `
    <!-- Top Filter & Context Bar -->
    <section class="filter-card card">
      <!-- Row 1: Project Selector, Active Context & Expand/Collapse Toggle -->
      <div class="filter-head">
        <div class="project-selector-wrap">
          <span class="context-label">PROJECT:</span>
          <!-- Segmented Project Selector (Always visible on screen) -->
          <div class="project-selector">
            <button
              type="button"
              class="proj-btn"
              [class.active]="draft.source === 'ALL'"
              (click)="selectSource('ALL')">
              <span class="dot all-dot"></span> All Projects
            </button>
            <button
              type="button"
              class="proj-btn"
              [class.active]="draft.source === 'MASTER'"
              (click)="selectSource('MASTER')">
              <span class="dot market-dot"></span> Market
            </button>
            <button
              type="button"
              class="proj-btn"
              [class.active]="draft.source === 'SUGAR'"
              (click)="selectSource('SUGAR')">
              <span class="dot sugar-dot"></span> Sugar
            </button>
            <button
              type="button"
              class="proj-btn"
              [class.active]="draft.source === 'NCDFI'"
              (click)="selectSource('NCDFI')">
              <span class="dot ncdfi-dot"></span> NCDFI
            </button>
          </div>
        </div>

        <div class="head-right-actions">
          <!-- Toggle Full Grid Expansion -->
          <button
            type="button"
            class="btn-toggle-filters"
            (click)="isExpanded = !isExpanded"
            [class.active]="isExpanded">
            <span class="icon">⊶</span>
            <span>{{ isExpanded ? 'Hide Filter Grid' : 'Expand All Filters' }}</span>
            <span class="badge" *ngIf="activeFilterCount > 0">{{ activeFilterCount }}</span>
          </button>
        </div>
      </div>

      <!-- Active Filter Chips Row (Visible so user knows which data is showing + click (×) to remove) -->
      <div class="active-chips-bar" *ngIf="activeFilterTags.length > 0">
        <span class="active-label">FILTERED BY:</span>
        <div class="chips-list">
          <span class="filter-chip" *ngFor="let tag of activeFilterTags">
            <span class="chip-key">{{ tag.label }}:</span>
            <strong class="chip-val">{{ tag.value }}</strong>
            <button
              type="button"
              class="chip-remove"
              (click)="removeFilter(tag.key)"
              title="Remove {{ tag.label }} filter">
              ×
            </button>
          </span>
          <button type="button" class="btn-clear-all" (click)="clearAllFilters()">
            Clear All
          </button>
        </div>
      </div>

      <!-- Collapsible Detailed Filter Grid -->
      <div class="expanded-content" *ngIf="isExpanded">
        <!-- Main Filter Form Grid (4 Columns, 2 Rows) -->
        <div class="filter-grid">
          <!-- 1. Global Client -->
          <div class="field-item">
            <app-searchable-select
              label="GLOBAL CLIENT"
              allLabel="All Clients"
              [options]="options.globalClients"
              [value]="draft.globalClient"
              (valueChange)="draft.globalClient = $event">
            </app-searchable-select>
          </div>

          <!-- 2. Commodity -->
          <div class="field-item">
            <app-searchable-select
              label="COMMODITY"
              allLabel="All Commodities"
              [options]="options.commodities"
              [value]="draft.commodity"
              (valueChange)="draft.commodity = $event">
            </app-searchable-select>
          </div>

          <!-- 3. Market Code -->
          <div class="field-item">
            <app-searchable-select
              label="MARKET CODE"
              allLabel="All Markets"
              [options]="options.markets"
              [value]="draft.marketCode"
              (valueChange)="draft.marketCode = $event">
            </app-searchable-select>
          </div>

          <!-- 4. Auction Mode -->
          <div class="field-item">
            <label>
              <span class="field-label">AUCTION MODE</span>
              <div class="select-wrapper">
                <select [(ngModel)]="draft.auctionMode">
                  <option value="">All Modes (Forward + Reverse)</option>
                  <option value="FORWARD">Forward Auction (AO + S)</option>
                  <option value="REVERSE">Reverse Auction (AO + B)</option>
                </select>
              </div>
            </label>
          </div>

          <!-- 5. Quantity UOM -->
          <div class="field-item">
            <app-searchable-select
              label="QUANTITY UOM"
              allLabel="All Units (Separated)"
              [options]="options.quantityUnits"
              [value]="draft.qtyUnit"
              (valueChange)="draft.qtyUnit = $event">
            </app-searchable-select>
          </div>

          <!-- 6. State -->
          <div class="field-item">
            <app-searchable-select
              label="STATE"
              allLabel="All States"
              [options]="options.states"
              [value]="draft.state"
              (valueChange)="draft.state = $event">
            </app-searchable-select>
          </div>

          <!-- 7. Warehouse -->
          <div class="field-item">
            <app-searchable-select
              label="WAREHOUSE / LOCATION"
              allLabel="All Warehouses"
              [options]="options.warehouses"
              [value]="draft.warehouse"
              (valueChange)="draft.warehouse = $event">
            </app-searchable-select>
          </div>

          <!-- 8. Active Filter Summary Indicator -->
          <div class="field-item status-item">
            <div class="active-badge-card">
              <span class="badge-tag">{{ activeFilterCount }} Active Filters</span>
              <span class="badge-sub">{{ draft.source === 'ALL' ? 'Cross-Project' : draft.source }}</span>
            </div>
          </div>
        </div>

        <!-- Bottom Bar: Date Range, Presets, and Actions -->
        <div class="filter-foot">
          <div class="date-section">
            <div class="date-inputs">
              <label>
                <span class="foot-label">FROM</span>
                <input type="date" [(ngModel)]="draft.from" />
              </label>
              <label>
                <span class="foot-label">TO</span>
                <input type="date" [(ngModel)]="draft.to" />
              </label>
            </div>

            <!-- Quick Date Presets -->
            <div class="date-presets">
              <button type="button" (click)="setPresetDays(30)">30D</button>
              <button type="button" (click)="setPresetDays(90)">90D</button>
              <button type="button" (click)="setPresetDays(365)">1Y</button>
              <button type="button" (click)="setPresetAll()">All Time</button>
            </div>
          </div>

          <div class="uom-notice">
            <span class="info-icon">ℹ</span>
            <span>Quantities are strictly grouped by UOM and never combined across MT, KG or NOS.</span>
          </div>

          <div class="action-buttons">
            <button type="button" class="btn-reset" (click)="reset()">
              Reset
            </button>
            <button type="button" class="btn-apply" (click)="emitApply()">
              <span class="btn-icon">✓</span> Apply Filters
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Static Floating Filter Button on the Side (ICON ONLY - FIXED WHILE SCROLLING) -->
    <button
      type="button"
      class="static-side-icon-btn"
      (click)="openDrawer()"
      title="Open Filter Drawer">
      <svg class="filter-svg-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
      </svg>
      <span class="icon-badge" *ngIf="activeFilterCount > 0">{{ activeFilterCount }}</span>
    </button>

    <!-- Slide-Over Filter Drawer from the Right Side -->
    <div class="drawer-backdrop" *ngIf="isDrawerOpen" (click)="closeDrawer()">
      <div class="drawer-panel" (click)="$event.stopPropagation()">
        <!-- Drawer Header -->
        <div class="drawer-head">
          <div>
            <div class="drawer-eyebrow">
              <span class="live-dot"></span>
              <span>{{ activeFilterCount }} Filters Active</span>
            </div>
            <h2>Quick Filter Panel</h2>
            <p>Refine market intelligence from anywhere on the page</p>
          </div>
          <button type="button" class="drawer-close-btn" (click)="closeDrawer()" aria-label="Close">×</button>
        </div>

        <!-- Drawer Scrollable Body -->
        <div class="drawer-body">
          <!-- Active Filter Chips in Drawer -->
          <div class="drawer-active-chips" *ngIf="activeFilterTags.length > 0">
            <span class="d-chip-title">CURRENTLY APPLIED:</span>
            <div class="d-chips-wrap">
              <span class="filter-chip" *ngFor="let tag of activeFilterTags">
                <span class="chip-key">{{ tag.label }}:</span>
                <strong class="chip-val">{{ tag.value }}</strong>
                <button
                  type="button"
                  class="chip-remove"
                  (click)="removeFilter(tag.key)">
                  ×
                </button>
              </span>
            </div>
          </div>

          <!-- Project Selector in Drawer -->
          <div class="drawer-section">
            <span class="section-title">TARGET PROJECT</span>
            <div class="drawer-proj-grid">
              <button
                type="button"
                class="d-btn"
                [class.active]="draft.source === 'ALL'"
                (click)="selectSource('ALL')">
                All Projects
              </button>
              <button
                type="button"
                class="d-btn"
                [class.active]="draft.source === 'MASTER'"
                (click)="selectSource('MASTER')">
                Market
              </button>
              <button
                type="button"
                class="d-btn"
                [class.active]="draft.source === 'SUGAR'"
                (click)="selectSource('SUGAR')">
                Sugar
              </button>
              <button
                type="button"
                class="d-btn"
                [class.active]="draft.source === 'NCDFI'"
                (click)="selectSource('NCDFI')">
                NCDFI
              </button>
            </div>
          </div>

          <!-- Dimension Refinements with Searchable Selects -->
          <div class="drawer-section">
            <span class="section-title">AUCTION DIMENSIONS</span>

            <app-searchable-select
              label="GLOBAL CLIENT"
              allLabel="All Clients"
              [options]="options.globalClients"
              [value]="draft.globalClient"
              (valueChange)="draft.globalClient = $event">
            </app-searchable-select>

            <app-searchable-select
              label="COMMODITY"
              allLabel="All Commodities"
              [options]="options.commodities"
              [value]="draft.commodity"
              (valueChange)="draft.commodity = $event">
            </app-searchable-select>

            <app-searchable-select
              label="MARKET CODE"
              allLabel="All Markets"
              [options]="options.markets"
              [value]="draft.marketCode"
              (valueChange)="draft.marketCode = $event">
            </app-searchable-select>

            <label class="drawer-native-field">
              <span class="field-label">AUCTION MODE</span>
              <div class="select-wrapper">
                <select [(ngModel)]="draft.auctionMode">
                  <option value="">All Modes (Forward + Reverse)</option>
                  <option value="FORWARD">Forward Auction (AO + S)</option>
                  <option value="REVERSE">Reverse Auction (AO + B)</option>
                </select>
              </div>
            </label>

            <app-searchable-select
              label="QUANTITY UOM"
              allLabel="All Units (Separated)"
              [options]="options.quantityUnits"
              [value]="draft.qtyUnit"
              (valueChange)="draft.qtyUnit = $event">
            </app-searchable-select>

            <app-searchable-select
              label="STATE"
              allLabel="All States"
              [options]="options.states"
              [value]="draft.state"
              (valueChange)="draft.state = $event">
            </app-searchable-select>

            <app-searchable-select
              label="WAREHOUSE / LOCATION"
              allLabel="All Warehouses"
              [options]="options.warehouses"
              [value]="draft.warehouse"
              (valueChange)="draft.warehouse = $event">
            </app-searchable-select>
          </div>

          <!-- Date Filter Section -->
          <div class="drawer-section">
            <span class="section-title">TIME HORIZON & DATE RANGE</span>
            <div class="drawer-date-grid">
              <label>
                <span class="field-label">FROM</span>
                <input type="date" [(ngModel)]="draft.from" />
              </label>
              <label>
                <span class="field-label">TO</span>
                <input type="date" [(ngModel)]="draft.to" />
              </label>
            </div>
            <div class="drawer-presets">
              <button type="button" (click)="setPresetDays(30)">30 Days</button>
              <button type="button" (click)="setPresetDays(90)">90 Days</button>
              <button type="button" (click)="setPresetDays(365)">1 Year</button>
              <button type="button" (click)="setPresetAll()">All Time</button>
            </div>
          </div>
        </div>

        <!-- Sticky Drawer Footer with Action Buttons -->
        <div class="drawer-foot">
          <button type="button" class="btn-d-reset" (click)="reset()">
            Reset All
          </button>
          <button type="button" class="btn-d-apply" (click)="applyAndClose()">
            <span class="btn-icon">✓</span> Apply Filters
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .filter-card {
      padding: 16px 20px;
      margin-bottom: 16px;
      background: #ffffff;
      border: 1px solid var(--line);
      border-radius: 18px;
      box-shadow: var(--shadow);
    }

    /* Filter Head */
    .filter-head {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 12px;
    }

    .project-selector-wrap {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
    }

    .context-label {
      font-size: 11px;
      font-weight: 850;
      color: #64748b;
      letter-spacing: 0.8px;
    }

    /* Segmented Project Selector */
    .project-selector {
      display: inline-flex;
      background: #f1f5f9;
      padding: 4px;
      border-radius: 12px;
      gap: 3px;
    }

    .proj-btn {
      padding: 7px 14px;
      font-size: 12px;
      font-weight: 750;
      border-radius: 9px;
      color: #64748b;
      display: inline-flex;
      align-items: center;
      gap: 7px;
      transition: all 0.15s ease;
      background: transparent;
      border: 0;
      cursor: pointer;
    }

    .proj-btn:hover {
      color: #0f172a;
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

    .head-right-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .btn-toggle-filters {
      height: 38px;
      border: 1px solid #cbd5e1;
      background: #ffffff;
      color: #334155;
      padding: 0 14px;
      border-radius: 10px;
      font-size: 12px;
      font-weight: 750;
      display: inline-flex;
      align-items: center;
      gap: 7px;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .btn-toggle-filters:hover {
      border-color: #6366f1;
      color: #6366f1;
      background: #f8fafc;
    }

    .btn-toggle-filters.active {
      background: #eef2ff;
      color: #6366f1;
      border-color: #818cf8;
    }

    .btn-toggle-filters .badge {
      background: #6366f1;
      color: #ffffff;
      font-size: 10px;
      font-weight: 850;
      padding: 1px 6px;
      border-radius: 999px;
    }

    /* Active Filter Chips Bar */
    .active-chips-bar {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px dashed #e2e8f0;
      flex-wrap: wrap;
    }

    .active-label {
      font-size: 10px;
      font-weight: 850;
      color: #64748b;
      letter-spacing: 0.6px;
    }

    .chips-list {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }

    .filter-chip {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 8px 4px 10px;
      border-radius: 8px;
      background: #eef2ff;
      border: 1px solid #c7d2fe;
      color: #3730a3;
      font-size: 11.5px;
    }

    .chip-key {
      color: #6366f1;
      font-weight: 750;
    }

    .chip-val {
      color: #1e1b4b;
      font-weight: 800;
    }

    .chip-remove {
      border: 0;
      background: rgba(99, 102, 241, 0.15);
      color: #4338ca;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      display: grid;
      place-items: center;
      font-size: 12px;
      line-height: 1;
      cursor: pointer;
      padding: 0;
      margin-left: 2px;
      transition: all 0.12s ease;
    }

    .chip-remove:hover {
      background: #ef4444;
      color: #ffffff;
    }

    .btn-clear-all {
      border: 0;
      background: transparent;
      color: #ef4444;
      font-size: 11px;
      font-weight: 750;
      cursor: pointer;
      padding: 4px 6px;
      border-radius: 6px;
    }

    .btn-clear-all:hover {
      background: #fef2f2;
    }

    /* Expanded Content */
    .expanded-content {
      margin-top: 18px;
      padding-top: 18px;
      border-top: 1px solid #e2e8f0;
      animation: fadeIn 0.15s ease-out;
    }

    .filter-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 14px 16px;
      margin-bottom: 20px;
    }

    .field-item label {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .field-label {
      font-size: 11px;
      font-weight: 800;
      color: #475569;
      letter-spacing: 0.4px;
      text-transform: uppercase;
    }

    .select-wrapper {
      position: relative;
    }

    select, input[type="date"] {
      width: 100%;
      height: 42px;
      border: 1px solid #cbd5e1;
      border-radius: 10px;
      background: #ffffff;
      padding: 0 32px 0 12px;
      font-size: 13px;
      color: #0f172a;
      font-weight: 600;
      outline: none;
      transition: all 0.15s ease;
      appearance: none;
      -webkit-appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 10px center;
      background-size: 16px;
    }

    select:focus, input[type="date"]:focus {
      border-color: #6366f1;
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.12);
    }

    .active-badge-card {
      height: 42px;
      background: #f8fafc;
      border: 1px dashed #cbd5e1;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 14px;
      margin-top: 20px;
    }

    .badge-tag {
      font-size: 11px;
      font-weight: 800;
      color: #6366f1;
    }

    .badge-sub {
      font-size: 11px;
      color: #64748b;
      font-weight: 600;
    }

    /* Bottom Bar */
    .filter-foot {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      padding-top: 18px;
      border-top: 1px solid #e2e8f0;
      flex-wrap: wrap;
    }

    .date-section {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .date-inputs {
      display: flex;
      gap: 10px;
    }

    .date-inputs label {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .foot-label {
      font-size: 10px;
      font-weight: 800;
      color: #64748b;
      letter-spacing: 0.4px;
    }

    .date-inputs input[type="date"] {
      width: 140px;
      height: 38px;
      padding: 0 10px;
      font-size: 12px;
      font-family: var(--font-mono);
      background-image: none;
    }

    .date-presets {
      display: inline-flex;
      gap: 4px;
      background: #f1f5f9;
      padding: 3px;
      border-radius: 8px;
      align-self: flex-end;
      margin-bottom: 1px;
    }

    .date-presets button {
      padding: 4px 8px;
      font-size: 11px;
      font-weight: 750;
      color: #64748b;
      border-radius: 6px;
      background: transparent;
      border: 0;
      cursor: pointer;
    }

    .date-presets button:hover {
      background: #ffffff;
      color: #0f172a;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    }

    .uom-notice {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      color: #64748b;
      flex: 1;
      padding: 0 12px;
    }

    .info-icon {
      color: #6366f1;
      font-weight: 800;
      font-size: 14px;
    }

    .action-buttons {
      display: flex;
      gap: 10px;
      align-items: center;
    }

    .btn-reset {
      height: 40px;
      border: 1px solid #cbd5e1;
      background: #ffffff;
      color: #475569;
      font-weight: 750;
      font-size: 13px;
      padding: 0 16px;
      border-radius: 10px;
      cursor: pointer;
    }

    .btn-reset:hover {
      background: #f8fafc;
      border-color: #94a3b8;
    }

    .btn-apply {
      height: 40px;
      border: 0;
      background: linear-gradient(135deg, #6366f1, #0ea5e9);
      color: #ffffff;
      font-weight: 800;
      font-size: 13px;
      padding: 0 20px;
      border-radius: 10px;
      box-shadow: 0 4px 14px rgba(99, 102, 241, 0.25);
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }

    .btn-apply:hover {
      filter: brightness(1.08);
    }

    /* =========================================================
       STATIC FLOATING FILTER BUTTON ON THE SIDE (ICON ONLY!)
       ========================================================= */
    .static-side-icon-btn {
      position: fixed;
      right: 0;
      top: 50%;
      transform: translateY(-50%);
      z-index: 950;
      width: 44px;
      height: 52px;
      border-radius: 14px 0 0 14px;
      background: linear-gradient(135deg, #6366f1, #4f46e5);
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: -4px 6px 22px rgba(99, 102, 241, 0.4), 0 2px 8px rgba(15, 23, 42, 0.12);
      border: 1px solid rgba(255, 255, 255, 0.25);
      border-right: 0;
      cursor: pointer;
      user-select: none;
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .static-side-icon-btn:hover {
      width: 52px;
      background: linear-gradient(135deg, #4f46e5, #4338ca);
      box-shadow: -6px 8px 30px rgba(99, 102, 241, 0.55);
    }

    .icon-glyph, .filter-svg-icon {
      font-size: 22px;
      line-height: 1;
      display: block;
    }

    .icon-badge {
      position: absolute;
      top: -4px;
      left: -4px;
      background: #10b981;
      color: #ffffff;
      font-size: 10px;
      font-weight: 900;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      display: grid;
      place-items: center;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25);
    }

    /* =========================================================
       SLIDE-OVER QUICK FILTER DRAWER
       ========================================================= */
    .drawer-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.45);
      backdrop-filter: blur(4px);
      -webkit-backdrop-filter: blur(4px);
      z-index: 1000;
      display: flex;
      justify-content: flex-end;
      animation: fadeIn 0.2s ease-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .drawer-panel {
      width: min(480px, 100vw);
      height: 100%;
      background: #ffffff;
      box-shadow: -10px 0 35px rgba(0, 0, 0, 0.18);
      display: flex;
      flex-direction: column;
      animation: slideInRight 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }

    @keyframes slideInRight {
      from { transform: translateX(100%); }
      to { transform: translateX(0); }
    }

    .drawer-head {
      padding: 22px 26px;
      border-bottom: 1px solid var(--line);
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      background: #ffffff;
    }

    .drawer-eyebrow {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 11px;
      font-weight: 800;
      color: #6366f1;
      text-transform: uppercase;
      letter-spacing: 0.6px;
      margin-bottom: 3px;
    }

    .live-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #10b981;
    }

    .drawer-head h2 {
      margin: 0;
      font-size: 20px;
      font-weight: 850;
      color: #0f172a;
    }

    .drawer-head p {
      margin: 3px 0 0;
      font-size: 12px;
      color: #64748b;
    }

    .drawer-close-btn {
      width: 34px;
      height: 34px;
      border-radius: 10px;
      background: #f1f5f9;
      color: #475569;
      font-size: 20px;
      display: grid;
      place-items: center;
      line-height: 1;
      border: 0;
      cursor: pointer;
    }

    .drawer-close-btn:hover {
      background: #e2e8f0;
      color: #0f172a;
    }

    .drawer-body {
      flex: 1;
      overflow-y: auto;
      padding: 22px 26px;
      display: flex;
      flex-direction: column;
      gap: 22px;
    }

    .drawer-active-chips {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 12px 14px;
    }

    .d-chip-title {
      display: block;
      font-size: 10px;
      font-weight: 850;
      color: #64748b;
      letter-spacing: 0.5px;
      margin-bottom: 8px;
    }

    .d-chips-wrap {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }

    .drawer-section {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .section-title {
      font-size: 11px;
      font-weight: 850;
      color: #64748b;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      padding-bottom: 6px;
      border-bottom: 1px solid #f1f5f9;
    }

    .drawer-proj-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 8px;
    }

    .d-btn {
      padding: 9px 12px;
      border-radius: 10px;
      border: 1px solid #cbd5e1;
      background: #ffffff;
      color: #475569;
      font-size: 12px;
      font-weight: 750;
      transition: all 0.15s ease;
      cursor: pointer;
    }

    .d-btn:hover {
      border-color: #94a3b8;
    }

    .d-btn.active {
      background: #6366f1;
      color: #ffffff;
      border-color: #6366f1;
      box-shadow: 0 2px 8px rgba(99, 102, 241, 0.25);
    }

    .drawer-native-field {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .drawer-date-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }

    .drawer-date-grid label {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .drawer-date-grid input[type="date"] {
      height: 40px;
      border: 1px solid #cbd5e1;
      border-radius: 10px;
      padding: 0 10px;
      font-size: 12px;
      font-family: var(--font-mono);
      outline: none;
      background-image: none;
    }

    .drawer-presets {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
      margin-top: 4px;
    }

    .drawer-presets button {
      flex: 1;
      padding: 7px 10px;
      font-size: 11px;
      font-weight: 750;
      background: #f1f5f9;
      border-radius: 8px;
      color: #475569;
      border: 0;
      cursor: pointer;
      transition: all 0.12s ease;
    }

    .drawer-presets button:hover {
      background: #e2e8f0;
      color: #0f172a;
    }

    .drawer-foot {
      padding: 18px 26px;
      border-top: 1px solid var(--line);
      background: #f8fafc;
      display: flex;
      justify-content: flex-end;
      gap: 12px;
    }

    .btn-d-reset {
      height: 42px;
      border: 1px solid #cbd5e1;
      background: #ffffff;
      color: #475569;
      padding: 0 18px;
      border-radius: 10px;
      font-weight: 750;
      font-size: 13px;
      cursor: pointer;
    }

    .btn-d-reset:hover {
      background: #f1f5f9;
    }

    .btn-d-apply {
      height: 42px;
      border: 0;
      background: linear-gradient(135deg, #6366f1, #0ea5e9);
      color: #ffffff;
      padding: 0 22px;
      border-radius: 10px;
      font-weight: 800;
      font-size: 13px;
      box-shadow: 0 4px 14px rgba(99, 102, 241, 0.3);
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }

    .btn-d-apply:hover {
      filter: brightness(1.08);
    }

    @media (max-width: 1200px) {
      .filter-grid {
        grid-template-columns: repeat(2, 1fr);
      }
      .active-badge-card {
        margin-top: 0;
      }
    }

    @media (max-width: 850px) {
      .filter-head {
        flex-direction: column;
        align-items: flex-start;
      }
      .project-selector {
        width: 100%;
        overflow-x: auto;
      }
      .filter-foot {
        flex-direction: column;
        align-items: stretch;
      }
      .date-section {
        flex-wrap: wrap;
      }
      .action-buttons {
        justify-content: flex-end;
      }
    }

    @media (max-width: 768px) {
      .static-side-icon-btn {
        right: 18px;
        bottom: 22px;
        top: auto;
        transform: none;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        border-right: 1px solid rgba(255, 255, 255, 0.25);
        box-shadow: 0 8px 24px rgba(99, 102, 241, 0.45);
      }
      .static-side-icon-btn:hover {
        width: 50px;
        transform: scale(1.06);
      }
      .icon-badge {
        top: -2px;
        right: -2px;
        left: auto;
      }
      .drawer-panel {
        width: 100vw;
      }
    }

    @media (max-width: 550px) {
      .project-selector {
        width: 100%;
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 5px;
      }
      .proj-btn {
        justify-content: center;
        padding: 8px 6px;
        font-size: 11px;
      }
      .head-right-actions, .btn-toggle-filters {
        width: 100%;
      }
      .btn-toggle-filters {
        justify-content: center;
      }
      .filter-grid {
        grid-template-columns: 1fr;
      }
      .date-inputs {
        width: 100%;
      }
      .date-inputs input[type="date"] {
        width: 100%;
      }
    }
  `]
})
export class FilterBarComponent {
  @Input({ required: true }) options!: FilterOptions;

  @Input({ required: true }) set filter(value: DashboardFilter) {
    this.draft = {
      source: value.source || 'ALL',
      globalClient: value.globalClient || '',
      marketCode: value.marketCode || '',
      commodity: value.commodity || '',
      auctionMode: value.auctionMode || '',
      qtyUnit: value.qtyUnit || '',
      state: value.state || '',
      warehouse: value.warehouse || '',
      from: value.from || '',
      to: value.to || ''
    };
  }

  @Output() apply = new EventEmitter<DashboardFilter>();
  @Output() sourceChanged = new EventEmitter<ProjectSource>();

  isDrawerOpen = false;
  isExpanded = false;

  draft: FilterDraft = {
    source: 'ALL',
    globalClient: '',
    marketCode: '',
    commodity: '',
    auctionMode: '',
    qtyUnit: '',
    state: '',
    warehouse: '',
    from: '',
    to: ''
  };

  get activeFilterCount(): number {
    return this.activeFilterTags.length;
  }

  get activeFilterTags(): ActiveFilterTag[] {
    const tags: ActiveFilterTag[] = [];
    if (this.draft.source && this.draft.source !== 'ALL') {
      const labelMap: Record<string, string> = {
        MASTER: 'Market',
        SUGAR: 'Sugar',
        NCDFI: 'NCDFI'
      };
      tags.push({
        key: 'source',
        label: 'Project',
        value: labelMap[this.draft.source] || this.draft.source
      });
    }
    if (this.draft.globalClient) {
      tags.push({ key: 'globalClient', label: 'Client', value: this.draft.globalClient });
    }
    if (this.draft.commodity) {
      tags.push({ key: 'commodity', label: 'Commodity', value: this.draft.commodity });
    }
    if (this.draft.marketCode) {
      tags.push({ key: 'marketCode', label: 'Market', value: this.draft.marketCode });
    }
    if (this.draft.auctionMode) {
      tags.push({ key: 'auctionMode', label: 'Mode', value: this.draft.auctionMode });
    }
    if (this.draft.qtyUnit) {
      tags.push({ key: 'qtyUnit', label: 'UOM', value: this.draft.qtyUnit });
    }
    if (this.draft.state) {
      tags.push({ key: 'state', label: 'State', value: this.draft.state });
    }
    if (this.draft.warehouse) {
      tags.push({ key: 'warehouse', label: 'Warehouse', value: this.draft.warehouse });
    }
    if (this.draft.from) {
      tags.push({ key: 'from', label: 'From', value: this.draft.from });
    }
    if (this.draft.to) {
      tags.push({ key: 'to', label: 'To', value: this.draft.to });
    }
    return tags;
  }

  removeFilter(key: keyof FilterDraft): void {
    if (key === 'source') {
      this.selectSource('ALL');
    } else {
      this.draft[key] = '';
      this.emitApply();
    }
  }

  clearAllFilters(): void {
    this.draft.source = 'ALL';
    this.sourceChanged.emit('ALL');
    this.draft.globalClient = '';
    this.draft.marketCode = '';
    this.draft.commodity = '';
    this.draft.auctionMode = '';
    this.draft.qtyUnit = '';
    this.draft.state = '';
    this.draft.warehouse = '';
    this.draft.from = '';
    this.draft.to = '';
    this.emitApply();
  }

  openDrawer(): void {
    this.isDrawerOpen = true;
  }

  closeDrawer(): void {
    this.isDrawerOpen = false;
  }

  applyAndClose(): void {
    this.emitApply();
    this.closeDrawer();
  }

  selectSource(source: ProjectSource): void {
    this.draft.source = source;
    this.sourceChanged.emit(source);
    // Reset specific filters when switching projects to avoid invalid combinations
    this.draft.globalClient = '';
    this.draft.marketCode = '';
    this.draft.commodity = '';
    this.draft.state = '';
    this.draft.warehouse = '';
    this.draft.auctionMode = '';
    this.draft.qtyUnit = '';
    this.emitApply();
  }

  emitApply(): void {
    const cleaned: DashboardFilter = {
      source: this.draft.source || 'ALL',
      globalClient: this.draft.globalClient?.trim() || undefined,
      marketCode: this.draft.marketCode?.trim() || undefined,
      commodity: this.draft.commodity?.trim() || undefined,
      auctionMode: this.draft.auctionMode?.trim() || undefined,
      qtyUnit: this.draft.qtyUnit?.trim() || undefined,
      state: this.draft.state?.trim() || undefined,
      warehouse: this.draft.warehouse?.trim() || undefined,
      from: this.draft.from || undefined,
      to: this.draft.to || undefined
    };
    this.apply.emit(cleaned);
  }

  reset(): void {
    this.draft = {
      source: this.draft.source || 'ALL',
      globalClient: '',
      marketCode: '',
      commodity: '',
      auctionMode: '',
      qtyUnit: '',
      state: '',
      warehouse: '',
      from: '',
      to: ''
    };
    this.emitApply();
  }

  setPresetDays(days: number): void {
    const today = new Date();
    const past = new Date();
    past.setDate(today.getDate() - days);
    this.draft.to = today.toISOString().slice(0, 10);
    this.draft.from = past.toISOString().slice(0, 10);
    this.emitApply();
  }

  setPresetAll(): void {
    this.draft.from = '';
    this.draft.to = '';
    this.emitApply();
  }
}
