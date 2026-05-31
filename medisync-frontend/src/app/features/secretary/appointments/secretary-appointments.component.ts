import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { PageHeaderComponent } from '../../../shared/components/page-header.component';
import { AppointmentService } from '../../../core/services/appointment.service';
import { DoctorService } from '../../../core/services/doctor.service';
import { AppointmentDto, DoctorDto } from '../../../core/models/user.model';

@Component({
  selector: 'app-secretary-appointments',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatChipsModule,
    MatMenuModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    RouterLink,
    PageHeaderComponent
  ],
  template: `
    <div class="page">
      <app-page-header
        eyebrow="Gestion"
        icon="event_note"
        title="Rendez-vous"
        subtitle="Creer, modifier ou annuler les rendez-vous."
      >
        <button mat-stroked-button routerLink="/secretary/patients/new">
          <mat-icon>person_add</mat-icon>
          Nouveau patient
        </button>
        <button mat-flat-button color="primary" type="button" (click)="openCreateForm()">
          <mat-icon>add</mat-icon>
          Nouveau RDV
        </button>
      </app-page-header>

      @if (showForm()) {
        <mat-card class="form-card">
          <h3>
            <mat-icon>event_available</mat-icon>
            {{ editingId() ? 'Modifier le rendez-vous' : 'Nouveau rendez-vous' }}
          </h3>
          <form [formGroup]="form" (ngSubmit)="submit()" class="form-grid">
            <mat-form-field appearance="outline">
              <mat-label>Email du patient</mat-label>
              <input matInput formControlName="patientEmail" placeholder="patient@medisync.local" [readonly]="!!editingId()" />
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Rechercher un medecin</mat-label>
              <input matInput formControlName="search" placeholder="Nom, specialite, ville, langue" />
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Medecin</mat-label>
              <mat-select formControlName="doctorId">
                @for (d of filteredDoctors(); track d.id) {
                  <mat-option [value]="d.id">
                  {{ d.fullName }} - {{ d.specialty }} ({{ d.location }})
                </mat-option>
              }
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Date souhaitee</mat-label>
              <input matInput type="date" formControlName="date" [min]="today()" />
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Creneau disponible</mat-label>
              <mat-select formControlName="startsAt">
                @for (slot of slots(); track slot) {
                  <mat-option [value]="slot">{{ slot.slice(11, 16) }}</mat-option>
                }
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Duree</mat-label>
              <mat-select formControlName="durationMinutes">
                <mat-option [value]="15">15 min</mat-option>
                <mat-option [value]="30">30 min</mat-option>
                <mat-option [value]="45">45 min</mat-option>
                <mat-option [value]="60">1 heure</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full">
              <mat-label>Motif</mat-label>
              <mat-select formControlName="reason">
                <mat-option value="Consultation generale">Consultation generale</mat-option>
                <mat-option value="Suivi">Suivi</mat-option>
                <mat-option value="Urgence">Urgence</mat-option>
                <mat-option value="Controle">Controle</mat-option>
              </mat-select>
            </mat-form-field>

            <div class="actions">
              <button mat-stroked-button type="button" (click)="closeForm()">Annuler</button>
              <button mat-flat-button color="primary" type="submit" [disabled]="saving()">
                @if (saving()) { <mat-spinner diameter="18"></mat-spinner> }
                @else { <mat-icon>save</mat-icon> }
                {{ editingId() ? 'Mettre a jour' : 'Enregistrer' }}
              </button>
            </div>
          </form>
        </mat-card>
      }

      <mat-card class="table-card">
        @if (loading()) {
          <div class="loading">
            <mat-spinner diameter="36"></mat-spinner>
          </div>
        } @else {
          <table mat-table [dataSource]="appointments()" class="full-table">
            <ng-container matColumnDef="patient">
              <th mat-header-cell *matHeaderCellDef>Patient</th>
              <td mat-cell *matCellDef="let r">
                <div class="patient-cell">
                  <div class="avatar">{{ initials(r.patientName) }}</div>
                  {{ r.patientName }}
                </div>
              </td>
            </ng-container>

            <ng-container matColumnDef="doctor">
              <th mat-header-cell *matHeaderCellDef>Praticien</th>
              <td mat-cell *matCellDef="let r">{{ r.doctorName }}</td>
            </ng-container>

            <ng-container matColumnDef="date">
              <th mat-header-cell *matHeaderCellDef>Date</th>
              <td mat-cell *matCellDef="let r">{{ formatDate(r.startsAt) }}</td>
            </ng-container>

            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Statut</th>
              <td mat-cell *matCellDef="let r">
                <mat-chip [class]="'chip-' + statusClass(r.status)">{{ statusLabel(r.status) }}</mat-chip>
              </td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef></th>
              <td mat-cell *matCellDef="let r">
                <button mat-icon-button [matMenuTriggerFor]="menu">
                  <mat-icon>more_vert</mat-icon>
                </button>
                <mat-menu #menu="matMenu">
                  <button mat-menu-item (click)="startEdit(r)">
                    <mat-icon>edit</mat-icon>
                    Modifier
                  </button>
                  <button mat-menu-item (click)="confirm(r)" [disabled]="r.status === 'CONFIRMED'">
                    <mat-icon>check</mat-icon>
                    Confirmer
                  </button>
                  <button mat-menu-item (click)="cancel(r)" [disabled]="r.status === 'CANCELLED'">
                    <mat-icon>close</mat-icon>
                    Annuler
                  </button>
                </mat-menu>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="cols"></tr>
            <tr mat-row *matRowDef="let row; columns: cols"></tr>
          </table>
        }
      </mat-card>
    </div>
  `,
  styles: [`
    .page { padding: 24px; max-width: 1200px; margin: 0 auto; }
    .form-card { padding: 24px; border-radius: 16px; margin-bottom: 20px; }
    .form-card h3 { display: flex; align-items: center; gap: 8px; margin: 0 0 20px; color: #0d6efd; }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .form-grid mat-form-field { width: 100%; }
    .form-grid .full { grid-column: 1 / -1; }
    .actions { grid-column: 1 / -1; display: flex; justify-content: flex-end; gap: 8px; }
    .table-card { padding: 0; border-radius: 16px; overflow: hidden; }
    .full-table { width: 100%; }
    .loading { display: flex; align-items: center; justify-content: center; min-height: 160px; }
    .patient-cell { display: flex; align-items: center; gap: 10px; }
    .avatar {
      width: 32px; height: 32px; border-radius: 50%;
      background: linear-gradient(135deg, #0d6efd, #06b6d4);
      color: white; display: flex; align-items: center; justify-content: center;
      font-size: 12px; font-weight: 600;
    }
    th { font-weight: 600 !important; color: #64748b !important; }
    mat-chip {
      font-size: 12px !important; font-weight: 600 !important;
      &.chip-confirmed { background: #d1fae5 !important; color: #065f46 !important; }
      &.chip-pending { background: #fef3c7 !important; color: #92400e !important; }
      &.chip-cancelled { background: #fee2e2 !important; color: #991b1b !important; }
    }
    @media (max-width: 700px) {
      .form-grid { grid-template-columns: 1fr; }
      .actions { flex-direction: column-reverse; }
      .actions button { width: 100%; }
    }
  `]
})
export class SecretaryAppointmentsComponent implements OnInit {
  private readonly appointmentSvc = inject(AppointmentService);
  private readonly doctorSvc = inject(DoctorService);
  private readonly fb = inject(FormBuilder);
  private readonly snack = inject(MatSnackBar);

