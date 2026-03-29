from http.client import HTTPException
from fastapi import APIRouter, Depends # type: ignore
from sqlalchemy.orm import Session # type: ignore
import models, schemas
from database import get_db
from sqlalchemy import func # type: ignore

router = APIRouter(prefix="/admin", tags=["Administration"])

@router.get("/stats-globales")
def obtenir_stats_globales(db: Session = Depends(get_db)):
    # On compte chaque table
    return {
        "etudiants": db.query(models.Etudiant).count(),
        "entreprises": db.query(models.Entreprise).count(),
        "offres": db.query(models.OffreStage).count(),
        "competences": db.query(models.Competence).count() 
    }

@router.get("/utilisateurs")
def liste_utilisateurs(db: Session = Depends(get_db)):
    users = db.query(models.Utilisateur).all()
    resultats = []
    
    for u in users:
        user_info = {
            "id": u.id,
            "email": u.email,
            "role": u.role,
            "details": {}
        }
        
        # Si c'est un étudiant, on va chercher son nom/prénom
        if u.role == "etudiant":
            profil = db.query(models.Etudiant).filter(models.Etudiant.user_id == u.id).first()
            if profil:
                user_info["details"] = {
                    "nom": profil.nom,
                    "prenom": profil.prenom,
                    "telephone": profil.telephone
                }
        
        # Si c'est une entreprise, on va chercher le nom de la société/ville
        elif u.role == "entreprise":
            profil = db.query(models.Entreprise).filter(models.Entreprise.user_id == u.id).first()
            if profil:
                user_info["details"] = {
                    "nom_entreprise": profil.nom_entreprise,
                    "ville": profil.ville,
                    "site_web": profil.site_web
                }
                
        resultats.append(user_info)
        
    return resultats

@router.delete("/utilisateurs/{user_id}")
def supprimer_utilisateur(user_id: int, db: Session = Depends(get_db)):
    user = db.query(models.Utilisateur).filter(models.Utilisateur.id == user_id).first()
    if user:
        db.delete(user)
        db.commit()
        return {"message": "Utilisateur supprimé"}
    raise HTTPException(status_code=404, detail="Introuvable")

@router.post("/competences")
def ajouter_competence(nom: str, db: Session = Depends(get_db)):
    # L'Admin enrichit le dictionnaire de l'IA
    nouvelle_comp = models.Competence(nom=nom)
    db.add(nouvelle_comp)
    db.commit()
    return {"message": f"Compétence {nom} ajoutée au dictionnaire IA"}

@router.get("/toutes-les-offres")
def liste_offres_globales(db: Session = Depends(get_db)):
    return db.query(models.OffreStage).all()

@router.delete("/offres/{offre_id}")
def supprimer_offre_admin(offre_id: int, db: Session = Depends(get_db)):
    offre = db.query(models.OffreStage).filter(models.OffreStage.id == offre_id).first()
    if not offre:
        raise HTTPException(status_code=404, detail="Offre non trouvée")
    db.delete(offre)
    db.commit()
    return {"message": "Supprimé"}


@router.get("/stats-villes")
def obtenir_stats_villes(db: Session = Depends(get_db)):
    # On groupe par ville et on compte les IDs d'offres
    stats = db.query(models.OffreStage.ville, func.count(models.OffreStage.id))\
        .group_by(models.OffreStage.ville)\
        .order_by(func.count(models.OffreStage.id).desc()).all()
    
    return [{"ville": s[0] if s[0] else "Non précisé", "count": s[1]} for s in stats]