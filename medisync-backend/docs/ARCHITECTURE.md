# Architecture MediSync

## Vue generale

MediSync est decoupe en trois couches:

- Front-end web Angular: consomme l'API REST avec JWT.
- Back-end Spring Boot: expose les ressources metier et applique les controles d'acces.
- Base de donnees relationnelle: MySQL local via XAMPP/phpMyAdmin.

## Modules backend

- `auth`: inscription, connexion et emission du token JWT.
- `security`: Spring Security, filtre JWT, encodage BCrypt.
- `user`: comptes utilisateurs et roles `PATIENT`, `DOCTOR`, `SECRETARY`, `ADMIN`.
- `doctor`: repertoire des medecins et recherche par specialite/localisation.
- `appointment`: prise de rendez-vous et planning patient/medecin.
- `medical`: dossier medical, compte rendu et prescription.
- `admin`: utilisateurs et statistiques de tableau de bord.

## Securite

Les endpoints publics sont limites a:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/doctors`

Les autres endpoints demandent:

```http
Authorization: Bearer <jwt>
```

Les droits sont geres par roles via Spring Security:

- `PATIENT`: rendez-vous personnels et dossier medical personnel.
- `DOCTOR`: planning medecin et creation de comptes rendus.
- `SECRETARY`: creation de rendez-vous.
- `ADMIN`: gestion globale et tableau de bord.

## Schema simplifie

- `app_users(id, full_name, email, password, enabled, created_at)`
- `user_roles(user_id, role)`
- `doctor_profiles(id, user_id, specialty, location, spoken_languages, consultation_fee)`
- `appointments(id, patient_id, doctor_id, starts_at, duration_minutes, reason, status)`
- `medical_records(id, patient_id, doctor_id, report, prescription, created_at)`

## Base de donnees locale

Avec XAMPP:

1. Demarrer `Apache` et `MySQL`.
2. Aller sur `http://localhost/phpmyadmin`.
3. Creer la base `medisync`.
4. Laisser Hibernate creer les tables au demarrage grace a `spring.jpa.hibernate.ddl-auto=update`.
