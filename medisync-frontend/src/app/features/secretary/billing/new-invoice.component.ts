import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { BillingService } from '../../../core/services/billing.service';

type InvoiceStatus = 'paid' | 'pending' | 'overdue';

@Component({
  selector: 'app-secretary-new-invoice',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatSnackBarModule
  ],
  template: `
    <div class="page">
      <div class="topbar">
        <a mat-stroked-button routerLink="/secretary/billing">
          <mat-icon>arrow_back</mat-icon>
          Retour
        </a>
      </div>

      <mat-card class="panel">
        <div class="hero">
          <mat-icon>receipt_long</mat-icon>
          <div>
            <h1>Nouvelle facture</h1>
            <p>Creer une facture pour un patient.</p>
          </div>
        </div>

        <form [formGroup]="form" (ngSubmit)="submit()" class="form">
          <mat-form-field appearance="outline">
            <mat-label>Patient</mat-label>
            <input matInput formControlName="patient" placeholder="Nom complet du patient" />
            @if (form.controls.patient.touched && form.controls.patient.invalid) {
              <mat-error>Patient obligatoire</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Email du patient</mat-label>
            <input matInput type="email" formControlName="patientEmail" placeholder="patient@email.com" />
            @if (form.controls.patientEmail.touched && form.controls.patientEmail.invalid) {
              <mat-error>Email obligatoire</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Prestation</mat-label>
            <mat-select formControlName="service">
              <mat-option value="Consultation generale">Consultation generale</mat-option>
              <mat-option value="Controle medical">Controle medical</mat-option>
              <mat-option value="Analyse">Analyse</mat-option>
              <mat-option value="Soin infirmier">Soin infirmier</mat-option>
              <mat-option value="Autre">Autre</mat-option>
            </mat-select>
            @if (form.controls.service.touched && form.controls.service.invalid) {
              <mat-error>Prestation obligatoire</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Montant</mat-label>
            <input matInput type="number" min="1" formControlName="amount" />
            <span matTextSuffix>DH</span>
            @if (form.controls.amount.touched && form.controls.amount.invalid) {
              <mat-error>Montant obligatoire</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Date</mat-label>
            <input matInput type="date" formControlName="date" />
            @if (form.controls.date.touched && form.controls.date.invalid) {
              <mat-error>Date obligatoire</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Mode de paiement</mat-label>
            <mat-select formControlName="paymentMethod">
              <mat-option value="Especes">Especes</mat-option>
              <mat-option value="Carte bancaire">Carte bancaire</mat-option>
              <mat-option value="Virement">Virement</mat-option>
              <mat-option value="Assurance">Assurance</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Statut</mat-label>
            <mat-select formControlName="status">
              <mat-option value="paid">Payee</mat-option>
              <mat-option value="pending">En attente</mat-option>
              <mat-option value="overdue">En retard</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full">
            <mat-label>Notes</mat-label>
            <textarea matInput rows="4" formControlName="notes" placeholder="Details, numero de dossier ou remarques"></textarea>
          </mat-form-field>

          @if (successMessage()) {
            <div class="alert success">
              <mat-icon>check_circle</mat-icon>
              <span>{{ successMessage() }}</span>
            </div>
          }

          <div class="actions">
            <button mat-stroked-button type="button" routerLink="/secretary/billing">Annuler</button>
            <button mat-flat-button color="primary" type="submit" [disabled]="loading()">
              @if (loading()) { <mat-spinner diameter="18"></mat-spinner> }
              @else { <mat-icon>save</mat-icon> }
              Creer la facture
            </button>
          </div>
        </form>
      </mat-card>
    </div>
  `,
  styles: [`
    .page { padding: 24px; max-width: 960px; margin: 0 auto; }
    .topbar { display: flex; justify-content: flex-start; margin-bottom: 16px; }
    .panel { padding: 24px; border-radius: 8px; }
    .hero { display: flex; gap: 12px; align-items: center; margin-bottom: 24px; }
    .hero mat-icon { font-size: 36px; width: 36px; height: 36px; color: #0d6efd; }
    .hero h1 { margin: 0; font-size: 24px; }
    .hero p { margin: 4px 0 0; color: #64748b; }
    .form { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .form mat-form-field { width: 100%; }
    .full, .alert, .actions { grid-column: 1 / -1; }
    .alert {
      display: flex;
      align-items: center;
      gap: 8px;
      border-radius: 8px;
      padding: 12px 14px;
    }
    .alert.success { background: #d1fae5; color: #065f46; }
    .actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 8px; }
    @media (max-width: 700px) {
      .form { grid-template-columns: 1fr; }
      .actions { flex-direction: column-reverse; }
      .actions button { width: 100%; }
    }
  `]
})
export class NewInvoiceComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly snack = inject(MatSnackBar);
  private readonly billing = inject(BillingService);

  readonly loading = signal(false);
  readonly successMessage = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    patient: ['', [Validators.required, Validators.minLength(2)]],
    patientEmail: ['', [Validators.required, Validators.email]],
    service: ['Consultation generale', Validators.required],
    amount: [300, [Validators.required, Validators.min(1)]],
    date: [this.today(), Validators.required],
    paymentMethod: ['Especes', Validators.required],
    status: ['pending' as InvoiceStatus, Validators.required],
    notes: ['']
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    this.loading.set(true);

    window.setTimeout(() => {
      this.billing.addInvoice({
        patient: value.patient.trim(),
        patientEmail: value.patientEmail.trim(),
        service: value.service,
        amount: Number(value.amount),
        date: this.formatDate(value.date),
        paymentMethod: value.paymentMethod,
        notes: value.notes.trim(),
        status: value.status
      });
      this.loading.set(false);
      this.successMessage.set(`Facture creee pour ${value.patient}.`);
      this.snack.open('Facture creee avec succes.', 'OK', { duration: 2500 });
      this.router.navigate(['/secretary/billing']);
    }, 400);
  }

  private today(): string {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  private formatDate(value: string): string {
    const date = new Date(value);
    return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'short' }).format(date);
  }
}
