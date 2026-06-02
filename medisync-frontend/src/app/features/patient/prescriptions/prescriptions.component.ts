import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PageHeaderComponent } from '../../../shared/components/page-header.component';
import { MedicalRecordService } from '../../../core/services/medical-record.service';
import { MedicalRecordDto } from '../../../core/models/user.model';

@Component({
  selector: 'app-prescriptions',
  standalone: true,
  imports: [
    CommonModule, MatCardModule, MatButtonModule,
    MatIconModule, MatChipsModule, MatProgressSpinnerModule, PageHeaderComponent
  ],
  template: `
    <div class="page">
      <app-page-header
        eyebrow="Mes ordonnances"
        icon="medication"
        title="Ordonnances"
        subtitle="Téléchargez et suivez vos prescriptions médicales."
      ></app-page-header>

      @if (loading()) {
        <div class="loader"><mat-spinner></mat-spinner></div>
      } @else if (prescriptions().length === 0) {
        <mat-card class="empty-card">
          <mat-icon>medication</mat-icon>
          <p>Aucune ordonnance disponible.</p>
        </mat-card>
      } @else {
        <div class="grid">
          @for (p of prescriptions(); track p.id) {
            <mat-card class="rx">
              <header>
                <div>
                  <h4>Ordonnance du {{ p.createdAt | date:'dd/MM/yyyy' }}</h4>
                  <span>{{ p.doctorName }}</span>
                </div>
                <mat-chip class="chip-active">Active</mat-chip>
              </header>

              <div class="prescription-text">
                <mat-icon>medication</mat-icon>
                <p>{{ p.prescription }}</p>
              </div>

              <div class="actions">
                <button mat-flat-button color="primary" (click)="download(p.id)">
                  <mat-icon>download</mat-icon>
                  Télécharger PDF
                </button>
              </div>
            </mat-card>
          }
        </div>
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
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
      gap: 16px;
    }
    .rx {
      padding: 24px; border-radius: 16px;
      transition: box-shadow 0.2s;
      &:hover { box-shadow: 0 16px 40px rgba(15,23,42,0.08); }
    }
    header {
      display: flex; justify-content: space-between; align-items: flex-start;
      margin-bottom: 16px;
      h4 { margin: 0; font-size: 15px; }
      span { color: #64748b; font-size: 13px; }
    }
    .prescription-text {
      display: flex; align-items: flex-start; gap: 12px;
      background: #f0fdf4; border-radius: 12px; padding: 12px;
      margin-bottom: 16px;
      mat-icon { color: #16a34a; margin-top: 2px; flex-shrink: 0; }
      p { margin: 0; color: #166534; font-size: 14px; white-space: pre-line; line-height: 1.6; }
    }
    .actions { display: flex; gap: 8px; }
    mat-chip {
      &.chip-active { background: #d1fae5 !important; color: #065f46 !important; }
    }
  `]
})
export class PrescriptionsComponent implements OnInit {
  private readonly medSvc = inject(MedicalRecordService);

  readonly loading = signal(true);
  private readonly allRecords = signal<MedicalRecordDto[]>([]);
  readonly prescriptions = computed(() => this.allRecords().filter((r) => !!r.prescription));

  ngOnInit(): void {
    this.medSvc.getMyRecords().subscribe({
      next: (r) => { this.allRecords.set(r); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  download(id: number): void {
    this.medSvc.downloadPdf(id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ordonnance-${id}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      error: (err) => console.error('Erreur de téléchargement PDF:', err)
    });
  }
}
