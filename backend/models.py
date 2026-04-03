from sqlalchemy import Column, Integer, String, ForeignKey, Enum, Text, DateTime, Table, Float
from sqlalchemy.orm import relationship
from database import Base
import datetime

# --- TABLES DE JOINTURE (Correction des noms en minuscules) ---

etudiant_competence = Table('etudiant_competence', Base.metadata,
    Column('etudiant_id', Integer, ForeignKey('etudiant.user_id', ondelete="CASCADE")),
    Column('competence_id', Integer, ForeignKey('competence.id', ondelete="CASCADE"))
)

offre_competence = Table('offre_competence', Base.metadata,
    Column('offre_id', Integer, ForeignKey('offrestage.id', ondelete="CASCADE")),
    Column('competence_id', Integer, ForeignKey('competence.id', ondelete="CASCADE"))
)

# --- CLASSES PRINCIPALES ---

class Utilisateur(Base):
    __tablename__ = "utilisateur"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False)
    password = Column(String(255), nullable=False)
    role = Column(Enum('etudiant', 'entreprise', 'admin'))

class Etudiant(Base):
    __tablename__ = "etudiant"
    user_id = Column(Integer, ForeignKey("utilisateur.id", ondelete="CASCADE"), primary_key=True)
    nom = Column(String(100))
    prenom = Column(String(100))
    telephone = Column(String(20))
    
    # Relations
    compte = relationship("Utilisateur", foreign_keys=[user_id])
    competences = relationship("Competence", secondary=etudiant_competence)
    candidatures = relationship("Candidature", back_populates="etudiant")

class Entreprise(Base):
    __tablename__ = "entreprise"
    user_id = Column(Integer, ForeignKey("utilisateur.id", ondelete="CASCADE"), primary_key=True)
    nom_entreprise = Column(String(150))
    description = Column(Text)
    site_web = Column(String(255))
    ville = Column(String(100))
    adresse = Column(String(255))
    telephone = Column(String(20))
    offres = relationship("OffreStage", back_populates="proprietaire")

class OffreStage(Base):
    __tablename__ = "offrestage"
    id = Column(Integer, primary_key=True, index=True)
    titre = Column(String(150))
    description = Column(Text)
    ville = Column(String(100))
    duree = Column(String(50))
    date_pub = Column(DateTime, default=datetime.datetime.utcnow)
    entreprise_id = Column(Integer, ForeignKey("entreprise.user_id", ondelete="CASCADE"))

    proprietaire = relationship("Entreprise", back_populates="offres")
    competences = relationship("Competence", secondary=offre_competence)
    candidatures = relationship("Candidature", back_populates="offre")

class Candidature(Base):
    __tablename__ = "candidature"
    id = Column(Integer, primary_key=True, index=True)
    etudiant_id = Column(Integer, ForeignKey("etudiant.user_id", ondelete="CASCADE"))
    offre_id = Column(Integer, ForeignKey("offrestage.id", ondelete="CASCADE"))
    date_postule = Column(DateTime, default=datetime.datetime.utcnow)
    statut = Column(String(50), default="En attente")
    score_matching = Column(Float, default=0.0)

    etudiant = relationship("Etudiant", back_populates="candidatures")
    offre = relationship("OffreStage", back_populates="candidatures")

class Competence(Base):
    __tablename__ = "competence"
    id = Column(Integer, primary_key=True, index=True)
    nom = Column(String(100), unique=True)