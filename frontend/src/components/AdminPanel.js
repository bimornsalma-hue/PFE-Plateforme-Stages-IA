import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShieldCheck, Plus, Trash2, Activity } from 'lucide-react';

const AdminPanel = () => {
    const [stats, setStats] = useState({ total_etudiants: 0, total_entreprises: 0, total_offres: 0, total_competences: 0 });
    const [newComp, setNewComp] = useState("");

    const fetchStats = async () => {
        const res = await axios.get('http://127.0.0.1:8000/admin/stats-globales');
        setStats(res.data);
    };

    useEffect(() => { fetchStats(); }, []);

    const handleAddComp = async () => {
        if (!newComp) return;
        await axios.post(`http://127.0.0.1:8000/admin/competences/?nom=${newComp}`);
        setNewComp("");
        fetchStats();
        alert("Dictionnaire IA mis à jour !");
    };

    return (
        <div className="space-y-8">
            {/* CARTES DE SUPERVISION */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard label="Étudiants" val={stats.total_etudiants} color="border-blue-500" />
                <StatCard label="Entreprises" val={stats.total_entreprises} color="border-purple-500" />
                <StatCard label="Offres" val={stats.total_offres} color="border-orange-500" />
                <StatCard label="Mots-clés IA" val={stats.total_competences} color="border-emerald-500" />
            </div>

            {/* GESTION DU DICTIONNAIRE IA */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex items-center mb-4 text-emerald-600 font-bold">
                    <ShieldCheck className="mr-2" /> Gérer le Dictionnaire de l'IA
                </div>
                <p className="text-sm text-slate-500 mb-4">Ajoutez des compétences techniques pour améliorer la précision du matching.</p>
                <div className="flex gap-2">
                    <input 
                        type="text" 
                        value={newComp}
                        onChange={(e) => setNewComp(e.target.value)}
                        placeholder="Ex: Machine Learning, Docker, Laravel..." 
                        className="flex-1 p-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <button onClick={handleAddComp} className="bg-emerald-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-emerald-700 transition">
                        <Plus className="mr-1 w-4 h-4" /> Ajouter
                    </button>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ label, val, color }) => (
    <div className={`bg-white p-4 rounded-xl shadow-sm border-l-4 ${color}`}>
        <p className="text-xs text-slate-500 uppercase font-bold">{label}</p>
        <h4 className="text-2xl font-black text-slate-800">{val}</h4>
    </div>
);

export default AdminPanel;