import React, { useState, useEffect, useRef } from 'react';
import { proyekList } from '../data/proyekData';
import './ScanInspirasi.css';

// Import library AI
import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';

// Fungsi untuk mengubah URL YouTube (tidak berubah)
const getYouTubeEmbedUrl = (url) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  if (match && match[2].length === 11) {
    return `https://www.youtube.com/embed/${match[2]}?autoplay=1&mute=1`;
  }
  return null;
};

const ScanInspirasi = () => {
  // State untuk Scan
  const [model, setModel] = useState(null);
  const [modelStatus, setModelStatus] = useState("Memuat Model AI, mohon tunggu...");
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [hasSnapshot, setHasSnapshot] = useState(false);
  const [capturedImageSrc, setCapturedImageSrc] = useState(null);
  const [foundProjects, setFoundProjects] = useState([]);
  const [detectionMessage, setDetectionMessage] = useState("");
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // State untuk Chatbot (dipindahkan ke sini)
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isBotTyping, setIsBotTyping] = useState(false);

  // Inisialisasi AI
  useEffect(() => {
    const initializeAI = async () => {
      try {
        setModelStatus("Memuat Model AI ke memori...");
        const loadedModel = await cocoSsd.load();
        setModel(loadedModel);
        setModelStatus("Model AI siap digunakan.");
        console.log("Model AI siap digunakan.");
      } catch (error) {
        console.error("Gagal saat inisialisasi AI:", error);
        setModelStatus(`Gagal memuat Model AI. Coba refresh halaman.`);
      }
    };
    initializeAI();
  }, []);

  // Mengelola kamera
  useEffect(() => {
    if (isCameraActive && model) startCameraFeed();
    else stopCameraFeed();
    return () => stopCameraFeed();
  }, [isCameraActive, model]);

  const startCameraFeed = async () => {
    try {
      // Reset semua state sebelum memulai
      handleReset();
      setIsCameraActive(true); // Aktifkan kamera setelah reset

      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      const videoNode = videoRef.current;
      if (videoNode) {
        videoNode.srcObject = stream;
        videoNode.onloadedmetadata = () => videoNode.play();
      }
    } catch (err) {
      console.error("Gagal mengakses kamera:", err);
      setIsCameraActive(false);
      setModelStatus("Gagal akses kamera. Periksa izin di browser Anda.");
    }
  };

  const stopCameraFeed = () => {
    const stream = videoRef.current?.srcObject;
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const takeSnapshot = async () => {
    if (!videoRef.current || !model || !isCameraActive) return;
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = videoRef.current.videoWidth;
    tempCanvas.height = videoRef.current.videoHeight;
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.drawImage(videoRef.current, 0, 0, tempCanvas.width, tempCanvas.height);
    setCapturedImageSrc(tempCanvas.toDataURL('image/jpeg'));
    setHasSnapshot(true);
    setIsCameraActive(false);

    const predictions = await model.detect(tempCanvas);
    drawBoundingBoxes(predictions, tempCanvas);

    const detectedObjects = predictions.filter(p => p.score > 0.55).map(p => p.class);
    if (detectedObjects.length > 0) {
      const projects = proyekList.filter(proyek => proyek.kata_kunci.some(keyword => detectedObjects.includes(keyword)));
      setFoundProjects(projects);
      if (projects.length === 0) {
        setDetectionMessage(`Objek "${detectedObjects.join(', ')}" terdeteksi, tapi inspirasi video belum tersedia. Ingin bertanya lebih lanjut?`);
      }
    } else {
      setFoundProjects([]);
      setDetectionMessage("Tidak ada objek yang terdeteksi. Coba lagi atau tanya ahli daur ulang kami!");
    }
  };

  const drawBoundingBoxes = (predictions, sourceCanvas) => {
    if (!canvasRef.current || !sourceCanvas) return;
    const ctx = canvasRef.current.getContext('2d');
    const width = sourceCanvas.width;
    const height = sourceCanvas.height;
    canvasRef.current.width = width;
    canvasRef.current.height = height;

    const img = new Image();
    img.onload = () => {
        ctx.drawImage(img, 0, 0, width, height);
        predictions.forEach(prediction => {
            if (prediction.score > 0.55) {
                const [x, y, w, h] = prediction.bbox;
                ctx.strokeStyle = '#8E44AD';
                ctx.lineWidth = 4;
                ctx.strokeRect(x, y, w, h);
                ctx.fillStyle = '#8E44AD';
                ctx.font = '18px Arial';
                ctx.fillText(`${prediction.class} (${Math.round(prediction.score * 100)}%)`, x, y > 10 ? y - 5 : 10);
            }
        });
    };
    img.src = capturedImageSrc || sourceCanvas.toDataURL('image/jpeg');
  };

  const handleReset = () => {
    setIsCameraActive(false);
    setHasSnapshot(false);
    setCapturedImageSrc(null);
    setFoundProjects([]);
    setDetectionMessage("");
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
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
    const apiUrl = '/.netlify/functions/askAI'; // Gunakan Netlify Function untuk deploy
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
    setChatMessages([{ sender: 'bot', text: "Halo! Ada yang bisa saya bantu seputar daur ulang?" }]);
  };

  return (
    <div className="scan-container">
      <div className="scan-header">
        <h2>Scan & Dapatkan Inspirasi ✨</h2>
        <p>Arahkan kamera ke barang bekas di sekitarmu dan jepret foto untuk melihat ide-ide guna ulang!</p>
      </div>

      {!model && <div className="loading-model">{modelStatus}</div>}
      
      {model && (
        <div className="button-controls">
          {!isCameraActive && !hasSnapshot && (<button className="scan-btn" onClick={startCameraFeed}>Mulai Kamera</button>)}
          {isCameraActive && (<button className="scan-btn capture" onClick={takeSnapshot}>Jepret Foto</button>)}
          {(isCameraActive || hasSnapshot) && (<button className="scan-btn stop" onClick={handleReset}>{hasSnapshot ? 'Ulangi Scan' : 'Hentikan Kamera'}</button>)}
        </div>
      )}

      <div className="camera-view" style={{ display: (isCameraActive || hasSnapshot) ? 'block' : 'none' }}>
        {isCameraActive && <video ref={videoRef} className="camera-feed" muted playsInline />}
        <canvas ref={canvasRef} className="bounding-box-canvas" style={{ display: hasSnapshot ? 'block' : 'none' }} />
      </div>

      {hasSnapshot && (
        <div className="results-container">
          {foundProjects.length > 0 ? (
            <>
              <h3>Inspirasi Ditemukan!</h3>
              <div className="proyek-grid">
                {foundProjects.map((proyek) => {
                  const embedUrl = getYouTubeEmbedUrl(proyek.videoUrl);
                  return (
                    <div key={proyek.id} className="proyek-card-video-container">
                      {embedUrl ? (
                        <iframe key={proyek.id} title={proyek.judul} src={embedUrl} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="proyek-video-embed"></iframe>
                      ) : (
                        <img src={proyek.gambar} alt={proyek.judul} className="proyek-card-image-fallback" />
                      )}
                      <div className="proyek-info"><h4>{proyek.judul}</h4></div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="no-inspiration-found">
              <p>{detectionMessage}</p>
              <button className="btn-chat" onClick={openChat}>💬 Tanya Ahli Daur Ulang</button>
            </div>
          )}
        </div>
      )}

      {/* --- CHATBOT MODAL DENGAN PERBAIKAN --- */}
      {isChatOpen && (
        <div className="chat-modal-overlay" onClick={() => setIsChatOpen(false)}>
          <div className="chat-window" onClick={(e) => e.stopPropagation()}>
            <div className="chat-header"><h4>Ahli Daur Ulang</h4><button className="chat-close-btn" onClick={() => setIsChatOpen(false)}>×</button></div>
            <div className="chat-body">
              {chatMessages.map((msg, index) => (<div key={index} className={`chat-message ${msg.sender}`}>{msg.text}</div>))}
              {isBotTyping && (<div className="chat-message bot typing"><span></span><span></span><span></span></div>)}
            </div>
            <form className="chat-input-form" onSubmit={handleSendMessage}>
              <input 
                type="text" 
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder={isBotTyping ? "Sedang mengetik..." : "Ketik pertanyaanmu..."} 
                disabled={isBotTyping} 
              />
              <button type="submit" disabled={isBotTyping}>Kirim</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScanInspirasi;

