import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { PageHeaderComponent } from '../../../shared/components/page-header.component';

// ── Tariffs Dialog ───────────────────────────────────────────────────────────

interface Tariff { act: string; amount: number; }

@Component({
  selector: 'app-tariffs-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatButtonModule, MatFormFieldModule,
            MatInputModule, MatIconModule, MatDialogModule],
  template: `
    <div class="dlg-header">
      <mat-icon>edit</mat-icon>
      <h2>Modifier les tarifs</h2>
    </div>
    <mat-dialog-content>
      <form [formGroup]="form" class="tariff-form">
        @for (key of actKeys; track key) {
          <div class="tariff-row">
            <span class="act-name">{{ key }}</span>
            <mat-form-field appearance="outline" class="amount-field">
              <input matInput type="number" min="1" [formControlName]="key" />
              <span matTextSuffix>DH</span>
            </mat-form-field>
          </div>
        }
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Annuler</button>
      <button mat-flat-button color="primary" [disabled]="form.invalid" (click)="save()">
        <mat-icon>check</mat-icon>
        Enregistrer
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .dlg-header { display:flex; align-items:center; gap:10px; padding:20px 24px 0; }
    .dlg-header mat-icon { color:#0d6efd; font-size:26px; width:26px; height:26px; }
    .dlg-header h2 { margin:0; font-size:18px; font-weight:600; }
    mat-dialog-content { padding:16px 24px !important; min-width:400px; }
    .tariff-form { display:flex; flex-direction:column; gap:4px; }
    .tariff-row { display:flex; align-items:center; gap:16px; }
    .act-name { flex:1; font-size:14px; color:#374151; }
    .amount-field { width:130px; flex-shrink:0; }
    mat-dialog-actions { padding:8px 24px 20px !important; }
  `]
})
export class TariffsDialogComponent {
  private readonly ref = inject(MatDialogRef<TariffsDialogComponent>);
  private readonly data: Tariff[] = inject(MAT_DIALOG_DATA);
  private readonly fb = inject(FormBuilder);

  actKeys = this.data.map(t => t.act);

  form = this.fb.nonNullable.group(
    Object.fromEntries(this.data.map(t => [t.act, [t.amount, [Validators.required, Validators.min(1)]]]))
  );

  save(): void {
    if (this.form.invalid) return;
    const raw = this.form.getRawValue() as Record<string, number>;
    this.ref.close(this.data.map(t => ({ act: t.act, amount: Number(raw[t.act]) })));
  }
}

// ── Rapport Dialog ────────────────────────────────────────────────────────────
@Component({
  selector: 'app-rapport-dialog',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatDividerModule],
  template: `
    <div class="rapport-wrap" id="rapport-print">
      <div class="rapport-header">
        <div class="brand">
          <mat-icon>local_hospital</mat-icon>
          <span>MediSync</span>
        </div>
        <div class="meta">
          <span>Rapport financier mensuel</span>
          <span>Généré le {{ today }}</span>
        </div>
      </div>

      <mat-divider></mat-divider>

      <h2 class="section-title">Indicateurs du mois</h2>
      <table class="kpi-table">
        <tbody>
          <tr><td>Revenus du mois</td><td class="val">82 350 DH</td><td class="badge up">+12%</td></tr>
          <tr><td>À encaisser</td><td class="val">14 200 DH</td><td class="badge neutral">28 factures</td></tr>
          <tr><td>Impayés</td><td class="val warn">3 800 DH</td><td class="badge down">5 patients</td></tr>
          <tr><td>Bénéfice net</td><td class="val">54 720 DH</td><td class="badge up">Marge 66%</td></tr>
        </tbody>
      </table>

      <mat-divider></mat-divider>

      <h2 class="section-title">Revenus mensuels (Jan – Juin 2026)</h2>
      <table class="data-table">
        <thead><tr><th>Mois</th><th>Revenus</th><th>Évolution</th></tr></thead>
        <tbody>
          @for (m of months; track m.label; let i = $index) {
            <tr>
              <td>{{ m.label }}</td>
              <td>{{ m.value | number }} DH</td>
              <td [class]="m.delta >= 0 ? 'up' : 'down'">
                {{ m.delta >= 0 ? '+' : '' }}{{ m.delta | number }} DH
              </td>
            </tr>
          }
        </tbody>
      </table>

      <mat-divider></mat-divider>

      <h2 class="section-title">Tarifs par acte</h2>
      <table class="data-table">
        <thead><tr><th>Acte médical</th><th>Tarif</th></tr></thead>
        <tbody>
          @for (t of tariffs; track t.act) {
            <tr><td>{{ t.act }}</td><td>{{ t.amount }} DH</td></tr>
          }
        </tbody>
      </table>

      <div class="footer">
        Rapport confidentiel — MediSync © {{ year }}
      </div>
    </div>

    <div class="dialog-actions">
      <button mat-button (click)="close()">Fermer</button>
      <button mat-flat-button color="primary" (click)="print()">
        <mat-icon>print</mat-icon> Imprimer / Enregistrer PDF
      </button>
    </div>
  `,
  styles: [`
    .rapport-wrap {
      padding: 28px 32px; max-width: 720px; font-family: 'Roboto', sans-serif;
    }
    .rapport-header {
      display: flex; justify-content: space-between; align-items: flex-start;
      margin-bottom: 20px;
    }
    .brand {
      display: flex; align-items: center; gap: 8px;
      font-size: 20px; font-weight: 700; color: #0d6efd;
      mat-icon { font-size: 26px; width: 26px; height: 26px; }
    }
    .meta {
      display: flex; flex-direction: column; align-items: flex-end;
      font-size: 13px; color: #64748b; gap: 2px;
    }
    .section-title {
      font-size: 15px; font-weight: 600; color: #0f172a;
      margin: 20px 0 12px;
    }
    .kpi-table, .data-table {
      width: 100%; border-collapse: collapse; font-size: 14px;
    }
    .kpi-table td, .data-table td, .data-table th {
      padding: 10px 12px; border-bottom: 1px solid #f1f5f9;
    }
    .data-table th {
      background: #f8fafc; font-weight: 600; color: #475569;
      text-align: left;
    }
    .kpi-table td:first-child { color: #475569; }
    .val { font-weight: 700; color: #0f172a; text-align: right; }
    .val.warn { color: #b91c1c; }
    .badge {
      font-size: 12px; font-weight: 600; border-radius: 20px;
      padding: 3px 10px; text-align: center; white-space: nowrap;
      &.up { background: #dcfce7; color: #16a34a; }
      &.down { background: #fee2e2; color: #b91c1c; }
      &.neutral { background: #f1f5f9; color: #475569; }
    }
    .up { color: #16a34a; }
    .down { color: #b91c1c; }
    .footer {
      margin-top: 28px; text-align: center;
      font-size: 12px; color: #94a3b8;
    }
    .dialog-actions {
      display: flex; justify-content: flex-end; gap: 8px;
      padding: 12px 24px 20px;
    }
    @media print {
      .dialog-actions { display: none; }
      .rapport-wrap { padding: 0; }
    }
  `]
})
export class RapportDialogComponent {
  private readonly ref = inject(MatDialogRef<RapportDialogComponent>);

