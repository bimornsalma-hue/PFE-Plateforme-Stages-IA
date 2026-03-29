from fastapi import APIRouter, Depends, HTTPException # type: ignore
from sqlalchemy.orm import Session # type: ignore
from typing import List
import models, schemas
from database import get_db
from sqlalchemy import func # type: ignore

router = APIRouter(prefix="/entreprise", tags=["Entreprise"])

# --- LOGIQUE IA : ALGORITHME DE MATCHING ---
def calculer_score_matching(competences_etudiant, competences_offre):
    """
    Calcule le pourcentage de correspondance entre l'étudiant et l'offre.
    Formule : (Compétences communes / Compétences requises) * 100
    """
    if not competences_offre:
        return 0.0
    
    ids_etudiant = {c.id for c in competences_etudiant}
    ids_offre = {c.id for c in competences_offre}
    
    communes = ids_etudiant.intersection(ids_offre)
    score = (len(communes) / len(ids_offre)) * 100
    return round(score, 2)

# --- ROUTES CRUD OFFRES ---

# 1. Pour publier une offre avec le bon ID
@router.post("/offres/", response_model=schemas.OffreResponse)
def publier_offre(offre_in: schemas.OffreCreate, entreprise_id: int = 1, db: Session = Depends(get_db)):
    # On utilise l'id envoyé (par défaut 1 si rien n'est envoyé)
    nouvelle_offre = models.OffreStage(
        **offre_in.dict(exclude={'competences_ids'}), 
        entreprise_id=entreprise_id 
    )
    
    if offre_in.competences_ids:
        comps = db.query(models.Competence).filter(models.Competence.id.in_(offre_in.competences_ids)).all()
        nouvelle_offre.competences = comps

    db.add(nouvelle_offre)
    db.commit()
    db.refresh(nouvelle_offre)
    return nouvelle_offre

# 2. Pour voir seulement MES offres
@router.get("/mes-offres/", response_model=List[schemas.OffreResponse])
def lire_mes_offres(entreprise_id: int, db: Session = Depends(get_db)):
    return db.query(models.OffreStage).filter(models.OffreStage.entreprise_id == entreprise_id).all()

# --- ROUTES GESTION CANDIDATS + IA ---
@router.get("/offres/{offre_id}/candidats")
def voir_candidats(offre_id: int, db: Session = Depends(get_db)):
    candidatures = db.query(models.Candidature).filter(models.Candidature.offre_id == offre_id).all()
    res = []
    for c in candidatures:
        # On récupère toutes les compétences de l'étudiant pour le profil détaillé
        ses_competences = [comp.nom for comp in c.etudiant.competences]
        competences_offre = {comp.nom for comp in c.offre.competences}
        
        # Points communs pour l'IA
        communes = list(set(ses_competences).intersection(competences_offre))
        score = round((len(communes) / len(competences_offre)) * 100, 2) if competences_offre else 0

        res.append({
            "candidature_id": c.id,
            "nom": c.etudiant.nom,
            "prenom": c.etudiant.prenom,
            "telephone": c.etudiant.telephone, # AJOUT
            "email": c.etudiant.compte.email if c.etudiant.compte else "N/A",
            "competences": ses_competences, # TOUTES ses compétences
            "points_forts": communes, # Points communs avec l'offre
            "score_ia": score,
            "statut": c.statut
        })
    return res
    
@router.patch("/candidatures/{cand_id}/statut")
def changer_statut_candidature(cand_id: int, statut: str, db: Session = Depends(get_db)):
    cand = db.query(models.Candidature).filter(models.Candidature.id == cand_id).first()
    if not cand:
        raise HTTPException(status_code=404, detail="Candidature non trouvée")
    
    cand.statut = statut # 'Accepté' ou 'Refusé'
    db.commit()
    return {"message": f"Candidat {statut}"}
@router.get("/stats")
def obtenir_stats(entreprise_id: int, db: Session = Depends(get_db)): # <--- Vérifie bien cet argument
    # On utilise entreprise_id (la variable) et pas le chiffre 1
    nb_offres = db.query(models.OffreStage).filter(models.OffreStage.entreprise_id == entreprise_id).count()
    
    # Récupérer l'ID d'une offre pour éviter l'erreur "undefined"
    offres = db.query(models.OffreStage).filter(models.OffreStage.entreprise_id == entreprise_id).all()
    id_a_afficher = offres[0].id if offres else 0

    return {
        "offres": nb_offres,
        "candidats": 1, # Pour le test
        "moyenne": "50%",
        "derniere_offre_id": id_a_afficher
    }

@router.get("/top-competences")
def obtenir_top_competences(db: Session = Depends(get_db)):
    # Calcul des compétences les plus demandées dans les offres
    stats = db.query(models.Competence.nom, func.count(models.offre_competence.c.competence_id).label('total'))\
        .join(models.offre_competence)\
        .group_by(models.Competence.nom)\
        .order_by(func.count(models.offre_competence.c.competence_id).desc())\
        .limit(5).all()
    
    return [{"nom": s[0], "total": s[1]} for s in stats]