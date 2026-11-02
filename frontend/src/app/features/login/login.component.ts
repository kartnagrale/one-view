import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="login-page-root">
      <!-- Atmospheric Scenic Background Vector -->
      <div class="scenic-backdrop">
        <svg class="mountain-vector" viewBox="0 0 1440 400" fill="none" preserveAspectRatio="none">
          <path d="M 0 280 L 160 180 L 300 230 L 460 110 L 630 210 L 800 140 L 1000 250 L 1180 170 L 1440 270 L 1440 400 L 0 400 Z" fill="url(#mountainGrad1)" opacity="0.38" />
          <path d="M 0 320 L 200 240 L 390 280 L 590 180 L 760 260 L 960 200 L 1160 290 L 1320 220 L 1440 300 L 1440 400 L 0 400 Z" fill="url(#mountainGrad2)" opacity="0.5" />
          <defs>
            <linearGradient id="mountainGrad1" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#c7d2fe" stop-opacity="0.55" />
              <stop offset="100%" stop-color="#e0e7ff" stop-opacity="0.05" />
            </linearGradient>
            <linearGradient id="mountainGrad2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#bae6fd" stop-opacity="0.45" />
              <stop offset="100%" stop-color="#f8fafc" stop-opacity="0.1" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <!-- Top Header: Logo only -->
      <header class="top-header">
        <div class="header-inner">
          <a routerLink="/" class="brand-link">
            <img src="assets/nemlLogo.png" alt="NeML Logo" class="brand-logo" />
            <div class="brand-name">
              <span class="name-neml">NeML</span>
              <span class="name-oneview">OneView</span>
            </div>
          </a>
        </div>
      </header>

      <!-- Main Content (Exact 50/50 Split, Zero Scroll) -->
      <main class="main-content">
        <div class="split-50-50-container">
          <!-- LEFT 50%: Hero, Realistic Laptop Mockup & Connected Sources -->
          <div class="left-col-50">
            <!-- Eyebrow Tag -->
            <div class="eyebrow-tag">
              <span class="tag-txt">MARKET DATA</span>
              <span class="tag-sep">•</span>
              <span class="tag-txt">SMARTER DECISIONS</span>
            </div>

            <!-- Headline -->
            <h1 class="hero-headline">
              One unified view<br />
              for NeML markets
            </h1>

            <!-- Description -->
            <p class="hero-description">
              Market, Sugar, and NCDFI data in one place. Get deeper insights,
              track performance, and make faster, data-driven decisions.
            </p>

            <!-- REALISTIC LAPTOP CONTAINER (With ample clearance for floating note) -->
            <div class="laptop-wrapper">
              <!-- Handwritten Note: Positioned in open sky space with clear down-left arrow pointing to the screen -->
              <div class="handwritten-note-box">
                <div class="hw-text">
                  <span>From data</span>
                  <span>to a brighter</span>
                  <span>tomorrow</span>
                </div>
                <svg class="hw-arrow" viewBox="0 0 52 48" fill="none">
                  <!-- Graceful curved arch pointing into the screen -->
                  <path d="M 42 2 C 38 18, 22 34, 6 40" stroke="#4f46e5" stroke-width="2.2" stroke-linecap="round"/>
                  <path d="M 16 32 L 4 41 L 14 46" stroke="#4f46e5" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>

              <!-- The Laptop Device -->
              <div class="laptop-device">
                <!-- Lid (Screen Display) -->
                <div class="laptop-lid">
                  <!-- Metallic Outer Aluminum Shell -->
                  <div class="lid-metallic-frame">
                    <!-- Black Glass Bezel -->
                    <div class="bezel-inner">
                      <div class="webcam-notch">
                        <span class="camera-lens"></span>
                      </div>

                      <!-- Screen Display (16:10 Aspect Ratio, Clean Typography) -->
                      <div class="screen-surface">
                        <!-- Sidebar -->
                        <div class="screen-sidebar">
                          <div class="sidebar-logo-row">
                            <img src="assets/nemlLogo.png" alt="Logo" class="mini-logo" />
                            <span class="mini-brand-title">OneView</span>
                          </div>
                          <nav class="sidebar-nav">
                            <div class="nav-item active">
                              <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="3" y="12" width="4" height="9" rx="1"/>
                                <rect x="10" y="7" width="4" height="14" rx="1"/>
                                <rect x="17" y="3" width="4" height="18" rx="1"/>
                              </svg>
                              <span>Overview</span>
                            </div>
                            <div class="nav-item">
                              <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                              </svg>
                              <span>Dashboards</span>
                            </div>
                            <div class="nav-item">
                              <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                <polyline points="14 2 14 8 20 8"/>
                              </svg>
                              <span>Reports</span>
                            </div>
                            <div class="nav-item">
                              <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="3"/>
                                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                              </svg>
                              <span>Settings</span>
                            </div>
                          </nav>
                        </div>

                        <!-- Main Screen Area (Faithful to Reference Screenshot) -->
                        <div class="screen-main">
                          <!-- Top Banner: Welcome to NeML OneView & Date Range Pill -->
                          <div class="screen-top-banner">
                            <div class="banner-text">
                              <span class="banner-sub">Welcome to</span>
                              <div class="banner-title-row">
                                <strong class="banner-title">NeML <span class="accent-title">OneView</span></strong>
                              </div>
                              <span class="banner-tag">Unified data. Deeper insights. Stronger markets.</span>
                            </div>
                            <div class="date-range-pill">
                              <svg viewBox="0 0 24 24" width="9" height="9" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                                <line x1="16" y1="2" x2="16" y2="6"/>
                                <line x1="8" y1="2" x2="8" y2="6"/>
                                <line x1="3" y1="10" x2="21" y2="10"/>
                              </svg>
                              <span>01 Apr 2024 - 30 Apr 2024</span>
                            </div>
                          </div>

                          <!-- Screen Content: Left Chart Box + Right Promo Card -->
                          <div class="screen-content-grid">
                            <!-- Left: Chart Box -->
                            <div class="chart-box">
                              <div class="chart-header">
                                <strong class="chart-title">Market Auction Volume</strong>
                                <div class="dropdown-pill">
                                  <span>Last 6 months</span>
                                  <span class="caret">▾</span>
                                </div>
                              </div>
                              <div class="chart-with-y-axis">
                                <div class="y-axis-labels">
                                  <span>20</span>
                                  <span>15</span>
                                  <span>10</span>
                                  <span>5</span>
                                  <span>0</span>
                                </div>
                                <div class="svg-wrapper">
                                  <svg viewBox="0 0 200 64" class="svg-line-chart" preserveAspectRatio="none">
                                    <defs>
                                      <linearGradient id="chartFillGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.32" />
                                        <stop offset="100%" stop-color="#3b82f6" stop-opacity="0.01" />
                                      </linearGradient>
                                    </defs>
                                    <line x1="0" y1="8" x2="200" y2="8" stroke="#f1f5f9" stroke-width="1" />
                                    <line x1="0" y1="22" x2="200" y2="22" stroke="#f1f5f9" stroke-width="1" />
                                    <line x1="0" y1="36" x2="200" y2="36" stroke="#f1f5f9" stroke-width="1" />
                                    <line x1="0" y1="50" x2="200" y2="50" stroke="#f1f5f9" stroke-width="1" />

                                    <path d="M 0 52 Q 25 48, 40 50 T 80 32 T 120 38 T 160 16 T 200 6 L 200 64 L 0 64 Z" fill="url(#chartFillGrad)" />
                                    <path d="M 0 52 Q 25 48, 40 50 T 80 32 T 120 38 T 160 16 T 200 6" fill="none" stroke="#2563eb" stroke-width="2" stroke-linecap="round" />

                                    <circle cx="40" cy="50" r="2.5" fill="#2563eb" />
                                    <circle cx="80" cy="32" r="2.5" fill="#2563eb" />
                                    <circle cx="120" cy="38" r="2.5" fill="#2563eb" />
                                    <circle cx="160" cy="16" r="2.5" fill="#2563eb" />
                                    <circle cx="198" cy="7" r="3" fill="#2563eb" stroke="#ffffff" stroke-width="1.5" />
                                  </svg>
                                  <div class="chart-labels">
                                    <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <!-- Right: Promo Card (A clearer view to a stronger tomorrow) -->
                            <div class="screen-promo-card">
                              <div class="promo-inner">
                                <div class="promo-art-orb">
                                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#2563eb" stroke-width="2.2">
                                    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>
                                    <polyline points="16 7 22 7 22 13"/>
                                  </svg>
                                </div>
                                <h4 class="promo-text">A clearer view to a stronger tomorrow</h4>
                                <div class="promo-accent-bar"></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Floating Ambient Drop Shadow -->
                <div class="screen-shadow"></div>
              </div>
            </div>

            <!-- Connected Data Chain Card (100% Contained, Guaranteed No Overflow) -->
            <div class="chain-card">
              <!-- Market -->
              <div class="chain-node">
                <div class="c-ico blue">
                  <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor">
                    <path d="M4 19h4V9H4v10zm6 0h4V5h-4v14zm6 0h4v-7h-4v7z"/>
                  </svg>
                </div>
                <div class="c-info">
                  <strong>Market</strong>
                  <small>Auction & trade</small>
                </div>
              </div>

              <div class="c-connector">
                <span class="c-dot"></span>
              </div>

              <!-- Sugar -->
              <div class="chain-node">
                <div class="c-ico green">
                  <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor">
                    <path d="M21 16.5l-9 5.2-9-5.2V7.5l9-5.2 9 5.2v9z"/>
                  </svg>
                </div>
                <div class="c-info">
                  <strong>Sugar</strong>
                  <small>Prices & trade</small>
                </div>
              </div>

              <div class="c-connector">
                <span class="c-dot"></span>
              </div>

              <!-- NCDFI -->
              <div class="chain-node">
                <div class="c-ico orange">
                  <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor">
                    <path d="M12 3L2 12h3v8h14v-8h3L12 3zm0 2.84L18 11v7H6v-7l6-5.16z"/>
                  </svg>
                </div>
                <div class="c-info">
                  <strong>NCDFI</strong>
                  <small>Dairy & commodities</small>
                </div>
              </div>

              <div class="c-connector">
                <span class="c-dot"></span>
              </div>

              <!-- Tagline (Neatly inside the card, 100% Contained) -->
              <div class="c-tagline">
                <span>CONNECTED DATA.</span>
                <strong>STRONGER MARKETS.</strong>
              </div>
            </div>
          </div>

          <!-- RIGHT 50%: Secure Login Card -->
          <div class="right-col-50">
            <div class="login-card-box">
              <!-- Security Badge Pill -->
              <div class="security-pill">
                <svg class="shield-svg" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
                <span>Secure internal access</span>
              </div>

              <!-- Title & Subtitle -->
              <h2 class="card-main-title">Welcome back</h2>
              <p class="card-sub-title">Sign in to access dashboards, reports, and market insights.</p>

              <!-- Error & Info Alerts -->
              <div class="login-alert error" *ngIf="error">
                <span class="alert-ico">⚠️</span>
                <span>{{ error }}</span>
              </div>

              <div class="login-alert info" *ngIf="infoMessage">
                <span class="alert-ico">ℹ️</span>
                <span>{{ infoMessage }}</span>
              </div>

              <!-- Form -->
              <form (ngSubmit)="submit()" class="login-form">
                <!-- Email / Username Input -->
                <div class="form-field">
                  <label for="usernameInput">Email / Username</label>
                  <div class="field-input-wrap">
                    <svg class="leading-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    <input
                      id="usernameInput"
                      name="username"
                      type="text"
                      [(ngModel)]="username"
                      placeholder="name@neml.com"
                      autocomplete="username"
                      required />
                  </div>
                </div>

                <!-- Password Input -->
                <div class="form-field">
                  <label for="passwordInput">Password</label>
                  <div class="field-input-wrap">
                    <svg class="leading-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    <input
                      id="passwordInput"
                      name="password"
                      [type]="showPassword ? 'text' : 'password'"
                      [(ngModel)]="password"
                      placeholder="Enter your password"
                      autocomplete="current-password"
                      required />
                    <button
                      type="button"
                      class="btn-toggle-eye"
                      (click)="togglePassword()"
                      [title]="showPassword ? 'Hide password' : 'Show password'"
                      tabindex="-1">
                      <svg *ngIf="!showPassword" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                      <svg *ngIf="showPassword" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    </button>
                  </div>
                </div>

                <!-- Remember Me & Forgot Password Row -->
                <div class="options-row">
                  <label class="remember-label">
                    <input type="checkbox" [(ngModel)]="rememberMe" name="remember" />
                    <span class="checkbox-custom"></span>
                    <span class="remember-text">Remember me</span>
                  </label>

                  <a href="javascript:void(0)" class="forgot-link" (click)="onForgotPassword()">
                    Forgot password?
                  </a>
                </div>

                <!-- Login Button: Theme Gradient (#6366f1 -> #0ea5e9) with SVG User Icon -->
                <button type="submit" class="btn-login" [disabled]="loading">
                  <span class="spinner-icon" *ngIf="loading">↻</span>
                  <svg *ngIf="!loading" class="btn-user-svg" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                  <span>{{ loading ? 'Signing in…' : 'Login' }}</span>
                </button>
              </form>

              <!-- Legal Notice -->
              <div class="card-legal-footer">
                <p>Authorized internal users only.</p>
                <p>By signing in, you agree to our <a href="javascript:void(0)" (click)="onPolicyClick()">Acceptable Use Policy</a>.</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <!-- Bottom Footer (Compact) -->
      <footer class="bottom-footer">
        <div class="footer-inner">
          <div class="footer-left">
            <div class="footer-brand">
              <img src="assets/nemlLogo.png" alt="NeML Logo" class="footer-logo-img" />
              <span class="footer-brand-title"><b>NeML</b> OneView</span>
            </div>
            <p class="footer-slogan">Intelligence for stronger markets.</p>
          </div>

          <div class="footer-right">
            <nav class="footer-links">
              <a href="https://neml.in" target="_blank" rel="noopener">Help</a>
              <span class="sep">|</span>
              <a href="https://neml.in" target="_blank" rel="noopener">Privacy</a>
              <span class="sep">|</span>
              <a href="https://neml.in" target="_blank" rel="noopener">Terms</a>
              <span class="sep">|</span>
              <a href="https://neml.in" target="_blank" rel="noopener">Contact</a>
            </nav>
            <span class="footer-copy">© 2026 NeML. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      height: 100vh;
      max-height: 100vh;
      background: #f8fafc;
      color: #0f172a;
      font-family: 'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      overflow: hidden;
    }

    .login-page-root {
      height: 100vh;
      max-height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      position: relative;
      background: #f8fafc;
      overflow: hidden;
    }

    /* Atmospheric Scenic Background */
    .scenic-backdrop {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 400px;
      pointer-events: none;
      z-index: 0;
      background: linear-gradient(180deg, rgba(238, 242, 255, 0.65) 0%, rgba(248, 250, 252, 0) 100%);
    }

    .mountain-vector {
      width: 100%;
      height: 100%;
      position: absolute;
      bottom: 0;
      left: 0;
    }

    /* Compact Header */
    .top-header {
      position: relative;
      z-index: 10;
      padding: 14px 0 2px;
      flex-shrink: 0;
    }

    .header-inner {
      max-width: 1380px;
      margin: 0 auto;
      padding: 0 44px;
    }

    .brand-link {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      text-decoration: none;
    }

    .brand-logo {
      height: 32px;
      width: auto;
      object-fit: contain;
    }

    .brand-name {
      font-size: 18px;
      font-weight: 850;
      letter-spacing: -0.4px;
      display: flex;
      gap: 5px;
    }

    .name-neml { color: #0f172a; }
    .name-oneview { color: #6366f1; }

    /* Main Content (50/50 Split) */
    .main-content {
      flex: 1;
      position: relative;
      z-index: 1;
      display: flex;
      align-items: center;
      padding: 0;
      overflow: hidden;
    }

    .split-50-50-container {
      max-width: 1380px;
      width: 100%;
      margin: 0 auto;
      padding: 0 44px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 48px;
      align-items: center;
    }

    /* LEFT 50% COLUMN */
    .left-col-50 {
      position: relative;
    }

    .eyebrow-tag {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 10.5px;
      font-weight: 800;
      color: #6366f1;
      letter-spacing: 1.2px;
      margin-bottom: 3px;
    }

    .tag-sep { color: #cbd5e1; }

    .hero-headline {
      font-size: 34px;
      font-weight: 900;
      line-height: 1.14;
      letter-spacing: -0.8px;
      color: #0f172a;
      margin: 0 0 5px;
    }

    .hero-description {
      font-size: 13.5px;
      line-height: 1.45;
      color: #475569;
      margin: 0 0 10px;
      max-width: 480px;
    }

    /* REALISTIC LAPTOP CONTAINER (100% responsive) */
    .laptop-wrapper {
      position: relative;
      max-width: 530px;
      width: 100%;
      margin: 44px auto 10px;
    }

    /* Handwritten Note: Positioned in open sky space with clear down-left arrow pointing to the screen */
    .handwritten-note-box {
      position: absolute;
      top: -68px;
      right: 28px;
      display: flex;
      flex-direction: column;
      align-items: center;
      font-family: 'Caveat', 'Segoe Print', cursive, sans-serif;
      color: #4f46e5;
      transform: rotate(-2deg);
      z-index: 15;
      pointer-events: none;
    }

    .hw-text {
      display: flex;
      flex-direction: column;
      align-items: center;
      font-size: 15px;
      font-weight: 700;
      line-height: 1.12;
      text-align: center;
    }

    .hw-arrow {
      width: 42px;
      height: 38px;
      margin-top: 1px;
      margin-left: -14px;
    }

    .laptop-device,
    .screen-device {
      position: relative;
      width: 100%;
    }

    /* Screen Display Frame (Only Screen) */
    .laptop-lid {
      width: 100%;
      margin: 0 auto;
      border-radius: 16px;
      background: #0f172a;
      box-shadow:
        0 20px 45px -10px rgba(15, 23, 42, 0.24),
        0 4px 12px -2px rgba(15, 23, 42, 0.08);
      position: relative;
    }

    .lid-metallic-frame {
      border: 2.5px solid #334155;
      border-radius: 16px;
      background: #0f172a;
      padding: 7px;
    }

    .bezel-inner {
      position: relative;
    }

    .webcam-notch {
      width: 5px;
      height: 5px;
      background: #1e293b;
      border-radius: 50%;
      position: absolute;
      top: -5px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .camera-lens {
      width: 2px;
      height: 2px;
      background: #0ea5e9;
      border-radius: 50%;
    }

    /* Screen Display: 16:10 Ratio, height: 255px, crisp typography */
    .screen-surface {
      background: #ffffff;
      border-radius: 9px;
      overflow: hidden;
      display: grid;
      grid-template-columns: 105px 1fr;
      height: 255px;
      box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.1);
      font-family: 'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif;
    }

    /* Sidebar */
    .screen-sidebar {
      background: #0d1527;
      color: #ffffff;
      padding: 10px 8px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .sidebar-logo-row {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .mini-logo {
      width: 14px;
      height: 14px;
      object-fit: contain;
    }

    .mini-brand-title {
      font-size: 11px;
      font-weight: 800;
      color: #ffffff;
      letter-spacing: -0.2px;
    }

    .sidebar-nav {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 9.5px;
      font-weight: 600;
      padding: 5px 6px;
      border-radius: 5px;
      color: #94a3b8;
      transition: all 0.15s ease;
    }

    .nav-item.active {
      background: #2563eb;
      color: #ffffff;
      font-weight: 750;
    }

    /* Screen Main Area */
    .screen-main {
      padding: 8px 10px;
      background: #f8fafc;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    /* Screen Top Banner */
    .screen-top-banner {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding-bottom: 5px;
      border-bottom: 1px solid #f1f5f9;
    }

    .banner-text {
      display: flex;
      flex-direction: column;
    }

    .banner-sub {
      font-size: 7.5px;
      color: #64748b;
      font-weight: 500;
      line-height: 1.1;
    }

    .banner-title-row {
      display: flex;
      align-items: center;
      gap: 3px;
    }

    .banner-title {
      font-size: 11px;
      font-weight: 850;
      color: #0f172a;
      letter-spacing: -0.2px;
      line-height: 1.2;
    }

    .accent-title {
      color: #2563eb;
    }

    .banner-tag {
      font-size: 6.5px;
      color: #94a3b8;
      font-weight: 500;
      line-height: 1.2;
    }

    .date-range-pill {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 4px;
      padding: 2px 6px;
      font-size: 7.5px;
      color: #64748b;
      font-weight: 600;
      box-shadow: 0 1px 2px rgba(15, 23, 42, 0.02);
      flex-shrink: 0;
    }

    /* Screen Content Grid */
    .screen-content-grid {
      display: grid;
      grid-template-columns: 1fr 105px;
      gap: 6px;
      flex: 1;
    }

    .chart-box {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 6px 8px 3px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    .chart-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2px;
    }

    .chart-title {
      font-size: 9.5px;
      font-weight: 800;
      color: #0f172a;
    }

    .dropdown-pill {
      font-size: 7px;
      font-weight: 600;
      color: #64748b;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      padding: 1px 5px;
      border-radius: 3px;
      display: flex;
      align-items: center;
      gap: 2px;
    }

    .chart-with-y-axis {
      display: flex;
      gap: 5px;
      align-items: center;
    }

    .y-axis-labels {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      height: 70px;
      font-size: 6.5px;
      color: #94a3b8;
      font-weight: 600;
      text-align: right;
      width: 12px;
    }

    .svg-wrapper {
      flex: 1;
    }

    .svg-line-chart {
      width: 100%;
      height: 70px;
    }

    .chart-labels {
      display: flex;
      justify-content: space-between;
      font-size: 6.5px;
      font-weight: 600;
      color: #94a3b8;
      margin-top: 1px;
    }

    /* Screen Promo Card */
    .screen-promo-card {
      background: linear-gradient(135deg, #eff6ff 0%, #f8fafc 100%);
      border: 1px solid #dbeafe;
      border-radius: 6px;
      padding: 10px 8px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
    }

    .promo-inner {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
    }

    .promo-art-orb {
      width: 26px;
      height: 26px;
      border-radius: 50%;
      background: #dbeafe;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .promo-text {
      font-size: 9px;
      font-weight: 800;
      color: #1e293b;
      line-height: 1.3;
      margin: 0;
    }

    .promo-accent-bar {
      width: 28px;
      height: 2.5px;
      background: #2563eb;
      border-radius: 2px;
      margin-top: 2px;
    }

    /* Floating Ambient Drop Shadow */
    .screen-shadow {
      width: 90%;
      height: 16px;
      margin: 8px auto 0;
      background: radial-gradient(ellipse at center, rgba(15, 23, 42, 0.22) 0%, rgba(15, 23, 42, 0) 75%);
      filter: blur(3px);
    }

    /* Connected Chain Card: 100% Contained, Guaranteed No Overflow */
    .chain-card {
      display: flex;
      align-items: center;
      gap: 4px;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 7px 12px;
      box-shadow: 0 2px 6px rgba(15, 23, 42, 0.04);
      max-width: 530px;
      width: 100%;
      box-sizing: border-box;
      margin: 0 auto;
      overflow: hidden;
    }

    .chain-node {
      display: flex;
      align-items: center;
      gap: 5px;
      flex-shrink: 0;
    }

    .c-ico {
      width: 22px;
      height: 22px;
      border-radius: 5px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .c-ico.blue { background: #eef2ff; color: #6366f1; }
    .c-ico.green { background: #ecfdf5; color: #10b981; }
    .c-ico.orange { background: #fffbeb; color: #f59e0b; }

    .c-info strong {
      display: block;
      font-size: 10px;
      font-weight: 750;
      color: #0f172a;
      line-height: 1.15;
    }

    .c-info small {
      display: block;
      font-size: 7.5px;
      color: #64748b;
      line-height: 1.15;
      white-space: nowrap;
    }

    .c-connector {
      flex: 1;
      height: 1px;
      border-top: 1.5px dashed #cbd5e1;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      min-width: 6px;
    }

    .c-dot {
      width: 3.5px;
      height: 3.5px;
      border-radius: 50%;
      background: #6366f1;
      position: absolute;
    }

    .c-tagline {
      font-size: 7.5px;
      color: #64748b;
      letter-spacing: 0.4px;
      line-height: 1.2;
      padding-left: 8px;
      border-left: 1px solid #e2e8f0;
      flex-shrink: 0;
      white-space: nowrap;
    }

    .c-tagline strong {
      color: #0f172a;
      font-weight: 800;
      display: block;
    }

    /* RIGHT 50% COLUMN (Login Card) */
    .right-col-50 {
      display: flex;
      justify-content: center;
      width: 100%;
    }

    .login-card-box {
      width: 100%;
      max-width: 460px;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 20px;
      padding: 30px 34px;
      box-shadow:
        0 20px 50px -10px rgba(15, 23, 42, 0.1),
        0 4px 14px -2px rgba(15, 23, 42, 0.03);
    }

    /* Security Pill */
    .security-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: #ecfdf5;
      border: 1px solid #a7f3d0;
      color: #059669;
      padding: 5px 12px;
      border-radius: 999px;
      font-size: 11px;
      font-weight: 700;
      margin-bottom: 14px;
    }

    .shield-svg {
      color: #10b981;
    }

    .card-main-title {
      font-size: 28px;
      font-weight: 900;
      letter-spacing: -0.6px;
      color: #0f172a;
      margin: 0 0 6px;
    }

    .card-sub-title {
      font-size: 13px;
      color: #64748b;
      margin: 0 0 18px;
      line-height: 1.45;
    }

    /* Alerts */
    .login-alert {
      padding: 8px 12px;
      border-radius: 8px;
      font-size: 12px;
      display: flex;
      align-items: center;
      gap: 6px;
      margin-bottom: 14px;
    }

    .login-alert.error {
      background: #fef2f2;
      border: 1px solid #fecaca;
      color: #b91c1c;
    }

    .login-alert.info {
      background: #eef2ff;
      border: 1px solid #c7d2fe;
      color: #4338ca;
    }

    /* Form */
    .login-form {
      display: flex;
      flex-direction: column;
      gap: 13px;
    }

    .form-field {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }

    .form-field label {
      font-size: 12.5px;
      font-weight: 750;
      color: #1e293b;
    }

    .field-input-wrap {
      position: relative;
      display: flex;
      align-items: center;
    }

    .leading-icon {
      position: absolute;
      left: 13px;
      color: #94a3b8;
      pointer-events: none;
    }

    .field-input-wrap input {
      width: 100%;
      height: 44px;
      padding: 0 38px 0 40px;
      border: 1.5px solid #cbd5e1;
      border-radius: 10px;
      font-size: 13.5px;
      color: #0f172a;
      background: #ffffff;
      outline: none;
      transition: all 0.2s ease;
    }

    /* Neutralize Harsh Browser Autofill Colors */
    .field-input-wrap input:-webkit-autofill,
    .field-input-wrap input:-webkit-autofill:hover,
    .field-input-wrap input:-webkit-autofill:focus {
      -webkit-box-shadow: 0 0 0px 1000px #ffffff inset !important;
      -webkit-text-fill-color: #0f172a !important;
      transition: background-color 5000s ease-in-out 0s;
    }

    .field-input-wrap input:focus {
      border-color: #6366f1;
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.14);
    }

    .btn-toggle-eye {
      position: absolute;
      right: 10px;
      background: transparent;
      border: none;
      color: #94a3b8;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 4px;
      transition: color 0.15s ease;
    }

    .btn-toggle-eye:hover {
      color: #475569;
    }

    /* Options Row */
    .options-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 1px;
      font-size: 12.5px;
    }

    .remember-label {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      cursor: pointer;
      user-select: none;
      color: #475569;
      font-weight: 600;
    }

    .remember-label input {
      cursor: pointer;
      width: 15px;
      height: 15px;
      accent-color: #6366f1;
    }

    .forgot-link {
      color: #6366f1;
      font-weight: 700;
      text-decoration: none;
      transition: color 0.15s ease;
    }

    .forgot-link:hover {
      color: #4f46e5;
      text-decoration: underline;
    }

    /* Login Submit Button */
    .btn-login {
      height: 46px;
      width: 100%;
      border: none;
      border-radius: 10px;
      background: linear-gradient(135deg, #6366f1 0%, #0ea5e9 100%);
      color: #ffffff;
      font-size: 14px;
      font-weight: 750;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.28);
      transition: all 0.2s ease;
      margin-top: 4px;
    }

    .btn-login:hover:not(:disabled) {
      background: linear-gradient(135deg, #4f46e5 0%, #0284c7 100%);
      transform: translateY(-1px);
      box-shadow: 0 6px 16px rgba(99, 102, 241, 0.36);
    }

    .btn-login:disabled {
      opacity: 0.65;
      cursor: not-allowed;
    }

    .btn-user-svg {
      width: 16px;
      height: 16px;
    }

    .spinner-icon {
      display: inline-block;
      animation: spin 1s infinite linear;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    /* Legal Footer */
    .card-legal-footer {
      margin-top: 16px;
      text-align: center;
      font-size: 11px;
      color: #64748b;
      line-height: 1.45;
    }

    .card-legal-footer p {
      margin: 2px 0;
    }

    .card-legal-footer a {
      color: #6366f1;
      text-decoration: underline;
      cursor: pointer;
    }

    .card-legal-footer a:hover {
      color: #4f46e5;
    }

    /* Compact Bottom Footer */
    .bottom-footer {
      position: relative;
      z-index: 10;
      border-top: 1px solid rgba(226, 232, 240, 0.8);
      background: rgba(255, 255, 255, 0.92);
      backdrop-filter: blur(10px);
      padding: 10px 0;
      flex-shrink: 0;
    }

    .footer-inner {
      max-width: 1380px;
      margin: 0 auto;
      padding: 0 44px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .footer-left {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .footer-brand {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .footer-logo-img {
      height: 18px;
      width: auto;
      object-fit: contain;
    }

    .footer-brand-title {
      font-size: 13px;
      color: #0f172a;
    }

    .footer-slogan {
      font-size: 10.5px;
      color: #64748b;
      margin: 0;
    }

    .footer-right {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 3px;
    }

    .footer-links {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 11px;
      color: #64748b;
    }

    .footer-links a {
      color: #64748b;
      text-decoration: none;
      transition: color 0.15s ease;
    }

    .footer-links a:hover {
      color: #6366f1;
    }

    .footer-links .sep {
      color: #cbd5e1;
      font-size: 10px;
    }

    .footer-copy {
      font-size: 10px;
      color: #94a3b8;
    }

    /* Responsive adjustments for smaller screens */
    @media (max-height: 720px) {
      .top-header { padding: 8px 0 4px; }
      .bottom-footer { padding: 6px 0; }
      .hero-headline { font-size: 28px; margin-bottom: 4px; }
      .hero-description { font-size: 12.5px; margin-bottom: 6px; }
      .screen-surface { height: 180px; }
      .svg-line-chart { height: 42px; }
      .login-card-box { padding: 22px 28px; }
      .card-main-title { font-size: 24px; }
      .field-input-wrap input { height: 40px; }
      .btn-login { height: 42px; }
    }

    @media (max-width: 1080px) {
      :host, .login-page-root {
        height: auto;
        max-height: none;
        overflow-y: auto;
      }
      .split-50-50-container {
        grid-template-columns: 1fr;
        gap: 36px;
      }
      .left-col-50 {
        text-align: center;
      }
      .hero-description {
        margin: 0 auto 14px;
      }
      .handwritten-note-box {
        display: none;
      }
      .chain-card {
        flex-wrap: wrap;
        justify-content: center;
      }
      .c-connector {
        display: none;
      }
    }

    @media (max-width: 640px) {
      .hero-headline {
        font-size: 26px;
      }
      .laptop-wrapper {
        max-width: 100%;
        margin: 20px auto 10px;
      }
      .screen-surface {
        height: 190px;
        grid-template-columns: 85px 1fr;
      }
      .login-card-box {
        padding: 24px 18px;
      }
      .footer-inner {
        flex-direction: column;
        gap: 12px;
        text-align: center;
      }
      .footer-right {
        align-items: center;
      }
    }
  `]
})
export class LoginComponent {
  username = '';
  password = '';
  rememberMe = true;
  showPassword = false;
  loading = false;
  error = '';
  infoMessage = '';

  constructor(private auth: AuthService, private router: Router) {}

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  onForgotPassword(): void {
    this.infoMessage = 'Password resets are managed through NeML Active Directory. Please contact your IT administrator at it-support@neml.in.';
  }

  onPolicyClick(): void {
    this.infoMessage = 'All trading data and market analytics within NeML OneView are confidential and proprietary to NeML.';
  }

  submit(): void {
    this.error = '';
    this.infoMessage = '';
    this.loading = true;

    this.auth.login(this.username, this.password).subscribe({
      next: () => {
        this.router.navigateByUrl('/dashboard');
      },
      error: () => {
        this.auth.logout();
        this.error = 'Invalid credentials or backend unavailable. Please try again.';
        this.loading = false;
      }
    });
  }
}
