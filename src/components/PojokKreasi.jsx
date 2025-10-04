import React, { useState, useMemo, useEffect } from 'react';
import { proyekList } from '../data/proyekData';
import './PojokKreasi.css';
import ReactMarkdown from 'react-markdown';

// Fungsi untuk mengubah URL YouTube yang sudah disempurnakan
const getYouTubeEmbedUrl = (url) => {
  if (!url) return null;
  const regExp = /(?:https?:\/\/)?(?:www\.)?(?:m\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=|embed\/|v\/|shorts\/|)([a-zA-Z0-9_-]{11})(?:\S+)?/;
  const match = url.match(regExp);
  if (match && match[1].length === 11) {
    return `https://www.youtube-nocookie.com/embed/${match[1]}`;
  }
  return null;
};

const PojokKreasi = () => {
  // State untuk filter dan pencarian
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Semua');
  const [difficultyFilter, setDifficultyFilter] = useState('Semua');
  
  // State untuk modal detail proyek
  const [showModal, setShowModal] = useState(false);
  const [selectedProyek, setSelectedProyek] = useState(null);

  // State untuk chatbot
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [isBotTyping, setIsBotTyping] = useState(false);

  // State untuk riwayat chat dengan localStorage (versi aman)
  const [chatMessages, setChatMessages] = useState(() => {
    try {
      const savedChat = localStorage.getItem('chatHistory');
      if (savedChat) {
        return JSON.parse(savedChat);
      }
      return [];
    } catch (error) {
      console.error("Data chat rusak, membersihkan localStorage:", error);
      localStorage.removeItem('chatHistory');
      return [];
    }
  });

  // Efek untuk mengunci scroll body saat modal terbuka
  useEffect(() => {
    const isAnyModalOpen = showModal || isChatOpen;
    if (isAnyModalOpen) {
      document.body.classList.add('body-no-scroll');
    } else {
      document.body.classList.remove('body-no-scroll');
    }
    return () => {
      document.body.classList.remove('body-no-scroll');
    };
  }, [showModal, isChatOpen]);

  // Efek untuk menyimpan riwayat chat ke localStorage
  useEffect(() => {
    try {
      localStorage.setItem('chatHistory', JSON.stringify(chatMessages));
    } catch (error) {
      console.error("Gagal menyimpan data chat ke localStorage:", error);
    }
  }, [chatMessages]);

  // Logika untuk filter proyek
  const categories = useMemo(() => ['Semua', ...new Set(proyekList.map(p => p.kategori))], []);
  const difficulties = ['Semua', 'Sangat Mudah', 'Mudah', 'Menengah', 'Sulit'];

  const filteredProyek = useMemo(() => {
    return proyekList.filter(proyek => {
      const matchesCategory = categoryFilter === 'Semua' || proyek.kategori === categoryFilter;
      const matchesDifficulty = difficultyFilter === 'Semua' || proyek.kesulitan === difficultyFilter;
      const matchesSearch = proyek.judul.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesDifficulty && matchesSearch;
    });
  }, [searchQuery, categoryFilter, difficultyFilter]);

  // Fungsi-fungsi handler
  const handleCardClick = (proyek) => {
    setSelectedProyek(proyek);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedProyek(null);
  };

  const openChat = () => {
    setIsChatOpen(true);
    if (chatMessages.length === 0) {
      setChatMessages([{ sender: 'bot', text: "Halo! Punya pertanyaan seputar daur ulang atau proyek di sini?" }]);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!userInput.trim() || isBotTyping) return;
    
    const newMessages = [...chatMessages, { sender: 'user', text: userInput }];
    setChatMessages(newMessages);
    setIsBotTyping(true);
    const userQuery = userInput;
    setUserInput('');

    const systemPrompt = `Anda adalah "Ahli Daur Ulang", chatbot yang ramah. Jawab pertanyaan seputar daur ulang, guna ulang (reuse), eco enzyme, dan pilah sampah. Jika topik di luar itu, tolak dengan sopan. Gunakan bahasa Indonesia yang santai. PENTING: Gunakan format Markdown untuk membuat jawaban lebih mudah dibaca, seperti **teks tebal** untuk poin penting, dan daftar bernomor atau berpoin untuk langkah-langkah atau contoh.`;
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
        {filteredProyek.map((proyek) => (
          <div key={proyek.id} className="proyek-card" onClick={() => handleCardClick(proyek)}>
            <div className="proyek-image-container">
              <img src={proyek.gambar} alt={proyek.judul} />
            </div>
            <div className="proyek-info">
              <h3>{proyek.judul}</h3>
              <div className="proyek-tags">
                <span className="tag">{proyek.kategori}</span>
                <span className="tag">{proyek.kesulitan}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button className="floating-chat-btn" onClick={openChat}>
        💬
      </button>

      {showModal && selectedProyek && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="video-embed-container">
              <iframe
                width="100%"
                height="100%"
                src={getYouTubeEmbedUrl(selectedProyek.videoUrl)}
                title={selectedProyek.judul}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                loading="lazy"
              ></iframe>
            </div>
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
    <div key={index} className={`chat-message ${msg.sender}`}>
      <ReactMarkdown>{msg.text}</ReactMarkdown>
    </div>
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