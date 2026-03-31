'use client';

import { CheckCircle, AlertTriangle, XCircle, ChevronDown, ChevronUp, Info } from 'lucide-react';
import { useState } from 'react';
import ClaimCheckerPanel from './ClaimCheckerPanel';
import ExpiryPanel from './ExpiryPanel';
import SmartSwapPanel from './SmartSwapPanel';
import AdditivesPanel from './AdditivesPanel';
import NutritionPanel from './NutritionPanel';
import type { ClaimCheckResult } from '@/lib/claimChecker';
import type { ExpiryResult } from '@/lib/dateExtractor';
import type { AdditiveDetail } from '@/lib/allergens';
import type { EnrichedNutrition } from '@/lib/nutrition';

type Verdict = 'Safe' | 'Caution' | 'Avoid';

interface FlagItem {
  type: 'allergen' | 'nutrition' | 'additive';
  ingredient: string;
  severity: 'high' | 'medium' | 'low';
}

interface AllergenFlag {
  allergen: string;
  matchedIngredients: string[];
  severity: 'high' | 'medium';
  isUserAllergen: boolean;
}

interface Additive {
  code: string;
  name: string;
  type: string;
  risk: 'low' | 'medium' | 'high';
  notes?: string;
}

interface Nutrition {
  calories: number;
  sugar: number;
  salt: number;
  fat: number;
  saturatedFat?: number;
}

interface VerdictCardProps {
  data: {
    product: {
      name: string;
      brand: string;
      image: string | null;
      ingredients: string;
      parsedIngredients?: { name: string; isENumber: boolean; eCode?: string }[];
      nutrition: Nutrition;
      categories?: string;
    };
    allergenFlags: AllergenFlag[];
    additives: Additive[];
    additives_detailed?: AdditiveDetail[];
    nutrition_enriched?: EnrichedNutrition;
    claimChecks?: ClaimCheckResult[];
    expiry?: ExpiryResult;
    analysis: {
      verdict: Verdict;
      verdict_reason: string;
      explanation: string;
      flags: FlagItem[];
      action: string;
      confidence: number;
      disclaimer: string;
      preservatives?: string[];
      additive_summary?: string;
      nutrition_context?: string;
    };
    source: 'barcode' | 'label';
    scannedAt: string;
  };
  onClose: () => void;
  onAddToLog: () => void;
  userPreferences?: { allergens?: string[]; diet?: string[] };
  onScanBarcode?: (barcode: string) => void;
}

const verdictConfig = {
  Safe: {
    bg: 'bg-emerald-500',
    lightBg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    icon: CheckCircle,
  },
  Caution: {
    bg: 'bg-amber-500',
    lightBg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    icon: AlertTriangle,
  },
  Avoid: {
    bg: 'bg-red-500',
    lightBg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200',
    icon: XCircle,
  },
};

