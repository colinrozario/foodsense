import { motion } from 'framer-motion';

const Marquee = () => {
    const items = [
        "100% NATURAL", "NO ADDITIVES", "AI-POWERED ANALYSIS", "HEALTHY CHOICES",
        "SCAN YOUR FOOD", "KNOW COMPOSITION"
    ];

    return (
        <div className="w-full bg-accent text-white py-4 overflow-hidden border-y border-black/5 rotate-[-2deg] my-8 shadow-xl relative z-20">
            <div className="flex whitespace-nowrap animate-marquee">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex gap-8 px-4">
                        {items.map((item, idx) => (
                            <span key={idx} className="text-xl md:text-3xl font-black uppercase tracking-widest flex items-center gap-8">
                                {item} <span className="w-3 h-3 bg-bg-primary rounded-full inline-block" />
                            </span>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Marquee;
