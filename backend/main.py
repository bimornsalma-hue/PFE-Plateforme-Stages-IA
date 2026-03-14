from fastapi import FastAPI  # type: ignore 

app = FastAPI(title="PFE Gestion de Stages API")

@app.get("/")
def read_root():
    return {"message": "Bienvenue sur l'API de gestion des stages"}