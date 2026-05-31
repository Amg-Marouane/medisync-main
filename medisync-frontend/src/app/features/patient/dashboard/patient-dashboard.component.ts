import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-patient-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule, RouterLink],
  template: `
    <div class="page">
      <header class="page-header">
        <h1>Bonjour, {{ user()?.firstName }} !</h1>
        <p>Bienvenue sur votre espace patient MediSync.</p>
      </header>

      <div class="grid">
        <mat-card class="tile">
          <mat-icon class="tile-icon">event_available</mat-icon>
          <h3>Prendre un rendez-vous</h3>
          <p>Trouvez un praticien et réservez un créneau.</p>
          <button mat-flat-button color="primary" routerLink="/patient/appointments">
            Réserver
          </button>
        </mat-card>

        <mat-card class="tile">
          <mat-icon class="tile-icon">folder_shared</mat-icon>
          <h3>Mon dossier médical</h3>
          <p>Consultations, comptes rendus et analyses.</p>
          <button mat-stroked-button routerLink="/patient/medical-record">
            Consulter
          </button>
        </mat-card>

        <mat-card class="tile">
          <mat-icon class="tile-icon">medication</mat-icon>
          <h3>Mes ordonnances</h3>
          <p>Téléchargez vos prescriptions.</p>
          <button mat-stroked-button routerLink="/patient/prescriptions">
            Voir
          </button>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .page { padding: 24px; }
    .page-header h1 { margin: 0 0 4px; }
    .page-header p { margin: 0 0 24px; color: #64748b; }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 16px;
    }
    .tile {
      padding: 24px; display: flex; flex-direction: column;
      align-items: flex-start; gap: 12px;
    }
    .tile-icon { font-size: 36px; width: 36px; height: 36px; color: #0d6efd; }
    .tile h3 { margin: 0; }
    .tile p { margin: 0; color: #64748b; font-size: 14px; flex: 1; }
  `]
})
export class PatientDashboardComponent {
  private readonly auth = inject(AuthService);
  readonly user = this.auth.user;
}
