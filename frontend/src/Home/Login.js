import React, { useState } from 'react';
import axios from 'axios';
import './Login.css';

const Login = ({ onLoginSuccess, role, onBack }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const roleImages = {
    admin: "./admin.png",
    entreprise: "./entreprise.png",
    etudiant: "./etudiant.png"
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); 
    try {
      // --- MODIFICATION ICI : On envoie le rôle au Backend ---
      const response = await axios.post('http://127.0.0.1:8000/auth/login', {
        email: email,
        password: password,
        role: role // 'role' vient de la sélection sur la page d'accueil
      });
      
      if (response.data.status === "success") {
        onLoginSuccess(response.data.user);
      }
    } catch (err) {
      // --- MODIFICATION ICI : On affiche le message d'erreur exact du Backend ---
      if (err.response && err.response.data && err.response.data.detail) {
        setError(err.response.data.detail); // Ex: "Accès refusé : Ce compte est un compte etudiant..."
      } else {
        setError("Email ou mot de passe incorrect");
      }
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-image">
           <img src={roleImages[role]} alt={role} />
        </div>

        <div className="login-form-container">
          <h2>
            {role === 'admin' ? 'Admin Login' : 
             role === 'entreprise' ? 'Company Login' : 
             'Student Login'}
          </h2>
          
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="input-group">
              <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            
            {/* Affichage de l'erreur en rouge */}
            {error && <p className="error-msg" style={{color: 'red', fontSize: '13px', marginBottom: '10px'}}>{error}</p>}
            
            <button type="submit" className="btn-login">LOGIN</button>
          </form>

          <button className="btn-back-inside" onClick={onBack}>
             Retour à l'accueil
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;