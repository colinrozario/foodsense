'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import ProfileModal from '@/components/ProfileModal';
import VerdictCard from '@/components/VerdictCard';
import LabelUploader from '@/components/LabelUploader';
import HistoryPanel from '@/components/HistoryPanel';
import { XCircle, AlertTriangle } from 'lucide-react';

// Dynamically import scanner (uses browser APIs, no SSR)
const BarcodeScanner = dynamic(() => import('@/components/Scanner'), { ssr: false });

interface ScanResultData {
  source: 'barcode' | 'label';
  product: {
    name: string;
    brand: string;
    image: string | null;
    ingredients: string;
    parsedIngredients: { name: string; isENumber: boolean; eCode?: string }[];
    nutrition: { calories: number; sugar: number; fat: number; salt: number; saturatedFat?: number };
  };
  allergenFlags: {
    allergen: string;
    matchedIngredients: string[];
    severity: 'high' | 'medium';
    isUserAllergen: boolean;
  }[];
  additives: { code: string; name: string; type: string; risk: 'low' | 'medium' | 'high'; notes?: string }[];
  additives_detailed?: import('@/lib/allergens').AdditiveDetail[];
  nutrition_enriched?: import('@/lib/nutrition').EnrichedNutrition;
  analysis: {
    verdict: 'Safe' | 'Caution' | 'Avoid';
    verdict_reason: string;
    explanation: string;
    flags: { type: 'allergen' | 'nutrition' | 'additive'; ingredient: string; severity: 'high' | 'medium' | 'low' }[];
    action: string;
    confidence: number;
    disclaimer: string;
    preservatives?: string[];
    additive_summary?: string;
    nutrition_context?: string;
  };
  scannedAt: string;
}

interface HistoryItem {
  id: string;
  product: { name: string; brand: string; image: string | null };
  verdict: 'Safe' | 'Caution' | 'Avoid';
  scannedAt: string;
  source: 'barcode' | 'label';
  data: ScanResultData;
}

const MAX_HISTORY = 10;