  readonly showForm = signal(false);
  readonly saving = signal(false);
  readonly loading = signal(false);
  readonly editingId = signal<number | null>(null);
  readonly doctors = signal<DoctorDto[]>([]);
  readonly slots = signal<string[]>([]);
  readonly appointments = signal<AppointmentDto[]>([]);

  readonly form = this.fb.nonNullable.group({
    patientEmail: ['', [Validators.required, Validators.email]],
    search: [''],
    doctorId: [0, Validators.required],
    date: ['', Validators.required],
    startsAt: ['', Validators.required],
    durationMinutes: [30, Validators.required],
    reason: ['Consultation generale', Validators.required]
  });

  cols = ['patient', 'doctor', 'date', 'status', 'actions'];

  ngOnInit(): void {
    this.doctorSvc.getDoctors().subscribe((list) => this.doctors.set(list));
    this.loadAppointments();
    this.form.controls.doctorId.valueChanges.subscribe(() => this.loadAvailability());
    this.form.controls.date.valueChanges.subscribe(() => this.loadAvailability());
  }

  openCreateForm(): void {
    this.editingId.set(null);
    this.form.controls.patientEmail.enable();
    this.form.reset({
      patientEmail: '',
      search: '',
      doctorId: 0,
      date: this.today(),
      startsAt: '',
      durationMinutes: 30,
      reason: 'Consultation generale'
    });
    this.slots.set([]);
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
    this.editingId.set(null);
    this.form.controls.patientEmail.enable();
    this.form.reset({ durationMinutes: 30, reason: 'Consultation generale' });
    this.slots.set([]);
  }

