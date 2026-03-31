'use client';

import { useState } from 'react';
import type { AdditiveDetail } from '@/lib/allergens';

const RISK_CONFIG = {
  high:   { bg: 'bg-red-50',    border: 'border-red-200',    dot: 'bg-red-500',    label: 'High risk',   text: 'text-red-800',   badge: 'bg-red-100 text-red-700' },
  medium: { bg: 'bg-amber-50',  border: 'border-amber-200',  dot: 'bg-amber-500',  label: 'Medium risk', text: 'text-amber-800', badge: 'bg-amber-100 text-amber-700' },
  low:    { bg: 'bg-green-50',  border: 'border-green-200',  dot: 'bg-green-500',  label: 'Low risk',    text: 'text-green-800', badge: 'bg-green-100 text-green-700' },
} as const;

const CATEGORY_LABEL: Record<string, string> = {
  colorant:           'Colorant',
  preservative:       'Preservative',
  emulsifier:         'Emulsifier',
  antioxidant:        'Antioxidant',
  sweetener:          'Sweetener',
  flavour_enhancer:   'Flavour enhancer',
  thickener:          'Thickener',
  raising_agent:      'Raising agent',
  acidity_regulator:  'Acidity regulator',
};

interface Props {
  additives: AdditiveDetail[];
  additiveSummary?: string;
}

export default function AdditivesPanel({ additives, additiveSummary }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null);

  if (!additives || additives.length === 0) {
    return (
      <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 flex items-center gap-2">
        <span className="text-green-500 text-base">✓</span>
        <p className="text-sm font-medium text-green-800">No recognised additives or E-numbers detected</p>
      </div>
    );
  }

  const sorted = [...additives].sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 };
    return order[a.risk] - order[b.risk];
  });

  return (
    <div className="space-y-2">
      {/* LLM summary */}
      {additiveSummary && (
        <p className="text-sm text-gray-500 leading-relaxed mb-3">{additiveSummary}</p>
      )}

      {sorted.map((additive) => {
        const cfg = RISK_CONFIG[additive.risk];
        const isOpen = expanded === additive.code;

        return (
          <div
            key={additive.code}
            className={`rounded-2xl border ${cfg.border} ${cfg.bg} overflow-hidden transition-all`}
          >
            {/* Header — always visible */}
            <button
              className="w-full text-left px-4 py-3 flex items-start gap-3"
              onClick={() => setExpanded(isOpen ? null : additive.code)}
            >
              <span className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-semibold text-gray-500">{additive.code}</span>
                  <span className={`text-sm font-semibold ${cfg.text}`}>{additive.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cfg.badge}`}>
                    {cfg.label}
                  </span>
                  <span className="text-xs text-gray-400">
                    {CATEGORY_LABEL[additive.category] ?? additive.category}
                  </span>
                </div>
                <p className="text-xs text-gray-600 mt-1 leading-snug">{additive.shortExplanation}</p>
              </div>
              <span className="text-gray-400 text-xs mt-1 flex-shrink-0">{isOpen ? '▲' : '▼'}</span>
            </button>

            {/* Expanded detail */}
            {isOpen && (
              <div className="px-4 pb-4 pt-0 border-t border-black/5 space-y-3 mt-1">

                {additive.healthEffects.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Health effects</p>
                    <ul className="space-y-1">
                      {additive.healthEffects.map((effect, i) => (
                        <li key={i} className="text-xs text-gray-700 flex gap-2">
                          <span className="text-gray-400 flex-shrink-0">–</span>{effect}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Commonly found in</p>
                  <div className="flex flex-wrap gap-1">
                    {additive.commonlyFoundIn.map((item) => (
                      <span key={item} className="text-xs bg-white/70 border border-black/10 rounded-full px-2.5 py-0.5 text-gray-600">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                {additive.bannedIn.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-red-600 uppercase tracking-wide mb-1">Banned in</p>
                    <p className="text-xs text-red-700">{additive.bannedIn.join(', ')}</p>
                  </div>
                )}

                {additive.requiresWarningIn.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide mb-1">Requires warning label in</p>
                    <p className="text-xs text-amber-700">{additive.requiresWarningIn.join(', ')}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
