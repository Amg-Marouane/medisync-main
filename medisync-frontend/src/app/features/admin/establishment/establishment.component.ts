import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { PageHeaderComponent } from '../../../shared/components/page-header.component';

// ─── Hours Dialog ────────────────────────────────────────────────────────────

interface HourEntry { day: string; range: string; }

@Component({
  selector: 'app-hours-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatIconModule, MatDialogModule],
  template: `
    <div class="dlg-header">
      <mat-icon>schedule</mat-icon>
      <h2>Modifier les horaires</h2>
    </div>
    <mat-dialog-content>
      <form [formGroup]="form" class="hours-form">
        @for (ctrl of dayKeys; track ctrl) {
          <div class="hour-row">
            <span class="day-label">{{ ctrl }}</span>
            <mat-form-field appearance="outline" class="range-field">
              <input matInput [formControlName]="ctrl" placeholder="08:00 — 19:00 ou Fermé" />
            </mat-form-field>
          </div>
        }
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Annuler</button>
      <button mat-flat-button color="primary" (click)="save()">
        <mat-icon>check</mat-icon>
        Enregistrer
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .dlg-header { display: flex; align-items: center; gap: 10px; padding: 20px 24px 0; }
    .dlg-header mat-icon { color: #0d6efd; font-size: 26px; width: 26px; height: 26px; }
    .dlg-header h2 { margin: 0; font-size: 18px; font-weight: 600; }
    mat-dialog-content { padding: 16px 24px !important; min-width: 380px; }
    .hours-form { display: flex; flex-direction: column; gap: 8px; }
    .hour-row { display: flex; align-items: center; gap: 12px; }
    .day-label { width: 150px; flex-shrink: 0; font-size: 14px; color: #374151; }
    .range-field { flex: 1; }
    mat-dialog-actions { padding: 8px 24px 20px !important; }
  `]
})
export class HoursDialogComponent {
  private readonly ref = inject(MatDialogRef<HoursDialogComponent>);
  private readonly data: HourEntry[] = inject(MAT_DIALOG_DATA);
  private readonly fb = inject(FormBuilder);

  dayKeys = this.data.map(h => h.day);

  form = this.fb.nonNullable.group(
    Object.fromEntries(this.data.map(h => [h.day, [h.range, Validators.required]]))
  );

  save(): void {
    if (this.form.invalid) return;
    const raw = this.form.getRawValue() as Record<string, string>;
    this.ref.close(this.data.map(h => ({ day: h.day, range: raw[h.day] })));
  }
}

// ─── Add Specialty Dialog ─────────────────────────────────────────────────────

@Component({
  selector: 'app-add-specialty-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatIconModule, MatDialogModule],
  template: `
    <div class="dlg-header">
      <mat-icon>add_circle</mat-icon>
      <h2>Ajouter une spécialité</h2>
    </div>
    <mat-dialog-content>
      <mat-form-field appearance="outline" style="width:100%">
        <mat-label>Nom de la spécialité</mat-label>
        <input matInput [formControl]="ctrl" placeholder="Ex: Neurologie" (keydown.enter)="save()" />
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Annuler</button>
      <button mat-flat-button color="primary" [disabled]="ctrl.invalid" (click)="save()">
        <mat-icon>add</mat-icon>
        Ajouter
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .dlg-header { display: flex; align-items: center; gap: 10px; padding: 20px 24px 0; }
    .dlg-header mat-icon { color: #0d6efd; font-size: 26px; width: 26px; height: 26px; }
    .dlg-header h2 { margin: 0; font-size: 18px; font-weight: 600; }
    mat-dialog-content { padding: 16px 24px !important; min-width: 320px; }
    mat-dialog-actions { padding: 8px 24px 20px !important; }
  `]
})
export class AddSpecialtyDialogComponent {
  private readonly ref = inject(MatDialogRef<AddSpecialtyDialogComponent>);
  private readonly fb = inject(FormBuilder);

  ctrl = this.fb.nonNullable.control('', [Validators.required, Validators.minLength(2)]);

  save(): void {
    if (this.ctrl.invalid) return;
    this.ref.close(this.ctrl.value.trim());
  }
}

// ─── Establishment Component ──────────────────────────────────────────────────

