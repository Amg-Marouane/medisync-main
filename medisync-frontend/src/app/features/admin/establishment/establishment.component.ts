import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { PageHeaderComponent } from '../../../shared/components/page-header.component';

@Component({
  selector: 'app-establishment',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatCardModule, MatButtonModule,
    MatIconModule, MatFormFieldModule, MatInputModule, MatChipsModule,
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
            @for (h of hours; track h.day) {
              <li>
                <span>{{ h.day }}</span>
                <strong>{{ h.range }}</strong>
              </li>
            }
          </ul>
          <button mat-stroked-button>
            <mat-icon>edit</mat-icon>
            Modifier les horaires
          </button>
        </mat-card>

        <mat-card class="card spec">
          <h3>Spécialités proposées</h3>
          <div class="chips">
            @for (s of specialties; track s) {
              <mat-chip>{{ s }}</mat-chip>
            }
            <button mat-stroked-button class="add">
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
        <button mat-button>Annuler</button>
        <button mat-flat-button color="primary">
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

  form = this.fb.nonNullable.group({
    name: ['Clinique MediSync Rabat'],
    address: ['123 Avenue Hassan II, Rabat'],
    phone: ['+212 5 37 12 34 56'],
    email: ['contact@medisync.com']
  });

  hours = [
    { day: 'Lundi - Vendredi', range: '08:00 — 19:00' },
    { day: 'Samedi', range: '09:00 — 13:00' },
    { day: 'Dimanche', range: 'Fermé' },
    { day: 'Urgences', range: '24h/24' }
  ];

  specialties = [
    'Médecine générale', 'Cardiologie', 'Dermatologie', 'Pédiatrie',
    'Gynécologie', 'Ophtalmologie', 'Dentisterie', 'Radiologie'
  ];

  rooms = [
    { name: 'Salle 1', equipment: 'Consultation générale' },
    { name: 'Salle 2', equipment: 'ECG · Tensiomètre' },
    { name: 'Salle 3', equipment: 'Échographe' },
    { name: 'Salle 4', equipment: 'Dermatoscope · Petite chirurgie' }
  ];
}
