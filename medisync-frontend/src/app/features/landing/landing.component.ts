import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RevealOnScrollDirective } from '../../shared/directives/reveal-on-scroll.directive';
import { LogoComponent } from '../../shared/components/logo.component';

interface Feature {
  icon: string;
  title: string;
  description: string;
  color: string;
}

interface Stat {
  value: string;
  label: string;
  icon: string;
}

interface Testimonial {
  name: string;
  role: string;
  avatar: string;
  text: string;
}

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatButtonModule,
    MatIconModule,
    RevealOnScrollDirective,
    LogoComponent
  ],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss'
})
export class LandingComponent {
  readonly currentYear = new Date().getFullYear();
  readonly menuOpen = signal(false);

  readonly stats: Stat[] = [
    { value: '50K+', label: 'Patients suivis', icon: 'groups' },
    { value: '320+', label: 'Praticiens partenaires', icon: 'medical_services' },
    { value: '99.9%', label: 'Disponibilité', icon: 'verified' },
    { value: '24/7', label: 'Support', icon: 'support_agent' }
  ];

  readonly features: Feature[] = [
    {
      icon: 'event_available',
      title: 'Rendez-vous en ligne',
      description:
        'Réservez en quelques clics auprès de votre praticien, à toute heure du jour ou de la nuit.',
      color: '#0d6efd'
    },
    {
      icon: 'folder_shared',
      title: 'Dossier médical sécurisé',
      description:
        'Vos consultations, ordonnances et analyses centralisées et chiffrées selon le RGPD.',
      color: '#10b981'
    },
    {
      icon: 'medication',
      title: 'Prescriptions électroniques',
      description:
        'Recevez vos ordonnances au format PDF et configurez des rappels automatiques.',
      color: '#06b6d4'
    },
    {
      icon: 'calendar_month',
      title: 'Planning intelligent',
      description:
        'Les médecins gèrent leur agenda en temps réel avec gestion des urgences intégrée.',
      color: '#059669'
    },
    {
      icon: 'insights',
      title: 'Tableau de bord analytique',
      description:
        'Pour les administrateurs : KPI, taux d’occupation, revenus et statistiques en temps réel.',
      color: '#0891b2'
    },
    {
      icon: 'notifications_active',
      title: 'Notifications intelligentes',
      description:
        'Rappels 24h et 1h avant chaque rendez-vous par email et notification push.',
      color: '#14b8a6'
    }
  ];

  readonly testimonials: Testimonial[] = [
    {
      name: 'Dr Sophie Martin',
      role: 'Médecin généraliste',
      avatar:
        'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=160&q=80',
      text:
        'MediSync a transformé la gestion de mon cabinet. Je gagne au moins 2 heures par jour sur l’administratif.'
    },
    {
      name: 'Karim Bennani',
      role: 'Patient',
      avatar:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&q=80',
      text:
        'Plus besoin d’appeler ou d’attendre. Je prends mes rendez-vous le soir depuis mon canapé.'
    },
    {
      name: 'Amina El Fassi',
      role: 'Directrice de clinique',
      avatar:
        'https://images.unsplash.com/photo-1551836022-deb4988cc6c0?auto=format&fit=crop&w=160&q=80',
      text:
        'Le tableau de bord administrateur nous donne enfin une vraie visibilité sur l’activité.'
    }
  ];

  toggleMenu(): void {
    this.menuOpen.update((v) => !v);
  }

  scrollTo(id: string): void {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    this.menuOpen.set(false);
  }
}
