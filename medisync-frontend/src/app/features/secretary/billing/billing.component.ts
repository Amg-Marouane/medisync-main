import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PageHeaderComponent } from '../../../shared/components/page-header.component';
import { BillingService, Invoice, InvoiceStatus } from '../../../core/services/billing.service';
import { BillingEmailService } from '../../../core/services/billing-email.service';

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
    MatProgressSpinnerModule,
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
              <button mat-stroked-button type="button"
                      [disabled]="sendingId() === i.id"
                      (click)="sendEmail(i)">
                @if (sendingId() === i.id) {
                  <mat-spinner diameter="16"></mat-spinner>
                } @else {
                  <mat-icon>mail</mat-icon>
                }
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
  styles: [`
    .page { padding: 24px; max-width: 1200px; margin: 0 auto; }
    .kpis {
      display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;
      margin-bottom: 24px;
      @media (max-width: 768px) { grid-template-columns: 1fr; }
    }
    .kpi {
      display: flex; align-items: center; gap: 16px;
      padding: 20px; border-radius: 14px;
      mat-icon {
        color: #0d6efd; background: #e0f2fe;
        padding: 12px; border-radius: 12px;
        font-size: 24px; width: 24px; height: 24px;
      }
      &.warn mat-icon { color: #b91c1c; background: #fee2e2; }
      strong { display: block; font-size: 22px; font-weight: 700; }
      span { color: #64748b; font-size: 13px; }
    }
    .list { display: flex; flex-direction: column; gap: 8px; }
    .row {
      display: grid;
      grid-template-columns: 1.4fr 1.2fr 100px 110px auto;
      gap: 16px; align-items: center;
      padding: 16px 20px; border-radius: 12px;
      border-left: 4px solid #cbd5e1;
      &.status-paid    { border-left-color: #10b981; }
      &.status-pending { border-left-color: #f59e0b; }
      &.status-overdue { border-left-color: #ef4444; }
      @media (max-width: 900px) { grid-template-columns: 1fr; }
    }
    .invoice-id {
      display: flex; align-items: center; gap: 12px;
      mat-icon {
        color: #64748b; background: #f1f5f9;
        padding: 8px; border-radius: 10px;
        font-size: 20px; width: 20px; height: 20px;
      }
      strong { display: block; font-size: 14px; }
      span { color: #64748b; font-size: 12px; }
    }
    .patient { font-weight: 500; }
    .amount { font-weight: 700; color: #0f172a; span { display: block; color: #64748b; font-size: 12px; font-weight: 400; } }
    .actions-row { display: flex; gap: 8px; justify-content: flex-end; align-items: center; }
    mat-chip {
      font-size: 12px !important; font-weight: 600 !important;
      &.chip-paid    { background: #d1fae5 !important; color: #065f46 !important; }
      &.chip-pending { background: #fef3c7 !important; color: #92400e !important; }
      &.chip-overdue { background: #fee2e2 !important; color: #991b1b !important; }
    }
    @media (max-width: 700px) {
      .actions-row { flex-direction: column; }
      .actions-row button { width: 100%; }
    }
  `]
})
export class BillingComponent {
  private readonly billing = inject(BillingService);
  private readonly billingEmail = inject(BillingEmailService);
  private readonly snack = inject(MatSnackBar);

