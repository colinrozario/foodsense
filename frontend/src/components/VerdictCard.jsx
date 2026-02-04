import { motion } from 'framer-motion';
import { CheckCircle, AlertTriangle, XCircle, ChevronDown, ScanLine } from 'lucide-react';
import clsx from 'clsx';
import { useState } from 'react';

const VerdictCard = ({ result, onScanAgain }) => {
    const [expanded, setExpanded] = useState(false);

    if (!result) return null;

    const { verdict, explanation, product_name, ingredients_analysis } = result;

    const getTheme = (v) => {
        switch (v?.toUpperCase()) {
            case 'SAFE':
                return {
                    color: 'text-brand-black',
                    bg: 'bg-safe-green',
                    iconColor: 'text-brand-black',
                    icon: CheckCircle
                };
            case 'CAUTION':
                return {
                    color: 'text-brand-black',
                    bg: 'bg-caution-yellow',
                    iconColor: 'text-brand-black',
                    icon: AlertTriangle
                };
            case 'AVOID':
                return {
                    color: 'text-white',
                    bg: 'bg-danger-red',
                    iconColor: 'text-white',
                    icon: XCircle
                };
            default:
                return {
                    color: 'text-gray-400',
                    bg: 'bg-brand-gray',
                    iconColor: 'text-gray-400',
                    icon: AlertTriangle
                };
        }
    };

    const theme = getTheme(verdict);
    const Icon = theme.icon;

    return (
        <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 z-50 p-4"
        >
            <div className="bg-[#111111] border border-white/5 rounded-[2rem] p-6 max-w-md mx-auto shadow-2xl relative overflow-hidden ring-1 ring-white/10">

                {/* Header Section */}
                <div className="flex items-start justify-between mb-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-acid-green animate-pulse" />
                            <h3 className="text-gray-500 text-xs font-bold uppercase tracking-widest">Analysis System</h3>
                        </div>
                        <h2 className="text-white text-2xl font-bold truncate max-w-[200px] leading-tight">{product_name}</h2>
                    </div>

                    {/* Verdict Pillow */}
                    <div className={clsx(
                        "px-4 py-2 rounded-xl flex items-center gap-2 font-bold shadow-lg",
                        theme.bg, theme.color
                    )}>
                        <Icon size={20} className={theme.iconColor} />
                        {verdict}
                    </div>
                </div>

                {/* Explanation */}
                <div className="bg-brand-black/50 p-5 rounded-2xl border border-white/5 mb-6">
                    <p className="text-gray-300 text-base leading-relaxed">
                        {explanation}
                    </p>
                </div>

                {/* Ingredients / Details */}
                {ingredients_analysis && ingredients_analysis.length > 0 && (
                    <div className="mb-6">
                        <button
                            onClick={() => setExpanded(!expanded)}
                            className="w-full flex items-center justify-between text-sm font-semibold text-gray-400 hover:text-white transition-colors bg-brand-gray/50 p-4 rounded-xl border border-white/5"
                        >
                            <span className="flex items-center gap-2">
                                <ScanLine size={16} />
                                {expanded ? "Hide Data" : "View Scan Data"}
                            </span>
                            <ChevronDown className={clsx("transition-transform duration-300", expanded && "rotate-180")} size={16} />
                        </button>

                        <motion.div
                            initial={false}
                            animate={{ height: expanded ? 'auto' : 0, opacity: expanded ? 1 : 0 }}
                            className="overflow-hidden"
                        >
                            <div className="pt-3 space-y-2">
                                {ingredients_analysis.map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-center text-sm bg-brand-black/30 p-3 rounded-lg border border-white/5">
                                        <span className="text-gray-300 font-medium">{item.name}</span>
                                        <span className={clsx(
                                            "text-xs font-bold px-2 py-1 rounded bg-white/5",
                                            item.status === 'RISKY' ? 'text-danger-red' : 'text-safe-green'
                                        )}>{item.status}</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                )}

                {/* Action Button */}
                <button
                    onClick={onScanAgain}
                    className="w-full py-4 rounded-xl bg-white text-black font-bold text-lg hover:bg-neutral-200 transition-colors shadow-xl"
                >
                    New Scan
                </button>
            </div>
        </motion.div>
    );
};

export default VerdictCard;
