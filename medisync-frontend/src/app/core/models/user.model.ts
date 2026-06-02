export type UserRole = 'patient' | 'doctor' | 'secretary' | 'admin';

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  enabled: boolean;
}

export interface AuthResponse {
  token: string | null;
  user: User;
  requiresTwoFactor: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
  totpCode?: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  socialSecurityNumber?: string;
  password: string;
  role?: string;
}

export interface AppointmentDto {
  id: number;
  doctorId: number;
  patientEmail: string;
  patientName: string;
  doctorName: string;
  specialty: string;
  startsAt: string;
  durationMinutes: number;
  reason: string;
  bookedForName?: string;
  relation?: string;
  status: 'REQUESTED' | 'CONFIRMED' | 'CANCELLED';
}

export interface CreateAppointmentRequest {
  doctorId: number;
  startsAt: string;
  durationMinutes: number;
  reason: string;
  patientEmail?: string;
  bookedForName?: string;
  relation?: string;
}

export interface DoctorDto {
  id: number;
  fullName: string;
  email: string;
  specialty: string;
  location: string;
  spokenLanguages: string;
  consultationFee: number;
}

export interface MedicalRecordDto {
  id: number;
  patientName: string;
  doctorName: string;
  report: string;
  prescription: string | null;
  createdAt: string;
}

export interface CreateMedicalRecordRequest {
  patientId: number;
  report: string;
  prescription?: string;
}

export interface DashboardStats {
  users: number;
  doctors: number;
  appointments: number;
}

export interface AdminUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  role: string;
  phone?: string;
  specialty?: string;
  location?: string;
  spokenLanguages?: string;
  consultationFee?: number;
}

export interface AuditLogDto {
  id: number;
  action: string;
  performedBy: string;
  targetType: string;
  targetId: string;
  details: string;
  createdAt: string;
}

export interface TwoFactorSetupResponse {
  secret: string;
  qrDataUri: string;
}
