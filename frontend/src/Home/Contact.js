import React from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';
import './Contact.css';

const Contact = () => {
  return (
    <footer id="contact" className="footer-container">
      <div className="footer-content">
        
        {/* Colonne 1 : Logos et École */}
        <div className="footer-section">
          <div className="logos-box">
            <img src="/LOGO-IN-WHITE.png" alt="UM5_est Logo" className="univ_est-logo" />
          </div>
          <h3>EST SALÉ</h3>
          <p>École Supérieure de Technologie de Salé</p>
          <p className="univ-name">Université Mohammed V de Rabat</p>
        </div>

        {/* Colonne 2 : Vos Coordonnées */}
        <div className="footer-section">
          <h4>CONTACTEZ-NOUS</h4>
          <div className="contact-item">
            <MapPin size={20} className="icon" />
            <span>Avenue Le Prince Héritier B.P: 227, Salé, Maroc</span>
          </div>
          <div className="contact-item">
            <Phone size={20} className="icon" />
            <span>+212 650 64 54 61</span>
          </div>
          <div className="contact-item">
            <Mail size={20} className="icon" />
            <span>khadijaessayh06@gmail.com</span>
          </div>
        </div>

        {/* Colonne 3 : Liens utiles */}
        <div className="footer-section">
          <h4>LIENS UTILES</h4>
          <ul>
            <li><a href="https://est.um5.ac.ma/" target="_blank" rel="noreferrer">Site Officiel de l'ESTS</a></li>
            <li><a href="#about">À propos du projet</a></li>
            <li><a href="#roles">Espaces de connexion</a></li>
          </ul>
        </div>

      </div>

      <div className="footer-bottom">
        <p>&copy; 2026 - PFE Plateforme de Stages IA - Khadija Essayh & Salma Bimourne - EST Salé</p>
      </div>
    </footer>
  );
};

export default Contact;