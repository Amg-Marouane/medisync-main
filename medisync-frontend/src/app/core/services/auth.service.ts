import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  User,
  UserRole
} from '../models/user.model';

const TOKEN_KEY = 'medisync_token';
const USER_KEY = 'medisync_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly userSignal = signal<User | null>(this.loadUser());
  readonly user = this.userSignal.asReadonly();
  readonly isAuthenticated = computed(() => this.userSignal() !== null);
  readonly role = computed(() => this.userSignal()?.role ?? null);

  login(payload: LoginRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/auth/login`, payload)
      .pipe(tap((res) => this.persist(res)));
  }

  register(payload: RegisterRequest): Observable<AuthResponse> {
    const body = { ...payload, role: payload.role ?? 'PATIENT' };
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/auth/register`, body)
      .pipe(tap((res) => this.persist(res)));
  }

  googleLogin(credential: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/auth/google`, { credential })
      .pipe(tap((res) => this.persist(res)));
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.userSignal.set(null);
    this.router.navigate(['/auth/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  hasRole(role: UserRole): boolean {
    return this.userSignal()?.role === role;
  }

  redirectToHome(): void {
    const r = this.role();
    if (!r) {
      this.router.navigate(['/auth/login']);
      return;
    }
    this.router.navigate([`/${r}`]);
  }

  private persist(res: AuthResponse): void {
    if (!res.token || res.requiresTwoFactor) return;
    localStorage.setItem(TOKEN_KEY, res.token);
    localStorage.setItem(USER_KEY, JSON.stringify(res.user));
    this.userSignal.set(res.user);
  }

  private loadUser(): User | null {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  }
}
