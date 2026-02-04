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
            className="relative h-screen w-full bg-brand-black overflow-hidden flex flex-col"
        >

            {/* Camera Viewfinder Area - Takes up most space */}
            <div className="relative flex-1 m-4 rounded-[2rem] overflow-hidden border border-white/10 bg-brand-dark shadow-2xl">
                {mode === 'barcode' ? (
                    <div className="relative h-full w-full">
                        <video ref={barcodeRef} className="h-full w-full object-cover" />
                        {/* High-Tech Overlay */}
                        <div className="absolute inset-0 flex items-center justify-center p-12 pointer-events-none">
                            <div className="w-full aspect-square border-2 border-acid-green/50 rounded-3xl relative">
                                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-acid-green -mt-1 -ml-1 rounded-tl-xl" />
                                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-acid-green -mt-1 -mr-1 rounded-tr-xl" />
                                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-acid-green -mb-1 -ml-1 rounded-bl-xl" />
                                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-acid-green -mb-1 -mr-1 rounded-br-xl" />
                                <div className="absolute inset-0 bg-acid-green/5 animate-pulse" />
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
                    </div>
                )}

                {/* Loading Overlay */}
                {loading && (
                    <div className="absolute inset-0 bg-brand-black/90 backdrop-blur-md flex flex-col items-center justify-center z-20">
                        <div className="w-16 h-16 border-4 border-brand-gray border-t-acid-green rounded-full animate-spin mb-6" />
                        <p className="text-acid-green font-bold tracking-widest uppercase animate-pulse">Processing Data</p>
                    </div>
                )}
            </div>

            {/* Controls Area */}
            <div className="h-[25vh] w-full bg-brand-black flex flex-col items-center justify-start pt-4 gap-6 px-6">

                <p className="text-gray-500 text-xs font-medium tracking-widest uppercase">
                    {mode === 'barcode' ? "Target barcode within frame" : "Capture nutrition label"}
                </p>

                {/* Mode Switcher */}
                <div className="bg-brand-gray p-1 rounded-full flex gap-1 relative z-10">
                    <button
                        onClick={() => setMode('barcode')}
                        className={clsx(
                            "px-8 py-3 rounded-full text-sm font-bold flex items-center gap-2 transition-all duration-300",
                            mode === 'barcode' ? "bg-acid-green text-black shadow-[0_0_20px_rgba(204,255,0,0.3)]" : "text-gray-400 hover:text-white"
                        )}
                    >
                        <Scan size={18} /> SCANN
                    </button>
                    <button
                        onClick={() => setMode('label')}
                        className={clsx(
                            "px-8 py-3 rounded-full text-sm font-bold flex items-center gap-2 transition-all duration-300",
                            mode === 'label' ? "bg-acid-green text-black shadow-[0_0_20px_rgba(204,255,0,0.3)]" : "text-gray-400 hover:text-white"
                        )}
                    >
                        <Camera size={18} /> LABEL
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
                            className="w-20 h-20 rounded-full border border-white/20 bg-brand-gray flex items-center justify-center active:scale-95 transition-transform shadow-2xl relative"
                        >
                            <div className="w-16 h-16 bg-white rounded-full shadow-inner" />
                        </motion.button>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

export default Scanner;
