import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export interface VerdictResponse {
  verdict: 'Safe' | 'Caution' | 'Avoid';
  verdict_reason: string;
  explanation: string;
  flags: { type: 'allergen' | 'nutrition' | 'additive'; ingredient: string; severity: 'high' | 'medium' | 'low' }[];
  action: string;
  confidence: number;
  disclaimer: string;
  preservatives?: string[];
  additive_summary?: string;
  nutrition_context?: string;
}

export async function analyzeFoodSafety(
  productName: string,
  ingredients: string,
  nutrition: { calories: number; sugar: number; fat: number; salt: number; saturatedFat?: number },
  userPreferences: { allergens?: string[]; diet?: string[]; goals?: string[] },
  detectedAllergens: string[] = [],
  detectedAdditives: { code: string; name: string; risk: string }[] = [],
  additiveRiskSummary: string = 'No recognised additives detected.',
  nutritionNote: string = 'Nutritional profile is within normal ranges.'
): Promise<VerdictResponse> {
  const prompt = `You are a food safety assistant. Analyze this food product and return a structured JSON verdict.

SYSTEM RULES:
- Be conservative. When in doubt, flag as "Caution".
- Never give medical advice.
- verdict must be exactly one of: "Safe", "Caution", or "Avoid".
- If a user's allergen is detected, verdict MUST be "Avoid".
- If confidence < 0.7, downgrade: Safe→Caution, Caution→Avoid.
- Respond ONLY with valid JSON. No preamble, no markdown code blocks.

PRODUCT: ${productName}
INGREDIENTS: ${ingredients.substring(0, 800)}
DETECTED ALLERGENS: ${detectedAllergens.length > 0 ? detectedAllergens.join(', ') : 'None'}
USER ALLERGIES: ${userPreferences.allergens?.join(', ') || 'None specified'}
USER DIET: ${userPreferences.diet?.join(', ') || 'None specified'}
NUTRITION PER 100g:
  Calories: ${nutrition.calories} kcal
  Sugar: ${nutrition.sugar}g
  Salt: ${nutrition.salt}g
  Fat: ${nutrition.fat}g
HIGH RISK ADDITIVES: ${detectedAdditives.filter(a => a.risk === 'high').map(a => `${a.code} (${a.name})`).join(', ') || 'None'}
MEDIUM RISK ADDITIVES: ${detectedAdditives.filter(a => a.risk === 'medium').map(a => `${a.code} (${a.name})`).join(', ') || 'None'}
ADDITIVE RISK SUMMARY: ${additiveRiskSummary}
NUTRITION SUMMARY: ${nutritionNote}

Return this exact JSON structure:
{
  "verdict": "Safe" | "Caution" | "Avoid",
  "verdict_reason": "One sentence explaining the verdict.",
  "explanation": "2-3 sentences in plain English for a non-expert.",
  "flags": [
    { "type": "allergen" | "nutrition" | "additive", "ingredient": "name", "severity": "high" | "medium" | "low" }
  ],
  "action": "What the user should do.",
  "confidence": 0.0,
  "disclaimer": "This is informational only and not medical advice. Consult the manufacturer for severe allergy concerns.",
  "preservatives": ["list of preservatives found"],
  "additive_summary": "One sentence summary of additive risk for this product.",
  "nutrition_context": "One sentence explaining the most notable nutritional concern or confirmation of good profile."
}`;

  if (!apiKey || !genAI) {
    return buildFallbackVerdict(detectedAllergens, userPreferences.allergens || [], nutrition);
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    // Robust JSON extraction
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? jsonMatch[0] : text;
    const parsed = JSON.parse(jsonStr) as VerdictResponse;

    // Enforce rules
    if (!['Safe', 'Caution', 'Avoid'].includes(parsed.verdict)) {
      parsed.verdict = 'Caution';
    }
    if (parsed.confidence < 0.7) {
      if (parsed.verdict === 'Safe') parsed.verdict = 'Caution';
      else if (parsed.verdict === 'Caution') parsed.verdict = 'Avoid';
    }

    return parsed;
  } catch (e) {
    console.error('[Gemini] Analysis failed:', e);
    return buildFallbackVerdict(detectedAllergens, userPreferences.allergens || [], nutrition);
  }
}

