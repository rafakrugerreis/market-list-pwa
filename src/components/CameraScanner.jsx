import { useEffect, useRef, useState } from "react";
import { scanProductLabel } from "../services/ocrService.js";

function CameraScanner({ onScanned, onClose }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState(null);
  const [extracted, setExtracted] = useState({ name: "", price: "" });

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
    } catch (err) {
      setError("Camera access denied or not available on this device.");
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
    setExtracted({ name: "", price: "" });
    try {
      const result = await scanProductLabel(canvas);
      setExtracted({
        name: result.name || "",
        price: result.price ? String(result.price) : "",
      });
      stopCamera();
      onScanned(result);
    } catch (err) {
      setError("Falha no OCR. Tente novamente com melhor iluminação.");
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="scanner-overlay">
      {/* Header */}
      <div className="scanner-header">
        <span className="scanner-title">Escanear Produto</span>
        <button className="scanner-flash-btn" aria-label="Lanterna">
          🔦
        </button>
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
            {!scanning && <div className="scanner-line" />}

            {/* Extracted fields overlay */}
            <div className="scanner-fields">
              <div>
                <div className="scanner-field-label">🏷 Nome do Produto</div>
                <div className="scanner-field-box">{extracted.name}</div>
              </div>
              <div>
                <div className="scanner-field-label">🏷 Preço</div>
                <div className="scanner-field-box">{extracted.price}</div>
              </div>
            </div>
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

      <p className="scanner-hint">Aponte a câmera para a etiqueta do produto</p>

      <div className="scanner-bottom">
        <button className="btn-scanner-cancel" onClick={onClose}>
          Cancelar
        </button>
        <button
          className="btn-scanner-capture"
          onClick={capturePhoto}
          disabled={scanning || !!error}
          aria-label="Capture"
        >
          ⬛
        </button>
        <div className="scanner-spacer" />
      </div>
    </div>
  );
}

export default CameraScanner;
