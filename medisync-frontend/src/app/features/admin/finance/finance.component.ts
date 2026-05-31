import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { PageHeaderComponent } from '../../../shared/components/page-header.component';

@Component({
  selector: 'app-finance',
  standalone: true,
  imports: [
    CommonModule, MatCardModule, MatButtonModule, MatIconModule,
    MatChipsModule, PageHeaderComponent
  ],
  template: `
    <div class="page">
      <app-page-header
        eyebrow="Finance"
        icon="payments"
        title="Gestion financière"
        subtitle="Encaissements, impayés et rapports."
      >
        <button mat-stroked-button>
          <mat-icon>download</mat-icon>
          Exporter
        </button>
        <button mat-flat-button color="primary">
          <mat-icon>add</mat-icon>
          Rapport
        </button>
      </app-page-header>

      <div class="kpis">
        <mat-card class="kpi">
          <span class="kpi-label">Revenus du mois</span>
          <strong>82 350 DH</strong>
          <span class="trend up">
            <mat-icon>trending_up</mat-icon> +12% vs mois dernier
          </span>
        </mat-card>
        <mat-card class="kpi">
          <span class="kpi-label">À encaisser</span>
          <strong>14 200 DH</strong>
          <span class="trend">28 factures en attente</span>
        </mat-card>
        <mat-card class="kpi warn">
          <span class="kpi-label">Impayés</span>
          <strong>3 800 DH</strong>
          <span class="trend down">
            <mat-icon>warning</mat-icon> 5 patients
          </span>
        </mat-card>
        <mat-card class="kpi">
          <span class="kpi-label">Bénéfice net</span>
          <strong>54 720 DH</strong>
          <span class="trend up">
            <mat-icon>trending_up</mat-icon> Marge 66%
          </span>
        </mat-card>
      </div>

      <div class="cols">
        <mat-card class="chart-card">
          <h3>Revenus mensuels</h3>
          <div class="bars">
            @for (m of months; track m.label) {
              <div class="bar-wrap">
                <div class="bar" [style.height.%]="(m.value / maxRevenue) * 100"></div>
                <span>{{ m.label }}</span>
              </div>
            }
          </div>
        </mat-card>

        <mat-card class="rates">
          <h3>Tarifs par acte</h3>
          <ul>
            @for (t of tariffs; track t.act) {
              <li>
                <span>{{ t.act }}</span>
                <strong>{{ t.amount }} DH</strong>
              </li>
            }
          </ul>
          <button mat-stroked-button class="full">
            <mat-icon>edit</mat-icon>
            Modifier les tarifs
          </button>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .page { padding: 24px; max-width: 1200px; margin: 0 auto; }
    .kpis {
      display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px;
      margin-bottom: 24px;
      @media (max-width: 900px) { grid-template-columns: 1fr 1fr; }
      @media (max-width: 600px) { grid-template-columns: 1fr; }
    }
    .kpi {
      padding: 20px; border-radius: 14px;
      display: flex; flex-direction: column; gap: 6px;
      .kpi-label { color: #64748b; font-size: 13px; }
      strong { font-size: 26px; font-weight: 700; color: #0f172a; }
      .trend {
        display: inline-flex; align-items: center; gap: 4px;
        font-size: 13px; color: #64748b;
        &.up { color: #10b981; }
        &.down { color: #ef4444; }
        mat-icon { font-size: 16px; width: 16px; height: 16px; }
      }
      &.warn strong { color: #b91c1c; }
    }
    .cols {
      display: grid; grid-template-columns: 2fr 1fr; gap: 16px;
      @media (max-width: 900px) { grid-template-columns: 1fr; }
    }
    .chart-card, .rates {
      padding: 24px; border-radius: 16px;
      h3 { margin: 0 0 20px; font-size: 16px; font-weight: 600; }
    }
    .bars {
      display: flex; align-items: flex-end; gap: 16px;
      height: 240px;
      padding-top: 16px;
    }
    .bar-wrap {
      flex: 1; display: flex; flex-direction: column;
      align-items: center; gap: 6px; height: 100%;
      justify-content: flex-end;
      span { font-size: 12px; color: #64748b; }
    }
    .bar {
      width: 100%; max-width: 40px;
      background: linear-gradient(180deg, #0d6efd, #06b6d4);
      border-radius: 8px 8px 0 0;
      animation: grow 0.8s ease-out;
      min-height: 4px;
    }
    @keyframes grow { from { height: 0 !important; } }
    .rates ul {
      list-style: none; padding: 0; margin: 0 0 16px;
      li {
        display: flex; justify-content: space-between;
        padding: 10px 0;
        border-bottom: 1px solid #f1f5f9;
        font-size: 14px;
        &:last-child { border-bottom: none; }
        span { color: #475569; }
      }
    }
    .full { width: 100%; }
  `]
})
export class FinanceComponent {
  months = [
    { label: 'Jan', value: 62000 },
    { label: 'Fév', value: 68000 },
    { label: 'Mar', value: 71000 },
    { label: 'Avr', value: 73500 },
    { label: 'Mai', value: 82350 },
    { label: 'Juin', value: 41200 }
  ];
  maxRevenue = Math.max(...this.months.map(m => m.value));

  tariffs = [
    { act: 'Consultation générale', amount: 300 },
    { act: 'Consultation spécialisée', amount: 450 },
    { act: 'Suivi médical', amount: 200 },
    { act: 'Acte de petite chirurgie', amount: 800 },
    { act: 'Bilan complet', amount: 1200 }
  ];
}
