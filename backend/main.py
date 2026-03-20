from fastapi import FastAPI  # type: ignore
import models
from database import engine
from routers import entreprise # On importe ton router

# Crée les tables dans MySQL automatiquement
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="PFE API")

# ON INCLUT TES ROUTES
app.include_router(entreprise.router)

@app.get("/")
def home():
    return {"message": "Bienvenue sur l'API PFE"}