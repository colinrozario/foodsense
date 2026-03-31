// Nutrition enrichment service — traffic-light scoring, daily % of reference values
// Adapted from the additives_nutrition_build.md spec (Python → TypeScript)

// WHO / NHS daily reference values (per adult, 2000kcal diet)
const DAILY_REFERENCE: Record<string, number> = {
  calories: 2000,
  fat: 70,
  saturatedFat: 20,
  sugar: 50,       // FSA labelling standard (WHO free sugar: 25g; UK: 30g)
  salt: 6,         // WHO <5g; UK label standard 6g
  protein: 50,
};

// UK FSA traffic-light thresholds per 100g
const TRAFFIC_THRESHOLDS: Record<string, { low: number; high: number }> = {
  fat:          { low: 3.0,  high: 17.5 },
  saturatedFat: { low: 1.5,  high: 5.0  },
  sugar:        { low: 5.0,  high: 22.5 },
  salt:         { low: 0.3,  high: 1.5  },
};

export interface NutrientRow {
  label: string;
  value: number | null;   // per 100g (or per serving if toggled)
  unit: string;
  dailyPercent: number | null;
  trafficLight: 'green' | 'amber' | 'red' | null;
  context: string | null;
}

export interface EnrichedNutrition {
  rows: NutrientRow[];
  overallNote: string;
  highConcernNutrients: string[];
}

function trafficLight(key: string, value: number): 'green' | 'amber' | 'red' | null {
  const t = TRAFFIC_THRESHOLDS[key];
  if (!t) return null;
  if (value <= t.low)  return 'green';
  if (value >= t.high) return 'red';
  return 'amber';
}

function dailyPercent(key: string, value: number): number | null {
  const ref = DAILY_REFERENCE[key];
  if (!ref) return null;
  return Math.round((value / ref) * 100 * 10) / 10; // 1 decimal
}

function contextNote(key: string, value: number, tl: string): string | null {
  const map: Record<string, string> = {
    'sugar:red':          `${value}g per 100g is high — exceeds the UK FSA 'high sugar' threshold of 22.5g.`,
    'sugar:amber':        `${value}g per 100g is a moderate amount of sugar.`,
    'salt:red':           `${value}g per 100g is high. Frequent consumption raises blood pressure risk.`,
    'salt:amber':         `${value}g per 100g is a moderate salt level.`,
    'fat:red':            `${value}g total fat per 100g is high.`,
    'saturatedFat:red':   `${value}g saturated fat per 100g is high — linked to raised LDL cholesterol.`,
    'saturatedFat:amber': `${value}g saturated fat per 100g is moderate.`,
  };
  return map[`${key}:${tl}`] ?? null;
}

export function enrichNutrition(nutrition: {
  calories: number;
  sugar: number;
  fat: number;
  salt: number;
  saturatedFat?: number;
}): EnrichedNutrition {
  const highConcernNutrients: string[] = [];

  const fieldDefs: Array<{ key: string; label: string; unit: string; value: number | null }> = [
    { key: 'calories',     label: 'Calories',       unit: 'kcal', value: nutrition.calories ?? null },
    { key: 'fat',          label: 'Fat',            unit: 'g',    value: nutrition.fat ?? null },
    { key: 'saturatedFat', label: 'Saturated fat',  unit: 'g',    value: nutrition.saturatedFat ?? null },
    { key: 'sugar',        label: 'Sugars',         unit: 'g',    value: nutrition.sugar ?? null },
    { key: 'salt',         label: 'Salt',           unit: 'g',    value: nutrition.salt ?? null },
  ];

  const rows: NutrientRow[] = fieldDefs.map(({ key, label, unit, value }) => {
    if (value === null || value === undefined) {
      return { label, value: null, unit, dailyPercent: null, trafficLight: null, context: 'Not available' };
    }

    const tl = trafficLight(key, value);
    const pct = dailyPercent(key, value);
    const ctx = tl ? contextNote(key, value, tl) : null;

    if (tl === 'red') {
      highConcernNutrients.push(label.toLowerCase());
    }

    return { label, value, unit, dailyPercent: pct, trafficLight: tl, context: ctx };
  });

  let overallNote: string;
  if (highConcernNutrients.length === 0) {
    overallNote = 'Nutritional profile is within normal ranges.';
  } else if (highConcernNutrients.length === 1) {
    overallNote = `High ${highConcernNutrients[0]} content. Check your daily intake if consuming regularly.`;
  } else {
    overallNote = `High ${highConcernNutrients.join(' and ')} detected. Limit serving size and frequency.`;
  }

  return { rows, overallNote, highConcernNutrients };
}
