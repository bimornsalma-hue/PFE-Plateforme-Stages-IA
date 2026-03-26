from pydantic import BaseModel # type: ignore
from typing import List, Optional
from datetime import datetime

# Schéma pour les compétences
class CompetenceSchema(BaseModel):
    id: int
    nom: str
    class Config: from_attributes = True

# Schéma pour créer une offre
class OffreCreate(BaseModel):
    titre: str
    description: str
    ville: str
    duree: str
    competences_ids: List[int] # Liste d'IDs des compétences requises

# Schéma de réponse pour une offre
class OffreResponse(BaseModel):
    id: int
    titre: str
    description: str
    ville: str
    duree: str
    date_pub: datetime
    competences: List[CompetenceSchema]
    class Config: from_attributes = True

# Schéma pour voir un candidat avec son score IA
class CandidatResponse(BaseModel):
    candidature_id: int
    etudiant_id: int
    nom: str
    prenom: str
    email: str
    statut: str
    score_ia: float