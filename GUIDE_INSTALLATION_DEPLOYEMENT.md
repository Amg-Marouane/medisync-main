# Guide d'Installation et de Déploiement - MediSync

Ce guide fournit les étapes nécessaires pour configurer, installer, exécuter et déployer l'écosystème **MediSync** (Back-end Spring Boot, Front-end Web Angular et Application Mobile Flutter).

---

## 📋 Prérequis Généraux

Avant de commencer, assurez-vous d'avoir installé les outils suivants sur votre système :

- **Java Development Kit (JDK)**: Version 17 ou supérieure.
- **Apache Maven**: Version 3.8+ (pour la gestion des dépendances Java).
- **Node.js**: Version 18+ ou 20+ (recommandé pour Angular).
- **XAMPP** ou un serveur **MySQL** local autonome.
- **Flutter SDK**: Version stable (pour exécuter et compiler l'application mobile).
- **Android Studio** / **VS Code** avec les extensions Flutter et Dart configurées.

---

## 🗄️ Étape 1 : Configuration de la Base de Données (MySQL)

MediSync utilise MySQL pour stocker ses données.

1. Démarrez le panneau de contrôle **XAMPP**.
2. Activez les modules **Apache** et **MySQL**.
3. Ouvrez votre navigateur et accédez à **phpMyAdmin** : `http://localhost/phpmyadmin`.
4. Créez une nouvelle base de données :
   - **Nom de la base** : `medisync`
   - **Interclassement** : `utf8mb4_unicode_ci`
5. Cliquez sur **Créer**. (Les tables seront générées automatiquement par Spring Boot lors du premier démarrage grâce à la configuration `ddl-auto: update`).

---

## ☕ Étape 2 : Installation et Démarrage du Back-end (Spring Boot)

Le back-end fournit l'API REST sécurisée via JWT.

### Configuration Locale
Le fichier de configuration se trouve dans : `medisync-backend/backend/src/main/resources/application.yml`
Par défaut, il utilise les identifiants MySQL standards de XAMPP :
```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/medisync?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
    username: root
    password: # Renseignez votre mot de passe si vous en avez configuré un
```

### Exécution en Mode Développement
Ouvrez votre terminal et exécutez les commandes suivantes :
```powershell
cd medisync-backend/backend
mvn spring-boot:run
```
L'API démarrera sur **`http://localhost:8080`**.

### Déploiement en Production
Pour empaqueter le backend sous forme de fichier exécutable JAR :
```powershell
mvn clean package -DskipTests
```
Le fichier JAR généré sera localisé dans le dossier `target/` sous le nom de `backend-0.0.1-SNAPSHOT.jar`. Vous pouvez le déployer sur un serveur VPS ou Cloud :
```powershell
java -jar target/backend-0.0.1-SNAPSHOT.jar
```

---

## 🅰️ Étape 3 : Installation et Démarrage du Front-end (Angular)

Le site web pour l'administration et la gestion des cliniques.

### Installation des Dépendances
Accédez au répertoire frontend et installez les packages Node.js :
```powershell
cd medisync-frontend
npm install
```

### Exécution en Mode Développement
Lancez le serveur de développement Angular :
```powershell
npm run dev
# ou
npx ng serve
```
Le projet web sera disponible sur **`http://localhost:4200`**.

### Déploiement en Production
Pour compiler et optimiser l'application pour la production :
```powershell
npx ng build
```
Les fichiers statiques générés (HTML, JS, CSS) seront placés dans le dossier `dist/`. Ces fichiers peuvent être hébergés sur n'importe quel serveur web statique comme **Nginx**, **Apache**, ou des plateformes Cloud (**Vercel**, **Netlify**, **Firebase Hosting**).

---

## 📱 Étape 4 : Configuration et Démarrage de l'Application Mobile (Flutter)

L'application mobile pour les patients et le suivi de santé.

### Installation des Dépendances
Accédez au répertoire de l'application mobile et récupérez les dépendances Dart :
```powershell
cd medisync_mobile
flutter pub get
```

### Exécution sur Émulateur ou Appareil Réel
1. Démarrez un émulateur Android/iOS ou connectez votre smartphone physique.
2. Lancez l'application en mode debug :
```powershell
flutter run
```

### Déploiement / Génération des Fichiers d'Installation
Pour générer les fichiers d'installation prêts pour la distribution ou la publication :

#### Pour Android (APK) :
```powershell
flutter build apk --release
```
Le fichier APK final sera généré dans : `build/app/outputs/flutter-apk/app-release.apk`. Vous pouvez l'installer directement sur votre smartphone.

#### Pour iOS (App Store) :
```powershell
flutter build ipa
```

---

## 🔑 Comptes de Test Créés par Défaut

Pour vous connecter rapidement sur le web ou sur mobile, utilisez l'un des comptes préconfigurés :

| Rôle | Email | Mot de passe |
| :--- | :--- | :--- |
| **Administrateur** | `admin@medisync.local` | `Admin@1234` |
| **Médecin** | `doctor@medisync.local` | `Doctor@1234` |
| **Patient** | `patient@medisync.local` | `Patient@1234` |
