import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { PageHeaderComponent } from '../page-header.component';

interface NotificationSettings {
  emailAppointmentReminder: boolean;
  emailAppointmentConfirmation: boolean;
  emailNewPrescription: boolean;
  emailNewsletter: boolean;
  pushEnabled: boolean;
}



interface PrivacySettings {
  shareDataForResearch: boolean;
  showProfileToOthers: boolean;
}

const STORAGE_KEY_NOTIF = 'medisync_settings_notif';
const STORAGE_KEY_PRIVACY = 'medisync_settings_privacy';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatCardModule, MatIconModule,
    MatButtonModule, MatSlideToggleModule,
    MatDividerModule, MatSnackBarModule,
    PageHeaderComponent
  ],
  template: `
    <div class="page">
      <app-page-header eyebrow="Mon compte" icon="settings" title="Paramètres"
        subtitle="Configurez vos préférences de notification et de confidentialité."
      ></app-page-header>

      <div class="settings-grid">
        <!-- Notifications -->
        <mat-card class="card">
          <div class="card-header">
            <mat-icon class="section-icon notif">notifications_active</mat-icon>
            <div>
              <h3>Notifications</h3>
              <p class="desc">Choisissez les notifications que vous souhaitez recevoir.</p>
            </div>
          </div>
          <mat-divider></mat-divider>
          <div class="toggle-list">
            <div class="toggle-row">
              <div>
                <span class="toggle-label">Rappel de rendez-vous</span>
                <span class="toggle-desc">Recevoir un email 24h et 1h avant votre rendez-vous</span>
              </div>
              <mat-slide-toggle [(ngModel)]="notif.emailAppointmentReminder" color="primary"></mat-slide-toggle>
            </div>
            <div class="toggle-row">
              <div>
                <span class="toggle-label">Confirmation de rendez-vous</span>
                <span class="toggle-desc">Recevoir un email lors de la confirmation</span>
              </div>
              <mat-slide-toggle [(ngModel)]="notif.emailAppointmentConfirmation" color="primary"></mat-slide-toggle>
            </div>
            <div class="toggle-row">
              <div>
                <span class="toggle-label">Nouvelles ordonnances</span>
                <span class="toggle-desc">Être notifié quand un médecin ajoute une ordonnance</span>
              </div>
              <mat-slide-toggle [(ngModel)]="notif.emailNewPrescription" color="primary"></mat-slide-toggle>
            </div>
            <div class="toggle-row">
              <div>
                <span class="toggle-label">Newsletter MediSync</span>
                <span class="toggle-desc">Recevoir des conseils santé et actualités</span>
              </div>
              <mat-slide-toggle [(ngModel)]="notif.emailNewsletter" color="primary"></mat-slide-toggle>
            </div>
            <mat-divider></mat-divider>
            <div class="toggle-row">
              <div>
                <span class="toggle-label">Notifications push</span>
                <span class="toggle-desc">Activer les notifications push sur cet appareil</span>
              </div>
              <mat-slide-toggle [(ngModel)]="notif.pushEnabled" color="primary"></mat-slide-toggle>
            </div>
          </div>
        </mat-card>

        <!-- Privacy -->
        <mat-card class="card">
          <div class="card-header">
            <mat-icon class="section-icon privacy">shield</mat-icon>
            <div>
              <h3>Confidentialité</h3>
              <p class="desc">Gérez la visibilité de vos données.</p>
            </div>
          </div>
          <mat-divider></mat-divider>
          <div class="toggle-list">
            <div class="toggle-row">
              <div>
                <span class="toggle-label">Partager mes données anonymisées</span>
                <span class="toggle-desc">Contribuer à l'amélioration de MediSync</span>
              </div>
              <mat-slide-toggle [(ngModel)]="privacy.shareDataForResearch" color="primary"></mat-slide-toggle>
            </div>
            <div class="toggle-row">
              <div>
                <span class="toggle-label">Profil visible par les praticiens</span>
                <span class="toggle-desc">Permettre aux médecins de voir votre profil complet</span>
              </div>
              <mat-slide-toggle [(ngModel)]="privacy.showProfileToOthers" color="primary"></mat-slide-toggle>
            </div>
          </div>
        </mat-card>
      </div>

      <div class="save-bar">
        <button mat-flat-button color="primary" (click)="saveAll()">
          <mat-icon>save</mat-icon> Enregistrer les paramètres
        </button>
      </div>
    </div>
  `,
  styles: [`
    .page { padding: 24px; max-width: 900px; margin: 0 auto; }
    .settings-grid { display: flex; flex-direction: column; gap: 20px; }
    .card { padding: 24px; border-radius: 16px; }
    .card-header {
      display: flex; align-items: flex-start; gap: 16px; margin-bottom: 16px;
      h3 { margin: 0; font-size: 17px; font-weight: 600; color: #0f172a; }
    }
    .section-icon {
      width: 44px; height: 44px; font-size: 24px;
      border-radius: 12px; display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
      &.notif { background: #dbeafe; color: #2563eb; }
      &.privacy { background: #d1fae5; color: #059669; }
    }
    .desc { color: #64748b; font-size: 14px; margin: 4px 0 0; }
    .toggle-list { display: flex; flex-direction: column; gap: 4px; margin-top: 16px; }
    .toggle-row {
      display: flex; justify-content: space-between; align-items: center;
      padding: 12px 0; gap: 16px;
    }
    .toggle-label { display: block; font-size: 14px; font-weight: 500; color: #0f172a; }
    .toggle-desc { display: block; font-size: 13px; color: #94a3b8; margin-top: 2px; }

    .full { width: 100%; }
    .save-bar {
      display: flex; justify-content: flex-end; margin-top: 24px; padding-top: 16px;
      border-top: 1px solid #e5e7eb;
    }
    mat-divider { margin: 0 -24px; }
    @media (max-width: 600px) {
      .page { padding: 16px; }
      .card { padding: 16px; }
    }
  `]
})
export class SettingsComponent {
  private readonly snack = inject(MatSnackBar);

  notif: NotificationSettings = this.load(STORAGE_KEY_NOTIF, {
    emailAppointmentReminder: true,
    emailAppointmentConfirmation: true,
    emailNewPrescription: true,
    emailNewsletter: false,
    pushEnabled: false
  });


  privacy: PrivacySettings = this.load(STORAGE_KEY_PRIVACY, {
    shareDataForResearch: false,
    showProfileToOthers: true
  });

  saveAll(): void {
    localStorage.setItem(STORAGE_KEY_NOTIF, JSON.stringify(this.notif));

    localStorage.setItem(STORAGE_KEY_PRIVACY, JSON.stringify(this.privacy));
    this.snack.open('Paramètres enregistrés avec succès !', 'OK', { duration: 3000 });
  }

  private load<T>(key: string, defaults: T): T {
    const raw = localStorage.getItem(key);
    if (!raw) return defaults;
    try {
      return { ...defaults, ...JSON.parse(raw) };
    } catch {
      return defaults;
    }
  }
}
