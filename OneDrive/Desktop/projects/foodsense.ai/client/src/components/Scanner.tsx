'use client';

import { useEffect, useRef, useCallback } from 'react';

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  onError?: (error: string) => void;
}

export default function BarcodeScanner({ onScan, onError }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const readerRef = useRef<any>(null);
  const mountedRef = useRef(true);
  const scanningRef = useRef(false); // prevent duplicate scans

  const stopCamera = useCallback(() => {
    scanningRef.current = false;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (readerRef.current) {
      try { readerRef.current.reset(); } catch {}
      readerRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    scanningRef.current = false;
    let animFrame: number;

    const startScanner = async () => {
      // Dynamically import ZXing (browser-only)
      let BrowserMultiFormatReader: any;
      try {
        const mod = await import('@zxing/library');
        BrowserMultiFormatReader = mod.BrowserMultiFormatReader;
      } catch {
        if (mountedRef.current) onError?.('Could not load barcode scanner library.');
        return;
      }

      if (!mountedRef.current) return;

      // Request camera
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } }
        });
      } catch (err: any) {
        if (!mountedRef.current) return;
        onError?.(
          err.name === 'NotAllowedError'
            ? 'Camera permission denied. Please allow camera access in your browser settings.'
            : 'Could not access camera. Please check your device.'
        );
        return;
      }

      if (!mountedRef.current) {
        stream.getTracks().forEach(t => t.stop());
        return;
      }

      streamRef.current = stream;

      const reader = new BrowserMultiFormatReader();
      readerRef.current = reader;

      // Attach stream — autoPlay attribute handles play(), no manual play() needed
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      if (!mountedRef.current) return;

      // Start decode loop once video is ready
      const startDecoding = () => {
        const decode = async () => {
          if (!mountedRef.current || !videoRef.current || !readerRef.current || scanningRef.current) return;

          try {
            const result = await readerRef.current.decodeFromVideoElement(videoRef.current);
            if (result && mountedRef.current && !scanningRef.current) {
              scanningRef.current = true; // prevent duplicate callbacks
              stopCamera();
              onScan(result.getText());
              return; // stop loop
            }
          } catch {
            // NotFoundException is thrown constantly while no barcode in frame — ignore
          }

          if (mountedRef.current && !scanningRef.current) {
            animFrame = requestAnimationFrame(decode);
          }
        };

        animFrame = requestAnimationFrame(decode);
      };

      if (videoRef.current) {
        if (videoRef.current.readyState >= 2) {
          // Already has metadata — start immediately
          startDecoding();
        } else {
          videoRef.current.onloadedmetadata = () => {
            if (mountedRef.current) startDecoding();
          };
        }
      }
    };

    // Small delay to let React settle (avoids StrictMode race on first mount)
    const timer = setTimeout(startScanner, 150);

    return () => {
      mountedRef.current = false;
      clearTimeout(timer);
      cancelAnimationFrame(animFrame);
      stopCamera();
    };
  }, [onScan, onError, stopCamera]);

  return (
    <div className="relative w-full h-full bg-black overflow-hidden">
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        playsInline
        muted
        autoPlay
      />

      {/* Scan overlay */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="absolute inset-0 bg-black/40" />

        {/* Scan frame */}
        <div className="relative z-10 w-64 h-64">
          {/* Corner markers */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-emerald-400 rounded-tl-lg" />
          <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-emerald-400 rounded-tr-lg" />
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-emerald-400 rounded-bl-lg" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-emerald-400 rounded-br-lg" />

          {/* Animated scan line */}
          <div className="absolute left-2 right-2 h-0.5 bg-emerald-400 scan-line shadow-[0_0_8px_2px_rgba(52,211,153,0.6)]" />
        </div>
      </div>
    </div>
  );
}
