import React, { useState, useEffect } from 'react';
import { mockMitraList } from '../data/mitraData'; 
import './PetaMitra.css';

const PetaMitra = ({ onPoinChange }) => {
    const [selectedJenis, setSelectedJenis] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedMitra, setSelectedMitra] = useState(null);
    const [pilahanSiapJemput, setPilahanSiapJemput] = useState([]);
    
    // State baru untuk menampung item yang akan dijemput
    const [itemsForPickup, setItemsForPickup] = useState([]);
    const [weightForPickup, setWeightForPickup] = useState(0);

    const [tanggalJemput, setTanggalJemput] = useState('');
    const [catatan, setCatatan] = useState('');

    useEffect(() => {
        const pilahan = JSON.parse(localStorage.getItem('pilahanList')) || [];
        setPilahanSiapJemput(pilahan);
    }, []);

    // Menghitung total berat semua sampah aktif untuk tampilan utama
    const getTotalBeratAktif = () => {
        return pilahanSiapJemput.reduce((acc, pil) => acc + pil.berat, 0).toFixed(1);
    };

    // --- LOGIKA BARU: Membuka modal hanya dengan item yang relevan ---
    const handleOpenModal = (mitra) => {
        // 1. Filter sampah aktif yang jenisnya diterima oleh mitra
        const eligibleItems = pilahanSiapJemput.filter(item => 
          mitra.terima.includes(item.jenis)
        );

        // 2. Jika tidak ada item yang cocok, beri tahu pengguna
        if (eligibleItems.length === 0) {
          alert(`⚠️ Anda tidak memiliki sampah jenis "${mitra.terima.join(' / ')}" yang siap dijemput.`);
          return;
        }
        
        // 3. Hitung berat hanya dari item yang cocok
        const eligibleWeight = eligibleItems.reduce((acc, item) => acc + item.berat, 0);

        // 4. Simpan item dan berat yang relevan ke state
        setItemsForPickup(eligibleItems);
        setWeightForPickup(eligibleWeight.toFixed(1));

        // 5. Buka modal
        setSelectedMitra(mitra);
        setShowModal(true);
    };

    // --- LOGIKA BARU: Mengirim hanya item yang dipilih ---
    const handleSubmitJemput = (e) => {
        e.preventDefault();
        if (!onPoinChange) {
            alert("Kesalahan Konfigurasi: onPoinChange tidak ditemukan.");
            return;
        }

        // 1. Dapatkan ID dari item yang akan dijemput
        const itemIdsToMove = new Set(itemsForPickup.map(item => item.id));

        // 2. Buat daftar pilahan yang tersisa (yang TIDAK dijemput)
        const remainingPilahan = pilahanSiapJemput.filter(item => !itemIdsToMove.has(item.id));
        
        // 3. Ambil arsip yang sudah ada
        const existingArchive = JSON.parse(localStorage.getItem('pilahanArchive')) || [];

        // 4. Tandai item yang dijemput dan siapkan untuk diarsip
        const timestampPengiriman = new Date().toISOString();
        const dikirimkan = itemsForPickup.map(pilahan => ({
            ...pilahan,
            status: 'Terkirim',
            tanggalKirim: timestampPengiriman,
            dikirimKe: selectedMitra.nama
        }));

        // 5. Gabungkan arsip lama dengan item yang baru dikirim
        const newArchive = [...dikirimkan, ...existingArchive];

        // 6. Simpan kembali arsip dan daftar pilahan yang tersisa ke Local Storage
        localStorage.setItem('pilahanArchive', JSON.stringify(newArchive));
        localStorage.setItem('pilahanList', JSON.stringify(remainingPilahan));

        // 7. Update state lokal agar tampilan sinkron
        setPilahanSiapJemput(remainingPilahan);
        
        const currentPoin = parseInt(localStorage.getItem('totalPoin')) || 0;
        onPoinChange(currentPoin, `🎉 ${weightForPickup} kg sampah berhasil disalurkan!`, 'success');

        // Reset modal dan tutup
        setShowModal(false);
        setTanggalJemput('');
        setCatatan('');
        setItemsForPickup([]);
        setWeightForPickup(0);
    };

    const totalBeratAktifDisplay = getTotalBeratAktif();

    const filteredMitra = mockMitraList.filter(mitra => {
        if (selectedJenis === '') return true;
        return mitra.terima.includes(selectedJenis);
    });

    return (
        <div className="peta-mitra-container">
            <h2>📍 Mitra Penyaluran Terdekat</h2>
            
            <div className="status-box">
                Total Sampah Siap Jemput: {totalBeratAktifDisplay} kg
            </div>

            <div className="filter-container">
                <label htmlFor="filterJenis">Filter Jenis Sampah:</label>
                <select id="filterJenis" value={selectedJenis} onChange={(e) => setSelectedJenis(e.target.value)}>
                    <option value="">Semua Jenis Sampah</option>
                    <option value="Plastik PET">Plastik PET</option>
                    <option value="Kertas/Kardus">Kertas/Kardus</option>
                    <option value="Logam/Kaleng">Logam/Kaleng</option>
                    <option value="Organik">Organik</option>
                </select>
            </div>

            {filteredMitra.length === 0 ? (
                <p>Tidak ada mitra terdekat yang menerima <strong>{selectedJenis}</strong>.</p>
            ) : (
                <div className="mitra-grid">
                    {filteredMitra.map((mitra) => {
                        // Cek apakah ada sampah yang cocok untuk mitra ini
                        const hasEligibleItems = pilahanSiapJemput.some(item => mitra.terima.includes(item.jenis));
                        return (
                            <div key={mitra.id} className="mitra-card">
                                <div className="mitra-card-header">
                                    <h3>{mitra.nama}</h3>
                                    <span className="mitra-rating">★ {mitra.rating}</span>
                                </div>
                                <p className="mitra-info">
                                    <strong>Jarak: {mitra.jarak}</strong> | <strong>Layanan:</strong> {mitra.layanan}
                                </p>
                                <div className="mitra-tags-container">
                                    {mitra.terima.map(jenis => <span key={jenis} className="mitra-tag">{jenis}</span>)}
                                </div>
                                {mitra.layanan.includes('Jemput') && (
                                    <button 
                                        onClick={() => handleOpenModal(mitra)}
                                        className="btn-jemput"
                                        disabled={!hasEligibleItems}
                                        title={!hasEligibleItems ? `Anda tidak memiliki sampah jenis ${mitra.terima.join('/')} untuk dijemput` : "Ajukan permintaan jemput"}
                                    >
                                        Minta Jemput
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {showModal && selectedMitra && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Ajukan Penjemputan ke {selectedMitra.nama}</h3>
                        {/* Menampilkan berat sampah yang relevan saja */}
                        <p>Total Sampah Akan Dijemput: <strong>{weightForPickup} kg</strong></p>
                        {/* Tambahan: Daftar item yang akan dijemput */}
                        <ul style={{fontSize: '0.9em', textAlign: 'left', paddingLeft: '20px'}}>
                            {itemsForPickup.map(item => <li key={item.id}>{item.berat} kg {item.jenis}</li>)}
                        </ul>
                        <form onSubmit={handleSubmitJemput}>
                            <label>Tanggal Jemput Ideal:</label>
                            <input type="date" value={tanggalJemput} onChange={(e) => setTanggalJemput(e.target.value)} required />
                            <label>Catatan Tambahan:</label>
                            <textarea value={catatan} onChange={(e) => setCatatan(e.target.value)} placeholder="Contoh: Sampah diletakkan di depan pagar." ></textarea>
                            <div className="modal-actions">
                                <button type="button" onClick={() => setShowModal(false)} className="btn-modal btn-cancel">Batal</button>
                                <button type="submit" className="btn-modal btn-submit">Konfirmasi Penjemputan</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PetaMitra;

