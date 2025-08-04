# 🏢 Test Technique Simulio - Simulateur de Crédit Immobilier

## 🚀 Instructions de lancement du projet

### Prérequis
- **[Docker Desktop](https://www.docker.com/products/docker-desktop/)** installé et **démarré** (l'application doit être ouverte et en cours d'exécution)

### Étapes d'installation

1. **Cloner le projet**
   git clone git@github.com:HascoVice/mini-simulio-test-technique.git
   cd mini-simulio-test-technique

2. **Installer les dépendances frontend**
   cd frontend
   npm install
   cd ..

3. **Lancer l'application avec Docker**
   docker-compose up -d --build

### Accès à l'application
- **Frontend** : http://localhost:5173
- **Backend API** : http://localhost:5000
- **Adminer** (base de données) : http://localhost:8080

### Comptes de test
- **Alice** : alice@example.com / alice123
- **Bob** : bob@example.com / bob123
- **Charlie** : charlie@example.com / charlie123

## 🛠️ Technologies utilisées

### Backend
- **Python** (Flask)
- **Flask-JWT-Extended** (authentification)
- **MySQL** (base de données)
- **Pandas & NumPy** (calculs financiers)

### Frontend
- **React.js** avec Hooks
- **Tailwind CSS** (styling)

### DevOps
- **Docker** & **Docker Compose**
- **Adminer** (interface BDD)

## ✅ Fonctionnalités réalisées (demandées)

- **✅ Authentification utilisateur** : Connexion/déconnexion sécurisée avec JWT
- **✅ Simulateur de crédit** : Paramètres configurables avec calculs en temps réel
- **✅ Interface responsive** : Adaptation desktop/tablette/mobile

## 🎁 Bonus réalisés (suggérés dans le test)

- **✅ Gestion des clients** : Création et suppression
- **✅ Attribution des simulations aux clients** : Chaque simulation liée à un client

## 🚀 Bonus personnels ajoutés

- **✅ Dockerisation complète** : Application containerisée avec Docker Compose (Frontend, Backend, MySQL, Adminer)
- **✅ Sauvegarde des simulations** : Persistance en base de données avec historique
- **✅ Interface moderne professionnelle** : Design soigné avec Tailwind CSS
- **✅ Mode édition des simulations** : Modification complète des simulations existantes
- **✅ Validation robuste** : Gestion d'erreurs complète avec messages contextuels

## 🎨 Lien Figma

*Design réalisé directement en code avec Tailwind CSS*

---

*Application développée en 4 jours pour le test technique Simulio*