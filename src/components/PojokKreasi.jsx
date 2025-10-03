import React, { useState, useMemo } from 'react';
import { proyekList } from '../data/proyekData';
import './PojokKreasi.css';

// Fungsi untuk mengubah URL YouTube
const getYouTubeEmbedUrl = (url) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  if (match && match[2].length === 11) {
    return `https://www.youtube-nocookie.com/embed/${match[2]}`;
  }
  return null;
};

const PojokKreasi = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Semua');
  const [difficultyFilter, setDifficultyFilter] = useState('Semua');
  
  const [showModal, setShowModal] = useState(false);
  const [selectedProyek, setSelectedProyek] = useState(null);

  // State untuk Chatbot
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isBotTyping, setIsBotTyping] = useState(false);

  // Mengambil daftar kategori unik dari data
  const categories = useMemo(() => 
    ['Semua', ...new Set(proyekList.map(p => p.kategori))]
  , []);
  
  const difficulties = ['Semua', 'Sangat Mudah', 'Mudah', 'Menengah', 'Sulit'];

  // Logika filter gabungan
  const filteredProyek = useMemo(() => {
    return proyekList.filter(proyek => {
      const matchesCategory = categoryFilter === 'Semua' || proyek.kategori === categoryFilter;
      const matchesDifficulty = difficultyFilter === 'Semua' || proyek.kesulitan === difficultyFilter;
      const matchesSearch = proyek.judul.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesDifficulty && matchesSearch;
    });
  }, [searchQuery, categoryFilter, difficultyFilter]);

  const handleCardClick = (proyek) => {
    setSelectedProyek(proyek);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedProyek(null);
  };

  // --- Logika Chatbot ---
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
    setChatMessages([{ sender: 'bot', text: "Halo! Punya pertanyaan seputar daur ulang atau proyek di sini?" }]);
  };


  return (
    <div className="pojok-kreasi-container">
      <div className="pojok-kreasi-header">
        <h2>Pojok Kreasi 💡</h2>
        <p>Temukan inspirasi tanpa batas untuk mengubah barang bekas di sekitarmu menjadi karya yang bernilai guna!</p>
      </div>

      <div className="card filter-controls-card">
        <div className="search-bar">
          <input 
            type="text" 
            placeholder="Cari ide proyek... (cth: tas, lampion)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <div className="filter-row">
            <strong>Kategori:</strong>
            {categories.map(category => (
              <button key={category} className={`filter-btn ${categoryFilter === category ? 'active' : ''}`} onClick={() => setCategoryFilter(category)}>
                {category}
              </button>
            ))}
          </div>
          <div className="filter-row">
            <strong>Kesulitan:</strong>
            {difficulties.map(difficulty => (
              <button key={difficulty} className={`filter-btn ${difficultyFilter === difficulty ? 'active' : ''}`} onClick={() => setDifficultyFilter(difficulty)}>
                {difficulty}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="proyek-grid">
        {filteredProyek.length > 0 ? (
            filteredProyek.map((proyek) => (
            <div key={proyek.id} className="proyek-card" onClick={() => handleCardClick(proyek)}>
              <div className="proyek-image-container">
                <img src={proyek.gambar} alt={proyek.judul} />
              </div>
              <div className="proyek-info">
                <h3>{proyek.judul}</h3>
                <div className="proyek-tags">
                  <span className="tag tag-kategori">{proyek.kategori}</span>
                  <span className="tag tag-kesulitan">{proyek.kesulitan}</span>
                </div>
              </div>
            </div>
            ))
        ) : (
            <p className="no-results">Oops! Tidak ada proyek yang cocok dengan pencarianmu.</p>
        )}
      </div>

      <button className="floating-chat-btn" onClick={openChat}>
        💬
      </button>

      {showModal && selectedProyek && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <a href={selectedProyek.videoUrl} target="_blank" rel="noopener noreferrer" className="video-fallback-link">
              <div className="video-fallback-container">
                <img src={selectedProyek.gambar} alt={selectedProyek.judul} />
                <div className="play-button-overlay">
                  <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>
                </div>
              </div>
            </a>
            
            <div className="modal-body">
              <h3>{selectedProyek.judul}</h3>
              <p>{selectedProyek.deskripsi}</p>
              <div className="modal-details">
                <p><strong>Bahan:</strong> {selectedProyek.bahan}</p>
                <p><strong>Estimasi Waktu:</strong> {selectedProyek.durasi}</p>
              </div>
            </div>
              <button className="modal-close-btn" onClick={closeModal}>×</button>
          </div>
        </div>
      )}

      {isChatOpen && (
        <div className="chat-modal-overlay" onClick={() => setIsChatOpen(false)}>
          <div className="chat-window" onClick={(e) => e.stopPropagation()}>
            <div className="chat-header">
              <h4>Ahli Daur Ulang</h4>
              <button className="chat-close-btn" onClick={() => setIsChatOpen(false)}>×</button>
            </div>
            <div className="chat-body">
              {chatMessages.map((msg, index) => (
                <div key={index} className={`chat-message ${msg.sender}`}>{msg.text}</div>
              ))}
              {isBotTyping && (
                <div className="chat-message bot typing">
                  <span></span><span></span><span></span>
                </div>
              )}
            </div>
            <form className="chat-input-form" onSubmit={handleSendMessage}>
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Ketik pertanyaanmu..."
                disabled={isBotTyping}
              />
              <button type="submit" disabled={isBotTyping}>➤</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PojokKreasi;