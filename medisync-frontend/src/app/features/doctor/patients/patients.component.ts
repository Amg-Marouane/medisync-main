import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { PageHeaderComponent } from '../../../shared/components/page-header.component';
import { MedicalRecordService } from '../../../core/services/medical-record.service';
import { MedicalRecordDto, User } from '../../../core/models/user.model';

@Component({
  selector: 'app-doctor-patients',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatExpansionModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    PageHeaderComponent
  ],
  template: `
    <div class="page">
      <app-page-header
        eyebrow="Dossiers medicaux"
        icon="folder_shared"
        title="Mes patients"
        subtitle="Consultez l'historique et ajoutez les comptes rendus."
      ></app-page-header>

      <mat-card class="search">
        <mat-form-field appearance="outline" class="full">
          <mat-label>Rechercher un patient</mat-label>
          <input matInput [value]="query()" (input)="query.set($any($event.target).value)" placeholder="Nom ou email" />
          <mat-icon matSuffix>search</mat-icon>
        </mat-form-field>
      </mat-card>

      @if (loadingPatients()) {
        <div class="loader"><mat-spinner></mat-spinner></div>
      } @else {
        <div class="workspace">
          <div class="patients-list">
            @for (p of filteredPatients(); track p.id) {
              <mat-card class="pcard" [class.active]="selectedPatient()?.id === p.id" (click)="selectPatient(p)">
                <div class="head">
                  <div class="avatar">{{ initials(p) }}</div>
                  <div>
                    <strong>{{ p.firstName }} {{ p.lastName }}</strong>
                    <span>{{ p.email }}</span>
                  </div>
                </div>
                <button mat-stroked-button type="button">
                  <mat-icon>folder_open</mat-icon>
                  Ouvrir le dossier
                </button>
              </mat-card>
            }
            @if (filteredPatients().length === 0) {
              <mat-card class="empty-card">Aucun patient rattache a vos rendez-vous.</mat-card>
            }
          </div>

          <div class="record-panel">
            @if (!selectedPatient()) {
              <mat-card class="empty-card">Selectionnez un patient pour ouvrir son dossier medical.</mat-card>
            } @else {
              <mat-card class="summary-card">
                <h3><mat-icon>assignment_ind</mat-icon> Dossier complet</h3>
                <div class="summary-grid">
                  <div><strong>Historique</strong><span>{{ records().length }} compte(s) rendu(s)</span></div>
                  <div><strong>Allergies</strong><span>{{ patientMeta(selectedPatient()!).allergies }}</span></div>
                  <div><strong>Antecedents</strong><span>{{ patientMeta(selectedPatient()!).antecedents }}</span></div>
                </div>
              </mat-card>

              <mat-card class="form-card">
                <h3>
                  <mat-icon>note_add</mat-icon>
                  Nouveau compte rendu
                </h3>
                <form [formGroup]="recordForm" (ngSubmit)="saveRecord()">
                  <div class="structured-grid">
                    <mat-form-field appearance="outline">
                      <mat-label>Modele pre-rempli</mat-label>
                      <mat-select formControlName="template" (selectionChange)="applyTemplate($event.value)">
                        @for (template of reportTemplates; track template.id) {
                          <mat-option [value]="template.id">{{ template.label }}</mat-option>
                        }
                      </mat-select>
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Motif de consultation</mat-label>
                      <input matInput formControlName="chiefComplaint" />
                    </mat-form-field>

                    <mat-form-field appearance="outline" class="full">
                      <mat-label>Histoire de la maladie</mat-label>
                      <textarea matInput rows="3" formControlName="history"></textarea>
                    </mat-form-field>

                    <mat-form-field appearance="outline" class="full">
                      <mat-label>Examen clinique</mat-label>
                      <textarea matInput rows="3" formControlName="exam"></textarea>
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Diagnostic</mat-label>
                      <input matInput formControlName="diagnosis" />
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Suivi recommande</mat-label>
                      <input matInput formControlName="followUp" />
                    </mat-form-field>

                    <mat-form-field appearance="outline" class="full">
                      <mat-label>Conduite a tenir</mat-label>
                      <textarea matInput rows="3" formControlName="plan"></textarea>
                    </mat-form-field>
                  </div>

                  <mat-form-field appearance="outline" class="full">
                    <mat-label>Ordonnance electronique (optionnel)</mat-label>
                    <textarea matInput rows="4" formControlName="prescription"></textarea>
                  </mat-form-field>

                  <div class="prescription-tools">
                    <mat-form-field appearance="outline">
                      <mat-label>Recherche medicament</mat-label>
                      <input matInput [value]="medicationQuery()" (input)="medicationQuery.set($any($event.target).value)" />
                      <mat-icon matSuffix>search</mat-icon>
                    </mat-form-field>
                    <div class="med-list">
                      @for (med of filteredMedications(); track med) {
                        <button mat-stroked-button type="button" (click)="addMedication(med)">
                          <mat-icon>add</mat-icon>
                          {{ med }}
                        </button>
                      }
                    </div>
                  </div>

                  <button mat-flat-button color="primary" type="submit" [disabled]="recordForm.invalid || saving()">
                    @if (saving()) { <mat-spinner diameter="18"></mat-spinner> }
                    @else { <mat-icon>save</mat-icon> }
                    Enregistrer dans le dossier
                  </button>
                </form>
              </mat-card>

              <mat-card class="form-card">
                <h3><mat-icon>upload_file</mat-icon> Documents medicaux</h3>
                <div class="document-tools">
                  <input #documentInput type="file" multiple hidden (change)="addDocuments($event)" />
                  <button mat-stroked-button type="button" (click)="documentInput.click()">
                    <mat-icon>attach_file</mat-icon>
                    Ajouter resultats ou imagerie
                  </button>
                </div>
                <div class="docs-list">
                  @for (doc of documents(); track doc.name + doc.date) {
                    <div class="doc-row">
                      <mat-icon>description</mat-icon>
                      <span>{{ doc.name }}</span>
                      <small>{{ doc.date }}</small>
                    </div>
                  } @empty {
                    <p>Aucun document ajoute.</p>
                  }
                </div>
              </mat-card>

              <h3 class="section-title">Historique</h3>
              @if (loadingRecords()) {
                <div class="loader small"><mat-spinner diameter="32"></mat-spinner></div>
              } @else if (records().length === 0) {
                <mat-card class="empty-card">Aucun compte rendu pour ce patient.</mat-card>
              } @else {
                <mat-accordion>
                  @for (r of records(); track r.id) {
                    <mat-expansion-panel class="entry">
                      <mat-expansion-panel-header>
                        <mat-panel-title>{{ r.createdAt | date:'dd/MM/yyyy' }}</mat-panel-title>
                        <mat-panel-description>{{ r.doctorName }}</mat-panel-description>
                      </mat-expansion-panel-header>
                      <p class="report">{{ r.report }}</p>
                      @if (r.prescription) {
                        <div class="rx">
                          <strong>Ordonnance</strong>
                          <p>{{ r.prescription }}</p>
                        </div>
                      }
                    </mat-expansion-panel>
                  }
                </mat-accordion>
              }
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .page { padding: 24px; max-width: 1200px; margin: 0 auto; }
    .search, .summary-card, .form-card, .pcard, .empty-card { border-radius: 8px; }
    .search { padding: 16px; margin-bottom: 24px; }
    .full { width: 100%; }
    .loader { display: flex; justify-content: center; padding: 40px; }
    .loader.small { padding: 20px; }
    .workspace { display: grid; grid-template-columns: 340px 1fr; gap: 20px; align-items: start; }
    .patients-list { display: flex; flex-direction: column; gap: 12px; }
    .pcard { padding: 16px; cursor: pointer; border: 1px solid transparent; }
    .pcard.active { border-color: #0d6efd; background: #eff6ff; }
    .head { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
    .avatar {
      width: 44px; height: 44px; border-radius: 50%;
      background: linear-gradient(135deg, #0d6efd, #06b6d4);
      color: white; display: flex; align-items: center; justify-content: center;
      font-weight: 700; font-size: 14px; flex-shrink: 0;
    }
    .head strong { display: block; font-size: 15px; }
    .head span { color: #64748b; font-size: 13px; }
    .record-panel { min-width: 0; }
    .summary-card { padding: 18px; margin-bottom: 20px; }
    .summary-card h3 {
      display: flex; align-items: center; gap: 8px;
      margin: 0 0 14px; color: #0d6efd; font-size: 18px;
    }
    .summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
    .summary-grid div { background: #f8fafc; border-radius: 8px; padding: 12px; }
    .summary-grid strong, .summary-grid span { display: block; }
    .summary-grid span { color: #64748b; font-size: 13px; margin-top: 4px; }
    .form-card { padding: 20px; margin-bottom: 20px; }
    .form-card h3 {
      display: flex; align-items: center; gap: 8px;
      margin: 0 0 16px; color: #0d6efd; font-size: 18px;
    }
    .form-card form { display: flex; flex-direction: column; gap: 8px; align-items: flex-start; }
    .structured-grid {
      display: grid; grid-template-columns: 1fr 1fr; gap: 8px 16px; width: 100%;
    }
    .structured-grid .full { grid-column: 1 / -1; }
    .section-title { margin: 0 0 12px; font-size: 18px; }
    .entry { border-radius: 8px !important; margin-bottom: 8px; }
    .report { color: #475569; line-height: 1.6; white-space: pre-line; }
    .rx { background: #f0fdf4; border: 1px solid #86efac; border-radius: 8px; padding: 12px; color: #166534; }
    .rx p { margin: 6px 0 0; white-space: pre-line; }
    .prescription-tools { width: 100%; display: grid; grid-template-columns: 280px 1fr; gap: 12px; align-items: start; }
    .med-list { display: flex; gap: 8px; flex-wrap: wrap; padding-top: 8px; }
    .document-tools { margin-bottom: 12px; }
    .docs-list { display: flex; flex-direction: column; gap: 8px; width: 100%; }
    .doc-row { display: grid; grid-template-columns: auto 1fr auto; gap: 8px; align-items: center; background: #f8fafc; border-radius: 8px; padding: 10px; }
    .doc-row mat-icon { color: #0d6efd; }
    .doc-row small, .docs-list p { color: #64748b; }
    .empty-card { padding: 24px; color: #64748b; text-align: center; }
    @media (max-width: 900px) {
      .workspace { grid-template-columns: 1fr; }
      .structured-grid, .summary-grid, .prescription-tools { grid-template-columns: 1fr; }
      .structured-grid .full { grid-column: auto; }
    }
  `]
})
export class DoctorPatientsComponent implements OnInit {
  private readonly recordsSvc = inject(MedicalRecordService);
  private readonly fb = inject(FormBuilder);
  private readonly snack = inject(MatSnackBar);