export default function VerdictCard({ data, onClose, onAddToLog, userPreferences = {}, onScanBarcode }: VerdictCardProps) {
  const [showAllIngredients, setShowAllIngredients] = useState(false);
  const { product, allergenFlags, additives, additives_detailed, nutrition_enriched, claimChecks = [], expiry, analysis } = data;
  const config = verdictConfig[analysis.verdict] || verdictConfig.Caution;
  const Icon = config.icon;

  const parsedList = product.parsedIngredients || [];
  const visibleIngredients = showAllIngredients ? parsedList : parsedList.slice(0, 5);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-2 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col animate-verdict"
        onClick={e => e.stopPropagation()}
      >
        {/* Verdict Header */}
        <div className={`${config.bg} p-6 text-white relative overflow-hidden flex-shrink-0`}>
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full border-4 border-white" />
            <div className="absolute -bottom-4 -left-4 w-20 h-20 rounded-full border-4 border-white" />
          </div>

          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors z-10"
          >
            <XCircle className="w-5 h-5" />
          </button>

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <Icon className="w-7 h-7" />
              </div>
              <div>
                <div className="text-3xl font-black tracking-tight uppercase">PRODUCT ANALYSIS</div>
                <div className="text-white/70 text-sm">
                  {data.source === 'barcode' ? 'Barcode Scan' : 'Label Scan'}
                </div>
              </div>
            </div>
            
            {/* Caution/Verdict explicit text since we removed it from the big header */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/20 rounded-lg text-sm font-semibold mb-2">
              Verdict: {analysis.verdict}
            </div>
            
            <p className="text-white/95 font-medium text-base leading-snug">{analysis.verdict_reason}</p>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto flex-1 divide-y divide-gray-100">
          {/* Product info */}
          <div className="p-5 flex items-center gap-4">
            {product.image ? (
              <img src={product.image} alt={product.name} className="w-16 h-16 object-contain bg-gray-50 rounded-xl p-1 flex-shrink-0" />
            ) : (
              <div className="w-16 h-16 bg-gray-100 rounded-xl flex-shrink-0 flex items-center justify-center text-2xl">🍽️</div>
            )}
            <div className="min-w-0">
              <h2 className="font-bold text-gray-900 text-lg leading-tight truncate">{product.name || 'Unknown Product'}</h2>
              {product.brand && <p className="text-gray-500 text-sm truncate">{product.brand}</p>}
            </div>
          </div>

          {/* Allergen flags */}
          {allergenFlags.length > 0 ? (
            <div className="p-5">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Allergen Warnings</h3>
              <div className="space-y-2">
                {allergenFlags.map((flag, i) => (
                  <div key={i} className={`flex items-start gap-3 p-3 rounded-xl border ${flag.isUserAllergen ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'}`}>
                    <span className="text-lg">{flag.isUserAllergen ? '🚨' : '⚠️'}</span>
                    <div>
                      <div className={`font-semibold text-sm ${flag.isUserAllergen ? 'text-red-700' : 'text-amber-700'}`}>
                        {flag.allergen}{flag.isUserAllergen && ' (Your Allergen)'}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">{flag.matchedIngredients.slice(0, 3).join(', ')}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-5">
              <div className="flex items-center gap-2 text-emerald-600 text-sm font-medium">
                <CheckCircle className="w-4 h-4" />
                No common allergens detected
              </div>
            </div>
          )}

          {/* AI Explanation */}
          <div className="p-5">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Analysis</h3>
            <p className="text-gray-700 text-sm leading-relaxed">{analysis.explanation}</p>
            {analysis.action && (
              <div className={`mt-3 p-3 rounded-xl border ${config.lightBg} ${config.border}`}>
                <p className={`text-sm font-medium ${config.text}`}>💡 {analysis.action}</p>
              </div>
            )}
          </div>

          {/* Expiry Intelligence */}
          {expiry && <ExpiryPanel expiry={expiry} />}

          {/* Label Lie Detector */}
          {claimChecks.length > 0 && <ClaimCheckerPanel claims={claimChecks} />}

          {/* Nutrition */}
          {nutrition_enriched ? (
            <div className="p-5">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Nutritional Values</h3>
              <NutritionPanel
                nutrition={nutrition_enriched}
                nutritionContext={analysis.nutrition_context}
              />
            </div>
          ) : product.nutrition.calories > 0 && (
            <div className="p-5">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Nutrition per 100g</h3>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: 'Calories', value: product.nutrition.calories, unit: 'kcal', threshold: null },
                  { label: 'Sugar', value: product.nutrition.sugar, unit: 'g', threshold: 20 },
                  { label: 'Fat', value: product.nutrition.fat, unit: 'g', threshold: 20 },
                  { label: 'Salt', value: product.nutrition.salt, unit: 'g', threshold: 1.5 },
                ].map(item => {
                  const isHigh = item.threshold !== null && (item.value as number) > item.threshold;
                  return (
                    <div key={item.label} className={`p-3 rounded-xl text-center ${isHigh ? 'bg-red-50 border border-red-100' : 'bg-gray-50'}`}>
                      <div className={`text-xs mb-1 ${isHigh ? 'text-red-500 font-semibold' : 'text-gray-400'}`}>{item.label}</div>
                      <div className={`font-bold text-sm ${isHigh ? 'text-red-600' : 'text-gray-900'}`}>
                        {item.value}{item.unit}
                      </div>
                      {isHigh && <div className="text-xs text-red-400 mt-0.5">High</div>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Additives & E-numbers */}
          <div className="p-5">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
              Additives & E-numbers
              {additives_detailed && additives_detailed.length > 0 && (
                <span className="ml-2 font-normal text-gray-400 normal-case">{additives_detailed.length} detected</span>
              )}
            </h3>
            <AdditivesPanel
              additives={additives_detailed ?? []}
              additiveSummary={analysis.additive_summary}
            />
          </div>

          {/* Smart Swap */}
          {product.categories && (
            <SmartSwapPanel
              productCategory={product.categories}
              nutrition={product.nutrition}
              userPreferences={userPreferences}
              detectedAllergens={allergenFlags.map(f => f.allergen)}
              verdict={analysis.verdict}
              onScanSwap={onScanBarcode}
            />
          )}

          {/* Ingredient list */}
          {parsedList.length > 0 && (
            <div className="p-5">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                Ingredients ({parsedList.length})
              </h3>
              <div className="space-y-1">
                {visibleIngredients.map((ing, i) => (
                  <div key={i} className={`text-sm py-1 px-2 rounded-lg ${ing.isENumber ? 'bg-orange-50 text-orange-700' : 'text-gray-700'}`}>
                    {ing.isENumber ? <span><span className="font-semibold">{ing.eCode}</span> · {ing.name}</span> : ing.name}
                  </div>
                ))}
              </div>
              {parsedList.length > 5 && (
                <button onClick={() => setShowAllIngredients(!showAllIngredients)} className="mt-2 flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 font-medium">
                  {showAllIngredients ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  {showAllIngredients ? 'Show less' : `Show all ${parsedList.length} ingredients`}
                </button>
              )}
            </div>
          )}

          {/* Disclaimer */}
          <div className="p-5">
            <p className="text-xs text-gray-400 leading-relaxed">{analysis.disclaimer}</p>
          </div>
        </div>

        {/* Bottom CTAs */}
        <div className="p-4 border-t border-gray-100 flex gap-3 flex-shrink-0">
          <button onClick={onAddToLog} className="flex-1 py-3.5 bg-black text-white rounded-2xl font-semibold hover:bg-gray-800 transition-colors">
            Add to History
          </button>
          <button onClick={onClose} className="py-3.5 px-5 border border-gray-200 text-gray-700 rounded-2xl font-semibold hover:bg-gray-50 transition-colors">
            Scan Another
          </button>
        </div>
      </div>
    </div>
  );
}
