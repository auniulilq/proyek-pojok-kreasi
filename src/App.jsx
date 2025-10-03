import React, { useState } from 'react';
import Navbar from './components/Navbar';
import PojokKreasi from './components/PojokKreasi';
import EcoEnzyme from './components/EcoEnzyme'; // pastikan file ini ada

function App() {
  const [currentView, setCurrentView] = useState('kreasi'); // default: Pojok Kreasi

  const handleViewChange = (view) => {
    setCurrentView(view);
  };

  return (
    <div>
      <Navbar currentView={currentView} onViewChange={handleViewChange} />
      <main>
        {currentView === 'kreasi' && <PojokKreasi />}
        {currentView === 'enzyme' && <EcoEnzyme />}
      </main>
    </div>
  );
}

export default App;
