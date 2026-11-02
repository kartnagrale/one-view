import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DashboardApiService } from '../../core/dashboard-api.service';
import { AiAnalysisResponse, AiChatMessage, AiDataBadge, DashboardFilter, FilterOptions, ProjectSource } from '../../core/models';

export interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: AiChatMessage[];
  filter: DashboardFilter;
}

@Component({
  selector: 'app-ai-assistant',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="ai-page-container">
      <!-- Page Header -->
      <header class="page-head">
        <div>
          <div class="eyebrow">
            <span class="sparkle">✨</span>
            <span>NeML Decision Intelligence</span>
          </div>
          <h1>AI Market Decision Assistant</h1>
          <p>On-demand conversational intelligence, auction anomaly audits, and historical inquiry archive.</p>
        </div>
        <div class="head-actions">
          <button type="button" class="new-session-btn" (click)="startNewSession()">
            <span class="icon">＋</span> New Analysis Session
          </button>
        </div>
      </header>

      <!-- Main Dual-Column Layout: History Sidebar + Chat Canvas -->
      <div class="ai-workspace card">
        <!-- Left Column: History & Past Sessions Sidebar -->
        <aside class="history-sidebar">
          <div class="sidebar-header">
            <div class="sidebar-title-row">
              <h3>Inquiry Archive</h3>
              <span class="session-count-badge">{{ sessions.length }}</span>
            </div>
            <p>Saved conversations & responses</p>
          </div>

          <div class="sidebar-actions">
            <button type="button" class="sidebar-new-btn" (click)="startNewSession()">
              <span>＋</span> Start New Chat
            </button>
          </div>

          <!-- Sessions List -->
          <div class="sessions-list" *ngIf="sessions.length; else emptySessions">
            <div
              *ngFor="let s of sessions"
              class="session-item"
              [class.active]="currentSession?.id === s.id"
              (click)="selectSession(s)">
              <div class="session-item-content">
                <span class="session-item-icon">💬</span>
                <div class="session-item-text">
                  <strong class="session-title" [title]="s.title">{{ s.title }}</strong>
                  <div class="session-meta">
                    <span class="session-time">{{ s.updatedAt | date:'shortTime' }} · {{ s.updatedAt | date:'mediumDate' }}</span>
                    <span class="msg-count">{{ s.messages.length }} msgs</span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                class="delete-session-btn"
                (click)="deleteSession(s.id, $event)"
                title="Delete this conversation">
                ✕
              </button>
            </div>
          </div>

          <ng-template #emptySessions>
            <div class="empty-sessions">
              <span class="empty-icon">🗂️</span>
              <p>No previous inquiries saved yet.</p>
              <small>Ask a question to create your first session.</small>
            </div>
          </ng-template>

          <div class="sidebar-footer" *ngIf="sessions.length > 1">
            <button type="button" class="clear-all-btn" (click)="clearAllHistory()">
              🗑️ Clear All Archive
            </button>
          </div>
        </aside>

        <!-- Right Column: Active Chat Canvas -->
        <main class="chat-canvas">
          <!-- Canvas Top Filter Context Ribbon -->
          <div class="canvas-context-bar">
            <div class="context-slice-info">
              <span class="slice-dot"></span>
              <b>Active Dataset Slice:</b>
              <span class="slice-tags">
                <span class="tag-pill">{{ activeFilter.source || 'ALL' }}</span>
                <span class="tag-pill" *ngIf="activeFilter.commodity">{{ activeFilter.commodity }}</span>
                <span class="tag-pill" *ngIf="activeFilter.state">{{ activeFilter.state }}</span>
                <span class="tag-pill" *ngIf="activeFilter.qtyUnit">{{ activeFilter.qtyUnit }}</span>
              </span>
            </div>
            <div class="context-actions">
              <span class="session-id-tag" *ngIf="currentSession">
                Session: {{ currentSession.title | slice:0:28 }}...
              </span>
            </div>
          </div>

          <!-- Conversation Message Stream Area -->
          <div class="chat-viewport" #scrollViewport>
            <!-- Starter Welcome Screen (When Current Session Has No Messages) -->
            <div class="starter-screen" *ngIf="!messages.length">
              <div class="starter-badge">
                <span class="sparkle-lg">✨</span>
              </div>
              <h2>What would you like to analyze today?</h2>
              <p>
                Ask any question about NeML commodity auction data across <b>Market, Sugar, and NCDFI</b>.
                Results and diagnostics are computed on-demand.
              </p>

              <!-- Dynamic Proactive Questions (Based on Data) -->
              <div class="proactive-prompts-box" *ngIf="proactiveQuestions.length">
                <div class="prompts-head">
                  <span class="icon">💡</span>
                  <b>Questions generated based on your data:</b>
                </div>
                <div class="prompts-grid">
                  <button
                    type="button"
                    class="prompt-card"
                    *ngFor="let q of proactiveQuestions"
                    (click)="askQuestion(q)"
                    [disabled]="loading">
                    <span class="prompt-icon">?</span>
                    <span class="prompt-text">{{ q }}</span>
                    <span class="prompt-arrow">›</span>
                  </button>
                </div>
              </div>

              <!-- Quick Topic Category Starters -->
              <div class="topic-categories">
                <span class="category-title">QUICK ANALYTICAL PROMPTS:</span>
                <div class="category-buttons">
                  <button type="button" class="category-btn" (click)="askQuestion('Give me an executive summary of auction performance')">
                    📊 Executive KPI Summary
                  </button>
                  <button type="button" class="category-btn" (click)="askQuestion('Which auctions had only 1 or 2 bidders and what was their trade value?')">
                    ⚠️ Low-Bidder Competition Audit
                  </button>
                  <button type="button" class="category-btn" (click)="askQuestion('Compare Forward vs Reverse auction price discovery')">
                    ⚖️ Forward vs Reverse Price Spread
                  </button>
                  <button type="button" class="category-btn" (click)="askQuestion('Who are the top 3 participating clients by trade value?')">
                    🏛️ Top Client Rankings
                  </button>
                  <button type="button" class="category-btn" (click)="askQuestion('Show me state-wise turnover distribution')">
                    🗺️ State Turnover Breakdown
                  </button>
                </div>
              </div>
            </div>

            <!-- Chat Message Bubbles -->
            <div
              *ngFor="let msg of messages; let i = index"
              class="chat-bubble-row"
              [class.user-row]="msg.role === 'user'"
              [class.assistant-row]="msg.role === 'assistant'">

              <div class="avatar" *ngIf="msg.role === 'assistant'">✨</div>

              <div class="bubble-box">
                <div class="bubble-header">
                  <strong>{{ msg.role === 'user' ? 'You' : 'Agri-Analytix AI' }}</strong>
                  <span class="time">{{ msg.timestamp }}</span>
                  <button
                    *ngIf="msg.role === 'assistant'"
                    type="button"
                    class="copy-btn"
                    (click)="copyMessage(msg.content, i)">
                    {{ copiedIndex === i ? '✓ Copied' : '📋 Copy' }}
                  </button>
                </div>

                <!-- Markdown Formatted Answer Body -->
                <div class="bubble-body" [innerHTML]="formatMarkdown(msg.content)"></div>

                <!-- Data Badges (Turnover, Clearance, etc.) -->
                <div class="badges-container" *ngIf="msg.dataBadges && msg.dataBadges.length">
                  <span
                    *ngFor="let b of msg.dataBadges"
                    class="data-pill"
                    [class.positive]="b.type === 'positive'"
                    [class.negative]="b.type === 'negative'"
                    [class.primary]="b.type === 'primary'">
                    <span class="pill-name">{{ b.label }}:</span>
                    <strong class="pill-val">{{ b.value }}</strong>
                  </span>
                </div>

                <!-- Proactive Follow-up Questions Asked by the Bot -->
                <div class="follow-ups-section" *ngIf="msg.suggestedFollowUps && msg.suggestedFollowUps.length">
                  <span class="follow-up-title">Explore further with these questions:</span>
                  <div class="follow-up-list">
                    <button
                      type="button"
                      class="follow-up-chip"
                      *ngFor="let followUp of msg.suggestedFollowUps"
                      (click)="askQuestion(followUp)"
                      [disabled]="loading">
                      ↳ {{ followUp }}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Loading / Thinking Indicator -->
            <div class="chat-bubble-row assistant-row" *ngIf="loading">
              <div class="avatar pulse">✨</div>
              <div class="bubble-box thinking-box">
                <span>Analyzing data snapshot and computing statistical insights...</span>
                <div class="dots-animation">
                  <span></span><span></span><span></span>
                </div>
              </div>
            </div>
          </div>

          <!-- Bottom Chat Input Bar -->
          <footer class="canvas-input-footer">
            <form class="query-form" (ngSubmit)="sendQuery()">
              <textarea
                #queryInputBox
                class="main-textarea"
                rows="1"
                placeholder="Ask about auction turnover, clearance rates, price discovery, anomalies..."
                [(ngModel)]="userInput"
                name="userInput"
                (keydown.enter)="onEnterPress($event)"
                [disabled]="loading"></textarea>
              <button
                type="submit"
                class="send-query-btn"
                [disabled]="!userInput.trim() || loading"
                title="Send query">
                <span class="send-icon">➤</span>
              </button>
            </form>
            <div class="input-hints">
              <span>Press <b>Enter</b> to send, <b>Shift+Enter</b> for new line</span>
            </div>
          </footer>
        </main>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      padding-bottom: 30px;
    }

    .ai-page-container {
      display: flex;
      flex-direction: column;
      gap: 18px;
    }

    /* Page Header */
    .page-head {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }

    .eyebrow {
      display: flex;
      align-items: center;
      gap: 6px;
      color: #6366f1;
      text-transform: uppercase;
      letter-spacing: 0.9px;
      font-size: 11px;
      font-weight: 850;
      margin-bottom: 4px;
    }

    .page-head h1 {
      font-size: 26px;
      font-weight: 900;
      letter-spacing: -0.6px;
      margin: 0 0 6px;
      color: var(--text);
    }

    .page-head p {
      margin: 0;
      color: var(--muted);
      font-size: 14px;
    }

    .new-session-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 10px 18px;
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      color: #ffffff;
      border-radius: 12px;
      font-weight: 700;
      font-size: 13px;
      box-shadow: 0 4px 14px rgba(99, 102, 241, 0.3);
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .new-session-btn:hover {
      transform: translateY(-1px);
      box-shadow: 0 6px 18px rgba(99, 102, 241, 0.4);
    }

    /* Dual-Column Workspace */
    .ai-workspace {
      display: grid;
      grid-template-columns: 320px 1fr;
      min-height: 720px;
      height: calc(100vh - 190px);
      overflow: hidden;
      border: 1px solid var(--line);
      border-radius: 18px;
      background: #ffffff;
    }

    /* Left Sidebar: History */
    .history-sidebar {
      background: #f8fafc;
      border-right: 1px solid var(--line);
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .sidebar-header {
      padding: 18px 20px 14px;
      border-bottom: 1px solid var(--line);
    }

    .sidebar-title-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 4px;
    }

    .sidebar-title-row h3 {
      margin: 0;
      font-size: 15px;
      font-weight: 800;
      color: #0f172a;
    }

    .session-count-badge {
      font-size: 11px;
      font-weight: 700;
      background: #e2e8f0;
      color: #475569;
      padding: 2px 8px;
      border-radius: 999px;
    }

    .sidebar-header p {
      margin: 0;
      font-size: 12px;
      color: #64748b;
    }

    .sidebar-actions {
      padding: 12px 16px;
      border-bottom: 1px solid var(--line);
    }

    .sidebar-new-btn {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 8px 14px;
      background: #ffffff;
      border: 1px dashed #cbd5e1;
      border-radius: 10px;
      font-size: 12px;
      font-weight: 700;
      color: #4f46e5;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .sidebar-new-btn:hover {
      background: #eef2ff;
      border-color: #6366f1;
    }

    .sessions-list {
      flex: 1;
      overflow-y: auto;
      padding: 10px 12px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .session-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 12px;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .session-item:hover {
      background: #f1f5f9;
      border-color: #cbd5e1;
    }

    .session-item.active {
      background: #eef2ff;
      border-color: #6366f1;
      box-shadow: 0 2px 8px rgba(99, 102, 241, 0.12);
    }

    .session-item-content {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      overflow: hidden;
      flex: 1;
    }

    .session-item-icon {
      font-size: 15px;
      margin-top: 1px;
    }

    .session-item-text {
      overflow: hidden;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .session-title {
      font-size: 13px;
      font-weight: 700;
      color: #1e293b;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .session-item.active .session-title {
      color: #4338ca;
    }

    .session-meta {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 11px;
      color: #64748b;
    }

    .delete-session-btn {
      opacity: 0;
      width: 24px;
      height: 24px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #94a3b8;
      font-size: 12px;
      transition: all 0.15s ease;
    }

    .session-item:hover .delete-session-btn {
      opacity: 1;
    }

    .delete-session-btn:hover {
      background: #fee2e2;
      color: #dc2626;
    }

    .empty-sessions {
      padding: 40px 20px;
      text-align: center;
      color: #64748b;
    }

    .empty-icon {
      font-size: 32px;
      display: block;
      margin-bottom: 8px;
    }

    .empty-sessions p {
      font-size: 13px;
      font-weight: 600;
      margin: 0 0 4px;
      color: #334155;
    }

    .empty-sessions small {
      font-size: 11px;
      color: #94a3b8;
    }

    .sidebar-footer {
      padding: 10px 16px;
      border-top: 1px solid var(--line);
    }

    .clear-all-btn {
      width: 100%;
      font-size: 11px;
      font-weight: 600;
      color: #94a3b8;
      padding: 6px;
      border-radius: 6px;
      cursor: pointer;
      text-align: center;
    }

    .clear-all-btn:hover {
      background: #fee2e2;
      color: #b91c1c;
    }

    /* Right Column: Chat Canvas */
    .chat-canvas {
      display: flex;
      flex-direction: column;
      overflow: hidden;
      background: #ffffff;
    }

    .canvas-context-bar {
      padding: 12px 24px;
      background: #f8fafc;
      border-bottom: 1px solid var(--line);
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 12px;
    }

    .context-slice-info {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #334155;
    }

    .slice-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #10b981;
      box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2);
    }

    .slice-tags {
      display: flex;
      gap: 6px;
    }

    .tag-pill {
      font-size: 11px;
      font-weight: 700;
      background: #ffffff;
      border: 1px solid #cbd5e1;
      color: #475569;
      padding: 2px 8px;
      border-radius: 999px;
    }

    .session-id-tag {
      font-size: 11px;
      color: #64748b;
      font-style: italic;
    }

    /* Scroll Viewport */
    .chat-viewport {
      flex: 1;
      overflow-y: auto;
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 20px;
      background: #fbfcfe;
    }

    /* Starter Screen */
    .starter-screen {
      max-width: 760px;
      margin: 40px auto;
      text-align: center;
    }

    .starter-badge {
      width: 56px;
      height: 56px;
      border-radius: 18px;
      background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 28px;
      margin: 0 auto 16px;
      box-shadow: 0 8px 24px rgba(99, 102, 241, 0.3);
    }

    .starter-screen h2 {
      font-size: 22px;
      font-weight: 900;
      letter-spacing: -0.4px;
      color: #0f172a;
      margin: 0 0 8px;
    }

    .starter-screen p {
      font-size: 14px;
      color: #64748b;
      line-height: 1.5;
      margin: 0 0 28px;
    }

    /* Proactive Questions in Starter */
    .proactive-prompts-box {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      padding: 18px 20px;
      box-shadow: 0 4px 16px rgba(15, 23, 42, 0.04);
      margin-bottom: 24px;
      text-align: left;
    }

    .prompts-head {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      color: #475569;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 12px;
    }

    .prompts-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }

    .prompt-card {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 14px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      text-align: left;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .prompt-card:hover {
      background: #eef2ff;
      border-color: #6366f1;
      transform: translateY(-1px);
    }

    .prompt-icon {
      color: #6366f1;
      font-weight: 800;
      font-size: 14px;
    }

    .prompt-text {
      flex: 1;
      font-size: 12px;
      font-weight: 600;
      color: #1e293b;
      line-height: 1.4;
    }

    .prompt-arrow {
      color: #94a3b8;
      font-size: 16px;
    }

    /* Quick Topic Categories */
    .topic-categories {
      text-align: left;
    }

    .category-title {
      display: block;
      font-size: 11px;
      font-weight: 800;
      color: #64748b;
      letter-spacing: 0.5px;
      margin-bottom: 10px;
    }

    .category-buttons {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .category-btn {
      font-size: 12px;
      font-weight: 600;
      padding: 8px 14px;
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 10px;
      color: #334155;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .category-btn:hover {
      background: #f1f5f9;
      border-color: #94a3b8;
    }

    /* Chat Bubble Rows */
    .chat-bubble-row {
      display: flex;
      gap: 12px;
      max-width: 86%;
      animation: fadeIn 0.25s ease;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(6px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .user-row {
      align-self: flex-end;
      flex-direction: row-reverse;
    }

    .assistant-row {
      align-self: flex-start;
    }

    .avatar {
      width: 32px;
      height: 32px;
      border-radius: 10px;
      background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      color: #ffffff;
      flex-shrink: 0;
      margin-top: 2px;
    }

    .bubble-box {
      background: #ffffff;
      border: 1px solid var(--line);
      border-radius: 16px;
      padding: 16px 18px;
      box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04);
      font-size: 14px;
      line-height: 1.6;
      color: var(--text);
    }

    .user-row .bubble-box {
      background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%);
      color: #ffffff;
      border: none;
      box-shadow: 0 4px 14px rgba(79, 70, 229, 0.25);
    }

    .user-row .bubble-header strong {
      color: #ffffff;
    }

    .user-row .bubble-header .time {
      color: rgba(255, 255, 255, 0.7);
    }

    .bubble-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
      font-size: 11px;
    }

    .bubble-header strong {
      color: #334155;
      font-weight: 700;
    }

    .bubble-header .time {
      color: #94a3b8;
    }

    .copy-btn {
      margin-left: auto;
      font-size: 11px;
      color: #64748b;
      padding: 3px 8px;
      border-radius: 6px;
      background: #f1f5f9;
      cursor: pointer;
    }

    .copy-btn:hover {
      background: #e2e8f0;
      color: #0f172a;
    }

    /* Markdown Body */
    .bubble-body p {
      margin: 0 0 10px;
    }

    .bubble-body p:last-child {
      margin-bottom: 0;
    }

    .bubble-body h3 {
      font-size: 15px;
      font-weight: 800;
      margin: 6px 0 10px;
      color: #0f172a;
    }

    .bubble-body h4 {
      font-size: 14px;
      font-weight: 750;
      margin: 10px 0 6px;
      color: #1e293b;
    }

    .bubble-body ul, .bubble-body ol {
      margin: 6px 0 10px;
      padding-left: 20px;
    }

    .bubble-body li {
      margin-bottom: 4px;
    }

    .bubble-body blockquote {
      margin: 10px 0;
      padding: 10px 14px;
      background: #f8fafc;
      border-left: 3px solid #6366f1;
      border-radius: 0 8px 8px 0;
      font-size: 13px;
    }

    /* Data Badges */
    .badges-container {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 14px;
      padding-top: 12px;
      border-top: 1px dashed #e2e8f0;
    }

    .data-pill {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 4px 10px;
      border-radius: 8px;
      font-size: 12px;
      background: #f1f5f9;
      color: #334155;
    }

    .data-pill.primary {
      background: #e0e7ff;
      color: #4338ca;
    }

    .data-pill.positive {
      background: #ecfdf5;
      color: #065f46;
    }

    .data-pill.negative {
      background: #fef2f2;
      color: #991b1b;
    }

    /* Follow Up Chips */
    .follow-ups-section {
      margin-top: 14px;
      padding-top: 12px;
      border-top: 1px solid #f1f5f9;
    }

    .follow-up-title {
      display: block;
      font-size: 11px;
      font-weight: 750;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.4px;
      margin-bottom: 8px;
    }

    .follow-up-list {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .follow-up-chip {
      text-align: left;
      font-size: 12px;
      color: #4f46e5;
      background: #eef2ff;
      border: 1px solid #e0e7ff;
      padding: 7px 12px;
      border-radius: 10px;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .follow-up-chip:hover {
      background: #e0e7ff;
      border-color: #c7d2fe;
    }

    /* Thinking Bubble */
    .thinking-box {
      display: flex;
      align-items: center;
      gap: 10px;
      color: #64748b;
      font-size: 13px;
      font-style: italic;
    }

    .dots-animation {
      display: flex;
      gap: 4px;
    }

    .dots-animation span {
      width: 6px;
      height: 6px;
      background: #6366f1;
      border-radius: 50%;
      animation: bounce 1.4s infinite ease-in-out both;
    }

    .dots-animation span:nth-child(1) { animation-delay: -0.32s; }
    .dots-animation span:nth-child(2) { animation-delay: -0.16s; }

    @keyframes bounce {
      0%, 80%, 100% { transform: scale(0); }
      40% { transform: scale(1); }
    }

    /* Bottom Input Bar */
    .canvas-input-footer {
      padding: 16px 24px;
      background: #ffffff;
      border-top: 1px solid var(--line);
    }

    .query-form {
      display: flex;
      gap: 10px;
      align-items: flex-end;
    }

    .main-textarea {
      flex: 1;
      resize: none;
      min-height: 46px;
      max-height: 140px;
      padding: 12px 16px;
      border: 1px solid #cbd5e1;
      border-radius: 14px;
      font-size: 14px;
      outline: none;
      background: #f8fafc;
      transition: all 0.15s ease;
    }

    .main-textarea:focus {
      border-color: #6366f1;
      background: #ffffff;
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
    }

    .send-query-btn {
      width: 46px;
      height: 46px;
      border-radius: 14px;
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      cursor: pointer;
      box-shadow: 0 4px 14px rgba(99, 102, 241, 0.3);
      transition: transform 0.15s ease, opacity 0.15s ease;
    }

    .send-query-btn:hover:not(:disabled) {
      transform: scale(1.04);
    }

    .send-query-btn:disabled {
      opacity: 0.45;
      cursor: not-allowed;
    }

    .input-hints {
      margin-top: 8px;
      font-size: 11px;
      color: #94a3b8;
      text-align: center;
    }

    @media (max-width: 900px) {
      .ai-workspace {
        grid-template-columns: 1fr;
        height: auto;
      }
      .history-sidebar {
        max-height: 280px;
      }
      .prompts-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class AiAssistantComponent implements OnInit {
  @ViewChild('scrollViewport') private scrollViewport!: ElementRef<HTMLDivElement>;
  @ViewChild('queryInputBox') private queryInputBox!: ElementRef<HTMLTextAreaElement>;

  sessions: ChatSession[] = [];
  currentSession?: ChatSession;
  messages: AiChatMessage[] = [];
  proactiveQuestions: string[] = [];
  userInput = '';
  loading = false;
  copiedIndex: number | null = null;
  activeFilter: DashboardFilter = { source: 'ALL' };

  private readonly STORAGE_KEY = 'agri_ai_chat_history_v1';

  constructor(private api: DashboardApiService) {}

  ngOnInit(): void {
    this.loadHistory();
    this.fetchProactiveQuestions();
  }

  loadHistory(): void {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        this.sessions = JSON.parse(saved);
        if (this.sessions.length > 0) {
          this.selectSession(this.sessions[0]);
          return;
        }
      }
    } catch {
      this.sessions = [];
    }
    this.startNewSession();
  }

  saveHistory(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.sessions));
    } catch (e) {
      console.warn('Failed to persist chat history:', e);
    }
  }

  startNewSession(): void {
    const newSession: ChatSession = {
      id: 'session_' + Date.now(),
      title: 'New Analytical Inquiry',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [],
      filter: { ...this.activeFilter }
    };
    this.sessions.unshift(newSession);
    this.currentSession = newSession;
    this.messages = [];
    this.saveHistory();
    setTimeout(() => this.queryInputBox?.nativeElement?.focus(), 100);
  }

  selectSession(s: ChatSession): void {
    this.currentSession = s;
    this.messages = [...s.messages];
    this.activeFilter = { ...(s.filter || { source: 'ALL' }) };
    this.scrollToBottom();
  }

  deleteSession(id: string, event: Event): void {
    event.stopPropagation();
    this.sessions = this.sessions.filter(s => s.id !== id);
    this.saveHistory();
    if (this.currentSession?.id === id) {
      if (this.sessions.length > 0) {
        this.selectSession(this.sessions[0]);
      } else {
        this.startNewSession();
      }
    }
  }

  clearAllHistory(): void {
    if (confirm('Are you sure you want to clear all conversation history?')) {
      this.sessions = [];
      this.saveHistory();
      this.startNewSession();
    }
  }

  fetchProactiveQuestions(): void {
    this.api.aiAnalysis(this.activeFilter).subscribe({
      next: (res: AiAnalysisResponse) => {
        this.proactiveQuestions = res.suggestedQuestions || [];
      },
      error: () => {
        this.proactiveQuestions = [
          'Give me an executive summary of auction performance',
          'Which commodities have the highest clearance rates?',
          'Who are the top 3 clients by trade value?',
          'Which auctions had only 1 or 2 bidders?'
        ];
      }
    });
  }

  askQuestion(q: string): void {
    this.userInput = q;
    this.sendQuery();
  }

  onEnterPress(event: Event): void {
    const kbEvent = event as KeyboardEvent;
    if (!kbEvent.shiftKey) {
      event.preventDefault();
      this.sendQuery();
    }
  }

  sendQuery(): void {
    const query = this.userInput.trim();
    if (!query || this.loading) return;

    if (!this.currentSession) {
      this.startNewSession();
    }

    const userMsg: AiChatMessage = {
      role: 'user',
      content: query,
      timestamp: this.formatTime(new Date())
    };

    this.messages.push(userMsg);
    this.userInput = '';
    this.loading = true;
    this.scrollToBottom();

    // If first message in session, update title
    if (this.messages.length === 1 && this.currentSession) {
      this.currentSession.title = query.length > 36 ? query.slice(0, 36) + '...' : query;
    }

    this.api.aiChat({
      message: query,
      conversationHistory: this.messages,
      filter: this.activeFilter
    }).subscribe({
      next: res => {
        const assistantMsg: AiChatMessage = {
          role: 'assistant',
          content: res.answer,
          timestamp: this.formatTime(new Date()),
          suggestedFollowUps: res.suggestedFollowUps,
          dataBadges: res.dataBadges
        };
        this.messages.push(assistantMsg);

        if (this.currentSession) {
          this.currentSession.messages = [...this.messages];
          this.currentSession.updatedAt = new Date().toISOString();
          this.saveHistory();
        }

        this.loading = false;
        this.scrollToBottom();
      },
      error: () => {
        this.messages.push({
          role: 'assistant',
          content: 'Sorry, I encountered an issue analyzing the current data slice. Please try asking again or broaden your filters.',
          timestamp: this.formatTime(new Date())
        });
        this.loading = false;
        this.scrollToBottom();
      }
    });
  }

  copyMessage(content: string, index: number): void {
    navigator.clipboard.writeText(content).then(() => {
      this.copiedIndex = index;
      setTimeout(() => (this.copiedIndex = null), 2000);
    });
  }

  formatMarkdown(text: string): string {
    if (!text) return '';
    let html = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^#### (.*$)/gim, '<h4>$1</h4>');
    html = html.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
    html = html.replace(/`(.*?)`/g, '<code style="background:#f1f5f9;padding:2px 6px;border-radius:4px;font-size:12px;">$1</code>');
    html = html.replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>');
    html = html.replace(/^\- (.*$)/gim, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>)/gim, '<ul>$1</ul>');
    html = html.replace(/<\/ul>\s*<ul>/g, '');
    html = html.replace(/\n\n/g, '</p><p>');
    html = '<p>' + html + '</p>';
    html = html.replace(/<p><\/p>/g, '');

    return html;
  }

  private formatTime(d: Date): string {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      if (this.scrollViewport) {
        this.scrollViewport.nativeElement.scrollTop = this.scrollViewport.nativeElement.scrollHeight;
      }
    }, 100);
  }
}
