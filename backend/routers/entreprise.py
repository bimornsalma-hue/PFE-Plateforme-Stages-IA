from fastapi import APIRouter, Depends, HTTPException # type: ignore
from sqlalchemy.orm import Session # type: ignore
import models, schemas
from database import get_db

router = APIRouter(prefix="/entreprise", tags=["Entreprise"])

@router.post("/offres/")
def publier_offre(offre: schemas.OffreCreate, db: Session = Depends(get_db)):
    # Simuler une entreprise connectée (id 1)
    nouvelle_offre = models.OffreStage(**offre.dict(), entreprise_id=1)
    db.add(nouvelle_offre)
    db.commit()
    db.refresh(nouvelle_offre)
    return {"message": "Offre publiée avec succès", "data": nouvelle_offre}

@router.get("/mes-offres/")
def liste_offres(db: Session = Depends(get_db)):
    return db.query(models.OffreStage).all()