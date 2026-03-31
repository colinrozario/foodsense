'use client';

import { X, Flame } from 'lucide-react';

interface CalorieLogProps {
    isOpen: boolean;
    onClose: () => void;
    logs: any[];
}

export default function CalorieLog({ isOpen, onClose, logs }: CalorieLogProps) {
    if (!isOpen) return null;

    const totalCalories = logs.reduce((sum, item) => sum + (item.calories || 0), 0);

    return (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white w-full max-w-md rounded-2xl p-6 space-y-6 animate-in slide-in-from-bottom-10 fade-in h-[80vh] flex flex-col">
                <div className="flex justify-between items-center shrink-0">
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <Flame className="w-5 h-5 text-orange-500 fill-orange-500" />
                        Calorie Tracker
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full">
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                {/* Summary */}
                <div className="bg-orange-50 p-6 rounded-2xl text-center shrink-0">
                    <div className="text-sm text-orange-600 font-medium uppercase tracking-wide">Today's Total</div>
                    <div className="text-5xl font-black text-orange-500 mt-2">{totalCalories}</div>
                    <div className="text-orange-400 text-sm mt-1">kcal</div>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                    {logs.length === 0 ? (
                        <div className="text-center text-slate-400 py-10">
                            <p>No food logged yet today.</p>
                            <p className="text-sm">Scan a product to add it!</p>
                        </div>
                    ) : (
                        logs.map((log, i) => (
                            <div key={i} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                                <div>
                                    <div className="font-semibold text-slate-700">{log.name}</div>
                                    <div className="text-xs text-slate-400">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                </div>
                                <div className="font-bold text-slate-600">{log.calories} kcal</div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
