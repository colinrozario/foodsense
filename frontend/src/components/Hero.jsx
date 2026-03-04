import { motion, useScroll, useTransform } from 'framer-motion';
import { Scan, Upload, ArrowRight, Star } from 'lucide-react';
import { useRef } from 'react';
import Marquee from './Marquee';

const Hero = ({ onStartScan, onImageUpload }) => {
    const fileInputRef = useRef(null);
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end start"]
    });

    const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
    const rotate = useTransform(scrollYProgress, [0, 1], [0, 10]);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            onImageUpload(e.target.files[0]);
        }
    };

    return (
        <div ref={containerRef} className="min-h-screen bg-bg-primary overflow-hidden relative font-sans">

            {/* Background Mesh Gradient */}
            <div className="absolute inset-0 bg-mesh opacity-60 pointer-events-none" />

            {/* Main Content */}
            <div className="relative z-10 pt-32 pb-20 px-6 flex flex-col items-center text-center max-w-7xl mx-auto">

                {/* Badge */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="inline-flex items-center gap-2 px-6 py-2 rounded-full border border-black/10 bg-white/50 backdrop-blur-sm shadow-sm mb-8"
                >
                    <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                            <Star key={i} size={14} className="fill-accent text-accent" />
                        ))}
                    </div>
                    <span className="text-sm font-bold tracking-wide text-text-secondary uppercase">Rated #1 Food Analysis AI</span>
                </motion.div>

                {/* Headline */}
                <motion.h1
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="text-6xl md:text-[8rem] font-black leading-[0.9] tracking-tighter text-text-primary mb-8"
                >
                    KNOW <br />
                    <span className="text-accent relative inline-block">
                        YOUR FOOD
                        <svg className="absolute w-full h-4 -bottom-2 left-0 text-accent/20" viewBox="0 0 100 10" preserveAspectRatio="none">
                            <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
                        </svg>
                    </span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.8 }}
                    className="text-xl md:text-2xl text-text-secondary max-w-2xl mx-auto mb-12 font-medium leading-relaxed"
                >
                    The most advanced AI nutrition scanner. Detect hidden toxins, translate labels, and eat smarter in seconds.
                </motion.p>

                {/* Floating Visual (Parallax) */}
                <motion.div
                    style={{ y, rotate }}
                    className="relative w-64 h-64 md:w-96 md:h-96 mb-16 pointer-events-none"
                >
                    {/* Mockup / Icon */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-accent to-yellow-400 rounded-[3rem] rotate-3 shadow-2xl flex items-center justify-center animate-float">
                        <Scan className="text-white w-32 h-32 md:w-48 md:h-48 drop-shadow-lg" strokeWidth={1.5} />
                    </div>
                    <div className="absolute -inset-4 bg-white/30 backdrop-blur-xl rounded-[3.5rem] -z-10 -rotate-3 border border-white/40" />
                </motion.div>

                {/* CTA Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="flex flex-col sm:flex-row gap-4 w-full max-w-md mx-auto"
                >
                    <button
                        onClick={onStartScan}
                        className="flex-1 py-5 rounded-full bg-accent text-white font-black text-xl tracking-tight shadow-[0_10px_30px_rgba(255,92,0,0.3)] hover:scale-105 hover:shadow-[0_15px_40px_rgba(255,92,0,0.4)] transition-all flex items-center justify-center gap-3 group"
                    >
                        SCAN NOW
                        <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                    </button>

                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex-1 py-5 rounded-full bg-white text-text-primary border border-black/5 font-bold text-xl tracking-tight shadow-xl hover:bg-gray-50 hover:scale-105 transition-all flex items-center justify-center gap-3"
                    >
                        UPLOAD
                        <Upload size={24} />
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*"
                        className="hidden"
                    />
                </motion.div>

            </div>

            {/* Marquee Section */}
            <div className="relative z-20">
                <Marquee />
            </div>

        </div>
    );
};

export default Hero;
