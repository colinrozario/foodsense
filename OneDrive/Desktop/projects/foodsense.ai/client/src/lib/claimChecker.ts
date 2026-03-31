// Label Lie Detector — static rules engine
// Checks marketing claims on packaging against actual nutrition + ingredient data

export type ClaimSeverity = 'caution' | 'info' | 'misleading';

export interface ClaimRule {
  id: string;
  pattern: RegExp;
  aliases?: RegExp[];
  check: (ctx: ClaimContext) => boolean;
  severity: ClaimSeverity;
  title: string;
  explanation: (ctx: ClaimContext) => string;
}

export interface ClaimContext {
  productName: string;
  ingredientsText: string;
  nutrition: { calories: number; sugar: number; fat: number; salt: number; saturatedFat?: number };
  userDiet?: string[];
}

export interface ClaimCheckResult {
  id: string;
  claimFound: string;
  severity: ClaimSeverity;
  title: string;
  explanation: string;
  verdict: 'verified' | 'misleading' | 'vague';
}

const ing = (ctx: ClaimContext, term: string) =>
  ctx.ingredientsText.toLowerCase().includes(term.toLowerCase());

const CLAIM_RULES: ClaimRule[] = [
  {
    id: 'no_added_sugar',
    pattern: /no[- ]added[- ]sugar/i,
    aliases: [/zero[- ]added[- ]sugar/i, /without[- ]added[- ]sugar/i, /unsweetened/i],
    check: ctx => ctx.nutrition.sugar > 10,
    severity: 'caution',
    title: 'No Added Sugar — but still contains sugar',
    explanation: ctx =>
      `This product contains ${ctx.nutrition.sugar}g of sugar per 100g from natural sources. "No added sugar" does not mean low sugar — it only means no sugar was added during production.`,
  },
  {
    id: 'natural_flavors_vegan',
    pattern: /natural flavou?ring/i,
    check: ctx => (ctx.userDiet || []).some(d => d.toLowerCase().includes('vegan')),
    severity: 'caution',
    title: '"Natural Flavors" — may not be vegan',
    explanation: () =>
      `"Natural flavours" is a broad legal category covering hundreds of compounds, some derived from animals (e.g., castoreum from beavers, civet). As a vegan, contact the manufacturer to confirm the source.`,
  },
  {
    id: 'multigrain',
    pattern: /multigrain/i,
    check: ctx => !ing(ctx, 'whole grain') && !ing(ctx, 'wholegrain') && !ing(ctx, 'whole wheat'),
    severity: 'info',
    title: '"Multigrain" ≠ Whole Grain',
    explanation: () =>
      `"Multigrain" only means more than one type of grain was used — it says nothing about refinement. Enriched white flour from 3 grains qualifies. Check the first 3 ingredients for "wholegrain" or "whole wheat".`,
  },
  {
    id: 'light_lite',
    pattern: /\b(light|lite)\b/i,
    aliases: [/reduced[- ](fat|calorie|sugar)/i, /low[- ]fat/i],
    check: ctx => ctx.nutrition.fat > 5 || ctx.nutrition.calories > 200,
    severity: 'info',
    title: '"Light" — relative to a reference product',
    explanation: ctx =>
      `"Light" means at least 30% fewer calories or fat than the standard version. At ${ctx.nutrition.calories} kcal and ${ctx.nutrition.fat}g fat per 100g, this product can still be calorie-dense.`,
  },
  {
    id: 'made_with_real_fruit',
    pattern: /made with real fruit/i,
    aliases: [/real fruit/i, /contains fruit/i],
    check: () => true, // Always flag — no minimum % is required by law
    severity: 'info',
    title: '"Real Fruit" — no minimum percentage required',
    explanation: () =>
      `Manufacturers are not required to disclose the percentage of fruit in the product. A product with 1% fruit juice can legally say "made with real fruit." Check the ingredient order — fruit should appear near the top if it's a significant component.`,
  },
  {
    id: 'low_sugar',
    pattern: /low[- ]sugar/i,
    check: ctx => ctx.nutrition.sugar >= 5,
    severity: 'misleading',
    title: '"Low Sugar" — but sugar is above 5g/100g',
    explanation: ctx =>
      `EU/UK regulations define "low sugar" as ≤5g per 100g (solids) or ≤2.5g per 100ml. This product has ${ctx.nutrition.sugar}g per 100g. If this claim is on the packaging, it may not meet the legal definition.`,
  },
  {
    id: 'low_calorie',
    pattern: /low[- ]calorie/i,
    aliases: [/low[- ]energy/i, /diet/i],
    check: ctx => ctx.nutrition.calories >= 40,
    severity: 'info',
    title: '"Low Calorie" — check the threshold',
    explanation: ctx =>
      `EU/UK defines "low calorie" as ≤40 kcal per 100g. This product has ${ctx.nutrition.calories} kcal per 100g.`,
  },
  {
    id: 'fat_free',
    pattern: /fat[- ]free/i,
    aliases: [/zero[- ]fat/i, /0%[- ]fat/i],
    check: ctx => ctx.nutrition.fat > 0.5,
    severity: 'misleading',
    title: '"Fat Free" — but contains fat',
    explanation: ctx =>
      `Legally "fat free" means <0.5g fat per 100g. This product shows ${ctx.nutrition.fat}g fat per 100g — it may not qualify for this claim.`,
  },
  {
    id: 'high_protein',
    pattern: /high[- ]protein/i,
    aliases: [/protein[- ]rich/i, /good source of protein/i],
    check: ctx => !ing(ctx, 'protein') && ctx.nutrition.calories > 0,
    severity: 'info',
    title: '"High Protein" — verify the amount',
    explanation: () =>
      `EU regulations define "high protein" as ≥20% of energy from protein. Check the nutrition panel for the actual protein content per serving.`,
  },
  {
    id: 'organic',
    pattern: /\borganic\b/i,
    check: () => false, // Only flag if we have certification data (we don't in MVP)
    severity: 'info',
    title: '"Organic" — verified certification required',
    explanation: () =>
      `"Organic" is a legally regulated term in EU/UK/USA — it requires third-party certification. Look for the EU organic leaf logo, USDA Organic seal, or Soil Association mark to verify.`,
  },
  {
    id: 'natural',
    pattern: /\bnatural\b/i,
    check: () => ing({ ingredientsText: '', nutrition: { calories: 0, sugar: 0, fat: 0, salt: 0 }, productName: '' }, '') || true,
    severity: 'info',
    title: '"Natural" — no legal definition',
    explanation: () =>
      `"Natural" has no legal definition in most countries. Any manufacturer can use it freely. It is a marketing term, not a regulated claim.`,
  },
  {
    id: 'no_preservatives',
    pattern: /no[- ]preservatives/i,
    aliases: [/preservative[- ]free/i, /without[- ]preservatives/i],
    check: ctx =>
      ['E200', 'E202', 'E210', 'E211', 'E220', 'E250', 'E251', 'E320', 'E321'].some(e =>
        ctx.ingredientsText.toLowerCase().includes(e.toLowerCase())
      ),
    severity: 'misleading',
    title: '"No Preservatives" — but preservatives detected',
    explanation: () =>
      `The ingredient list contains E-numbers associated with preservation. Some preservatives fall outside the regulatory definition of "preservative" (e.g., salt, sugar, vinegar, vitamin C) — but this claim warrants closer inspection.`,
  },
  {
    id: 'source_of_fiber',
    pattern: /source of (dietary )?fi[b]?e?r/i,
    aliases: [/high[- ]fi[b]?e?r/i, /rich in fi[b]?e?r/i],
    check: () => true,
    severity: 'info',
    title: '"Source of Fibre" — check the amount',
    explanation: () =>
      `"Source of fibre" = ≥3g per 100g. "High in fibre" = ≥6g per 100g. Check the nutrition label to confirm the actual fibre content.`,
  },
  {
    id: 'gluten_free_claim',
    pattern: /gluten[- ]free/i,
    check: ctx =>
      ['wheat', 'barley', 'rye', 'oats', 'spelt', 'gluten'].some(g =>
        ctx.ingredientsText.toLowerCase().includes(g)
      ),
    severity: 'misleading',
    title: '"Gluten Free" — but gluten-containing ingredients detected',
    explanation: () =>
      `The ingredient list appears to contain gluten-containing grains. If you have coeliac disease or gluten sensitivity, check with the manufacturer before consuming.`,
  },
  {
    id: 'wholesome',
    pattern: /\bwholesome\b/i,
    check: () => true,
    severity: 'info',
    title: '"Wholesome" — unregulated marketing term',
    explanation: () =>
      `"Wholesome" has no legal or nutritional definition. It is a purely subjective marketing word used to evoke health perceptions.`,
  },
];

