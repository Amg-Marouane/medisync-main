import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { BillingEmailService } from '../../../core/services/billing-email.service';

interface CareAct {
  label: string;
  code: string;
  quantity: number;
  price: number;
}

@Component({
  selector: 'app-secretary-care-sheet',
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
          <mat-icon>assignment</mat-icon>
          <div>
            <h1>Feuille de soins</h1>
            <p>Saisir les actes réalisés pour la facturation.</p>
          </div>
        </div>

        <form [formGroup]="sheetForm" class="sheet-grid">
          <mat-form-field appearance="outline">
            <mat-label>Patient</mat-label>
            <input matInput formControlName="patient" placeholder="Nom complet" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Email du patient</mat-label>
            <input matInput type="email" formControlName="patientEmail" placeholder="patient@email.com" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Médecin</mat-label>
            <input matInput formControlName="doctor" placeholder="Dr ..." />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Date</mat-label>
            <input matInput type="date" formControlName="date" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Assurance</mat-label>
            <input matInput formControlName="insurance" placeholder="CNSS, CNOPS, privée..." />
          </mat-form-field>
        </form>

        <mat-card class="act-card">
          <h3><mat-icon>playlist_add</mat-icon> Ajouter un acte</h3>
          <form [formGroup]="actForm" (ngSubmit)="addAct()" class="act-grid">
            <mat-form-field appearance="outline">
              <mat-label>Acte</mat-label>
              <mat-select formControlName="label">
                <mat-option value="Consultation">Consultation</mat-option>
                <mat-option value="Contrôle">Contrôle</mat-option>
                <mat-option value="Analyse">Analyse</mat-option>
                <mat-option value="Injection">Injection</mat-option>
                <mat-option value="Pansement">Pansement</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Code</mat-label>
              <input matInput formControlName="code" placeholder="CS, AMI..." />
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Quantité</mat-label>
              <input matInput type="number" min="1" formControlName="quantity" />
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Prix</mat-label>
              <input matInput type="number" min="1" formControlName="price" />
              <span matTextSuffix>DH</span>
            </mat-form-field>

            <button mat-flat-button color="primary" type="submit">
              <mat-icon>add</mat-icon>
              Ajouter
            </button>
          </form>
        </mat-card>

        <div class="acts">
          @for (act of acts(); track act.code + act.label) {
            <mat-card class="act-row">
              <div>
                <strong>{{ act.label }}</strong>
                <span>{{ act.code }} — qté {{ act.quantity }}</span>
              </div>
              <strong>{{ act.quantity * act.price }} DH</strong>
              <button mat-icon-button type="button" (click)="removeAct(act)">
                <mat-icon>delete</mat-icon>
              </button>
            </mat-card>
          } @empty {
            <mat-card class="empty">Aucun acte saisi.</mat-card>
          }
        </div>

        <div class="total">
          <span>Total feuille de soins</span>
          <strong>{{ total() }} DH</strong>
        </div>

        <div class="actions">
          <button mat-stroked-button type="button"
                  [disabled]="sheetForm.invalid || acts().length === 0 || sendingEmail()"
                  (click)="emailSheet()">
            @if (sendingEmail()) {
              <mat-spinner diameter="16"></mat-spinner>
            } @else {
              <mat-icon>mail</mat-icon>
            }
            Envoyer par email
          </button>
          <button mat-flat-button color="primary" type="button"
                  [disabled]="sheetForm.invalid || acts().length === 0"
                  (click)="downloadSheet()">
            <mat-icon>picture_as_pdf</mat-icon>
            Générer PDF
          </button>
        </div>
      </mat-card>
    </div>
  `,
  styles: [`
    .page { padding: 24px; max-width: 1040px; margin: 0 auto; }
    .topbar { display: flex; justify-content: flex-start; margin-bottom: 16px; }
    .panel, .act-card { padding: 24px; border-radius: 8px; }
    .hero { display: flex; gap: 12px; align-items: center; margin-bottom: 24px; }
    .hero mat-icon { font-size: 36px; width: 36px; height: 36px; color: #0d6efd; }
    .hero h1 { margin: 0; font-size: 24px; }
    .hero p { margin: 4px 0 0; color: #64748b; }
    .sheet-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
    .act-grid { display: grid; grid-template-columns: repeat(4, 1fr) auto; gap: 16px; align-items: end; }
    .act-card { margin: 8px 0 16px; background: #f8fafc; }
    .act-card h3 { display: flex; align-items: center; gap: 8px; margin: 0 0 16px; color: #0d6efd; }
    .acts { display: flex; flex-direction: column; gap: 8px; }
    .act-row {
      display: grid; grid-template-columns: 1fr auto auto;
      align-items: center; gap: 12px; padding: 14px 16px; border-radius: 8px;
    }
    .act-row span { display: block; color: #64748b; font-size: 13px; margin-top: 2px; }
    .empty { padding: 18px; color: #64748b; border-radius: 8px; }
    .total {
      display: flex; justify-content: space-between; align-items: center;
      margin-top: 18px; padding: 16px; border-radius: 8px; background: #e0f2fe; color: #0f172a;
    }
    .total strong { font-size: 22px; }
    .actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 18px; align-items: center; }
    @media (max-width: 900px) {
      .sheet-grid { grid-template-columns: 1fr 1fr; }
      .act-grid { grid-template-columns: 1fr 1fr; }
    }
    @media (max-width: 640px) {
      .sheet-grid, .act-row { grid-template-columns: 1fr; }
      .actions { flex-direction: column-reverse; }
      .actions button { width: 100%; }
    }
  `]
})
export class CareSheetComponent {
  private readonly fb = inject(FormBuilder);
  private readonly snack = inject(MatSnackBar);
  private readonly billingEmail = inject(BillingEmailService);

  readonly acts = signal<CareAct[]>([]);
  readonly sendingEmail = signal(false);

  readonly total = computed(() =>
    this.acts().reduce((sum, act) => sum + act.quantity * act.price, 0)
  );

  readonly sheetForm = this.fb.nonNullable.group({
    patient: ['', Validators.required],
    patientEmail: ['', [Validators.required, Validators.email]],
    doctor: ['', Validators.required],
    date: [this.today(), Validators.required],
    insurance: ['']
  });

  readonly actForm = this.fb.nonNullable.group({
    label: ['Consultation', Validators.required],
    code: ['CS', Validators.required],
    quantity: [1, [Validators.required, Validators.min(1)]],
    price: [300, [Validators.required, Validators.min(1)]]
  });

  addAct(): void {
    if (this.actForm.invalid) {
      this.actForm.markAllAsTouched();
      return;
    }
    this.acts.update((acts) => [...acts, this.actForm.getRawValue()]);
    this.actForm.reset({ label: 'Consultation', code: 'CS', quantity: 1, price: 300 });
  }

  removeAct(act: CareAct): void {
    this.acts.update((acts) => acts.filter((item) => item !== act));
  }

  downloadSheet(): void {
    const blob = new Blob([this.buildSheetHtml()], { type: 'text/html;charset=utf-8' });
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

  emailSheet(): void {
    const sheet = this.sheetForm.getRawValue();
    this.sendingEmail.set(true);
    this.billingEmail.sendCareSheetEmail({
      toEmail: sheet.patientEmail,
      patientName: sheet.patient,
      doctorName: sheet.doctor,
      date: sheet.date,
      insurance: sheet.insurance ?? '',
      acts: this.acts()
    }).subscribe({
      next: () => {
        this.sendingEmail.set(false);
        this.snack.open(`Feuille de soins envoyée à ${sheet.patientEmail}.`, 'OK', { duration: 3000 });
      },
      error: () => {
        this.sendingEmail.set(false);
        // Fallback to mailto if backend not available
        const actsLines = this.acts()
          .map(a => `- ${a.label} (${a.code}) x${a.quantity} : ${a.quantity * a.price} DH`)
          .join('\n');
        const subject = encodeURIComponent(`Feuille de soins - MediSync`);
        const body = encodeURIComponent(
          `Bonjour ${sheet.patient},\n\nVoici votre feuille de soins.\n\nMédecin : ${sheet.doctor}\nDate : ${sheet.date}\nAssurance : ${sheet.insurance || 'Non renseignée'}\n\nActes réalisés :\n${actsLines}\n\nTotal : ${this.total()} DH\n\nCordialement,\nL'équipe MediSync`
        );
        window.open(`mailto:${sheet.patientEmail}?subject=${subject}&body=${body}`, '_blank');
        this.snack.open('Votre client email a été ouvert.', 'OK', { duration: 3000 });
      }
    });
  }

  private buildSheetHtml(): string {
    const sheet = this.sheetForm.getRawValue();
    const rows = this.acts().map(a => `
      <tr>
        <td>${a.label}</td>
        <td style="text-align:center">${a.code}</td>
        <td style="text-align:center">${a.quantity}</td>
        <td style="text-align:right">${a.price} DH</td>
        <td style="text-align:right;font-weight:600">${a.quantity * a.price} DH</td>
      </tr>`).join('');

    return `<!DOCTYPE html>
<html lang="fr"><head><meta charset="UTF-8">
<title>Feuille de soins — ${sheet.patient}</title>
<style>
  body { font-family: 'Segoe UI', Arial, sans-serif; color: #0f172a; padding: 40px; max-width: 680px; margin: 0 auto; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 28px; }
  .brand { font-size: 22px; font-weight: 700; color: #0d6efd; }
  .brand small { display: block; font-size: 12px; font-weight: 400; color: #64748b; }
  h1 { font-size: 26px; margin: 0 0 4px; }
  .meta { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 24px; margin-bottom: 24px; }
  .meta-item label { display: block; font-size: 12px; color: #94a3b8; text-transform: uppercase; letter-spacing: .04em; }
  .meta-item span { font-size: 14px; font-weight: 600; }
  hr { border: none; border-top: 1px solid #e2e8f0; margin: 20px 0; }
  table { width: 100%; border-collapse: collapse; font-size: 14px; }
  th { background: #f8fafc; padding: 10px 12px; text-align: left; font-size: 12px; color: #64748b; text-transform: uppercase; }
  td { padding: 10px 12px; border-bottom: 1px solid #f1f5f9; }
  .total-row td { border-top: 2px solid #e2e8f0; border-bottom: none; font-size: 16px; font-weight: 700; padding-top: 14px; }
  .footer { margin-top: 40px; font-size: 12px; color: #94a3b8; text-align: center; }
  @media print { body { padding: 20px; } }
</style></head><body>
  <div class="header">
    <div class="brand">🏥 MediSync<small>Feuille de soins</small></div>
    <div style="text-align:right;color:#64748b;font-size:13px">
      Générée le ${new Date().toLocaleDateString('fr-FR')}
    </div>
  </div>
  <div class="meta">
    <div class="meta-item"><label>Patient</label><span>${sheet.patient}</span></div>
    <div class="meta-item"><label>Médecin</label><span>${sheet.doctor}</span></div>
    <div class="meta-item"><label>Date</label><span>${sheet.date}</span></div>
    <div class="meta-item"><label>Assurance</label><span>${sheet.insurance || 'Non renseignée'}</span></div>
  </div>
  <hr>
  <table>
    <thead>
      <tr>
        <th>Acte</th><th style="text-align:center">Code</th>
        <th style="text-align:center">Qté</th><th style="text-align:right">P.U.</th>
        <th style="text-align:right">Total</th>
      </tr>
    </thead>
    <tbody>
      ${rows}
      <tr class="total-row">
        <td colspan="4" style="text-align:right">TOTAL</td>
        <td style="text-align:right;color:#0d6efd">${this.total()} DH</td>
      </tr>
    </tbody>
  </table>
  <div class="footer">MediSync — Document confidentiel</div>
</body></html>`;
  }

  private today(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }
}
