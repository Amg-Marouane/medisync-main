import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { PageHeaderComponent } from '../../../shared/components/page-header.component';
import { BillingService, Invoice, InvoiceStatus } from '../../../core/services/billing.service';

@Component({
  selector: 'app-billing',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatSnackBarModule,
    PageHeaderComponent
  ],
  template: `
    <div class="page">
      <app-page-header
        eyebrow="Facturation"
        icon="receipt"
        title="Factures"
        subtitle="Emissions, paiements et impayes."
      >
        <a mat-stroked-button routerLink="/secretary/billing/care-sheet">
          <mat-icon>assignment</mat-icon>
          Feuille de soins
        </a>
        <a mat-flat-button color="primary" routerLink="/secretary/billing/new">
          <mat-icon>add</mat-icon>
          Nouvelle facture
        </a>
      </app-page-header>

      <div class="kpis">
        <mat-card class="kpi">
          <mat-icon>payments</mat-icon>
          <div><strong>{{ totalPaid() }} DH</strong><span>Encaisse ce mois</span></div>
        </mat-card>
        <mat-card class="kpi">
          <mat-icon>schedule</mat-icon>
          <div><strong>{{ totalPending() }} DH</strong><span>En attente</span></div>
        </mat-card>
        <mat-card class="kpi warn">
          <mat-icon>warning</mat-icon>
          <div><strong>{{ totalOverdue() }} DH</strong><span>Impayes</span></div>
        </mat-card>
      </div>

      <div class="list">
        @for (i of invoices(); track i.id) {
          <mat-card class="row" [class]="'status-' + i.status">
            <div class="invoice-id">
              <mat-icon>description</mat-icon>
              <div>
                <strong>{{ i.id }}</strong>
                <span>{{ i.date }}</span>
              </div>
            </div>
            <div class="patient">{{ i.patient }}</div>
            <div class="amount">
              <strong>{{ i.amount }} DH</strong>
              <span>{{ i.service }}</span>
            </div>
            <mat-chip [class]="'chip-' + i.status">{{ statusLabel(i.status) }}</mat-chip>
            <div class="actions-row">
              <button mat-stroked-button type="button" (click)="downloadPdf(i)">
                <mat-icon>download</mat-icon>
                PDF
              </button>
              <button mat-stroked-button type="button" (click)="sendEmail(i)">
                <mat-icon>mail</mat-icon>
                Email
              </button>
              @if (i.status !== 'paid') {
                <button mat-flat-button color="primary" type="button" (click)="markAsPaid(i.id)">Encaisser</button>
              }
            </div>
          </mat-card>
        }
      </div>
    </div>
  `,
  styles: [`\n    .page { padding: 24px; max-width: 1200px; margin: 0 auto; }\n    .form-card { padding: 24px; border-radius: 16px; margin-bottom: 20px; }\n    .form-card h3 { display: flex; align-items: center; gap: 8px; margin: 0 0 20px; color: #0d6efd; }\n    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }\n    .form-grid mat-form-field { width: 100%; }\n    .actions { grid-column: 1 / -1; display: flex; justify-content: flex-end; gap: 8px; }\n    .kpis {\n      display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;\n      margin-bottom: 24px;\n      @media (max-width: 768px) { grid-template-columns: 1fr; }\n    }\n    .kpi {\n      display: flex; align-items: center; gap: 16px;\n      padding: 20px; border-radius: 14px;\n      mat-icon {\n        color: #0d6efd; background: #e0f2fe;\n        padding: 12px; border-radius: 12px;\n        font-size: 24px; width: 24px; height: 24px;\n      }\n      &.warn mat-icon { color: #b91c1c; background: #fee2e2; }\n      strong { display: block; font-size: 22px; font-weight: 700; }\n      span { color: #64748b; font-size: 13px; }\n    }\n    .list { display: flex; flex-direction: column; gap: 8px; }\n    .row {\n      display: grid;\n      grid-template-columns: 1.4fr 1.2fr 100px 110px auto;\n      gap: 16px;\n      align-items: center;\n      padding: 16px 20px;\n      border-radius: 12px;\n      border-left: 4px solid #cbd5e1;\n      &.status-paid { border-left-color: #10b981; }\n      &.status-pending { border-left-color: #f59e0b; }\n      &.status-overdue { border-left-color: #ef4444; }\n      @media (max-width: 900px) { grid-template-columns: 1fr; }\n    }\n    .invoice-id {\n      display: flex; align-items: center; gap: 12px;\n      mat-icon {\n        color: #64748b; background: #f1f5f9;\n        padding: 8px; border-radius: 10px;\n        font-size: 20px; width: 20px; height: 20px;\n      }\n      strong { display: block; font-size: 14px; }\n      span { color: #64748b; font-size: 12px; }\n    }\n    .patient { font-weight: 500; }\n    .amount { font-weight: 700; color: #0f172a; }\n    .actions-row { display: flex; gap: 8px; justify-content: flex-end; }\n    mat-chip {\n      font-size: 12px !important; font-weight: 600 !important;\n      &.chip-paid { background: #d1fae5 !important; color: #065f46 !important; }\n      &.chip-pending { background: #fef3c7 !important; color: #92400e !important; }\n      &.chip-overdue { background: #fee2e2 !important; color: #991b1b !important; }\n    }\n    @media (max-width: 700px) {\n      .form-grid { grid-template-columns: 1fr; }\n      .actions { flex-direction: column-reverse; }\n      .actions button { width: 100%; }\n      .actions-row { flex-direction: column; }\n      .actions-row button { width: 100%; }\n    }\n  `]
})
export class BillingComponent {
  private readonly billing = inject(BillingService);
  private readonly snack = inject(MatSnackBar);

