import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CreateMedicalRecordRequest, MedicalRecordDto, User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class MedicalRecordService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/medical-records`;

  getMyRecords(): Observable<MedicalRecordDto[]> {
    return this.http.get<MedicalRecordDto[]>(`${this.base}/me`);
  }

  create(request: CreateMedicalRecordRequest): Observable<MedicalRecordDto> {
    return this.http.post<MedicalRecordDto>(this.base, request);
  }

  getDoctorPatients(): Observable<User[]> {
    return this.http.get<User[]>(`${this.base}/doctor/patients`);
  }

  getPatientRecords(patientId: number): Observable<MedicalRecordDto[]> {
    return this.http.get<MedicalRecordDto[]>(`${this.base}/doctor/patients/${patientId}`);
  }

  downloadPdf(id: number): Observable<Blob> {
    return this.http.get(`${this.base}/${id}/pdf`, { responseType: 'blob' });
  }
}
