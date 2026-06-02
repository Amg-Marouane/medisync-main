import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { PageHeaderComponent } from '../../../shared/components/page-header.component';
import { AppointmentService } from '../../../core/services/appointment.service';
import { DoctorService } from '../../../core/services/doctor.service';
import { AppointmentDto, DoctorDto } from '../../../core/models/user.model';

// ── Confirmation Dialog ───────────────────────────────────────────────────────
interface ConfirmData {
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
  duration: number;
  reason: string;
}

@Component({
  selector: 'app-booking-confirm-dialog',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatDividerModule],
  template: `
    <div class="confirm-wrap">
      <div class="success-icon">
        <mat-icon>check_circle</mat-icon>
      </div>
      <h2>Rendez-vous confirmé !</h2>
      <p class="subtitle">Un email de confirmation a été envoyé à votre adresse.</p>

      <mat-divider></mat-divider>

      <div class="summary">
        <div class="row"><mat-icon>person</mat-icon><span>{{ data.doctorName }}</span></div>
        <div class="row"><mat-icon>medical_information</mat-icon><span>{{ data.specialty }}</span></div>
        <div class="row"><mat-icon>calendar_today</mat-icon><span>{{ data.date }}</span></div>
        <div class="row"><mat-icon>schedule</mat-icon><span>{{ data.time }} — {{ data.duration }} min</span></div>
        <div class="row"><mat-icon>notes</mat-icon><span>{{ data.reason }}</span></div>
      </div>

      <div class="email-notice">
        <mat-icon>mail</mat-icon>
        <span>Vérifiez votre boîte mail pour les détails.</span>
      </div>

      <button mat-flat-button color="primary" (click)="close()" class="close-btn">
        Parfait !
      </button>
    </div>
  `,
  styles: [`
    .confirm-wrap {
      padding: 32px 28px 24px;
      text-align: center;
      max-width: 400px;
    }
    .success-icon {
      width: 72px; height: 72px; border-radius: 50%;
      background: linear-gradient(135deg, #d1fae5, #a7f3d0);
      display: flex; align-items: center; justify-content: center;
      margin: 0 auto 20px;
      mat-icon { font-size: 40px; width: 40px; height: 40px; color: #059669; }
    }
    h2 { margin: 0 0 8px; font-size: 22px; font-weight: 700; color: #0f172a; }
    .subtitle { color: #64748b; font-size: 14px; margin: 0 0 20px; }
    mat-divider { margin: 0 -28px 20px; }
    .summary {
      text-align: left;
      display: flex; flex-direction: column; gap: 12px;
      margin-bottom: 20px;
    }
    .row {
      display: flex; align-items: center; gap: 12px;
      mat-icon { color: #0d6efd; font-size: 20px; width: 20px; height: 20px; flex-shrink: 0; }
      span { font-size: 14px; color: #334155; }
    }
    .email-notice {
      display: flex; align-items: center; justify-content: center; gap: 8px;
      background: #eff6ff; border-radius: 10px; padding: 10px 16px;
      margin-bottom: 24px;
      mat-icon { color: #2563eb; font-size: 18px; width: 18px; height: 18px; }
      span { font-size: 13px; color: #1d4ed8; font-weight: 500; }
    }
    .close-btn { width: 100%; border-radius: 10px; height: 44px; font-size: 15px; }
  `]
})
export class BookingConfirmDialogComponent {
  readonly data: ConfirmData = inject(MAT_DIALOG_DATA);
  private readonly ref = inject(MatDialogRef<BookingConfirmDialogComponent>);
  close(): void { this.ref.close(); }
}