  readonly invoices = this.billing.invoices;

  readonly totalPaid = computed(() =>
    this.invoices().filter((i) => i.status === 'paid').reduce((s, i) => s + i.amount, 0)
  );
  readonly totalPending = computed(() =>
    this.invoices().filter((i) => i.status === 'pending').reduce((s, i) => s + i.amount, 0)
  );
  readonly totalOverdue = computed(() =>
    this.invoices().filter((i) => i.status === 'overdue').reduce((s, i) => s + i.amount, 0)
  );

  markAsPaid(id: string): void {
    this.billing.markAsPaid(id);
    this.snack.open('Facture encaissee.', 'OK', { duration: 2500 });
  }

  downloadPdf(invoice: Invoice): void {
    const html = [
      'MEDISYNC - FACTURE',
      `Numero: ${invoice.id}`,
      `Patient: ${invoice.patient}`,
      `Prestation: ${invoice.service}`,
      `Date: ${invoice.date}`,
      `Mode de paiement: ${invoice.paymentMethod}`,
      `Montant: ${invoice.amount} DH`,
      `Statut: ${this.statusLabel(invoice.status)}`,
      `Notes: ${invoice.notes || '-'}`
    ].join('\n');
    const blob = new Blob([html], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${invoice.id}.pdf`;
    link.click();
    URL.revokeObjectURL(url);
    this.snack.open(`PDF ${invoice.id} telecharge.`, 'OK', { duration: 2500 });
  }

  sendEmail(invoice: Invoice): void {
    const subject = encodeURIComponent(`Facture ${invoice.id}`);
    const body = encodeURIComponent(
      `Bonjour,\n\nVeuillez trouver les informations de la facture ${invoice.id}.\nPatient: ${invoice.patient}\nMontant: ${invoice.amount} DH\nStatut: ${this.statusLabel(invoice.status)}\n\nCordialement,\nMediSync`
    );
    window.location.href = `mailto:${invoice.patientEmail}?subject=${subject}&body=${body}`;
    this.snack.open('Email de facture prepare.', 'OK', { duration: 2500 });
  }

  statusLabel(s: InvoiceStatus): string {
    return this.billing.statusLabel(s);
  }

}
