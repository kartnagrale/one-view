import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="home-page">
      <!-- Top Navigation Bar: ONLY Brand Logo & Login Button -->
      <header class="home-header">
        <div class="header-inner">
          <div class="brand-group">
            <img src="assets/nemlLogo.png" alt="NeML Logo" class="brand-logo" />
            <div class="brand-name">
              <span class="name-neml">NeML</span>
              <span class="name-oneview">One-View</span>
            </div>
          </div>

          <!-- Nav Actions: ONLY Login Button as requested -->
          <div class="nav-actions">
            <button type="button" class="login-btn" (click)="goToLogin()">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" class="user-svg-icon">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
              <span>{{ auth.isLoggedIn() ? 'Go to Dashboard' : 'Login' }}</span>
            </button>
          </div>
        </div>
      </header>

      <!-- Hero Section -->
      <section class="hero-section">
        <div class="hero-container">
          <!-- Left Column: Headline, Description & CTAs -->
          <div class="hero-content">
            <div class="hero-tag">
              <span class="tag-text">MARKET DATA</span>
              <span class="tag-dot">•</span>
              <span class="tag-text">SMARTER DECISIONS</span>
            </div>

            <h1 class="hero-title">
              One unified view <br />
              for <span class="highlight-text">NeML markets</span>
            </h1>

            <p class="hero-desc">
              Bring together Market, Sugar, and NCDFI data in one place. Get deeper insights,
              track performance, and make faster, data-driven decisions.
            </p>

            <div class="hero-ctas">
              <button type="button" class="btn-primary" (click)="goToDashboard()">
                <span>Explore Dashboard</span>
                <span class="btn-arrow">→</span>
              </button>
              <button type="button" class="btn-secondary" (click)="goToReports()">
                <span class="icon">📊</span>
                <span>View Reports</span>
              </button>
            </div>
          </div>

          <!-- Right Column: Interactive UI Mockup Device Frame -->
          <div class="hero-visual">
            <div class="handwritten-note">
              <span>From data to a brighter tomorrow</span>
              <svg class="curved-arrow" viewBox="0 0 60 40" fill="none">
                <path d="M10 5 C 30 5, 45 15, 40 32 M 34 26 L 40 33 L 46 27" stroke="#6366f1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>

            <!-- Laptop / Application Window Mockup -->
            <div class="device-mockup">
              <div class="mockup-frame">
                <div class="window-topbar">
                  <div class="window-dots">
                    <span class="w-dot red"></span>
                    <span class="w-dot yellow"></span>
                    <span class="w-dot green"></span>
                  </div>
                  <div class="window-url">neml-oneview.neml.in/dashboard</div>
                </div>

                <div class="mockup-content">
                  <!-- Mini App Sidebar -->
                  <div class="mock-sidebar">
                    <div class="mock-brand">
                      <img src="assets/nemlLogo.png" alt="Logo" class="mini-logo" />
                      <b>One-View</b>
                    </div>
                    <nav class="mock-nav">
                      <div class="mock-nav-item active"><span>📊</span> Overview</div>
                      <div class="mock-nav-item"><span>⚡</span> Auctions</div>
                      <div class="mock-nav-item"><span>👥</span> Participants</div>
                      <div class="mock-nav-item"><span>📑</span> Reports</div>
                      <div class="mock-nav-item"><span>⚙️</span> Settings</div>
                    </nav>
                  </div>

                  <!-- Mini App Main View -->
                  <div class="mock-main">
                    <div class="mock-head">
                      <div>
                        <small>Welcome to</small>
                        <h3>NeML <span>One-View</span></h3>
                        <span class="sub-lead">Unified data. Deeper insights. Stronger markets.</span>
                      </div>
                      <div class="mock-date-pill">01 Apr 2024 - 30 Apr 2024</div>
                    </div>

                    <!-- Mini Chart Card -->
                    <div class="mock-chart-card">
                      <div class="chart-header">
                        <strong>Market Auction Volume</strong>
                        <span class="chart-tag">+14.2% MoM</span>
                      </div>
                      <div class="svg-chart-wrap">
                        <svg viewBox="0 0 320 90" class="mini-svg-chart">
                          <defs>
                            <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stop-color="#6366f1" stop-opacity="0.35" />
                              <stop offset="100%" stop-color="#6366f1" stop-opacity="0.0" />
                            </linearGradient>
                          </defs>
                          <path d="M 0 75 Q 40 60, 80 65 T 160 38 T 240 45 T 320 18 L 320 90 L 0 90 Z" fill="url(#chartGrad)" />
                          <path d="M 0 75 Q 40 60, 80 65 T 160 38 T 240 45 T 320 18" fill="none" stroke="#6366f1" stroke-width="3" stroke-linecap="round" />
                          <circle cx="80" cy="65" r="4" fill="#6366f1" />
                          <circle cx="160" cy="38" r="4" fill="#6366f1" />
                          <circle cx="240" cy="45" r="4" fill="#6366f1" />
                          <circle cx="320" cy="18" r="5" fill="#6366f1" stroke="#ffffff" stroke-width="2" />
                        </svg>
                      </div>
                      <div class="chart-x-axis">
                        <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span>
                      </div>
                    </div>

                    <!-- Mini Tomorrow Promo Card -->
                    <div class="mock-bottom-card">
                      <div class="promo-text">
                        <b>A clearer view to a stronger tomorrow</b>
                        <p>Real-time synchronisation across NeML systems.</p>
                      </div>
                      <div class="promo-bar"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Key Benefits Section -->
      <section class="benefits-section">
        <div class="section-container">
          <div class="section-header">
            <span class="section-eyebrow">KEY BENEFITS</span>
            <h2 class="section-title">Built for a clearer tomorrow</h2>
            <p class="section-subtitle">Turn connected data into real insights for stronger, more efficient markets.</p>
          </div>

          <div class="benefits-grid">
            <!-- Benefit 1 -->
            <article class="benefit-card">
              <div class="benefit-icon-box blue">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="6" cy="6" r="3" />
                  <circle cx="18" cy="6" r="3" />
                  <circle cx="12" cy="18" r="3" />
                  <line x1="8.5" y1="7.5" x2="15.5" y2="7.5" />
                  <line x1="7.5" y1="8.5" x2="10.5" y2="15.5" />
                  <line x1="16.5" y1="8.5" x2="13.5" y2="15.5" />
                </svg>
              </div>
              <h3>Unified Insights</h3>
              <p>Market, Sugar, and NCDFI data in one connected view.</p>
            </article>

            <!-- Benefit 2 -->
            <article class="benefit-card">
              <div class="benefit-icon-box purple">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14 4l6 6-2 2-6-6 2-2z" />
                  <path d="M2 22l6-6" />
                  <path d="M10 14l-2 2" />
                  <path d="M15 9l2 2" />
                </svg>
              </div>
              <h3>Auction Intelligence</h3>
              <p>Track auction performance, participation, and price discovery trends.</p>
            </article>

            <!-- Benefit 3 -->
            <article class="benefit-card">
              <div class="benefit-icon-box teal">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <h3>Participant Visibility</h3>
              <p>Understand market participation and counterparty activity across systems.</p>
            </article>

            <!-- Benefit 4 -->
            <article class="benefit-card">
              <div class="benefit-icon-box green">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <path d="M9 12l2 2 4-4" />
                </svg>
              </div>
              <h3>Secure Access</h3>
              <p>Role-based access with enterprise-grade NeML security and data isolation.</p>
            </article>
          </div>
        </div>
      </section>

      <!-- Connected Sources Diagram Section -->
      <section class="sources-section">
        <div class="section-container">
          <div class="sources-grid">
            <!-- Left: Description -->
            <div class="sources-info">
              <span class="section-eyebrow">CONNECTED SOURCES</span>
              <h2 class="section-title">Three systems.<br />One unified view.</h2>
              <div class="title-underline"></div>
              <p class="sources-desc">
                Market, Sugar, and NCDFI data flow together to give you a complete and consistent
                view across NeML markets.
              </p>
            </div>

            <!-- Right: Interactive Architecture Diagram -->
            <div class="sources-diagram">
              <div class="source-nodes">
                <!-- Source 1: Market -->
                <div class="source-node-card">
                  <div class="node-icon blue">📊</div>
                  <div class="node-text">
                    <strong>Market</strong>
                    <small>Auction and trade data from NeML Market</small>
                  </div>
                </div>

                <!-- Source 2: Sugar -->
                <div class="source-node-card">
                  <div class="node-icon green">📦</div>
                  <div class="node-text">
                    <strong>Sugar</strong>
                    <small>Sugar operations and trade data</small>
                  </div>
                </div>

                <!-- Source 3: NCDFI -->
                <div class="source-node-card">
                  <div class="node-icon orange">🏛️</div>
                  <div class="node-text">
                    <strong>NCDFI</strong>
                    <small>NCDFI dairy & commodity data</small>
                  </div>
                </div>
              </div>

              <!-- Connecting Dotted Paths -->
              <div class="connector-graphic">
                <svg viewBox="0 0 100 200" class="connector-svg" preserveAspectRatio="none">
                  <path d="M 0 35 C 50 35, 60 100, 100 100" stroke="#6366f1" stroke-width="2.5" stroke-dasharray="5 5" fill="none" class="flow-line" />
                  <path d="M 0 100 L 100 100" stroke="#10b981" stroke-width="2.5" stroke-dasharray="5 5" fill="none" class="flow-line" />
                  <path d="M 0 165 C 50 165, 60 100, 100 100" stroke="#f59e0b" stroke-width="2.5" stroke-dasharray="5 5" fill="none" class="flow-line" />
                </svg>
              </div>

              <!-- Central Destination Hub Card -->
              <div class="hub-card">
                <div class="hub-header">
                  <img src="assets/nemlLogo.png" alt="NeML Logo" class="hub-logo" />
                  <div class="hub-title">
                    <span class="hub-neml">NeML</span>
                    <span class="hub-oneview">One-View</span>
                  </div>
                </div>
                <div class="hub-badge">
                  <span class="hub-badge-icon">🗂️</span>
                  <strong>Unified Insights Layer</strong>
                </div>
                <p class="hub-sub">Synchronized in-memory multi-market snapshot</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Key Metrics Section -->
      <section class="metrics-section">
        <div class="section-container">
          <div class="metrics-grid">
            <div class="metrics-intro">
              <span class="section-eyebrow">KEY METRICS</span>
              <h2 class="section-title">Markets in focus.<br />Impact in numbers.</h2>
              <p class="section-subtitle">A snapshot of activity across NeML markets (live data).</p>
            </div>

            <div class="metrics-cards-row">
              <!-- Metric 1 -->
              <article class="metric-card">
                <div class="metric-icon blue">⚡</div>
                <strong class="metric-val">124+</strong>
                <span class="metric-label">Total Auctions</span>
                <div class="metric-trend up">
                  <span>↗ +12%</span>
                  <small>vs. last month</small>
                </div>
              </article>

              <!-- Metric 2 -->
              <article class="metric-card">
                <div class="metric-icon purple">₹</div>
                <strong class="metric-val">₹2.8B</strong>
                <span class="metric-label">Trade Value</span>
                <div class="metric-trend up">
                  <span>↗ +18%</span>
                  <small>vs. last month</small>
                </div>
              </article>

              <!-- Metric 3 -->
              <article class="metric-card">
                <div class="metric-icon teal">👥</div>
                <strong class="metric-val">1,240</strong>
                <span class="metric-label">Registered Bidders</span>
                <div class="metric-trend up">
                  <span>↗ +9%</span>
                  <small>vs. last month</small>
                </div>
              </article>

              <!-- Metric 4 -->
              <article class="metric-card">
                <div class="metric-icon orange">📊</div>
                <strong class="metric-val">3</strong>
                <span class="metric-label">Active Markets</span>
                <div class="metric-trend neutral">
                  <span>— Stable</span>
                  <small>vs. last month</small>
                </div>
              </article>
            </div>
          </div>
        </div>
      </section>

      <!-- Ready to Explore CTA Banner -->
      <section class="cta-banner-section">
        <div class="section-container">
          <div class="cta-banner-card">
            <div class="cta-banner-text">
              <span class="cta-eyebrow">READY TO EXPLORE?</span>
              <h2>Access dashboards and reports</h2>
              <p>Get the insights you need to make smarter decisions, faster.</p>
            </div>
            <div class="cta-banner-actions">
              <button type="button" class="btn-primary-banner" (click)="goToDashboard()">
                <span>Explore Dashboard</span>
                <span class="btn-arrow">→</span>
              </button>
              <button type="button" class="btn-secondary-banner" (click)="goToReports()">
                <span class="icon">📊</span>
                <span>View Reports</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- Footer -->
      <footer class="home-footer">
        <div class="footer-container">
          <div class="footer-left">
            <div class="footer-brand">
              <img src="assets/nemlLogo.png" alt="NeML Logo" class="footer-logo" />
              <span class="footer-brand-text"><b>NeML</b> One-View</span>
            </div>
            <p class="footer-slogan">Intelligence for stronger markets.</p>
          </div>

          <div class="footer-right">
            <nav class="footer-links">
              <a href="https://neml.in" target="_blank" rel="noopener">NeML Corporate</a>
              <span>|</span>
              <a routerLink="/login">Login</a>
              <span>|</span>
              <a routerLink="/dashboard">Overview</a>
              <span>|</span>
              <a routerLink="/reports">Reports</a>
            </nav>
            <span class="copyright">© 2026 NeML. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      background: #ffffff;
      color: #0f172a;
      font-family: 'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    }

    .home-page {
      min-height: 100vh;
      overflow-x: hidden;
    }

    /* Top Navigation Bar: Compact & Minimal */
    .home-header {
      position: sticky;
      top: 0;
      z-index: 100;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border-bottom: 1px solid #e2e8f0;
    }

    .header-inner {
      max-width: 1200px;
      margin: 0 auto;
      height: 62px;
      padding: 0 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .brand-group {
      display: flex;
      align-items: center;
      gap: 12px;
      text-decoration: none;
    }

    .brand-logo {
      height: 38px;
      width: auto;
      object-fit: contain;
    }

    .brand-name {
      font-size: 19px;
      font-weight: 850;
      letter-spacing: -0.4px;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .name-neml {
      color: #0f172a;
    }

    .name-oneview {
      color: #6366f1;
    }

    .nav-actions {
      display: flex;
      align-items: center;
    }

    .login-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      height: 38px;
      padding: 0 18px;
      background: linear-gradient(135deg, #6366f1 0%, #0ea5e9 100%);
      color: #ffffff;
      border-radius: 10px;
      font-weight: 750;
      font-size: 13.5px;
      cursor: pointer;
      box-shadow: 0 4px 14px rgba(99, 102, 241, 0.25);
      transition: all 0.2s ease;
      border: none;
    }

    .login-btn:hover {
      background: linear-gradient(135deg, #4f46e5 0%, #0284c7 100%);
      transform: translateY(-1px);
      box-shadow: 0 6px 18px rgba(99, 102, 241, 0.35);
    }

    .user-svg-icon {
      width: 15px;
      height: 15px;
      flex-shrink: 0;
    }

    /* Hero Section: Compact & Aligned with Dashboard theme */
    .hero-section {
      padding: 36px 0 42px;
      background: radial-gradient(circle at 85% 15%, rgba(224, 231, 255, 0.65) 0%, rgba(255, 255, 255, 0) 50%),
                  radial-gradient(circle at 10% 85%, rgba(245, 243, 255, 0.6) 0%, rgba(255, 255, 255, 0) 40%);
    }

    .hero-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 24px;
      display: grid;
      grid-template-columns: 1fr 1.15fr;
      gap: 36px;
      align-items: center;
    }

    .hero-tag {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-size: 11px;
      font-weight: 800;
      color: #6366f1;
      letter-spacing: 1.2px;
      margin-bottom: 12px;
    }

    .tag-dot {
      color: #c7d2fe;
    }

    .hero-title {
      font-size: 40px;
      font-weight: 900;
      line-height: 1.18;
      letter-spacing: -1px;
      color: #0f172a;
      margin: 0 0 14px;
    }

    .hero-title .highlight-text {
      color: #6366f1;
    }

    .hero-desc {
      font-size: 15px;
      line-height: 1.55;
      color: #475569;
      margin: 0 0 24px;
      max-width: 480px;
    }

    .hero-ctas {
      display: flex;
      gap: 12px;
      align-items: center;
    }

    .btn-primary {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 11px 22px;
      background: linear-gradient(135deg, #6366f1 0%, #0ea5e9 100%);
      color: #ffffff;
      border-radius: 10px;
      font-size: 14px;
      font-weight: 750;
      border: none;
      cursor: pointer;
      box-shadow: 0 4px 14px rgba(99, 102, 241, 0.25);
      transition: all 0.2s ease;
    }

    .btn-primary:hover {
      background: linear-gradient(135deg, #4f46e5 0%, #0284c7 100%);
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(99, 102, 241, 0.35);
    }

    .btn-secondary {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 11px 20px;
      background: #ffffff;
      color: #4f46e5;
      border: 1.5px solid #c7d2fe;
      border-radius: 9px;
      font-size: 14px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-secondary:hover {
      background: #f5f3ff;
      border-color: #6366f1;
      transform: translateY(-1px);
    }

    /* Hero Visual Mockup */
    .hero-visual {
      position: relative;
    }

    .handwritten-note {
      position: absolute;
      top: -24px;
      right: 18px;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      font-family: 'Segoe Print', 'Comic Sans MS', cursive, sans-serif;
      font-size: 12px;
      color: #6366f1;
      font-weight: 600;
      z-index: 10;
      transform: rotate(-3deg);
    }

    .curved-arrow {
      width: 44px;
      height: 28px;
      margin-top: -2px;
      margin-right: 10px;
    }

    .device-mockup {
      background: #ffffff;
      border-radius: 16px;
      box-shadow: 0 20px 50px -12px rgba(15, 23, 42, 0.14), 0 0 0 1px rgba(99, 102, 241, 0.08);
      overflow: hidden;
      border: 1px solid #e2e8f0;
    }

    .window-topbar {
      height: 32px;
      background: #f8fafc;
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      align-items: center;
      padding: 0 12px;
      gap: 14px;
    }

    .window-dots {
      display: flex;
      gap: 5px;
    }

    .w-dot {
      width: 9px;
      height: 9px;
      border-radius: 50%;
    }

    .w-dot.red { background: #ef4444; }
    .w-dot.yellow { background: #f59e0b; }
    .w-dot.green { background: #10b981; }

    .window-url {
      font-size: 10.5px;
      color: #64748b;
      background: #ffffff;
      padding: 2px 10px;
      border-radius: 5px;
      border: 1px solid #e2e8f0;
      width: 200px;
      text-align: center;
    }

    .mockup-content {
      display: grid;
      grid-template-columns: 130px 1fr;
      min-height: 290px;
      background: #ffffff;
    }

    .mock-sidebar {
      background: #0f172a;
      color: #ffffff;
      padding: 14px 10px;
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .mock-brand {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 11px;
    }

    .mini-logo {
      width: 16px;
      height: 16px;
      object-fit: contain;
    }

    .mock-nav {
      display: flex;
      flex-direction: column;
      gap: 3px;
    }

    .mock-nav-item {
      display: flex;
      align-items: center;
      gap: 7px;
      font-size: 10.5px;
      padding: 5px 7px;
      border-radius: 5px;
      color: #94a3b8;
    }

    .mock-nav-item.active {
      background: #6366f1;
      color: #ffffff;
      font-weight: 700;
    }

    .mock-main {
      padding: 14px;
      background: #f8fafc;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .mock-head {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }

    .mock-head small {
      font-size: 9.5px;
      color: #64748b;
      display: block;
    }

    .mock-head h3 {
      margin: 0;
      font-size: 14px;
      font-weight: 850;
      color: #0f172a;
    }

    .mock-head h3 span {
      color: #6366f1;
    }

    .sub-lead {
      font-size: 9.5px;
      color: #64748b;
      display: block;
    }

    .mock-date-pill {
      font-size: 8.5px;
      font-weight: 600;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      padding: 2px 7px;
      border-radius: 5px;
      color: #475569;
    }

    .mock-chart-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 9px;
      padding: 10px;
      box-shadow: 0 2px 6px rgba(15, 23, 42, 0.04);
    }

    .chart-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 5px;
      font-size: 10.5px;
    }

    .chart-tag {
      font-size: 9.5px;
      font-weight: 700;
      color: #6366f1;
      background: #eef2ff;
      padding: 2px 5px;
      border-radius: 4px;
    }

    .svg-chart-wrap {
      width: 100%;
      height: 65px;
    }

    .mini-svg-chart {
      width: 100%;
      height: 100%;
    }

    .chart-x-axis {
      display: flex;
      justify-content: space-between;
      font-size: 8.5px;
      color: #94a3b8;
      margin-top: 3px;
    }

    .mock-bottom-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 9px;
      padding: 8px 10px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .promo-text b {
      display: block;
      font-size: 10px;
      color: #0f172a;
    }

    .promo-text p {
      margin: 0;
      font-size: 8.5px;
      color: #64748b;
    }

    .promo-bar {
      width: 36px;
      height: 3.5px;
      background: #6366f1;
      border-radius: 999px;
    }

    /* Section Common Styles: Compact & Focused */
    .section-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 24px;
    }

    .section-eyebrow {
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 1.2px;
      color: #6366f1;
      text-transform: uppercase;
      display: block;
      margin-bottom: 6px;
    }

    .section-title {
      font-size: 28px;
      font-weight: 900;
      letter-spacing: -0.6px;
      color: #0f172a;
      margin: 0 0 6px;
      line-height: 1.22;
    }

    .section-subtitle {
      font-size: 14px;
      color: #64748b;
      margin: 0;
      max-width: 580px;
    }

    /* Benefits Section: Compact 36px padding */
    .benefits-section {
      padding: 38px 0;
      background: #ffffff;
    }

    .section-header {
      margin-bottom: 22px;
    }

    .benefits-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
    }

    .benefit-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      padding: 22px 18px;
      box-shadow: 0 2px 10px rgba(15, 23, 42, 0.03);
      transition: all 0.2s ease;
    }

    .benefit-card:hover {
      transform: translateY(-3px);
      box-shadow: 0 8px 22px rgba(99, 102, 241, 0.08);
      border-color: #c7d2fe;
    }

    .benefit-icon-box {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 14px;
    }

    .benefit-icon-box.blue { background: #eef2ff; color: #6366f1; }
    .benefit-icon-box.purple { background: #f5f3ff; color: #8b5cf6; }
    .benefit-icon-box.teal { background: #e0f2fe; color: #0ea5e9; }
    .benefit-icon-box.green { background: #ecfdf5; color: #10b981; }

    .benefit-card h3 {
      font-size: 16px;
      font-weight: 800;
      margin: 0 0 6px;
      color: #0f172a;
    }

    .benefit-card p {
      font-size: 12.5px;
      line-height: 1.5;
      color: #64748b;
      margin: 0;
    }

    /* Connected Sources Section: Compact 38px padding */
    .sources-section {
      padding: 38px 0;
      background: #f8fafc;
      border-top: 1px solid #e2e8f0;
      border-bottom: 1px solid #e2e8f0;
    }

    .sources-grid {
      display: grid;
      grid-template-columns: 1fr 1.5fr;
      gap: 36px;
      align-items: center;
    }

    .title-underline {
      width: 42px;
      height: 3.5px;
      background: linear-gradient(90deg, #6366f1, #8b5cf6);
      border-radius: 999px;
      margin: 10px 0 14px;
    }

    .sources-desc {
      font-size: 14px;
      line-height: 1.55;
      color: #64748b;
      margin: 0;
    }

    .sources-diagram {
      display: grid;
      grid-template-columns: 200px 70px 220px;
      align-items: center;
    }

    .source-nodes {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .source-node-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 10px 14px;
      display: flex;
      align-items: center;
      gap: 10px;
      box-shadow: 0 2px 6px rgba(15, 23, 42, 0.04);
      transition: border-color 0.2s ease;
    }

    .source-node-card:hover {
      border-color: #c7d2fe;
    }

    .node-icon {
      width: 34px;
      height: 34px;
      border-radius: 9px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      flex-shrink: 0;
    }

    .node-icon.blue { background: #eef2ff; color: #6366f1; }
    .node-icon.green { background: #ecfdf5; color: #10b981; }
    .node-icon.orange { background: #fffbeb; color: #f59e0b; }

    .node-text strong {
      display: block;
      font-size: 12.5px;
      color: #0f172a;
    }

    .node-text small {
      font-size: 10.5px;
      color: #64748b;
      line-height: 1.3;
    }

    .connector-graphic {
      width: 70px;
      height: 150px;
    }

    .connector-svg {
      width: 100%;
      height: 100%;
    }

    .hub-card {
      background: #ffffff;
      border: 2px solid #6366f1;
      border-radius: 16px;
      padding: 18px 16px;
      box-shadow: 0 8px 24px rgba(99, 102, 241, 0.12);
      text-align: center;
    }

    .hub-header {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      margin-bottom: 10px;
    }

    .hub-logo {
      height: 24px;
      width: auto;
      object-fit: contain;
    }

    .hub-title {
      font-size: 15px;
      font-weight: 850;
    }

    .hub-neml { color: #0f172a; }
    .hub-oneview { color: #6366f1; }

    .hub-badge {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      background: #eef2ff;
      border: 1px solid #c7d2fe;
      color: #4f46e5;
      font-size: 11px;
      padding: 5px 10px;
      border-radius: 999px;
      margin-bottom: 6px;
      font-weight: 650;
    }

    .hub-sub {
      font-size: 10.5px;
      color: #64748b;
      margin: 0;
    }

    /* Key Metrics Section: Compact 38px padding */
    .metrics-section {
      padding: 38px 0;
      background: #ffffff;
    }

    .metrics-grid {
      display: grid;
      grid-template-columns: 1fr 2fr;
      gap: 32px;
      align-items: center;
    }

    .metrics-cards-row {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 14px;
    }

    .metric-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 14px;
      padding: 16px 14px;
      box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04);
      display: flex;
      flex-direction: column;
      transition: all 0.2s ease;
    }

    .metric-card:hover {
      border-color: #c7d2fe;
      transform: translateY(-2px);
    }

    .metric-icon {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 15px;
      margin-bottom: 10px;
    }

    .metric-icon.blue { background: #eef2ff; color: #6366f1; }
    .metric-icon.purple { background: #f5f3ff; color: #8b5cf6; }
    .metric-icon.teal { background: #e0f2fe; color: #0ea5e9; }
    .metric-icon.orange { background: #fffbeb; color: #f59e0b; }

    .metric-val {
      font-size: 22px;
      font-weight: 900;
      color: #0f172a;
      letter-spacing: -0.5px;
      margin-bottom: 2px;
    }

    .metric-label {
      font-size: 11.5px;
      font-weight: 600;
      color: #64748b;
      margin-bottom: 8px;
    }

    .metric-trend {
      font-size: 10.5px;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 4px;
      margin-top: auto;
    }

    .metric-trend.up { color: #10b981; }
    .metric-trend.neutral { color: #64748b; }
    .metric-trend small { color: #94a3b8; font-weight: 500; }

    /* CTA Banner: Compact 38px bottom padding */
    .cta-banner-section {
      padding: 0 0 38px;
    }

    .cta-banner-card {
      background: linear-gradient(135deg, #eef2ff 0%, #f5f3ff 50%, #f0fdf4 100%);
      border: 1px solid #c7d2fe;
      border-radius: 18px;
      padding: 28px 36px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 24px;
      box-shadow: 0 8px 24px rgba(99, 102, 241, 0.08);
    }

    .cta-eyebrow {
      font-size: 10.5px;
      font-weight: 800;
      letter-spacing: 1.2px;
      color: #6366f1;
      text-transform: uppercase;
      display: block;
      margin-bottom: 4px;
    }

    .cta-banner-text h2 {
      font-size: 24px;
      font-weight: 900;
      color: #0f172a;
      letter-spacing: -0.5px;
      margin: 0 0 6px;
    }

    .cta-banner-text p {
      font-size: 13.5px;
      color: #475569;
      margin: 0;
    }

    .cta-banner-actions {
      display: flex;
      gap: 10px;
      flex-shrink: 0;
    }

    .btn-primary-banner {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 10px 20px;
      background: linear-gradient(135deg, #6366f1 0%, #0ea5e9 100%);
      color: #ffffff;
      border-radius: 10px;
      font-size: 13.5px;
      font-weight: 750;
      border: none;
      cursor: pointer;
      box-shadow: 0 4px 14px rgba(99, 102, 241, 0.25);
      transition: all 0.2s ease;
    }

    .btn-primary-banner:hover {
      background: linear-gradient(135deg, #4f46e5 0%, #0284c7 100%);
      transform: translateY(-2px);
      box-shadow: 0 6px 18px rgba(99, 102, 241, 0.35);
    }

    .btn-secondary-banner {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 10px 18px;
      background: #ffffff;
      color: #4f46e5;
      border: 1.5px solid #c7d2fe;
      border-radius: 9px;
      font-size: 13.5px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-secondary-banner:hover {
      background: #f5f3ff;
      border-color: #6366f1;
    }

    /* Footer: Compact 24px padding */
    .home-footer {
      background: #ffffff;
      border-top: 1px solid #e2e8f0;
      padding: 22px 0;
    }

    .footer-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .footer-brand {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 3px;
    }

    .footer-logo {
      height: 24px;
      width: auto;
      object-fit: contain;
    }

    .footer-brand-text {
      font-size: 14px;
      color: #0f172a;
    }

    .footer-brand-text b {
      color: #0f172a;
    }

    .footer-slogan {
      font-size: 11.5px;
      color: #64748b;
      margin: 0;
    }

    .footer-right {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 6px;
    }

    .footer-links {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 11.5px;
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

    .copyright {
      font-size: 10.5px;
      color: #94a3b8;
    }

    /* Responsive adjustments */
    @media (max-width: 1024px) {
      .hero-container {
        grid-template-columns: 1fr;
        text-align: center;
      }
      .hero-desc {
        margin: 0 auto 22px;
      }
      .hero-ctas {
        justify-content: center;
      }
      .handwritten-note {
        display: none;
      }
      .benefits-grid {
        grid-template-columns: repeat(2, 1fr);
      }
      .sources-grid {
        grid-template-columns: 1fr;
        gap: 28px;
      }
      .sources-diagram {
        justify-content: center;
      }
      .metrics-grid {
        grid-template-columns: 1fr;
      }
      .metrics-cards-row {
        grid-template-columns: repeat(2, 1fr);
      }
      .cta-banner-card {
        flex-direction: column;
        text-align: center;
      }
      .cta-banner-actions {
        justify-content: center;
      }
    }

    @media (max-width: 640px) {
      .hero-title {
        font-size: 30px;
      }
      .benefits-grid, .metrics-cards-row {
        grid-template-columns: 1fr;
      }
      .sources-diagram {
        grid-template-columns: 1fr;
        gap: 16px;
      }
      .connector-graphic {
        display: none;
      }
      .footer-container {
        flex-direction: column;
        gap: 16px;
        text-align: center;
      }
      .footer-right {
        align-items: center;
      }
    }
  `]
})
export class HomeComponent implements OnInit {
  constructor(public auth: AuthService, private router: Router) {}

  ngOnInit(): void {}

  goToLogin(): void {
    if (this.auth.isLoggedIn()) {
      this.router.navigateByUrl('/dashboard');
    } else {
      this.router.navigateByUrl('/login');
    }
  }

  goToDashboard(): void {
    this.router.navigateByUrl('/dashboard');
  }

  goToReports(): void {
    this.router.navigateByUrl('/reports');
  }
}
