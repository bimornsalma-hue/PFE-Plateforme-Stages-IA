import React, { useState, useEffect } from 'react'; // Ajoute useEffect ici
import axios from 'axios';
import { LayoutDashboard, PlusCircle, Users, LogOut, ShieldCheck } from 'lucide-react';
import AjouterOffre from './components/AjouterOffre';
import GestionCandidats from './components/GestionCandidats';
import AdminPanel from './components/AdminPanel';
function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({ offres: 0, candidats: 0, moyenne: '0%' });
  // Simuler l'utilisateur connecté (Tu peux changer 'entreprise' par 'admin' pour tester)
  const [user, setUser] = useState({ nom: "Salma", role: "admin" });
  // ALLER CHERCHER LES VRAIES STATS DEPUIS PYTHON
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get('http://127.0.0.1:8000/entreprise/stats');
        setStats(res.data);
      } catch (err) { console.error("Erreur stats", err); }
    };
    fetchStats();
  }, []);
    // COMPOSANT POUR LES CARTES DE STATISTIQUES
const DashboardStats = ({ stats }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
      <p className="text-slate-500 text-sm mb-1">Offres Actives</p>
      <h3 className="text-3xl font-bold text-slate-800">{stats.offres}</h3>
      <div className="h-1 w-12 mt-4 rounded bg-blue-500"></div>
    </div>
    
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
      <p className="text-slate-500 text-sm mb-1">Total Candidats</p>
      <h3 className="text-3xl font-bold text-slate-800">{stats.candidats}</h3>
      <div className="h-1 w-12 mt-4 rounded bg-purple-500"></div>
    </div>
    
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
      <p className="text-slate-500 text-sm mb-1">Matching Moyen IA</p>
      <h3 className="text-3xl font-bold text-slate-800">{stats.moyenne}</h3>
      <div className="h-1 w-12 mt-4 rounded bg-emerald-500"></div>
    </div>
  </div>
);
  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      {/* SIDEBAR */}
      <div className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-6 text-2xl font-bold border-b border-slate-700 text-blue-400">
          StageIA <span className="text-white">Pro</span>
        </div>
        <nav className="flex-1 p-4 space-y-2">
  {/* TOUT LE MONDE voit le Dashboard */}
  <button onClick={() => setActiveTab('dashboard')} className={`flex items-center w-full p-3 rounded-lg transition ${activeTab === 'dashboard' ? 'bg-blue-600' : 'hover:bg-slate-800'}`}>
    <LayoutDashboard className="mr-3 w-5 h-5" /> Dashboard
  </button>

  {/* SEULEMENT L'ENTREPRISE voit ces boutons */}
  {user.role === 'entreprise' && (
    <>
      <button onClick={() => setActiveTab('publier')} className={`flex items-center w-full p-3 rounded-lg transition ${activeTab === 'publier' ? 'bg-blue-600' : 'hover:bg-slate-800'}`}>
        <PlusCircle className="mr-3 w-5 h-5" /> Publier une offre
      </button>
      <button onClick={() => setActiveTab('candidats')} className={`flex items-center w-full p-3 rounded-lg transition ${activeTab === 'candidats' ? 'bg-blue-600' : 'hover:bg-slate-800'}`}>
        <Users className="mr-3 w-5 h-5" /> Candidatures
      </button>
    </>
  )}

  {/* SEULEMENT L'ADMIN voit ce bouton */}
  {user.role === 'admin' && (
    <button onClick={() => setActiveTab('admin')} className={`flex items-center w-full p-3 rounded-lg transition ${activeTab === 'admin' ? 'bg-emerald-600' : 'hover:bg-slate-800'}`}>
      <ShieldCheck className="mr-3 w-5 h-5" /> Administration
    </button>
  )}
</nav>
      </div>

      {/* CONTENU PRINCIPAL */}
<div className="flex-1 overflow-y-auto">
  <header className="bg-white shadow-sm p-6 flex justify-between items-center">
    <h2 className="text-xl font-semibold text-slate-800 capitalize">{activeTab}</h2>
    
    <div className="flex items-center space-x-4">
      {/* MESSAGE DYNAMIQUE SELON LE ROLE */}
      <span className="text-sm text-slate-500">
        Bienvenue, <strong>{user.role === 'admin' ? 'Administrateur' : 'Entreprise X'}</strong>
      </span>

      {/* AVATAR DYNAMIQUE (Initiales) */}
      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-sm ${user.role === 'admin' ? 'bg-emerald-500' : 'bg-blue-600'}`}>
        {user.role === 'admin' ? 'AD' : 'ET'}
      </div>
    </div>
  </header>

        <main className="p-8">
  {activeTab === 'dashboard' && <DashboardStats userRole={user.role} stats={stats} />}
  
  {/* Accès protégé */}
  {activeTab === 'publier' && user.role === 'entreprise' && <AjouterOffre />}
  {activeTab === 'candidats' && user.role === 'entreprise' && <GestionCandidats offreId={1} />}
  
  {/* Accès protégé Admin */}
  {activeTab === 'admin' && user.role === 'admin' && <AdminPanel />}
</main>
      </div>
    </div>
  );
}

export default App;