import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PageHeaderComponent } from '../../../shared/components/page-header.component';
import { MedicalRecordService } from '../../../core/services/medical-record.service';
import { MedicalRecordDto } from '../../../core/models/user.model';

@Component({
  selector: 'app-medical-record',
  standalone: true,
  imports: [
    CommonModule, MatCardModule, MatButtonModule, MatIconModule,
    MatChipsModule, MatExpansionModule, MatProgressSpinnerModule, PageHeaderComponent
  ],
  template: `
    <div class="page">
      <app-page-header
        eyebrow="Mon dossier"
        icon="folder_shared"
        title="Dossier médical"
        subtitle="Historique de vos consultations et documents."
      ></app-page-header>

      @if (loading()) {
        <div class="loader"><mat-spinner></mat-spinner></div>
      } @else if (records().length === 0) {
        <mat-card class="empty-card">
          <mat-icon>folder_open</mat-icon>
          <p>Aucune consultation enregistrée pour le moment.</p>
        </mat-card>
      } @else {
        <h3 class="section-title">Historique des consultations ({{ records().length }})</h3>
        <mat-accordion>
          @for (r of records(); track r.id) {
            <mat-expansion-panel class="entry">
              <mat-expansion-panel-header>
                <mat-panel-title>
                  <div class="entry-head">
                    <mat-icon class="entry-icon">stethoscope</mat-icon>
                    <div>
                      <strong>{{ r.doctorName }}</strong>
                      <span>{{ r.createdAt | date:'dd/MM/yyyy' }}</span>
                    </div>
                  </div>
                </mat-panel-title>
                <mat-panel-description>
                  @if (r.prescription) {
                    <mat-chip class="chip-rx">Ordonnance</mat-chip>
                  }
                </mat-panel-description>
              </mat-expansion-panel-header>

              <p class="report">{{ r.report }}</p>

              @if (r.prescription) {
                <div class="prescription-box">
                  <h4><mat-icon>medication</mat-icon> Ordonnance</h4>
                  <p>{{ r.prescription }}</p>
                </div>
              }
            </mat-expansion-panel>
          }
        </mat-accordion>
      }
    </div>
  `,
  styles: [`
    .page { padding: 24px; max-width: 1100px; margin: 0 auto; }
    .loader { display: flex; justify-content: center; padding: 48px; }
    .empty-card {
      display: flex; flex-direction: column; align-items: center;
      padding: 48px; gap: 12px; border-radius: 16px;
      mat-icon { font-size: 48px; width: 48px; height: 48px; color: #cbd5e1; }
      p { color: #94a3b8; margin: 0; }
    }
    .section-title { font-size: 18px; margin: 0 0 16px; }
    .entry { border-radius: 12px !important; margin-bottom: 8px; }
    .entry-head {
      display: flex; align-items: center; gap: 12px;
      strong { display: block; }
      span { display: block; color: #64748b; font-size: 13px; }
    }
    .entry-icon {
      background: #e0f2fe; color: #0d6efd;
      padding: 8px; border-radius: 10px;
      font-size: 20px; width: 20px; height: 20px;
    }
    .report { color: #475569; line-height: 1.6; margin: 16px 0; white-space: pre-line; }
    .prescription-box {
      background: #f0fdf4; border: 1px solid #86efac;
      border-radius: 12px; padding: 16px; margin-top: 8px;
      h4 {
        display: flex; align-items: center; gap: 8px;
        margin: 0 0 8px; color: #166534; font-size: 14px;
        mat-icon { font-size: 18px; width: 18px; height: 18px; }
      }
      p { margin: 0; color: #166534; white-space: pre-line; font-size: 14px; }
    }
    .chip-rx { background: #d1fae5 !important; color: #065f46 !important; font-size: 11px !important; }
  `]
})
export class MedicalRecordComponent implements OnInit {
  private readonly medSvc = inject(MedicalRecordService);

  readonly loading = signal(true);
  readonly records = signal<MedicalRecordDto[]>([]);

  ngOnInit(): void {
    this.medSvc.getMyRecords().subscribe({
      next: (r) => { this.records.set(r); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }
}
