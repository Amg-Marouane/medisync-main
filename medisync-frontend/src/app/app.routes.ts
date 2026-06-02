import { Routes } from '@angular/router';
import { authGuard, guestGuard, roleGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () =>
      import('./features/landing/landing.component').then(
        (m) => m.LandingComponent
      )
  },

  {
    path: 'auth',
    canActivate: [guestGuard],
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./features/auth/login/login.component').then(
            (m) => m.LoginComponent
          )
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./features/auth/register/register.component').then(
            (m) => m.RegisterComponent
          )
      }
    ]
  },

  {
    path: 'patient',
    canActivate: [authGuard, roleGuard(['patient'])],
    loadComponent: () =>
      import('./layouts/main-layout/main-layout.component').then(
        (m) => m.MainLayoutComponent
      ),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/patient/dashboard/patient-dashboard.component').then(
            (m) => m.PatientDashboardComponent
          )
      },
      {
        path: 'appointments',
        loadComponent: () =>
          import('./features/patient/appointments/patient-appointments.component').then(
            (m) => m.PatientAppointmentsComponent
          )
      },
      {
        path: 'medical-record',
        loadComponent: () =>
          import('./features/patient/medical-record/medical-record.component').then(
            (m) => m.MedicalRecordComponent
          )
      },
      {
        path: 'prescriptions',
        loadComponent: () =>
          import('./features/patient/prescriptions/prescriptions.component').then(
            (m) => m.PrescriptionsComponent
          )
      },
      {
        path: 'documents',
        loadComponent: () =>
          import('./features/patient/documents/patient-documents.component').then(
            (m) => m.PatientDocumentsComponent
          )
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./features/patient/profile/profile.component').then(
            (m) => m.ProfileComponent
          )
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./shared/components/settings/settings.component').then(
            (m) => m.SettingsComponent
          )
      }
    ]
  },

  {
    path: 'doctor',
    canActivate: [authGuard, roleGuard(['doctor'])],
    loadComponent: () =>
      import('./layouts/main-layout/main-layout.component').then(
        (m) => m.MainLayoutComponent
      ),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/doctor/dashboard/doctor-dashboard.component').then(
            (m) => m.DoctorDashboardComponent
          )
      },
      {
        path: 'planning',
        loadComponent: () =>
          import('./features/doctor/planning/planning.component').then(
            (m) => m.DoctorPlanningComponent
          )
      },
      {
        path: 'consultations',
        loadComponent: () =>
          import('./features/doctor/consultations/consultations.component').then(
            (m) => m.ConsultationsComponent
          )
      },
      {
        path: 'patients',
        loadComponent: () =>
          import('./features/doctor/patients/patients.component').then(
            (m) => m.DoctorPatientsComponent
          )
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./features/patient/profile/profile.component').then(
            (m) => m.ProfileComponent
          )
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./shared/components/settings/settings.component').then(
            (m) => m.SettingsComponent
          )
      }
    ]
  },

  {
    path: 'secretary',
    canActivate: [authGuard, roleGuard(['secretary'])],
    loadComponent: () =>
      import('./layouts/main-layout/main-layout.component').then(
        (m) => m.MainLayoutComponent
      ),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/secretary/dashboard/secretary-dashboard.component').then(
            (m) => m.SecretaryDashboardComponent
          )
      },
      {
        path: 'patients/new',
        loadComponent: () =>
          import('./features/secretary/patients/new-patient.component').then(
            (m) => m.NewPatientComponent
          )
      },
      {
        path: 'appointments',
        loadComponent: () =>
          import('./features/secretary/appointments/secretary-appointments.component').then(
            (m) => m.SecretaryAppointmentsComponent
          )
      },
      {
        path: 'billing/new',
        loadComponent: () =>
          import('./features/secretary/billing/new-invoice.component').then(
            (m) => m.NewInvoiceComponent
          )
      },
      {
        path: 'billing/care-sheet',
        loadComponent: () =>
          import('./features/secretary/billing/care-sheet.component').then(
            (m) => m.CareSheetComponent
          )
      },
      {
        path: 'billing',
        loadComponent: () =>
          import('./features/secretary/billing/billing.component').then(
            (m) => m.BillingComponent
          )
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./features/patient/profile/profile.component').then(
            (m) => m.ProfileComponent
          )
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./shared/components/settings/settings.component').then(
            (m) => m.SettingsComponent
          )
      }
    ]
  },

  {
    path: 'admin',
    canActivate: [authGuard, roleGuard(['admin'])],
    loadComponent: () =>
      import('./layouts/main-layout/main-layout.component').then(
        (m) => m.MainLayoutComponent
      ),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/admin/dashboard/admin-dashboard.component').then(
            (m) => m.AdminDashboardComponent
          )
      },
      {
        path: 'establishment',
        loadComponent: () =>
          import('./features/admin/establishment/establishment.component').then(
            (m) => m.EstablishmentComponent
          )
      },
      {
        path: 'staff',
        loadComponent: () =>
          import('./features/admin/staff/staff.component').then(
            (m) => m.StaffComponent
          )
      },
      {
        path: 'finance',
        loadComponent: () =>
          import('./features/admin/finance/finance.component').then(
            (m) => m.FinanceComponent
          )
      },
      {
        path: 'statistics',
        loadComponent: () =>
          import('./features/admin/statistics/statistics.component').then(
            (m) => m.StatisticsComponent
          )
      },
      {
        path: 'audit',
        loadComponent: () =>
          import('./features/admin/audit/audit.component').then(
            (m) => m.AuditComponent
          )
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./features/patient/profile/profile.component').then(
            (m) => m.ProfileComponent
          )
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./shared/components/settings/settings.component').then(
            (m) => m.SettingsComponent
          )
      }
    ]
  },

  { path: '**', redirectTo: '' }
];
