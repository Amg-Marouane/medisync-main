import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { PageHeaderComponent } from '../../../shared/components/page-header.component';

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [
    CommonModule, MatCardModule, MatButtonModule, MatIconModule,
    PageHeaderComponent
  ],
  template: `
    <div class="page">
      <app-page-header
        eyebrow="Insights"
        icon="insights"
        title="Statistiques"
        subtitle="Indicateurs clés de performance de la clinique."
      >
        <button mat-stroked-button>
          <mat-icon>download</mat-icon>
          Exporter PDF
        </button>
      </app-page-header>

      <div class="cards">
        <mat-card class="chart-card">
          <h3>Consultations par praticien</h3>
          <div class="practitioners">
            @for (p of practitioners; track p.name) {
              <div class="practitioner">
                <div class="row-top">
                  <span>{{ p.name }}</span>
                  <strong>{{ p.consultations }}</strong>
                </div>
                <div class="track">
                  <div class="fill" [style.width.%]="(p.consultations / maxConsult) * 100"></div>
                </div>
              </div>
            }
          </div>
        </mat-card>

        <mat-card class="chart-card pie">
          <h3>Répartition par spécialité</h3>
          <div class="pie-wrap">
            <div class="pie-chart" [style.background]="pieGradient"></div>
            <div class="legend">
              @for (s of specialties; track s.label) {
                <div class="legend-item">
                  <span class="dot" [style.background]="s.color"></span>
                  <span class="label">{{ s.label }}</span>
                  <strong>{{ s.value }}%</strong>
                </div>
              }
            </div>
          </div>
        </mat-card>

        <mat-card class="chart-card">
          <h3>Indicateurs clés</h3>
          <div class="kpis">
            <div class="kpi"><mat-icon>chair</mat-icon>
              <strong>78%</strong>
              <span>Taux d'occupation</span>
            </div>
            <div class="kpi"><mat-icon>schedule</mat-icon>
              <strong>22 min</strong>
              <span>Temps moyen / RDV</span>
            </div>
            <div class="kpi"><mat-icon>person_off</mat-icon>
              <strong>6.2%</strong>
              <span>Taux de no-show</span>
            </div>
            <div class="kpi"><mat-icon>thumb_up</mat-icon>
              <strong>4.7 / 5</strong>
              <span>Satisfaction patients</span>
            </div>
          </div>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .page { padding: 24px; max-width: 1200px; margin: 0 auto; }
    .cards {
      display: grid; grid-template-columns: 1fr 1fr; gap: 16px;
      @media (max-width: 900px) { grid-template-columns: 1fr; }
    }
    .chart-card {
      padding: 24px; border-radius: 16px;
      h3 { margin: 0 0 20px; font-size: 16px; font-weight: 600; }
    }
    .chart-card:nth-child(3) { grid-column: 1 / -1; }
    .practitioners { display: flex; flex-direction: column; gap: 14px; }
    .row-top {
      display: flex; justify-content: space-between;
      font-size: 14px; margin-bottom: 6px;
      span { color: #475569; }
      strong { color: #0f172a; }
    }
    .track {
      height: 10px;
      background: #f1f5f9;
      border-radius: 999px;
      overflow: hidden;
    }
    .fill {
      height: 100%;
      background: linear-gradient(90deg, #0d6efd, #06b6d4);
      border-radius: 999px;
      animation: grow 1s ease-out;
    }
    @keyframes grow { from { width: 0 !important; } }
    .pie-wrap {
      display: grid; grid-template-columns: 200px 1fr; gap: 24px;
      align-items: center;
      @media (max-width: 600px) { grid-template-columns: 1fr; }
    }
    .pie-chart {
      width: 200px; height: 200px;
      border-radius: 50%;
      margin: 0 auto;
      box-shadow: 0 10px 30px rgba(13,110,253,0.2);
    }
    .legend {
      display: flex; flex-direction: column; gap: 10px;
    }
    .legend-item {
      display: grid; grid-template-columns: auto 1fr auto; gap: 12px;
      align-items: center; font-size: 14px;
      .dot { width: 12px; height: 12px; border-radius: 50%; }
      .label { color: #475569; }
      strong { color: #0f172a; }
    }
    .kpis {
      display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px;
      @media (max-width: 700px) { grid-template-columns: 1fr 1fr; }
    }
    .kpi {
      display: flex; flex-direction: column; align-items: flex-start;
      gap: 4px;
      padding: 16px; background: #f8fafc; border-radius: 12px;
      mat-icon {
        color: #0d6efd; background: #e0f2fe;
        padding: 8px; border-radius: 10px;
        font-size: 20px; width: 20px; height: 20px;
        margin-bottom: 8px;
      }
      strong { font-size: 22px; font-weight: 700; }
      span { color: #64748b; font-size: 12px; }
    }
  `]
})
export class StatisticsComponent {
  practitioners = [
    { name: 'Dr Tazi', consultations: 248 },
    { name: 'Dr Martin', consultations: 192 },
    { name: 'Dr Alami', consultations: 220 },
    { name: 'Dr Bensaïd', consultations: 156 }
  ];
  maxConsult = Math.max(...this.practitioners.map(p => p.consultations));

  specialties = [
    { label: 'Médecine générale', value: 38, color: '#0d6efd' },
    { label: 'Cardiologie', value: 22, color: '#06b6d4' },
    { label: 'Dermatologie', value: 18, color: '#10b981' },
    { label: 'Pédiatrie', value: 14, color: '#f59e0b' },
    { label: 'Autres', value: 8, color: '#8b5cf6' }
  ];

  get pieGradient(): string {
    let total = 0;
    const stops = this.specialties.map(s => {
      const start = (total / 100) * 360;
      total += s.value;
      const end = (total / 100) * 360;
      return `${s.color} ${start}deg ${end}deg`;
    });
    return `conic-gradient(${stops.join(', ')})`;
  }
}
