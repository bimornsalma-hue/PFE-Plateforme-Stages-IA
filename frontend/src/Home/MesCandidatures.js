import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Clock, CheckCircle, XCircle, Calendar } from 'lucide-react';

const MesCandidatures = ({ userId }) => {
  const [candidatures, setCandidatures] = useState([]);

  useEffect(() => {
    const fetchCands = async () => {
      try {
        const res = await axios.get(`http://127.0.0.1:8000/etudiant/mes-candidatures/${userId}`);
        setCandidatures(res.data);
      } catch (err) { console.error("Erreur chargement candidatures", err); }
    };
    fetchCands();
  }, [userId]);

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Suivi de mes candidatures</h2>
      
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 text-sm uppercase">
            <tr>
              <th className="p-4">Offre de Stage</th>
              <th className="p-4">Date</th>
              <th className="p-4">État</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {candidatures.length > 0 ? candidatures.map((cand) => (
              <tr key={cand.id} className="hover:bg-slate-50 transition">
                <td className="p-4 font-bold text-slate-700">{cand.titre_offre} <br/><span className="font-normal text-xs text-slate-400">{cand.ville}</span></td>
                <td className="p-4 text-slate-500 text-sm"><Calendar size={14} className="inline mr-1"/>{cand.date}</td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center w-fit ${
                    cand.statut === 'Accepté' ? 'bg-green-100 text-green-700' : 
                    cand.statut === 'Refusé' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                  }`}>
                    {cand.statut === 'En attente' && <Clock size={12} className="mr-1"/>}
                    {cand.statut === 'Accepté' && <CheckCircle size={12} className="mr-1"/>}
                    {cand.statut === 'Refusé' && <XCircle size={12} className="mr-1"/>}
                    {cand.statut}
                  </span>
                </td>
              </tr>
            )) : (
              <tr><td colSpan="3" className="p-10 text-center text-slate-400">Vous n'avez pas encore postulé à des stages.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MesCandidatures;