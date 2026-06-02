import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { PageHeaderComponent } from '../../../shared/components/page-header.component';

interface MonthStat { month: string; consultations: number; revenue: number; newPatients: number; }
interface Practitioner { name: string; specialty: string; consultations: number; satisfaction: number; trend: number; }
interface SpecialtyStat { label: string; value: number; color: string; }
interface AgeGroup { label: string; value: number; color: string; }

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatButtonToggleModule, PageHeaderComponent],
  template: `
    <div class="page">
      <app-page-header eyebrow="Insights" icon="insights" title="Statistiques"
        subtitle="Indicateurs clés de performance de la clinique — Juin 2026.">
        <button mat-stroked-button (click)="exportPdf()">
          <mat-icon>download</mat-icon>
          Exporter PDF
        </button>
      </app-page-header>

      <!-- KPI Cards -->
      <div class="kpi-row">
        <mat-card class="kpi-card" style="border-top:3px solid #0369a1">
          <div class="kpi-icon" style="background:#e0f2fe"><mat-icon style="color:#0369a1">event_available</mat-icon></div>
          <div class="kpi-body">
            <span class="kpi-lbl">Consultations</span>
            <strong class="kpi-val">1 247</strong>
            <div class="kpi-trend up"><mat-icon>arrow_upward</mat-icon>+4.1% vs mois préc.</div>
          </div>
        </mat-card>
        <mat-card class="kpi-card" style="border-top:3px solid #166534">
          <div class="kpi-icon" style="background:#dcfce7"><mat-icon style="color:#166534">payments</mat-icon></div>
          <div class="kpi-body">
            <span class="kpi-lbl">Chiffre d'affaires</span>
            <strong class="kpi-val">186 300 DH</strong>
            <div class="kpi-trend up"><mat-icon>arrow_upward</mat-icon>+3.7% vs mois préc.</div>
          </div>
        </mat-card>
        <mat-card class="kpi-card" style="border-top:3px solid #92400e">
          <div class="kpi-icon" style="background:#fef3c7"><mat-icon style="color:#92400e">person_add</mat-icon></div>
          <div class="kpi-body">
            <span class="kpi-lbl">Nouveaux patients</span>
            <strong class="kpi-val">312</strong>
            <div class="kpi-trend up"><mat-icon>arrow_upward</mat-icon>+5.8% vs mois préc.</div>
          </div>
        </mat-card>
        <mat-card class="kpi-card" style="border-top:3px solid #6d28d9">
          <div class="kpi-icon" style="background:#f3e8ff"><mat-icon style="color:#6d28d9">star</mat-icon></div>
          <div class="kpi-body">
            <span class="kpi-lbl">Satisfaction patients</span>
            <strong class="kpi-val">4.6 / 5</strong>
            <div class="kpi-trend up"><mat-icon>arrow_upward</mat-icon>Stable vs mois préc.</div>
          </div>
        </mat-card>
      </div>

      <!-- Charts Row -->
      <div class="charts-grid">
        <!-- Bar Chart -->
        <mat-card class="chart-card">
          <div class="chart-hdr">
            <h3>Évolution des consultations</h3>
            <mat-button-toggle-group [value]="period()" (change)="period.set($event.value)">
              <mat-button-toggle value="3m">3 mois</mat-button-toggle>
              <mat-button-toggle value="6m">6 mois</mat-button-toggle>
              <mat-button-toggle value="12m">12 mois</mat-button-toggle>
            </mat-button-toggle-group>
          </div>
          <div class="bar-chart">
            @for (m of chartMonths(); track m.month) {
              <div class="bar-col" [title]="m.consultations + ' consultations'">
                <div class="bar" [class.bar-current]="m.month === 'Juin'" [style.height.px]="barPx(m.consultations)"></div>
              </div>
            }
          </div>
          <div class="bar-labels">
            @for (m of chartMonths(); track m.month) {
              <span [class.lbl-current]="m.month === 'Juin'">{{ m.month }}</span>
            }
          </div>
        </mat-card>

        <!-- Donut Chart -->
        <mat-card class="chart-card">
          <h3>Répartition par spécialité</h3>
          <div class="pie-wrap">
            <div class="donut" [style.background]="pieGradient">
              <div class="donut-hole">
                <strong>1 247</strong>
                <span>patients</span>
              </div>
            </div>
            <div class="legend">
              @for (s of specialties; track s.label) {
                <div class="legend-row">
                  <span class="dot" [style.background]="s.color"></span>
                  <span class="lbl">{{ s.label }}</span>
                  <strong>{{ s.value }}%</strong>
                </div>
              }
            </div>
          </div>
        </mat-card>
      </div>

      <!-- Practitioners -->
      <mat-card class="chart-card pract-card">
        <h3>Performance par praticien — Juin 2026</h3>
        <div class="pract-list">
          @for (p of practitioners; track p.name; let last = $last) {
            <div class="pract-row" [class.no-border]="last">
              <div class="avatar">{{ initials(p.name) }}</div>
              <div class="pract-info">
                <strong>{{ p.name }}</strong>
                <span>{{ p.specialty }}</span>
              </div>
              <div class="pract-bar-area">
                <div class="pract-track">
                  <div class="pract-fill" [style.width.%]="(p.consultations / maxPractConsult) * 100"></div>
                </div>
                <span class="pract-count">{{ p.consultations }} consultations</span>
              </div>
              <div class="trend-pill" [class.up]="p.trend > 0" [class.dn]="p.trend < 0">
                <mat-icon>{{ p.trend > 0 ? 'trending_up' : 'trending_down' }}</mat-icon>
                {{ p.trend > 0 ? '+' : '' }}{{ p.trend }}%
              </div>
              <div class="rating">
                <mat-icon class="star-i">star</mat-icon>
                <strong>{{ p.satisfaction }}</strong>
              </div>
            </div>
          }
        </div>
      </mat-card>

      <!-- Bottom Row -->
      <div class="bottom-grid">
        <mat-card class="chart-card">
          <h3>Répartition par tranche d'âge</h3>
          <div class="age-list">
            @for (a of ageGroups; track a.label) {
              <div class="age-row">
                <span class="age-lbl">{{ a.label }}</span>
                <div class="age-track">
                  <div class="age-fill" [style.width.%]="a.value" [style.background]="a.color"></div>
                </div>
                <span class="age-val">{{ a.value }}%</span>
              </div>
            }
          </div>
        </mat-card>

        <mat-card class="chart-card">
          <h3>Indicateurs qualité</h3>
          <div class="quality-grid">
            <div class="q-item">
              <div class="q-ring" style="background:conic-gradient(#0d6efd 82%,#e2e8f0 0)">
                <div class="q-hole"><span>82%</span></div>
              </div>
              <p>Taux d'occupation</p>
            </div>
            <div class="q-item">
              <div class="q-ring" style="background:conic-gradient(#ef4444 4.8%,#e2e8f0 0)">
                <div class="q-hole"><span>4.8%</span></div>
              </div>
              <p>Taux de no-show</p>
            </div>
            <div class="q-item">
              <div class="q-icon-wrap" style="background:#dcfce7">
                <mat-icon style="color:#16a34a">schedule</mat-icon>
              </div>
              <strong class="q-num" style="color:#16a34a">2.3 j</strong>
              <p>Délai moyen RDV</p>
            </div>
            <div class="q-item">
              <div class="q-icon-wrap" style="background:#fef3c7">
                <mat-icon style="color:#d97706">autorenew</mat-icon>
              </div>
              <strong class="q-num" style="color:#d97706">68%</strong>
              <p>Taux de fidélisation</p>
            </div>
          </div>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .page { padding: 24px; max-width: 1200px; margin: 0 auto; }

    .kpi-row {
      display: grid; grid-template-columns: repeat(4,1fr); gap: 12px; margin-bottom: 16px;
    }
    .kpi-card {
      display: flex; align-items: center; gap: 14px; padding: 18px 20px; border-radius: 14px;
    }
    .kpi-icon {
      width: 48px; height: 48px; border-radius: 12px; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
      mat-icon { font-size: 22px; width: 22px; height: 22px; }
    }
    .kpi-body { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
    .kpi-lbl { font-size: 12px; color: #64748b; }
    .kpi-val { font-size: 20px; font-weight: 700; color: #0f172a; white-space: nowrap; }
    .kpi-trend {
      display: flex; align-items: center; gap: 2px; font-size: 11px; font-weight: 500;
      mat-icon { font-size: 12px; width: 12px; height: 12px; }
      &.up { color: #10b981; }
      &.dn { color: #ef4444; }
    }

    .charts-grid {
      display: grid; grid-template-columns: 3fr 2fr; gap: 16px; margin-bottom: 16px;
    }
    .chart-card {
      padding: 24px; border-radius: 16px;
      h3 { margin: 0 0 20px; font-size: 15px; font-weight: 600; color: #0f172a; }
    }
    .chart-hdr {
      display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;
      h3 { margin: 0; }
    }

    .bar-chart {
      display: flex; align-items: flex-end; gap: 6px;
      height: 150px; border-bottom: 2px solid #f1f5f9;
    }
    .bar-col {
      flex: 1; height: 100%;
      display: flex; align-items: flex-end; justify-content: center;
    }
    .bar {
      width: 75%; max-width: 36px; border-radius: 3px 3px 0 0;
      background: linear-gradient(180deg, #38bdf8, #0d6efd);
      transform-origin: bottom center;
      animation: grow-v 0.7s ease-out;
    }
    .bar-current { background: linear-gradient(180deg, #fbbf24, #f97316) !important; }
    @keyframes grow-v { from { transform: scaleY(0); } }
    .bar-labels {
      display: flex; gap: 6px; margin-top: 6px;
      span { flex: 1; text-align: center; font-size: 10px; color: #94a3b8; }
      .lbl-current { color: #f97316; font-weight: 700; }
    }

    .pie-wrap { display: flex; flex-direction: column; align-items: center; gap: 18px; }
    .donut {
      width: 160px; height: 160px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 8px 24px rgba(13,110,253,.15);
    }
    .donut-hole {
      width: 110px; height: 110px; background: white; border-radius: 50%;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      strong { font-size: 18px; font-weight: 700; }
      span { font-size: 10px; color: #64748b; }
    }
    .legend { width: 100%; display: flex; flex-direction: column; gap: 8px; }
    .legend-row {
      display: grid; grid-template-columns: 10px 1fr auto; gap: 10px;
      align-items: center; font-size: 13px;
      .dot { width: 10px; height: 10px; border-radius: 50%; }
      .lbl { color: #475569; }
      strong { color: #0f172a; }
    }

    .pract-card { margin-bottom: 16px; }
    .pract-list { display: flex; flex-direction: column; }
    .pract-row {
      display: grid; grid-template-columns: 40px 180px 1fr auto auto;
      gap: 16px; align-items: center; padding: 14px 0;
      border-bottom: 1px solid #f1f5f9;
      &.no-border { border-bottom: none; }
    }
    .avatar {
      width: 38px; height: 38px; border-radius: 50%; flex-shrink: 0;
      background: linear-gradient(135deg, #0d6efd, #06b6d4);
      color: white; font-size: 12px; font-weight: 700;
      display: flex; align-items: center; justify-content: center;
    }
    .pract-info {
      strong { display: block; font-size: 14px; }
      span { display: block; font-size: 12px; color: #64748b; }
    }
    .pract-bar-area { display: flex; flex-direction: column; gap: 4px; }
    .pract-track { height: 8px; background: #f1f5f9; border-radius: 999px; overflow: hidden; }
    .pract-fill {
      height: 100%; background: linear-gradient(90deg, #0d6efd, #06b6d4);
      border-radius: 999px; transform-origin: left;
      animation: grow-h 0.7s ease-out;
    }
    @keyframes grow-h { from { transform: scaleX(0); } }
    .pract-count { font-size: 11px; color: #64748b; }
    .trend-pill {
      display: flex; align-items: center; gap: 3px;
      padding: 4px 10px; border-radius: 999px; font-size: 12px; font-weight: 600; white-space: nowrap;
      mat-icon { font-size: 14px; width: 14px; height: 14px; }
      &.up { background: #dcfce7; color: #166534; }
      &.dn { background: #fee2e2; color: #991b1b; }
    }
    .rating {
      display: flex; align-items: center; gap: 4px;
      strong { font-size: 14px; }
      .star-i { font-size: 16px; width: 16px; height: 16px; color: #f59e0b; }
    }

    .bottom-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

    .age-list { display: flex; flex-direction: column; gap: 16px; }
    .age-row { display: flex; align-items: center; gap: 12px; }
    .age-lbl { font-size: 13px; color: #475569; width: 110px; flex-shrink: 0; }
    .age-track { flex: 1; height: 10px; background: #f1f5f9; border-radius: 999px; overflow: hidden; }
    .age-fill { height: 100%; border-radius: 999px; }
    .age-val { font-size: 13px; font-weight: 600; width: 36px; text-align: right; }

    .quality-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .q-item {
      display: flex; flex-direction: column; align-items: center; gap: 8px;
      padding: 16px; background: #f8fafc; border-radius: 12px;
      p { margin: 0; font-size: 12px; color: #64748b; text-align: center; }
    }
    .q-ring {
      width: 72px; height: 72px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
    }
    .q-hole {
      width: 52px; height: 52px; background: #f8fafc; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      span { font-size: 11px; font-weight: 700; color: #0f172a; }
    }
    .q-icon-wrap {
      width: 52px; height: 52px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      mat-icon { font-size: 24px; width: 24px; height: 24px; }
    }
    .q-num { font-size: 22px; }

    @media (max-width: 1100px) { .kpi-row { grid-template-columns: 1fr 1fr; } }
    @media (max-width: 900px) {
      .charts-grid { grid-template-columns: 1fr; }
      .pract-row { grid-template-columns: 40px 1fr auto; }
      .pract-bar-area { display: none; }
    }
    @media (max-width: 700px) {
      .kpi-row { grid-template-columns: 1fr; }
      .bottom-grid { grid-template-columns: 1fr; }
      .trend-pill, .rating { display: none; }
    }

    @media print {
      .page { padding: 0; max-width: 100%; }
      mat-sidenav, mat-toolbar { display: none !important; }
      .bar, .pract-fill, .age-fill { animation: none; }
    }
  `]
})
export class StatisticsComponent {
  readonly period = signal<'3m' | '6m' | '12m'>('12m');