  submit(): void {
    if (this.form.invalid || !this.form.controls.doctorId.value) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    const v = this.form.getRawValue();
    const request = {
      patientEmail: v.patientEmail,
      doctorId: v.doctorId,
      startsAt: v.startsAt,
      durationMinutes: v.durationMinutes,
      reason: v.reason
    };
    const action = this.editingId()
      ? this.appointmentSvc.update(this.editingId()!, request)
      : this.appointmentSvc.createForSecretary(request);

    action.subscribe({
      next: () => {
        this.saving.set(false);
        this.snack.open(this.editingId() ? 'Rendez-vous modifie.' : 'Rendez-vous cree.', 'OK', { duration: 3000 });
        this.closeForm();
        this.loadAppointments();
      },
      error: (err) => {
        this.saving.set(false);
        this.snack.open(err?.error?.message ?? 'Erreur lors de la creation du rendez-vous.', 'OK', { duration: 4000 });
      }
    });
  }

  startEdit(appointment: AppointmentDto): void {
    this.editingId.set(appointment.id);
    this.form.reset({
      patientEmail: appointment.patientEmail,
      search: '',
      doctorId: appointment.doctorId,
      date: appointment.startsAt.slice(0, 10),
      startsAt: appointment.startsAt,
      durationMinutes: appointment.durationMinutes,
      reason: appointment.reason
    });
    this.form.controls.patientEmail.disable();
    this.slots.set([appointment.startsAt]);
    this.showForm.set(true);
  }

  confirm(appointment: AppointmentDto): void {
    this.changeStatus(appointment.id, 'CONFIRMED', 'Rendez-vous confirme.');
  }

  cancel(appointment: AppointmentDto): void {
    this.changeStatus(appointment.id, 'CANCELLED', 'Rendez-vous annule.');
  }

  filteredDoctors(): DoctorDto[] {
    const q = this.form.controls.search.value.trim().toLowerCase();
    if (!q) return this.doctors();
    return this.doctors().filter((d) =>
      [d.fullName, d.specialty, d.location, d.spokenLanguages]
        .some((value) => value.toLowerCase().includes(q))
    );
  }

  today(): string {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  initials(name: string): string {
    return name.split(' ').filter(Boolean).map((p) => p[0]).join('').toUpperCase().slice(0, 2);
  }

  statusLabel(status: AppointmentDto['status']): string {
    return ({
      CONFIRMED: 'Confirme',
      REQUESTED: 'En attente',
      CANCELLED: 'Annule'
    } as Record<string, string>)[status] ?? status;
  }

  statusClass(status: AppointmentDto['status']): string {
    return ({
      CONFIRMED: 'confirmed',
      REQUESTED: 'pending',
      CANCELLED: 'cancelled'
    } as Record<string, string>)[status] ?? 'pending';
  }

  formatDate(startsAt: string): string {
    return new Intl.DateTimeFormat('fr-FR', {
      dateStyle: 'short',
      timeStyle: 'short'
    }).format(new Date(startsAt));
  }

  private loadAvailability(): void {
    const doctorId = this.form.controls.doctorId.value;
    const date = this.form.controls.date.value;
    if (!doctorId || !date) {
      this.slots.set([]);
      return;
    }
    this.appointmentSvc.getAvailability(doctorId, date).subscribe({
      next: (slots) => {
        const current = this.form.controls.startsAt.value;
        const available = this.editingId() && current && current.startsWith(date)
          ? Array.from(new Set([current, ...slots]))
          : slots;
        this.slots.set(available);
        if (!available.includes(current)) {
          this.form.controls.startsAt.setValue('');
        }
      },
      error: () => this.slots.set([])
    });
  }

  private loadAppointments(): void {
    this.loading.set(true);
    this.appointmentSvc.getSecretaryAppointments().subscribe({
      next: (appointments) => {
        this.appointments.set(appointments);
        this.loading.set(false);
      },
      error: () => {
        this.appointments.set([]);
        this.loading.set(false);
      }
    });
  }

  private changeStatus(id: number, status: 'CONFIRMED' | 'CANCELLED', message: string): void {
    this.appointmentSvc.updateStatus(id, status).subscribe({
      next: () => {
        this.snack.open(message, 'OK', { duration: 2500 });
        this.loadAppointments();
      },
      error: (err) => {
        this.snack.open(err?.error?.message ?? 'Impossible de mettre a jour le rendez-vous.', 'OK', { duration: 4000 });
      }
    });
  }
}
