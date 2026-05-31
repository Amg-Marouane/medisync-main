import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DoctorDto } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class DoctorService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/doctors`;

  getDoctors(query?: string): Observable<DoctorDto[]> {
    const params = query?.trim() ? new HttpParams().set('q', query.trim()) : undefined;
    return this.http.get<DoctorDto[]>(this.base, { params });
  }
}
