import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShieldCheck, Plus, Trash2, Globe, GraduationCap, Users, X, Info, Mail } from 'lucide-react';

const AdminPanel = () => {
    const [stats, setStats] = useState({ etudiants: 0, entreprises: 0, offres: 0, competences: 0 });
    const [offres, setOffres] = useState([]);
    const [utilisateurs, setUtilisateurs] = useState([]);
    const [newComp, setNewComp] = useState("");
    const [selectedUser, setSelectedUser] = useState(null); 

    const fetchAllData = async () => {
        try {
            const resStats = await axios.get('http://127.0.0.1:8000/admin/stats-globales');
            setStats(resStats.data);
            const resOffres = await axios.get('http://127.0.0.1:8000/admin/toutes-les-offres');
            setOffres(resOffres.data);
            const resUsers = await axios.get('http://127.0.0.1:8000/admin/utilisateurs');
            setUtilisateurs(resUsers.data);
        } catch (err) { console.error(err); }
    };

    useEffect(() => { fetchAllData(); }, []);

    const handleAddComp = async () => {
        if (!newComp) return;
        try {
            await axios.post(`http://127.0.0.1:8000/admin/competences/?nom=${newComp}`);
            setNewComp("");
            fetchAllData();
            alert("Système enrichi avec succès !");
        } catch (err) { alert("Erreur lors de l'ajout"); }
    };

    const handleDeleteOffre = async (id) => {
        if (window.confirm("Supprimer cette offre ?")) {
            await axios.delete(`http://127.0.0.1:8000/admin/offres/${id}`);
            fetchAllData();
        }
    };

    const handleDeleteUser = async (id) => {
        if (window.confirm("Supprimer ce compte ?")) {
            await axios.delete(`http://127.0.0.1:8000/admin/utilisateurs/${id}`);
            fetchAllData();
        }
    };

    return (
        <div className="space-y-8 pb-10">
            
            {/* 1. AJOUTER LES COMPÉTENCES POUR ENRICHIR LE SYSTÈME */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="font-bold mb-4 flex items-center text-[#7d4b5e]">
                    <ShieldCheck className="mr-2"/> Ajouter les compétences pour enrichir le système
                </h3>
                <div className="flex gap-2">
                    <input 
                        value={newComp} 
                        onChange={(e)=>setNewComp(e.target.value)} 
                        className="flex-1 p-3 border rounded-xl outline-none focus:ring-2 focus:ring-[#7d4b5e] transition-all" 
                        placeholder="Ex: Docker, Machine Learning, Comptabilité..."
                    />
                    <button 
                        onClick={handleAddComp} 
                        className="bg-[#7d4b5e] text-white px-8 py-3 rounded-xl font-bold transition hover:bg-[#5a3644] shadow-md flex items-center"
                    >
                        <Plus size={18} className="mr-1"/> Ajouter
                    </button>
                </div>
            </div>

            {/* 2. MODÉRATION DES OFFRES */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 bg-slate-50 border-b font-bold text-slate-700 flex items-center">
                    <Globe className="mr-2 w-5 h-5 text-[#7d4b5e]"/> Modération des Offres de Stage
                </div>
                <table className="w-full text-left">
                    <thead className="bg-slate-50 text-[10px] text-slate-400 uppercase font-black tracking-widest">
                        <tr>
                            <th className="px-6 py-4">Titre du poste</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {offres.map(o => (
                            <tr key={o.id} className="hover:bg-slate-50 transition">
                                <td className="px-6 py-4 font-medium text-slate-700">{o.titre}</td>
                                <td className="px-6 py-4 text-right">
                                    <button onClick={() => handleDeleteOffre(o.id)} className="text-rose-600 hover:bg-rose-50 p-2 rounded-lg transition">
                                        <Trash2 className="w-5 h-5"/>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* 3. GESTION DES COMPTES */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 bg-slate-50 border-b font-bold text-slate-700 flex items-center">
                    <Users className="mr-2 w-5 h-5 text-[#7d4b5e]"/> Gestion des Comptes Utilisateurs
                </div>
                <table className="w-full text-left">
                    <thead className="bg-slate-50 text-[10px] text-slate-400 uppercase font-black tracking-widest">
                        <tr>
                            <th className="px-6 py-4">Utilisateur</th>
                            <th className="px-6 py-4">Rôle</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {utilisateurs.map(u => (
                            <tr key={u.id} className="hover:bg-[#f5eef0] cursor-pointer transition group" onClick={() => setSelectedUser(u)}>
                                <td className="px-6 py-4 font-bold text-[#7d4b5e]">{u.email}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${u.role === 'admin' ? 'bg-slate-800 text-white' : 'bg-[#f5eef0] text-[#7d4b5e]'}`}>
                                        {u.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    {u.role !== 'admin' && (
                                        <button onClick={(e) => {e.stopPropagation(); handleDeleteUser(u.id);}} className="text-rose-600 p-2 hover:bg-rose-50 rounded-lg transition">
                                            <Trash2 className="w-5 h-5"/>
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* MODALE DÉTAILS UTILISATEUR */}
            {selectedUser && (
                <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setSelectedUser(null)}>
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-xl text-slate-800 flex items-center">
                                <Info className="mr-2 text-[#7d4b5e]"/> Fiche Informations
                            </h3>
                            <button onClick={() => setSelectedUser(null)} className="text-slate-400 hover:text-slate-600"><X /></button>
                        </div>

                        <div className="space-y-5">
                            <div className="flex justify-between items-center p-4 bg-[#f5eef0] rounded-2xl border border-[#7d4b5e]/10">
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">ID Système</p>
                                    <p className="font-mono text-[#7d4b5e] font-bold">#USR-{selectedUser.id}</p>
                                </div>
                                <span className="px-3 py-1 bg-white text-[#7d4b5e] rounded-lg text-[10px] font-black uppercase shadow-sm">
                                    {selectedUser.role}
                                </span>
                            </div>

                            {/* DÉTAILS DYNAMIQUES */}
                            <div className="space-y-4">
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email de connexion</p>
                                    <p className="text-slate-700 font-semibold flex items-center mt-1"><Mail size={14} className="mr-2 text-[#7d4b5e]"/> {selectedUser.email}</p>
                                </div>

                                {selectedUser.role === 'etudiant' && (
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Identité</p>
                                        <p className="text-slate-800 font-bold text-lg mt-1">{selectedUser.details?.nom || "Non renseigné"} {selectedUser.details?.prenom || ""}</p>
                                    </div>
                                )}

                                {selectedUser.role === 'entreprise' && (
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Raison Sociale</p>
                                        <p className="text-slate-800 font-bold text-lg mt-1">{selectedUser.details?.nom_entreprise || "Non renseignée"}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <button 
                            onClick={() => setSelectedUser(null)} 
                            className="mt-10 w-full bg-[#7d4b5e] text-white py-4 rounded-2xl font-bold shadow-lg hover:bg-[#5a3644] transition-all duration-300"
                        >
                            Fermer la fiche
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPanel;