'use client';

import { Clock, CheckCircle, AlertTriangle, XCircle, Trash2, ScanLine, ChevronRight } from 'lucide-react';

interface HistoryItem {
  id: string;
  product: { name: string; brand: string; image: string | null };
  verdict: 'Safe' | 'Caution' | 'Avoid';
  scannedAt: string;
  source: 'barcode' | 'label';
  data: any;
}

interface HistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  onClear: () => void;
  onSelect: (item: HistoryItem) => void;
}

const verdictIcons = {
  Safe: <CheckCircle className="w-4 h-4 text-emerald-500" />,
  Caution: <AlertTriangle className="w-4 h-4 text-amber-500" />,
  Avoid: <XCircle className="w-4 h-4 text-red-500" />,
};

const verdictColors = {
  Safe: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Caution: 'bg-amber-50 text-amber-700 border-amber-200',
  Avoid: 'bg-red-50 text-red-700 border-red-200',
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hrs = Math.floor(mins / 60);
  const days = Math.floor(hrs / 24);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  if (hrs < 24) return `${hrs}h ago`;
  return `${days}d ago`;
}

export default function HistoryPanel({ isOpen, onClose, history, onClear, onSelect }: HistoryPanelProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden max-h-[80vh] flex flex-col animate-slide-up" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-gray-600" />
            <h2 className="text-xl font-bold text-gray-900">Scan History</h2>
            {history.length > 0 && (
              <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full">{history.length}</span>
            )}
          </div>
          {history.length > 0 && (
            <button
              onClick={onClear}
              className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-700 font-medium px-3 py-1.5 hover:bg-red-50 rounded-xl transition-colors"
            >
              <Trash2 className="w-4 h-4" /> Clear
            </button>
          )}
        </div>

        <div className="overflow-y-auto flex-1">
          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                <ScanLine className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">No scans yet</h3>
              <p className="text-gray-500 text-sm">Scan your first product to see history here.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {history.map(item => (
                <button
                  key={item.id}
                  onClick={() => { onSelect(item); onClose(); }}
                  className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors text-left"
                >
                  {item.product.image ? (
                    <img src={item.product.image} alt="" className="w-12 h-12 object-contain bg-gray-50 rounded-xl flex-shrink-0" />
                  ) : (
                    <div className="w-12 h-12 bg-gray-100 rounded-xl flex-shrink-0 flex items-center justify-center text-xl">
                      {item.source === 'label' ? '📷' : '🏷️'}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900 text-sm truncate">{item.product.name}</div>
                    {item.product.brand && (
                      <div className="text-xs text-gray-400 truncate">{item.product.brand}</div>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${verdictColors[item.verdict]}`}>
                        {verdictIcons[item.verdict]}
                        {item.verdict}
                      </span>
                      <span className="text-xs text-gray-400">{timeAgo(item.scannedAt)}</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-100">
          <button onClick={onClose} className="w-full py-3 bg-black text-white rounded-2xl font-semibold hover:bg-gray-800 transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
