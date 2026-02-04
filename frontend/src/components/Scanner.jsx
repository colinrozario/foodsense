import React, { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import { useZxing } from 'react-zxing';
import { Scan, Camera, X } from 'lucide-react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

const Scanner = ({ onBarcodeScanned, onImageCaptured, loading }) => {
    const [mode, setMode] = useState('barcode'); // 'barcode' | 'label'
    const webcamRef = useRef(null);

    // Barcode Logic
    const { ref: barcodeRef } = useZxing({
        onDecodeResult: (result) => {
            if (!loading && mode === 'barcode') {
                onBarcodeScanned(result.getText());
            }
        },
        paused: mode !== 'barcode' || loading,
    });

    // Image Capture Logic
    const capture = useCallback(() => {
        const imageSrc = webcamRef.current.getScreenshot();
        if (imageSrc) {
            // Convert base64 to blob? Or just send base64 to API (FastAPI base64 support needed or convert)
            // For now, let's assume we pass the raw dataURI/blob to parent
            fetch(imageSrc)
                .then(res => res.blob())
                .then(blob => {
                    const file = new File([blob], "label_scan.jpg", { type: "image/jpeg" });
                    onImageCaptured(file);
                });
        }
    }, [webcamRef, onImageCaptured]);

    return (
        <div className="relative h-screen w-full bg-black overflow-hidden">

            {/* Camera View */}
            {mode === 'barcode' ? (
                <div className="relative h-full w-full">
                    <video ref={barcodeRef} className="h-full w-full object-cover" />
                    {/* Overlay */}
                    <div className="absolute inset-0 border-2 border-white/20 m-12 rounded-2xl pointer-events-none flex items-center justify-center">
                        <div className="w-64 h-1 bg-red-500/50 blur-sm animate-pulse" />
                    </div>
                </div>
            ) : (
                <div className="relative h-full w-full">
                    <Webcam
                        ref={webcamRef}
                        audio={false}
                        screenshotFormat="image/jpeg"
                        videoConstraints={{ facingMode: "environment" }}
                        className="h-full w-full object-cover"
                    />
                </div>
            )}

            {/* Loading Overlay */}
            {loading && (
                <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center z-20">
                    <div className="w-16 h-16 border-4 border-white/20 border-t-safe-green rounded-full animate-spin mb-4" />
                    <p className="text-white font-medium tracking-wide animate-pulse">Analyzing...</p>
                </div>
            )}

            {/* Controls */}
            <div className="absolute bottom-8 inset-x-0 z-10 flex flex-col items-center gap-6">

                {/* Mode Switcher */}
                <div className="bg-black/40 backdrop-blur-md rounded-full p-1 flex border border-white/10">
                    <button
                        onClick={() => setMode('barcode')}
                        className={clsx(
                            "px-6 py-3 rounded-full text-sm font-bold flex items-center gap-2 transition-all",
                            mode === 'barcode' ? "bg-white text-black" : "text-white/60 hover:text-white"
                        )}
                    >
                        <Scan size={18} /> Barcode
                    </button>
                    <button
                        onClick={() => setMode('label')}
                        className={clsx(
                            "px-6 py-3 rounded-full text-sm font-bold flex items-center gap-2 transition-all",
                            mode === 'label' ? "bg-white text-black" : "text-white/60 hover:text-white"
                        )}
                    >
                        <Camera size={18} /> Label
                    </button>
                </div>

                {/* Capture Trigger (Label Mode) */}
                <AnimatePresence>
                    {mode === 'label' && !loading && (
                        <motion.button
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            onClick={capture}
                            className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center bg-white/10 backdrop-blur-sm active:scale-95 transition-transform"
                        >
                            <div className="w-16 h-16 bg-white rounded-full" />
                        </motion.button>
                    )}
                </AnimatePresence>

                <p className="text-white/40 text-xs">
                    {mode === 'barcode' ? "Point camera at a barcode" : "Capture a clear photo of the nutrition label"}
                </p>
            </div>
        </div>
    );
};

export default Scanner;
