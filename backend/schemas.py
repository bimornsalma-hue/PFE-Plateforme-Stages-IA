from pydantic import BaseModel # type: ignore
from typing import Optional

# Ce qu'on reçoit de React quand on crée une offre
class OffreCreate(BaseModel):
    titre: str
    description: str
    ville: str
    duree: str

# Ce qu'on renvoie à React
class OffreResponse(OffreCreate):
    id: int
    class Config:
        from_attributes = True