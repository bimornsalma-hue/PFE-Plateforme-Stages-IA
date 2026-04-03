import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  LayoutDashboard, PlusCircle, Users, LogOut, 
  ShieldCheck, Send, TrendingUp, 
  MapPin, Globe, GraduationCap 
} from 'lucide-react';

// Tes composants
import Navbar from './Home/Navbar';
import Hero from './Home/Hero';
import Login from './Home/Login';
import RoleSelection from './Home/RoleSelection';
import About from './Home/About';
import Contact from './Home/Contact';
import EspaceEtudiant from './Home/EspaceEtudiant';
import MesCandidatures from './Home/MesCandidatures';
import MonProfil from './Home/MonProfil';

// Les composants de Salma
import AjouterOffre from './components/AjouterOffre';
import GestionCandidats from './components/GestionCandidats';
import AdminPanel from './components/AdminPanel';

// --- SOUS-COMPOSANT : CARTES DE STATISTIQUES (Bordeaux) ---
const StatCard = ({ label, val, icon }) => (
    <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-[#7d4b5e] flex justify-between items-center transition-transform hover:scale-105">
      <div>
        <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">{label}</span>
        <h4 className="text-3xl font-black text-slate-800 mt-1">{val}</h4>
      </div>
      <div className="p-3 bg-[#f5eef0] rounded-lg text-[#7d4b5e]">{icon}</div>
    </div>
);

const DashboardCards = ({ stats, role }) => {
    if (role === 'admin') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard label="Étudiants" val={stats.etudiants} icon={<GraduationCap/>} />
          <StatCard label="Entreprises" val={stats.entreprises} icon={<Globe/>} />
          <StatCard label="Offres" val={stats.offres} icon={<PlusCircle/>} />
          <StatCard label="Compétences" val={stats.competences} icon={<ShieldCheck/>} />
        </div>
      );
    }
    // Pour l'entreprise
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard label="Mes Offres" val={stats.offres} icon={<PlusCircle/>} />
        <StatCard label="Candidats" val={stats.candidats} icon={<Users/>} />
        <StatCard label="Matching IA" val={stats.moyenne} icon={<TrendingUp/>} />
      </div>
    );
};

