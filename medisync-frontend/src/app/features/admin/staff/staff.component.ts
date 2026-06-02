import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { PageHeaderComponent } from '../../../shared/components/page-header.component';
import { AdminService } from '../../../core/services/admin.service';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-staff',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatCardModule, MatButtonModule, MatIconModule,
    MatChipsModule, MatMenuModule, MatFormFieldModule, MatInputModule, MatSelectModule,
    MatProgressSpinnerModule, MatSnackBarModule, MatDialogModule, PageHeaderComponent
  ],
  template: `
    <div class="page">
      <app-page-header
        eyebrow="Équipe"
        icon="badge"
        title="Personnel"
        subtitle="Praticiens, secrétaires et personnel administratif."
      >
        <button mat-flat-button color="primary" (click)="openForm()">
          <mat-icon>person_add</mat-icon>
          Ajouter un membre
        </button>
      </app-page-header>

      <!-- Formulaire inline ajout / édition -->
      @if (showForm()) {
        <mat-card class="form-card">
          <h3>
            <mat-icon>{{ editingId() ? 'edit' : 'person_add' }}</mat-icon>
            {{ editingId() ? 'Modifier le membre' : 'Nouveau membre' }}
          </h3>
          <form [formGroup]="form" (ngSubmit)="save()" class="form-grid">
            <mat-form-field appearance="outline">
              <mat-label>Prénom</mat-label>
              <input matInput formControlName="firstName" />
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Nom</mat-label>
              <input matInput formControlName="lastName" />
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Email</mat-label>
              <input matInput type="email" formControlName="email" />
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Téléphone</mat-label>
              <input matInput formControlName="phone" />
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Rôle</mat-label>
              <mat-select formControlName="role">
                <mat-option value="DOCTOR">Médecin</mat-option>
                <mat-option value="SECRETARY">Secrétaire</mat-option>
                <mat-option value="ADMIN">Administrateur</mat-option>
              </mat-select>
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Mot de passe {{ editingId() ? '(laisser vide = inchangé)' : '' }}</mat-label>
              <input matInput type="password" formControlName="password" />
            </mat-form-field>

            @if (form.get('role')?.value === 'DOCTOR') {
              <mat-form-field appearance="outline">
                <mat-label>Spécialité</mat-label>
                <input matInput formControlName="specialty" />
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Ville / Lieu</mat-label>
                <input matInput formControlName="location" />
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Langues parlées</mat-label>
                <input matInput formControlName="spokenLanguages" />
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Tarif consultation (DH)</mat-label>
                <input matInput type="number" formControlName="consultationFee" />
              </mat-form-field>
            }

            <div class="form-actions">
              <button mat-button type="button" (click)="closeForm()">Annuler</button>
              <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid || saving()">
                @if (saving()) { <mat-spinner diameter="18"></mat-spinner> }
                @else { <mat-icon>save</mat-icon> }
                Enregistrer
              </button>
            </div>
          </form>
        </mat-card>
      }

      @if (loading()) {
        <div class="loader"><mat-spinner></mat-spinner></div>
      } @else {
        <div class="staff-grid">
          @for (m of members(); track m.id) {
            <mat-card class="sc">
              <div class="head">
                <div class="avatar" [class]="'role-' + m.role">{{ initials(m) }}</div>
                <button mat-icon-button [matMenuTriggerFor]="menu">
                  <mat-icon>more_vert</mat-icon>
                </button>
                <mat-menu #menu="matMenu">
                  <button mat-menu-item (click)="openForm(m)">
                    <mat-icon>edit</mat-icon>Modifier
                  </button>
                  <button mat-menu-item (click)="remove(m)" class="danger-item">
                    <mat-icon>delete</mat-icon>Supprimer
                  </button>
                </mat-menu>
              </div>
              <h4>{{ m.firstName }} {{ m.lastName }}</h4>
              <span class="role-label">{{ roleLabel(m.role) }}</span>
              @if (m.specialty) {
                <span class="specialty-label">{{ m.specialty }}</span>
              }
              <p class="email"><mat-icon>email</mat-icon>{{ m.email }}</p>
              @if (m.phone) {
                <p class="email"><mat-icon>phone</mat-icon>{{ m.phone }}</p>
              }
              <mat-chip [class]="'chip-' + (m.enabled ? 'active' : 'inactive')">
                {{ m.enabled ? 'Actif' : 'Désactivé' }}
              </mat-chip>
            </mat-card>
          }
          @if (members().length === 0) {
            <p class="empty">Aucun membre enregistré.</p>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .page { padding: 24px; max-width: 1200px; margin: 0 auto; }
    .loader { display: flex; justify-content: center; padding: 48px; }
    .empty { color: #94a3b8; padding: 32px; text-align: center; }
    .form-card {
      padding: 24px; border-radius: 16px; margin-bottom: 24px;
      border: 2px solid #e0f2fe;
      h3 { display: flex; align-items: center; gap: 8px; margin: 0 0 20px; color: #0d6efd; }
    }
    .form-grid {
      display: grid; grid-template-columns: 1fr 1fr; gap: 8px 16px;
      @media (max-width: 600px) { grid-template-columns: 1fr; }
      mat-form-field { width: 100%; }
    }
    .form-actions { grid-column: 1 / -1; display: flex; justify-content: flex-end; gap: 8px; margin-top: 8px; }
    .staff-grid {
      display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px;
    }
    .sc {
      padding: 24px; border-radius: 16px;
      transition: transform 0.2s, box-shadow 0.2s;
      &:hover { transform: translateY(-2px); box-shadow: 0 16px 40px rgba(15,23,42,0.08); }
    }
    .head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
    .avatar {
      width: 56px; height: 56px; border-radius: 50%;
      color: white; display: flex; align-items: center; justify-content: center;
      font-weight: 700; font-size: 18px;
      &.role-doctor { background: linear-gradient(135deg, #0d6efd, #06b6d4); }
      &.role-secretary { background: linear-gradient(135deg, #10b981, #06b6d4); }
      &.role-admin { background: linear-gradient(135deg, #7c3aed, #ec4899); }
      &.role-patient { background: linear-gradient(135deg, #f59e0b, #ef4444); }
    }
    h4 { margin: 0; font-size: 16px; }
    .role-label { color: #0d6efd; font-size: 13px; font-weight: 600; display: block; }
    .specialty-label { color: #64748b; font-size: 12px; display: block; margin-bottom: 2px; }
    .email {
      display: flex; align-items: center; gap: 6px;
      color: #64748b; font-size: 13px; margin: 10px 0 8px;
      mat-icon { font-size: 16px; width: 16px; height: 16px; }
    }
    mat-chip {
      &.chip-active { background: #d1fae5 !important; color: #065f46 !important; }
      &.chip-inactive { background: #fee2e2 !important; color: #991b1b !important; }
    }
    .danger-item { color: #ef4444; }
  `]
})
export class StaffComponent implements OnInit {
  private readonly adminSvc = inject(AdminService);
  private readonly fb = inject(FormBuilder);
  private readonly snack = inject(MatSnackBar);

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly showForm = signal(false);
  readonly editingId = signal<number | null>(null);
  readonly members = signal<User[]>([]);

