import React, { useState, useEffect } from 'react';
import './Navbar.css';

// Sesuaikan nama link dan view sesuai App.jsx Anda
const navLinks = [
  { view: 'kreasi', text: 'Pojok Kreasi' },
  { view: 'enzyme', text: 'Eco Enzyme' },
];


const Navbar = ({ currentView, onViewChange }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Handler untuk navigasi
  const handleViewChange = (view) => {
    onViewChange(view); // Memanggil handleViewChange dari App.jsx
    setIsMenuOpen(false);
  };
  
  // Handler untuk kembali ke Home dari brand logo
  const goToHome = () => {
    onViewChange('home');
    setIsMenuOpen(false);
  }

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Efek untuk mengunci scroll saat menu terbuka
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

      <header className={`navbar ${isMenuOpen ? 'menu-open' : ''}`}>
        <div 
            className="navbar-brand"
            onClick={goToHome}
            // TAMBAHKAN ROLE="BUTTON" dan STYLE UNTUK CURSOR
            role="button"
            style={{ cursor: 'pointer' }}
        >
          ReKarya
        </div>
        
        <nav className={`navbar-nav ${isMenuOpen ? 'active' : ''}`}>
          
          {/* Tambahkan tombol Home di Navbar untuk konsistensi */}
          <button 
            onClick={() => handleViewChange('home')} 
            className={currentView === 'home' ? 'active' : ''}
          >
            Home
          </button>

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