  private readonly allMonths: MonthStat[] = [
    { month: 'Juil', consultations: 892,  revenue: 133800, newPatients: 201 },
    { month: 'Août', consultations: 734,  revenue: 110100, newPatients: 165 },
    { month: 'Sep',  consultations: 980,  revenue: 147000, newPatients: 232 },
    { month: 'Oct',  consultations: 1056, revenue: 158400, newPatients: 248 },
    { month: 'Nov',  consultations: 1102, revenue: 165300, newPatients: 261 },
    { month: 'Déc',  consultations: 1187, revenue: 178050, newPatients: 289 },
    { month: 'Jan',  consultations: 1043, revenue: 156450, newPatients: 244 },
    { month: 'Fév',  consultations: 978,  revenue: 146700, newPatients: 228 },
    { month: 'Mar',  consultations: 1124, revenue: 168600, newPatients: 267 },
    { month: 'Avr',  consultations: 1189, revenue: 178350, newPatients: 285 },
    { month: 'Mai',  consultations: 1198, revenue: 179700, newPatients: 295 },
    { month: 'Juin', consultations: 1247, revenue: 186300, newPatients: 312 }
  ];

  readonly chartMonths = computed(() => {
    const n = this.period() === '3m' ? 3 : this.period() === '6m' ? 6 : 12;
    return this.allMonths.slice(-n);
  });

