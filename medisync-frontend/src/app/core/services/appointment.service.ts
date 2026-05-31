import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AppointmentDto, CreateAppointmentRequest } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AppointmentService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/appointments`;

  getMyAppointments(): Observable<AppointmentDto[]> {
    return this.http.get<AppointmentDto[]>(`${this.base}/me`);
  }

  getDoctorAppointments(): Observable<AppointmentDto[]> {
    return this.http.get<AppointmentDto[]>(`${this.base}/doctor/me`);
  }

  getSecretaryAppointments(): Observable<AppointmentDto[]> {
    return this.http.get<AppointmentDto[]>(`${this.base}/secretary`);
  }

  create(request: CreateAppointmentRequest): Observable<AppointmentDto> {
    return this.http.post<AppointmentDto>(this.base, request);
  }

  createForSecretary(request: CreateAppointmentRequest): Observable<AppointmentDto> {
    return this.http.post<AppointmentDto>(`${this.base}/secretary`, request);
  }

  update(id: number, request: CreateAppointmentRequest): Observable<AppointmentDto> {
    return this.http.patch<AppointmentDto>(`${this.base}/${id}`, request);
  }

  getAvailability(doctorId: number, date: string): Observable<string[]> {
    const params = new HttpParams()
      .set('doctorId', doctorId)
      .set('date', date);
    return this.http.get<string[]>(`${this.base}/availability`, { params });
  }

  updateStatus(id: number, status: 'CONFIRMED' | 'CANCELLED'): Observable<AppointmentDto> {
    const params = new HttpParams().set('status', status);
    return this.http.patch<AppointmentDto>(`${this.base}/${id}/status`, null, { params });
  }
}