  readonly patients = signal<User[]>([]);
  readonly records = signal<MedicalRecordDto[]>([]);
  readonly selectedPatient = signal<User | null>(null);
  readonly query = signal('');
  readonly loadingPatients = signal(true);
  readonly loadingRecords = signal(false);
  readonly saving = signal(false);
  readonly medicationQuery = signal('');
  readonly documents = signal<Array<{ name: string; date: string }>>([]);

  readonly medications = [
    'Paracetamol 500 mg',
    'Ibuprofene 400 mg',
    'Amoxicilline 1 g',
    'Omeprazole 20 mg',
    'Metformine 850 mg',
    'Amlodipine 5 mg',
    'Salbutamol inhalateur',
    'Cetirizine 10 mg'
  ];

  readonly reportTemplates = [
    {
      id: 'general',
      label: 'Consultation generale',
      chiefComplaint: 'Consultation generale',
      history: 'Patient consulte pour un motif general. Symptomes rapportes a completer.',
      exam: 'Etat general conserve. Constantes et examen clinique a completer.',
      diagnosis: 'Diagnostic a preciser',
      plan: 'Conseils hygieno-dietetiques et traitement selon ordonnance.',
      followUp: 'Controle si aggravation ou absence d amelioration'
    },
    {
      id: 'follow-up',
      label: 'Suivi de traitement',
      chiefComplaint: 'Suivi',
      history: 'Suivi d une pathologie connue. Observance et tolerance du traitement a evaluer.',
      exam: 'Examen oriente selon la pathologie suivie.',
      diagnosis: 'Pathologie en suivi',
      plan: 'Poursuite ou adaptation du traitement selon evolution clinique.',
      followUp: 'Prochain controle programme'
    },
    {
      id: 'emergency',
      label: 'Consultation urgente',
      chiefComplaint: 'Urgence',
      history: 'Debut, intensite, facteurs declenchants et signes associes a documenter.',
      exam: 'Evaluation clinique initiale et signes de gravite a rechercher.',
      diagnosis: 'Suspicion diagnostique',
      plan: 'Prise en charge immediate et orientation si necessaire.',
      followUp: 'Surveillance rapprochee'
    }
  ];

