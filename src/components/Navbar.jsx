import React, { useState, useEffect } from 'react';
import './Navbar.css';

// Sesuaikan nama link dan view sesuai App.jsx Anda
const navLinks = [
  { view: 'kreasi', text: 'Pojok Kreasi' },
  { view: 'enzyme', text: 'Eco Enzyme' },
];


const Navbar = ({ currentView, onViewChange }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleViewChange = (view) => {
    onViewChange(view);
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isMenuOpen]);

  return (
    <>
      <div 
        className={`nav-overlay ${isMenuOpen ? 'active' : ''}`}
        onClick={toggleMenu}
      />

      {/* PASTIKAN BARIS INI SAMA: 'menu-open' akan ditambahkan saat isMenuOpen true */}
      <header className={`navbar ${isMenuOpen ? 'menu-open' : ''}`}>
        <div className="navbar-brand">
          ReKarya
        </div>
        
        <nav className={`navbar-nav ${isMenuOpen ? 'active' : ''}`}>
          

          {navLinks.map(link => (
            <button 
              key={link.view}
              onClick={() => handleViewChange(link.view)} 
              className={currentView === link.view ? 'active' : ''}
            >
              {link.text}
            </button>
          ))}
        </nav>

        <button 
          className="hamburger" 
          onClick={toggleMenu}
          aria-label="Buka menu navigasi"
        >
          <div className="hamburger-box">
            <div className="hamburger-inner"></div>
          </div>
        </button>
      </header>
    </>
  );
};

export default Navbar;