@Component({
  selector: 'app-patient-appointments',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTabsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule,
    PageHeaderComponent
  ],
  template: `
    <div class="page">
      <app-page-header
        eyebrow="Mes rendez-vous"
        icon="event_available"
        title="Rendez-vous"
        subtitle="Recherchez un praticien et choisissez un creneau."
      >
        <div class="header-actions">
          <button mat-flat-button color="primary" type="button" (click)="openCreate()">
            <mat-icon>add</mat-icon>
            Nouveau rendez-vous
          </button>
        </div>
      </app-page-header>

      @if (showBooking()) {
        <mat-card class="booking-card">
          <h3><mat-icon>event</mat-icon> {{ editingId() ? 'Modifier le rendez-vous' : 'Reserver un creneau' }}</h3>
          <form [formGroup]="bookForm" (ngSubmit)="book()" class="book-form">
            <div class="search-row">
              <mat-form-field appearance="outline">
                <mat-label>Nom, specialite, ville ou langue</mat-label>
                <input
                  matInput
                  formControlName="search"
                  placeholder="Dr Sara, cardiologie, Rabat, arabe..."
                />
              </mat-form-field>
            </div>

            <mat-form-field appearance="outline">
              <mat-label>Medecin</mat-label>
              <mat-select formControlName="doctorId" required>
                @for (d of filteredDoctors(); track d.id) {
                  <mat-option [value]="d.id">
                    {{ d.fullName }} - {{ d.specialty }} ({{ d.location }}) - {{ d.spokenLanguages }}
                  </mat-option>
                }
              </mat-select>
              @if (bookForm.controls.search.value && filteredDoctors().length === 0) {
                <mat-hint>Aucun medecin ne correspond a cette recherche.</mat-hint>
              }
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Date souhaitee</mat-label>
              <input matInput type="date" formControlName="date" [min]="today()" required />
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Creneau disponible</mat-label>
              <mat-select formControlName="startsAt" required>
                @for (slot of availableSlots(); track slot.value) {
                  <mat-option [value]="slot.value">{{ slot.label }}</mat-option>
                }
              </mat-select>
              @if (loadingAvailability()) {
                <mat-hint>Chargement des disponibilites...</mat-hint>
              }
              @if (bookForm.controls.date.value && !bookForm.controls.doctorId.value) {
                <mat-hint>Selectionnez un medecin pour afficher ses creneaux.</mat-hint>
              }
              @if (bookForm.controls.date.value && bookForm.controls.doctorId.value && availableSlots().length === 0 && !loadingAvailability()) {
                <mat-hint>Aucun creneau restant pour cette date.</mat-hint>
              }
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Duree</mat-label>
              <mat-select formControlName="durationMinutes" required>
                <mat-option [value]="15">15 min</mat-option>
                <mat-option [value]="30">30 min</mat-option>
                <mat-option [value]="45">45 min</mat-option>
                <mat-option [value]="60">1 heure</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Motif</mat-label>
              <mat-select formControlName="reason" required>
                <mat-option value="Consultation generale">Consultation generale</mat-option>
                <mat-option value="Suivi">Suivi</mat-option>
                <mat-option value="Urgence">Urgence</mat-option>
                <mat-option value="Controle">Controle</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Pour un tiers (optionnel)</mat-label>
              <input matInput formControlName="bookedForName" placeholder="Nom de l'enfant ou proche" />
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Lien de parenté / Relation</mat-label>
              <mat-select formControlName="relation">
                <mat-option value="">Aucun (Pour moi-même)</mat-option>
                <mat-option value="Enfant">Enfant</mat-option>
                <mat-option value="Parent">Parent/Tuteur</mat-option>
                <mat-option value="Conjoint">Conjoint</mat-option>
                <mat-option value="Autre">Autre proche</mat-option>
              </mat-select>
            </mat-form-field>

            <div class="book-actions">
              <button mat-flat-button color="primary" type="submit" [disabled]="bookForm.invalid || booking()">
                @if (booking()) { <mat-spinner diameter="20"></mat-spinner> }
                @else { <mat-icon>check</mat-icon> }
                {{ editingId() ? 'Enregistrer' : 'Confirmer' }}
              </button>
              <button mat-stroked-button type="button" (click)="closeForm()">Annuler</button>
            </div>
          </form>
        </mat-card>
      }

      @if (loading()) {
        <div class="loader"><mat-spinner></mat-spinner></div>
      } @else {
        <mat-tab-group>
          <mat-tab label="A venir">
            <div class="list">
              @for (a of upcoming(); track a.id) {
                <mat-card class="appt-card">
                  <div class="appt-info">
                    <mat-icon class="appt-icon">stethoscope</mat-icon>
                    <div>
                      <strong>{{ a.doctorName }}</strong>
                      <span>{{ a.specialty }}</span>
                      <span class="date">{{ a.startsAt | date:'dd/MM/yyyy HH:mm' }} - {{ a.durationMinutes }} min</span>
                      <span class="reason">{{ a.reason }}</span>
                      @if (a.bookedForName && a.bookedForName !== a.patientName) {
                        <span class="reason">Pour : {{ a.bookedForName }}@if (a.relation) { ({{ a.relation }}) }</span>
                      }
                    </div>
                  </div>
                  <div class="appt-actions">
                    <mat-chip [class]="'chip-' + a.status.toLowerCase()">
                      {{ statusLabel(a.status) }}
                    </mat-chip>
                    @if (a.status === 'REQUESTED') {
                      <button mat-stroked-button type="button" (click)="openEdit(a)">
                        <mat-icon>edit</mat-icon>
                        Modifier
                      </button>
                    }
                  </div>
                </mat-card>
              }
              @if (upcoming().length === 0) {
                <p class="empty">Aucun rendez-vous a venir.</p>
              }
            </div>
          </mat-tab>

          <mat-tab label="Passes">
            <div class="list">
              @for (a of past(); track a.id) {
                <mat-card class="appt-card">
                  <div class="appt-info">
                    <mat-icon class="appt-icon past">stethoscope</mat-icon>
                    <div>
                      <strong>{{ a.doctorName }}</strong>
                      <span>{{ a.specialty }}</span>
                      <span class="date">{{ a.startsAt | date:'dd/MM/yyyy HH:mm' }}</span>
                      <span class="reason">{{ a.reason }}</span>
                    </div>
                  </div>
                  <mat-chip class="chip-cancelled">{{ statusLabel(a.status) }}</mat-chip>
                </mat-card>
              }
              @if (past().length === 0) {
                <p class="empty">Aucun rendez-vous passe.</p>
              }
            </div>
          </mat-tab>
        </mat-tab-group>
      }
    </div>
  `,
  styles: [`
    .page { padding: 24px; max-width: 1100px; margin: 0 auto; }
    .loader { display: flex; justify-content: center; padding: 48px; }
    .header-actions { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
    .booking-card {
      padding: 24px; border-radius: 8px; margin-bottom: 24px;
      h3 { display: flex; align-items: center; gap: 8px; margin: 0 0 20px; color: #0d6efd; }
    }
    .book-form {
      display: grid; grid-template-columns: 1fr 1fr; gap: 8px 16px;
    @media (max-width: 700px) { grid-template-columns: 1fr; }
      mat-form-field { width: 100%; }
    }
    .search-row { display: block; }
    .full-width, .book-actions { grid-column: 1 / -1; }
    .book-actions { display: flex; gap: 8px; }
    .list { display: flex; flex-direction: column; gap: 12px; padding: 16px 0; }
    .empty { color: #94a3b8; text-align: center; padding: 32px; }
    .appt-card {
      display: flex; justify-content: space-between; align-items: center;
      padding: 16px 20px; border-radius: 8px;
    }
    .appt-actions { display: flex; align-items: center; gap: 8px; }
    .appt-info { display: flex; align-items: center; gap: 16px; }
    .appt-icon {
      background: #e0f2fe; color: #0d6efd; padding: 10px; border-radius: 8px;
      font-size: 22px; width: 22px; height: 22px;
      &.past { background: #f1f5f9; color: #94a3b8; }
    }
    strong { display: block; font-size: 15px; }
    span { display: block; color: #64748b; font-size: 13px; }
    .date { color: #334155; font-weight: 500; }
    .reason { font-style: italic; }
    mat-chip {
      &.chip-requested { background: #fef9c3 !important; color: #713f12 !important; }
      &.chip-confirmed { background: #d1fae5 !important; color: #065f46 !important; }
      &.chip-cancelled { background: #e2e8f0 !important; color: #334155 !important; }
    }
  `]
})
export class PatientAppointmentsComponent implements OnInit {
  private readonly apptSvc = inject(AppointmentService);
  private readonly doctorSvc = inject(DoctorService);
  private readonly fb = inject(FormBuilder);
  private readonly snack = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);

  readonly loading = signal(true);
  readonly booking = signal(false);
  readonly showBooking = signal(false);
  readonly editingId = signal<number | null>(null);
  readonly upcoming = signal<AppointmentDto[]>([]);
  readonly past = signal<AppointmentDto[]>([]);
  readonly doctors = signal<DoctorDto[]>([]);
  readonly slots = signal<string[]>([]);
  readonly loadingAvailability = signal(false);

  readonly bookForm = this.fb.nonNullable.group({
    search: [''],
    doctorId: [0, Validators.required],
    date: ['', Validators.required],
    startsAt: ['', Validators.required],
    durationMinutes: [30, Validators.required],
    reason: ['', Validators.required],
    bookedForName: [''],
    relation: ['']
  });

  ngOnInit(): void {
    this.doctorSvc.getDoctors().subscribe((d) => this.doctors.set(d));
    this.bookForm.controls.doctorId.valueChanges.subscribe(() => this.loadAvailability());
    this.bookForm.controls.date.valueChanges.subscribe(() => this.loadAvailability());
    this.loadAppointments();
  }

  openCreate(): void {
    this.editingId.set(null);
    this.bookForm.reset({ durationMinutes: 30 });
    this.showBooking.set(true);
  }

  openEdit(appointment: AppointmentDto): void {
    const startsAt = new Date(appointment.startsAt);
    const date = this.formatLocalDate(startsAt);
    const time = startsAt.toTimeString().slice(0, 5);
    const doctor = this.doctors().find((d) => d.fullName === appointment.doctorName);
    this.editingId.set(appointment.id);
    this.bookForm.reset({
      search: appointment.specialty,
      doctorId: doctor?.id ?? 0,
      date,
      startsAt: `${date}T${time}`,
      durationMinutes: appointment.durationMinutes,
      reason: appointment.reason,
      bookedForName: appointment.bookedForName ?? '',
      relation: appointment.relation ?? ''
    });
    this.slots.set([`${date}T${time}`]);
    this.loadAvailability(`${date}T${time}`);
    this.showBooking.set(true);
  }

  closeForm(): void {
    this.showBooking.set(false);
    this.editingId.set(null);
    this.bookForm.reset({ durationMinutes: 30 });
  }

  private loadAppointments(): void {
    this.loading.set(true);
    this.apptSvc.getMyAppointments().subscribe({
      next: (list) => {
        const now = new Date();
        this.upcoming.set(list.filter((a) => new Date(a.startsAt) >= now));
        this.past.set(list.filter((a) => new Date(a.startsAt) < now));
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  book(): void {
    if (this.bookForm.invalid || !this.bookForm.controls.doctorId.value) {
      this.bookForm.markAllAsTouched();
      return;
    }
    this.booking.set(true);
    const v = this.bookForm.getRawValue();
    const request = {
      doctorId: v.doctorId,
      startsAt: v.startsAt,
      durationMinutes: v.durationMinutes,
      reason: v.reason,
      bookedForName: v.bookedForName || undefined,
      relation: v.relation || undefined
    };
    const operation = this.editingId()
      ? this.apptSvc.update(this.editingId()!, request)
      : this.apptSvc.create(request);
    operation.subscribe({
      next: (saved) => {
        this.booking.set(false);
        const wasEditing = this.editingId() !== null;
        this.closeForm();
        this.loadAppointments();
        if (!wasEditing) {
          const doctor = this.doctors().find(d => d.id === v.doctorId);
          const dt = new Date(v.startsAt);
          this.dialog.open(BookingConfirmDialogComponent, {
            data: {
              doctorName: doctor?.fullName ?? saved.doctorName ?? '',
              specialty: doctor?.specialty ?? saved.specialty ?? '',
              date: dt.toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }),
              time: dt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
              duration: v.durationMinutes,
              reason: v.reason
            } satisfies ConfirmData,
            panelClass: 'confirm-dialog-panel'
          });
        } else {
          this.snack.open('Rendez-vous modifié avec succès.', 'OK', { duration: 3000 });
        }
      },
      error: (err) => {
        this.booking.set(false);
        this.snack.open(err?.error?.message ?? 'Erreur lors de la reservation.', 'OK', { duration: 4000 });
      }
    });
  }

  filteredDoctors(): DoctorDto[] {
    const q = this.bookForm.controls.search.value.trim().toLowerCase();
    if (!q) return this.doctors();
    return this.doctors().filter((d) =>
      [d.fullName, d.specialty, d.location, d.spokenLanguages]
        .some((value) => value.toLowerCase().includes(q))
    );
  }

  availableSlots(): { label: string; value: string }[] {
    return this.slots().map((value) => ({
      value,
      label: value.slice(11, 16)
    }));
  }

  today(): string {
    return this.formatLocalDate(new Date());
  }

  statusLabel(s: string): string {
    return { REQUESTED: 'En attente', CONFIRMED: 'Confirme', CANCELLED: 'Annule' }[s] ?? s;
  }

  private loadAvailability(currentSlot?: string): void {
    const doctorId = this.bookForm.controls.doctorId.value;
    const date = this.bookForm.controls.date.value;
    if (!doctorId || !date) {
      this.slots.set(currentSlot ? [currentSlot] : []);
      return;
    }
    this.loadingAvailability.set(true);
    this.apptSvc.getAvailability(doctorId, date).subscribe({
      next: (slots) => {
        const allSlots = currentSlot && !slots.includes(currentSlot)
          ? [currentSlot, ...slots]
          : slots;
        this.slots.set(allSlots);
        if (!allSlots.includes(this.bookForm.controls.startsAt.value)) {
          this.bookForm.controls.startsAt.setValue('');
        }
        this.loadingAvailability.set(false);
      },
      error: () => {
        this.slots.set(currentSlot ? [currentSlot] : []);
        this.loadingAvailability.set(false);
      }
    });
  }

  private formatLocalDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
