import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../core/services/auth.service';
import { UserRole } from '../../core/models/user.model';
import { LogoComponent } from '../../shared/components/logo.component';

interface NavItem {
  label: string;
  icon: string;
  link: string;
}

const NAV_BY_ROLE: Record<UserRole, NavItem[]> = {
  patient: [
    { label: 'Accueil', icon: 'home', link: '/patient/dashboard' },
    { label: 'Rendez-vous', icon: 'event', link: '/patient/appointments' },
    { label: 'Dossier médical', icon: 'folder_shared', link: '/patient/medical-record' },
    { label: 'Ordonnances', icon: 'medication', link: '/patient/prescriptions' },
    { label: 'Profil', icon: 'person', link: '/patient/profile' }
  ],
  doctor: [
    { label: 'Tableau de bord', icon: 'dashboard', link: '/doctor/dashboard' },
    { label: 'Planning', icon: 'calendar_month', link: '/doctor/planning' },
    { label: 'Consultations', icon: 'medical_information', link: '/doctor/consultations' },
    { label: 'Patients', icon: 'groups', link: '/doctor/patients' }
  ],
  secretary: [
    { label: 'Tableau de bord', icon: 'dashboard', link: '/secretary/dashboard' },
    { label: 'Rendez-vous', icon: 'event_note', link: '/secretary/appointments' },
    { label: 'Facturation', icon: 'receipt', link: '/secretary/billing' }
  ],
  admin: [
    { label: 'Tableau de bord', icon: 'dashboard', link: '/admin/dashboard' },
    { label: 'Établissement', icon: 'local_hospital', link: '/admin/establishment' },
    { label: 'Personnel', icon: 'badge', link: '/admin/staff' },
    { label: 'Finance', icon: 'payments', link: '/admin/finance' },
    { label: 'Statistiques', icon: 'insights', link: '/admin/statistics' }
  ]
};

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatListModule,
    MatMenuModule,
    MatDividerModule,
    LogoComponent
  ],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss'
})
export class MainLayoutComponent {
  private readonly auth = inject(AuthService);

  readonly user = this.auth.user;
  readonly sidenavOpen = signal(true);

  readonly navItems = computed<NavItem[]>(() => {
    const role = this.auth.role();
    return role ? NAV_BY_ROLE[role] : [];
  });

  readonly initials = computed(() => {
    const u = this.user();
    if (!u) return '?';
    return `${u.firstName?.[0] ?? ''}${u.lastName?.[0] ?? ''}`.toUpperCase();
  });

  readonly roleLabel = computed(() => {
    const labels: Record<UserRole, string> = {
      patient: 'Patient',
      doctor: 'Médecin',
      secretary: 'Secrétaire',
      admin: 'Administrateur'
    };
    const r = this.auth.role();
    return r ? labels[r] : '';
  });

  toggleSidenav(): void {
    this.sidenavOpen.update((v) => !v);
  }

  logout(): void {
    this.auth.logout();
  }
}
