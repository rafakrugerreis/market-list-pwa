import { useEffect, useRef, useState } from "react";
import { scanProductLabel } from "../services/ocrService.js";

function CameraScanner({ onScanned, onClose }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setError(null);
    } catch (err) {
      setError("Câmera não disponível ou acesso negado.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
  };

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);

    setScanning(true);
    setResult(null);
    setError(null);
    try {
      const scanned = await scanProductLabel(canvas);
      stopCamera();
      setResult(scanned);
    } catch (err) {
      setError("Falha no OCR. Tente novamente com melhor iluminação.");
    } finally {
      setScanning(false);
    }
  };

  const handleRetry = () => {
    setResult(null);
    setError(null);
    startCamera();
  };

  const handleConfirm = () => {
    if (result) onScanned(result);
  };

  const formatPrice = (p) =>
    p ? `R$ ${Number(p).toFixed(2).replace(".", ",")}` : "—";

  return (
    <div className="scanner-overlay">
      {/* Header */}
      <div className="scanner-header">
        <button className="btn-voltar" onClick={onClose}>
          ← Voltar
        </button>
        <span className="scanner-title">Escanear Produto</span>
        <div style={{ width: 72 }} />
      </div>

      {/* Video + Viewfinder */}
      <div className="scanner-video-wrap">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="scanner-video"
        />
        <canvas ref={canvasRef} style={{ display: "none" }} />

        <div className="scanner-frame">
          <div className="scanner-box">
            <span className="scanner-corner tl" />
            <span className="scanner-corner tr" />
            <span className="scanner-corner bl" />
            <span className="scanner-corner br" />
            {!scanning && !result && <div className="scanner-line" />}
          </div>
        </div>
      </div>

      {error && (
        <p className="error-text" style={{ margin: "8px 20px 0" }}>
          {error}
        </p>
      )}

      {scanning && (
        <p className="scanning-text" style={{ padding: "10px 0 0" }}>
          Processando OCR...
        </p>
      )}

      {/* Card de resultado após escaneamento */}
      {result && (
        <div className="scanner-result">
          <div className="scanner-result-row">
            <span className="scanner-result-label">Nome</span>
            <span className="scanner-result-value">{result.name || "—"}</span>
          </div>
          <div className="scanner-result-row">
            <span className="scanner-result-label">Preço</span>
            <span className="scanner-result-value">
              {formatPrice(result.price)}
            </span>
          </div>
          <div className="scanner-result-actions">
            <button className="btn-retry" onClick={handleRetry}>
              Tentar novamente
            </button>
            <button className="btn-usar" onClick={handleConfirm}>
              Usar este item
            </button>
          </div>
        </div>
      )}

      {!result && !scanning && (
        <>
          <p className="scanner-hint">
            Aponte a câmera para a etiqueta do produto
          </p>
          <div className="scanner-bottom">
            <div className="scanner-spacer" />
            <button
              className="btn-scanner-capture"
              onClick={capturePhoto}
              disabled={!!error}
              aria-label="Capturar"
            >
              ⬛
            </button>
            <div className="scanner-spacer" />
          </div>
        </>
      )}
    </div>
  );
}

export default CameraScanner;
