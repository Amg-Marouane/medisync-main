import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-doctor-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule, RouterLink],
  template: `
    <div class="page">
      <header class="page-header">
        <h1>Bonjour, Dr {{ user()?.lastName }} !</h1>
        <p>Votre planning et vos consultations du jour.</p>
      </header>

      <div class="grid">
        <mat-card class="tile">
          <mat-icon class="tile-icon">calendar_month</mat-icon>
          <h3>Planning</h3>
          <p>Gérez vos rendez-vous patients. Confirmez ou annulez les demandes.</p>
          <button mat-flat-button color="primary" routerLink="/doctor/planning">Ouvrir</button>
        </mat-card>

        <mat-card class="tile">
          <mat-icon class="tile-icon">groups</mat-icon>
          <h3>Mes patients</h3>
          <p>Liste et dossiers médicaux.</p>
          <button mat-stroked-button routerLink="/doctor/patients">Voir</button>
        </mat-card>

        <mat-card class="tile">
          <mat-icon class="tile-icon">receipt_long</mat-icon>
          <h3>Consultations</h3>
          <p>Rédigez les comptes rendus et prescriptions.</p>
          <button mat-stroked-button routerLink="/doctor/consultations">Accéder</button>
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
    .tile { padding: 24px; display: flex; flex-direction: column; gap: 12px; align-items: flex-start; }
    .tile-icon { font-size: 36px; width: 36px; height: 36px; color: #0d6efd; }
    .tile h3 { margin: 0; }
    .tile p { margin: 0; color: #64748b; font-size: 14px; flex: 1; }
  `]
})
export class DoctorDashboardComponent {
  private readonly auth = inject(AuthService);
  readonly user = this.auth.user;
}