@Component({
  selector: 'app-establishment',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatCardModule, MatButtonModule,
    MatIconModule, MatFormFieldModule, MatInputModule, MatChipsModule,
    MatDialogModule, MatSnackBarModule,
    PageHeaderComponent
  ],
  template: `
    <div class="page">
      <app-page-header
        eyebrow="Clinique"
        icon="local_hospital"
        title="Établissement"
        subtitle="Configurez les informations de votre clinique."
      ></app-page-header>

      <div class="grid">
        <mat-card class="card">
          <h3>Identité</h3>
          <form [formGroup]="form" class="form">
            <mat-form-field appearance="outline" class="full">
              <mat-label>Nom de la clinique</mat-label>
              <input matInput formControlName="name" />
            </mat-form-field>
            <mat-form-field appearance="outline" class="full">
              <mat-label>Adresse</mat-label>
              <input matInput formControlName="address" />
              <mat-icon matSuffix>place</mat-icon>
            </mat-form-field>
            <div class="row">
              <mat-form-field appearance="outline">
                <mat-label>Téléphone</mat-label>
                <input matInput formControlName="phone" />
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Email</mat-label>
                <input matInput formControlName="email" />
              </mat-form-field>
            </div>
          </form>
        </mat-card>

        <mat-card class="card">
          <h3>Horaires d'ouverture</h3>
          <ul class="hours">
            @for (h of hours(); track h.day) {
              <li>
                <span>{{ h.day }}</span>
                <strong>{{ h.range }}</strong>
              </li>
            }
          </ul>
          <button mat-stroked-button (click)="openHoursDialog()">
            <mat-icon>edit</mat-icon>
            Modifier les horaires
          </button>
        </mat-card>

        <mat-card class="card spec">
          <h3>Spécialités proposées</h3>
          <div class="chips">
            @for (s of specialties(); track s) {
              <mat-chip (removed)="removeSpecialty(s)">
                {{ s }}
                <button matChipRemove aria-label="Supprimer {{ s }}">
                  <mat-icon>cancel</mat-icon>
                </button>
              </mat-chip>
            }
            <button mat-stroked-button class="add" (click)="openAddSpecialtyDialog()">
              <mat-icon>add</mat-icon>
              Ajouter
            </button>
          </div>
        </mat-card>

        <mat-card class="card rooms">
          <h3>Salles & équipements</h3>
          <div class="rooms-grid">
            @for (r of rooms; track r.name) {
              <div class="room">
                <mat-icon>meeting_room</mat-icon>
                <div>
                  <strong>{{ r.name }}</strong>
                  <span>{{ r.equipment }}</span>
                </div>
              </div>
            }
          </div>
        </mat-card>
      </div>

      <div class="page-actions">
        <button mat-button (click)="cancel()">Annuler</button>
        <button mat-flat-button color="primary" (click)="save()">
          <mat-icon>save</mat-icon>
          Enregistrer
        </button>
      </div>
    </div>
  `,
  styles: [`
    .page { padding: 24px; max-width: 1200px; margin: 0 auto; }
    .grid {
      display: grid; grid-template-columns: 1fr 1fr; gap: 16px;
      @media (max-width: 900px) { grid-template-columns: 1fr; }
    }
    .card { padding: 24px; border-radius: 16px; }
    .spec, .rooms { grid-column: 1 / -1; }
    h3 { margin: 0 0 16px; font-size: 16px; font-weight: 600; }
    .form { display: flex; flex-direction: column; gap: 12px; }
    .full { width: 100%; }
    .row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px;
      @media (max-width: 600px) { grid-template-columns: 1fr; } }
    .hours {
      list-style: none; padding: 0; margin: 0 0 16px;
      li {
        display: flex; justify-content: space-between;
        padding: 10px 0;
        border-bottom: 1px solid #f1f5f9;
        font-size: 14px;
        &:last-child { border-bottom: none; }
        span { color: #64748b; }
      }
    }
    .chips { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
    .chips mat-chip { background: #e0f2fe !important; color: #075985 !important; }
    .add { border-radius: 999px !important; }
    .rooms-grid {
      display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: 12px;
    }
    .room {
      display: flex; align-items: center; gap: 12px;
      padding: 16px; background: #f8fafc; border-radius: 12px;
      mat-icon {
        color: #0d6efd; background: #e0f2fe;
        padding: 8px; border-radius: 10px;
        font-size: 20px; width: 20px; height: 20px;
      }
      strong { display: block; }
      span { color: #64748b; font-size: 12px; }
    }
    .page-actions {
      display: flex; justify-content: flex-end; gap: 8px; margin-top: 24px;
    }
  `]
})
export class EstablishmentComponent {
  private readonly fb = inject(FormBuilder);
  private readonly dialog = inject(MatDialog);
  private readonly snack = inject(MatSnackBar);

  form = this.fb.nonNullable.group({
    name: ['Clinique MediSync Rabat'],
    address: ['123 Avenue Hassan II, Rabat'],
    phone: ['+212 5 37 12 34 56'],
    email: ['contact@medisync.com']
  });

  hours = signal<HourEntry[]>([
    { day: 'Lundi - Vendredi', range: '08:00 — 19:00' },
    { day: 'Samedi', range: '09:00 — 13:00' },
    { day: 'Dimanche', range: 'Fermé' },
    { day: 'Urgences', range: '24h/24' }
  ]);

  specialties = signal<string[]>([
    'Médecine générale', 'Cardiologie', 'Dermatologie', 'Pédiatrie',
    'Gynécologie', 'Ophtalmologie', 'Dentisterie', 'Radiologie'
  ]);

  rooms = [
    { name: 'Salle 1', equipment: 'Consultation générale' },
    { name: 'Salle 2', equipment: 'ECG · Tensiomètre' },
    { name: 'Salle 3', equipment: 'Échographe' },
    { name: 'Salle 4', equipment: 'Dermatoscope · Petite chirurgie' }
  ];

  openHoursDialog(): void {
    const ref = this.dialog.open(HoursDialogComponent, {
      data: this.hours(),
      width: '520px'
    });
    ref.afterClosed().subscribe((result: HourEntry[] | undefined) => {
      if (result) {
        this.hours.set(result);
        this.snack.open('Horaires mis à jour.', 'OK', { duration: 2500 });
      }
    });
  }

  openAddSpecialtyDialog(): void {
    const ref = this.dialog.open(AddSpecialtyDialogComponent, { width: '400px' });
    ref.afterClosed().subscribe((result: string | undefined) => {
      if (result) {
        this.specialties.update(list => [...list, result]);
        this.snack.open(`"${result}" ajoutée.`, 'OK', { duration: 2500 });
      }
    });
  }

  removeSpecialty(s: string): void {
    this.specialties.update(list => list.filter(item => item !== s));
  }

  save(): void {
    this.snack.open('Modifications enregistrées avec succès.', 'OK', { duration: 3000 });
  }

  cancel(): void {
    this.form.reset({
      name: 'Clinique MediSync Rabat',
      address: '123 Avenue Hassan II, Rabat',
      phone: '+212 5 37 12 34 56',
      email: 'contact@medisync.com'
    });
    this.snack.open('Modifications annulées.', 'OK', { duration: 2000 });
  }
}
