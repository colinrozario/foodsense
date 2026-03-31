import { NextRequest, NextResponse } from 'next/server';

interface UserPreferences {
  allergens?: string[];
  diet?: string[];
}

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

function computeScore(
  candidate: any,
  original: { sugar: number; fat: number; salt: number; calories: number },
  detectedAllergens: string[]
): number {
  const n = candidate.nutriments || {};
  const cSugar = n.sugars_100g ?? 999;
  const cFat = n.fat_100g ?? 999;
  const cSalt = n.salt_100g ?? 999;
  const cCal = n['energy-kcal_100g'] ?? n.energy_100g ?? 999;

  // Grade: A=5, B=4, C=3, D=2, E=1
  const gradeMap: Record<string, number> = { a: 5, b: 4, c: 3, d: 2, e: 1 };
  const nutriScore = gradeMap[candidate.nutriscore_grade?.toLowerCase() || ''] || 2;

  const sugarReduction = Math.max(0, (original.sugar - cSugar) / Math.max(original.sugar, 1));
  const saltReduction = Math.max(0, (original.salt - cSalt) / Math.max(original.salt, 1));
  const fatReduction = Math.max(0, (original.fat - cFat) / Math.max(original.fat, 1));

  return (
    (nutriScore / 5) * 0.4 +
    sugarReduction * 0.25 +
    saltReduction * 0.2 +
    fatReduction * 0.15
  );
}

function buildWhyBetter(
  candidate: any,
  original: { sugar: number; fat: number; salt: number; calories: number }
): string[] {
  const n = candidate.nutriments || {};
  const reasons: string[] = [];

  const cSugar = n.sugars_100g ?? null;
  const cFat = n.fat_100g ?? null;
  const cSalt = n.salt_100g ?? null;
  const cCal = n['energy-kcal_100g'] ?? null;
  const grade = candidate.nutriscore_grade?.toUpperCase();

  if (grade && ['A', 'B'].includes(grade)) reasons.push(`NutriScore ${grade}`);
  if (cSugar !== null && original.sugar > 0 && cSugar < original.sugar * 0.8)
    reasons.push(`${Math.round(((original.sugar - cSugar) / original.sugar) * 100)}% less sugar`);
  if (cSalt !== null && original.salt > 0 && cSalt < original.salt * 0.8)
    reasons.push(`${Math.round(((original.salt - cSalt) / original.salt) * 100)}% less salt`);
  if (cFat !== null && original.fat > 0 && cFat < original.fat * 0.8)
    reasons.push(`${Math.round(((original.fat - cFat) / original.fat) * 100)}% less fat`);
  if (cCal !== null && original.calories > 0 && cCal < original.calories * 0.8)
    reasons.push(`${Math.round(original.calories - cCal)} fewer kcal`);

  return reasons.length > 0 ? reasons : ['Better nutritional profile'];
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { productCategory, nutrition, userPreferences, detectedAllergens = [], originalBarcode } = body as {
      productCategory: string;
      nutrition: { sugar: number; fat: number; salt: number; calories: number };
      userPreferences: UserPreferences;
      detectedAllergens: string[];
      originalBarcode?: string;
    };

    if (!productCategory) {
      return NextResponse.json(
        { success: false, error: { code: 'MISSING_CATEGORY', message: 'Product category required for swap search.' } },
        { status: 400 }
      );
    }

    // Extract first usable category tag (e.g. "en:biscuits" → "biscuits")
    const rawCategory = productCategory.split(',')[0].trim();
    const categoryTag = rawCategory.replace(/^[a-z]{2}:/, '').replace(/\s+/g, '-').toLowerCase();

    console.log(`[Swap] Searching alternatives for category: "${categoryTag}"`);

    // Query OpenFoodFacts search
    const searchUrl = new URL('https://world.openfoodfacts.org/cgi/search.pl');
    searchUrl.searchParams.set('action', 'process');
    searchUrl.searchParams.set('tagtype_0', 'categories');
    searchUrl.searchParams.set('tag_0', categoryTag);
    searchUrl.searchParams.set('sort_by', 'unique_scans_n');
    searchUrl.searchParams.set('json', '1');
    searchUrl.searchParams.set('page_size', '30');
    searchUrl.searchParams.set('fields', 'product_name,brands,image_front_url,nutriments,nutriscore_grade,allergens_tags,_id,code');

    const offRes = await fetch(searchUrl.toString(), { signal: AbortSignal.timeout(6000) });
    if (!offRes.ok) throw new Error('OpenFoodFacts search failed');

    const offData = await offRes.json();
    const products: any[] = offData.products || [];

    const userAllergenLower = (userPreferences.allergens || []).map((a: string) => a.toLowerCase());

    // Filter and score
    const candidates = products
      .filter(p => {
        if (!p.product_name) return false;
        if (p.code === originalBarcode) return false;

        // Exclude products containing user's allergens
        const pAllergens: string[] = p.allergens_tags || [];
        const hasUserAllergen = pAllergens.some((tag: string) =>
          userAllergenLower.some(ua => tag.toLowerCase().includes(ua))
        );
        if (hasUserAllergen) return false;

        // Must have some nutrition data
        const n = p.nutriments || {};
        if (!n.sugars_100g && !n['energy-kcal_100g']) return false;

        return true;
      })
      .map(p => ({
        product: p,
        score: computeScore(p, nutrition, detectedAllergens),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    const swaps: SwapProduct[] = candidates.map(({ product: p }) => ({
      id: p._id || p.code,
      name: p.product_name || 'Unknown Product',
      brand: p.brands || '',
      image: p.image_front_url || null,
      nutriScore: p.nutriscore_grade?.toUpperCase() || null,
      nutrition: {
        calories: Math.round(p.nutriments?.['energy-kcal_100g'] ?? 0),
        sugar: parseFloat((p.nutriments?.sugars_100g ?? 0).toFixed(1)),
        fat: parseFloat((p.nutriments?.fat_100g ?? 0).toFixed(1)),
        salt: parseFloat((p.nutriments?.salt_100g ?? 0).toFixed(2)),
      },
      whyBetter: buildWhyBetter(p, nutrition),
      fitsProfile: true,
      barcode: p.code || '',
    }));

    console.log(`[Swap] Found ${swaps.length} alternatives`);

    return NextResponse.json({ success: true, data: { swaps } });
  } catch (error: any) {
    console.error('[Swap] Error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'SWAP_FAILED', message: 'Could not find alternatives right now.' } },
      { status: 500 }
    );
  }
}