export function checkLabelClaims(
  productText: string, // product name + categories
  ingredientsText: string,
  nutrition: ClaimContext['nutrition'],
  userDiet?: string[]
): ClaimCheckResult[] {
  const results: ClaimCheckResult[] = [];
  const combined = `${productText} ${ingredientsText}`.toLowerCase();
  const ctx: ClaimContext = { productName: productText, ingredientsText, nutrition, userDiet };

  for (const rule of CLAIM_RULES) {
    // Check if the claim pattern appears in the product text
    const allPatterns = [rule.pattern, ...(rule.aliases || [])];
    const foundPattern = allPatterns.find(p => p.test(combined));
    if (!foundPattern) continue;

    const foundText = combined.match(foundPattern)?.[0] || rule.pattern.source;

    // Skip low-signal "natural" and "organic" unless explicitly found in product name
    if ((rule.id === 'natural' || rule.id === 'organic' || rule.id === 'wholesome') 
        && !rule.pattern.test(productText)) continue;

    const isProblematic = rule.check(ctx);

    results.push({
      id: rule.id,
      claimFound: foundText,
      severity: rule.severity,
      title: rule.title,
      explanation: rule.explanation(ctx),
      verdict: isProblematic
        ? rule.severity === 'misleading' ? 'misleading' : 'vague'
        : 'verified',
    });
  }

  return results;
}
