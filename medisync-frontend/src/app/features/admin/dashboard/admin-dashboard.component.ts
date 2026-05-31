import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AdminService } from '../../../core/services/admin.service';
import { DashboardStats } from '../../../core/models/user.model';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatProgressSpinnerModule],
  template: `
    <div class="page">
      <header class="page-header">
        <h1>Tableau de bord — Administration</h1>
        <p>Vue d'ensemble de l'établissement.</p>
      </header>

      @if (loading()) {
        <div class="loader"><mat-spinner></mat-spinner></div>
      } @else {
        <div class="kpi-grid">
          <mat-card class="kpi">
            <mat-icon>people</mat-icon>
            <div>
              <span class="value">{{ stats()?.users ?? '—' }}</span>
              <span class="label">Utilisateurs</span>
            </div>
          </mat-card>

          <mat-card class="kpi">
            <mat-icon>medical_services</mat-icon>
            <div>
              <span class="value">{{ stats()?.doctors ?? '—' }}</span>
              <span class="label">Médecins</span>
            </div>
          </mat-card>

          <mat-card class="kpi">
            <mat-icon>event_available</mat-icon>
            <div>
              <span class="value">{{ stats()?.appointments ?? '—' }}</span>
              <span class="label">Rendez-vous</span>
            </div>
          </mat-card>
        </div>
      }
    </div>
  `,
  styles: [`
    .page { padding: 24px; }
    .page-header h1 { margin: 0 0 4px; }
    .page-header p { margin: 0 0 24px; color: #64748b; }
    .loader { display: flex; justify-content: center; padding: 48px; }
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 16px;
    }
    .kpi {
      display: flex; align-items: center; gap: 16px; padding: 20px;
      mat-icon {
        font-size: 32px; width: 32px; height: 32px; color: #0d6efd;
        background: #e0f2fe; padding: 12px; border-radius: 12px;
      }
      .value { display: block; font-size: 28px; font-weight: 700; }
      .label { display: block; color: #64748b; font-size: 13px; }
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  private readonly adminSvc = inject(AdminService);

  readonly loading = signal(true);
  readonly stats = signal<DashboardStats | null>(null);

  ngOnInit(): void {
    this.adminSvc.getDashboardStats().subscribe({
      next: (s) => { this.stats.set(s); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }
}