  readonly invoices = this.billing.invoices;
  readonly sendingId = signal<string | null>(null);

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
    this.snack.open('Facture encaissée.', 'OK', { duration: 2500 });
  }

  downloadPdf(invoice: Invoice): void {
    const blob = new Blob([this.buildInvoiceHtml(invoice)], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, '_blank', 'width=820,height=700');
    if (!win) {
      this.snack.open('Veuillez autoriser les popups pour générer le PDF.', 'Fermer', { duration: 4000 });
      URL.revokeObjectURL(url);
      return;
    }
    win.addEventListener('load', () => {
      win.focus();
      win.print();
      URL.revokeObjectURL(url);
    });
  }

  sendEmail(invoice: Invoice): void {
    this.sendingId.set(invoice.id);
    this.billingEmail.sendInvoiceEmail({
      toEmail: invoice.patientEmail,
      patientName: invoice.patient,
      invoiceId: invoice.id,
      service: invoice.service,
      amount: invoice.amount,
      date: invoice.date,
      paymentMethod: invoice.paymentMethod,
      notes: invoice.notes ?? ''
    }).subscribe({
      next: () => {
        this.sendingId.set(null);
        this.snack.open(`Email envoyé à ${invoice.patientEmail}.`, 'OK', { duration: 3000 });
      },
      error: () => {
        this.sendingId.set(null);
        // Fallback to mailto if backend not available
        const subject = encodeURIComponent(`Facture ${invoice.id} - MediSync`);
        const body = encodeURIComponent(
          `Bonjour ${invoice.patient},\n\nVoici les détails de votre facture.\n\nNuméro : ${invoice.id}\nPrestation : ${invoice.service}\nDate : ${invoice.date}\nMode de paiement : ${invoice.paymentMethod}\nMontant : ${invoice.amount} DH\n\nCordialement,\nL'équipe MediSync`
        );
        window.open(`mailto:${invoice.patientEmail}?subject=${subject}&body=${body}`, '_blank');
        this.snack.open('Votre client email a été ouvert.', 'OK', { duration: 3000 });
      }
    });
  }

  statusLabel(s: InvoiceStatus): string {
    return this.billing.statusLabel(s);
  }

  private buildInvoiceHtml(i: Invoice): string {
    const statusColors: Record<InvoiceStatus, string> = {
      paid: '#065f46', pending: '#92400e', overdue: '#991b1b'
    };
    const statusBg: Record<InvoiceStatus, string> = {
      paid: '#d1fae5', pending: '#fef3c7', overdue: '#fee2e2'
    };
    return `<!DOCTYPE html>
<html lang="fr"><head><meta charset="UTF-8">
<title>Facture ${i.id}</title>
<style>
  body { font-family: 'Segoe UI', Arial, sans-serif; color: #0f172a; padding: 40px; max-width: 680px; margin: 0 auto; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; }
  .brand { font-size: 22px; font-weight: 700; color: #0d6efd; }
  .brand small { display: block; font-size: 12px; font-weight: 400; color: #64748b; }
  h1 { font-size: 28px; margin: 0 0 4px; }
  .badge { display: inline-block; padding: 4px 14px; border-radius: 20px; font-size: 13px; font-weight: 600;
           background: ${statusBg[i.status]}; color: ${statusColors[i.status]}; }
  .divider { border: none; border-top: 1px solid #e2e8f0; margin: 24px 0; }
  table { width: 100%; border-collapse: collapse; margin-top: 16px; }
  td { padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
  td:first-child { color: #64748b; width: 48%; }
  td:last-child { font-weight: 600; }
  .total-row td { border-bottom: none; font-size: 18px; padding-top: 20px; }
  .footer { margin-top: 40px; font-size: 12px; color: #94a3b8; text-align: center; }
  @media print { body { padding: 20px; } }
</style></head><body>
  <div class="header">
    <div class="brand">🏥 MediSync<small>Clinique MediSync</small></div>
    <div style="text-align:right">
      <h1>${i.id}</h1>
      <span class="badge">${this.statusLabel(i.status)}</span>
    </div>
  </div>
  <hr class="divider">
  <table>
    <tr><td>Patient</td><td>${i.patient}</td></tr>
    <tr><td>Email</td><td>${i.patientEmail}</td></tr>
    <tr><td>Prestation</td><td>${i.service}</td></tr>
    <tr><td>Date</td><td>${i.date}</td></tr>
    <tr><td>Mode de paiement</td><td>${i.paymentMethod}</td></tr>
    ${i.notes ? `<tr><td>Notes</td><td>${i.notes}</td></tr>` : ''}
    <tr class="total-row"><td>Montant total</td><td style="color:#0d6efd;font-size:22px">${i.amount} DH</td></tr>
  </table>
  <div class="footer">MediSync — Document généré le ${new Date().toLocaleDateString('fr-FR')}</div>
</body></html>`;
  }
}
