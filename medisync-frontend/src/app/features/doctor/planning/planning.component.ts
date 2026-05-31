import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { PageHeaderComponent } from '../../../shared/components/page-header.component';
import { AppointmentService } from '../../../core/services/appointment.service';
import { AppointmentDto } from '../../../core/models/user.model';

type PlanningView = 'day' | 'week' | 'month';

interface AvailabilitySettings {
  start: string;
  end: string;
  slotMinutes: number;
}

interface UnavailableDay {
  date: string;
  reason: string;
}

@Component({
  selector: 'app-doctor-planning',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatSnackBarModule,
    PageHeaderComponent
  ],
  template: `
    <div class="page">
      <app-page-header
        eyebrow="Agenda"
        icon="calendar_month"
        title="Planning"
        subtitle="Journalier, hebdomadaire, mensuel et urgences."
      >
        <button mat-stroked-button type="button" (click)="showSettings.update(v => !v)">
          <mat-icon>tune</mat-icon>
          Disponibilites
        </button>
        <button mat-flat-button color="primary" type="button" (click)="showUrgent.update(v => !v)">
          <mat-icon>priority_high</mat-icon>
          Urgence
        </button>
      </app-page-header>

      <div class="toolbar">
        <div class="view-switch">
          <button mat-stroked-button type="button" [class.active]="view() === 'day'" (click)="view.set('day')">Jour</button>
          <button mat-stroked-button type="button" [class.active]="view() === 'week'" (click)="view.set('week')">Semaine</button>
          <button mat-stroked-button type="button" [class.active]="view() === 'month'" (click)="view.set('month')">Mois</button>
        </div>
        <mat-form-field appearance="outline">
          <mat-label>Date</mat-label>
          <input matInput type="date" [value]="selectedDate()" (input)="selectedDate.set($any($event.target).value)" />
        </mat-form-field>
      </div>

      @if (showSettings()) {
        <mat-card class="panel">
          <h3><mat-icon>schedule</mat-icon> Horaires et indisponibilites</h3>
          <form [formGroup]="availabilityForm" (ngSubmit)="saveAvailability()" class="settings-grid">
            <mat-form-field appearance="outline">
              <mat-label>Debut</mat-label>
              <input matInput type="time" formControlName="start" />
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Fin</mat-label>
              <input matInput type="time" formControlName="end" />
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Duree creneau</mat-label>
              <mat-select formControlName="slotMinutes">
                <mat-option [value]="15">15 min</mat-option>
                <mat-option [value]="30">30 min</mat-option>
                <mat-option [value]="45">45 min</mat-option>
                <mat-option [value]="60">60 min</mat-option>
              </mat-select>
            </mat-form-field>
            <button mat-flat-button color="primary" type="submit">
              <mat-icon>save</mat-icon>
              Enregistrer
            </button>
          </form>

          <form [formGroup]="leaveForm" (ngSubmit)="addUnavailableDay()" class="settings-grid leave">
            <mat-form-field appearance="outline">
              <mat-label>Jour indisponible</mat-label>
              <input matInput type="date" formControlName="date" />
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Motif</mat-label>
              <input matInput formControlName="reason" placeholder="Conge, formation..." />
            </mat-form-field>
            <button mat-stroked-button type="submit">
              <mat-icon>block</mat-icon>
              Ajouter
            </button>
          </form>

          <div class="leave-list">
            @for (day of unavailableDays(); track day.date) {
              <mat-chip (removed)="removeUnavailableDay(day.date)">
                {{ day.date }} - {{ day.reason }}
                <button matChipRemove><mat-icon>cancel</mat-icon></button>
              </mat-chip>
            }
          </div>
        </mat-card>
      }

      @if (showUrgent()) {
        <mat-card class="panel urgent-panel">
          <h3><mat-icon>emergency</mat-icon> Inserer un rendez-vous urgent</h3>
          <form [formGroup]="urgentForm" (ngSubmit)="addUrgentAppointment()" class="urgent-grid">
            <mat-form-field appearance="outline">
              <mat-label>Patient</mat-label>
              <input matInput formControlName="patientName" />
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Heure</mat-label>
              <input matInput type="time" formControlName="time" />
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Motif</mat-label>
              <input matInput formControlName="reason" />
            </mat-form-field>
            <button mat-flat-button color="primary" type="submit">
              <mat-icon>add_alert</mat-icon>
              Inserer
            </button>
          </form>
        </mat-card>
      }

      <div class="kpis">
        <mat-card class="kpi"><strong>{{ todayPatients().length }}</strong><span>Patients aujourd'hui</span></mat-card>
        <mat-card class="kpi"><strong>{{ visibleAppointments().length }}</strong><span>Rendez-vous affiches</span></mat-card>
        <mat-card class="kpi warn"><strong>{{ unavailableDays().length }}</strong><span>Jours indisponibles</span></mat-card>
      </div>

      @if (loading()) {
        <div class="loader"><mat-spinner></mat-spinner></div>
      } @else {
        <section class="planning-grid" [class.month]="view() === 'month'">
          @for (a of visibleAppointments(); track a.id) {
            <mat-card class="appt" [class]="consultationClass(a.reason)">
              <div class="appt-main">
                <span class="date-badge">
                  {{ a.startsAt | date:'dd/MM' }}
                  <span>{{ a.startsAt | date:'HH:mm' }}</span>
                </span>
                <div>
                  <strong>{{ a.patientName }}</strong>
                  <span>{{ a.reason }} - {{ a.durationMinutes }} min</span>
                  <span>{{ statusLabel(a.status) }}</span>
                </div>
              </div>
              @if (a.status === 'REQUESTED') {
                <div class="actions">
                  <button mat-flat-button color="primary" type="button" (click)="setStatus(a.id, 'CONFIRMED')">
                    <mat-icon>check</mat-icon>
                    Confirmer
                  </button>
                  <button mat-stroked-button color="warn" type="button" (click)="setStatus(a.id, 'CANCELLED')">
                    <mat-icon>close</mat-icon>
                    Annuler
                  </button>
                </div>
              }
            </mat-card>
          } @empty {
            <mat-card class="empty-card">
              <mat-icon>event_busy</mat-icon>
              <p>Aucun rendez-vous sur cette periode.</p>
            </mat-card>
          }
        </section>

        <mat-card class="today-list">
          <h3><mat-icon>groups</mat-icon> Patients attendus aujourd'hui</h3>
          @for (a of todayPatients(); track a.id) {
            <div class="today-row">
              <strong>{{ a.patientName }}</strong>
              <span>{{ a.startsAt | date:'HH:mm' }} - {{ a.reason }}</span>
            </div>
          } @empty {
            <p>Aucun patient attendu aujourd'hui.</p>
          }
        </mat-card>
      }
    </div>
  `,
  styles: [`
    .page { padding: 24px; max-width: 1200px; margin: 0 auto; }
    .toolbar { display: flex; justify-content: space-between; gap: 16px; align-items: center; margin-bottom: 16px; }
    .view-switch { display: flex; gap: 8px; flex-wrap: wrap; }
    .view-switch .active { background: #0d6efd; color: white; }
    .panel, .today-list { padding: 20px; border-radius: 8px; margin-bottom: 16px; }
    .panel h3, .today-list h3 {
      display: flex; align-items: center; gap: 8px; margin: 0 0 16px; color: #0d6efd;
    }
    .settings-grid, .urgent-grid {
      display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; align-items: start;
    }
    .settings-grid button, .urgent-grid button { height: 56px; }
    .leave { grid-template-columns: 1fr 2fr auto; margin-top: 8px; }
    .leave-list { display: flex; gap: 8px; flex-wrap: wrap; }
    .kpis { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 16px; }
    .kpi { padding: 18px; border-radius: 8px; }
    .kpi strong { display: block; font-size: 26px; color: #0d6efd; }
    .kpi span { color: #64748b; font-size: 13px; }
    .kpi.warn strong { color: #b91c1c; }
    .loader { display: flex; justify-content: center; padding: 48px; }
    .planning-grid { display: grid; grid-template-columns: 1fr; gap: 10px; margin-bottom: 16px; }
    .planning-grid.month { grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); }
    .appt {
      display: flex; justify-content: space-between; align-items: center; gap: 12px;
      padding: 16px; border-radius: 8px; border-left: 5px solid #94a3b8;
    }
    .appt.urgent { border-left-color: #ef4444; background: #fef2f2; }
    .appt.general { border-left-color: #0d6efd; }
    .appt.follow { border-left-color: #10b981; }
    .appt.control { border-left-color: #f59e0b; }
    .appt-main { display: flex; align-items: center; gap: 14px; min-width: 0; }
    .appt-main strong, .appt-main span { display: block; }
    .appt-main span { color: #64748b; font-size: 13px; }
    .date-badge {
      display: flex; flex-direction: column; align-items: center; min-width: 58px;
      padding: 8px; border-radius: 8px; background: #e0f2fe; color: #0d6efd; font-weight: 700;
    }
    .date-badge span { color: #0d6efd; font-size: 12px; }
    .actions { display: flex; gap: 6px; flex-wrap: wrap; justify-content: flex-end; }
    .empty-card { padding: 40px; text-align: center; color: #64748b; border-radius: 8px; }
    .empty-card mat-icon { color: #cbd5e1; font-size: 42px; width: 42px; height: 42px; }
    .today-row { display: flex; justify-content: space-between; gap: 12px; padding: 10px 0; border-top: 1px solid #e2e8f0; }
    .today-row span { color: #64748b; }
    @media (max-width: 800px) {
      .toolbar, .today-row { flex-direction: column; align-items: stretch; }
      .settings-grid, .urgent-grid, .leave, .kpis { grid-template-columns: 1fr; }
      .appt { flex-direction: column; align-items: stretch; }
    }
  `]
})
export class DoctorPlanningComponent implements OnInit {
  private readonly apptSvc = inject(AppointmentService);
  private readonly fb = inject(FormBuilder);
  private readonly snack = inject(MatSnackBar);

