from sqlalchemy import Table, Column, Integer, String, ForeignKey, Enum, Text, DateTime # type: ignore
from sqlalchemy.orm import relationship # type: ignore
from database import Base
import datetime

# Table de jointure pour l'IA (Matching compétences)
offre_competence = Table('offre_competence', Base.metadata,
    Column('offre_id', Integer, ForeignKey('OffreStage.id')),
    Column('competence_id', Integer, ForeignKey('Competence.id'))
)

class Utilisateur(Base):
    __tablename__ = "Utilisateur"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False)
    password = Column(String(255), nullable=False)
    role = Column(Enum('etudiant', 'entreprise', 'admin'), nullable=False)

class Entreprise(Base):
    __tablename__ = "Entreprise"
    user_id = Column(Integer, ForeignKey("Utilisateur.id"), primary_key=True)
    nom_entreprise = Column(String(150))
    description = Column(Text)
    site_web = Column(String(255))
    
    # Lien vers ses offres de stage
    offres = relationship("OffreStage", back_populates="proprietaire")

class OffreStage(Base):
    __tablename__ = "OffreStage"
    id = Column(Integer, primary_key=True, index=True)
    titre = Column(String(150))
    description = Column(Text)
    ville = Column(String(100))
    duree = Column(String(50))
    date_pub = Column(DateTime, default=datetime.datetime.utcnow)
    entreprise_id = Column(Integer, ForeignKey("Entreprise.user_id"))

    proprietaire = relationship("Entreprise", back_populates="offres")
    
class Competence(Base):
    __tablename__ = "Competence"
    id = Column(Integer, primary_key=True, index=True)
    nom = Column(String(100), unique=True)