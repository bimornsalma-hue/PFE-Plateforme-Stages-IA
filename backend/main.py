from fastapi import FastAPI  # type: ignore
from fastapi.middleware.cors import CORSMiddleware # type: ignore
import models
from database import engine
from routers import entreprise 
from routers import admin
from routers import auth
from routers import  etudiant 

# Crée les tables dans MySQL automatiquement
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="PFE API")

# --- CONFIGURATION CORS  ---
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

# Configuration CORS pour React
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# LES ROUTES
app.include_router(entreprise.router)
app.include_router(admin.router)
app.include_router(auth.router)
app.include_router(etudiant.router)
@app.get("/")
def home():
    return {"message": "Bienvenue sur l'API PFE"}