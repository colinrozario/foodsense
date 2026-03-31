import { NextRequest, NextResponse } from 'next/server';
import { analyzeImageLabel } from '@/lib/gemini';
import { extractDates } from '@/lib/dateExtractor';
import { checkLabelClaims } from '@/lib/claimChecker';
import { db } from '@/db';
import { scans } from '@/db/schema';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('image') as File | null;
    const userPrefsRaw = formData.get('userPreferences') as string | null;
    const userPreferences = userPrefsRaw ? JSON.parse(userPrefsRaw) : {};

    if (!file) {
      return NextResponse.json(
        { success: false, error: { code: 'NO_IMAGE', message: 'No image file provided.' } },
        { status: 400 }
      );
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_FILE_TYPE', message: 'Please upload a JPEG, PNG, or WebP image.' } },
        { status: 400 }
      );
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: { code: 'FILE_TOO_LARGE', message: 'Image must be under 5MB.' } },
        { status: 413 }
      );
    }

    console.log(`[Label] Processing: ${file.name} (${(file.size / 1024).toFixed(1)}KB)`);

    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString('base64');

    // AI Vision: extract and analyze
    const { extractedText, ingredients, analysis } = await analyzeImageLabel(base64, file.type, userPreferences);

    if (!extractedText || extractedText.trim().length < 10) {
      return NextResponse.json(
        { success: false, error: { code: 'OCR_FAILED', message: 'Could not read the label. Try a clearer photo with better lighting.' } },
        { status: 400 }
      );
    }

    // Expiry Intelligence — run on extracted text
    const expiry = extractDates(extractedText);

    // Label Lie Detector — run on extracted text
    const claimChecks = checkLabelClaims(
      extractedText.substring(0, 500),
      ingredients,
      { calories: 0, sugar: 0, fat: 0, salt: 0 },
      userPreferences?.diet || []
    );

    console.log(`[Label] Verdict: ${analysis.verdict} | Expiry: ${expiry.status} | Claims: ${claimChecks.length}`);

    const scannedAt = new Date().toISOString();

    // Persist to Neon DB (fire-and-forget)
    db.insert(scans).values({
      barcode: null,
      productName: 'Scanned Product (Label)',
      ingredientsRaw: ingredients,
      safetyVerdict: analysis.verdict,
      safetyExplanation: analysis.verdict_reason,
      calories: 0,
      allergensDetected: analysis.flags
        .filter(f => f.type === 'allergen')
        .map(f => f.ingredient),
      scannedAt: new Date(),
    }).catch(err => console.error('[Label] DB write failed (non-fatal):', err));

    return NextResponse.json({
      success: true,
      data: {
        source: 'label',
        product: {
          name: 'Scanned Product',
          brand: '',
          image: null,
          ingredients,
          parsedIngredients: [],
          nutrition: { calories: 0, sugar: 0, fat: 0, salt: 0 },
          categories: '',
        },
        allergenFlags: analysis.flags
          .filter(f => f.type === 'allergen')
          .map(f => ({
            allergen: f.ingredient,
            matchedIngredients: [f.ingredient],
            severity: f.severity === 'high' ? 'high' : 'medium',
            isUserAllergen: f.severity === 'high',
          })),
        additives: [],
        claimChecks,
        expiry,
        analysis,
        scannedAt,
      },
    });
  } catch (error: any) {
    console.error('[Label] Error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Analysis failed. Please try again with a clearer image.' } },
      { status: 500 }
    );
  }
}
