from fastapi import APIRouter, Depends, HTTPException, status # type: ignore
from sqlalchemy.orm import Session # type: ignore
from typing import List
import models, schemas
from database import get_db
from sqlalchemy import func # type: ignore

router = APIRouter(prefix="/entreprise", tags=["Entreprise"])

# --- ROUTE : STATISTIQUES GLOBALES (FIXED) ---
@router.get("/stats")
def obtenir_stats(entreprise_id: int, db: Session = Depends(get_db)):
    # 1. Nombre d'offres
    nb_offres = db.query(models.OffreStage).filter(models.OffreStage.entreprise_id == entreprise_id).count()
    
    # 2. On récupère toutes les offres de cette entreprise pour compter les candidats
    mes_offres_ids = db.query(models.OffreStage.id).filter(models.OffreStage.entreprise_id == entreprise_id).all()
    ids = [o[0] for o in mes_offres_ids]

    # 3. Total des candidats sur toutes les offres
    total_candidats = db.query(models.Candidature).filter(models.Candidature.offre_id.in_(ids)).count() if ids else 0

    # 4. Moyenne de matching IA (Simulée ou réelle selon tes données)
    # Pour le PFE, on fait la moyenne des scores de la table candidature
    moyenne_val = db.query(func.avg(models.Candidature.score_matching)).filter(models.Candidature.offre_id.in_(ids)).scalar() if ids else 0
    moyenne_label = f"{round(float(moyenne_val or 0), 1)}%"

    return {
        "offres": nb_offres,
        "candidats": total_candidats,
        "moyenne": moyenne_label
    }

# --- ROUTE : ACCEPTER / REFUSER CANDIDAT (FIXED) ---
@router.patch("/candidatures/{cand_id}/statut")
def changer_statut_candidature(cand_id: int, statut: str, db: Session = Depends(get_db)):
    cand = db.query(models.Candidature).filter(models.Candidature.id == cand_id).first()
    if not cand:
        raise HTTPException(status_code=404, detail="Candidature non trouvée")
    
    cand.statut = statut # 'Accepté' ou 'Refusé'
    db.commit()
    return {"status": "success", "message": f"Candidat {statut}"}

# --- ROUTE : PUBLIER UNE OFFRE ---
@router.post("/offres/")
def publier_offre(offre_in: schemas.OffreCreate, entreprise_id: int, db: Session = Depends(get_db)):
    ent = db.query(models.Entreprise).filter(models.Entreprise.user_id == entreprise_id).first()
    if not ent:
        ent = models.Entreprise(user_id=entreprise_id, nom_entreprise="Entreprise en attente")
        db.add(ent)
        db.commit()

    nouvelle_offre = models.OffreStage(
        titre=offre_in.titre, description=offre_in.description,
        ville=offre_in.ville, duree=offre_in.duree, entreprise_id=entreprise_id
    )
    if offre_in.competences_ids:
        comps = db.query(models.Competence).filter(models.Competence.id.in_(offre_in.competences_ids)).all()
        nouvelle_offre.competences = comps

    db.add(nouvelle_offre)
    db.commit()
    return {"status": "success", "message": "Offre publiée"}

# --- ROUTE : VOIR MES OFFRES ---
@router.get("/mes-offres/")
def lire_mes_offres(entreprise_id: int, db: Session = Depends(get_db)):
    return db.query(models.OffreStage).filter(models.OffreStage.entreprise_id == entreprise_id).all()

# --- ROUTE : VOIR LES CANDIDATS D'UNE OFFRE (AVEC IA FIXED) ---
@router.get("/offres/{offre_id}/candidats")
def voir_candidats(offre_id: int, db: Session = Depends(get_db)):
    candidatures = db.query(models.Candidature).filter(models.Candidature.offre_id == offre_id).all()
    res = []
    for c in candidatures:
        # On récupère les skills du CV (étudiant) et de l'offre (entreprise)
        skills_etudiant = [comp.nom.lower() for comp in c.etudiant.competences]
        skills_offre = [comp.nom.lower() for comp in c.offre.competences]
        
        # SI PAS DE SKILLS DANS LE CV : SCORE = 0 (FIX BUG 100%)
        if not skills_etudiant:
            score = 0.0
        else:
            # Calcul : Combien de mots du CV sont dans le titre/description de l'offre
            texte_offre = f"{c.offre.titre} {c.offre.description}".lower()
            trouves = sum(1 for s in skills_etudiant if s in texte_offre)
            score = round((trouves / len(skills_etudiant)) * 100, 1)
            
        # On met à jour le score dans la BDD pour tes statistiques
        c.score_matching = score
        db.commit()

        res.append({
            "candidature_id": c.id,
            "nom": c.etudiant.nom or "Inconnu",
            "prenom": c.etudiant.prenom or "Étudiant",
            "email": c.etudiant.compte.email if c.etudiant.compte else "N/A",
            "competences": [comp.nom for comp in c.etudiant.competences],
            "points_forts": [s for s in [comp.nom for comp in c.etudiant.competences] if s.lower() in f"{c.offre.titre} {c.offre.description}".lower()],
            "score_ia": score,
            "statut": c.statut
        })
    return res

# --- GESTION PROFIL ---
@router.get("/profil/{entreprise_id}")
def voir_profil_entreprise(entreprise_id: int, db: Session = Depends(get_db)):
    return db.query(models.Entreprise).filter(models.Entreprise.user_id == entreprise_id).first()

@router.put("/profil/{entreprise_id}")
def modifier_profil_entreprise(entreprise_id: int, nom_entreprise: str, description: str, site_web: str, ville: str, adresse: str, telephone: str, db: Session = Depends(get_db)):
    ent = db.query(models.Entreprise).filter(models.Entreprise.user_id == entreprise_id).first()
    if ent:
        ent.nom_entreprise, ent.description, ent.site_web, ent.ville, ent.adresse, ent.telephone = nom_entreprise, description, site_web, ville, adresse, telephone
        db.commit()
    return {"status": "success"}

# Cette fonction calcule les barres bordeaux pour le Dashboard
@router.get("/top-competences")
def obtenir_top_competences(db: Session = Depends(get_db)):
    # On importe la table de lien entre les offres et les skills
    from models import offre_competence
    
    # On compte les compétences les plus demandées
    stats = db.query(models.Competence.nom, func.count(offre_competence.c.competence_id))\
        .join(offre_competence)\
        .group_by(models.Competence.nom)\
        .order_by(func.count(offre_competence.c.competence_id).desc())\
        .limit(5).all()
    
    return [{"nom": s[0], "total": s[1]} for s in stats]