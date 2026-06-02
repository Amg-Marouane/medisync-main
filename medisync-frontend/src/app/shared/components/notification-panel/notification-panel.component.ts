import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { MatRippleModule } from '@angular/material/core';
import { OverlayModule } from '@angular/cdk/overlay';

export interface AppNotification {
  id: string;
  icon: string;
  iconColor: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
}

const STORAGE_KEY = 'medisync_notifications';

@Component({
  selector: 'app-notification-panel',
  standalone: true,
  imports: [
    CommonModule, MatIconModule, MatButtonModule,
    MatBadgeModule, MatDividerModule, MatRippleModule, OverlayModule
  ],
  template: `
    <button
      mat-icon-button
      aria-label="Notifications"
      cdkOverlayOrigin
      #trigger="cdkOverlayOrigin"
      (click)="toggle()"
      [matBadge]="unreadCount()"
      [matBadgeHidden]="unreadCount() === 0"
      matBadgeColor="warn"
      matBadgeSize="small"
    >
      <mat-icon>notifications</mat-icon>
    </button>

    <ng-template
      cdkConnectedOverlay
      [cdkConnectedOverlayOrigin]="trigger"
      [cdkConnectedOverlayOpen]="isOpen()"
      [cdkConnectedOverlayHasBackdrop]="true"
      cdkConnectedOverlayBackdropClass="notif-backdrop"
      (backdropClick)="close()"
      [cdkConnectedOverlayPositions]="positions"
    >
      <div class="notif-panel">
        <div class="notif-header">
          <h3>Notifications</h3>
          @if (unreadCount() > 0) {
            <button mat-button color="primary" (click)="markAllRead()">
              <mat-icon>done_all</mat-icon> Tout marquer lu
            </button>
          }
        </div>
        <mat-divider></mat-divider>

        @if (notifications().length === 0) {
          <div class="empty">
            <mat-icon class="empty-icon">notifications_none</mat-icon>
            <p>Aucune notification</p>
            <span>Vous êtes à jour !</span>
          </div>
        } @else {
          <div class="notif-list">
            @for (n of notifications(); track n.id) {
              <div
                class="notif-item"
                [class.unread]="!n.read"
                matRipple
                (click)="markRead(n)"
              >
                <div class="notif-icon" [style.background]="n.iconColor + '20'" [style.color]="n.iconColor">
                  <mat-icon>{{ n.icon }}</mat-icon>
                </div>
                <div class="notif-body">
                  <span class="notif-title">{{ n.title }}</span>
                  <span class="notif-msg">{{ n.message }}</span>
                  <span class="notif-time">{{ n.time }}</span>
                </div>
                @if (!n.read) {
                  <span class="unread-dot"></span>
                }
              </div>
            }
          </div>
        }
      </div>
    </ng-template>
  `,
  styles: [`
    :host { display: inline-flex; }
    .notif-panel {
      width: 380px; max-height: 480px; background: #fff;
      border-radius: 16px; box-shadow: 0 12px 40px rgba(0,0,0,.15);
      overflow: hidden; display: flex; flex-direction: column;
    }
    .notif-header {
      display: flex; justify-content: space-between; align-items: center;
      padding: 16px 20px 12px;
      h3 { margin: 0; font-size: 17px; font-weight: 600; color: #0f172a; }
    }
    .notif-list { overflow-y: auto; max-height: 380px; }
    .notif-item {
      display: flex; align-items: flex-start; gap: 12px;
      padding: 14px 20px; cursor: pointer; transition: background .15s;
      &:hover { background: #f8fafc; }
      &.unread { background: #eff6ff; }
    }
    .notif-icon {
      width: 40px; height: 40px; border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
      mat-icon { font-size: 20px; width: 20px; height: 20px; }
    }
    .notif-body {
      flex: 1; display: flex; flex-direction: column; gap: 2px; min-width: 0;
    }
    .notif-title {
      font-size: 14px; font-weight: 600; color: #0f172a;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .notif-msg {
      font-size: 13px; color: #64748b; line-height: 1.4;
      display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
    }
    .notif-time { font-size: 12px; color: #94a3b8; margin-top: 2px; }
    .unread-dot {
      width: 8px; height: 8px; border-radius: 50%; background: #0d6efd;
      flex-shrink: 0; margin-top: 6px;
    }
    .empty {
      padding: 48px 20px; text-align: center;
      .empty-icon { font-size: 48px; width: 48px; height: 48px; color: #cbd5e1; }
      p { margin: 12px 0 4px; font-size: 15px; font-weight: 600; color: #0f172a; }
      span { font-size: 13px; color: #94a3b8; }
    }
    @media (max-width: 440px) {
      .notif-panel { width: calc(100vw - 32px); }
    }
  `]
})
export class NotificationPanelComponent implements OnInit {
  readonly isOpen = signal(false);
  readonly notifications = signal<AppNotification[]>([]);

  readonly unreadCount = computed(() =>
    this.notifications().filter(n => !n.read).length
  );

  readonly positions = [
    {
      originX: 'end' as const,
      originY: 'bottom' as const,
      overlayX: 'end' as const,
      overlayY: 'top' as const,
      offsetY: 8
    }
  ];

  ngOnInit(): void {
    this.notifications.set(this.loadOrSeed());
  }

  toggle(): void {
    this.isOpen.update(v => !v);
  }

  close(): void {
    this.isOpen.set(false);
  }

  markRead(n: AppNotification): void {
    if (!n.read) {
      n.read = true;
      this.persist();
    }
  }

  markAllRead(): void {
    this.notifications().forEach(n => n.read = true);
    this.persist();
  }

  private persist(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.notifications()));
  }

  private loadOrSeed(): AppNotification[] {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try { return JSON.parse(raw); } catch { /* fall through */ }
    }
    // Seed with demo notifications
    return [
      {
        id: '1',
        icon: 'event_available',
        iconColor: '#16a34a',
        title: 'Rendez-vous confirmé',
        message: 'Votre rendez-vous avec Dr. Benali le 5 juin à 10h00 est confirmé.',
        time: 'Il y a 2 heures',
        read: false
      },
      {
        id: '2',
        icon: 'medication',
        iconColor: '#2563eb',
        title: 'Nouvelle ordonnance',
        message: 'Dr. Benali a ajouté une ordonnance à votre dossier médical.',
        time: 'Il y a 5 heures',
        read: false
      },
      {
        id: '3',
        icon: 'alarm',
        iconColor: '#ea580c',
        title: 'Rappel de rendez-vous',
        message: 'N\'oubliez pas votre rendez-vous demain à 14h30 avec Dr. Amrani.',
        time: 'Hier',
        read: false
      },
      {
        id: '4',
        icon: 'info',
        iconColor: '#7c3aed',
        title: 'Mise à jour du dossier',
        message: 'Votre dossier médical a été mis à jour suite à votre dernière consultation.',
        time: 'Il y a 2 jours',
        read: true
      }
    ];
  }
}
