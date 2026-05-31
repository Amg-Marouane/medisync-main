import { Injectable, signal } from '@angular/core';

export type InvoiceStatus = 'paid' | 'pending' | 'overdue';

export interface Invoice {
  id: string;
  patient: string;
  patientEmail: string;
  service: string;
  amount: number;
  date: string;
  paymentMethod: string;
  notes: string;
  status: InvoiceStatus;
}

const STORAGE_KEY = 'medisync_secretary_invoices';

@Injectable({ providedIn: 'root' })
export class BillingService {
  readonly invoices = signal<Invoice[]>(this.load());

  addInvoice(input: Omit<Invoice, 'id'>): Invoice {
    const invoice: Invoice = {
      ...input,
      id: this.nextInvoiceId()
    };
    this.invoices.update((items) => [invoice, ...items]);
    this.persist();
    return invoice;
  }

  markAsPaid(id: string): void {
    this.invoices.update((items) =>
      items.map((invoice) =>
        invoice.id === id ? { ...invoice, status: 'paid' } : invoice
      )
    );
    this.persist();
  }

  statusLabel(status: InvoiceStatus): string {
    return ({ paid: 'Payee', pending: 'En attente', overdue: 'En retard' } as const)[status];
  }

  private nextInvoiceId(): string {
    const year = new Date().getFullYear();
    const max = this.invoices().reduce((acc, item) => {
      const raw = item.id.split('-').pop() ?? '0';
      const num = Number(raw);
      return Number.isFinite(num) ? Math.max(acc, num) : acc;
    }, 0);
    return `F-${year}-${String(max + 1).padStart(3, '0')}`;
  }

  private persist(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.invoices()));
  }

  private load(): Invoice[] {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        return JSON.parse(raw) as Invoice[];
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    return [
      {
        id: 'F-2026-001',
        patient: 'Sarah Bennani',
        patientEmail: 'sarah.bennani@example.com',
        service: 'Consultation generale',
        amount: 300,
        date: '01/06/2026',
        paymentMethod: 'Carte bancaire',
        notes: '',
        status: 'paid'
      },
      {
        id: 'F-2026-002',
        patient: 'Karim Tazi',
        patientEmail: 'karim.tazi@example.com',
        service: 'Controle medical',
        amount: 450,
        date: '01/06/2026',
        paymentMethod: 'Assurance',
        notes: '',
        status: 'paid'
      },
      {
        id: 'F-2026-003',
        patient: 'Fatima Alaoui',
        patientEmail: 'fatima.alaoui@example.com',
        service: 'Analyse',
        amount: 300,
        date: '01/06/2026',
        paymentMethod: 'Virement',
        notes: '',
        status: 'pending'
      },
      {
        id: 'F-2026-004',
        patient: 'Mohamed Idrissi',
        patientEmail: 'mohamed.idrissi@example.com',
        service: 'Soin infirmier',
        amount: 800,
        date: '28/05/2026',
        paymentMethod: 'Especes',
        notes: '',
        status: 'pending'
      },
      {
        id: 'F-2026-005',
        patient: 'Aicha Lahlou',
        patientEmail: 'aicha.lahlou@example.com',
        service: 'Consultation generale',
        amount: 250,
        date: '15/05/2026',
        paymentMethod: 'Assurance',
        notes: '',
        status: 'overdue'
      }
    ];
  }
}
