import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { 
  UserCheck, UserX, Cpu, Search, Briefcase, 
  X, Mail, Award, ListFilter, CheckCircle, XCircle, Clock
} from 'lucide-react';

const GestionCandidats = ({ user }) => {
  const [offres, setOffres] = useState([]); 
  const [offreId, setOffreId] = useState(""); 
  const [candidats, setCandidats] = useState([]);
  const [selectedCandidat, setSelectedCandidat] = useState(null);
  const [searchCandidat, setSearchCandidat] = useState(""); 

  const fetchCandidats = useCallback(async () => {
    if (!offreId) return;
    try {
      const res = await axios.get(`http://127.0.0.1:8000/entreprise/offres/${offreId}/candidats`);
      setCandidats(res.data);
    } catch (err) { console.error(err); }
  }, [offreId]);

  useEffect(() => {
    const fetchOffres = async () => {
      try {
        const res = await axios.get(`http://127.0.0.1:8000/entreprise/mes-offres/?entreprise_id=${user.id}`);
        setOffres(res.data);
        if (res.data.length > 0) setOffreId(res.data[0].id);
      } catch (err) { console.error(err); }
    };
    if (user?.id) fetchOffres();
  }, [user.id]);

  useEffect(() => { fetchCandidats(); }, [fetchCandidats]);

  const handleStatut = async (id, statut) => {
    try {
        await axios.patch(`http://127.0.0.1:8000/entreprise/candidatures/${id}/statut`, null, {
            params: { statut: statut }
        });
        alert(`Candidat ${statut} !`);
        fetchCandidats(); 
    } catch (err) { 
        alert("Erreur lors du changement de statut"); 
    }
  };

  const filteredCandidats = candidats.filter(c => 
    (c.nom + " " + c.prenom).toLowerCase().includes(searchCandidat.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* SÉLECTION DE L'OFFRE  */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center mb-2">
              <Briefcase className="w-4 h-4 mr-2 text-[#7d4b5e]"/> Sélectionner l'offre à examiner
          </label>
          <select value={offreId} onChange={(e) => setOffreId(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#7d4b5e] font-bold text-slate-700">
              {offres.map(o => <option key={o.id} value={o.id}>{o.titre} ({o.ville})</option>)}
          </select>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 bg-slate-50 border-b flex justify-between items-center">
            <div className="font-bold text-slate-700 flex items-center"><ListFilter className="mr-2 w-4 h-4 text-[#7d4b5e]"/> Candidats Postulants</div>
            <input type="text" placeholder="Filtrer par nom..." className="p-2 border rounded-lg text-sm outline-none focus:border-[#7d4b5e]" 
                   onChange={(e) => setSearchCandidat(e.target.value)} />
        </div>

        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-400 text-[10px] uppercase font-black">
            <tr>
              <th className="px-6 py-4">Candidat</th>
              <th className="px-6 py-4 text-center">Niveau de compatibilité</th>
              <th className="px-6 py-4 text-right">État</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredCandidats.map(c => (
              <tr key={c.candidature_id} className="hover:bg-slate-50 transition">
                <td className="px-6 py-4 cursor-pointer" onClick={() => setSelectedCandidat(c)}>
                  <div className="font-bold text-[#7d4b5e]">{c.nom} {c.prenom}</div>
                  <div className="text-[10px] text-slate-400 uppercase">Voir le profil détaillé</div>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${c.score_ia > 50 ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>
                    {c.score_ia}% 
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  {/* LOGIQUE DYNAMIQUE : SI EN ATTENTE -> BOUTONS, SINON -> TEXTE STATUT */}
                  {c.statut === 'En attente' ? (
                    <div className="space-x-2">
                      <button onClick={() => handleStatut(c.candidature_id, 'Accepté')} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition" title="Accepter"><UserCheck/></button>
                      <button onClick={() => handleStatut(c.candidature_id, 'Refusé')} className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition" title="Refuser"><UserX/></button>
                    </div>
                  ) : (
                    <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-black uppercase tracking-widest ${
                        c.statut === 'Accepté' ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'
                    }`}>
                        {c.statut === 'Accepté' ? <CheckCircle size={14} className="mr-1"/> : <XCircle size={14} className="mr-1"/>}
                        {c.statut}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODALE DÉTAILS  */}
      {selectedCandidat && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setSelectedCandidat(null)}>
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8" onClick={e => e.stopPropagation()}>
            <h2 className="text-2xl font-black text-slate-800 mb-2">{selectedCandidat.nom} {selectedCandidat.prenom}</h2>
            <p className="text-sm text-slate-500 mb-6 flex items-center"><Mail className="w-4 h-4 mr-2 text-[#7d4b5e]"/> {selectedCandidat.email}</p>
            <div className="border-t pt-4">
               <h4 className="text-xs font-black text-slate-400 uppercase mb-3">Analyse du cv donnent les competences suivantes:</h4>
               <div className="flex flex-wrap gap-2">
                  {selectedCandidat.competences.map((s, i) => (
                    <span key={i} className={`px-3 py-1 rounded-lg text-xs font-bold ${selectedCandidat.points_forts.includes(s.toLowerCase()) ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-400'}`}>
                      {s}
                    </span>
                  ))}
               </div>
            </div>
            <button onClick={() => setSelectedCandidat(null)} className="w-full mt-8 py-3 bg-[#7d4b5e] text-white rounded-xl font-bold hover:bg-[#5a3644] transition shadow-lg">Fermer la fiche</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionCandidats;