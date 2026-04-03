import React from 'react';
import './Navbar.css';
const Navbar = ({ onLoginClick, onAboutClick, onContactClick, onHomeClick }) => {
  return (
    <nav className="navbar">
      <div className="navbar-logo" onClick={onHomeClick}>GESTION DES STAGES</div>
      <ul className="navbar-links">
        <li onClick={onHomeClick}>Home</li>
        <li onClick={onAboutClick}>À propos</li>
        <li onClick={() => onLoginClick('admin')}>Admin</li>
        <li onClick={() => onLoginClick('entreprise')}>Entreprise</li>
        <li onClick={() => onLoginClick('etudiant')}>Étudiant</li>
        <li onClick={onContactClick}>Contact</li>
      </ul>
      <button className="btn-commencer" onClick={() => onLoginClick()}>Commencer</button>
    </nav>
  );
};
export default Navbar;