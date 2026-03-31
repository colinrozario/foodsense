'use client';

import { CheckCircle, AlertTriangle, XCircle, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import type { ClaimCheckResult } from '@/lib/claimChecker';

interface ClaimCheckerPanelProps {
  claims: ClaimCheckResult[];
}

const verdictConfig = {
  verified: { icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', label: 'Consistent' },
  vague: { icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', label: 'Vague' },
  misleading: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', label: 'Misleading' },
};

export default function ClaimCheckerPanel({ claims }: ClaimCheckerPanelProps) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  if (claims.length === 0) return null;

  const problems = claims.filter(c => c.verdict !== 'verified');
  const visible = showAll ? claims : claims.slice(0, 3);

  return (
    <div className="p-5">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Label Lie Detector</h3>
          {problems.length > 0 && (
            <p className="text-xs text-amber-600 font-medium mt-0.5">
              {problems.length} claim{problems.length > 1 ? 's' : ''} flagged on this product
            </p>
          )}
        </div>
        <span className="text-xs px-2 py-1 bg-gray-100 text-gray-500 rounded-full font-medium">
          {claims.length} claim{claims.length > 1 ? 's' : ''} checked
        </span>
      </div>

      <div className="space-y-2">
        {visible.map(claim => {
          const config = verdictConfig[claim.verdict];
          const Icon = config.icon;
          const isOpen = expanded === claim.id;

          return (
            <div key={claim.id} className={`rounded-xl border ${config.border} ${config.bg} overflow-hidden`}>
              <button
                className="w-full flex items-start gap-3 p-3 text-left"
                onClick={() => setExpanded(isOpen ? null : claim.id)}
              >
                <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${config.color}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-gray-500 uppercase">
                      "{claim.claimFound}"
                    </span>
                    <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${config.bg} ${config.color} border ${config.border}`}>
                      {config.label}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-gray-900 mt-0.5">{claim.title}</p>
                </div>
                {isOpen
                  ? <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                  : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                }
              </button>

              {isOpen && (
                <div className="px-3 pb-3 pt-0">
                  <div className="flex items-start gap-2 bg-white/70 rounded-lg p-3">
                    <Info className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-gray-600 leading-relaxed">{claim.explanation}</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {claims.length > 3 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="mt-2 flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 font-medium"
        >
          {showAll ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          {showAll ? 'Show fewer' : `Show ${claims.length - 3} more claims`}
        </button>
      )}

      <p className="text-xs text-gray-400 mt-3 leading-relaxed">
        Claims are checked against ingredient and nutrition data. This is informational — not legal advice.
      </p>
    </div>
  );
}
