// Expiry date extraction — multi-locale, multi-format
// Handles UK/EU, USA, German MHD, ISO 8601, Japanese packed formats

export type DateType = 'use_by' | 'best_before' | 'sell_by' | 'unknown';
export type ExpiryStatus = 'safe' | 'caution' | 'expired' | 'not_found';

export interface DetectedDate {
  raw: string;
  dateType: DateType;
  parsedDate: Date | null;
  daysRemaining: number | null;
  ambiguous: boolean;
  alternativeInterpretation?: string;
}

export interface ExpiryResult {
  datesFound: DetectedDate[];
  primaryDate: DetectedDate | null;
  status: ExpiryStatus;
  advice: string;
  safetyNote: string;
}

// Keywords that indicate a date nearby is an expiry date
const DATE_KEYWORD_PATTERNS: { pattern: RegExp; type: DateType }[] = [
  { pattern: /use\s?by|use-by|consume\s?by|expir(?:y|es?|ation)|exp\b/i, type: 'use_by' },
  { pattern: /best\s?before|best\s?by|bb[de]?|mhd|dluo|scadenza|fecha\s?de\s?caducidad|data\s?de\s?validade/i, type: 'best_before' },
  { pattern: /sell\s?by|sell-by|display\s?until/i, type: 'sell_by' },
  { pattern: /消費期限/i, type: 'use_by' },   // Japanese use-by
  { pattern: /賞味期限/i, type: 'best_before' }, // Japanese best-before
];

// Date patterns in order of specificity
const DATE_REGEX_PATTERNS: RegExp[] = [
  /\b(\d{4})[.\-\/](\d{2})[.\-\/](\d{2})\b/,          // ISO: 2025-08-03
  /\b(\d{8})\b/,                                          // Compact: 20250803
  /\b(\d{2})[.\-\/](\d{2})[.\-\/](\d{4})\b/,            // DD/MM/YYYY or MM/DD/YYYY
  /\b(\d{2})[.\-\/](\d{2})[.\-\/](\d{2})\b/,            // DD/MM/YY or MM/DD/YY
  /\b(\d{2})\s+([A-Za-z]{3})\s+(\d{4})\b/,              // 03 AUG 2025
  /\b(\d{2})\s+([A-Za-z]{3})\s+(\d{2})\b/,              // 03 AUG 25
  /\b([A-Za-z]{3})\s+(\d{4})\b/,                        // AUG 2025
  /\b([A-Za-z]{3})\s+(\d{2})\b/,                        // AUG 25
];

const MONTH_MAP: Record<string, number> = {
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
  jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
  // German
  jan_: 0, feb_: 1, mär: 2, apr_: 3, mai: 4, jun_: 5,
  jul_: 6, aug_: 7, sep_: 8, okt: 9, nov_: 10, dez: 11,
};

function parseMonth(str: string): number {
  return MONTH_MAP[str.toLowerCase().substring(0, 3)] ?? -1;
}

function tryParseDate(raw: string): { date: Date | null; ambiguous: boolean; alt?: string } {
  const s = raw.trim();

  // ISO 8601: YYYY-MM-DD
  const iso = s.match(/^(\d{4})[.\-\/](\d{2})[.\-\/](\d{2})$/);
  if (iso) {
    return { date: new Date(+iso[1], +iso[2] - 1, +iso[3]), ambiguous: false };
  }

  // Compact: YYYYMMDD
  const compact = s.match(/^(\d{8})$/);
  if (compact) {
    const y = +s.slice(0, 4), m = +s.slice(4, 6) - 1, d = +s.slice(6, 8);
    if (y > 2000 && m >= 0 && m < 12 && d >= 1 && d <= 31) {
      return { date: new Date(y, m, d), ambiguous: false };
    }
  }

  // DD MMM YYYY or DD MMM YY
  const dmy_alpha = s.match(/^(\d{2})\s+([A-Za-z]{3})\s+(\d{2,4})$/);
  if (dmy_alpha) {
    const d = +dmy_alpha[1], m = parseMonth(dmy_alpha[2]), y = +dmy_alpha[3];
    const year = y < 100 ? 2000 + y : y;
    if (m >= 0) return { date: new Date(year, m, d), ambiguous: false };
  }

  // MMM YYYY (month + year only — use last day of month)
  const my_alpha = s.match(/^([A-Za-z]{3})\s+(\d{2,4})$/);
  if (my_alpha) {
    const m = parseMonth(my_alpha[1]), y = +my_alpha[2];
    const year = y < 100 ? 2000 + y : y;
    if (m >= 0) return { date: new Date(year, m + 1, 0), ambiguous: false }; // last day of month
  }

  // DD/MM/YYYY
  const dmy = s.match(/^(\d{2})[.\-\/](\d{2})[.\-\/](\d{4})$/);
  if (dmy) {
    const d = +dmy[1], m = +dmy[2] - 1, y = +dmy[3];
    if (m >= 0 && m < 12 && d >= 1 && d <= 31) return { date: new Date(y, m, d), ambiguous: false };
  }

  // DD/MM/YY or MM/DD/YY — ambiguous
  const ambig = s.match(/^(\d{2})[.\-\/](\d{2})[.\-\/](\d{2})$/);
  if (ambig) {
    const a = +ambig[1], b = +ambig[2], y = 2000 + +ambig[3];
    // Heuristic: if first number > 12, it must be a day (DD/MM/YY)
    if (a > 12) {
      return { date: new Date(y, b - 1, a), ambiguous: false };
    }
    if (b > 12) {
      // MM/DD/YY style
      return { date: new Date(y, a - 1, b), ambiguous: false };
    }
    // Truly ambiguous
    const interpretation1 = new Date(y, b - 1, a); // DD/MM (EU)
    const interpretation2 = new Date(y, a - 1, b); // MM/DD (US)
    return {
      date: interpretation1,
      ambiguous: true,
      alt: `Could be ${interpretation1.toLocaleDateString('en-GB')} (EU) or ${interpretation2.toLocaleDateString('en-US')} (US)`,
    };
  }

  return { date: null, ambiguous: false };
}

