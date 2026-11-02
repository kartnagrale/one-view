import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { DashboardApiService } from '../core/dashboard-api.service';
import { AiCopilotService } from '../core/ai-copilot.service';
import { AiAnalysisResponse, AiChatMessage, AiDataBadge, DashboardFilter } from '../core/models';

@Component({
  selector: 'app-ai-copilot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- Floating Trigger Launcher -->
    <div class="ai-launcher" [class.hidden]="isOpen" (click)="openDrawer()">
      <div class="launcher-glow"></div>
      <button class="launcher-btn" type="button" aria-label="Open AI Copilot">
        <div class="ai-icon-wrap">
          <span class="sparkle-icon">✨</span>
          <span class="pulse-ring"></span>
        </div>
        <div class="launcher-text">
          <span class="launcher-title">AI Copilot</span>
          <span class="launcher-sub">{{ proactiveQuestions.length ? proactiveQuestions.length + ' data insights' : 'Ask questions' }}</span>
        </div>
      </button>
    </div>

    <!-- AI Copilot Side Drawer -->
    <aside class="ai-drawer" [class.open]="isOpen" aria-label="AI Market Intelligence Assistant">
      <!-- Drawer Header -->
      <header class="drawer-header">
        <div class="header-left">
          <div class="copilot-avatar">
            <span class="avatar-sparkle">✨</span>
          </div>
          <div class="header-titles">
            <div class="header-name-row">
              <h3>Agri-Analytix Copilot</h3>
              <span class="online-pill">
                <span class="dot"></span> In-Memory AI
              </span>
            </div>
            <p class="filter-slice-badge" title="Active Filter Context">
              <span>Slice:</span> {{ activeSliceLabel }}
            </p>
          </div>
        </div>

        <div class="header-actions">
          <button class="head-btn" (click)="clearChat()" title="Clear conversation" aria-label="Clear chat">
            🗑️
          </button>
          <button class="head-btn close-btn" (click)="closeDrawer()" title="Close Copilot" aria-label="Close drawer">
            ✕
          </button>
        </div>
      </header>

      <!-- Proactive Questions Banner (When Available) -->
      <section class="proactive-banner" *ngIf="proactiveQuestions.length">
        <div class="banner-title">
          <span class="banner-icon">💡</span>
          <b>Questions based on your data:</b>
        </div>
        <div class="chips-slider">
          <button
            type="button"
            class="question-chip"
            *ngFor="let q of proactiveQuestions"
            (click)="askQuestion(q)"
            [disabled]="loading">
            <span class="chip-q-mark">?</span> {{ q }}
          </button>
        </div>
      </section>

      <!-- Chat Messages Scroll Area -->
      <div class="messages-viewport" #scrollContainer>
        <!-- Welcome Greeting Bubble -->
        <div class="chat-message assistant-message welcome-message">
          <div class="avatar-mini">✨</div>
          <div class="bubble-content">
            <div class="bubble-meta">
              <strong>Agri-Analytix AI</strong>
              <span class="time">Just now</span>
            </div>
            <div class="markdown-body">
              <p>
                Hello! I am your <b>Commodity Auction Copilot</b>. I've analyzed the live data snapshot across
                <strong>Market, Sugar, and NCDFI</strong>.
              </p>
              <p>
                You can ask me about <b>turnover trends, price spreads (Forward vs Reverse), low-bidder competition risks, or commodity clearance rates</b>.
              </p>
            </div>
            <!-- Quick Starter Prompts -->
            <div class="quick-prompts">
              <button type="button" class="quick-btn" (click)="askQuestion('Give me an executive summary of auction performance')">
                📊 Executive Summary
              </button>
              <button type="button" class="quick-btn" (click)="askQuestion('Which auctions had only 1 or 2 bidders and what was their trade value?')">
                ⚠️ Low-Bidder Audit
              </button>
              <button type="button" class="quick-btn" (click)="askQuestion('Compare Forward vs Reverse auction price discovery')">
                ⚖️ Forward vs Reverse
              </button>
              <button type="button" class="quick-btn" (click)="askQuestion('Who are the top 3 participating clients?')">
                🏛️ Top Clients
              </button>
            </div>
          </div>
        </div>

        <!-- Dynamic Message Stream -->
        <div
          *ngFor="let msg of messages; let i = index"
          class="chat-message"
          [class.user-message]="msg.role === 'user'"
          [class.assistant-message]="msg.role === 'assistant'">
          
          <div class="avatar-mini" *ngIf="msg.role === 'assistant'">✨</div>
          
          <div class="bubble-content">
            <div class="bubble-meta">
              <strong>{{ msg.role === 'user' ? 'You' : 'Agri-Analytix AI' }}</strong>
              <span class="time">{{ msg.timestamp }}</span>
              <button
                *ngIf="msg.role === 'assistant'"
                type="button"
                class="copy-btn"
                (click)="copyMessage(msg.content, i)"
                title="Copy response">
                {{ copiedIndex === i ? '✓ Copied' : '📋 Copy' }}
              </button>
            </div>

            <!-- Content Body with Markdown-like rendering -->
            <div class="markdown-body" [innerHTML]="formatMarkdown(msg.content)"></div>

            <!-- Data Badges (if any) -->
            <div class="badges-row" *ngIf="msg.dataBadges && msg.dataBadges.length">
              <span
                *ngFor="let b of msg.dataBadges"
                class="metric-badge"
                [class.positive]="b.type === 'positive'"
                [class.negative]="b.type === 'negative'"
                [class.primary]="b.type === 'primary'">
                <span class="badge-label">{{ b.label }}:</span>
                <strong class="badge-val">{{ b.value }}</strong>
              </span>
            </div>

            <!-- Suggested Follow-Up Questions (Bot asking questions back) -->
            <div class="follow-ups" *ngIf="msg.suggestedFollowUps && msg.suggestedFollowUps.length">
              <span class="follow-up-label">Suggested follow-ups:</span>
              <div class="follow-up-chips">
                <button
                  type="button"
                  class="follow-up-btn"
                  *ngFor="let followUp of msg.suggestedFollowUps"
                  (click)="askQuestion(followUp)"
                  [disabled]="loading">
                  ↳ {{ followUp }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Thinking / Loading Indicator Bubble -->
        <div class="chat-message assistant-message" *ngIf="loading">
          <div class="avatar-mini pulse">✨</div>
          <div class="bubble-content thinking-bubble">
            <span class="thinking-text">Analyzing auction facts & computing statistics...</span>
            <div class="typing-dots">
              <span></span><span></span><span></span>
            </div>
          </div>
        </div>
      </div>

      <!-- Drawer Footer & Input Box -->
      <footer class="drawer-footer">
        <form class="input-form" (ngSubmit)="sendQuery()">
          <textarea
            #inputBox
            class="query-input"
            rows="1"
            placeholder="Ask about prices, clearance, anomalies..."
            [(ngModel)]="userInput"
            name="userInput"
            (keydown.enter)="onEnterPress($event)"
            [disabled]="loading"></textarea>
          <button
            type="submit"
            class="send-btn"
            [disabled]="!userInput.trim() || loading"
            aria-label="Send message">
            <span class="send-icon">➤</span>
          </button>
        </form>
        <div class="footer-hint">
          <span>Press <b>Enter</b> to send, <b>Shift+Enter</b> for newline</span>
        </div>
      </footer>
    </aside>
  `,
  styles: [`
    :host {
      --copilot-primary: #6366f1;
      --copilot-gradient: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #d946ef 100%);
      --copilot-bg: #ffffff;
      --copilot-surface: #f8fafc;
      --copilot-border: #e2e8f0;
      --copilot-text: #0f172a;
      --copilot-muted: #64748b;
    }

    /* Floating Launcher */
    .ai-launcher {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 990;
      transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.2s ease;
    }

    .ai-launcher.hidden {
      transform: translateY(120px) scale(0.8);
      opacity: 0;
      pointer-events: none;
    }

    .launcher-glow {
      position: absolute;
      inset: -4px;
      background: var(--copilot-gradient);
      border-radius: 999px;
      filter: blur(12px);
      opacity: 0.45;
      animation: pulseGlow 3s ease-in-out infinite alternate;
    }

    @keyframes pulseGlow {
      0% { opacity: 0.3; transform: scale(0.96); }
      100% { opacity: 0.6; transform: scale(1.04); }
    }

    .launcher-btn {
      position: relative;
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 18px 10px 14px;
      background: #0f172a;
      color: #ffffff;
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 999px;
      box-shadow: 0 10px 25px -3px rgba(15, 23, 42, 0.3), 0 4px 12px rgba(99, 102, 241, 0.4);
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .launcher-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 14px 30px -4px rgba(15, 23, 42, 0.4), 0 6px 16px rgba(99, 102, 241, 0.5);
    }

    .ai-icon-wrap {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      background: var(--copilot-gradient);
      border-radius: 50%;
      font-size: 16px;
    }

    .pulse-ring {
      position: absolute;
      inset: -3px;
      border-radius: 50%;
      border: 2px solid #a855f7;
      opacity: 0.7;
      animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
    }

    @keyframes ping {
      75%, 100% {
        transform: scale(1.6);
        opacity: 0;
      }
    }

    .launcher-text {
      display: flex;
      flex-direction: column;
      text-align: left;
    }

    .launcher-title {
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 0.3px;
    }

    .launcher-sub {
      font-size: 10px;
      color: #94a3b8;
    }

    /* AI Side Drawer */
    .ai-drawer {
      position: fixed;
      top: 0;
      right: 0;
      bottom: 0;
      width: 480px;
      max-width: 100vw;
      background: #ffffff;
      border-left: 1px solid var(--copilot-border);
      box-shadow: -10px 0 40px rgba(15, 23, 42, 0.15);
      z-index: 1000;
      display: flex;
      flex-direction: column;
      transform: translateX(100%);
      transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .ai-drawer.open {
      transform: translateX(0);
    }

    /* Drawer Header */
    .drawer-header {
      padding: 16px 20px;
      background: #0f172a;
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .copilot-avatar {
      width: 38px;
      height: 38px;
      border-radius: 12px;
      background: var(--copilot-gradient);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      box-shadow: 0 4px 12px rgba(139, 92, 246, 0.35);
    }

    .header-titles h3 {
      margin: 0;
      font-size: 15px;
      font-weight: 700;
      color: #f8fafc;
    }

    .header-name-row {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .online-pill {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      background: rgba(16, 185, 129, 0.2);
      color: #34d399;
      font-size: 10px;
      font-weight: 600;
      padding: 2px 7px;
      border-radius: 999px;
    }

    .online-pill .dot {
      width: 6px;
      height: 6px;
      background: #10b981;
      border-radius: 50%;
    }

    .filter-slice-badge {
      margin: 2px 0 0;
      font-size: 11px;
      color: #94a3b8;
      max-width: 260px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .filter-slice-badge span {
      color: #64748b;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .head-btn {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #94a3b8;
      font-size: 14px;
      transition: all 0.15s ease;
    }

    .head-btn:hover {
      background: rgba(255, 255, 255, 0.1);
      color: #ffffff;
    }

    /* Proactive Questions Banner */
    .proactive-banner {
      background: #f8fafc;
      border-bottom: 1px solid var(--copilot-border);
      padding: 10px 16px;
    }

    .banner-title {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 11px;
      color: #475569;
      margin-bottom: 8px;
      text-transform: uppercase;
      letter-spacing: 0.4px;
    }

    .chips-slider {
      display: flex;
      gap: 8px;
      overflow-x: auto;
      padding-bottom: 4px;
      scrollbar-width: thin;
    }

    .question-chip {
      flex: 0 0 auto;
      max-width: 300px;
      padding: 6px 12px;
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 500;
      color: #1e293b;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: all 0.15s ease;
    }

    .question-chip:hover {
      background: #f1f5f9;
      border-color: #6366f1;
      color: #6366f1;
      transform: translateY(-1px);
    }

    .chip-q-mark {
      color: #6366f1;
      font-weight: 700;
    }

    /* Message Stream */
    .messages-viewport {
      flex: 1;
      overflow-y: auto;
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      background: #fafafa;
    }

    .chat-message {
      display: flex;
      gap: 10px;
      max-width: 90%;
      animation: fadeIn 0.25s ease;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(6px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .user-message {
      align-self: flex-end;
      flex-direction: row-reverse;
    }

    .assistant-message {
      align-self: flex-start;
    }

    .avatar-mini {
      width: 28px;
      height: 28px;
      border-radius: 8px;
      background: var(--copilot-gradient);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      flex-shrink: 0;
      color: #ffffff;
      margin-top: 2px;
    }

    .bubble-content {
      background: #ffffff;
      border: 1px solid var(--copilot-border);
      border-radius: 16px;
      padding: 14px 16px;
      box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04);
      font-size: 13px;
      line-height: 1.55;
      color: var(--copilot-text);
      word-break: break-word;
    }

    .user-message .bubble-content {
      background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%);
      color: #ffffff;
      border: none;
      box-shadow: 0 4px 14px rgba(79, 70, 229, 0.25);
    }

    .user-message .bubble-meta strong {
      color: #ffffff;
    }

    .user-message .bubble-meta .time {
      color: rgba(255, 255, 255, 0.7);
    }

    .bubble-meta {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 6px;
      font-size: 11px;
    }

    .bubble-meta strong {
      color: #334155;
      font-weight: 600;
    }

    .bubble-meta .time {
      color: #94a3b8;
    }

    .copy-btn {
      margin-left: auto;
      font-size: 10px;
      color: #64748b;
      padding: 2px 6px;
      border-radius: 4px;
      background: #f1f5f9;
      cursor: pointer;
    }

    .copy-btn:hover {
      background: #e2e8f0;
      color: #0f172a;
    }

    /* Markdown Body Styling */
    .markdown-body p {
      margin: 0 0 8px;
    }

    .markdown-body p:last-child {
      margin-bottom: 0;
    }

    .markdown-body h3 {
      font-size: 14px;
      font-weight: 700;
      margin: 4px 0 8px;
      color: #1e293b;
    }

    .markdown-body h4 {
      font-size: 13px;
      font-weight: 700;
      margin: 8px 0 4px;
      color: #334155;
    }

    .markdown-body ul, .markdown-body ol {
      margin: 4px 0 8px;
      padding-left: 18px;
    }

    .markdown-body li {
      margin-bottom: 4px;
    }

    .markdown-body blockquote {
      margin: 8px 0;
      padding: 8px 12px;
      background: #f8fafc;
      border-left: 3px solid #6366f1;
      border-radius: 0 8px 8px 0;
      font-size: 12px;
    }

    /* Data Badges */
    .badges-row {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-top: 10px;
      padding-top: 8px;
      border-top: 1px dashed #e2e8f0;
    }

    .metric-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 3px 8px;
      border-radius: 6px;
      font-size: 11px;
      background: #f1f5f9;
      color: #334155;
    }

    .metric-badge.primary {
      background: #e0e7ff;
      color: #4338ca;
    }

    .metric-badge.positive {
      background: #ecfdf5;
      color: #065f46;
    }

    .metric-badge.negative {
      background: #fef2f2;
      color: #991b1b;
    }

    .badge-label {
      color: inherit;
      opacity: 0.8;
    }

    /* Follow Up Suggestion Chips */
    .follow-ups {
      margin-top: 12px;
      padding-top: 10px;
      border-top: 1px solid #f1f5f9;
    }

    .follow-up-label {
      display: block;
      font-size: 10px;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.3px;
      margin-bottom: 6px;
    }

    .follow-up-chips {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .follow-up-btn {
      text-align: left;
      font-size: 11px;
      color: #4f46e5;
      background: #eef2ff;
      border: 1px solid #e0e7ff;
      padding: 5px 10px;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .follow-up-btn:hover {
      background: #e0e7ff;
      border-color: #c7d2fe;
    }

    /* Quick Starter Prompts */
    .quick-prompts {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-top: 12px;
    }

    .quick-btn {
      font-size: 11px;
      font-weight: 600;
      padding: 6px 10px;
      background: #f1f5f9;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      color: #1e293b;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .quick-btn:hover {
      background: #e2e8f0;
      border-color: #cbd5e1;
    }

    /* Thinking Bubble */
    .thinking-bubble {
      display: flex;
      align-items: center;
      gap: 8px;
      background: #ffffff;
      color: #64748b;
      font-size: 12px;
      font-style: italic;
    }

    .typing-dots {
      display: flex;
      gap: 4px;
    }

    .typing-dots span {
      width: 5px;
      height: 5px;
      background: #6366f1;
      border-radius: 50%;
      animation: bounce 1.4s infinite ease-in-out both;
    }

    .typing-dots span:nth-child(1) { animation-delay: -0.32s; }
    .typing-dots span:nth-child(2) { animation-delay: -0.16s; }

    @keyframes bounce {
      0%, 80%, 100% { transform: scale(0); }
      40% { transform: scale(1); }
    }

    /* Drawer Footer & Input */
    .drawer-footer {
      padding: 14px 18px;
      background: #ffffff;
      border-top: 1px solid var(--copilot-border);
    }

    .input-form {
      display: flex;
      gap: 8px;
      align-items: flex-end;
    }

    .query-input {
      flex: 1;
      resize: none;
      min-height: 40px;
      max-height: 120px;
      padding: 10px 14px;
      border: 1px solid #cbd5e1;
      border-radius: 12px;
      font-size: 13px;
      outline: none;
      transition: border-color 0.15s ease;
      background: #f8fafc;
    }

    .query-input:focus {
      border-color: #6366f1;
      background: #ffffff;
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.12);
    }

    .send-btn {
      width: 40px;
      height: 40px;
      border-radius: 12px;
      background: var(--copilot-gradient);
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      cursor: pointer;
      box-shadow: 0 4px 10px rgba(99, 102, 241, 0.3);
      transition: transform 0.15s ease, opacity 0.15s ease;
    }

    .send-btn:hover:not(:disabled) {
      transform: scale(1.04);
    }

    .send-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .footer-hint {
      margin-top: 6px;
      font-size: 10px;
      color: #94a3b8;
      text-align: center;
    }
  `]
})
export class AiCopilotComponent implements OnInit, OnChanges, OnDestroy {
  @Input() filter: DashboardFilter = { source: 'ALL' };
  @Input() isOpen = false;
  @Output() isOpenChange = new EventEmitter<boolean>();

  @ViewChild('scrollContainer') private scrollContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('inputBox') private inputBox!: ElementRef<HTMLTextAreaElement>;

  proactiveQuestions: string[] = [];
  messages: AiChatMessage[] = [];
  userInput = '';
  loading = false;
  copiedIndex: number | null = null;
  private subs = new Subscription();

  constructor(
    private api: DashboardApiService,
    private copilotService: AiCopilotService
  ) {}

  ngOnInit(): void {
    this.fetchAnalysis();

    this.subs.add(
      this.copilotService.isOpen$.subscribe(open => {
        this.isOpen = open;
        this.isOpenChange.emit(open);
        if (open) {
          setTimeout(() => {
            this.scrollToBottom();
            this.inputBox?.nativeElement?.focus();
          }, 150);
        }
      })
    );

    this.subs.add(
      this.copilotService.activeFilter$.subscribe(f => {
        if (f) {
          this.filter = f;
          this.fetchAnalysis();
        }
      })
    );

    this.subs.add(
      this.copilotService.pendingQuestion$.subscribe(q => {
        if (q) {
          this.askQuestion(q);
          this.copilotService.clearPendingQuestion();
        }
      })
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['filter'] && !changes['filter'].firstChange) {
      this.fetchAnalysis();
    }
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  get activeSliceLabel(): string {
    const parts: string[] = [];
    parts.push(this.filter.source || 'ALL');
    if (this.filter.commodity) parts.push(this.filter.commodity);
    if (this.filter.state) parts.push(this.filter.state);
    if (this.filter.qtyUnit) parts.push(this.filter.qtyUnit);
    return parts.join(' • ');
  }

  fetchAnalysis(): void {
    this.api.aiAnalysis(this.filter).subscribe({
      next: (res: AiAnalysisResponse) => {
        this.proactiveQuestions = res.suggestedQuestions || [];
      },
      error: () => {
        this.proactiveQuestions = [
          'Give me an executive summary of auction performance',
          'Which commodities have the highest clearance rates?',
          'Who are the top 3 clients by trade value?'
        ];
      }
    });
  }

  openDrawer(): void {
    this.copilotService.open();
  }

  closeDrawer(): void {
    this.copilotService.close();
  }

  clearChat(): void {
    this.messages = [];
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

    const userMsg: AiChatMessage = {
      role: 'user',
      content: query,
      timestamp: this.currentTime()
    };
    this.messages.push(userMsg);
    this.userInput = '';
    this.loading = true;
    this.scrollToBottom();

    this.api.aiChat({
      message: query,
      conversationHistory: this.messages,
      filter: this.filter
    }).subscribe({
      next: res => {
        this.messages.push({
          role: 'assistant',
          content: res.answer,
          timestamp: this.currentTime(),
          suggestedFollowUps: res.suggestedFollowUps,
          dataBadges: res.dataBadges
        });
        this.loading = false;
        this.scrollToBottom();
      },
      error: () => {
        this.messages.push({
          role: 'assistant',
          content: 'Sorry, I encountered an issue analyzing the current data slice. Please try asking again or broaden your filters.',
          timestamp: this.currentTime()
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

    // Headings
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^#### (.*$)/gim, '<h4>$1</h4>');

    // Bold
    html = html.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');

    // Code/Pills
    html = html.replace(/`(.*?)`/g, '<code style="background:#f1f5f9;padding:2px 6px;border-radius:4px;font-size:11px;">$1</code>');

    // Blockquotes
    html = html.replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>');

    // Bullet points
    html = html.replace(/^\- (.*$)/gim, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>)/gim, '<ul>$1</ul>');

    // Clean up adjacent <ul> tags
    html = html.replace(/<\/ul>\s*<ul>/g, '');

    // Paragraphs
    html = html.replace(/\n\n/g, '</p><p>');
    html = '<p>' + html + '</p>';
    html = html.replace(/<p><\/p>/g, '');

    return html;
  }

  private currentTime(): string {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      if (this.scrollContainer) {
        this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
      }
    }, 100);
  }
}
