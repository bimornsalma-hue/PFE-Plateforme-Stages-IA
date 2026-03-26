from sqlalchemy import Column, Integer, String, ForeignKey, Enum, Text, DateTime, Table, Float # type: ignore
from sqlalchemy.orm import relationship # type: ignore
from database import Base
import datetime

# --- TABLES DE JOINTURE (Pour l'IA) ---
etudiant_competence = Table('etudiant_competence', Base.metadata,
    Column('etudiant_id', Integer, ForeignKey('Etudiant.user_id', ondelete="CASCADE")),
    Column('competence_id', Integer, ForeignKey('Competence.id', ondelete="CASCADE"))
)

offre_competence = Table('offre_competence', Base.metadata,
    Column('offre_id', Integer, ForeignKey('OffreStage.id', ondelete="CASCADE")),
    Column('competence_id', Integer, ForeignKey('Competence.id', ondelete="CASCADE"))
)

# --- TABLES PRINCIPALES ---

class Utilisateur(Base):
    __tablename__ = "Utilisateur"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False)
    password = Column(String(255), nullable=False)
    role = Column(Enum('etudiant', 'entreprise', 'admin'), nullable=False)

class Etudiant(Base):
    __tablename__ = "Etudiant"
    user_id = Column(Integer, ForeignKey("Utilisateur.id", ondelete="CASCADE"), primary_key=True)
    nom = Column(String(100))
    prenom = Column(String(100))
    telephone = Column(String(20))
    cv_url = Column(String(255))
    compte = relationship("Utilisateur") 
    
    # Relations
    competences = relationship("Competence", secondary=etudiant_competence)
    candidatures = relationship("Candidature", back_populates="etudiant")

class Entreprise(Base):
    __tablename__ = "Entreprise"
    user_id = Column(Integer, ForeignKey("Utilisateur.id", ondelete="CASCADE"), primary_key=True)
    nom_entreprise = Column(String(150))
    description = Column(Text)
    site_web = Column(String(255))
    adresse = Column(String(255))
    ville = Column(String(100))
    
    # Relations
    offres = relationship("OffreStage", back_populates="proprietaire")

class OffreStage(Base):
    __tablename__ = "OffreStage"
    id = Column(Integer, primary_key=True, index=True)
    titre = Column(String(150))
    description = Column(Text)
    ville = Column(String(100))
    duree = Column(String(50))
    date_pub = Column(DateTime, default=datetime.datetime.utcnow)
    entreprise_id = Column(Integer, ForeignKey("Entreprise.user_id", ondelete="CASCADE"))

    # Relations
    proprietaire = relationship("Entreprise", back_populates="offres")
    competences = relationship("Competence", secondary=offre_competence)
    candidatures = relationship("Candidature", back_populates="offre")

class Candidature(Base):
    __tablename__ = "Candidature"
    id = Column(Integer, primary_key=True, index=True)
    etudiant_id = Column(Integer, ForeignKey("Etudiant.user_id", ondelete="CASCADE"))
    offre_id = Column(Integer, ForeignKey("OffreStage.id", ondelete="CASCADE"))
    date_postule = Column(DateTime, default=datetime.datetime.utcnow)
    statut = Column(String(50), default="En attente")
    
    # AJOUTE CETTE LIGNE ICI :
    score_matching = Column(Float, default=0.0) 
    
    etudiant = relationship("Etudiant", back_populates="candidatures")
    offre = relationship("OffreStage", back_populates="candidatures")

class Competence(Base):
    __tablename__ = "Competence"
    id = Column(Integer, primary_key=True, index=True)
    nom = Column(String(100), unique=True, nullable=False)