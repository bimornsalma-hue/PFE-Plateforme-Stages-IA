import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MapPin, Clock, Send, FileText, BrainCircuit, CheckCircle } from 'lucide-react';

const EspaceEtudiant = ({ userId }) => {
  const [offres, setOffres] = useState([]);
  const [loadingCV, setLoadingCV] = useState(false);
  const [isAnalyzed, setIsAnalyzed] = useState(false);

  // --- 1. FONCTION POUR RÉCUPÉRER LES OFFRES ---
  const fetchOffres = async () => {
    try {
      const res = await axios.get(`http://127.0.0.1:8000/etudiant/offres-intelligentes/${userId}`);
      setOffres(res.data);
    } catch (err) {
      console.error("Erreur lors du chargement des offres", err);
    }
  };

  useEffect(() => {
    fetchOffres();
  }, []);

  // --- 2. FONCTION POUR UPLOADER ET ANALYSER LE CV ---
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    setLoadingCV(true); // Active l'état de chargement

    try {
      const res = await axios.post(`http://127.0.0.1:8000/etudiant/upload-cv/${userId}`, formData);
      
      // On utilise "extraites" car c'est le nom envoyé par ton Python
      alert("Analyse terminée ! Compétences détectées : " + res.data.extraites.join(', '));
      
      setIsAnalyzed(true); // Affiche la section des résultats
      fetchOffres(); // Rafraîchit les scores IA
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'analyse du CV.");
    } finally {
      // CETTE LIGNE DÉBLOQUE LE BOUTON (Remet le texte normal)
      setLoadingCV(false);
    }
  };

  // --- 3. FONCTION POUR POSTULER ---
  const handlePostuler = async (offreId) => {
    try {
      const response = await axios.post('http://127.0.0.1:8000/etudiant/postuler', null, {
        params: { 
            etudiant_id: userId, 
            offre_id: offreId 
        }
      });
      
      if (response.data.status === "success") {
        alert("Félicitations ! Votre candidature a été envoyée.");
      }
    } catch (err) {
      alert(err.response?.data?.detail || "Erreur lors de la postulation");
    }
  };

  return (
    <div className="p-8 space-y-10">
      
      {/* ZONE D'IMPORTATION CV (Toujours visible) */}
      <div className="bg-white p-8 rounded-2xl shadow-lg border-2 border-dashed border-blue-200 text-center">
        <BrainCircuit size={50} className="mx-auto text-blue-600 mb-4" />
        <h2 className="text-2xl font-bold text-slate-800">Importer votre CV</h2>
        <p className="text-slate-500 mt-2 mb-6">Notre IA va analyser vos compétences pour vous proposer les meilleurs stages.</p>
        
        <input type="file" id="cvInput" className="hidden" onChange={handleFileUpload} accept=".pdf" />
        <label htmlFor="cvInput" className="inline-flex items-center bg-[#7d4b5e] text-white px-8 py-3 rounded-xl font-bold cursor-pointer hover:bg-[#5a3644] transition shadow-md">
          <FileText className="mr-2" /> 
          {loadingCV ? "Analyse en cours..." : "Choisir le CV (PDF)"}
        </label>
      </div>

      {/* SECTION DES RÉSULTATS (Visible après analyse) */}
      {isAnalyzed && (
        <div className="animate-in fade-in duration-700">
          <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center">
             Stages compatibles avec votre profil
          </h2>

          {/* Si aucune offre ne correspond au CV (offres vide) */}
          {offres.length === 0 ? (
            <div className="text-center p-10 bg-slate-50 rounded-xl border border-dashed border-slate-300">
              <p className="text-slate-500 text-lg font-medium">
                Aucun stage ne correspond à votre profil pour le moment. 
                <br/> <span className="text-sm">Essayez d'importer un CV contenant d'autres compétences.</span>
              </p>
            </div>
          ) : (
            /* Liste des stages triés */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {offres.map((offre) => (
                <div key={offre.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative hover:shadow-md transition">
                  
                  {/* Badge de compatibilité IA */}
                  <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold border ${
                    offre.score_ia > 50 ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-blue-100 text-blue-700 border-blue-200'
                  }`}>
                    {offre.score_ia}% compatible
                  </div>

                  <h3 className="text-xl font-bold text-slate-800 mb-2 pr-24">{offre.titre}</h3>
                  <div className="flex space-x-4 text-slate-500 text-sm mb-4">
                    <span className="flex items-center"><MapPin size={16} className="mr-1"/> {offre.ville}</span>
                    <span className="flex items-center"><Clock size={16} className="mr-1"/> {offre.duree}</span>
                  </div>
                  <p className="text-slate-600 mb-6 line-clamp-3 text-sm">{offre.description}</p>
                  
                  <button 
                    onClick={() => handlePostuler(offre.id)}
                    className="w-full bg-[#5a3644] text-white py-3 rounded-xl font-semibold flex justify-center items-center hover:bg-[#7d4b5e] transition"
                  >
                    <Send size={18} className="mr-2"/> Postuler maintenant
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EspaceEtudiant;