  readonly loading = signal(true);
  readonly appointments = signal<AppointmentDto[]>([]);
  readonly urgentAppointments = signal<AppointmentDto[]>([]);
  readonly view = signal<PlanningView>('day');
  readonly selectedDate = signal(this.today());
  readonly showSettings = signal(false);
  readonly showUrgent = signal(false);
  readonly unavailableDays = signal<UnavailableDay[]>(this.loadUnavailableDays());

  readonly availabilityForm = this.fb.nonNullable.group({
    start: [this.loadAvailability().start, Validators.required],
    end: [this.loadAvailability().end, Validators.required],
    slotMinutes: [this.loadAvailability().slotMinutes, Validators.required]
  });

  readonly leaveForm = this.fb.nonNullable.group({
    date: [this.today(), Validators.required],
    reason: ['Conge', Validators.required]
  });

  readonly urgentForm = this.fb.nonNullable.group({
    patientName: ['', Validators.required],
    time: ['12:00', Validators.required],
    reason: ['Urgence', Validators.required]
  });

  readonly allAppointments = computed(() => [...this.urgentAppointments(), ...this.appointments()]);
  readonly visibleAppointments = computed(() => {
    const selected = new Date(this.selectedDate());
    return this.allAppointments()
      .filter((appt) => this.isInCurrentView(new Date(appt.startsAt), selected))
      .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());
  });
  readonly todayPatients = computed(() =>
    this.allAppointments()
      .filter((appt) => appt.startsAt.slice(0, 10) === this.today())
      .filter((appt) => appt.status !== 'CANCELLED')
      .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())
  );

  ngOnInit(): void {
    this.load();
  }

  saveAvailability(): void {
    localStorage.setItem('medisync_doctor_availability', JSON.stringify(this.availabilityForm.getRawValue()));
    this.snack.open('Horaires de disponibilite enregistres.', 'OK', { duration: 2500 });
  }

  addUnavailableDay(): void {
    if (this.leaveForm.invalid) {
      this.leaveForm.markAllAsTouched();
      return;
    }
    const day = this.leaveForm.getRawValue();
    this.unavailableDays.update((days) => [
      ...days.filter((item) => item.date !== day.date),
      day
    ].sort((a, b) => a.date.localeCompare(b.date)));
    this.persistUnavailableDays();
    this.snack.open('Jour indisponible ajoute.', 'OK', { duration: 2500 });
  }

  removeUnavailableDay(date: string): void {
    this.unavailableDays.update((days) => days.filter((day) => day.date !== date));
    this.persistUnavailableDays();
  }

  addUrgentAppointment(): void {
    if (this.urgentForm.invalid) {
      this.urgentForm.markAllAsTouched();
      return;
    }
    const value = this.urgentForm.getRawValue();
    const startsAt = `${this.selectedDate()}T${value.time}:00`;
    const urgent: AppointmentDto = {
      id: Date.now(),
      doctorId: 0,
      patientEmail: '',
      patientName: value.patientName,
      doctorName: 'Moi',
      specialty: 'Urgence',
      startsAt,
      durationMinutes: 30,
      reason: value.reason,
      status: 'CONFIRMED'
    };
    this.urgentAppointments.update((items) => [urgent, ...items]);
    this.urgentForm.reset({ patientName: '', time: value.time, reason: 'Urgence' });
    this.snack.open('Rendez-vous urgent insere dans le planning.', 'OK', { duration: 2500 });
  }

  setStatus(id: number, status: 'CONFIRMED' | 'CANCELLED'): void {
    this.apptSvc.updateStatus(id, status).subscribe({
      next: (updated) => {
        this.appointments.update((list) => list.map((a) => (a.id === updated.id ? updated : a)));
        this.snack.open(status === 'CONFIRMED' ? 'Rendez-vous confirme.' : 'Rendez-vous annule.', 'OK', { duration: 3000 });
      },
      error: () => this.snack.open('Erreur lors de la mise a jour.', 'OK', { duration: 3000 })
    });
  }

  statusLabel(s: string): string {
    return { REQUESTED: 'En attente', CONFIRMED: 'Confirme', CANCELLED: 'Annule' }[s] ?? s;
  }

  consultationClass(reason: string): string {
    const value = reason.toLowerCase();
    if (value.includes('urgence')) return 'urgent';
    if (value.includes('suivi')) return 'follow';
    if (value.includes('controle') || value.includes('contr')) return 'control';
    return 'general';
  }

  private load(): void {
    this.loading.set(true);
    this.apptSvc.getDoctorAppointments().subscribe({
      next: (list) => {
        this.appointments.set(list);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  private isInCurrentView(date: Date, selected: Date): boolean {
    if (this.view() === 'day') {
      return this.isoDate(date) === this.isoDate(selected);
    }
    if (this.view() === 'week') {
      const start = new Date(selected);
      start.setDate(selected.getDate() - selected.getDay() + 1);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(start.getDate() + 7);
      return date >= start && date < end;
    }
    return date.getFullYear() === selected.getFullYear() && date.getMonth() === selected.getMonth();
  }

  private today(): string {
    return this.isoDate(new Date());
  }

  private isoDate(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  private loadAvailability(): AvailabilitySettings {
    const raw = localStorage.getItem('medisync_doctor_availability');
    if (raw) {
      try {
        return JSON.parse(raw) as AvailabilitySettings;
      } catch {
        localStorage.removeItem('medisync_doctor_availability');
      }
    }
    return { start: '09:00', end: '17:00', slotMinutes: 30 };
  }

  private loadUnavailableDays(): UnavailableDay[] {
    const raw = localStorage.getItem('medisync_doctor_unavailable_days');
    if (!raw) return [];
    try {
      return JSON.parse(raw) as UnavailableDay[];
    } catch {
      localStorage.removeItem('medisync_doctor_unavailable_days');
      return [];
    }
  }

  private persistUnavailableDays(): void {
    localStorage.setItem('medisync_doctor_unavailable_days', JSON.stringify(this.unavailableDays()));
  }
}
