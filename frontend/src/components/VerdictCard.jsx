import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertTriangle, XCircle, ChevronDown, Activity, Info, X } from 'lucide-react';
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
                    color: 'text-emerald-500',
                    bg: 'bg-emerald-500/10',
                    border: 'border-emerald-500/20',
                    icon: CheckCircle,
                    label: 'Safe to Consume'
                };
            case 'CAUTION':
                return {
                    color: 'text-amber-500',
                    bg: 'bg-amber-500/10',
                    border: 'border-amber-500/20',
                    icon: AlertTriangle,
                    label: 'Consume with Caution'
                };
            case 'AVOID':
                return {
                    color: 'text-red-500',
                    bg: 'bg-red-500/10',
                    border: 'border-red-500/20',
                    icon: XCircle,
                    label: 'Avoid'
                };
            default:
                return {
                    color: 'text-gray-500',
                    bg: 'bg-gray-500/10',
                    border: 'border-gray-500/20',
                    icon: Info,
                    label: 'Unknown Status'
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
            className="fixed inset-x-0 bottom-0 z-50 pointer-events-none flex flex-col justify-end h-[90vh]"
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.2}
            onDragEnd={(e, info) => {
                if (info.offset.y > 100) {
                    // Could implement close behavior here if desired
                }
            }}
        >
            <div className="pointer-events-auto h-full w-full max-w-lg mx-auto bg-bg-secondary/90 backdrop-blur-xl border-t border-border rounded-t-[2.5rem] shadow-2xl flex flex-col overflow-hidden relative">

                {/* Drag Handle */}
                <div className="w-full flex justify-center pt-4 pb-2" onClick={() => setExpanded(!expanded)}>
                    <div className="w-12 h-1.5 rounded-full bg-bg-primary/50" />
                </div>

                {/* Header Content */}
                <div className="px-8 pt-4 pb-6 flex-shrink-0">
                    <div className="flex justify-between items-start mb-4">
                        <div className={clsx(
                            "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold border",
                            theme.bg, theme.color, theme.border
                        )}>
                            <Icon size={16} />
                            <span>{verdict}</span>
                        </div>
                        <button
                            onClick={onScanAgain}
                            className="p-2 rounded-full hover:bg-bg-primary transition-colors text-text-muted hover:text-text-primary"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <h2 className="text-3xl font-bold text-text-primary mb-2 line-clamp-2 leading-tight">
                        {product_name}
                    </h2>

                    <p className="text-text-secondary text-sm leading-relaxed line-clamp-3">
                        {explanation}
                    </p>
                </div>

                {/* Scrollable Detailed Content */}
                <div className="flex-1 overflow-y-auto px-8 pb-24 scrollbar-hide">

                    {/* Ingredients Analysis */}
                    {ingredients_analysis && ingredients_analysis.length > 0 && (
                        <div className="mt-6 space-y-4">
                            <h3 className="text-sm font-bold text-text-muted uppercase tracking-widest flex items-center gap-2">
                                <Activity size={16} /> Analysis Breakdown
                            </h3>

                            <div className="grid gap-3">
                                {ingredients_analysis.map((item, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="p-4 rounded-xl bg-bg-primary border border-border flex justify-between items-center group hover:border-accent/30 transition-colors"
                                    >
                                        <span className="font-medium text-text-primary">{item.name}</span>
                                        <span className={clsx(
                                            "text-xs font-bold px-2 py-1 rounded-md",
                                            item.status === 'RISKY' ? 'bg-red-500/10 text-red-500' :
                                                item.status === 'CAUTION' ? 'bg-amber-500/10 text-amber-500' :
                                                    'bg-emerald-500/10 text-emerald-500'
                                        )}>
                                            {item.status}
                                        </span>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Floating Action Button */}
                <div className="absolute bottom-6 left-0 right-0 px-8 flex justify-center pointer-events-none">
                    <button
                        onClick={onScanAgain}
                        className="pointer-events-auto w-full max-w-xs py-4 rounded-2xl bg-accent text-white font-bold text-lg shadow-lg hover:shadow-accent/25 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                        Scan Next Item
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default VerdictCard;
