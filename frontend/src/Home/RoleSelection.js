import React from 'react';
import { User, Building2, ShieldCheck } from 'lucide-react'; // Icônes
import './RoleSelection.css';

const RoleSelection = ({ onSelectRole }) => {
  const roles = [
    { id: 'admin', title: 'Admin', desc: 'Espace Administrateur', icon: <ShieldCheck size={40} />, color: '#7d4b5e' },
    { id: 'entreprise', title: 'Entreprise', desc: 'Espace Entreprise', icon: <Building2 size={40} />, color: '#7d4b5e' },
    { id: 'etudiant', title: 'Etudiant', desc: 'Espace Étudiant', icon: <User size={40} />, color: '#7d4b5e' }
  ];

  return (
    <section id="roles" className="section-roles">
        <br/><br/><br/><br/><br/><br/>
      <h2>VOUS ÊTES :</h2>
      <div className="roles-grid">
        {roles.map((role) => (
          <div key={role.id} className="role-card" onClick={() => onSelectRole(role.id)}>
            <div className="role-icon" style={{ color: role.color }}>{role.icon}</div>
            <h3>{role.title}</h3>
            <p>{role.desc}</p>
          </div>
        ))}
      </div>
      <br/><br/><br/><br/><br/><br/><br/>
    </section>
  );
};

export default RoleSelection;