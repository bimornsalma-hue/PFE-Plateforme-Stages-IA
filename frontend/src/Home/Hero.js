import React from 'react';
import './Hero.css';

const Hero = ({ onStartClick }) => {
  return (
    // On ajoute le style ici pour l'image de fond
    <div 
      className="hero-container" 
      style={{ 
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('/people.jpg')` 
      }}
    >
      <div className="hero-content">
        <h1>Welcome !</h1>
        <p>Plateforme pour la gestion des stages</p>
        <button className="btn-start" onClick={onStartClick}>Commencer</button>
      </div>
    </div>
  );
};

export default Hero;