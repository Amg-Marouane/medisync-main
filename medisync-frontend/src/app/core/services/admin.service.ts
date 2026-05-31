import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AdminUserRequest,
  AuditLogDto,
  DashboardStats,
  TwoFactorSetupResponse,
  User
} from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/admin`;

  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.base}/dashboard`);
  }

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.base}/users`);
  }

  createUser(req: AdminUserRequest): Observable<User> {
    return this.http.post<User>(`${this.base}/users`, req);
  }

  updateUser(id: number, req: AdminUserRequest): Observable<User> {
    return this.http.patch<User>(`${this.base}/users/${id}`, req);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/users/${id}`);
  }

  getAuditLogs(page = 0, size = 50): Observable<AuditLogDto[]> {
    return this.http.get<AuditLogDto[]>(`${this.base}/audit`, { params: { page, size } });
  }

  setup2FA(): Observable<TwoFactorSetupResponse> {
    return this.http.post<TwoFactorSetupResponse>(`${environment.apiUrl}/auth/2fa/setup`, {});
  }

  enable2FA(code: string): Observable<void> {
    return this.http.post<void>(`${environment.apiUrl}/auth/2fa/enable`, { code });
  }

  disable2FA(code: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/auth/2fa/disable`, { body: { code } });
  }
}
