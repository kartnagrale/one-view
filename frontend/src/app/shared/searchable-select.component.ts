import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, HostListener, Input, Output, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-searchable-select',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="searchable-select" [class.open]="isOpen" [class.has-value]="!!value">
      <label class="field-label" *ngIf="label">{{ label }}</label>

      <!-- Trigger Input Box -->
      <div class="trigger" (click)="toggleDropdown($event)">
        <span class="trigger-text" [class.placeholder]="!value">
          {{ displayLabel }}
        </span>

        <div class="trigger-actions">
          <button
            type="button"
            class="clear-btn"
            *ngIf="value"
            (click)="clear($event)"
            title="Clear selection">
            ×
          </button>
          <span class="chevron" [class.up]="isOpen">▼</span>
        </div>
      </div>

      <!-- Anchored Dropdown Menu -->
      <div class="dropdown-panel" *ngIf="isOpen" (click)="$event.stopPropagation()">
        <!-- Search Field -->
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input
            #searchInput
            type="text"
            [(ngModel)]="searchQuery"
            [placeholder]="'Search ' + (label || 'options') + '...'"
            (click)="$event.stopPropagation()" />
          <button
            type="button"
            class="search-clear-btn"
            *ngIf="searchQuery"
            (click)="searchQuery = ''">
            ×
          </button>
        </div>

        <!-- Scrollable Options List -->
        <div class="options-list">
          <!-- "All" Default Option -->
          <div
            class="option-item all-option"
            [class.selected]="!value"
            (click)="selectOption('')">
            <span class="opt-check" *ngIf="!value">✓</span>
            <span class="opt-text">{{ allLabel }}</span>
          </div>

          <!-- Matching Options -->
          <div
            class="option-item"
            *ngFor="let opt of filteredOptions"
            [class.selected]="opt === value"
            (click)="selectOption(opt)">
            <span class="opt-check" *ngIf="opt === value">✓</span>
            <span class="opt-text">{{ opt }}</span>
          </div>

          <!-- No Results Notice -->
          <div class="no-options" *ngIf="filteredOptions.length === 0 && searchQuery">
            No matches found for "{{ searchQuery }}"
          </div>
        </div>

        <!-- Bottom Status Bar -->
        <div class="dropdown-foot">
          <span>{{ filteredOptions.length }} of {{ options.length }} options</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      position: relative;
    }

    .searchable-select {
      position: relative;
      width: 100%;
    }

    .field-label {
      display: block;
      font-size: 11px;
      font-weight: 800;
      color: #475569;
      letter-spacing: 0.4px;
      text-transform: uppercase;
      margin-bottom: 6px;
    }

    .trigger {
      width: 100%;
      height: 42px;
      border: 1px solid #cbd5e1;
      border-radius: 10px;
      background: #ffffff;
      padding: 0 12px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      cursor: pointer;
      user-select: none;
      transition: all 0.15s ease;
    }

    .trigger:hover {
      border-color: #94a3b8;
    }

    .searchable-select.open .trigger {
      border-color: #6366f1;
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
    }

    .trigger-text {
      font-size: 13px;
      font-weight: 650;
      color: #0f172a;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      padding-right: 8px;
    }

    .trigger-text.placeholder {
      color: #334155;
      font-weight: 600;
    }

    .trigger-actions {
      display: flex;
      align-items: center;
      gap: 6px;
      flex-shrink: 0;
    }

    .clear-btn {
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: #e2e8f0;
      color: #475569;
      font-size: 13px;
      display: grid;
      place-items: center;
      line-height: 1;
      border: 0;
      padding: 0;
    }

    .clear-btn:hover {
      background: #cbd5e1;
      color: #0f172a;
    }

    .chevron {
      font-size: 10px;
      color: #64748b;
      transition: transform 0.2s ease;
    }

    .chevron.up {
      transform: rotate(180deg);
      color: #6366f1;
    }

    /* Anchored Dropdown Panel */
    .dropdown-panel {
      position: absolute;
      top: calc(100% + 4px);
      left: 0;
      right: 0;
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 12px;
      box-shadow: 0 14px 35px rgba(15, 23, 42, 0.16), 0 4px 10px rgba(15, 23, 42, 0.06);
      z-index: 1000;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      animation: dropDown 0.15s ease-out;
    }

    @keyframes dropDown {
      from { opacity: 0; transform: translateY(-4px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .search-box {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 10px;
      border-bottom: 1px solid #f1f5f9;
      background: #f8fafc;
    }

    .search-icon {
      font-size: 12px;
      color: #94a3b8;
    }

    .search-box input {
      width: 100%;
      height: 32px;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 0 8px;
      font-size: 12px;
      outline: none;
      background: #ffffff;
      color: #0f172a;
    }

    .search-box input:focus {
      border-color: #6366f1;
    }

    .search-clear-btn {
      border: 0;
      background: transparent;
      color: #94a3b8;
      font-size: 14px;
      padding: 0 4px;
      cursor: pointer;
    }

    /* Options List */
    .options-list {
      max-height: 220px;
      overflow-y: auto;
      padding: 4px;
    }

    .option-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 10px;
      border-radius: 8px;
      font-size: 12.5px;
      color: #1e293b;
      cursor: pointer;
      transition: background 0.12s ease;
      font-weight: 550;
    }

    .option-item:hover {
      background: #f1f5f9;
      color: #0f172a;
    }

    .option-item.selected {
      background: #eef2ff;
      color: #6366f1;
      font-weight: 750;
    }

    .all-option {
      border-bottom: 1px solid #f1f5f9;
      margin-bottom: 2px;
      font-weight: 700;
      color: #475569;
    }

    .opt-check {
      font-size: 12px;
      font-weight: 850;
      color: #6366f1;
      width: 14px;
    }

    .opt-text {
      flex: 1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .no-options {
      padding: 24px 12px;
      text-align: center;
      font-size: 12px;
      color: #94a3b8;
    }

    .dropdown-foot {
      padding: 6px 10px;
      border-top: 1px solid #f1f5f9;
      background: #f8fafc;
      font-size: 10px;
      font-weight: 700;
      color: #94a3b8;
      text-align: right;
    }
  `]
})
export class SearchableSelectComponent {
  @Input() label?: string;
  @Input() allLabel = 'All';
  @Input() placeholder = 'Select...';
  @Input() options: string[] = [];
  @Input() value = '';
  @Output() valueChange = new EventEmitter<string>();

  @ViewChild('searchInput') searchInputRef?: ElementRef<HTMLInputElement>;

  isOpen = false;
  searchQuery = '';

  constructor(private elementRef: ElementRef) {}

  get displayLabel(): string {
    if (this.value) {
      return this.value;
    }
    const count = this.options.length;
    return count > 0 ? `${this.allLabel} (${count})` : this.allLabel;
  }

  get filteredOptions(): string[] {
    const q = this.searchQuery.trim().toLowerCase();
    if (!q) {
      return this.options;
    }
    return this.options.filter(o => o.toLowerCase().includes(q));
  }

  toggleDropdown(event: MouseEvent): void {
    event.stopPropagation();
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.searchQuery = '';
      setTimeout(() => {
        this.searchInputRef?.nativeElement.focus();
      }, 50);
    }
  }

  selectOption(opt: string): void {
    this.value = opt;
    this.valueChange.emit(opt);
    this.isOpen = false;
    this.searchQuery = '';
  }

  clear(event: MouseEvent): void {
    event.stopPropagation();
    this.selectOption('');
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isOpen = false;
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.isOpen = false;
  }
}
