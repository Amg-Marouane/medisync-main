import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/user.model';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.isAuthenticated()) return true;
  router.navigate(['/auth/login']);
  return false;
};

export const roleGuard = (allowed: UserRole[]): CanActivateFn => {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);
    if (!auth.isAuthenticated()) {
      router.navigate(['/auth/login']);
      return false;
    }
    const role = auth.role();
    if (role && allowed.includes(role)) return true;
    auth.redirectToHome();
    return false;
  };
};

export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  if (!auth.isAuthenticated()) return true;
  auth.redirectToHome();
  return false;
};
