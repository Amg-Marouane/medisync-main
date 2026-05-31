import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { PageHeaderComponent } from '../../../shared/components/page-header.component';
import { AuthService } from '../../../core/services/auth.service';
import { AdminService } from '../../../core/services/admin.service';
import { TwoFactorSetupResponse } from '../../../core/models/user.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatCardModule, MatButtonModule,
    MatIconModule, MatFormFieldModule, MatInputModule, MatDividerModule,
    MatProgressSpinnerModule, MatSnackBarModule, PageHeaderComponent
  ],
  template: `
    <div class="page">
      <app-page-header eyebrow="Mon compte" icon="person" title="Profil"
        subtitle="Gérez vos informations personnelles et la sécurité de votre compte."
      ></app-page-header>

      <div class="profile-grid">
        <!-- Informations -->
        <mat-card class="avatar-card">
          <div class="avatar">{{ initials() }}</div>
          <h3>{{ user()?.firstName }} {{ user()?.lastName }}</h3>
          <p>{{ user()?.email }}</p>
        </mat-card>

        <mat-card class="form-card">
          <h3>Informations personnelles</h3>
          <form [formGroup]="form" (ngSubmit)="save()" class="form">
            <div class="row">
              <mat-form-field appearance="outline">
                <mat-label>Prénom</mat-label>
                <input matInput formControlName="firstName" />
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Nom</mat-label>
                <input matInput formControlName="lastName" />
              </mat-form-field>
            </div>
            <mat-form-field appearance="outline" class="full">
              <mat-label>Email</mat-label>
              <input matInput type="email" formControlName="email" readonly />
              <mat-icon matSuffix>email</mat-icon>
            </mat-form-field>
            <mat-form-field appearance="outline" class="full">
              <mat-label>Téléphone</mat-label>
              <input matInput formControlName="phone" />
              <mat-icon matSuffix>phone</mat-icon>
            </mat-form-field>
            <div class="form-actions">
              <button mat-flat-button color="primary" type="submit">
                <mat-icon>save</mat-icon> Enregistrer
              </button>
            </div>
          </form>
        </mat-card>

        <!-- Sécurité & 2FA -->
        <mat-card class="security-card">
          <h3><mat-icon>security</mat-icon> Authentification à deux facteurs</h3>

          @if (!setupData() && !twoFactorEnabled()) {
            <p class="desc">Protégez votre compte avec une application TOTP (Google Authenticator, Authy…).</p>
            <button mat-flat-button color="primary" (click)="startSetup()" [disabled]="setupLoading()">
              @if (setupLoading()) { <mat-spinner diameter="18"></mat-spinner> }
              @else { <mat-icon>add_moderator</mat-icon> }
              Activer la 2FA
            </button>
          }

          @if (setupData() && !twoFactorEnabled()) {
            <div class="qr-section">
              <p>Scannez ce QR code avec votre application :</p>
              <img [src]="setupData()!.qrDataUri" alt="QR code 2FA" class="qr-img" />
              <p class="secret-hint">Clé manuelle : <code>{{ setupData()!.secret }}</code></p>
              <mat-form-field appearance="outline" class="full">
                <mat-label>Code de vérification (6 chiffres)</mat-label>
                <input matInput [formControl]="totpCtrl" maxlength="6" inputmode="numeric" />
              </mat-form-field>
              <div class="form-actions">
                <button mat-stroked-button type="button" (click)="cancelSetup()">Annuler</button>
                <button mat-flat-button color="primary" (click)="enable2FA()" [disabled]="totpCtrl.invalid || verifying()">
                  @if (verifying()) { <mat-spinner diameter="18"></mat-spinner> }
                  @else { <mat-icon>check</mat-icon> }
                  Confirmer
                </button>
              </div>
            </div>
          }

          @if (twoFactorEnabled()) {
            <div class="enabled-badge">
              <mat-icon>verified_user</mat-icon>
              <span>2FA activé — votre compte est protégé.</span>
            </div>
            <mat-form-field appearance="outline" class="full" style="margin-top:16px">
              <mat-label>Code pour désactiver</mat-label>
              <input matInput [formControl]="totpCtrl" maxlength="6" inputmode="numeric" />
            </mat-form-field>
            <button mat-stroked-button color="warn" (click)="disable2FA()" [disabled]="totpCtrl.invalid || verifying()">
              <mat-icon>no_encryption</mat-icon> Désactiver la 2FA
            </button>
          }
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .page { padding: 24px; max-width: 1100px; margin: 0 auto; }
    .profile-grid {
      display: grid; grid-template-columns: 280px 1fr; gap: 16px;
      grid-template-rows: auto auto;
      @media (max-width: 768px) { grid-template-columns: 1fr; }
    }
    .avatar-card { padding: 32px; text-align: center; border-radius: 16px; height: fit-content; }
    .avatar {
      width: 100px; height: 100px; border-radius: 50%;
      background: linear-gradient(135deg, #0d6efd, #10b981);
      color: white; display: flex; align-items: center; justify-content: center;
      font-size: 36px; font-weight: 700; margin: 0 auto 16px;
    }
    .avatar-card h3 { margin: 0; }
    .avatar-card p { color: #64748b; margin: 4px 0 0; font-size: 14px; }
    .form-card, .security-card { padding: 24px; border-radius: 16px; }
    .security-card {
      grid-column: 1 / -1;
      h3 { display: flex; align-items: center; gap: 8px; margin: 0 0 16px; }
    }
    h3 { margin: 0 0 16px; font-size: 16px; font-weight: 600; }
    .form { display: flex; flex-direction: column; gap: 12px; }
    .row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .full { width: 100%; }
    .form-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 8px; }
    .desc { color: #64748b; font-size: 14px; margin: 0 0 16px; }
    .qr-section { display: flex; flex-direction: column; gap: 8px; max-width: 400px; }
    .qr-img { width: 200px; height: 200px; border-radius: 12px; border: 1px solid #e2e8f0; }
    .secret-hint { font-size: 13px; color: #64748b; code { background: #f1f5f9; padding: 2px 6px; border-radius: 4px; } }
    .enabled-badge {
      display: flex; align-items: center; gap: 10px;
      background: #d1fae5; color: #065f46; padding: 12px 16px;
      border-radius: 12px; font-size: 14px; font-weight: 500;
      mat-icon { color: #16a34a; }
    }
  `]
})
export class ProfileComponent {
  private readonly auth = inject(AuthService);
  private readonly adminSvc = inject(AdminService);
  private readonly fb = inject(FormBuilder);
  private readonly snack = inject(MatSnackBar);

