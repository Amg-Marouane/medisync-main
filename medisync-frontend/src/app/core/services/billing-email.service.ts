import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface SendInvoiceEmailRequest {
  toEmail: string;
  patientName: string;
  invoiceId: string;
  service: string;
  amount: number;
  date: string;
  paymentMethod: string;
  notes: string;
}

export interface CareActDto {
  label: string;
  code: string;
  quantity: number;
  price: number;
}

export interface SendCareSheetEmailRequest {
  toEmail: string;
  patientName: string;
  doctorName: string;
  date: string;
  insurance: string;
  acts: CareActDto[];
}

@Injectable({ providedIn: 'root' })
export class BillingEmailService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/billing`;

  sendInvoiceEmail(req: SendInvoiceEmailRequest): Observable<void> {
    return this.http.post<void>(`${this.base}/send-invoice-email`, req);
  }

  sendCareSheetEmail(req: SendCareSheetEmailRequest): Observable<void> {
    return this.http.post<void>(`${this.base}/send-care-sheet-email`, req);
  }
}
