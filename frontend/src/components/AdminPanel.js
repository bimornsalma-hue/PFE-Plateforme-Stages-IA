import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShieldCheck, Plus, Trash2, Globe, Users, X, Info, Search, ListFilter } from 'lucide-react';

const AdminPanel = () => {
    const [stats, setStats] = useState({ etudiants: 0, entreprises: 0, offres: 0, competences: 0 });
    const [offres, setOffres] = useState([]);
    const [utilisateurs, setUtilisateurs] = useState([]);
    const [newComp, setNewComp] = useState("");
    const [selectedUser, setSelectedUser] = useState(null); 

    // --- ÉTATS POUR LA RECHERCHE ---
    const [searchOffre, setSearchOffre] = useState("");
    const [searchUser, setSearchUser] = useState("");

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
        await axios.post(`http://127.0.0.1:8000/admin/competences/?nom=${newComp}`);
        setNewComp("");
        fetchAllData();
        alert("IA mise à jour !");
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

    // --- LOGIQUE DE FILTRAGE ---
    const filteredOffres = offres.filter(o => 
        o.titre.toLowerCase().includes(searchOffre.toLowerCase())
    );

    const filteredUsers = utilisateurs.filter(u => 
        u.email.toLowerCase().includes(searchUser.toLowerCase()) ||
        u.role.toLowerCase().includes(searchUser.toLowerCase())
    );

    return (
        <div className="space-y-8 pb-10">
            {/* 1. GESTION COMPETENCES */}
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

            {/* 2. MODERATION OFFRES AVEC RECHERCHE */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="font-bold text-slate-700 flex items-center">
                        <Globe className="mr-2 w-5 h-5 text-orange-500"/> Modération des Offres
                    </div>
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Rechercher une offre..." 
                            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-orange-400 font-normal"
                            onChange={(e) => setSearchOffre(e.target.value)}
                        />
                    </div>
                </div>
                <table className="w-full text-left">
                    <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase font-black tracking-widest">
                        <tr><th className="px-6 py-4">Titre du poste</th><th className="px-6 py-4 text-right">Actions</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                        {filteredOffres.map(o => (
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

            {/* 3. GESTION COMPTES AVEC RECHERCHE */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="font-bold text-slate-700 flex items-center">
                        <Users className="mr-2 w-5 h-5 text-blue-500"/> Gestion des Comptes Utilisateurs
                    </div>
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Rechercher par email ou rôle..." 
                            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-400 font-normal"
                            onChange={(e) => setSearchUser(e.target.value)}
                        />
                    </div>
                </div>
                <table className="w-full text-left">
                    <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase font-black tracking-widest">
                        <tr><th className="px-6 py-4">Utilisateur</th><th className="px-6 py-4">Rôle</th><th className="px-6 py-4 text-right">Actions</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                        {filteredUsers.map(u => (
                            <tr key={u.id} className="hover:bg-blue-50 cursor-pointer transition group" onClick={() => setSelectedUser(u)}>
                                <td className="px-6 py-4 font-medium text-blue-600 group-hover:underline">{u.email}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${u.role === 'admin' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
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
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setSelectedUser(null)}>
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-xl flex items-center"><Info className="mr-2 text-blue-500"/> Fiche Informations</h3>
                            <button onClick={() => setSelectedUser(null)}><X className="text-slate-400 hover:text-slate-600" /></button>
                        </div>
                        <div className="space-y-5">
                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                <p className="text-[10px] font-bold text-slate-400 uppercase">Identifiant Base de Données</p>
                                <p className="font-mono text-blue-600 font-bold">#USR-{selectedUser.id}</p>
                            </div>

                            {/* DETAILS ÉTUDIANT */}
                            {selectedUser.role === 'etudiant' && selectedUser.details && (
                                <>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Identité du Candidat</p>
                                        <p className="text-slate-800 font-black text-lg">{selectedUser.details.nom} {selectedUser.details.prenom}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">Téléphone</p>
                                        <p className="text-slate-700 font-medium">{selectedUser.details.telephone || "Non renseigné"}</p>
                                    </div>
                                </>
                            )}

                            {/* DETAILS ENTREPRISE */}
                            {selectedUser.role === 'entreprise' && selectedUser.details && (
                                <>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Raison Sociale</p>
                                        <p className="text-slate-800 font-black text-lg">{selectedUser.details.nom_entreprise}</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase">Ville</p>
                                            <p className="text-slate-700 font-medium">{selectedUser.details.ville || "N/A"}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase">Site Web</p>
                                            <p className="text-blue-500 underline text-sm truncate">{selectedUser.details.site_web || "N/A"}</p>
                                        </div>
                                    </div>
                                </>
                            )}

                            <div className="pt-4 border-t border-slate-100">
                                <p className="text-[10px] font-bold text-slate-400 uppercase">Email de contact</p>
                                <p className="text-slate-700 font-bold">{selectedUser.email}</p>
                            </div>
                        </div>
                        <button onClick={() => setSelectedUser(null)} className="mt-8 w-full bg-blue-600 text-white py-4 rounded-2xl font-black shadow-lg shadow-blue-100 hover:bg-blue-700 transition">Fermer la fiche</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPanel;