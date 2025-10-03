import React, { useState } from 'react';
import { kuisData } from '../data/kuisData';
import './GameEdukasi.css'; // Import file CSS yang baru

const BONUS_POIN = 50;

const GameEdukasi = ({ onPoinAdded }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isGameFinished, setIsGameFinished] = useState(false);
  const [poinGame, setPoinGame] = useState(0);
  
  // State baru untuk feedback visual
  const [selectedAnswer, setSelectedAnswer] = useState(null); // Jawaban yang dipilih pengguna
  const [isAnswered, setIsAnswered] = useState(false);       // Apakah pertanyaan sudah dijawab

  if (!kuisData || kuisData.length === 0) {
    return <p>Loading kuis data atau no kuis available.</p>;
  }

  const currentKuis = kuisData[currentQuestionIndex];

  const handleAnswer = (jawaban) => {
    if (isAnswered) return; // Mencegah klik ganda

    setIsAnswered(true);
    setSelectedAnswer(jawaban);
    const isCorrect = jawaban === currentKuis.jawabanBenar;

    if (isCorrect) {
      const newPoinGame = poinGame + 10;
      setPoinGame(newPoinGame);
    }
    
    // Jeda sebelum pindah ke pertanyaan berikutnya
    setTimeout(() => {
      if (currentQuestionIndex < kuisData.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setIsAnswered(false);
        setSelectedAnswer(null);
      } else {
        // Poin game yang dikirim adalah poin yang didapat sebelum bonus
        handleGameFinish(isCorrect ? poinGame + 10 : poinGame);
      }
    }, 1500); // Jeda 1.5 detik untuk user melihat feedback
  };
  
  const handleGameFinish = (finalScore) => {
    setIsGameFinished(true);
    const totalPoinGame = finalScore + BONUS_POIN;
    
    // Menggunakan prop untuk update poin total di App.jsx
    if (onPoinAdded) {
      const existingPoin = parseInt(localStorage.getItem('totalPoin') || '0', 10);
      const newTotalPoin = existingPoin + totalPoinGame;
      onPoinAdded(newTotalPoin, `🥳 Kuis Selesai! Anda mendapatkan total ${totalPoinGame} Poin Bonus!`, "success");
    }
  };
  
  const resetGame = () => {
    setCurrentQuestionIndex(0);
    setPoinGame(0);
    setIsGameFinished(false);
    setIsAnswered(false);
    setSelectedAnswer(null);
  };
  
  // Progress bar logic
  const progressPercent = ((currentQuestionIndex + 1) / kuisData.length) * 100;

  if (isGameFinished) {
    return (
      <div className="finish-screen">
        <h3>✨ Kuis Selesai! Selamat! ✨</h3>
        <p>Anda telah berkontribusi pada edukasi daur ulang. <strong>Poin Bonus Anda sudah ditambahkan!</strong></p>
        <button onClick={resetGame} className="btn-reset">
          Ulangi Kuis
        </button>
      </div>
    );
  }

  return (
    <div className="quiz-container">
      <div className="quiz-header">
        <h2>🕹️ Uji Pengetahuan Daur Ulang</h2>
        <div className="quiz-stats">
          <span>Pertanyaan {currentQuestionIndex + 1}/{kuisData.length}</span>
          <span>Skor: {poinGame}</span>
        </div>
        <div className="progress-bar">
          <div className="progress-bar-inner" style={{ width: `${progressPercent}%` }}></div>
        </div>
      </div>
      
      <div className="question-area">
        <p className="question-text">{currentKuis.pertanyaan}</p>
      </div>

      <div className="answer-options">
        {currentKuis.options.map((option) => {
          const isSelected = selectedAnswer === option;
          const isCorrect = currentKuis.jawabanBenar === option;
          
          let btnClass = 'answer-btn';
          if (isAnswered) {
            if (isCorrect) {
              btnClass += ' correct'; // Jawaban benar akan selalu hijau
            } else if (isSelected) {
              btnClass += ' incorrect'; // Jawaban yang dipilih pengguna (tapi salah) akan merah
            } else {
              btnClass += ' disabled'; // Opsi lain dinonaktifkan
            }
          }

          return (
            <button
              key={option}
              onClick={() => handleAnswer(option)}
              className={btnClass}
              disabled={isAnswered}
            >
              {option}
            </button>
          );
        })}
      </div>

      {isAnswered && selectedAnswer === currentKuis.jawabanBenar && (
        <div className="fun-fact">
          <strong>👍 Betul!</strong> {currentKuis.funFact}
        </div>
      )}
    </div>
  );
};

export default GameEdukasi;