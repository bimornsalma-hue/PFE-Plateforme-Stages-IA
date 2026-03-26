from fastapi import APIRouter, Depends # type: ignore
from sqlalchemy.orm import Session # type: ignore
import models, schemas
from database import get_db

router = APIRouter(prefix="/admin", tags=["Administration"])

@router.get("/stats-globales")
def stats_globales(db: Session = Depends(get_db)):
    # L'Admin voit TOUT
    total_etudiants = db.query(models.Etudiant).count()
    total_entreprises = db.query(models.Entreprise).count()
    total_offres = db.query(models.OffreStage).count()
    total_candidatures = db.query(models.Candidature).count()
    
    return {
        "etudiants": total_etudiants,
        "entreprises": total_entreprises,
        "offres": total_offres,
        "candidatures": total_candidatures
    }

@router.get("/utilisateurs")
def liste_utilisateurs(db: Session = Depends(get_db)):
    # Permet de voir qui est inscrit
    return db.query(models.Utilisateur).all()

@router.post("/competences")
def ajouter_competence(nom: str, db: Session = Depends(get_db)):
    # L'Admin enrichit le dictionnaire de l'IA
    nouvelle_comp = models.Competence(nom=nom)
    db.add(nouvelle_comp)
    db.commit()
    return {"message": f"Compétence {nom} ajoutée au dictionnaire IA"}