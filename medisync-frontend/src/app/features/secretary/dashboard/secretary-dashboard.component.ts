import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-secretary-dashboard',
  standalone: true,
  imports: [MatCardModule, MatIconModule, MatButtonModule, RouterLink],
  template: `
    <div class="page">
      <header class="page-header">
        <h1>Espace Secrétariat</h1>
        <p>Gestion des rendez-vous et de la facturation.</p>
      </header>

      <div class="grid">
        <mat-card class="tile">
          <mat-icon class="tile-icon">event_note</mat-icon>
          <h3>Rendez-vous</h3>
          <p>Créer, modifier, confirmer ou annuler.</p>
          <button mat-flat-button color="primary" routerLink="/secretary/appointments">Gérer</button>
        </mat-card>

        <mat-card class="tile">
          <mat-icon class="tile-icon">person_add</mat-icon>
          <h3>Nouveau patient</h3>
          <p>Création de comptes patients.</p>
          <button mat-stroked-button routerLink="/secretary/patients/new">Créer</button>
        </mat-card>

        <mat-card class="tile">
          <mat-icon class="tile-icon">receipt</mat-icon>
          <h3>Facturation</h3>
          <p>Factures et feuilles de soins.</p>
          <button mat-stroked-button routerLink="/secretary/billing">Voir</button>
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
export class SecretaryDashboardComponent {}
