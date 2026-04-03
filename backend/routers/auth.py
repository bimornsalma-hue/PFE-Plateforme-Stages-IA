from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database import get_db
import models

router = APIRouter(
    prefix="/auth",
    tags=["Authentification"]
)

# --- SCHEMA UNIQUE POUR LE LOGIN ---
class LoginRequest(BaseModel):
    email: str
    password: str
    role: str # 'admin', 'entreprise' ou 'etudiant'

# 1. Route pour l'inscription (Register)
@router.post("/register")
def register(email: str, password: str, role: str, db: Session = Depends(get_db)):
    db_user = db.query(models.Utilisateur).filter(models.Utilisateur.email == email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Cet email est déjà utilisé")

    new_user = models.Utilisateur(email=email, password=password, role=role)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    if role == "etudiant":
        db.add(models.Etudiant(user_id=new_user.id))
    elif role == "entreprise":
        db.add(models.Entreprise(user_id=new_user.id))
    
    db.commit()
    return {"status": "success", "message": f"Compte {role} créé !", "user_id": new_user.id}

# 2. Route pour la connexion (Login) avec vérification du rôle
@router.post("/login")
def login(data: LoginRequest, db: Session = Depends(get_db)):
    # On cherche l'utilisateur dans la base par son email
    user = db.query(models.Utilisateur).filter(models.Utilisateur.email == data.email).first()
    
    # Vérification Email et Mot de Passe
    if not user or user.password != data.password:
        raise HTTPException(status_code=401, detail="Email ou mot de passe incorrect")

    # VERIFICATION DE SÉCURITÉ : Le rôle choisi sur le site doit correspondre au rôle en BDD
    if user.role != data.role:
        raise HTTPException(
            status_code=403, 
            detail=f"Accès refusé : Votre compte est un compte {user.role}. Veuillez vous connecter via l'espace dédié."
        )

    return {
        "status": "success",
        "message": "Connexion réussie",
        "user": {
            "id": user.id, 
            "email": user.email, 
            "role": user.role
        }
    }