  today = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
  year = new Date().getFullYear();

  months = [
    { label: 'Janvier',  value: 62000, delta: 0 },
    { label: 'Février',  value: 68000, delta: 6000 },
    { label: 'Mars',     value: 71000, delta: 3000 },
    { label: 'Avril',    value: 73500, delta: 2500 },
    { label: 'Mai',      value: 82350, delta: 8850 },
    { label: 'Juin',     value: 41200, delta: -41150 }
  ];

  tariffs = [
    { act: 'Consultation générale',    amount: 300 },
    { act: 'Consultation spécialisée', amount: 450 },
    { act: 'Suivi médical',            amount: 200 },
    { act: 'Acte de petite chirurgie', amount: 800 },
    { act: 'Bilan complet',            amount: 1200 }
  ];

  close(): void { this.ref.close(); }

  print(): void { window.print(); }
}

// ── Finance Page ──────────────────────────────────────────────────────────────
@Component({
  selector: 'app-finance',
  standalone: true,
  imports: [
    CommonModule, MatCardModule, MatButtonModule, MatIconModule,
    MatChipsModule, MatDialogModule, MatSnackBarModule, PageHeaderComponent
  ],
  template: `
    <div class="page">
      <app-page-header
        eyebrow="Finance"
        icon="payments"
        title="Gestion financière"
        subtitle="Encaissements, impayés et rapports."
      >
        <button mat-stroked-button (click)="exportPdf()">
          <mat-icon>download</mat-icon>
          Exporter
        </button>
        <button mat-flat-button color="primary" (click)="openRapport()">
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
            @for (t of tariffs(); track t.act) {
              <li>
                <span>{{ t.act }}</span>
                <strong>{{ t.amount }} DH</strong>
              </li>
            }
          </ul>
          <button mat-stroked-button class="full" (click)="openTariffs()">
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
      height: 240px; padding-top: 16px;
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
        padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-size: 14px;
        &:last-child { border-bottom: none; }
        span { color: #475569; }
      }
    }
    .full { width: 100%; }
    @media print {
      :host { display: block; }
      .page { padding: 0; max-width: 100%; }
      .bar { animation: none; }
      .chart-card, .rates, .kpi { box-shadow: none; border: 1px solid #e2e8f0; }
    }
  `]
})
export class FinanceComponent {
  private readonly dialog = inject(MatDialog);
  private readonly snack = inject(MatSnackBar);

  exportPdf(): void {
    window.print();
  }

  openRapport(): void {
    this.dialog.open(RapportDialogComponent, {
      width: '780px',
      maxHeight: '90vh',
      panelClass: 'rapport-dialog'
    });
  }

  openTariffs(): void {
    const ref = this.dialog.open(TariffsDialogComponent, {
      data: this.tariffs(),
      width: '500px'
    });
    ref.afterClosed().subscribe((result: Tariff[] | undefined) => {
      if (result) {
        this.tariffs.set(result);
        this.snack.open('Tarifs mis à jour.', 'OK', { duration: 2500 });
      }
    });
  }

  months = [
    { label: 'Jan', value: 62000 },
    { label: 'Fév', value: 68000 },
    { label: 'Mar', value: 71000 },
    { label: 'Avr', value: 73500 },
    { label: 'Mai', value: 82350 },
    { label: 'Juin', value: 82350 }
  ];
  maxRevenue = Math.max(...this.months.map(m => m.value));

  tariffs = signal<Tariff[]>([
    { act: 'Consultation générale',    amount: 300 },
    { act: 'Consultation spécialisée', amount: 450 },
    { act: 'Suivi médical',            amount: 200 },
    { act: 'Acte de petite chirurgie', amount: 800 },
    { act: 'Bilan complet',            amount: 1200 }
  ]);
}
