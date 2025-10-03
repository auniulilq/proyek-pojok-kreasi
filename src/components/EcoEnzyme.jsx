import React, { useState, useEffect } from 'react';
import './EcoEnzyme.css';

const EcoEnzyme = () => {
  const [journalEntries, setJournalEntries] = useState([]);
  const [newEntryWeight, setNewEntryWeight] = useState('');
  const [totalWeight, setTotalWeight] = useState(0);
  const [gula, setGula] = useState(0);
  const [air, setAir] = useState(0);
  const [harvestDate, setHarvestDate] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  
  // State untuk Chatbot
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isBotTyping, setIsBotTyping] = useState(false);

  useEffect(() => {
    const savedEntries = JSON.parse(localStorage.getItem('ecoEnzymeJournal')) || [];
    setJournalEntries(savedEntries);
    const savedHarvestDate = localStorage.getItem('ecoEnzymeHarvestDate');
    if (savedHarvestDate) {
      setHarvestDate(new Date(savedHarvestDate));
    }
  }, []);

  useEffect(() => {
    const total = journalEntries.reduce((sum, entry) => sum + entry.weight, 0);
    setTotalWeight(total);
    if (total > 0) {
      setGula((total / 3).toFixed(2));
      setAir(((total / 3) * 10).toFixed(2));
    } else {
      setGula(0);
      setAir(0);
    }
  }, [journalEntries]);

  const addJournalEntry = (e) => {
    e.preventDefault();
    const weight = parseFloat(newEntryWeight);
    if (!weight || weight <= 0) return;
    const newEntry = { id: Date.now(), date: new Date().toLocaleDateString('id-ID'), weight: weight };
    const updatedEntries = [newEntry, ...journalEntries];
    setJournalEntries(updatedEntries);
    localStorage.setItem('ecoEnzymeJournal', JSON.stringify(updatedEntries));
    setNewEntryWeight('');
  };
  
  const deleteJournalEntry = (id) => {
      const updatedEntries = journalEntries.filter(entry => entry.id !== id);
      setJournalEntries(updatedEntries);
      localStorage.setItem('ecoEnzymeJournal', JSON.stringify(updatedEntries));
  };

  const startFermentation = () => {
    if (totalWeight <= 0) return;
    // PERUBAHAN: Tambahkan konfirmasi
    if (window.confirm("Anda yakin ingin memulai proses fermentasi 90 hari? Jurnal akan dikunci setelah ini.")) {
      const today = new Date();
      const futureDate = new Date(new Date().setDate(today.getDate() + 90));
      setHarvestDate(futureDate);
      localStorage.setItem('ecoEnzymeHarvestDate', futureDate.toISOString());
      
      // PERUBAHAN: Kode yang menghapus jurnal sudah dihapus dari sini
      
      setShowConfirmation(true);
      setTimeout(() => setShowConfirmation(false), 4000);
    }
  };

  const resetFermentation = () => {
    // PERUBAHAN: Tambahkan konfirmasi
    if (window.confirm("Anda yakin ingin mereset pengingat panen?")) {
      setHarvestDate(null);
      localStorage.removeItem('ecoEnzymeHarvestDate');
    }
  };

  const getTimeRemaining = () => {
    if (!harvestDate) return null;
    const total = Date.parse(harvestDate) - Date.parse(new Date());
    return Math.max(0, Math.ceil(total / (1000 * 60 * 60 * 24))); // Gunakan Math.ceil dan Math.max
  };
  
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!userInput.trim() || isBotTyping) return;
    const newMessages = [...chatMessages, { sender: 'user', text: userInput }];
    setChatMessages(newMessages);
    setIsBotTyping(true);
    const userQuery = userInput;
    setUserInput('');

    const systemPrompt = `Anda adalah "Ahli Daur Ulang", chatbot yang ramah. Jawab pertanyaan seputar daur ulang, guna ulang (reuse), eco enzyme, dan pilah sampah. Jika topik di luar itu, tolak dengan sopan. Gunakan bahasa Indonesia yang santai.`;
    const apiUrl = '/.netlify/functions/askAI';
    const payload = { userQuery, systemPrompt };

    try {
      const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const result = await response.json();
      const botResponse = result.response || "Maaf, ada sedikit masalah. Coba lagi nanti.";
      setChatMessages(prev => [...prev, { sender: 'bot', text: botResponse }]);
    } catch (error) {
      console.error("Error calling backend:", error);
      setChatMessages(prev => [...prev, { sender: 'bot', text: "Duh, koneksiku sedang bermasalah. Coba lagi ya." }]);
    } finally {
      setIsBotTyping(false);
    }
  };

  const openChat = () => {
    setIsChatOpen(true);
    setChatMessages([{ sender: 'bot', text: "Halo! Punya pertanyaan seputar daur ulang atau Eco Enzyme?" }]);
  };

  const daysRemaining = getTimeRemaining();
  const targetWeight = 3; // Target bisa disesuaikan
  const progressPercent = Math.min(100, (totalWeight / targetWeight) * 100);
  
  const instructionSteps = [
    { icon: "🫙", title: "Siapkan Wadah", description: "Gunakan wadah plastik kedap udara. Hindari kaca karena akan menghasilkan gas." },
    { icon: "💧", title: "Campur Gula & Air", description: "Masukkan air dan gula merah sesuai takaran, lalu aduk hingga larut." },
    { icon: "🥕", title: "Masukkan Sampah", description: "Tambahkan sisa buah & sayur mentah. Hindari yang sudah dimasak atau berminyak." },
    { icon: "🔒", title: "Tutup & Simpan", description: "Tutup rapat, beri label tanggal, dan simpan di tempat yang sejuk dan gelap." },
    { icon: "💨", title: "Lepas Gas", description: "Pada minggu pertama, buka tutup wadah setiap hari untuk melepaskan gas." },
    { icon: "🎉", title: "Panen!", description: "Setelah 90 hari, saring cairannya. Eco Enzyme Anda siap digunakan!" }
  ];

  return (
    <div className="ecoenzyme-container">
      {showConfirmation && ( <div className="fermentation-started-toast">Pengingat panen 90 hari telah diatur!</div> )}

      <div className="intro-hero">
        <div className="intro-hero-content">
          <h1>Ubah Sampah Dapur Jadi Cairan Ajaib!</h1>
          <p>Eco Enzyme adalah cara mudah mengolah sisa buah & sayur menjadi pembersih super ampuh dan pupuk alami yang bisa kamu buat sendiri di rumah.</p>
        </div>
        <div 
          className="intro-hero-image" 
          style={{ backgroundImage: `url('https://placehold.co/400x400/4CAF50/FFFFFF?text=Eco+Enzyme')` }}
        />
      </div>

      {/* --- PERUBAHAN STRUKTUR JSX --- */}
      {/* Zona Jurnal & Resep ini sekarang selalu tampil */}
      <div className="creation-zone">
        <div className="journal-container">
          <div className="card journal-card">
            <h3>Jurnal Sampah Organik</h3>
            <p className="subtitle">Catat sampah organikmu setiap hari untuk diakumulasi.</p>
            <form onSubmit={addJournalEntry} className="journal-form">
              <input 
                type="number" 
                step="0.1" 
                value={newEntryWeight} 
                onChange={(e) => setNewEntryWeight(e.target.value)} 
                placeholder="Berat hari ini (kg)" 
                required 
                disabled={!!harvestDate} // PERUBAHAN: Form dinonaktifkan jika fermentasi berjalan
              />
              <button type="submit" disabled={!!harvestDate}>+ Tambah</button>
            </form>
            <div className="journal-progress">
              <div className="progress-bar"><div className="progress-bar-inner" style={{ width: `${progressPercent}%` }}></div></div>
              <p className="progress-label">Terkumpul: <strong>{totalWeight.toFixed(2)} kg</strong> / {targetWeight} kg</p>
            </div>
            {journalEntries.length > 0 && (
                <ul className="journal-list">
                    {journalEntries.map(entry => (
                        <li key={entry.id}>
                            <span>{entry.date}: <strong>{entry.weight} kg</strong></span>
                            {/* PERUBAHAN: Tombol Hapus disembunyikan jika fermentasi berjalan */}
                            {!harvestDate && (
                              <button onClick={() => deleteJournalEntry(entry.id)} className="delete-btn">×</button>
                            )}
                        </li>
                    ))}
                </ul>
            )}
          </div>
        </div>
        <div className="recipe-container">
          <div className="card calculator-card">
            <h3>Kebutuhan Resep</h3>
            <div className="calculator-results">
              <div className="result-item"><span>Gula Merah (kg)</span><p>{gula}</p></div>
              <div className="result-item"><span>Air (Liter)</span><p>{air}</p></div>
            </div>
          </div>
        </div>
      </div>

      {/* Bagian ini yang berubah-ubah: Timer atau Tombol Mulai */}
      {harvestDate ? (
        <div className="card timer-card">
          <h3>Fermentasi Sedang Berjalan!</h3>
          <p className="timer-days">{daysRemaining}</p>
          <p className="timer-label">Hari Tersisa Hingga Panen</p>
          <p className="timer-harvest-date">
            Perkiraan Panen: {harvestDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
          <button onClick={resetFermentation} className="btn-reset-timer">Reset Pengingat</button>
        </div>
      ) : (
        totalWeight > 0 && (
          <button onClick={startFermentation} className="btn-start-fermentation">
            Mulai Fermentasi & Atur Pengingat
          </button>
        )
      )}

      <div className="card instructions-card">
        <h3>Langkah Demi Langkah</h3>
        <div className="instructions-stepper">
          {instructionSteps.map((step, index) => (
            <div key={index} className="step">
              <div className="step-icon-container"><div className="step-icon">{step.icon}</div></div>
              <div className="step-content">
                <h4>{index + 1}. {step.title}</h4>
                <p>{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <button className="floating-chat-btn" onClick={openChat}>💬</button>

      {isChatOpen && (
        <div className="chat-modal-overlay" onClick={() => setIsChatOpen(false)}>
          <div className="chat-window" onClick={(e) => e.stopPropagation()}>
            <div className="chat-header">
              <h4>Ahli Daur Ulang</h4>
              <button className="chat-close-btn" onClick={() => setIsChatOpen(false)}>×</button>
            </div>
            <div className="chat-body">
              {chatMessages.map((msg, index) => (<div key={index} className={`chat-message ${msg.sender}`}>{msg.text}</div>))}
              {isBotTyping && (<div className="chat-message bot typing"><span></span><span></span><span></span></div>)}
            </div>
            <form className="chat-input-form" onSubmit={handleSendMessage}>
              <input type="text" value={userInput} onChange={(e) => setUserInput(e.target.value)} placeholder="Ketik pertanyaanmu..." disabled={isBotTyping} />
              <button type="submit" disabled={isBotTyping}>Kirim</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EcoEnzyme;