import React, { useState, useEffect } from 'react';
import './LogPilahan.css'; // Import file CSS yang baru

const LogPilahan = ({ totalPoin, onPoinAdded }) => {
  const [pilahanList, setPilahanList] = useState([]);
  const [pilahanArchive, setPilahanArchive] = useState([]);
  const [jenis, setJenis] = useState('');
  const [berat, setBerat] = useState('');
  const [totalBeratAktif, setTotalBeratAktif] = useState(0);
  const [totalKontribusiKumulatif, setTotalKontribusiKumulatif] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const savedPilahan = JSON.parse(localStorage.getItem('pilahanList')) || [];
    const savedArchive = JSON.parse(localStorage.getItem('pilahanArchive')) || [];
    setPilahanList(savedPilahan);
    setPilahanArchive(savedArchive);
  }, [totalPoin]);

  useEffect(() => {
    const totalAktif = pilahanList.reduce((acc, pil) => acc + pil.berat, 0);
    const totalArsip = pilahanArchive.reduce((acc, pil) => acc + pil.berat, 0);
    setTotalBeratAktif(totalAktif);
    setTotalKontribusiKumulatif(totalAktif + totalArsip);
  }, [pilahanList, pilahanArchive]);

  const hitungPoin = (berat) => parseFloat(berat) * 100;

  const tambahPilahan = (e) => {
    e.preventDefault();
    const inputBerat = parseFloat(berat);
    if (!jenis || !inputBerat || inputBerat <= 0) {
      onPoinAdded(totalPoin, '⚠️ Berat atau jenis sampah tidak valid!', 'warning');
      return;
    }

    const poinDidapat = hitungPoin(inputBerat);
    const newPilahan = {
      id: Date.now(),
      jenis,
      berat: inputBerat,
      poin: poinDidapat,
      tanggal: new Date().toLocaleDateString('id-ID'),
    };

    setIsLoading(true);
    setTimeout(() => {
      const updatedList = [newPilahan, ...pilahanList];
      const updatedPoin = totalPoin + poinDidapat;
      localStorage.setItem('pilahanList', JSON.stringify(updatedList));
      setPilahanList(updatedList);
      onPoinAdded(updatedPoin, `🎉 Berhasil mencatat ${inputBerat} kg ${jenis}! Poin bertambah.`, 'success');
      setJenis('');
      setBerat('');
      setIsLoading(false);
    }, 800);
  };

  const targetBerat = 20;
  const progressPercent = Math.min(100, (totalBeratAktif / targetBerat) * 100);

  // Fungsi untuk mendapatkan ikon berdasarkan jenis sampah
  const getIconForJenis = (jenis) => {
    switch (jenis) {
      case 'Plastik PET': return '♻️';
      case 'Kertas/Kardus': return '📰';
      case 'Logam/Kaleng': return '🥫';
      case 'Organik': return '🌿';
      default: return '🗑️';
    }
  };

  return (
    <div className="log-pilahan-container">
      <h2>📊 Log Pilahan Sampah Anda</h2>

      <div className="card summary-card">
        <p><span className="icon">🌍</span>Kontribusi Total: <strong>{totalKontribusiKumulatif.toFixed(1)} kg</strong></p>
        <div className="progress-bar-container">
          <div className="progress-bar">
            <div className="progress-bar-inner" style={{ width: `${progressPercent}%` }}>
              {Math.round(progressPercent)}%
            </div>
          </div>
          <p className="progress-label">Target Pengiriman: <strong>{totalBeratAktif.toFixed(1)} kg</strong> / {targetBerat} kg</p>
        </div>
      </div>

      <div className="card">
        <h3>Catat Pilahan Baru</h3>
        <form onSubmit={tambahPilahan} className="pilahan-form">
          <select value={jenis} onChange={(e) => setJenis(e.target.value)} required disabled={isLoading}>
            <option value="">Pilih Jenis Sampah</option>
            <option value="Plastik PET">Plastik PET (Botol)</option>
            <option value="Kertas/Kardus">Kertas/Kardus</option>
            <option value="Logam/Kaleng">Logam/Kaleng</option>
            <option value="Organik">Organik (Kompos)</option>
          </select>
          <input type="number" step="0.1" placeholder="Berat (kg)" value={berat} onChange={(e) => setBerat(e.target.value)} required disabled={isLoading} />
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Memproses...' : 'Catat'}
          </button>
        </form>
      </div>

      <div className="card">
        <h3>📦 Sampah Aktif (Siap Dijemput)</h3>
        {pilahanList.length === 0 ? (
          <p className="empty-state">Belum ada sampah yang dicatat. Mulai memilah sekarang!</p>
        ) : (
          <ul className="pilahan-list">
            {pilahanList.map((pilahan) => (
              <li key={pilahan.id} className="pilahan-item">
                <span className="icon">{getIconForJenis(pilahan.jenis)}</span>
                <div className="pilahan-details">
                  <strong>{pilahan.jenis}</strong>
                  <p className="pilahan-info">{pilahan.berat} kg - Dicatat pada {pilahan.tanggal}</p>
                </div>
                <span className="pilahan-poin">+{pilahan.poin} Poin</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="card">
        <h3>✅ Riwayat Terkirim (Arsip)</h3>
        {pilahanArchive.length === 0 ? (
          <p className="empty-state">Belum ada riwayat pengiriman.</p>
        ) : (
          <ul className="pilahan-list">
            {pilahanArchive.map((pilahan) => (
              <li key={pilahan.id} className="pilahan-item archived">
                <span className="icon">{getIconForJenis(pilahan.jenis)}</span>
                <div className="pilahan-details">
                  <strong>{pilahan.jenis}</strong>
                  <p className="pilahan-info">
                    {pilahan.berat} kg - Terkirim ke {pilahan.dikirimKe || 'Mitra'} pada {new Date(pilahan.tanggalKirim).toLocaleDateString('id-ID')}
                  </p>
                </div>
                <span className="pilahan-poin">+{pilahan.poin} Poin</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default LogPilahan;