import React, { useEffect } from 'react';
import './Home.css'; 

// TERIMA setCurrentView SEBAGAI PROPS (dinamai handleViewChange di App.jsx)
const Home = ({ setCurrentView }) => {
  
  // Efek untuk memastikan state 'currentView' di App.js disetel ke 'home' 
  useEffect(() => {
    if (setCurrentView) {
      setCurrentView('home');
    }
  }, [setCurrentView]);

  // Data untuk 2 fitur utama DENGAN NARASI EDUKASI YANG DIRAPIKAN
  const featureCards = [
    {
      title: "Pojok Kreasi 💡",
      description: "Tahukah Anda? 80% sampah di rumah kita bisa diubah jadi uang atau barang berguna! Di Pojok Kreasi, temukan ratusan ide daur ulang yang fun dan mudah. Kami pandu Anda mengubah limbah menjadi peluang kreasi dan mengurangi tumpukan sampah TPA.",
      icon: "🎨",
      targetView: "kreasi", 
      className: "kreasi-card"
    },
    {
      title: "Eco Enzyme 🌱",
      description: "Stop! Sisa dapur yang membusuk menghasilkan gas metana berbahaya bagi Bumi. Lindungi lingkungan dengan Eco Enzyme! Dapatkan panduan lengkap, kalkulator resep otomatis, dan jurnal fermentasi. Ubah limbah organik Anda menjadi cairan pembersih alami yang ramah lingkungan.",
      icon: "🧪",
      targetView: "enzyme",
      className: "ecoenzyme-card"
    }
  ];
  
  // Fungsi handler tunggal untuk navigasi berbasis state
  const handleCardClick = (targetView) => {
      setCurrentView(targetView);
  }

  return (
    <div className="home-container">
      
      {/* 1. Hero Section - Menggunakan narasi misi yang kuat */}
      <header className="hero-section">
        <h1>Ubah Limbah Menjadi Kreasi Bernilai. Mulai Aksi Hijau Anda Sekarang!</h1>
        <p className="subtitle">
          Rekarya memberdayakan setiap rumah tangga menjadi produsen solusi, bukan sumber limbah. Kami menyediakan panduan daur ulang praktis dan alat bantu Eco Enzyme untuk mendukung gaya hidup sirkular. Misi kami: Kurangi sampah, kuatkan komunitas, ciptakan lingkungan hijau.
        </p>
        <button 
            className="cta-button" 
            onClick={() => handleCardClick('kreasi')} 
        >
            Mulai Berkreasi Sekarang!
        </button>
      </header>

      <hr className="divider" />

      {/* 2. Fitur Utama (2 Kartu Navigasi) */}
      <section className="features-section">
        <h2>Pilih Aksi Lingkunganmu</h2>
        <div className="card-grid">
          {featureCards.map((card, index) => (
            <div 
              key={index} 
              className={`feature-card ${card.className}`} 
              onClick={() => handleCardClick(card.targetView)} 
            >
              <div className="card-icon">{card.icon}</div>
              <h3>{card.title}</h3>
              <p>{card.description}</p>
              <span className="card-link">Telusuri Sekarang →</span>
            </div>
          ))}
        </div>
      </section>
      
      {/* 3. NEW: Impact Section (Edukasi & Awareness) */}
      <section className="impact-section">
        <h2>Dampak Kecil, Perubahan Besar</h2>
        <div className="impact-grid">
          <div className="impact-item">
            <span className="impact-number">1 Ton</span>
            <p>Limbah dapur menghasilkan 1 Ton gas rumah kaca jika dibiarkan membusuk di TPA. Eco Enzyme menghentikan ini.</p>
          </div>
          <div className="impact-item">
            <span className="impact-number">500 Tahun</span>
            <p>Waktu yang dibutuhkan botol plastik (PET) untuk terurai sempurna. Ubah jadi kreasi, hindari bahaya mikroplastik!</p>
          </div>
          <div className="impact-item">
            <span className="impact-number">2x Lipat</span>
            <p>Penggunaan deterjen komersial berlebihan bisa merusak ekosistem air. Beralihlah ke pembersih alami Eco Enzyme.</p>
          </div>
        </div>
        <button className="cta-button secondary-cta" onClick={() => handleCardClick('enzyme')}>
            Lihat Dampak Eco Enzyme
        </button>
      </section>

      {/* 4. Section Chat AI */}
      <section className="chat-promo-section">
        <div className="chat-promo-content">
            <span className="chat-icon">💬</span>
            <h3>Butuh Bantuan Instan? Tanya Ahlinya!</h3>
            <p>Fitur Ahli Daur Ulang kami siap menjawab pertanyaanmu seputar pilah sampah, eco enzyme, dan ide proyek. Akses chatbot ini di Pojok Kreasi atau Eco Enzyme.</p>
        </div>
      </section>
    </div>
  );
};

export default Home;
