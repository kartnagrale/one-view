import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { DashboardFilter } from './models';

@Injectable({ providedIn: 'root' })
export class AiCopilotService {
  private isOpenSubject = new BehaviorSubject<boolean>(false);
  isOpen$ = this.isOpenSubject.asObservable();

  private pendingQuestionSubject = new BehaviorSubject<string | null>(null);
  pendingQuestion$ = this.pendingQuestionSubject.asObservable();

  private activeFilterSubject = new BehaviorSubject<DashboardFilter>({ source: 'ALL' });
  activeFilter$ = this.activeFilterSubject.asObservable();

  get isOpen(): boolean {
    return this.isOpenSubject.value;
  }

  open(question?: string): void {
    if (question) {
      this.pendingQuestionSubject.next(question);
    }
    this.isOpenSubject.next(true);
  }

  close(): void {
    this.isOpenSubject.next(false);
  }

  toggle(): void {
    this.isOpenSubject.next(!this.isOpenSubject.value);
  }

  setFilter(filter: DashboardFilter): void {
    this.activeFilterSubject.next(filter);
  }

  clearPendingQuestion(): void {
    this.pendingQuestionSubject.next(null);
  }
}
