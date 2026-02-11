import { motion } from 'framer-motion';
import { Scan, Upload, Check, Zap, Globe, ShieldCheck, FileText, BrainCircuit } from 'lucide-react';
import clsx from 'clsx';
import { useRef } from 'react';

const Hero = ({ onStartScan, onImageUpload }) => {
    const fileInputRef = useRef(null);

    const features = [
        { icon: Zap, text: "Detects hidden sugars, additives, E-numbers, toxins, allergens, etc." },
        { icon: Globe, text: "Translates labels from any language" },
        { icon: ShieldCheck, text: "Generates a science-based health score / Eat & Avoid verdict" },
        { icon: FileText, text: "Provides AI nutrition advice, recipes & explanations" },
        { icon: BrainCircuit, text: "Uses a proprietary AI model (not just static databases)" },
    ];

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            onImageUpload(e.target.files[0]);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">

            {/* Background Ambience */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-1/4 -right-1/4 w-[600px] h-[600px] bg-accent/20 rounded-full blur-[128px] animate-pulse-slow" />
                <div className="absolute -bottom-1/4 -left-1/4 w-[500px] h-[500px] bg-sky-500/10 rounded-full blur-[128px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="w-full max-w-2xl text-center z-10"
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", duration: 1 }}
                    className="inline-block mb-4 px-4 py-1.5 rounded-full border border-accent/30 bg-accent/10 text-accent font-bold text-sm tracking-wide uppercase"
                >
                    AI-Powered Food Intelligence
                </motion.div>

                <h1 className="text-5xl md:text-7xl font-black tracking-tight text-text-primary mb-6 leading-tight">
                    Know What's <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-emerald-400">
                        Really Inside
                    </span>
                </h1>

                <p className="text-text-secondary text-lg md:text-xl mb-12 max-w-xl mx-auto leading-relaxed">
                    Instantly analyze barcodes and nutrition labels to uncover hidden ingredients and get personalized health verdicts.
                </p>

                {/* Feature Grid */}
                <div className="grid gap-4 mb-12 text-left bg-bg-secondary/50 backdrop-blur-sm p-6 rounded-3xl border border-border md:grid-cols-2">
                    <div className="flex items-start gap-3 md:col-span-2">
                        <div className="p-2 rounded-lg bg-accent/10 text-accent flex-shrink-0">
                            <Scan size={20} />
                        </div>
                        <p className="text-text-primary font-medium text-sm pt-1">
                            Reads barcodes and any food label (photo or scan)
                        </p>
                    </div>
                    {features.map((f, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 + (i * 0.1) }}
                            className="flex items-start gap-3"
                        >
                            <div className="p-2 rounded-lg bg-bg-primary text-accent border border-border flex-shrink-0">
                                <f.icon size={16} />
                            </div>
                            <p className="text-text-secondary text-sm pt-1 leading-snug">
                                {f.text}
                            </p>
                        </motion.div>
                    ))}
                </div>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full px-4">
                    <button
                        onClick={onStartScan}
                        className="w-full sm:w-auto px-8 py-4 bg-accent text-white rounded-2xl font-bold text-lg shadow-xl shadow-accent/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3"
                    >
                        <Scan size={24} />
                        Start Scanning
                    </button>

                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full sm:w-auto px-8 py-4 bg-bg-secondary border border-border text-text-primary rounded-2xl font-bold text-lg hover:bg-bg-primary active:scale-95 transition-all flex items-center justify-center gap-3"
                    >
                        <Upload size={24} />
                        Upload Photo
                    </button>

                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*"
                        className="hidden"
                    />
                </div>
            </motion.div>
        </div>
    );
};

export default Hero;
