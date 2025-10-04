import React, { useState, useEffect, useRef } from 'react';
import './EcoEnzyme.css'; // FILE CSS YANG SUDAH KITA SEDIAKAN
import ReactMarkdown from 'react-markdown';

const EcoEnzyme = () => {
    // Pastikan variabel global ada (Menggunakan default yang kuat)
    const appId = typeof __app_id !== 'undefined' ? __app_id : 'ecoenzyme-tracker-default';

    // ==========================================================
    // STATE MANAGEMENT
    // ==========================================================
    const [journalEntries, setJournalEntries] = useState([]);
    const [newEntryWeight, setNewEntryWeight] = useState('');
    const [totalWeight, setTotalWeight] = useState(0);
    const [gula, setGula] = useState(0);
    const [air, setAir] = useState(0);
    const [harvestDate, setHarvestDate] = useState(null);
    const [showConfirmation, setShowConfirmation] = useState(false);
    
    // STATE BARU UNTUK TIMER OTOMATIS
    const [currentTime, setCurrentTime] = useState(Date.now());

    // State untuk Chatbot
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [userInput, setUserInput] = useState('');
    const [isBotTyping, setIsBotTyping] = useState(false);
    const chatBodyRef = useRef(null);

    // Initial State Chat messages (Memuat dari LocalStorage)
    const [chatMessages, setChatMessages] = useState(() => {
        try {
            const savedChat = localStorage.getItem(`chatHistoryEcoEnzyme_${appId}`);
            if (savedChat) {
                return JSON.parse(savedChat);
            }
            return [];
        } catch (error) {
            console.error("Data chat rusak, membersihkan localStorage:", error);
            localStorage.removeItem(`chatHistoryEcoEnzyme_${appId}`);
            return [];
        }
    });

    // ==========================================================
    // LOGIKA EFEK & DATA PERSISTENCE
    // ==========================================================

    // ==========================================================
// LOGIKA EFEK & DATA PERSISTENCE
// ==========================================================

// Efek 1: Memuat data jurnal dan tanggal panen saat pertama kali render
useEffect(() => {
  const savedEntries = JSON.parse(localStorage.getItem(`ecoEnzymeJournal_${appId}`)) || [];
  const total = savedEntries.reduce((sum, entry) => sum + entry.weight, 0);
  setJournalEntries(savedEntries);
  setTotalWeight(total);

  const savedHarvestDate = localStorage.getItem(`ecoEnzymeHarvestDate_${appId}`);
  if (savedHarvestDate) {
      setHarvestDate(new Date(savedHarvestDate));
  }
}, [appId]);

// Efek 2: Menyimpan jurnal ke LocalStorage dan menghitung ulang resep SETIAP kali jurnal berubah
useEffect(() => {
  // Simpan Jurnal
  localStorage.setItem(`ecoEnzymeJournal_${appId}`, JSON.stringify(journalEntries));

  // Hitung ulang total berat, gula, dan air
  const total = journalEntries.reduce((sum, entry) => sum + entry.weight, 0);
  setTotalWeight(total);

  if (total > 0) {
      // Rasio 1:3:10 (Gula:Sampah:Air) -> Gula = Sampah / 3, Air = Gula * 10
      setGula((total / 3).toFixed(2));
      setAir(((total / 3) * 10).toFixed(2));
  } else {
      setGula(0);
      setAir(0);
  }
}, [journalEntries, appId]); // Dependensi: journalEntries dan appId

// Efek 3: Menyimpan tanggal panen ke LocalStorage (berjalan saat startFermentation)
useEffect(() => {
  if (harvestDate) {
      localStorage.setItem(`ecoEnzymeHarvestDate_${appId}`, harvestDate.toISOString());
  } else {
      localStorage.removeItem(`ecoEnzymeHarvestDate_${appId}`);
  }
}, [harvestDate, appId]);

// Efek 4: Membuat Timer Berdetak Setiap Detik (PERBAIKAN TIMER)
useEffect(() => {
  if (!harvestDate) return; // Stop jika fermentasi belum dimulai

  // Atur interval untuk memperbarui waktu setiap 1000ms (1 detik)
  const intervalId = setInterval(() => {
      setCurrentTime(Date.now()); 
  }, 1000);

  // Bersihkan interval saat komponen dilepas atau harvestDate berubah
  return () => clearInterval(intervalId);
}, [harvestDate]); 


// Efek 5: Mengunci scroll body saat chat terbuka & auto-scroll chat
useEffect(() => {
  if (isChatOpen) {
      document.body.classList.add('body-no-scroll');
  } else {
      document.body.classList.remove('body-no-scroll');
  }

  // Auto-scroll hanya saat ada pesan baru dan chat terbuka
  if (isChatOpen && chatBodyRef.current) {
      const chatBody = chatBodyRef.current;
      chatBody.scrollTop = chatBody.scrollHeight;
  }

  return () => {
      document.body.classList.remove('body-no-scroll');
  };
}, [isChatOpen, chatMessages]);

// Efek 6: Menyimpan riwayat chat ke localStorage
useEffect(() => {
  try {
      localStorage.setItem(`chatHistoryEcoEnzyme_${appId}`, JSON.stringify(chatMessages));
  } catch (error) {
      console.error("Gagal menyimpan data chat ke localStorage:", error);
  }
}, [chatMessages, appId]);
    // ==========================================================
    // FUNGSI UTAMA TRACKER
    // ==========================================================

    /**
     * Menghitung hari tersisa hingga tanggal panen 90 hari.
     * @returns {number} Jumlah hari tersisa.
     */
    const getTimeRemaining = () => {
        // Gunakan currentTime agar perhitungan di-refresh setiap detik
        if (!harvestDate || Date.now() >= harvestDate.getTime()) return 0; 

        const now = new Date(currentTime); // Menggunakan state yang di-update interval
        const timeDiff = harvestDate.getTime() - now.getTime();

        const days = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

        return days > 0 ? days : 0;
    };

    /**
     * Menambahkan entri sampah organik ke jurnal.
     */
    const addJournalEntry = (e) => {
        e.preventDefault();
        const weightValue = parseFloat(newEntryWeight);

        // Validasi
        // if (harvestDate) {
        //     alert("Fermentasi sudah berjalan! Tidak bisa menambah entri baru sebelum mereset timer.");
        //     return;
        // }
        if (isNaN(weightValue) || weightValue <= 0) {
            alert("Harap masukkan berat yang valid (lebih dari 0).");
            return;
        }

        const newEntry = {
            id: Date.now() + Math.random(),
            date: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
            weight: weightValue
        };

        const updatedEntries = [newEntry, ...journalEntries]; // Entri baru di atas
        setJournalEntries(updatedEntries);
        setNewEntryWeight('');
    };

    /**
     * Menghapus entri jurnal berdasarkan ID.
     */
    const deleteJournalEntry = (id) => {
        if (harvestDate) return; // Tidak boleh dihapus jika fermentasi sudah berjalan

        const updatedEntries = journalEntries.filter(entry => entry.id !== id);
        setJournalEntries(updatedEntries);
    };

    /**
     * Memulai proses fermentasi dan mengatur tanggal panen 90 hari.
     */
    const startFermentation = () => {
      // --- BATASAN totalWeight < 1 SUDAH DIHILANGKAN DI SINI ---
      
      // Cek hanya jika totalWeight = 0, agar user tidak memulai tanpa sampah sama sekali
      if (totalWeight <= 0) { 
          alert("Harap masukkan sampah organik terlebih dahulu sebelum memulai fermentasi.");
          return;
      }

      const startDate = new Date();
      // Tambahkan 90 hari untuk panen (3 bulan)
      const harvest = new Date(startDate);
      harvest.setDate(harvest.getDate() + 90);

      setHarvestDate(harvest);

      // Tampilkan notifikasi toast
      setShowConfirmation(true);
      setTimeout(() => setShowConfirmation(false), 3000);
  };
    /**
     * Mereset seluruh data fermentasi dan jurnal.
     */
    const resetFermentation = () => {
        if (window.confirm("Yakin ingin me-reset seluruh jurnal dan timer fermentasi?")) {
            // Hapus data dari state
            setHarvestDate(null);
            setJournalEntries([]);
            // State gula/air akan otomatis di-reset oleh useEffect saat journalEntries kosong
        }
    };


    // ==========================================================
    // FUNGSI CHATBOT
    // ==========================================================

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!userInput.trim() || isBotTyping) return;

        const userMessage = userInput.trim();
        const newMessages = [...chatMessages, { sender: 'user', text: userMessage }];
        setChatMessages(newMessages);
        setIsBotTyping(true);
        setUserInput('');

        const systemPrompt = `Anda adalah "Ahli Eco Enzyme", chatbot ramah dan spesialis. Jawab HANYA pertanyaan seputar eco enzyme. Jika topik di luar itu, tolak dengan sopan (misalnya, "Maaf, aku hanya fokus pada Eco Enzyme!"). Gunakan bahasa Indonesia yang santai. PENTING: Gunakan format Markdown (seperti **teks tebal** dan daftar) untuk membuat jawaban lebih mudah dibaca.`;

        // Anda perlu mengganti ini dengan API Key Gemini yang valid
        const apiKey = "AIzaSyCfHmzOaDrjycvXuzdWx2z32DrScIpEjJE"; 
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

        const payload = {
            contents: [{ parts: [{ text: userMessage }] }],
            systemInstruction: { parts: [{ text: systemPrompt }] },
            tools: [{ "google_search": {} }],
        };

        const fetchWithRetry = async (url, options, maxRetries = 5) => {
            for (let i = 0; i < maxRetries; i++) {
                try {
                    const response = await fetch(url, options);
                    if (response.status !== 429 && response.ok) {
                        return response;
                    } else if (response.status === 429) {
                        const delay = Math.pow(2, i) * 1000 + Math.random() * 1000;
                        if (i < maxRetries - 1) {
                            await new Promise(resolve => setTimeout(resolve, delay));
                            continue;
                        }
                    } else {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                } catch (error) {
                    if (i < maxRetries - 1) {
                        const delay = Math.pow(2, i) * 1000 + Math.random() * 1000;
                        await new Promise(resolve => setTimeout(resolve, delay));
                        continue;
                    }
                    throw error;
                }
            }
        };

        try {
            const response = await fetchWithRetry(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response) throw new Error("Gagal mendapatkan respons dari API.");

            const result = await response.json();
            const candidate = result.candidates?.[0];
            const botResponse = candidate?.content?.parts?.[0]?.text || "Maaf, ada masalah saat memproses permintaan Anda.";

            setChatMessages(prev => [...prev, { sender: 'bot', text: botResponse }]);

        } catch (error) {
            console.error("Error calling Gemini API:", error);
            setChatMessages(prev => [...prev, { sender: 'bot', text: "Duh, koneksiku sedang bermasalah atau API Key belum diatur dengan benar. Coba lagi ya." }]);
        } finally {
            setIsBotTyping(false);
        }
    };

    const openChat = () => {
        setIsChatOpen(true);
        if (chatMessages.length === 0) {
            // Pesan sambutanF hanya jika riwayat chat kosong
            setChatMessages([{ sender: 'bot', text: "Halo! Saya Ahli Eco Enzyme. Ada yang bisa dibantu seputar proses pembuatan, manfaat, atau masalah yang Anda hadapi?" }]);
        }
    };

    // ==========================================================
    // VARIABLE TAMPILAN
    // ==========================================================
    const daysRemaining = getTimeRemaining();
    const targetWeight = 3; // Target (kg)
    const progressPercent = Math.min(100, (totalWeight / targetWeight) * 100);

    const instructionSteps = [
        { icon: "🫙", title: "Siapkan Wadah", description: "Gunakan wadah plastik kedap udara (ratio 3/5 terisi). Hindari kaca karena akan menghasilkan gas." },
        { icon: "💧", title: "Campur Gula & Air", description: "Masukkan air dan gula merah sesuai takaran (rasio 10:1), lalu aduk hingga larut." },
        { icon: "🥕", title: "Masukkan Sampah", description: "Tambahkan sisa buah & sayur mentah. (rasio 3:1 terhadap gula). Hindari yang sudah dimasak atau berminyak." },
        { icon: "🔒", title: "Tutup & Simpan", description: "Tutup rapat, beri label tanggal, dan simpan di tempat yang sejuk dan gelap." },
        { icon: "💨", title: "Lepas Gas", description: "Pada **minggu pertama**, buka tutup wadah setiap hari untuk melepaskan gas fermentasi." },
        { icon: "🎉", title: "Panen!", description: "Setelah **90 hari** (3 bulan), saring cairannya. Eco Enzyme Anda siap digunakan!" }
    ];

    // ==========================================================
    // RENDER KOMPONEN
    // ==========================================================
    return (
        <div className="ecoenzyme-container">
            {/* Toast Notifikasi */}
            {showConfirmation && (
                <div className="fermentation-started-toast">
                    Pengingat panen 90 hari telah diatur! Perkiraan panen: {harvestDate?.toLocaleDateString('id-ID', { day: 'numeric', month: 'long' })}
                </div>
            )}

            <div className="intro-hero">
                <div className="intro-hero-content">
                    <h1>Ubah Sampah Dapur Jadi Cairan Ajaib!</h1>
                    <p>Eco Enzyme adalah cara mudah mengolah sisa buah & sayur menjadi pembersih super ampuh dan pupuk alami yang bisa kamu buat sendiri di rumah.</p>
                </div>
                {/* Ilustrasi Eco Enzyme */}
                <div
                    className="intro-hero-image"
                    style={{ backgroundImage: `url('/images/eco.png')` }}
                    aria-label="Ilustrasi Eco Enzyme"
                />
            </div>

            {/* Zona Jurnal & Resep */}
            <div className="creation-zone">
                <div className="journal-container">
                    <div className="card journal-card">
                        <h3>Jurnal Sampah Organik</h3>
                        <p className="subtitle">Catat sampah organikmu setiap hari untuk diakumulasi. (Target {targetWeight} kg)</p>
                        
                        {/* FORMULIR JURNAL */}
                        <form onSubmit={addJournalEntry} className="journal-form">
                            <input
                                type="number"
                                step="0.01"
                                value={newEntryWeight}
                                onChange={(e) => setNewEntryWeight(e.target.value)}
                                placeholder="Berat hari ini (kg)"
                                required
                                aria-label="Berat sampah dalam kilogram"
                            />
                            {/* Tombol Tambah akan non-aktif jika fermentasi sudah jalan */}
                            <button type="submit" >+ Tambah</button>
                        </form>
                        
                        {/* PROGRESS BAR */}
                        <div className="journal-progress">
                            <div className="progress-bar"><div className="progress-bar-inner" style={{ width: `${progressPercent}%` }}></div></div>
                            <p className="progress-label">Terkumpul: <strong>{totalWeight.toFixed(2)} kg</strong> / {targetWeight} kg</p>
                        </div>
                        
                        {/* DAFTAR JURNAL */}
                        {journalEntries.length > 0 && (
                            <ul className="journal-list">
                                {journalEntries.map(entry => (
                                    <li key={entry.id}>
                                        <span>{entry.date}: <strong>{entry.weight} kg</strong></span>
                                        {/* Tombol Hapus akan hilang jika fermentasi sudah jalan */}
                                        {!harvestDate && (
                                            <button onClick={() => deleteJournalEntry(entry.id)} className="delete-btn" aria-label="Hapus entri">×</button>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
                
                {/* KALKULATOR RESEP */}
                <div className="recipe-container">
                    <div className="card calculator-card">
                        <h3>Kebutuhan Resep (Rasio 1:3:10)</h3>
                        <div className="calculator-results">
                            <div className="result-item"><span>Sampah Organik (kg)</span><p>{totalWeight.toFixed(2)}</p></div>
                            <div className="result-item"><span>Gula Merah (kg)</span><p>{gula}</p></div>
                            <div className="result-item"><span>Air (Liter)</span><p>{air}</p></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bagian Tombol Aksi/Timer */}
            <div className='timer-action-area'>
                {harvestDate ? (
                    // Tampilan Timer Berjalan
                    <div className="card timer-card">
                        <h3>Fermentasi Sedang Berjalan!</h3>
                        <p className="timer-days">{daysRemaining}</p>
                        <p className="timer-label">Hari Tersisa Hingga Panen</p>
                        <p className="timer-harvest-date">
                            Perkiraan Panen: {harvestDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                        <button onClick={resetFermentation} className="btn-reset-timer">Reset Pengingat & Mulai Baru</button>
                    </div>
                ) : (
                    // Tampilan Tombol Mulai (muncul jika totalWeight > 0)
                    totalWeight  > 0 && (
                        <button onClick={startFermentation} className="btn-start-fermentation">
                            Mulai Fermentasi & Atur Pengingat ({totalWeight.toFixed(2)} kg Sampah)
                        </button>
                    )
                )}
            </div>

            {/* PANDUAN LANGKAH */}
            <div className="card instructions-card">
                <h3>Langkah Demi Langkah Pembuatan</h3>
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

            {/* TOMBOL CHATBOT */}
            <button className="floating-chat-btn" onClick={openChat} aria-label="Buka Chatbot">💬</button>

            {/* CHATBOT MODAL */}
            {isChatOpen && (
                <div className="chat-modal-overlay" onClick={() => setIsChatOpen(false)}>
                    <div className="chat-window" onClick={(e) => e.stopPropagation()}>
                        <div className="chat-header">
                            <h4>Ahli Eco Enzyme</h4>
                            <button className="chat-close-btn" onClick={() => setIsChatOpen(false)} aria-label="Tutup Chat">×</button>
                        </div>
                        <div className="chat-body" ref={chatBodyRef}>
                            {chatMessages.map((msg, index) => (
                                <div key={index} className={`chat-message ${msg.sender}`}>
                                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                                </div>
                            ))}
                            {isBotTyping && (<div className="chat-message bot typing"><span></span><span></span><span></span></div>)}
                        </div>
                        <form className="chat-input-form" onSubmit={handleSendMessage}>
                            <input
                                type="text"
                                value={userInput}
                                onChange={(e) => setUserInput(e.target.value)}
                                placeholder="Ketik pertanyaanmu..."
                                disabled={isBotTyping}
                                aria-label="Kolom pesan chat"
                            />
                            <button type="submit" disabled={isBotTyping} aria-label="Kirim pesan">➤</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EcoEnzyme;