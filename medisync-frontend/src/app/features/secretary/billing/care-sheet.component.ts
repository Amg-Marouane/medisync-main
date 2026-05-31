import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

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
            <p>Saisir les actes realises pour la facturation.</p>
          </div>
        </div>

        <form [formGroup]="sheetForm" class="sheet-grid">
          <mat-form-field appearance="outline">
            <mat-label>Patient</mat-label>
            <input matInput formControlName="patient" placeholder="Nom complet" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Medecin</mat-label>
            <input matInput formControlName="doctor" placeholder="Dr ..." />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Date</mat-label>
            <input matInput type="date" formControlName="date" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Assurance</mat-label>
            <input matInput formControlName="insurance" placeholder="CNSS, CNOPS, privee..." />
          </mat-form-field>
        </form>

        <mat-card class="act-card">
          <h3><mat-icon>playlist_add</mat-icon> Ajouter un acte</h3>
          <form [formGroup]="actForm" (ngSubmit)="addAct()" class="act-grid">
            <mat-form-field appearance="outline">
              <mat-label>Acte</mat-label>
              <mat-select formControlName="label">
                <mat-option value="Consultation">Consultation</mat-option>
                <mat-option value="Controle">Controle</mat-option>
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
              <mat-label>Quantite</mat-label>
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
                <span>{{ act.code }} - qte {{ act.quantity }}</span>
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
          <button mat-stroked-button type="button" (click)="emailSheet()" [disabled]="sheetForm.invalid || acts().length === 0">
            <mat-icon>mail</mat-icon>
            Envoyer par email
          </button>
          <button mat-flat-button color="primary" type="button" (click)="downloadSheet()" [disabled]="sheetForm.invalid || acts().length === 0">
            <mat-icon>picture_as_pdf</mat-icon>
            Generer PDF
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
    .sheet-grid, .act-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
    .act-card { margin: 8px 0 16px; background: #f8fafc; }
    .act-card h3 { display: flex; align-items: center; gap: 8px; margin: 0 0 16px; color: #0d6efd; }
    .act-grid button { height: 56px; }
    .acts { display: flex; flex-direction: column; gap: 8px; }
    .act-row {
      display: grid;
      grid-template-columns: 1fr auto auto;
      align-items: center;
      gap: 12px;
      padding: 14px 16px;
      border-radius: 8px;
    }
    .act-row span { display: block; color: #64748b; font-size: 13px; margin-top: 2px; }
    .empty { padding: 18px; color: #64748b; border-radius: 8px; }
    .total {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 18px;
      padding: 16px;
      border-radius: 8px;
      background: #e0f2fe;
      color: #0f172a;
    }
    .total strong { font-size: 22px; }
    .actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 18px; }
    @media (max-width: 900px) {
      .sheet-grid, .act-grid { grid-template-columns: 1fr 1fr; }
    }
    @media (max-width: 640px) {
      .sheet-grid, .act-grid, .act-row { grid-template-columns: 1fr; }
      .actions { flex-direction: column-reverse; }
      .actions button { width: 100%; }
    }
  `]
})
export class CareSheetComponent {
  private readonly fb = inject(FormBuilder);
  private readonly snack = inject(MatSnackBar);

  readonly acts = signal<CareAct[]>([]);
  readonly total = computed(() =>
    this.acts().reduce((sum, act) => sum + act.quantity * act.price, 0)
  );

  readonly sheetForm = this.fb.nonNullable.group({
    patient: ['', Validators.required],
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
    this.download(`${this.sheetTitle()}.pdf`, this.sheetText(), 'PDF feuille de soins genere.');
  }

  emailSheet(): void {
    const subject = encodeURIComponent(this.sheetTitle());
    const body = encodeURIComponent(this.sheetText());
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    this.snack.open('Email de feuille de soins prepare.', 'OK', { duration: 2500 });
  }

  private download(filename: string, content: string, message: string): void {
    const blob = new Blob([content], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
    this.snack.open(message, 'OK', { duration: 2500 });
  }

  private sheetTitle(): string {
    return `Feuille de soins - ${this.sheetForm.controls.patient.value}`;
  }

  private sheetText(): string {
    const sheet = this.sheetForm.getRawValue();
    const lines = this.acts().map((act) =>
      `- ${act.label} (${act.code}) x${act.quantity}: ${act.quantity * act.price} DH`
    );
    return [
      'MEDISYNC - FEUILLE DE SOINS',
      `Patient: ${sheet.patient}`,
      `Medecin: ${sheet.doctor}`,
      `Date: ${sheet.date}`,
      `Assurance: ${sheet.insurance || 'Non renseignee'}`,
      '',
      'Actes realises:',
      ...lines,
      '',
      `Total: ${this.total()} DH`
    ].join('\n');
  }

  private today(): string {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
}
