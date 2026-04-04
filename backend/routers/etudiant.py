from fastapi import APIRouter, Depends, HTTPException, UploadFile, File # type: ignore
from sqlalchemy.orm import Session # type: ignore
from database import get_db
import models
import PyPDF2 # type: ignore
import io
from typing import List

router = APIRouter(prefix="/etudiant", tags=["Espace Étudiant"])

def lire_pdf(content):
    texte = ""
    try:
        pdf_reader = PyPDF2.PdfReader(io.BytesIO(content))
        for page in pdf_reader.pages:
            texte += page.extract_text() or ""
        return texte.lower()
    except Exception as e:
        print(f"Erreur PyPDF2 : {e}")
        return ""

@router.post("/upload-cv/{etudiant_id}")
async def upload_cv(etudiant_id: int, file: UploadFile = File(...), db: Session = Depends(get_db)):
    try:
        content = await file.read()
        texte_cv = lire_pdf(content)
        if not texte_cv:
            raise HTTPException(status_code=400, detail="Le PDF est illisible ou vide")

        etudiant = db.query(models.Etudiant).filter(models.Etudiant.user_id == etudiant_id).first()
        if not etudiant:
             etudiant = models.Etudiant(user_id=etudiant_id, nom="Utilisateur", prenom="Test")
             db.add(etudiant)
             db.commit()
             db.refresh(etudiant)

        toutes_les_comps = db.query(models.Competence).all()
        trouvees = []
        for c in toutes_les_comps:
            if c.nom.lower() in texte_cv:
                trouvees.append(c)

        etudiant.competences = trouvees
        db.commit()

        return {
            "status": "success", 
            "extraites": [c.nom for c in trouvees]
        }
    except Exception as e:
        print(f"CRASH BACKEND : {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/offres-intelligentes/{etudiant_id}")
def offres_intelligentes(etudiant_id: int, db: Session = Depends(get_db)):
    etudiant = db.query(models.Etudiant).filter(models.Etudiant.user_id == etudiant_id).first()
    
    if not etudiant or not etudiant.competences:
        return []

    mes_skills = [c.nom.lower() for c in etudiant.competences]
    toutes_offres = db.query(models.OffreStage).all()
    resultats = []

    for o in toutes_offres:
        texte_offre = f"{o.titre} {o.description}".lower()
        
        points = 0
        for skill in mes_skills:
            if skill in texte_offre:
                points += 1
        
        score = round((points / len(mes_skills)) * 100, 1) if len(mes_skills) > 0 else 0

        # --- LA CORRECTION EST ICI (FILTRE DE RIGUEUR) ---
        # On considère qu'en dessous de 20%, ce n'est pas le bon "thème".
        # Donc on n'ajoute l'offre à la liste QUE si le score est supérieur à 20%
        if score >= 15: 
            resultats.append({
                "id": o.id,
                "titre": o.titre,
                "description": o.description,
                "ville": o.ville,
                "duree": o.duree,
                "score_ia": score
            })

    return sorted(resultats, key=lambda x: x['score_ia'], reverse=True)
@router.post("/postuler")
def postuler(etudiant_id: int, offre_id: int, db: Session = Depends(get_db)):
    etudiant = db.query(models.Etudiant).filter(models.Etudiant.user_id == etudiant_id).first()
    if not etudiant:
        etudiant = models.Etudiant(user_id=etudiant_id, nom="Utilisateur", prenom="Nouveau")
        db.add(etudiant)
        db.commit()

    deja_postule = db.query(models.Candidature).filter(
        models.Candidature.etudiant_id == etudiant_id,
        models.Candidature.offre_id == offre_id
    ).first()
    
    if deja_postule:
        raise HTTPException(status_code=400, detail="Vous avez déjà postulé à ce stage.")

    nouvelle_cand = models.Candidature(etudiant_id=etudiant_id, offre_id=offre_id, statut="En attente")
    
    try:
        db.add(nouvelle_cand)
        db.commit()
        return {"status": "success", "message": "Candidature envoyée !"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Erreur base de données")

@router.get("/competences_liste")
def competences_liste(db: Session = Depends(get_db)):
    return db.query(models.Competence).all()

# 5. Route pour voir MES candidatures
@router.get("/mes-candidatures/{etudiant_id}")
def mes_candidatures(etudiant_id: int, db: Session = Depends(get_db)):
    # On récupère les candidatures avec les détails de l'offre
    cands = db.query(models.Candidature).filter(models.Candidature.etudiant_id == etudiant_id).all()
    
    res = []
    for c in cands:
        # On va chercher l'offre liée à cette candidature
        offre = db.query(models.OffreStage).filter(models.OffreStage.id == c.offre_id).first()
        res.append({
            "id": c.id,
            "titre_offre": offre.titre if offre else "Offre supprimée",
            "ville": offre.ville if offre else "-",
            "date": c.date_postule.strftime("%d/%m/%Y"), # Formatage de la date
            "statut": c.statut,
            "score": c.score_matching
        })
    return res


# 6. Récupérer les infos personnelles du profil
@router.get("/profil/{etudiant_id}")
def voir_profil(etudiant_id: int, db: Session = Depends(get_db)):
    etudiant = db.query(models.Etudiant).filter(models.Etudiant.user_id == etudiant_id).first()
    if not etudiant:
        raise HTTPException(status_code=404, detail="Profil non trouvé")
    return etudiant

# 7. Mettre à jour les infos du profil
# 7. Mettre à jour les infos du profil
# Route pour modifier le profil étudiant au complet
# 1. RÉCUPÉRER LE PROFIL (S'il n'existe pas, on le crée)
# 1. RÉCUPÉRER LE PROFIL (Pour l'affichage dans React)
@router.get("/profil/{etudiant_id}")
def voir_profil(etudiant_id: int, db: Session = Depends(get_db)):
    etudiant = db.query(models.Etudiant).filter(models.Etudiant.user_id == etudiant_id).first()
    if not etudiant:
        # On crée le profil s'il n'existe pas
        etudiant = models.Etudiant(user_id=etudiant_id, nom="", prenom="", telephone="")
        db.add(etudiant)
        db.commit()
        db.refresh(etudiant)
    return etudiant

# 2. SAUVEGARDER LE PROFIL (Pour le bouton Enregistrer)
@router.put("/profil/{etudiant_id}")
def modifier_profil(etudiant_id: int, nom: str, prenom: str, telephone: str, db: Session = Depends(get_db)):
    etudiant = db.query(models.Etudiant).filter(models.Etudiant.user_id == etudiant_id).first()
    
    if not etudiant:
        raise HTTPException(status_code=404, detail="Étudiant introuvable")

    # Mise à jour des colonnes de la base de données
    etudiant.nom = nom
    etudiant.prenom = prenom
    etudiant.telephone = telephone

    db.commit() # ÉCRITURE RÉELLE DANS MYSQL
    return {"status": "success", "message": "Données enregistrées"}