  readonly maxConsult = computed(() =>
    Math.max(...this.chartMonths().map(m => m.consultations))
  );

  barPx(n: number): number {
    return Math.round((n / this.maxConsult()) * 140);
  }

  readonly practitioners: Practitioner[] = [
    { name: 'Dr Tazi',      specialty: 'Médecine générale', consultations: 324, satisfaction: 4.8, trend: 12 },
    { name: 'Dr Moussaoui', specialty: 'Pédiatrie',          consultations: 221, satisfaction: 4.9, trend: 18 },
    { name: 'Dr Alami',     specialty: 'Cardiologie',         consultations: 198, satisfaction: 4.7, trend: 5  },
    { name: 'Dr Chraibi',   specialty: 'Gynécologie',         consultations: 189, satisfaction: 4.6, trend: 8  },
    { name: 'Dr Benali',    specialty: 'Dermatologie',        consultations: 175, satisfaction: 4.5, trend: -3 },
    { name: 'Dr El Fassi',  specialty: 'Radiologie',          consultations: 140, satisfaction: 4.4, trend: -7 }
  ];

  readonly maxPractConsult = Math.max(...this.practitioners.map(p => p.consultations));

  readonly specialties: SpecialtyStat[] = [
    { label: 'Médecine générale', value: 26, color: '#0d6efd' },
    { label: 'Pédiatrie',         value: 18, color: '#10b981' },
    { label: 'Cardiologie',       value: 16, color: '#06b6d4' },
    { label: 'Gynécologie',       value: 15, color: '#ec4899' },
    { label: 'Dermatologie',      value: 14, color: '#f59e0b' },
    { label: 'Radiologie',        value: 11, color: '#8b5cf6' }
  ];

  get pieGradient(): string {
    let deg = 0;
    const stops = this.specialties.map(s => {
      const start = deg;
      deg += (s.value / 100) * 360;
      return `${s.color} ${start}deg ${deg}deg`;
    });
    return `conic-gradient(${stops.join(', ')})`;
  }

  readonly ageGroups: AgeGroup[] = [
    { label: '0 — 14 ans',  value: 18, color: '#10b981' },
    { label: '15 — 29 ans', value: 14, color: '#06b6d4' },
    { label: '30 — 49 ans', value: 32, color: '#0d6efd' },
    { label: '50 — 64 ans', value: 24, color: '#f59e0b' },
    { label: '65 ans +',    value: 12, color: '#ef4444' }
  ];

  initials(name: string): string {
    return name.replace('Dr ', '').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  }

  exportPdf(): void {
    window.print();
  }
}
