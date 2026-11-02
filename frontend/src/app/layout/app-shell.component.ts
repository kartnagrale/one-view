import { CommonModule } from '@angular/common';
import { Component, OnDestroy } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { AuthService } from '../core/auth.service';
import { AiCopilotService } from '../core/ai-copilot.service';
import { AiCopilotComponent } from '../shared/ai-copilot.component';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet, AiCopilotComponent],
  template: `
    <div class="shell">
      <header class="topbar">
        <div class="topbar-inner">
          <!-- Left: Brand Logo & Title -->
          <a class="brand" routerLink="/dashboard" (click)="closeMobileMenu()">
            <img src="assets/nemlLogo.png" alt="NeML Logo" class="brand-logo-img" />
            <div class="brand-meta">
              <b>NeML One-View</b>
              <span class="brand-sub">Commodity Auction Intelligence</span>
            </div>
          </a>

          <!-- Center: Desktop & Tablet Nav Links -->
          <nav class="desktop-nav">
            <a routerLink="/dashboard" routerLinkActive="active">
              <span class="nav-icon">📊</span>
              <span class="nav-text">Overview</span>
            </a>
            <a routerLink="/auctions" routerLinkActive="active">
              <span class="nav-icon">⚡</span>
              <span class="nav-text">Auctions</span>
            </a>
            <a routerLink="/participants" routerLinkActive="active">
              <span class="nav-icon">👥</span>
              <span class="nav-text">Participants</span>
            </a>
            <a routerLink="/reports" routerLinkActive="active">
              <span class="nav-icon">📑</span>
              <span class="nav-text">Reports</span>
            </a>
            <a *ngIf="auth.hasRole('MARKETWATCH')" routerLink="/mappings" routerLinkActive="active">
              <span class="nav-icon">⚙️</span>
              <span class="nav-text">Mappings</span>
            </a>
            <a routerLink="/ai-assistant" routerLinkActive="active">
              <span class="nav-icon">✨</span>
              <span class="nav-text">AI Assistant</span>
            </a>
          </nav>

          <!-- Right: User Identity & Mobile Hamburger Toggle -->
          <div class="actions">
            <div class="identity desktop-only">
              <b>{{ auth.user()?.username }}</b>
              <span class="role-badge" [class.admin]="auth.hasRole('MARKETWATCH')">
                {{ roleLabel() }}
              </span>
            </div>

            <!-- Avatar (Desktop Only so mobile topbar stays uncluttered) -->
            <div class="avatar desktop-only" [title]="auth.user()?.username">{{ initials() }}</div>

            <button class="logout-btn desktop-only" (click)="logout()" title="Sign out of session">
              Sign out
            </button>

            <!-- Mobile Hamburger Button -->
            <button
              type="button"
              class="mobile-menu-btn"
              [class.open]="isMobileMenuOpen"
              (click)="toggleMobileMenu()"
              aria-label="Toggle Navigation Menu">
              <span class="bar"></span>
              <span class="bar"></span>
              <span class="bar"></span>
            </button>
          </div>
        </div>
      </header>

      <!-- Mobile Slide-Down Navigation Menu (Direct child of .shell, outside header to avoid backdrop-filter clipping) -->
      <div class="mobile-menu-overlay" *ngIf="isMobileMenuOpen">
        <div class="mobile-menu-backdrop" (click)="closeMobileMenu()"></div>
        <div class="mobile-menu-drawer">
          <!-- Mobile User Profile Card -->
          <div class="mobile-user-card">
            <div class="avatar large">{{ initials() }}</div>
            <div class="mobile-user-info">
              <b>{{ auth.user()?.username }}</b>
              <span class="role-badge" [class.admin]="auth.hasRole('MARKETWATCH')">
                {{ roleLabel() }}
              </span>
            </div>
          </div>

          <!-- Mobile Nav Links -->
          <nav class="mobile-nav-list">
            <a routerLink="/dashboard" routerLinkActive="active" (click)="closeMobileMenu()">
              <span class="m-icon">📊</span>
              <span class="m-label">Overview</span>
              <span class="m-arrow">›</span>
            </a>
            <a routerLink="/auctions" routerLinkActive="active" (click)="closeMobileMenu()">
              <span class="m-icon">⚡</span>
              <span class="m-label">Auctions</span>
              <span class="m-arrow">›</span>
            </a>
            <a routerLink="/participants" routerLinkActive="active" (click)="closeMobileMenu()">
              <span class="m-icon">👥</span>
              <span class="m-label">Participants</span>
              <span class="m-arrow">›</span>
            </a>
            <a routerLink="/reports" routerLinkActive="active" (click)="closeMobileMenu()">
              <span class="m-icon">📑</span>
              <span class="m-label">Reports</span>
              <span class="m-arrow">›</span>
            </a>
            <a *ngIf="auth.hasRole('MARKETWATCH')" routerLink="/mappings" routerLinkActive="active" (click)="closeMobileMenu()">
              <span class="m-icon">⚙️</span>
              <span class="m-label">Mappings</span>
              <span class="m-arrow">›</span>
            </a>
            <a routerLink="/ai-assistant" routerLinkActive="active" (click)="closeMobileMenu()">
              <span class="m-icon">✨</span>
              <span class="m-label">AI Assistant & History</span>
              <span class="m-arrow">›</span>
            </a>
          </nav>

          <!-- Mobile Sign Out Action -->
          <div class="mobile-menu-foot">
            <button class="mobile-logout-btn" (click)="logout()">
              <span>🚪</span> Sign out of session
            </button>
          </div>
        </div>
      </div>

      <main>
        <router-outlet></router-outlet>
      </main>

      <!-- Global AI Copilot Assistant -->
      <app-ai-copilot></app-ai-copilot>
    </div>
  `,
  styles: [`
    :host {
      --topbar-h: 68px;
    }

    .shell {
      min-height: 100vh;
      background: var(--bg);
    }

    .topbar {
      position: sticky;
      top: 0;
      z-index: 900;
      background: rgba(255, 255, 255, 0.96);
      backdrop-filter: blur(14px);
      -webkit-backdrop-filter: blur(14px);
      border-bottom: 1px solid var(--line);
      box-shadow: 0 1px 4px rgba(15, 23, 42, 0.04);
    }

    .topbar-inner {
      height: var(--topbar-h);
      padding: 0 28px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      max-width: 1640px;
      margin: 0 auto;
      width: 100%;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
      text-decoration: none;
      cursor: pointer;
      user-select: none;
      flex-shrink: 0;
    }

    .brand-logo-img {
      height: 38px;
      width: auto;
      max-width: 120px;
      object-fit: contain;
      flex-shrink: 0;
    }

    .brand-mark {
      width: 40px;
      height: 40px;
      border-radius: 12px;
      display: grid;
      place-items: center;
      background: linear-gradient(135deg, #6366f1, #0ea5e9);
      color: #ffffff;
      font-weight: 900;
      font-size: 18px;
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.25);
      flex-shrink: 0;
    }

    .brand-meta b {
      display: block;
      font-size: 17px;
      font-weight: 850;
      letter-spacing: -0.4px;
      color: #0f172a;
      line-height: 1.2;
    }

    .brand-sub {
      display: block;
      color: var(--muted);
      font-size: 11px;
      margin-top: 1px;
      line-height: 1.2;
    }

    /* Desktop Navigation */
    .desktop-nav {
      display: flex;
      align-items: center;
      gap: 6px;
      flex: 1;
      justify-content: center;
    }

    .desktop-nav a {
      padding: 8px 14px;
      border-radius: 10px;
      color: #64748b;
      font-size: 13px;
      font-weight: 750;
      display: inline-flex;
      align-items: center;
      gap: 7px;
      transition: all 0.15s ease;
      text-decoration: none;
      white-space: nowrap;
    }

    .desktop-nav a:hover {
      color: #0f172a;
      background: #f1f5f9;
    }

    .desktop-nav a.active {
      background: #eef2ff;
      color: #6366f1;
      font-weight: 800;
      box-shadow: inset 0 0 0 1px #c7d2fe;
    }

    .nav-icon {
      font-size: 14px;
    }

    /* Right Actions */
    .actions {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-shrink: 0;
    }

    .identity {
      text-align: right;
    }

    .identity b {
      display: block;
      font-size: 12px;
      font-weight: 800;
      color: #1e293b;
      line-height: 1.2;
    }

    .role-badge {
      display: inline-block;
      font-size: 10px;
      font-weight: 750;
      color: #64748b;
      background: #f1f5f9;
      padding: 2px 7px;
      border-radius: 999px;
      margin-top: 2px;
    }

    .role-badge.admin {
      background: #fdf4ff;
      color: #a855f7;
    }

    .avatar {
      width: 38px;
      height: 38px;
      border-radius: 50%;
      display: grid;
      place-items: center;
      background: #eef2ff;
      color: #6366f1;
      font-weight: 850;
      font-size: 13px;
      border: 2px solid #e0e7ff;
      flex-shrink: 0;
      user-select: none;
    }

    .avatar.large {
      width: 44px;
      height: 44px;
      font-size: 15px;
    }

    .logout-btn {
      border: 1px solid var(--line);
      background: #ffffff;
      border-radius: 10px;
      height: 36px;
      padding: 0 14px;
      color: #475569;
      font-size: 12.5px;
      font-weight: 750;
      box-shadow: var(--shadow-sm);
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .logout-btn:hover {
      background: #fef2f2;
      color: #ef4444;
      border-color: #fca5a5;
    }

    /* Mobile Hamburger Menu Toggle */
    .mobile-menu-btn {
      display: none;
      width: 40px;
      height: 40px;
      border-radius: 10px;
      border: 1px solid #cbd5e1;
      background: #f8fafc;
      cursor: pointer;
      padding: 0;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      gap: 4.5px;
      transition: all 0.2s ease;
    }

    .mobile-menu-btn:hover {
      background: #f1f5f9;
      border-color: #94a3b8;
    }

    .mobile-menu-btn .bar {
      width: 20px;
      height: 2px;
      background: #334155;
      border-radius: 2px;
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .mobile-menu-btn.open {
      background: #eef2ff;
      border-color: #818cf8;
    }

    .mobile-menu-btn.open .bar:nth-child(1) {
      transform: translateY(6.5px) rotate(45deg);
      background: #6366f1;
    }

    .mobile-menu-btn.open .bar:nth-child(2) {
      opacity: 0;
      transform: scaleX(0);
    }

    .mobile-menu-btn.open .bar:nth-child(3) {
      transform: translateY(-6.5px) rotate(-45deg);
      background: #6366f1;
    }

    /* Mobile Menu Overlay, Drawer & Backdrop */
    .mobile-menu-overlay {
      position: fixed;
      top: var(--topbar-h);
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 9999;
      display: flex;
      flex-direction: column;
    }

    .mobile-menu-backdrop {
      position: absolute;
      inset: 0;
      background: rgba(15, 23, 42, 0.65);
      backdrop-filter: blur(4px);
      -webkit-backdrop-filter: blur(4px);
      animation: fadeIn 0.18s ease-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .mobile-menu-drawer {
      position: relative;
      z-index: 1;
      background: #ffffff;
      width: 100%;
      max-height: calc(100vh - var(--topbar-h));
      overflow-y: auto;
      box-shadow: 0 20px 40px rgba(15, 23, 42, 0.25);
      border-bottom: 2px solid var(--line);
      padding: 16px 20px 24px;
      display: flex;
      flex-direction: column;
      animation: slideDown 0.22s cubic-bezier(0.16, 1, 0.3, 1);
    }

    @keyframes slideDown {
      from { transform: translateY(-16px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }

    .mobile-user-card {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 14px;
      background: #f8fafc;
      border-radius: 14px;
      border: 1px solid #e2e8f0;
      margin-bottom: 14px;
    }

    .mobile-user-info b {
      display: block;
      font-size: 13.5px;
      font-weight: 850;
      color: #0f172a;
    }

    .mobile-nav-list {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .mobile-nav-list a {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 14px;
      border-radius: 12px;
      font-size: 14px;
      font-weight: 750;
      color: #334155;
      text-decoration: none;
      transition: all 0.15s ease;
    }

    .mobile-nav-list a:hover {
      background: #f1f5f9;
      color: #0f172a;
    }

    .mobile-nav-list a.active {
      background: #eef2ff;
      color: #4f46e5;
      font-weight: 850;
      border-left: 3px solid #6366f1;
    }

    .m-icon {
      font-size: 16px;
    }

    .m-label {
      flex: 1;
    }

    .m-arrow {
      font-size: 18px;
      color: #94a3b8;
    }

    .mobile-menu-foot {
      margin-top: 14px;
      padding-top: 14px;
      border-top: 1px dashed #e2e8f0;
    }

    .mobile-logout-btn {
      width: 100%;
      height: 44px;
      border-radius: 12px;
      border: 1px solid #fecaca;
      background: #fff5f5;
      color: #dc2626;
      font-size: 13.5px;
      font-weight: 800;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      transition: all 0.15s ease;
    }

    .mobile-logout-btn:hover {
      background: #fee2e2;
      border-color: #f87171;
    }

    main {
      max-width: 1640px;
      margin: 0 auto;
      padding: 24px 32px 48px;
    }

    /* Responsive Breakpoints */
    @media (max-width: 1140px) {
      .brand-sub {
        display: none;
      }
      .identity {
        display: none;
      }
      .topbar-inner {
        padding: 0 20px;
      }
    }

    @media (max-width: 900px) {
      :host {
        --topbar-h: 60px;
      }
      .desktop-nav {
        display: none;
      }
      .desktop-only {
        display: none !important;
      }
      .mobile-menu-btn {
        display: flex;
      }
      .topbar-inner {
        padding: 0 16px;
      }
      main {
        padding: 16px 14px 36px;
      }
    }

    .topbar-ai-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 7px 14px;
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      color: #ffffff;
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 999px;
      font-size: 12px;
      font-weight: 750;
      letter-spacing: 0.3px;
      cursor: pointer;
      box-shadow: 0 2px 10px rgba(99, 102, 241, 0.3);
      transition: all 0.15s ease;
      margin-right: 6px;
    }

    .topbar-ai-btn:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 14px rgba(99, 102, 241, 0.45);
    }

    .mobile-ai-link {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px 16px;
      border-radius: 12px;
      background: #f5f3ff;
      border: 1px solid #ede9fe;
      color: #4f46e5;
      font-weight: 700;
      font-size: 14px;
      margin-top: 6px;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .mobile-ai-link:hover {
      background: #ede9fe;
      border-color: #ddd6fe;
    }

    @media (max-width: 480px) {
      .brand-meta b {
        font-size: 15px;
      }
      .brand-mark {
        width: 36px;
        height: 36px;
        font-size: 16px;
        border-radius: 10px;
      }
      .avatar {
        width: 34px;
        height: 34px;
        font-size: 12px;
      }
    }
  `]
})
export class AppShellComponent implements OnDestroy {
  isMobileMenuOpen = false;
  private sub?: Subscription;

  constructor(
    public auth: AuthService,
    private router: Router,
    public copilotService: AiCopilotService
  ) {
    // Automatically close mobile menu on route changes
    this.sub = this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(() => {
        this.closeMobileMenu();
      });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    if (typeof document !== 'undefined') {
      document.body.style.overflow = '';
    }
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
    this.updateBodyScroll();
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
    this.updateBodyScroll();
  }

  private updateBodyScroll(): void {
    if (typeof document !== 'undefined') {
      document.body.style.overflow = this.isMobileMenuOpen ? 'hidden' : '';
    }
  }

  logout(): void {
    this.closeMobileMenu();
    this.auth.logout();
    this.router.navigateByUrl('');
  }

  initials(): string {
    return (this.auth.user()?.username || 'U').slice(0, 2).toUpperCase();
  }

  roleLabel(): string {
    return this.auth.hasRole('MARKETWATCH') ? 'MarketWatch Admin' : 'Internal Analyst';
  }
}

