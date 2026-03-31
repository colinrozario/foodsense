import { NextRequest, NextResponse } from 'next/server';
import { analyzeFoodSafety } from '@/lib/gemini';
import { parseIngredients, detectAllergens, getAdditives, getDetailedAdditives, getAdditiveRiskSummary } from '@/lib/allergens';
import { checkLabelClaims } from '@/lib/claimChecker';
import { enrichNutrition } from '@/lib/nutrition';
import { db } from '@/db';
import { scans, products } from '@/db/schema';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { barcode, userPreferences } = body;

    if (!barcode || !/^[0-9]{8,14}$/.test(barcode)) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_BARCODE', message: 'Barcode must be 8–14 digits.' } },
        { status: 400 }
      );
    }

    console.log(`[Scan] Barcode: ${barcode}`);

    // 1. Fetch from OpenFoodFacts
    const offResponse = await fetch(
      `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`,
      { signal: AbortSignal.timeout(10000) }
    );

    if (!offResponse.ok) {
      return NextResponse.json(
        { success: false, error: { code: 'EXTERNAL_API_ERROR', message: 'Could not reach product database.' } },
        { status: 502 }
      );
    }

    const offData = await offResponse.json();
    console.log(`[Scan] OFF Status: ${offData.status}, Product Name: ${offData.product?.product_name || 'N/A'}`);

    if (offData.status === 0 || !offData.product) {
      return NextResponse.json(
        { success: false, error: { code: 'BARCODE_NOT_FOUND', message: 'Product not found in database. Try scanning the ingredients label instead.' } },
        { status: 404 }
      );
    }

    const product = offData.product;
    const productName = product.product_name || product.product_name_en || 'Unknown Product';
    const brand = product.brands || '';
    const ingredientsRaw = product.ingredients_text || product.ingredients_text_en || '';
    const imageUrl = product.image_front_url || product.image_url || null;
    const categories = product.categories || '';

    const nutrition = {
      calories: Math.round(product.nutriments?.['energy-kcal_100g'] ?? product.nutriments?.['energy_100g'] ?? 0),
      sugar: parseFloat((product.nutriments?.sugars_100g ?? 0).toFixed(1)),
      salt: parseFloat((product.nutriments?.salt_100g ?? 0).toFixed(2)),
      fat: parseFloat((product.nutriments?.fat_100g ?? 0).toFixed(1)),
      saturatedFat: parseFloat((product.nutriments?.['saturated-fat_100g'] ?? 0).toFixed(1)),
    };

    // 2. Deterministic ingredient parsing
    const parsedIngredients = parseIngredients(ingredientsRaw);
    const allergenFlags = detectAllergens(parsedIngredients, userPreferences?.allergens || []);
    const additives = getAdditives(parsedIngredients);
    const detectedAllergenNames = allergenFlags.map(f => f.allergen);

    // 2b. Rich additive + nutrition enrichment
    const detailedAdditives = getDetailedAdditives(parsedIngredients);
    const additiveRiskSummary = getAdditiveRiskSummary(detailedAdditives);
    const nutritionEnriched = enrichNutrition(nutrition);

    // 3. Label Lie Detector (deterministic)
    const claimChecks = checkLabelClaims(
      `${productName} ${categories}`,
      ingredientsRaw,
      nutrition,
      userPreferences?.diet || []
    );

    console.log(`[Scan] Product: "${productName}" | Allergens: ${detectedAllergenNames.join(', ') || 'none'} | Claims: ${claimChecks.length}`);

    // 4. AI verdict (Gemini) — now receives enriched summaries for better context
    const analysis = await analyzeFoodSafety(
      productName,
      ingredientsRaw,
      nutrition,
      userPreferences || {},
      detectedAllergenNames,
      additives,
      additiveRiskSummary,
      nutritionEnriched.overallNote
    );

    console.log(`[Scan] Verdict: ${analysis.verdict} (confidence: ${analysis.confidence})`);

    // 5. Persist to Neon DB (fire-and-forget, don't block response)
    const scannedAt = new Date().toISOString();
    Promise.all([
      db.insert(products).values({
        barcode,
        data: { name: productName, brand, image: imageUrl, ingredients: ingredientsRaw, nutrition, categories },
        updatedAt: new Date(),
      }).onConflictDoUpdate({
        target: products.barcode,
        set: {
          data: { name: productName, brand, image: imageUrl, ingredients: ingredientsRaw, nutrition, categories },
          updatedAt: new Date(),
        },
      }),
      db.insert(scans).values({
        barcode,
        productName,
        ingredientsRaw,
        safetyVerdict: analysis.verdict,
        safetyExplanation: analysis.verdict_reason,
        calories: nutrition.calories,
        allergensDetected: detectedAllergenNames,
        scannedAt: new Date(),
      }),
    ]).catch(err => console.error('[Scan] DB write failed (non-fatal):', err));

    return NextResponse.json({
      success: true,
      data: {
        source: 'barcode',
        product: {
          name: productName,
          brand,
          image: imageUrl,
          ingredients: ingredientsRaw,
          parsedIngredients: parsedIngredients.map(i => ({
            name: i.name,
            isENumber: i.isENumber,
            eCode: i.eCode,
          })),
          nutrition,
          categories,
        },
        allergenFlags,
        additives,
        additives_detailed: detailedAdditives,
        nutrition_enriched: nutritionEnriched,
        claimChecks,
        analysis,
        scannedAt,
      },
    });
  } catch (error: any) {
    console.error('[Scan] Error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Something went wrong. Please try again.' } },
      { status: 500 }
    );
  }
}
