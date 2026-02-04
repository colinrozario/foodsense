import { motion } from 'framer-motion';
import { CheckCircle, AlertTriangle, XCircle, ChevronDown } from 'lucide-react';
import clsx from 'clsx';
import { useState } from 'react';

const VerdictCard = ({ result, onScanAgain }) => {
    const [expanded, setExpanded] = useState(false);

    if (!result) return null;

    const { verdict, explanation, product_name, risk_level, ingredients_analysis } = result;

    const getTheme = (v) => {
        switch (v?.toUpperCase()) {
            case 'SAFE': return { color: 'text-safe-green', bg: 'bg-safe-green', icon: CheckCircle, border: 'border-safe-green' };
            case 'CAUTION': return { color: 'text-caution-yellow', bg: 'bg-caution-yellow', icon: AlertTriangle, border: 'border-caution-yellow' };
            case 'AVOID': return { color: 'text-danger-red', bg: 'bg-danger-red', icon: XCircle, border: 'border-danger-red' };
            default: return { color: 'text-gray-400', bg: 'bg-gray-400', icon: AlertTriangle, border: 'border-gray-400' };
        }
    };

    const theme = getTheme(verdict);
    const Icon = theme.icon;

    return (
        <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            className="fixed inset-x-0 bottom-0 z-50 p-4 pb-8"
        >
            <div className={clsx(
                "glass-panel rounded-3xl p-6 max-w-md mx-auto relative overflow-hidden",
                "border-t-4", theme.border
            )}>
                {/* Glow Effect */}
                <div className={clsx("absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 rounded-full blur-3xl opacity-20 -z-10", theme.bg)} />

                <div className="flex items-start justify-between mb-4">
                    <div>
                        <h3 className="text-gray-400 text-sm uppercase tracking-wider font-semibold">Analyzed</h3>
                        <h2 className="text-white text-xl font-bold truncate max-w-[200px]">{product_name}</h2>
                    </div>
                    <div className={clsx("px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2", theme.color, "bg-white/5")}>
                        <Icon size={16} />
                        {verdict}
                    </div>
                </div>

                <p className="text-gray-200 text-lg leading-relaxed mb-6">
                    {explanation}
                </p>

                {/* Expandable Details */}
                {ingredients_analysis && ingredients_analysis.length > 0 && (
                    <div className="mb-6">
                        <button
                            onClick={() => setExpanded(!expanded)}
                            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors w-full"
                        >
                            <span>{expanded ? "Hide Details" : "View Ingredients Analysis"}</span>
                            <ChevronDown className={clsx("transition-transform", expanded && "rotate-180")} size={14} />
                        </button>

                        {expanded && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="mt-3 space-y-2"
                            >
                                {ingredients_analysis.map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-start text-sm border-b border-white/5 pb-2">
                                        <span className="text-white font-medium">{item.name}</span>
                                        <span className={clsx(
                                            item.status === 'RISKY' ? 'text-danger-red' : 'text-safe-green',
                                            "text-xs uppercase"
                                        )}>{item.status}</span>
                                    </div>
                                ))}
                            </motion.div>
                        )}
                    </div>
                )}

                <button
                    onClick={onScanAgain}
                    className="w-full py-4 rounded-xl bg-white text-black font-bold text-lg hover:scale-[1.02] active:scale-[0.98] transition-transform"
                >
                    Scan Another
                </button>
            </div>
        </motion.div>
    );
};

export default VerdictCard;
