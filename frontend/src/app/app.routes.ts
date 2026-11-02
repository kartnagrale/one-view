import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { LoginComponent } from './features/login/login.component';
import { AppShellComponent } from './layout/app-shell.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { AuctionsComponent } from './features/auctions/auctions.component';
import { ParticipantsComponent } from './features/participants/participants.component';
import { ReportsComponent } from './features/reports/reports.component';
import { MappingsComponent } from './features/mappings/mappings.component';
import { AiAssistantComponent } from './features/ai-assistant/ai-assistant.component';
import { authGuard } from './core/auth.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', component: HomeComponent },
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: AppShellComponent,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'auctions', component: AuctionsComponent },
      { path: 'participants', component: ParticipantsComponent },
      { path: 'reports', component: ReportsComponent },
      { path: 'mappings', component: MappingsComponent },
      { path: 'ai-assistant', component: AiAssistantComponent }
    ]
  },
  { path: '**', redirectTo: '' }
];