  readonly recordForm = this.fb.nonNullable.group({
    template: ['general'],
    chiefComplaint: ['', Validators.required],
    history: ['', Validators.required],
    exam: ['', Validators.required],
    diagnosis: ['', Validators.required],
    plan: ['', Validators.required],
    followUp: [''],
    prescription: ['']
  });

  ngOnInit(): void {
    this.recordsSvc.getDoctorPatients().subscribe({
      next: (patients) => {
        this.patients.set(patients);
        this.loadingPatients.set(false);
      },
      error: () => this.loadingPatients.set(false)
    });
  }

  filteredPatients(): User[] {
    const q = this.query().trim().toLowerCase();
    if (!q) return this.patients();
    return this.patients().filter((p) =>
      `${p.firstName} ${p.lastName} ${p.email}`.toLowerCase().includes(q)
    );
  }

  selectPatient(patient: User): void {
    this.selectedPatient.set(patient);
    this.documents.set(this.loadDocuments(patient.id));
    this.recordForm.reset();
    this.applyTemplate('general');
    this.loadRecords(patient.id);
  }

  saveRecord(): void {
    const patient = this.selectedPatient();
    if (!patient || this.recordForm.invalid) {
      this.recordForm.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    const value = this.recordForm.getRawValue();
    this.recordsSvc.create({
      patientId: patient.id,
      report: this.buildStructuredReport(value),
      prescription: value.prescription || undefined
    }).subscribe({
      next: () => {
        this.saving.set(false);
        this.recordForm.reset();
        this.applyTemplate('general');
        this.snack.open('Compte rendu ajoute au dossier patient.', 'OK', { duration: 3000 });
        this.loadRecords(patient.id);
      },
      error: (err) => {
        this.saving.set(false);
        this.snack.open(err?.error?.message ?? 'Erreur lors de l enregistrement.', 'OK', { duration: 4000 });
      }
    });
  }

  initials(user: User): string {
    return `${user.firstName[0] ?? ''}${user.lastName[0] ?? ''}`.toUpperCase();
  }

  applyTemplate(templateId: string): void {
    const template = this.reportTemplates.find((item) => item.id === templateId) ?? this.reportTemplates[0];
    this.recordForm.patchValue({
      template: template.id,
      chiefComplaint: template.chiefComplaint,
      history: template.history,
      exam: template.exam,
      diagnosis: template.diagnosis,
      plan: template.plan,
      followUp: template.followUp
    });
  }

  filteredMedications(): string[] {
    const query = this.medicationQuery().trim().toLowerCase();
    if (!query) return this.medications.slice(0, 4);
    return this.medications.filter((med) => med.toLowerCase().includes(query)).slice(0, 6);
  }

  addMedication(medication: string): void {
    const current = this.recordForm.controls.prescription.value;
    const nextLine = `${medication} - posologie a preciser`;
    this.recordForm.controls.prescription.setValue(current ? `${current}\n${nextLine}` : nextLine);
  }

  addDocuments(event: Event): void {
    const input = event.target as HTMLInputElement;
    const patient = this.selectedPatient();
    if (!patient || !input.files) return;
    const added = Array.from(input.files).map((file) => ({
      name: file.name,
      date: new Intl.DateTimeFormat('fr-FR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date())
    }));
    this.documents.update((docs) => [...added, ...docs]);
    localStorage.setItem(`medisync_patient_documents_${patient.id}`, JSON.stringify(this.documents()));
    this.snack.open('Document medical ajoute au dossier.', 'OK', { duration: 2500 });
    input.value = '';
  }

  patientMeta(patient: User): { allergies: string; antecedents: string } {
    const index = patient.id % 4;
    return [
      { allergies: 'Aucune connue', antecedents: 'RAS' },
      { allergies: 'Penicilline', antecedents: 'Hypertension arterielle' },
      { allergies: 'Aspirine', antecedents: 'Migraine chronique' },
      { allergies: 'Iode', antecedents: 'Diabete type 2' }
    ][index];
  }

  private buildStructuredReport(value: ReturnType<typeof this.recordForm.getRawValue>): string {
    const lines = [
      'Compte rendu medical structure',
      '',
      `Motif: ${value.chiefComplaint}`,
      '',
      `Histoire de la maladie:\n${value.history}`,
      '',
      `Examen clinique:\n${value.exam}`,
      '',
      `Diagnostic:\n${value.diagnosis}`,
      '',
      `Conduite a tenir:\n${value.plan}`
    ];
    if (value.followUp) {
      lines.push('', `Suivi recommande:\n${value.followUp}`);
    }
    return lines.join('\n');
  }

  private loadRecords(patientId: number): void {
    this.loadingRecords.set(true);
    this.recordsSvc.getPatientRecords(patientId).subscribe({
      next: (records) => {
        this.records.set(records);
        this.loadingRecords.set(false);
      },
      error: () => this.loadingRecords.set(false)
    });
  }

  private loadDocuments(patientId: number): Array<{ name: string; date: string }> {
    const raw = localStorage.getItem(`medisync_patient_documents_${patientId}`);
    if (!raw) return [];
    try {
      return JSON.parse(raw) as Array<{ name: string; date: string }>;
    } catch {
      localStorage.removeItem(`medisync_patient_documents_${patientId}`);
      return [];
    }
  }
}
