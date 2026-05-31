# MediSync API

Backend Spring Boot pour le systeme de gestion de clinique medicale MediSync.

## Stack

- Java 17+
- Spring Boot 3.3.6
- Spring Web, Spring Security, Spring Data JPA
- JWT avec `Authorization: Bearer <token>`
- MySQL local avec XAMPP/phpMyAdmin

## Lancer le backend

1. Demarrer XAMPP.
2. Activer `Apache` et `MySQL`.
3. Ouvrir phpMyAdmin: `http://localhost/phpmyadmin`.
4. Creer une base nommee `medisync` avec l'interclassement `utf8mb4_unicode_ci`.
5. Lancer Spring Boot:

```powershell
cd backend
mvn spring-boot:run
```

L'API demarre sur `http://localhost:8080`.

Configuration MySQL par defaut dans `src/main/resources/application.yml`:

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/medisync?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
    username: root
    password:
```

Si ton MySQL XAMPP a un mot de passe, renseigne-le dans `spring.datasource.password`.

## Creer la base avec phpMyAdmin

Option rapide:

1. Demarrer XAMPP.
2. Activer `Apache` et `MySQL`.
3. Ouvrir `http://localhost/phpmyadmin`.
4. Cliquer sur `Nouvelle base de donnees`.
5. Nom: `medisync`.
6. Interclassement: `utf8mb4_unicode_ci`.
7. Cliquer sur `Creer`.

Option import SQL:

1. Ouvrir `http://localhost/phpmyadmin`.
2. Aller dans l'onglet `Importer`.
3. Choisir `database/medisync_database.sql`.
4. Cliquer sur `Importer`.

Les tables sont creees automatiquement par Spring Boot au premier lancement grace a:

```yaml
spring:
  jpa:
    hibernate:
      ddl-auto: update
```

## Comptes de test

| Role | Email | Mot de passe |
| --- | --- | --- |
| ADMIN | `admin@medisync.local` | `Admin@1234` |
| DOCTOR | `doctor@medisync.local` | `Doctor@1234` |
| PATIENT | `patient@medisync.local` | `Patient@1234` |

## Endpoints principaux

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/doctors`
- `POST /api/appointments`
- `GET /api/appointments/me`
- `GET /api/appointments/doctor/me`
- `GET /api/medical-records/me`
- `POST /api/medical-records`
- `GET /api/admin/users`
- `GET /api/admin/dashboard`

## Exemple login

```json
{
  "email": "patient@medisync.local",
  "password": "Patient@1234"
}
```

Reponse:

```json
{
  "token": "...",
  "user": {
    "id": 3,
    "fullName": "Youssef Patient",
    "email": "patient@medisync.local",
    "roles": ["PATIENT"],
    "enabled": true
  }
}
```
