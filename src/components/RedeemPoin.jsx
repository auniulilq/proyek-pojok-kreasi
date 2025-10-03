import React, { useState, useEffect } from 'react';
import './RedeemPoin.css'; // Import file CSS yang baru

// Mock Data untuk Hadiah (dengan tambahan ikon)
const rewardList = [
  { id: 1, nama: "Voucher Kopi Rp 10rb", biaya: 500, icon: "☕" },
  { id: 2, nama: "Pot Tanaman Daur Ulang", biaya: 1000, icon: "🪴" },
  { id: 3, nama: "Diskon Alat Pilah Sampah 20%", biaya: 1500, icon: "🛠️" },
  { id: 4, nama: "Donasi Bibit Pohon", biaya: 2000, icon: "🌳" },
];

const RedeemPoin = ({ totalPoin, onRedeemSuccess }) => {
  // State baru untuk modal
  const [showModal, setShowModal] = useState(false);
  const [selectedReward, setSelectedReward] = useState(null);

  // Fungsi untuk memulai proses redeem
  const handleRedeemClick = (reward) => {
    if (totalPoin < reward.biaya) {
      // Menggunakan toast dari App.jsx untuk notifikasi poin kurang
      onRedeemSuccess(totalPoin, `⚠️ Poin Anda tidak cukup untuk ${reward.nama}.`, 'warning');
      return;
    }
    setSelectedReward(reward);
    setShowModal(true);
  };

  // Fungsi yang dieksekusi setelah konfirmasi di modal
  const confirmRedeem = () => {
    if (!selectedReward) return;

    const newPoin = totalPoin - selectedReward.biaya;

    // Panggil callback untuk me-refresh total poin dan tampilkan notifikasi
    onRedeemSuccess(
      newPoin, 
      `🎉 Berhasil! "${selectedReward.nama}" telah ditukarkan.`, 
      'success'
    );
    
    // Tutup modal
    setShowModal(false);
    setSelectedReward(null);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedReward(null);
  };

  return (
    <div className="redeem-container">
      <div className="redeem-header">
        <h2>🎁 Tukarkan Poin Kontribusi Anda!</h2>
        <p className="user-points">{totalPoin} Poin</p>
      </div>

      <div className="rewards-grid">
        {rewardList.map((reward) => {
          const isAffordable = totalPoin >= reward.biaya;
          return (
            <div key={reward.id} className={`reward-card ${!isAffordable ? 'disabled' : ''}`}>
              <div className="reward-icon">{reward.icon}</div>
              <h3>{reward.nama}</h3>
              <p className="reward-cost">{reward.biaya} Poin</p>
              <button 
                onClick={() => handleRedeemClick(reward)}
                disabled={!isAffordable}
                className="btn-redeem"
              >
                {isAffordable ? 'Tukarkan' : 'Poin Kurang'}
              </button>
            </div>
          );
        })}
      </div>

      {/* Modal Konfirmasi */}
      {showModal && selectedReward && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Konfirmasi Penukaran</h3>
            <p>
              Anda akan menukarkan <strong>{selectedReward.biaya} Poin</strong> untuk mendapatkan 
              <br/>
              <strong>"{selectedReward.nama}"</strong>.
            </p>
            <p>Poin Anda akan tersisa: {totalPoin - selectedReward.biaya}</p>
            <div className="modal-actions">
              <button onClick={closeModal} className="btn-modal btn-cancel">Batal</button>
              <button onClick={confirmRedeem} className="btn-modal btn-confirm">Ya, Tukarkan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RedeemPoin;