function daysRemaining(date: Date): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / 86400000);
}

function getDateType(textAround: string): DateType {
  for (const { pattern, type } of DATE_KEYWORD_PATTERNS) {
    if (pattern.test(textAround)) return type;
  }
  return 'unknown';
}

export function extractDates(ocrText: string): ExpiryResult {
  if (!ocrText || ocrText.trim().length < 5) {
    return { datesFound: [], primaryDate: null, status: 'not_found', advice: 'No text provided.', safetyNote: '' };
  }

  const detected: DetectedDate[] = [];
  const text = ocrText;

  for (const regex of DATE_REGEX_PATTERNS) {
    const globalRegex = new RegExp(regex.source, 'gi');
    let match;
    while ((match = globalRegex.exec(text)) !== null) {
      const raw = match[0].trim();
      if (raw.length < 5) continue;
      if (detected.some(d => d.raw === raw)) continue;

      // Get surrounding text to determine date type (±80 chars)
      const start = Math.max(0, match.index - 80);
      const end = Math.min(text.length, match.index + raw.length + 80);
      const context = text.slice(start, end);
      const dateType = getDateType(context);

      const { date, ambiguous, alt } = tryParseDate(raw);
      if (!date) continue;
      if (date.getFullYear() < 2020 || date.getFullYear() > 2040) continue; // sanity filter

      const remaining = daysRemaining(date);

      detected.push({
        raw,
        dateType,
        parsedDate: date,
        daysRemaining: remaining,
        ambiguous,
        alternativeInterpretation: alt,
      });
    }
  }

  if (detected.length === 0) {
    return {
      datesFound: [],
      primaryDate: null,
      status: 'not_found',
      advice: 'No expiry date detected in the label text. Check the packaging manually.',
      safetyNote: '',
    };
  }

  // Prioritise use_by > best_before > sell_by > unknown
  const priority: Record<DateType, number> = { use_by: 0, best_before: 1, sell_by: 2, unknown: 3 };
  const sorted = [...detected].sort((a, b) => priority[a.dateType] - priority[b.dateType]);
  const primary = sorted[0];
  const days = primary.daysRemaining ?? 0;

  let status: ExpiryStatus;
  let advice: string;
  let safetyNote: string;

  const typeLabel = primary.dateType === 'use_by' ? 'Use By' :
    primary.dateType === 'best_before' ? 'Best Before' :
    primary.dateType === 'sell_by' ? 'Sell By' : 'Date';

  if (days > 30) {
    status = 'safe';
    advice = `${typeLabel}: ${primary.parsedDate?.toLocaleDateString('en-GB')} — ${days} days remaining. Safe to use normally.`;
    safetyNote = primary.dateType === 'best_before'
      ? 'Best Before dates relate to quality, not safety. The product may still be safe after this date.'
      : '';
  } else if (days >= 1) {
    status = 'caution';
    advice = `${typeLabel}: ${primary.parsedDate?.toLocaleDateString('en-GB')} — only ${days} day${days > 1 ? 's' : ''} remaining. Use soon.`;
    safetyNote = primary.dateType === 'use_by'
      ? 'Use By is a safety date — do not consume after this date.'
      : 'Best Before relates to quality. The product may still be safe past this date.';
  } else if (days === 0) {
    status = 'caution';
    advice = `${typeLabel}: Today. Consume today or check if it is still good.`;
    safetyNote = primary.dateType === 'use_by' ? 'This is a safety date — consume today only.' : '';
  } else {
    status = primary.dateType === 'use_by' ? 'expired' : 'caution';
    advice = `${typeLabel}: ${primary.parsedDate?.toLocaleDateString('en-GB')} — ${Math.abs(days)} day${Math.abs(days) > 1 ? 's' : ''} ago.`;
    safetyNote = primary.dateType === 'use_by'
      ? '⚠️ Use By dates are safety dates. Do not consume this product.'
      : 'For Best Before dates, use your judgement — check for off smells, mould, or texture changes.';
  }

  return { datesFound: detected, primaryDate: primary, status, advice, safetyNote };
}