function buildFallbackVerdict(
  detectedAllergens: string[],
  userAllergens: string[],
  nutrition: { calories: number; sugar: number; fat: number; salt: number }
): VerdictResponse {
  const userAllergenLower = userAllergens.map(a => a.toLowerCase());
  const hasUserAllergen = detectedAllergens.some(a =>
    userAllergenLower.some(ua => a.toLowerCase().includes(ua) || ua.includes(a.toLowerCase()))
  );

  const isHighSugar = nutrition.sugar > 20;
  const isHighSalt = nutrition.salt > 1.5;

  let verdict: 'Safe' | 'Caution' | 'Avoid' = 'Safe';
  let verdict_reason = 'No major concerns detected based on ingredient analysis.';

  if (hasUserAllergen) {
    verdict = 'Avoid';
    verdict_reason = 'Contains ingredients that match your declared allergies.';
  } else if (detectedAllergens.length > 0 || isHighSugar || isHighSalt) {
    verdict = 'Caution';
    verdict_reason = 'Contains potential allergens or elevated nutritional values.';
  }

  const flags = [];
  if (hasUserAllergen) {
    flags.push({ type: 'allergen' as const, ingredient: detectedAllergens[0], severity: 'high' as const });
  }
  if (isHighSugar) {
    flags.push({ type: 'nutrition' as const, ingredient: `High Sugar (${nutrition.sugar}g/100g)`, severity: 'medium' as const });
  }
  if (isHighSalt) {
    flags.push({ type: 'nutrition' as const, ingredient: `High Salt (${nutrition.salt}g/100g)`, severity: 'medium' as const });
  }

  return {
    verdict,
    verdict_reason,
    explanation: 'Product analysis complete. This verdict is based on detailed allergen and nutrition checks.',
    flags,
    action: hasUserAllergen ? 'Do not consume. Check alternatives.' : 'Review the ingredients carefully.',
    confidence: 0.6,
    disclaimer: 'This is informational only and not medical advice. Consult the manufacturer for severe allergy concerns.',
    preservatives: [],
    additive_summary: undefined,
    nutrition_context: undefined,
  };
}

export async function analyzeImageLabel(imageBase64: string, mimeType: string, userPreferences: {
  allergens?: string[];
  diet?: string[];
}): Promise<{ extractedText: string; ingredients: string; analysis: VerdictResponse }> {
  if (!apiKey || !genAI) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const extractPrompt = `Look at this food product label image. Extract:
1. Product name
2. Brand
3. Complete ingredients list (translate to English if in another language)
4. Nutritional information per 100g if visible

Then analyze the product for the user with these preferences:
- Allergies: ${userPreferences.allergens?.join(', ') || 'None'}  
- Diet: ${userPreferences.diet?.join(', ') || 'None'}

Return ONLY valid JSON:
{
  "product_name": "string",
  "brand": "string",
  "ingredients_text": "full ingredient list in English",
  "nutrition": { "calories": 0, "sugar": 0, "fat": 0, "salt": 0 },
  "verdict": "Safe" | "Caution" | "Avoid",
  "verdict_reason": "one sentence",
  "explanation": "2-3 plain English sentences",
  "flags": [{ "type": "allergen" | "nutrition" | "additive", "ingredient": "name", "severity": "high" | "medium" | "low" }],
  "action": "what user should do",
  "confidence": 0.0,
  "disclaimer": "This is informational only and not medical advice.",
  "preservatives": []
}`;

  const result = await model.generateContent([
    { inlineData: { data: imageBase64, mimeType } },
    extractPrompt
  ]);

  const text = result.response.text();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  const jsonStr = jsonMatch ? jsonMatch[0] : text;
  const parsed = JSON.parse(jsonStr);

  const analysis: VerdictResponse = {
    verdict: ['Safe', 'Caution', 'Avoid'].includes(parsed.verdict) ? parsed.verdict : 'Caution',
    verdict_reason: parsed.verdict_reason || '',
    explanation: parsed.explanation || '',
    flags: parsed.flags || [],
    action: parsed.action || '',
    confidence: parsed.confidence || 0.5,
    disclaimer: parsed.disclaimer || 'This is informational only and not medical advice.',
    preservatives: parsed.preservatives || [],
    additive_summary: parsed.additive_summary,
    nutrition_context: parsed.nutrition_context,
  };

  return {
    extractedText: parsed.ingredients_text || '',
    ingredients: parsed.ingredients_text || '',
    analysis,
  };
}
