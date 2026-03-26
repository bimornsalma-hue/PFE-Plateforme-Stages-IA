import React, { useState } from 'react';
import axios from 'axios';
import { Send } from 'lucide-react';

const AjouterOffre = () => {
  const [form, setForm] = useState({ titre: '', description: '', ville: '', duree: '', competences_ids: [1, 2] });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://127.0.0.1:8000/entreprise/offres/', form);
      alert("Offre publiée avec succès !");
    } catch (err) { alert("Erreur lors de la publication"); }
  };

  return (
    <div className="max-w-2xl bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Titre du poste</label>
          <input type="text" className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
            placeholder="Ex: Développeur Python Fullstack" onChange={e => setForm({...form, titre: e.target.value})} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Ville</label>
            <input type="text" className="w-full p-3 border border-slate-200 rounded-lg outline-none" 
              placeholder="Casablanca" onChange={e => setForm({...form, ville: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Durée du stage</label>
            <input type="text" className="w-full p-3 border border-slate-200 rounded-lg outline-none" 
              placeholder="3 mois" onChange={e => setForm({...form, duree: e.target.value})} />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Description détaillée</label>
          <textarea rows="4" className="w-full p-3 border border-slate-200 rounded-lg outline-none" 
            placeholder="Décrivez les missions..." onChange={e => setForm({...form, description: e.target.value})}></textarea>
        </div>
        <button type="submit" className="w-full bg-blue-600 text-white p-4 rounded-xl font-bold flex justify-center items-center hover:bg-blue-700 transition">
          <Send className="mr-2 w-5 h-5" /> Diffuser l'offre
        </button>
      </form>
    </div>
  );
};

export default AjouterOffre;