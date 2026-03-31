'use client';

import { Calendar, AlertTriangle, CheckCircle, XCircle, HelpCircle } from 'lucide-react';
import type { ExpiryResult } from '@/lib/dateExtractor';

interface ExpiryPanelProps {
  expiry: ExpiryResult;
}

const statusConfig = {
  safe: { icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', barColor: 'bg-emerald-500' },
  caution: { icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', barColor: 'bg-amber-500' },
  expired: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', barColor: 'bg-red-500' },
  not_found: { icon: HelpCircle, color: 'text-gray-500', bg: 'bg-gray-50', border: 'border-gray-200', barColor: 'bg-gray-300' },
};

const dateTypeLabel: Record<string, string> = {
  use_by: 'Use By',
  best_before: 'Best Before',
  sell_by: 'Sell By',
  unknown: 'Date Found',
};

export default function ExpiryPanel({ expiry }: ExpiryPanelProps) {
  if (expiry.status === 'not_found' && expiry.datesFound.length === 0) return null;

  const config = statusConfig[expiry.status];
  const Icon = config.icon;
  const primary = expiry.primaryDate;
  const days = primary?.daysRemaining;

  // Visual bar: how much time remains out of 365 days (capped)
  const MAX_DAYS = 365;
  const daysNum = days ?? null;
  const barPct = daysNum === null ? 0
    : daysNum <= 0 ? 100
    : Math.min(100, Math.round(((MAX_DAYS - daysNum) / MAX_DAYS) * 100));

  return (
    <div className="p-5">
      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Expiry Intelligence</h3>

      <div className={`rounded-2xl border ${config.border} ${config.bg} p-4 space-y-3`}>
        <div className="flex items-start gap-3">
          <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${config.color}`} />
          <div className="flex-1 min-w-0">
            {primary ? (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                  {dateTypeLabel[primary.dateType] || 'Date'}
                </span>
                <span className={`font-bold text-base ${config.color}`}>
                  {primary.parsedDate?.toLocaleDateString('en-GB', {
                    day: 'numeric', month: 'short', year: 'numeric'
                  })}
                </span>
                {daysNum !== null && (
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${config.bg} ${config.color} border ${config.border}`}>
                    {daysNum > 0 ? `${daysNum} day${daysNum !== 1 ? 's' : ''} left` : daysNum === 0 ? 'Today' : `${Math.abs(daysNum)} day${Math.abs(daysNum) !== 1 ? 's' : ''} ago`}
                  </span>
                )}
              </div>
            ) : (
              <p className={`text-sm font-semibold ${config.color}`}>Date not detected</p>
            )}
            <p className={`text-sm mt-1 ${config.color} font-medium`}>{expiry.advice}</p>
          </div>
        </div>

        {/* Visual time bar */}
        {primary && daysNum !== null && (
          <div>
            <div className="h-2 bg-white/80 rounded-full overflow-hidden border border-white/60">
              <div
                className={`h-full rounded-full transition-all ${config.barColor}`}
                style={{ width: `${barPct}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>Today</span>
              <span>1 year</span>
            </div>
          </div>
        )}

        {/* Ambiguity warning */}
        {primary?.ambiguous && (
          <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-2.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-amber-700">Ambiguous date format</p>
              <p className="text-xs text-amber-600 mt-0.5">{primary.alternativeInterpretation}</p>
            </div>
          </div>
        )}

        {/* Safety note */}
        {expiry.safetyNote && (
          <p className="text-xs text-gray-600 leading-relaxed border-t border-white/60 pt-2">
            {expiry.safetyNote}
          </p>
        )}
      </div>

      {/* Multiple dates found */}
      {expiry.datesFound.length > 1 && (
        <div className="mt-2 space-y-1">
          <p className="text-xs text-gray-400 font-medium">All dates detected:</p>
          {expiry.datesFound.map((d, i) => (
            <div key={i} className="flex items-center gap-2 text-xs text-gray-500">
              <Calendar className="w-3 h-3" />
              <span className="font-medium">{dateTypeLabel[d.dateType] || 'Date'}:</span>
              <span>{d.parsedDate?.toLocaleDateString('en-GB')} ({d.raw})</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
