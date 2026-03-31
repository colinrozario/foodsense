'use client';

import { useState, useCallback } from 'react';
import { Shuffle, Star, ExternalLink, ScanLine, Loader2 } from 'lucide-react';

interface SwapProduct {
  id: string;
  name: string;
  brand: string;
  image: string | null;
  nutriScore: string | null;
  nutrition: { calories: number; sugar: number; fat: number; salt: number };
  whyBetter: string[];
  fitsProfile: boolean;
  barcode: string;
}

interface SmartSwapPanelProps {
  productCategory: string;
  nutrition: { sugar: number; fat: number; salt: number; calories: number };
  userPreferences: { allergens?: string[]; diet?: string[] };
  detectedAllergens: string[];
  originalBarcode?: string;
  verdict: 'Safe' | 'Caution' | 'Avoid';
  onScanSwap?: (barcode: string) => void;
}

const nutriScoreColors: Record<string, string> = {
  A: 'bg-green-600 text-white',
  B: 'bg-lime-500 text-white',
  C: 'bg-yellow-400 text-gray-900',
  D: 'bg-orange-500 text-white',
  E: 'bg-red-600 text-white',
};

export default function SmartSwapPanel({
  productCategory,
  nutrition,
  userPreferences,
  detectedAllergens,
  originalBarcode,
  verdict,
  onScanSwap,
}: SmartSwapPanelProps) {
  const [swaps, setSwaps] = useState<SwapProduct[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tried, setTried] = useState(false);

  // Only show for Caution or Avoid
  if (verdict === 'Safe') return null;

  const findSwaps = useCallback(async () => {
    setLoading(true);
    setError(null);
    setTried(true);

    try {
      const res = await fetch('/api/swap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productCategory,
          nutrition,
          userPreferences,
          detectedAllergens,
          originalBarcode,
        }),
      });

      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message || 'Failed to find alternatives.');
      setSwaps(json.data.swaps);
    } catch (err: any) {
      setError(err.message || 'Could not find alternatives right now.');
    } finally {
      setLoading(false);
    }
  }, [productCategory, nutrition, userPreferences, detectedAllergens, originalBarcode]);

  return (
    <div className="p-5">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Smart Swap</h3>
          <p className="text-xs text-gray-500 mt-0.5">Better alternatives in the same category</p>
        </div>
        <div className="w-8 h-8 bg-gray-100 rounded-xl flex items-center justify-center">
          <Shuffle className="w-4 h-4 text-gray-600" />
        </div>
      </div>

      {!tried ? (
        <button
          onClick={findSwaps}
          className="w-full flex items-center justify-center gap-2 py-4 border-2 border-dashed border-gray-200 rounded-2xl hover:border-black hover:bg-gray-50 transition-all group"
        >
          <Shuffle className="w-4 h-4 text-gray-400 group-hover:text-black transition-colors" />
          <span className="font-semibold text-gray-600 group-hover:text-black transition-colors">Find Better Alternatives</span>
        </button>
      ) : loading ? (
        <div className="flex items-center justify-center gap-2 py-8 text-gray-500">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm">Searching for alternatives...</span>
        </div>
      ) : error ? (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-center">
          <p className="text-sm text-red-600">{error}</p>
          <button onClick={findSwaps} className="mt-2 text-xs text-red-500 underline">Try again</button>
        </div>
      ) : swaps && swaps.length === 0 ? (
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl text-center">
          <p className="text-sm text-gray-500 font-medium">No verified swaps found</p>
          <p className="text-xs text-gray-400 mt-1">
            We couldn't find a verified swap in this category. Check similar products in-store.
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Swaps are sourced from OpenFoodFacts and may not be available in every market.
          </p>
        </div>
      ) : swaps ? (
        <div className="space-y-3">
          {swaps.map((swap, i) => (
            <div key={swap.id} className="border border-gray-100 rounded-2xl overflow-hidden hover:border-gray-200 transition-colors">
              <div className="flex items-start gap-3 p-3">
                {/* Rank + image */}
                <div className="flex-shrink-0 flex flex-col items-center gap-1">
                  <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center text-sm font-bold text-gray-400">
                    #{i + 1}
                  </div>
                  {swap.image ? (
                    <img src={swap.image} alt="" className="w-10 h-10 object-contain rounded-lg bg-gray-50" />
                  ) : (
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-lg">🛒</div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm leading-tight truncate">{swap.name}</p>
                      {swap.brand && <p className="text-xs text-gray-400 truncate">{swap.brand}</p>}
                    </div>
                    {swap.nutriScore && (
                      <span className={`flex-shrink-0 text-xs font-black px-2 py-1 rounded-lg ${nutriScoreColors[swap.nutriScore] || 'bg-gray-200 text-gray-700'}`}>
                        {swap.nutriScore}
                      </span>
                    )}
                  </div>

                  {/* Why better */}
                  <div className="flex flex-wrap gap-1 mt-2">
                    {swap.whyBetter.map((reason, j) => (
                      <span key={j} className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-medium">
                        ✓ {reason}
                      </span>
                    ))}
                    {swap.fitsProfile && (
                      <span className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full font-medium">
                        ✓ Fits your profile
                      </span>
                    )}
                  </div>

                  {/* Mini nutrition */}
                  <div className="flex gap-3 mt-2 text-xs text-gray-500">
                    <span>{swap.nutrition.calories} kcal</span>
                    <span>Sugar: {swap.nutrition.sugar}g</span>
                    <span>Salt: {swap.nutrition.salt}g</span>
                  </div>
                </div>
              </div>

              {/* Action */}
              {swap.barcode && onScanSwap && (
                <button
                  onClick={() => onScanSwap(swap.barcode)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 border-t border-gray-100 hover:bg-gray-50 transition-colors text-sm font-medium text-gray-600"
                >
                  <ScanLine className="w-3.5 h-3.5" />
                  Scan to confirm
                </button>
              )}
            </div>
          ))}

          <p className="text-xs text-gray-400 leading-relaxed">
            Swaps sourced from OpenFoodFacts. Availability may vary by market. Verify locally before purchase.
          </p>
        </div>
      ) : null}
    </div>
  );
}
