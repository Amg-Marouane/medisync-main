import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { environment } from '../../../../environments/environment';

function strongPassword(value: string): boolean {
  return (
    value.length >= 8 &&
    /[A-Z]/.test(value) &&
    /[0-9]/.test(value) &&
    /[^A-Za-z0-9]/.test(value)
  );
}

@Component({
  selector: 'app-secretary-new-patient',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  template: `
    <div class="page">
      <div class="topbar">
        <a mat-stroked-button routerLink="/secretary/dashboard">
          <mat-icon>arrow_back</mat-icon>
          Retour
        </a>
      </div>

      <mat-card class="panel">
        <div class="hero">
          <mat-icon>person_add</mat-icon>
          <div>
            <h1>Nouveau patient</h1>
            <p>Créer un compte patient avec un mot de passe temporaire.</p>
          </div>
        </div>

        <form [formGroup]="form" (ngSubmit)="submit()" class="form">
          <mat-form-field appearance="outline">
            <mat-label>Prénom</mat-label>
            <input matInput formControlName="firstName" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Nom</mat-label>
            <input matInput formControlName="lastName" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Email</mat-label>
            <input matInput type="email" formControlName="email" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Téléphone</mat-label>
            <input matInput formControlName="phone" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Numéro de sécurité sociale</mat-label>
            <input matInput formControlName="socialSecurityNumber" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Mot de passe temporaire</mat-label>
            <input matInput type="password" formControlName="password" />
            <mat-hint>Au moins 8 caractères, 1 majuscule, 1 chiffre, 1 spécial.</mat-hint>
            @if (form.controls.password.touched && form.controls.password.invalid) {
              <mat-error>Mot de passe invalide</mat-error>
            }
          </mat-form-field>

          @if (errorMessage()) {
            <div class="alert error">
              <mat-icon>error</mat-icon>
              <span>{{ errorMessage() }}</span>
            </div>
          }

          @if (successMessage()) {
            <div class="alert success">
              <mat-icon>check_circle</mat-icon>
              <span>{{ successMessage() }}</span>
            </div>
          }

          <div class="actions">
            <button mat-stroked-button type="button" routerLink="/secretary/dashboard">Annuler</button>
            <button mat-flat-button color="primary" type="submit" [disabled]="loading()">
              @if (loading()) { <mat-spinner diameter="18"></mat-spinner> }
              @else { <mat-icon>save</mat-icon> }
              Créer le patient
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
    .actions { grid-column: 1 / -1; display: flex; justify-content: flex-end; gap: 8px; margin-top: 8px; }
    .alert {
      grid-column: 1 / -1;
      display: flex; align-items: center; gap: 8px;
      border-radius: 8px; padding: 12px 14px;
    }
    .alert.error { background: #fee2e2; color: #991b1b; }
    .alert.success { background: #d1fae5; color: #065f46; }
    @media (max-width: 700px) {
      .form { grid-template-columns: 1fr; }
      .actions { flex-direction: column-reverse; }
      .actions button { width: 100%; }
    }
  `]
})
export class NewPatientComponent {
  private readonly http = inject(HttpClient);
  private readonly fb = inject(FormBuilder);
  private readonly snack = inject(MatSnackBar);

  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    lastName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    socialSecurityNumber: [''],
    password: ['Patient@1234', [Validators.required]]
  });

  submit(): void {
    if (this.form.invalid || !strongPassword(this.form.controls.password.value)) {
      this.form.markAllAsTouched();
      this.errorMessage.set('Veuillez renseigner un mot de passe temporaire valide.');
      return;
    }
    this.loading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const value = this.form.getRawValue();
    this.http.post(`${environment.apiUrl}/auth/register`, {
      firstName: value.firstName,
      lastName: value.lastName,
      email: value.email,
      phone: value.phone || undefined,
      socialSecurityNumber: value.socialSecurityNumber || undefined,
      password: value.password,
      role: 'PATIENT'
    }).subscribe({
      next: () => {
        this.loading.set(false);
        this.successMessage.set(`Patient créé. Mot de passe temporaire: ${value.password}`);
        this.snack.open('Patient créé avec succès.', 'OK', { duration: 3000 });
        this.form.reset({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          socialSecurityNumber: '',
          password: 'Patient@1234'
        });
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err?.error?.message ?? 'Erreur lors de la création du patient.');
      }
    });
  }
}