  readonly form = this.fb.nonNullable.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: [''],
    phone: [''],
    role: ['DOCTOR', Validators.required],
    specialty: [''],
    location: [''],
    spokenLanguages: [''],
    consultationFee: [0]
  });

  ngOnInit(): void {
    this.load();
  }

  private readonly demoMembers: User[] = [
    { id: 101, firstName: 'Ahmed',  lastName: 'Tazi',      email: 'dr.tazi@medisync.ma',       role: 'doctor',    enabled: true,  specialty: 'Médecine générale', phone: '+212 6 61 23 45 67' },
    { id: 102, firstName: 'Karim',  lastName: 'Moussaoui', email: 'dr.moussaoui@medisync.ma',  role: 'doctor',    enabled: true,  specialty: 'Pédiatrie',         phone: '+212 6 62 34 56 78' },
    { id: 103, firstName: 'Saïd',   lastName: 'Alami',     email: 'dr.alami@medisync.ma',      role: 'doctor',    enabled: true,  specialty: 'Cardiologie',       phone: '+212 6 63 45 67 89' },
    { id: 104, firstName: 'Leila',  lastName: 'Chraibi',   email: 'dr.chraibi@medisync.ma',    role: 'doctor',    enabled: true,  specialty: 'Gynécologie',       phone: '+212 6 64 56 78 90' },
    { id: 105, firstName: 'Omar',   lastName: 'Benali',    email: 'dr.benali@medisync.ma',     role: 'doctor',    enabled: true,  specialty: 'Dermatologie',      phone: '+212 6 65 67 89 01' },
    { id: 106, firstName: 'Nadia',  lastName: 'El Fassi',  email: 'dr.elfassi@medisync.ma',    role: 'doctor',    enabled: true,  specialty: 'Radiologie',        phone: '+212 6 66 78 90 12' },
    { id: 107, firstName: 'Fatima', lastName: 'Berrada',   email: 'secretaire@medisync.ma',    role: 'secretary', enabled: true,  phone: '+212 6 67 89 01 23' },
    { id: 108, firstName: 'Admin',  lastName: 'MediSync',  email: 'admin@medisync.ma',         role: 'admin',     enabled: true  }
  ];

  private load(): void {
    this.loading.set(true);
    this.adminSvc.getUsers().subscribe({
      next: (list) => {
        const staff = list.filter((u) => u.role !== 'patient');
        this.members.set(staff.length > 0 ? staff : this.demoMembers);
        this.loading.set(false);
      },
      error: () => {
        this.members.set(this.demoMembers);
        this.loading.set(false);
      }
    });
  }

  openForm(user?: User): void {
    this.showForm.set(true);
    if (user) {
      this.editingId.set(user.id);
      this.form.patchValue({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role.toUpperCase(),
        password: ''
      });
      this.form.get('email')?.disable();
    } else {
      this.editingId.set(null);
      this.form.reset({ role: 'DOCTOR', consultationFee: 0 });
      this.form.get('email')?.enable();
    }
  }

  closeForm(): void {
    this.showForm.set(false);
    this.editingId.set(null);
    this.form.reset({ role: 'DOCTOR' });
    this.form.get('email')?.enable();
  }

  save(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving.set(true);
    const v = this.form.getRawValue();
    const req = {
      firstName: v.firstName,
      lastName: v.lastName,
      email: v.email,
      password: v.password || undefined,
      role: v.role,
      phone: v.phone || undefined,
      specialty: v.specialty || undefined,
      location: v.location || undefined,
      spokenLanguages: v.spokenLanguages || undefined,
      consultationFee: v.consultationFee || undefined
    };

    const op = this.editingId()
      ? this.adminSvc.updateUser(this.editingId()!, req)
      : this.adminSvc.createUser(req);

    op.subscribe({
      next: () => {
        this.saving.set(false);
        this.closeForm();
        this.snack.open(
          this.editingId() ? 'Membre modifié.' : 'Membre ajouté.',
          'OK', { duration: 3000 }
        );
        this.load();
      },
      error: (err) => {
        this.saving.set(false);
        this.snack.open(err?.error?.message ?? 'Erreur serveur.', 'OK', { duration: 4000 });
      }
    });
  }

  remove(user: User): void {
    if (!confirm(`Supprimer ${user.firstName} ${user.lastName} ?`)) return;
    this.adminSvc.deleteUser(user.id).subscribe({
      next: () => {
        this.members.update((list) => list.filter((m) => m.id !== user.id));
        this.snack.open('Membre supprimé.', 'OK', { duration: 3000 });
      },
      error: () => this.snack.open('Erreur lors de la suppression.', 'OK', { duration: 3000 })
    });
  }

  initials(u: User): string {
    return `${u.firstName[0] ?? ''}${u.lastName[0] ?? ''}`.toUpperCase();
  }

  roleLabel(role: string): string {
    return { doctor: 'Médecin', secretary: 'Secrétaire', admin: 'Administrateur', patient: 'Patient' }[role] ?? role;
  }
}
