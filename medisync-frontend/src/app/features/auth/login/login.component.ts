import { Component, inject, signal, AfterViewInit, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../core/services/auth.service';
import { LogoComponent } from '../../../shared/components/logo.component';
import { environment } from '../../../../environments/environment';

declare var google: any;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterLink,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule, LogoComponent
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements AfterViewInit {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly ngZone = inject(NgZone);

  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly hidePassword = signal(true);
  readonly requiresTwoFactor = signal(false);
  readonly pendingEmail = signal('');
  readonly pendingPassword = signal('');

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]]
  });

  readonly totpForm = this.fb.nonNullable.group({
    totpCode: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]]
  });

  ngAfterViewInit(): void {
    this.initGoogleSignIn();
  }

  private initGoogleSignIn(): void {
    if (this.requiresTwoFactor()) return;
    
    // Check if google is loaded and element is present
    setTimeout(() => {
      const btnEl = document.getElementById('google-login-btn');
      if (typeof google !== 'undefined' && btnEl) {
        google.accounts.id.initialize({
          client_id: environment.googleClientId,
          callback: this.handleGoogleResponse.bind(this)
        });
        google.accounts.id.renderButton(
          btnEl,
          { theme: 'outline', size: 'large', width: btnEl.parentElement?.clientWidth || 370 }
        );
      }
    }, 100);
  }

  private handleGoogleResponse(response: any): void {
    this.ngZone.run(() => {
      this.loading.set(true);
      this.errorMessage.set(null);
      this.auth.googleLogin(response.credential).subscribe({
        next: () => {
          this.loading.set(false);
          this.auth.redirectToHome();
        },
        error: (err) => {
          this.loading.set(false);
          this.errorMessage.set(err?.error?.message ?? 'Échec de l\'authentification Google.');
        }
      });
    });
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);
    this.errorMessage.set(null);
    const { email, password } = this.form.getRawValue();
    this.auth.login({ email, password }).subscribe({
      next: (res) => {
        this.loading.set(false);
        if (res.requiresTwoFactor) {
          this.pendingEmail.set(email);
          this.pendingPassword.set(password);
          this.requiresTwoFactor.set(true);
        } else {
          this.auth.redirectToHome();
        }
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err?.error?.message ?? 'Identifiants invalides. Veuillez réessayer.');
      }
    });
  }

  submitTotp(): void {
    if (this.totpForm.invalid) { this.totpForm.markAllAsTouched(); return; }
    this.loading.set(true);
    this.errorMessage.set(null);
    this.auth.login({
      email: this.pendingEmail(),
      password: this.pendingPassword(),
      totpCode: this.totpForm.getRawValue().totpCode
    }).subscribe({
      next: () => { this.loading.set(false); this.auth.redirectToHome(); },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err?.error?.message ?? 'Code invalide. Réessayez.');
      }
    });
  }

  togglePassword(): void { this.hidePassword.update((v) => !v); }

  goBack(): void {
    this.requiresTwoFactor.set(false);
    this.initGoogleSignIn();
  }
}
