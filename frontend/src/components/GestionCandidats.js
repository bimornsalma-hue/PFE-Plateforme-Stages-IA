import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { UserCheck, UserX, Cpu } from 'lucide-react';

const GestionCandidats = ({ offreId }) => {
  const [candidats, setCandidats] = useState([]);

  // Fonction pour charger les candidats
  const fetchCandidats = async () => {
    try {
      const res = await axios.get(`http://127.0.0.1:8000/entreprise/offres/${offreId}/candidats`);
      setCandidats(res.data);
    } catch (err) {
      console.error("Erreur de chargement", err);
    }
  };

  useEffect(() => {
    fetchCandidats();
  }, [offreId]);

  // --- LA FONCTION QUI MANQUAIT ---
  const handleStatut = async (candidatureId, nouveauStatut) => {
    try {
      // On appelle l'API patch qu'on a créée dans routers/entreprise.py
      await axios.patch(`http://127.0.0.1:8000/entreprise/candidatures/${candidatureId}/statut?statut=${nouveauStatut}`);
      
      // On rafraîchit la liste pour voir le changement
      fetchCandidats(); 
      alert(`Candidat ${nouveauStatut} !`);
    } catch (err) {
      alert("Erreur lors de la mise à jour");
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-6 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
        <h3 className="font-bold text-slate-800">Candidats Priorisés par l'IA</h3>
        <span className="flex items-center text-xs font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
          <Cpu className="w-3 h-3 mr-1" /> Algorithm v1.0 Active
        </span>
      </div>
      <table className="w-full text-left">
        <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
          <tr>
            <th className="px-6 py-4 font-semibold">Candidat</th>
            <th className="px-6 py-4 font-semibold text-center">Score de Matching</th>
            <th className="px-6 py-4 font-semibold text-center">Statut</th>
            <th className="px-6 py-4 font-semibold text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-sm">
          {candidats.map(c => (
            <tr key={c.candidature_id} className="hover:bg-slate-50/50 transition">
              <td className="px-6 py-4">
                <div className="font-medium text-slate-900">{c.nom} {c.prenom}</div>
                <div className="text-xs text-slate-400">Postulé récemment</div>
              </td>
              <td className="px-6 py-4 text-center">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${c.score_ia > 75 ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>
                  {c.score_ia}% match
                </span>
              </td>
              <td className="px-6 py-4 text-center">
                <span className="text-slate-600 bg-slate-100 px-2 py-1 rounded text-xs">{c.statut}</span>
              </td>
              <td className="px-6 py-4 text-right space-x-2">
                {/* BOUTON ACCEPTER */}
                <button 
                  onClick={() => handleStatut(c.candidature_id, 'Accepte')}
                  className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                  title="Accepter le candidat"
                >
                  <UserCheck className="w-5 h-5"/>
                </button>

                {/* BOUTON REFUSER */}
                <button 
                  onClick={() => handleStatut(c.candidature_id, 'Refuse')}
                  className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                  title="Refuser le candidat"
                >
                  <UserX className="w-5 h-5"/>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default GestionCandidats;