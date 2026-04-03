import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { User, Save, Building, Phone, MapPin, Globe, AlignLeft } from 'lucide-react';

const MonProfil = ({ user }) => {
  // On initialise tous les champs vides pour éviter les erreurs d'affichage
  const [form, setForm] = useState({ 
    nom: '', prenom: '', telephone: '', 
    nom_entreprise: '', ville: '', adresse: '', site_web: '', description: '' 
  });

  // 1. CHARGEMENT DES DONNÉES (FETCH)
  useEffect(() => {
    const fetchProfil = async () => {
      try {
        const url = user.role === 'etudiant' 
          ? `http://127.0.0.1:8000/etudiant/profil/${user.id}`
          : `http://127.0.0.1:8000/entreprise/profil/${user.id}`;
        
        const res = await axios.get(url);
        
        if (res.data) {
          // TRÈS IMPORTANT : On fusionne les données reçues avec l'état actuel
          setForm(prev => ({
            ...prev,
            ...res.data // Remplit nom, prenom, tel, etc. depuis MySQL
          }));
        }
      } catch (err) { 
        console.error("Erreur chargement profil :", err); 
      }
    };
    if (user?.id) fetchProfil();
  }, [user]);

  // 2. SAUVEGARDE DES MODIFICATIONS (UPDATE)
  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const url = user.role === 'etudiant' 
        ? `http://127.0.0.1:8000/etudiant/profil/${user.id}`
        : `http://127.0.0.1:8000/entreprise/profil/${user.id}`;

      // On définit exactement les champs que Python attend pour l'étudiant
      const paramsToSend = user.role === 'etudiant' 
        ? { 
            nom: form.nom, 
            prenom: form.prenom, 
            telephone: form.telephone 
          }
        : { 
            nom_entreprise: form.nom_entreprise, 
            telephone: form.telephone, 
            ville: form.ville,
            adresse: form.adresse,
            site_web: form.site_web,
            description: form.description
          };

      // On utilise 'params' car ton Backend Python attend des paramètres d'URL
      const response = await axios.put(url, null, { params: paramsToSend });
      
      if (response.data.status === "success") {
        alert("Succès : Vos informations ont été enregistrées dans MySQL !");
      }
    } catch (err) {
      console.error("Erreur sauvegarde :", err);
      alert("Erreur : Impossible de sauvegarder les données.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-xl border border-slate-100 mt-6">
      <h2 className="text-2xl font-bold text-[#7d4b5e] mb-8 flex items-center border-b pb-4">
        {user.role === 'entreprise' ? <Building className="mr-2"/> : <User className="mr-2" />}
        Mon Profil {user.role === 'entreprise' ? 'Entreprise' : 'Étudiant'}
      </h2>
      
      <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* --- SECTION ÉTUDIANT --- */}
        {user.role === 'etudiant' ? (
          <>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Nom</label>
              <input 
                type="text" 
                value={form.nom} 
                onChange={e => setForm({...form, nom: e.target.value})} 
                className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-[#7d4b5e]" 
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Prénom</label>
              <input 
                type="text" 
                value={form.prenom} 
                onChange={e => setForm({...form, prenom: e.target.value})} 
                className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-[#7d4b5e]" 
              />
            </div>
          </>
        ) : (
          /* --- SECTION ENTREPRISE (Inchangée car elle fonctionnait déjà) --- */
          <>
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-1">Nom de l'entreprise</label>
              <input type="text" value={form.nom_entreprise} onChange={e => setForm({...form, nom_entreprise: e.target.value})} className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-[#7d4b5e]" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Site Web</label>
              <input type="text" value={form.site_web} onChange={e => setForm({...form, site_web: e.target.value})} className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-[#7d4b5e]" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Ville</label>
              <input type="text" value={form.ville} onChange={e => setForm({...form, ville: e.target.value})} className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-[#7d4b5e]" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-1">Adresse</label>
              <input type="text" value={form.adresse} onChange={e => setForm({...form, adresse: e.target.value})} className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-[#7d4b5e]" />
            </div>
          </>
        )}
        
        {/* --- CHAMP COMMUN : TÉLÉPHONE --- */}
        <div className="col-span-2">
          <label className="block text-sm font-semibold text-slate-700 mb-1 flex items-center">
            <Phone size={14} className="mr-1" /> Téléphone de contact
          </label>
          <input 
            type="text" 
            value={form.telephone} 
            onChange={e => setForm({...form, telephone: e.target.value})} 
            className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-[#7d4b5e]" 
          />
        </div>

        <button type="submit" className="md:col-span-2 bg-[#7d4b5e] text-white py-4 rounded-xl font-bold hover:bg-[#5a3644] transition shadow-md flex justify-center items-center">
          <Save size={20} className="mr-2" /> Enregistrer les informations
        </button>
      </form>
    </div>
  );
};

export default MonProfil;