import { Component, inject, signal, AfterViewInit, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators
} from '@angular/forms';
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

function strongPassword(control: AbstractControl): ValidationErrors | null {
  const v = control.value as string;
  if (!v) return null;
  const ok =
    v.length >= 8 &&
    /[A-Z]/.test(v) &&
    /[0-9]/.test(v) &&
    /[^A-Za-z0-9]/.test(v);
  return ok ? null : { weak: true };
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    LogoComponent
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent implements AfterViewInit {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly ngZone = inject(NgZone);

  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly hidePassword = signal(true);

  ngAfterViewInit(): void {
    this.initGoogleSignIn();
  }

  private initGoogleSignIn(): void {
    setTimeout(() => {
      const btnEl = document.getElementById('google-register-btn');
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

  readonly form = this.fb.nonNullable.group({
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    lastName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    socialSecurityNumber: [''],
    password: ['', [Validators.required, strongPassword]]
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    this.errorMessage.set(null);
    const { firstName, lastName, email, phone, socialSecurityNumber, password } = this.form.getRawValue();
    this.auth.register({
      firstName,
      lastName,
      email,
      phone: phone || undefined,
      socialSecurityNumber: socialSecurityNumber || undefined,
      password
    }).subscribe({
      next: () => {
        this.loading.set(false);
        this.auth.redirectToHome();
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(
          err?.error?.message ?? "Erreur lors de l'inscription. Réessayez."
        );
      }
    });
  }

  togglePassword(): void {
    this.hidePassword.update((v) => !v);
  }
}
