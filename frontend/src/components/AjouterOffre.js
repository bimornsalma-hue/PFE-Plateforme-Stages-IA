import React, { useState } from 'react';
import axios from 'axios';
import { Send } from 'lucide-react';

const AjouterOffre = ({ userId }) => {
  const [form, setForm] = useState({ 
    titre: '', 
    description: '', 
    ville: '', 
    duree: '', 
    competences_ids: [1] 
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await axios.post('http://127.0.0.1:8000/entreprise/offres/', form, {
        params: {
          entreprise_id: userId
        }
      });

      alert("Offre publiée avec succès !");
    } catch (err) { 
      console.error("Erreur détaillée :", err.response?.data);
      alert("Erreur : " + (err.response?.data?.detail?.[0]?.msg || "Vérifiez vos données")); 
    }
  };

  return (
    <div className="max-w-2xl bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
      <h2 className="text-xl font-bold mb-6 text-slate-800">Diffuser une offre de stage</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Titre du poste</label>
          <input type="text" className="w-full p-3 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" 
            placeholder="Ex: Développeur Web" onChange={e => setForm({...form, titre: e.target.value})} required />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Ville</label>
            <input type="text" className="w-full p-3 border border-slate-200 rounded-lg outline-none" 
              placeholder="Salé" onChange={e => setForm({...form, ville: e.target.value})} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Durée</label>
            <input type="text" className="w-full p-3 border border-slate-200 rounded-lg outline-none" 
              placeholder="2 mois" onChange={e => setForm({...form, duree: e.target.value})} required />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
          <textarea rows="4" className="w-full p-3 border border-slate-200 rounded-lg outline-none" 
            placeholder="Détails du stage..." onChange={e => setForm({...form, description: e.target.value})} required></textarea>
        </div>
        <button type="submit" className="w-full bg-[#7d4b5e] text-white p-4 rounded-xl font-bold flex justify-center items-center hover:bg-[#5a3644] transition">
          <Send className="mr-2 w-5 h-5" /> Publier l'offre
        </button>
      </form>
    </div>
  );
};

export default AjouterOffre;