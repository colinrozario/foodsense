import React, { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import { useZxing } from 'react-zxing';
import { Scan, Camera, Zap } from 'lucide-react';
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
            fetch(imageSrc)
                .then(res => res.blob())
                .then(blob => {
                    const file = new File([blob], "label_scan.jpg", { type: "image/jpeg" });
                    onImageCaptured(file);
                });
        }
    }, [webcamRef, onImageCaptured]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative h-full w-full bg-bg-primary overflow-hidden flex flex-col"
        >

            {/* Camera Viewfinder Area */}
            <div className="relative flex-1 m-4 rounded-[2rem] overflow-hidden border border-border shadow-2xl bg-black">
                {mode === 'barcode' ? (
                    <div className="relative h-full w-full">
                        <video ref={barcodeRef} className="h-full w-full object-cover" />
                        {/* High-Tech Overlay */}
                        <div className="absolute inset-0 flex items-center justify-center p-12 pointer-events-none">
                            <div className="w-64 h-64 relative">
                                <div className="absolute inset-0 border-2 border-accent/30 rounded-3xl" />
                                {/* Corners */}
                                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-accent -mt-1 -ml-1 rounded-tl-xl" />
                                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-accent -mt-1 -mr-1 rounded-tr-xl" />
                                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-accent -mb-1 -ml-1 rounded-bl-xl" />
                                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-accent -mb-1 -mr-1 rounded-br-xl" />

                                {/* Scanning Scanline */}
                                <div className="absolute inset-x-0 h-0.5 bg-accent shadow-[0_0_20px_rgba(var(--color-accent),0.8)] animate-scan-line top-0" />

                                {/* Inner Glow */}
                                <div className="absolute inset-0 bg-accent/5 animate-pulse-slow rounded-3xl" />
                            </div>
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
                        {/* Capture Frame Overlay */}
                        <div className="absolute inset-0 border-[20px] border-black/30 pointer-events-none" />
                    </div>
                )}

                {/* Loading State Overlay */}
                <AnimatePresence>
                    {loading && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-bg-glass backdrop-blur-md flex flex-col items-center justify-center z-20"
                        >
                            <div className="relative">
                                <div className="w-20 h-20 border-4 border-border rounded-full" />
                                <div className="absolute inset-0 border-t-4 border-accent rounded-full animate-spin" />
                            </div>
                            <p className="mt-6 text-accent font-bold tracking-[0.2em] uppercase text-sm animate-pulse">
                                Analyzing Data
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Controls Area */}
            <div className="h-auto pb-8 w-full bg-bg-primary flex flex-col items-center justify-end px-6 gap-6 z-10">

                <p className="text-text-muted text-xs font-bold tracking-widest uppercase mb-2">
                    {mode === 'barcode' ? "Align barcode within frame" : "Capture nutrition label"}
                </p>

                {/* Mode Switcher Pill */}
                <div className="bg-bg-secondary p-1.5 rounded-full flex gap-1 shadow-lg border border-border">
                    <button
                        onClick={() => setMode('barcode')}
                        className={clsx(
                            "px-6 py-3 rounded-full text-sm font-bold flex items-center gap-2 transition-all duration-300",
                            mode === 'barcode'
                                ? "bg-accent text-white shadow-lg shadow-accent/20"
                                : "text-text-muted hover:text-text-primary hover:bg-bg-primary/50"
                        )}
                    >
                        <Scan size={18} /> BARCODE
                    </button>
                    <button
                        onClick={() => setMode('label')}
                        className={clsx(
                            "px-6 py-3 rounded-full text-sm font-bold flex items-center gap-2 transition-all duration-300",
                            mode === 'label'
                                ? "bg-accent text-white shadow-lg shadow-accent/20"
                                : "text-text-muted hover:text-text-primary hover:bg-bg-primary/50"
                        )}
                    >
                        <Camera size={18} /> LABEL
                    </button>
                </div>

                {/* Capture Trigger (Label Mode Only) */}
                <div className="h-24 flex items-center justify-center">
                    <AnimatePresence mode="popLayout">
                        {mode === 'label' && !loading ? (
                            <motion.button
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0, opacity: 0 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={capture}
                                className="w-20 h-20 rounded-full border-4 border-bg-secondary bg-accent flex items-center justify-center shadow-2xl relative group"
                            >
                                <Zap className="text-white w-8 h-8 fill-current" />
                                <div className="absolute inset-0 rounded-full border border-white/20" />
                            </motion.button>
                        ) : null}
                    </AnimatePresence>
                </div>
            </div>
        </motion.div>
    );
};

export default Scanner;