  readonly user = this.auth.user;
  readonly setupData = signal<TwoFactorSetupResponse | null>(null);
  readonly twoFactorEnabled = signal(false);
  readonly setupLoading = signal(false);
  readonly verifying = signal(false);

  readonly totpCtrl = this.fb.nonNullable.control('', [
    Validators.required, Validators.pattern(/^\d{6}$/)
  ]);

  readonly initials = () => {
    const u = this.user();
    if (!u) return '?';
    return `${u.firstName?.[0] ?? ''}${u.lastName?.[0] ?? ''}`.toUpperCase();
  };

  readonly form = this.fb.nonNullable.group({
    firstName: [this.user()?.firstName ?? '', Validators.required],
    lastName: [this.user()?.lastName ?? '', Validators.required],
    email: [this.user()?.email ?? ''],
    phone: ['']
  });

  save(): void {
    this.snack.open('Fonctionnalité de mise à jour du profil — bientôt disponible.', 'OK', { duration: 3000 });
  }

  startSetup(): void {
    this.setupLoading.set(true);
    this.adminSvc.setup2FA().subscribe({
      next: (d) => { this.setupData.set(d); this.setupLoading.set(false); },
      error: () => { this.setupLoading.set(false); this.snack.open('Erreur lors de la génération du QR code.', 'OK', { duration: 3000 }); }
    });
  }

  enable2FA(): void {
    this.verifying.set(true);
    this.adminSvc.enable2FA(this.totpCtrl.value).subscribe({
      next: () => {
        this.verifying.set(false);
        this.twoFactorEnabled.set(true);
        this.setupData.set(null);
        this.totpCtrl.reset();
        this.snack.open('2FA activé avec succès !', 'OK', { duration: 3000 });
      },
      error: (err) => {
        this.verifying.set(false);
        this.snack.open(err?.error?.message ?? 'Code invalide.', 'OK', { duration: 3000 });
      }
    });
  }

  disable2FA(): void {
    this.verifying.set(true);
    this.adminSvc.disable2FA(this.totpCtrl.value).subscribe({
      next: () => {
        this.verifying.set(false);
        this.twoFactorEnabled.set(false);
        this.totpCtrl.reset();
        this.snack.open('2FA désactivé.', 'OK', { duration: 3000 });
      },
      error: (err) => {
        this.verifying.set(false);
        this.snack.open(err?.error?.message ?? 'Code invalide.', 'OK', { duration: 3000 });
      }
    });
  }

  cancelSetup(): void {
    this.setupData.set(null);
    this.totpCtrl.reset();
  }
}
