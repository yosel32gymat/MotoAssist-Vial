/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState, useEffect } from "react";
import { Camera, RefreshCw, X, Check, Aperture } from "lucide-react";

interface CameraCaptureProps {
  onCapture: (base64Image: string) => void;
  onClose: () => void;
}

export default function CameraCapture({ onCapture, onClose }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cameraReady, setCameraReady] = useState(false);

  // Iniciar la cámara
  useEffect(() => {
    async function startCamera() {
      try {
        setError(null);
        // Preferir cámara trasera si está disponible ("environment")
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment", width: { ideal: 1080 }, height: { ideal: 1440 } }
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.play();
          setCameraReady(true);
        }
      } catch (err: any) {
        console.error("Error al acceder a la cámara:", err);
        setError("No se pudo acceder a la cámara. Por favor, asegúrate de dar los permisos necesarios o sube una imagen directamente.");
      }
    }

    startCamera();

    // Limpieza al desmontar para apagar la cámara
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Función para capturar foto
  const capturePhoto = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement("canvas");
      // Mantener proporciones idénticas a la señal de video
      canvas.width = video.videoWidth || 720;
      canvas.height = video.videoHeight || 960;

      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Comprimir levemente a JPEG calidad 0.7 para que quepa bien en Firestore (menos de 200KB)
        const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
        setCapturedImage(dataUrl);
      }
    }
  };

  const handleAccept = () => {
    if (capturedImage) {
      onCapture(capturedImage);
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-zinc-950 p-4 md:p-8">
      {/* Botón de cierre en la parte superior derecha */}
      <button 
        id="camera-close"
        onClick={onClose}
        className="absolute top-4 right-4 z-10 rounded-full bg-zinc-800/80 p-2 text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors"
      >
        <X className="h-6 w-6" />
      </button>

      <div className="relative flex flex-col w-full max-w-lg overflow-hidden rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl">
        <div className="p-4 border-b border-zinc-800 text-center">
          <h2 className="text-lg font-semibold text-zinc-100 flex items-center justify-center gap-2">
            <Camera className="h-5 w-5 text-emerald-500" />
            {capturedImage ? "Confirmar Foto" : "Tomar Foto de la Factura"}
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Encuadra el ticket térmico y asegúrate de que el texto sea legible
          </p>
        </div>

        {/* Área de Visualización */}
        <div className="relative aspect-[3/4] bg-black flex items-center justify-center overflow-hidden">
          {error ? (
            <div className="p-6 text-center text-zinc-400 max-w-xs">
              <p className="text-sm font-medium text-red-400 mb-2">{error}</p>
              <button 
                id="camera-error-close"
                onClick={onClose}
                className="mt-4 px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-semibold hover:bg-zinc-700 transition"
              >
                Volver a Subida por Archivo
              </button>
            </div>
          ) : capturedImage ? (
            <img 
              src={capturedImage} 
              alt="Factura Capturada" 
              className="w-full h-full object-contain"
            />
          ) : (
            <>
              <video 
                ref={videoRef} 
                playsInline 
                muted
                className="w-full h-full object-cover scale-x-[-1]" // Espejado para vista amigable estilo selfie si es frontal
              />
              {/* Rejilla de recorte para guiar al usuario */}
              <div className="absolute inset-8 pointer-events-none border-2 border-dashed border-zinc-400/30 rounded-lg flex items-center justify-center">
                <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-zinc-400/25"></div>
                <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-zinc-400/25"></div>
              </div>
            </>
          )}
        </div>

        {/* Controles de Acción */}
        <div className="p-6 bg-zinc-900 border-t border-zinc-800 flex justify-center gap-4">
          {capturedImage ? (
            <>
              <button
                id="btn-retake"
                onClick={handleRetake}
                className="flex items-center gap-2 px-5 py-3 rounded-xl border border-zinc-700 bg-transparent text-zinc-300 hover:bg-zinc-800 hover:text-white text-sm font-medium transition cursor-pointer"
              >
                <RefreshCw className="h-4 w-4" />
                Repetir Foto
              </button>
              <button
                id="btn-use-photo"
                onClick={handleAccept}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 text-sm font-medium transition cursor-pointer shadow-lg shadow-emerald-950/40"
              >
                <Check className="h-4 w-4" />
                Usar Foto
              </button>
            </>
          ) : (
            <button
              id="btn-shutter"
              disabled={!cameraReady}
              onClick={capturePhoto}
              className={`flex items-center justify-center gap-3 w-16 h-16 rounded-full bg-white text-black hover:bg-zinc-200 transition cursor-pointer shadow-xl border-4 border-zinc-800 ${!cameraReady ? 'opacity-50 cursor-not-allowed' : ''}`}
              title="Capturar Foto"
            >
              <Aperture className="h-8 w-8 text-zinc-900" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
