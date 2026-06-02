import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AdminService } from '../../../core/services/admin.service';
import { DoctorService } from '../../../core/services/doctor.service';
import { AppointmentDto, DashboardStats, DoctorDto } from '../../../core/models/user.model';

interface Praticien { name: string; specialty: string; consult: number; fee: number; initials: string; }

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatIconModule, MatButtonModule, MatProgressSpinnerModule],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1>Tableau de bord</h1>
          <p>Bienvenue, Admin MediSync — {{ today }}</p>
        </div>
      </div>

      @if (loading()) {
        <div class="loader"><mat-spinner></mat-spinner></div>
      } @else {
        <!-- KPI Cards -->
        <div class="kpi-row">
          <mat-card class="kpi-card" style="border-top:3px solid #0369a1">
            <div class="kpi-icon" style="background:#e0f2fe">
              <mat-icon style="color:#0369a1">people</mat-icon>
            </div>
            <div class="kpi-body">
              <span class="kpi-val">{{ stats()?.users ?? '—' }}</span>
              <span class="kpi-lbl">Utilisateurs</span>
            </div>
          </mat-card>
          <mat-card class="kpi-card" style="border-top:3px solid #166534">
            <div class="kpi-icon" style="background:#dcfce7">
              <mat-icon style="color:#166534">medical_services</mat-icon>
            </div>
            <div class="kpi-body">
              <span class="kpi-val">{{ stats()?.doctors ?? '—' }}</span>
              <span class="kpi-lbl">Médecins actifs</span>
            </div>
          </mat-card>
          <mat-card class="kpi-card" style="border-top:3px solid #92400e">
            <div class="kpi-icon" style="background:#fef3c7">
              <mat-icon style="color:#92400e">event_available</mat-icon>
            </div>
            <div class="kpi-body">
              <span class="kpi-val">{{ stats()?.appointments ?? '—' }}</span>
              <span class="kpi-lbl">Rendez-vous (total)</span>
            </div>
          </mat-card>
          <mat-card class="kpi-card" style="border-top:3px solid #6d28d9">
            <div class="kpi-icon" style="background:#f3e8ff">
              <mat-icon style="color:#6d28d9">pending_actions</mat-icon>
            </div>
            <div class="kpi-body">
              <span class="kpi-val">{{ pendingCount() }}</span>
              <span class="kpi-lbl">En attente de confirmation</span>
            </div>
          </mat-card>
        </div>

        <!-- Middle Row -->
        <div class="mid-row">
          <!-- Appointments -->
          <mat-card class="panel">
            <div class="panel-header">
              <h3><mat-icon>event</mat-icon>
                {{ todayAppts().length > 0 ? "Rendez-vous d'aujourd'hui" : 'Rendez-vous récents' }}
              </h3>
              <span class="appt-date">{{ todayStr }}</span>
            </div>
            @if (allAppts().length === 0) {
              <p class="empty">Aucun rendez-vous enregistré.</p>
            } @else {
              <div class="appt-list">
                @for (a of displayAppts(); track a.id) {
                  <div class="appt-row">
                    <div class="appt-avatar">{{ (a.bookedForName || a.patientName)[0] }}</div>
                    <div class="appt-info">
                      <strong>{{ a.bookedForName || a.patientName }}</strong>
                      <span>{{ a.doctorName }} · {{ a.specialty }}</span>
                    </div>
                    <span class="appt-time">{{ formatTime(a.startsAt) }}</span>
                    <span class="appt-chip" [class]="'chip-' + a.status.toLowerCase()">
                      {{ statusLabel(a.status) }}
                    </span>
                  </div>
                }
              </div>
            }
          </mat-card>

          <!-- Right col -->
          <div class="right-col">
            <mat-card class="panel">
              <div class="panel-header">
                <h3><mat-icon>notifications_active</mat-icon>Alertes</h3>
              </div>
              <div class="alert-list">
                @if (pendingCount() > 0) {
                  <div class="alert-row al-warn">
                    <mat-icon>schedule</mat-icon>
                    <span>{{ pendingCount() }} RDV en attente de confirmation</span>
                  </div>
                }
                @if (cancelledCount() > 0) {
                  <div class="alert-row al-error">
                    <mat-icon>cancel</mat-icon>
                    <span>{{ cancelledCount() }} RDV annulés au total</span>
                  </div>
                }
                @if (stats() && stats()!.appointments === 0) {
                  <div class="alert-row al-info">
                    <mat-icon>info</mat-icon>
                    <span>Aucun rendez-vous enregistré pour le moment</span>
                  </div>
                }
                @if (praticiens().length === 0) {
                  <div class="alert-row al-warn">
                    <mat-icon>person_add</mat-icon>
                    <span>Aucun médecin enregistré — ajoutez du personnel</span>
                  </div>
                }
                @if (pendingCount() === 0 && cancelledCount() === 0 && praticiens().length > 0) {
                  <div class="alert-row al-info">
                    <mat-icon>check_circle</mat-icon>
                    <span>Tout est à jour — aucune alerte active</span>
                  </div>
                }
              </div>
            </mat-card>

            <mat-card class="panel shortcuts">
              <h3><mat-icon>flash_on</mat-icon>Accès rapide</h3>
              <div class="shortcut-grid">
                <a mat-stroked-button routerLink="/admin/staff">
                  <mat-icon>badge</mat-icon>Personnel
                </a>
                <a mat-stroked-button routerLink="/admin/statistics">
                  <mat-icon>insights</mat-icon>Statistiques
                </a>
                <a mat-stroked-button routerLink="/admin/finance">
                  <mat-icon>payments</mat-icon>Finance
                </a>
                <a mat-stroked-button routerLink="/admin/establishment">
                  <mat-icon>local_hospital</mat-icon>Établissement
                </a>
              </div>
            </mat-card>
          </div>
        </div>

        <!-- Praticiens -->
        <mat-card class="panel">
          <div class="panel-header">
            <h3><mat-icon>people</mat-icon>Praticiens enregistrés</h3>
            <a mat-button routerLink="/admin/staff">Gérer</a>
          </div>
          @if (praticiens().length === 0) {
            <p class="empty">Aucun médecin enregistré. <a routerLink="/admin/staff">Ajouter un praticien</a></p>
          } @else {
            <div class="pract-list">
              @for (p of praticiens(); track p.name; let last = $last) {
                <div class="pract-item" [class.no-border]="last">
                  <div class="p-avatar">{{ p.initials }}</div>
                  <div class="p-info">
                    <strong>{{ p.name }}</strong>
                    <span>{{ p.specialty || 'Spécialité non renseignée' }}</span>
                  </div>
                  <div class="p-stat">
                    <strong>{{ p.consult }}</strong>
                    <span>RDV total</span>
                  </div>
                  <div class="p-fee">
                    <strong>{{ p.fee }} DH</strong>
                    <span>tarif consultation</span>
                  </div>
                </div>
              }
            </div>
          }
        </mat-card>
      }
    </div>
  `,
  styles: [`
    .page { padding: 24px; max-width: 1200px; margin: 0 auto; }
    .page-header { margin-bottom: 24px; h1 { margin: 0 0 4px; font-size: 26px; font-weight: 700; } p { margin: 0; color: #64748b; font-size: 14px; } }
    .loader { display: flex; justify-content: center; padding: 64px; }
    .empty { color: #94a3b8; padding: 16px 0; font-size: 14px; a { color: #0d6efd; } }

    .kpi-row {
      display: grid; grid-template-columns: repeat(4,1fr); gap: 12px; margin-bottom: 16px;
      @media (max-width: 1000px) { grid-template-columns: 1fr 1fr; }
      @media (max-width: 600px)  { grid-template-columns: 1fr; }
    }
    .kpi-card { display: flex; align-items: center; gap: 14px; padding: 18px 20px; border-radius: 14px; }
    .kpi-icon {
      width: 48px; height: 48px; border-radius: 12px; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
      mat-icon { font-size: 22px; width: 22px; height: 22px; }
    }
    .kpi-body { display: flex; flex-direction: column; gap: 2px; }
    .kpi-val { font-size: 26px; font-weight: 700; color: #0f172a; }
    .kpi-lbl { font-size: 12px; color: #64748b; }

    .mid-row {
      display: grid; grid-template-columns: 1fr 320px; gap: 16px; margin-bottom: 16px;
      @media (max-width: 900px) { grid-template-columns: 1fr; }
    }
    .panel {
      padding: 20px; border-radius: 16px;
      h3 { margin: 0; font-size: 15px; font-weight: 600; display: flex; align-items: center; gap: 8px;
           mat-icon { color: #0d6efd; font-size: 20px; width: 20px; height: 20px; } }
    }
    .panel-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .appt-date { font-size: 12px; color: #94a3b8; }

    .appt-list { display: flex; flex-direction: column; }
    .appt-row {
      display: grid; grid-template-columns: 36px 1fr auto auto; gap: 12px; align-items: center;
      padding: 11px 0; border-bottom: 1px solid #f1f5f9; &:last-child { border-bottom: none; }
    }
    .appt-avatar {
      width: 36px; height: 36px; border-radius: 50%; flex-shrink: 0;
      background: linear-gradient(135deg, #0d6efd, #06b6d4);
      color: white; font-weight: 700; font-size: 14px;
      display: flex; align-items: center; justify-content: center; text-transform: uppercase;
    }
    .appt-info { strong { display: block; font-size: 14px; } span { font-size: 12px; color: #64748b; } }
    .appt-time { font-size: 13px; color: #475569; font-weight: 500; white-space: nowrap; }
    .appt-chip {
      font-size: 11px; font-weight: 600; padding: 3px 9px; border-radius: 20px; white-space: nowrap;
      &.chip-confirmed { background: #d1fae5; color: #065f46; }
      &.chip-requested { background: #fef3c7; color: #92400e; }
      &.chip-cancelled  { background: #fee2e2; color: #991b1b; }
    }

    .right-col { display: flex; flex-direction: column; gap: 16px; }
    .alert-list { display: flex; flex-direction: column; gap: 8px; }
    .alert-row {
      display: flex; align-items: center; gap: 10px;
      padding: 10px 12px; border-radius: 10px; font-size: 13px;
      mat-icon { font-size: 18px; width: 18px; height: 18px; flex-shrink: 0; }
      &.al-warn  { background: #fef3c7; color: #92400e; mat-icon { color: #d97706; } }
      &.al-error { background: #fee2e2; color: #991b1b; mat-icon { color: #ef4444; } }
      &.al-info  { background: #e0f2fe; color: #075985; mat-icon { color: #0284c7; } }
    }
    .shortcuts { h3 { margin: 0 0 14px; } }
    .shortcut-grid {
      display: grid; grid-template-columns: 1fr 1fr; gap: 8px;
      a { display: flex; align-items: center; gap: 6px; font-size: 13px; }
    }

    .pract-list { display: flex; flex-direction: column; }
    .pract-item {
      display: grid; grid-template-columns: 40px 1fr auto auto; gap: 16px; align-items: center;
      padding: 13px 0; border-bottom: 1px solid #f1f5f9; &.no-border { border-bottom: none; }
      @media (max-width: 700px) { grid-template-columns: 40px 1fr; .p-stat, .p-fee { display: none; } }
    }
    .p-avatar {
      width: 40px; height: 40px; border-radius: 50%;
      background: linear-gradient(135deg, #0d6efd, #06b6d4);
      color: white; font-weight: 700; font-size: 13px;
      display: flex; align-items: center; justify-content: center;
    }
    .p-info { strong { display: block; font-size: 14px; } span { font-size: 12px; color: #64748b; } }
    .p-stat, .p-fee {
      text-align: right;
      strong { display: block; font-size: 16px; font-weight: 700; }
      span { font-size: 11px; color: #94a3b8; }
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  private readonly adminSvc = inject(AdminService);
  private readonly doctorSvc = inject(DoctorService);

  readonly today = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  readonly todayStr = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });

  readonly loading = signal(true);
  readonly stats = signal<DashboardStats | null>(null);
  readonly allAppts = signal<AppointmentDto[]>([]);
  readonly praticiens = signal<Praticien[]>([]);

  readonly todayAppts = computed(() => {
    const today = new Date().toISOString().split('T')[0];
    return this.allAppts()
      .filter(a => a.startsAt.toString().startsWith(today))
      .sort((a, b) => a.startsAt.toString().localeCompare(b.startsAt.toString()));
  });

  readonly displayAppts = computed(() => {
    const today = this.todayAppts();
    if (today.length > 0) return today.slice(0, 6);
    return [...this.allAppts()].slice(0, 6);
  });

  readonly pendingCount = computed(() =>
    this.allAppts().filter(a => a.status === 'REQUESTED').length
  );

  readonly cancelledCount = computed(() =>
    this.allAppts().filter(a => a.status === 'CANCELLED').length
  );

  ngOnInit(): void {
    forkJoin({
      stats: this.adminSvc.getDashboardStats().pipe(catchError(() => of(null))),
      appointments: this.adminSvc.getAppointments().pipe(catchError(() => of([] as AppointmentDto[]))),
      doctors: this.doctorSvc.getDoctors().pipe(catchError(() => of([] as DoctorDto[])))
    }).subscribe(({ stats, appointments, doctors }) => {
      this.stats.set(stats);
      this.allAppts.set(appointments);

      const apptsByDoctor = new Map<number, number>();
      appointments.forEach(a => {
        apptsByDoctor.set(a.doctorId, (apptsByDoctor.get(a.doctorId) ?? 0) + 1);
      });

      this.praticiens.set(doctors.map(d => ({
        name: `Dr ${d.fullName}`,
        specialty: d.specialty,
        consult: apptsByDoctor.get(d.id) ?? 0,
        fee: d.consultationFee,
        initials: d.fullName.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)
      })));

      this.loading.set(false);
    });
  }

  formatTime(startsAt: string): string {
    return new Date(startsAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  }

  statusLabel(status: string): string {
    return { CONFIRMED: 'Confirmé', REQUESTED: 'En attente', CANCELLED: 'Annulé' }[status] ?? status;
  }
}
