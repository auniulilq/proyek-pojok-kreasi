import React, { useState } from 'react';
// Hapus import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './components/Home';        // Pastikan ini di-import
import PojokKreasi from './components/PojokKreasi';
import EcoEnzyme from './components/EcoEnzyme'; 
import './App.css'; // Opsional: File CSS utama

// Fungsi utama App
function App() {
  // 'home' adalah default saat pertama kali dimuat
  const [currentView, setCurrentView] = useState('home'); 

  const handleViewChange = (view) => {
    setCurrentView(view);
    // Kita bisa tambahkan logika untuk menggulir ke atas saat halaman berubah (opsional)
    window.scrollTo(0, 0); 
  };
  
  // Fungsi untuk memilih komponen yang akan di-render
  const renderView = () => {
    switch (currentView) {
      case 'kreasi':
        return <PojokKreasi />;
      case 'enzyme':
        return <EcoEnzyme />;
      case 'home':
      default:
        // Pass fungsi handleViewChange ke Home
        return <Home setCurrentView={handleViewChange} />; 
    }
  };

  return (
    <div> 
      {/* Navbar di atas selalu terlihat */}
      <Navbar currentView={currentView} onViewChange={handleViewChange} />
      
      <main>
        {/* Hanya render satu view yang dipilih */}
        {renderView()}
      </main>
      
    </div>
  );
}

export default App;
