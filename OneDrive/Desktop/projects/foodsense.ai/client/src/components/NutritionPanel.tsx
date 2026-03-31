'use client';

import { useState } from 'react';
import type { NutrientRow, EnrichedNutrition } from '@/lib/nutrition';

const TRAFFIC_COLOR = {
  green: { bar: 'bg-emerald-500', text: 'text-emerald-700', badge: 'bg-emerald-50 text-emerald-700' },
  amber: { bar: 'bg-amber-500',   text: 'text-amber-700',   badge: 'bg-amber-50 text-amber-700'   },
  red:   { bar: 'bg-red-500',     text: 'text-red-700',     badge: 'bg-red-50 text-red-700'       },
  none:  { bar: 'bg-gray-200',    text: 'text-gray-500',    badge: 'bg-gray-50 text-gray-500'     },
} as const;

function NutrientBarRow({ row }: { row: NutrientRow }) {
  const tl = row.trafficLight ?? 'none';
  const colors = TRAFFIC_COLOR[tl];
  const pct = Math.min(row.dailyPercent ?? 0, 100);

  return (
    <div className="py-2.5 border-b border-black/5 last:border-0">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm text-gray-700">{row.label}</span>
        <div className="flex items-center gap-2">
          {row.value !== null ? (
            <span className="text-sm font-semibold text-gray-900">
              {row.value}{row.unit}
            </span>
          ) : (
            <span className="text-sm text-gray-400">—</span>
          )}
          {row.dailyPercent !== null && (
            <span className={`text-xs font-medium px-1.5 py-0.5 rounded-md ${colors.badge}`}>
              {row.dailyPercent}%
            </span>
          )}
        </div>
      </div>

      {/* Progress bar */}
      {row.value !== null && (
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ease-out ${colors.bar}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}

      {/* Context note (amber + red only) */}
      {row.context && tl !== 'none' && tl !== 'green' && (
        <p className={`text-xs mt-1 ${colors.text}`}>{row.context}</p>
      )}
    </div>
  );
}

interface Props {
  nutrition: EnrichedNutrition;
  nutritionContext?: string;
}

export default function NutritionPanel({ nutrition, nutritionContext }: Props) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-gray-900">Nutrition per 100g</h3>
        <p className="text-xs text-gray-500 mt-0.5">{nutrition.overallNote}</p>
      </div>

      {/* Traffic light legend */}
      <div className="px-4 pt-2.5 pb-1 flex gap-4">
        {(['green', 'amber', 'red'] as const).map((tl) => (
          <div key={tl} className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${TRAFFIC_COLOR[tl].bar}`} />
            <span className="text-xs text-gray-400">
              {tl === 'green' ? 'Low' : tl === 'amber' ? 'Moderate' : 'High'}
            </span>
          </div>
        ))}
        <span className="text-xs text-gray-400 ml-auto">% of daily intake</span>
      </div>

      {/* Nutrient rows */}
      <div className="px-4 pb-1">
        {nutrition.rows.map((row) => (
          <NutrientBarRow key={row.label} row={row} />
        ))}
      </div>

      {/* AI nutrition context */}
      {nutritionContext && (
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
          <p className="text-xs text-gray-600 leading-relaxed">{nutritionContext}</p>
        </div>
      )}
    </div>
  );
}