function generateId() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export default function Home() {
  // UI state
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [showLabelUploader, setShowLabelUploader] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // Data state
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('Analyzing...');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ScanResultData | null>(null);
  const [preferences, setPreferences] = useState({ allergens: [] as string[], diet: [] as string[], goals: [] as string[] });
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [userId, setUserId] = useState<number | null>(null);

  // Load persisted data on mount — DB first, localStorage as fallback
  useEffect(() => {
    const savedHistory = localStorage.getItem('fs_history');
    if (savedHistory) { try { setHistory(JSON.parse(savedHistory)); } catch {} }

    const storedUserId = localStorage.getItem('fs_user_id');
    if (storedUserId) {
      const uid = parseInt(storedUserId);
      setUserId(uid);
      fetch(`/api/user/preferences?userId=${uid}`)
        .then(async r => {
          if (!r.ok) throw new Error('Failed to fetch');
          return r.json();
        })
        .then(json => {
          if (json.success && json.preferences) setPreferences(json.preferences);
        })
        .catch(() => {
          // Fallback to localStorage
          const saved = localStorage.getItem('fs_preferences');
          if (saved) { try { setPreferences(JSON.parse(saved)); } catch {} }
        });
    } else {
      const saved = localStorage.getItem('fs_preferences');
      if (saved) { try { setPreferences(JSON.parse(saved)); } catch {} }
    }
  }, []);

  // Persist preferences to DB + localStorage whenever they change
  const handleSetPreferences = useCallback((prefs: typeof preferences) => {
    setPreferences(prefs);
    localStorage.setItem('fs_preferences', JSON.stringify(prefs));
    fetch('/api/user/preferences', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, preferences: prefs }),
    })
      .then(async r => {
        if (!r.ok) throw new Error('Failed to save');
        return r.json();
      })
      .then(json => {
        if (json.success && json.userId && !userId) {
          setUserId(json.userId);
          localStorage.setItem('fs_user_id', String(json.userId));
        }
      })
      .catch(() => {}); // localStorage already saved above
  }, [userId]);

  const addToHistory = useCallback((data: ScanResultData) => {
    setHistory(prev => {
      const newItem: HistoryItem = {
        id: generateId(),
        product: { name: data.product.name, brand: data.product.brand, image: data.product.image },
        verdict: data.analysis.verdict,
        scannedAt: data.scannedAt,
        source: data.source,
        data,
      };
      const updated = [newItem, ...prev].slice(0, MAX_HISTORY);
      localStorage.setItem('fs_history', JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Barcode scan handler
  const handleBarcodeScan = useCallback(async (barcode: string) => {
    setShowBarcodeScanner(false);
    setLoading(true);
    setLoadingMsg('Looking up product...');
    setError(null);

    try {
      setLoadingMsg('Analyzing ingredients with AI...');
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ barcode, userPreferences: preferences }),
      });

      if (!res.ok) {
        const text = await res.text();
        let json;
        try { json = JSON.parse(text); } catch { throw new Error(`Server returned an error (Status ${res.status}). Check your .env setup.`); }
        throw new Error(json.error?.message || 'Failed to scan product.');
      }

      const json = await res.json();
      if (!json.success) {
        throw new Error(json.error?.message || 'Failed to scan product.');
      }

      setResult(json.data as ScanResultData);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [preferences]);

  // Label scan handler
  const handleLabelScan = useCallback(async (file: File) => {
    setLoading(true);
    setLoadingMsg('Reading label with AI Vision...');
    setError(null);

    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('userPreferences', JSON.stringify(preferences));

      const res = await fetch('/api/scan/label', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const text = await res.text();
        let json;
        try { json = JSON.parse(text); } catch { throw new Error(`Server returned an error (Status ${res.status}). Check your .env setup.`); }
        throw new Error(json.error?.message || 'Could not analyze the label.');
      }

      const json = await res.json();
      if (!json.success) {
        throw new Error(json.error?.message || 'Could not analyze the label.');
      }

      setShowLabelUploader(false);
      setResult(json.data as ScanResultData);
    } catch (err: any) {
      setError(err.message || 'Label analysis failed. Please try a clearer photo.');
    } finally {
      setLoading(false);
    }
  }, [preferences]);

  const handleAddToHistory = useCallback(() => {
    if (result) {
      addToHistory(result);
      setResult(null);
    }
  }, [result, addToHistory]);

  const lastScanName = history[0]?.product.name;

  return (
    <main className="min-h-screen bg-[#fafafa]">
      <Navbar
        onOpenProfile={() => setShowProfile(true)}
        onOpenHistory={() => setShowHistory(true)}
        historyCount={history.length}
      />

      <Hero
        onScanBarcode={() => { setError(null); setShowBarcodeScanner(true); }}
        onScanLabel={() => { setError(null); setShowLabelUploader(true); }}
        lastScanName={lastScanName}
      />

      {/* Barcode Scanner — fullscreen */}
      {showBarcodeScanner && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col">
          <div className="flex items-center justify-between p-5 text-white">
            <div>
              <h2 className="font-bold text-lg">Scan Barcode</h2>
              <p className="text-white/60 text-sm">Point at the barcode</p>
            </div>
            <button
              onClick={() => setShowBarcodeScanner(false)}
              className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>
          <div className="flex-1 overflow-hidden">
            <BarcodeScanner
              onScan={handleBarcodeScan}
              onError={msg => { setShowBarcodeScanner(false); setError(msg); }}
            />
          </div>
          <div className="p-5 text-center text-white/50 text-sm">
            Align barcode within the frame
          </div>
        </div>
      )}

      {/* Label Uploader */}
      {showLabelUploader && (
        <LabelUploader
          onAnalyze={handleLabelScan}
          onClose={() => setShowLabelUploader(false)}
          loading={loading}
        />
      )}

      {/* Loading Overlay */}
      {loading && !showLabelUploader && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/90 backdrop-blur-sm">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 border-4 border-gray-100 border-t-black rounded-full animate-spin-slow mx-auto" />
            <div className="space-y-1">
              <p className="font-semibold text-gray-900">{loadingMsg}</p>
              <p className="text-sm text-gray-400">This usually takes 2–5 seconds</p>
            </div>
          </div>
        </div>
      )}

      {/* Error Toast */}
      {error && (
        <div className="fixed bottom-8 left-4 right-4 z-50 flex items-center gap-3 bg-red-50 text-red-700 px-5 py-4 rounded-2xl border border-red-200 shadow-xl max-w-md mx-auto animate-fade-in-up">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-medium flex-1">{error}</span>
          <button onClick={() => setError(null)} className="p-1 hover:bg-red-100 rounded-full">
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Verdict Card */}
      {result && (
        <VerdictCard
          data={result}
          onClose={() => setResult(null)}
          onAddToLog={handleAddToHistory}
          userPreferences={preferences}
          onScanBarcode={(barcode) => {
            setResult(null);
            handleBarcodeScan(barcode);
          }}
        />
      )}

      {/* Profile Modal */}
      <ProfileModal
        isOpen={showProfile}
        onClose={() => setShowProfile(false)}
        preferences={preferences}
        setPreferences={handleSetPreferences}
      />

      {/* History Panel */}
      <HistoryPanel
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        history={history}
        onClear={() => {
          setHistory([]);
          localStorage.removeItem('fs_history');
        }}
        onSelect={item => setResult(item.data)}
      />
    </main>
  );
}
