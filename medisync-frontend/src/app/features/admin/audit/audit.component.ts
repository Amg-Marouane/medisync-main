import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { PageHeaderComponent } from '../../../shared/components/page-header.component';
import { AdminService } from '../../../core/services/admin.service';
import { AuditLogDto } from '../../../core/models/user.model';

@Component({
  selector: 'app-audit',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatProgressSpinnerModule, MatChipsModule, PageHeaderComponent],
  template: `
    <div class="page">
      <app-page-header
        eyebrow="Sécurité"
        icon="security"
        title="Journal d'audit"
        subtitle="Historique complet des actions sensibles sur la plateforme."
      ></app-page-header>

      @if (loading()) {
        <div class="loader"><mat-spinner></mat-spinner></div>
      } @else if (logs().length === 0) {
        <mat-card class="empty-card">
          <mat-icon>history</mat-icon>
          <p>Aucun événement enregistré.</p>
        </mat-card>
      } @else {
        <mat-card class="log-card">
          <div class="log-list">
            @for (log of logs(); track log.id) {
              <div class="log-entry">
                <div class="log-icon" [class]="actionClass(log.action)">
                  <mat-icon>{{ actionIcon(log.action) }}</mat-icon>
                </div>
                <div class="log-body">
                  <div class="log-top">
                    <mat-chip [class]="'chip-' + actionClass(log.action)">{{ actionLabel(log.action) }}</mat-chip>
                    <span class="log-by">{{ log.performedBy }}</span>
                    <span class="log-date">{{ log.createdAt | date:'dd/MM/yyyy HH:mm:ss' }}</span>
                  </div>
                  @if (log.details) {
                    <p class="log-details">{{ log.details }}</p>
                  }
                </div>
              </div>
            }
          </div>
        </mat-card>
      }
    </div>
  `,
  styles: [`
    .page { padding: 24px; max-width: 1100px; margin: 0 auto; }
    .loader { display: flex; justify-content: center; padding: 48px; }
    .empty-card {
      display: flex; flex-direction: column; align-items: center;
      padding: 48px; gap: 12px; border-radius: 16px;
      mat-icon { font-size: 48px; width: 48px; height: 48px; color: #cbd5e1; }
      p { color: #94a3b8; margin: 0; }
    }
    .log-card { padding: 0; border-radius: 16px; overflow: hidden; }
    .log-list { display: flex; flex-direction: column; }
    .log-entry {
      display: flex; align-items: flex-start; gap: 16px;
      padding: 16px 20px;
      border-bottom: 1px solid #f1f5f9;
      &:last-child { border-bottom: none; }
      &:hover { background: #f8fafc; }
    }
    .log-icon {
      width: 40px; height: 40px; border-radius: 10px; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
      &.info { background: #e0f2fe; color: #0369a1; }
      &.success { background: #d1fae5; color: #065f46; }
      &.warning { background: #fef3c7; color: #92400e; }
      &.danger { background: #fee2e2; color: #991b1b; }
      mat-icon { font-size: 20px; width: 20px; height: 20px; }
    }
    .log-body { flex: 1; min-width: 0; }
    .log-top {
      display: flex; align-items: center; gap: 12px; flex-wrap: wrap; margin-bottom: 4px;
    }
    .log-by { font-size: 13px; color: #334155; font-weight: 500; }
    .log-date { font-size: 12px; color: #94a3b8; margin-left: auto; }
    .log-details { margin: 0; font-size: 13px; color: #64748b; }
    mat-chip {
      font-size: 11px !important; min-height: 22px !important;
      &.chip-info { background: #e0f2fe !important; color: #0369a1 !important; }
      &.chip-success { background: #d1fae5 !important; color: #065f46 !important; }
      &.chip-warning { background: #fef3c7 !important; color: #92400e !important; }
      &.chip-danger { background: #fee2e2 !important; color: #991b1b !important; }
    }
  `]
})
export class AuditComponent implements OnInit {
  private readonly adminSvc = inject(AdminService);

  readonly loading = signal(true);
  readonly logs = signal<AuditLogDto[]>([]);

  ngOnInit(): void {
    this.adminSvc.getAuditLogs().subscribe({
      next: (l) => { this.logs.set(l); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  actionClass(action: string): string {
    if (action.includes('DELETE') || action.includes('DISABLED')) return 'danger';
    if (action.includes('LOGIN') || action.includes('REGISTERED')) return 'success';
    if (action.includes('2FA') || action.includes('UPDATED')) return 'warning';
    return 'info';
  }

  actionIcon(action: string): string {
    const map: Record<string, string> = {
      USER_LOGIN: 'login', USER_REGISTERED: 'person_add', USER_CREATED: 'person_add',
      USER_UPDATED: 'edit', USER_DELETED: 'delete', '2FA_ENABLED': 'security',
      '2FA_DISABLED': 'no_encryption'
    };
    return map[action] ?? 'info';
  }

  actionLabel(action: string): string {
    const map: Record<string, string> = {
      USER_LOGIN: 'Connexion', USER_REGISTERED: 'Inscription', USER_CREATED: 'Création',
      USER_UPDATED: 'Modification', USER_DELETED: 'Suppression',
      '2FA_ENABLED': '2FA activé', '2FA_DISABLED': '2FA désactivé'
    };
    return map[action] ?? action;
  }
}
