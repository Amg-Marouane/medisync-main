import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { PageHeaderComponent } from '../../../shared/components/page-header.component';

interface Consultation {
  id: string;
  patient: string;
  age: number;
  time: string;
  reason: string;
  allergies: string;
  antecedents: string;
  status: 'waiting' | 'in-progress' | 'done';
}

@Component({
  selector: 'app-consultations',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatIconModule,
    MatSnackBarModule,
    PageHeaderComponent
  ],
  template: `
    <div class="page">
      <app-page-header
        eyebrow="Aujourd'hui"
        icon="stethoscope"
        title="Consultations"
        subtitle="Patients attendus dans la journee."
      ></app-page-header>

      <div class="kpis">
        <div class="kpi"><strong>{{ todayCount }}</strong><span>Total</span></div>
        <div class="kpi"><strong>{{ doneCount }}</strong><span>Terminees</span></div>
        <div class="kpi"><strong>{{ waitingCount }}</strong><span>En attente</span></div>
      </div>

      <div class="list">
        @for (c of consultations; track c.id) {
          <mat-card class="row" [class]="'status-' + c.status">
            <div class="patient">
              <div class="avatar">{{ initials(c.patient) }}</div>
              <div>
                <strong>{{ c.patient }}</strong>
                <span>{{ c.age }} ans - {{ c.reason }}</span>
                <small>Allergies: {{ c.allergies }} | Antecedents: {{ c.antecedents }}</small>
              </div>
            </div>

            <div class="time">{{ c.time }}</div>

            <div class="status">
              @switch (c.status) {
                @case ('waiting') {
                  <mat-chip class="chip-waiting">En attente</mat-chip>
                  <button mat-flat-button color="primary" type="button" (click)="start(c)">
                    Commencer
                  </button>
                }
                @case ('in-progress') {
                  <mat-chip class="chip-progress">En cours</mat-chip>
                  <button mat-flat-button color="primary" type="button" (click)="finish(c)">
                    Terminer
                  </button>
                }
                @case ('done') {
                  <mat-chip class="chip-done">Terminee</mat-chip>
                  <button mat-stroked-button routerLink="/doctor/patients">
                    <mat-icon>description</mat-icon>
                    Compte rendu
                  </button>
                }
              }
              <button mat-icon-button routerLink="/doctor/patients" aria-label="Dossier patient">
                <mat-icon>folder_shared</mat-icon>
              </button>
            </div>
          </mat-card>
        }
      </div>
    </div>
  `,
  styles: [`
    .page { padding: 24px; max-width: 1100px; margin: 0 auto; }
    .kpis {
      display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;
      margin-bottom: 24px;
    }
    .kpi {
      padding: 20px; background: white; border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06);
      text-align: center;
    }
    .kpi strong { display: block; font-size: 28px; font-weight: 700; color: #0d6efd; }
    .kpi span { color: #64748b; font-size: 13px; }
    .list { display: flex; flex-direction: column; gap: 8px; }
    .row {
      display: grid; grid-template-columns: 1fr auto auto; gap: 24px;
      align-items: center; padding: 16px 20px; border-radius: 8px;
      border-left: 4px solid #cbd5e1;
    }
    .row.status-waiting { border-left-color: #f59e0b; }
    .row.status-in-progress { border-left-color: #0d6efd; }
    .row.status-done { border-left-color: #10b981; opacity: 0.82; }
    .patient { display: flex; align-items: center; gap: 12px; }
    .avatar {
      width: 44px; height: 44px; border-radius: 50%;
      background: linear-gradient(135deg, #0d6efd, #06b6d4);
      color: white; display: flex; align-items: center; justify-content: center;
      font-weight: 600; font-size: 14px;
    }
    .patient strong, .patient span, .patient small { display: block; }
    .patient span { color: #64748b; font-size: 13px; }
    .patient small { color: #94a3b8; font-size: 12px; margin-top: 2px; }
    .time { font-weight: 600; color: #0d6efd; }
    .status { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; justify-content: flex-end; }
    mat-chip.chip-waiting { background: #fef3c7 !important; color: #92400e !important; }
    mat-chip.chip-progress { background: #dbeafe !important; color: #1e40af !important; }
    mat-chip.chip-done { background: #d1fae5 !important; color: #065f46 !important; }
    @media (max-width: 760px) {
      .kpis, .row { grid-template-columns: 1fr; }
      .status { justify-content: flex-start; }
    }
  `]
})
export class ConsultationsComponent {
  private readonly snack = inject(MatSnackBar);

  consultations: Consultation[] = [
    { id: '1', patient: 'Sarah Bennani', age: 34, time: '09:00', reason: 'Controle annuel', allergies: 'Aucune', antecedents: 'Asthme', status: 'done' },
    { id: '2', patient: 'Karim Tazi', age: 52, time: '10:00', reason: 'Suivi hypertension', allergies: 'Penicilline', antecedents: 'HTA', status: 'done' },
    { id: '3', patient: 'Fatima Alaoui', age: 28, time: '10:30', reason: 'Consultation generale', allergies: 'Aucune', antecedents: 'RAS', status: 'in-progress' },
    { id: '4', patient: 'Mohamed Idrissi', age: 65, time: '11:30', reason: 'Douleur thoracique', allergies: 'Iode', antecedents: 'Diabete', status: 'waiting' },
    { id: '5', patient: 'Aicha Lahlou', age: 41, time: '14:00', reason: 'Maux de tete', allergies: 'Aspirine', antecedents: 'Migraine', status: 'waiting' },
    { id: '6', patient: 'Youssef El Amrani', age: 38, time: '15:00', reason: 'Suivi diabete', allergies: 'Aucune', antecedents: 'Diabete type 2', status: 'waiting' }
  ];

  get todayCount(): number { return this.consultations.length; }
  get doneCount(): number { return this.consultations.filter((c) => c.status === 'done').length; }
  get waitingCount(): number { return this.consultations.filter((c) => c.status === 'waiting').length; }

  start(consultation: Consultation): void {
    this.consultations = this.consultations.map((item) =>
      item.id === consultation.id ? { ...item, status: 'in-progress' } : item
    );
    this.snack.open(`Consultation de ${consultation.patient} demarree.`, 'OK', { duration: 2500 });
  }

  finish(consultation: Consultation): void {
    this.consultations = this.consultations.map((item) =>
      item.id === consultation.id ? { ...item, status: 'done' } : item
    );
    this.snack.open('Consultation terminee. Ajoutez le compte rendu dans le dossier patient.', 'OK', { duration: 3500 });
  }

  initials(name: string): string {
    return name.split(' ').map((p) => p[0]).join('').toUpperCase().slice(0, 2);
  }
}
