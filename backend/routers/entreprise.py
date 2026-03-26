from fastapi import APIRouter, Depends, HTTPException # type: ignore
from sqlalchemy.orm import Session # type: ignore
from typing import List
import models, schemas
from database import get_db

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

@router.post("/offres/", response_model=schemas.OffreResponse)
def publier_offre(offre_in: schemas.OffreCreate, db: Session = Depends(get_db)):
    # On crée l'offre (entreprise_id fixé à 1 en attendant le login de Khadija)
    nouvelle_offre = models.OffreStage(
        titre=offre_in.titre,
        description=offre_in.description,
        ville=offre_in.ville,
        duree=offre_in.duree,
        entreprise_id=1 
    )
    
    # On ajoute les compétences à l'offre
    if offre_in.competences_ids:
        comps = db.query(models.Competence).filter(models.Competence.id.in_(offre_in.competences_ids)).all()
        nouvelle_offre.competences = comps

    db.add(nouvelle_offre)
    db.commit()
    db.refresh(nouvelle_offre)
    return nouvelle_offre

@router.get("/mes-offres/", response_model=List[schemas.OffreResponse])
def lire_mes_offres(db: Session = Depends(get_db)):
    return db.query(models.OffreStage).filter(models.OffreStage.entreprise_id == 1).all()

# --- ROUTES GESTION CANDIDATS + IA ---
@router.get("/offres/{offre_id}/candidats", response_model=List[schemas.CandidatResponse])
def voir_candidats(offre_id: int, db: Session = Depends(get_db)):
    candidatures = db.query(models.Candidature).filter(models.Candidature.offre_id == offre_id).all()
    
    liste_finale = []
    for cand in candidatures:
        # Calcul de l'IA
        score = calculer_score_matching(cand.etudiant.competences, cand.offre.competences)
        
        # ON RÉCUPÈRE L'EMAIL DEPUIS LA TABLE UTILISATEUR
        email_etudiant = cand.etudiant.compte.email if cand.etudiant.compte else "Email inconnu"
        
        liste_finale.append({
            "candidature_id": cand.id,
            "etudiant_id": cand.etudiant.user_id,
            "nom": cand.etudiant.nom,
            "prenom": cand.etudiant.prenom,
            "email": email_etudiant, # <--- ICI on donne l'email à Pydantic
            "statut": cand.statut,
            "score_ia": score
        })
    
    return sorted(liste_finale, key=lambda x: x['score_ia'], reverse=True)

@router.patch("/candidatures/{cand_id}/statut")
def changer_statut_candidature(cand_id: int, statut: str, db: Session = Depends(get_db)):
    cand = db.query(models.Candidature).filter(models.Candidature.id == cand_id).first()
    if not cand:
        raise HTTPException(status_code=404, detail="Candidature non trouvée")
    
    cand.statut = statut # 'Accepté' ou 'Refusé'
    db.commit()
    return {"message": f"Candidat {statut}"}
@router.get("/stats")
def obtenir_stats(db: Session = Depends(get_db)):
    # 1. Compter les offres de l'entreprise 1
    nb_offres = db.query(models.OffreStage).filter(models.OffreStage.entreprise_id == 1).count()
    
    # 2. Compter le total des candidats pour ces offres
    cands = db.query(models.Candidature).join(models.OffreStage).filter(models.OffreStage.entreprise_id == 1).all()
    nb_candidats = len(cands)
    
    # 3. Calculer le score IA moyen (Optionnel mais très Pro)
    total_score = 0
    for c in cands:
        total_score += calculer_score_matching(c.etudiant.competences, c.offre.competences)
    
    moyenne = round(total_score / nb_candidats, 1) if nb_candidats > 0 else 0

    return {
        "offres": nb_offres,
        "candidats": nb_candidats,
        "moyenne": f"{moyenne}%"
    }