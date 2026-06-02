import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpEvent, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface MedicalDocumentDto {
  id: number;
  originalName: string;
  contentType: string;
  fileSize: number;
  documentType: string;
  description: string | null;
  uploadedAt: string;
}

@Injectable({ providedIn: 'root' })
export class DocumentService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/documents`;

  /** Upload a file with optional description – returns progress events */
  upload(file: File, description?: string): Observable<HttpEvent<MedicalDocumentDto>> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    if (description) {
      formData.append('description', description);
    }

    const req = new HttpRequest('POST', this.baseUrl, formData, {
      reportProgress: true,
    });

    return this.http.request<MedicalDocumentDto>(req);
  }

  /** Get all documents of the current patient */
  listMyDocuments(): Observable<MedicalDocumentDto[]> {
    return this.http.get<MedicalDocumentDto[]>(`${this.baseUrl}/me`);
  }

  /** Download a document by id */
  download(id: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/${id}/download`, {
      responseType: 'blob',
    });
  }

  /** Delete a document */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