function App() {
  // --- 1. ÉTATS (STATES) ---
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user')) || null);
  const [selectedRole, setSelectedRole] = useState(() => localStorage.getItem('selectedRole') || null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({ etudiants: 0, entreprises: 0, offres: 0, competences: 0, candidats: 0, moyenne: '0%' });
  const [topComps, setTopComps] = useState([]);
  const [villes, setVilles] = useState([]);

  // --- 2. RÉCUPÉRATION DES DONNÉES ---
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        const url = user.role === 'admin' 
            ? 'http://127.0.0.1:8000/admin/stats-globales' 
            : `http://127.0.0.1:8000/entreprise/stats?entreprise_id=${user.id}`;
        
        const resStats = await axios.get(url);
        setStats(resStats.data);
        
        if (user.role === 'admin') {
          const resTop = await axios.get('http://127.0.0.1:8000/entreprise/top-competences');
          setTopComps(resTop.data);
          const resVilles = await axios.get('http://127.0.0.1:8000/admin/stats-villes');
          setVilles(resVilles.data);
        }
      } catch (err) { console.error("Erreur API", err); }
    };
    fetchData();
  }, [user, activeTab]);

  // --- 3. FONCTIONS DE NAVIGATION ---
  const handleRoleSelect = (role) => { setSelectedRole(role); localStorage.setItem('selectedRole', role); };
  const handleBackToHome = () => { setSelectedRole(null); localStorage.removeItem('selectedRole'); };
  const handleLoginSuccess = (userData) => { setUser(userData); localStorage.setItem('user', JSON.stringify(userData)); setSelectedRole(null); };
  const handleLogout = () => { setUser(null); localStorage.clear(); setSelectedRole(null); setActiveTab('dashboard'); };
  const scrollToSection = (id) => { handleBackToHome(); const el = document.getElementById(id); if (el) el.scrollIntoView({ behavior: 'smooth' }); };

  // --- 4. RENDU CAS NON CONNECTÉ ---
  if (!user) {
    return (
      <div className="app-home">
        <Navbar 
            onHomeClick={() => { handleBackToHome(); window.scrollTo({top:0, behavior:'smooth'}); }} 
            onAboutClick={() => scrollToSection('about')} 
            onLoginClick={(role) => handleRoleSelect(role)} 
            onContactClick={() => scrollToSection('contact')} 
        />
        {selectedRole ? (
            <Login role={selectedRole} onLoginSuccess={handleLoginSuccess} onBack={handleBackToHome} />
        ) : (
            <>
                <Hero onStartClick={() => scrollToSection('roles')} />
                <About />
                <RoleSelection onSelectRole={handleRoleSelect} />
                <Contact />
            </>
        )}
      </div>
    );
  }

  // --- 5. RENDU CAS CONNECTÉ ---
  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      
      {/* SIDEBAR BORDEAUX */}
      <div className="w-64 bg-[#5a3644] text-white flex flex-col shadow-2xl">
        <div className="p-6 text-xl font-black border-b border-[#7d4b5e] tracking-tighter uppercase">STAGEIA <span className="text-slate-300">PRO</span></div>
        <nav className="flex-1 p-4 space-y-2 mt-4">
          <button onClick={() => setActiveTab('dashboard')} className={`flex items-center w-full p-3 rounded-lg transition-all ${activeTab === 'dashboard' ? 'bg-[#7d4b5e] shadow-lg' : 'hover:bg-[#8e5c6f]'}`}><LayoutDashboard className="mr-3 w-5 h-5" /> Dashboard</button>
          
          {user.role === 'entreprise' && (
            <>
              <button onClick={() => setActiveTab('publier')} className={`flex items-center w-full p-3 rounded-lg transition-all ${activeTab === 'publier' ? 'bg-[#7d4b5e]' : 'hover:bg-[#8e5c6f]'}`}><PlusCircle className="mr-3 w-5 h-5" /> Publier une offre</button>
              <button onClick={() => setActiveTab('candidats')} className={`flex items-center w-full p-3 rounded-lg transition-all ${activeTab === 'candidats' ? 'bg-[#7d4b5e]' : 'hover:bg-[#8e5c6f]'}`}><Users className="mr-3 w-5 h-5" /> Candidatures</button>
            </>
          )}

          {user.role === 'etudiant' && (
            <button onClick={() => setActiveTab('mes-postulations')} className={`flex items-center w-full p-3 rounded-lg transition-all ${activeTab === 'mes-postulations' ? 'bg-[#7d4b5e]' : 'hover:bg-[#8e5c6f]'}`}><Send className="mr-3 w-5 h-5" /> Mes Postulations</button>
          )}

          {user.role === 'admin' && (
            <button onClick={() => setActiveTab('admin')} className={`flex items-center w-full p-3 rounded-lg transition-all ${activeTab === 'admin' ? 'bg-[#7d4b5e] shadow-lg' : 'hover:bg-[#8e5c6f]'}`}><ShieldCheck className="mr-3 w-5 h-5" /> Administration</button>
          )}

          <div className="pt-10 mt-auto border-t border-[#7d4b5e]">
            <button onClick={handleLogout} className="flex items-center w-full p-3 rounded-lg hover:bg-red-700 text-red-100 transition-colors"><LogOut className="mr-3 w-5 h-5" /> Déconnexion</button>
          </div>
        </nav>
      </div>

      <div className="flex-1 overflow-y-auto">
        <header className="bg-white shadow-sm p-6 flex justify-between items-center sticky top-0 z-10 border-b">
          <h2 className="text-xl font-bold text-slate-700 capitalize">{activeTab.replace('-', ' ')}</h2>
          {user.role !== 'admin' ? (
            <div onClick={() => setActiveTab('profil')} className={`flex items-center space-x-3 cursor-pointer p-2 rounded-xl transition-all ${activeTab === 'profil' ? 'bg-slate-100 ring-2 ring-[#7d4b5e]' : 'hover:bg-slate-50'}`}>
              <div className="text-right hidden sm:block"><p className="text-[10px] text-slate-400 uppercase font-black">Mon Profil</p><p className="text-sm font-bold text-slate-700">{user.email}</p></div>
              <div className="w-10 h-10 rounded-full bg-[#7d4b5e] flex items-center justify-center text-white font-bold shadow-md">{user.email.charAt(0).toUpperCase()}</div>
            </div>
          ) : (
            <div className="flex items-center space-x-2 text-[#7d4b5e] font-bold bg-[#f5eef0] px-4 py-2 rounded-xl">
                <ShieldCheck size={20}/> <span>Compte Admin</span>
            </div>
          )}
        </header>

        <main className="p-8">
          {activeTab === 'profil' && user.role !== 'admin' && <MonProfil user={user} />}
          
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
                {/* ON CACHE LES STATS POUR L'ÉTUDIANT ICI */}
                {user.role !== 'etudiant' && <DashboardCards stats={stats} role={user.role} />}
                
                {/* L'ESPACE IA DE L'ÉTUDIANT */}
                {user.role === 'etudiant' && <EspaceEtudiant userId={user.id} />}
                
                {/* GRAPHIQUES POUR L'ADMIN */}
                {user.role === 'admin' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                            <h3 className="text-sm font-bold uppercase mb-6 text-slate-400 tracking-widest">Compétences très demandées</h3>
                            <div className="space-y-5">
                                {topComps.map((c, i) => (
                                    <div key={i}>
                                        <div className="flex justify-between text-sm mb-1"><span className="font-bold text-slate-600">{c.nom}</span><span className="text-[#7d4b5e] font-bold">{c.total} offres</span></div>
                                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden"><div className="bg-[#7d4b5e] h-full transition-all duration-1000" style={{ width: `${(c.total / (stats.offres || 1)) * 100}%` }}></div></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                            <h3 className="text-sm font-bold uppercase mb-6 text-slate-400 tracking-widest">Répartition des stages</h3>
                            <div className="divide-y divide-slate-50">
                                {villes.map((v, i) => (
                                    <div key={i} className="py-4 flex justify-between items-center text-sm">
                                        <div className="flex items-center text-slate-600"><MapPin size={16} className="mr-2 text-[#7d4b5e]"/> {v.ville}</div>
                                        <span className="bg-[#f5eef0] px-4 py-1 rounded-full font-bold text-[#7d4b5e]">{v.count} offres</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
          )}

          {activeTab === 'publier' && <AjouterOffre userId={user.id} />}
          {activeTab === 'candidats' && <GestionCandidats user={user} />}
          {activeTab === 'mes-postulations' && <MesCandidatures userId={user.id} />}
          {activeTab === 'admin' && <AdminPanel />}
        </main>
      </div>
    </div>
  );
}

export default App;