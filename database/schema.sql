CREATE DATABASE pfe_gestion_stages;
USE pfe_gestion_stages;

-- 1. Table Utilisateur
CREATE TABLE Utilisateur (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('etudiant', 'entreprise', 'admin') NOT NULL
);

-- 2. Table Etudiant
CREATE TABLE Etudiant (
    user_id INT PRIMARY KEY,
    nom VARCHAR(100),
    prenom VARCHAR(100),
    telephone VARCHAR(20),
    cv_url VARCHAR(255),
    FOREIGN KEY (user_id) REFERENCES Utilisateur(id) ON DELETE CASCADE
);

-- 3. Table Entreprise
CREATE TABLE Entreprise (
    user_id INT PRIMARY KEY,
    nom_entreprise VARCHAR(150),
    description TEXT,
    site_web VARCHAR(255),
    FOREIGN KEY (user_id) REFERENCES Utilisateur(id) ON DELETE CASCADE
);

-- 4. Table OffreStage
CREATE TABLE OffreStage (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titre VARCHAR(150),
    description TEXT,
    ville VARCHAR(100),
    duree VARCHAR(50),
    date_pub DATE,
    entreprise_id INT,
    FOREIGN KEY (entreprise_id) REFERENCES Entreprise(user_id) ON DELETE CASCADE
);

-- 5. Table Candidature
CREATE TABLE Candidature (
    id INT AUTO_INCREMENT PRIMARY KEY,
    etudiant_id INT,
    offre_id INT,
    date_postule TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    statut VARCHAR(50) DEFAULT 'En attente',
    FOREIGN KEY (etudiant_id) REFERENCES Etudiant(user_id),
    FOREIGN KEY (offre_id) REFERENCES OffreStage(id)
);

-- 6. Table Competence (Pour l'IA)
CREATE TABLE Competence (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) UNIQUE
);

-- 7. Jointures pour l'algorithme de matching
CREATE TABLE Etudiant_Competence (
    etudiant_id INT,
    competence_id INT,
    PRIMARY KEY (etudiant_id, competence_id),
    FOREIGN KEY (etudiant_id) REFERENCES Etudiant(user_id),
    FOREIGN KEY (competence_id) REFERENCES Competence(id)
);

CREATE TABLE Offre_Competence (
    offre_id INT,
    competence_id INT,
    PRIMARY KEY (offre_id, competence_id),
    FOREIGN KEY (offre_id) REFERENCES OffreStage(id),
    FOREIGN KEY (competence_id) REFERENCES Competence(id)
);