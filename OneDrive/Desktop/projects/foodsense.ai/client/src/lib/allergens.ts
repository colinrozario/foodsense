// Allergen keyword dictionary - deterministic, no LLM needed
export const ALLERGEN_KEYWORDS: Record<string, string[]> = {
  Gluten: ['wheat', 'barley', 'rye', 'oats', 'spelt', 'gluten', 'flour', 'bread crumbs', 'semolina', 'triticale'],
  Dairy: ['milk', 'lactose', 'whey', 'casein', 'butter', 'cream', 'cheese', 'yogurt', 'lactalbumin', 'lactoglobulin'],
  Soy: ['soy', 'soya', 'soybean', 'soy lecithin', 'tofu', 'miso', 'tempeh', 'edamame'],
  'Tree Nuts': ['almond', 'cashew', 'walnut', 'hazelnut', 'pecan', 'pistachio', 'macadamia', 'brazil nut', 'pine nut'],
  Peanuts: ['peanut', 'groundnut', 'monkey nut', 'arachis oil'],
  Eggs: ['egg', 'albumen', 'ovalbumin', 'mayonnaise', 'meringue', 'lysozyme'],
  Fish: ['cod', 'salmon', 'tuna', 'anchovy', 'fish sauce', 'tilapia', 'bass', 'flounder', 'halibut', 'mahi', 'pollock'],
  Shellfish: ['shrimp', 'crab', 'lobster', 'prawn', 'shellfish', 'scallop', 'clam', 'oyster', 'mussel'],
  Sesame: ['sesame', 'tahini', 'sesame oil', 'sesame seed'],
  Milk: ['milk', 'lactose', 'dairy', 'whey', 'casein'],
  Wheat: ['wheat', 'flour', 'semolina', 'spelt', 'kamut', 'durum'],
};

// ─── Rich Additive Detail type ────────────────────────────────────────────────
export interface AdditiveDetail {
  code: string;
  name: string;
  category: string;
  risk: 'low' | 'medium' | 'high';
  /** One-sentence plain English summary */
  shortExplanation: string;
  healthEffects: string[];
  commonlyFoundIn: string[];
  bannedIn: string[];
  requiresWarningIn: string[];
}

// ─── Full additives database with rich detail ─────────────────────────────────
export const ADDITIVES_DB: Record<string, Omit<AdditiveDetail, 'code'>> = {
  E100: {
    name: 'Curcumin', category: 'colorant', risk: 'low',
    shortExplanation: 'Natural yellow dye derived from turmeric. No known health concerns at typical food doses.',
    healthEffects: [], commonlyFoundIn: ['curry powder', 'mustard', 'margarine'], bannedIn: [], requiresWarningIn: [],
  },
  E102: {
    name: 'Tartrazine', category: 'colorant', risk: 'medium',
    shortExplanation: 'Synthetic yellow dye linked to hyperactivity in children. Banned in several countries.',
    healthEffects: ['May cause hyperactivity in children', 'Potential trigger for aspirin-sensitive individuals'],
    commonlyFoundIn: ['fizzy drinks', 'sweets', 'instant noodles', 'cereals'],
    bannedIn: ['Norway', 'Austria', 'Finland'], requiresWarningIn: ['EU', 'UK'],
  },
  E104: {
    name: 'Quinoline Yellow', category: 'colorant', risk: 'medium',
    shortExplanation: 'Synthetic dye. Part of Southampton Six colourings linked to hyperactivity.',
    healthEffects: ['May worsen hyperactivity in children'],
    commonlyFoundIn: ['smoked haddock', 'scotch eggs', 'ices'], bannedIn: ['USA', 'Japan', 'Australia'], requiresWarningIn: ['EU', 'UK'],
  },
  E110: {
    name: 'Sunset Yellow FCF', category: 'colorant', risk: 'medium',
    shortExplanation: "Synthetic orange-yellow dye. One of the 'Southampton Six' colorants linked to hyperactivity.",
    healthEffects: ['Linked to hyperactivity in children', 'May cause urticaria in sensitive individuals'],
    commonlyFoundIn: ['orange squash', 'apricot jam', 'lollipops'],
    bannedIn: ['Norway', 'Finland'], requiresWarningIn: ['EU', 'UK'],
  },
  E120: {
    name: 'Cochineal / Carmine', category: 'colorant', risk: 'medium',
    shortExplanation: 'Red dye made from crushed cochineal insects. Not vegan or vegetarian. Can cause severe allergic reactions.',
    healthEffects: ['Severe allergic reactions reported', 'Anaphylaxis in rare cases'],
    commonlyFoundIn: ['yoghurts', 'juices', 'sweets', 'cosmetics'], bannedIn: [], requiresWarningIn: ['EU (must declare on label)'],
  },
  E122: {
    name: 'Carmoisine', category: 'colorant', risk: 'medium',
    shortExplanation: 'Synthetic red/purple dye. Part of Southampton Six. Banned in some countries.',
    healthEffects: ['Linked to hyperactivity in children'],
    commonlyFoundIn: ['sweets', 'jellies', 'fizzy drinks'], bannedIn: ['USA', 'Japan', 'Sweden'], requiresWarningIn: ['EU', 'UK'],
  },
  E123: {
    name: 'Amaranth', category: 'colorant', risk: 'medium',
    shortExplanation: 'Synthetic red dye banned in the US since 1976 due to carcinogenicity concerns in animal studies.',
    healthEffects: ['Possible carcinogen at high doses (animal studies)'],
    commonlyFoundIn: ['fish roe', 'some sweets'], bannedIn: ['USA'], requiresWarningIn: ['EU', 'UK'],
  },
  E124: {
    name: 'Ponceau 4R', category: 'colorant', risk: 'medium',
    shortExplanation: 'Synthetic red dye. Southampton Six. May cause hyperactivity.',
    healthEffects: ['Linked to hyperactivity in children'],
    commonlyFoundIn: ['dessert mixes', 'cerises', 'glacé cherries'], bannedIn: ['USA', 'Norway'], requiresWarningIn: ['EU', 'UK'],
  },
  E129: {
    name: 'Allura Red AC', category: 'colorant', risk: 'medium',
    shortExplanation: "Synthetic red dye. Part of the Southampton Six. EU requires a hyperactivity warning.",
    healthEffects: ['Linked to hyperactivity in children'],
    commonlyFoundIn: ['sports drinks', 'sweets', 'sauces'],
    bannedIn: ['Denmark', 'Belgium', 'France', 'Switzerland'], requiresWarningIn: ['EU', 'UK'],
  },
  E133: {
    name: 'Brilliant Blue FCF', category: 'colorant', risk: 'low',
    shortExplanation: 'Synthetic blue dye. Generally considered safe at approved levels.',
    healthEffects: [], commonlyFoundIn: ['ice cream', 'sweets', 'sports drinks'],
    bannedIn: ['Belgium', 'France', 'Germany', 'Switzerland'], requiresWarningIn: [],
  },
  E150: {
    name: 'Caramel', category: 'colorant', risk: 'low',
    shortExplanation: 'Widely used brown food colouring made by heating sugars. Generally safe.',
    healthEffects: [], commonlyFoundIn: ['cola drinks', 'beer', 'soy sauce', 'bread'], bannedIn: [], requiresWarningIn: [],
  },
  E160: {
    name: 'Carotenoids', category: 'colorant', risk: 'low',
    shortExplanation: 'Natural pigments from plants. Includes beta-carotene. No known health concerns.',
    healthEffects: [], commonlyFoundIn: ['margarine', 'cheese', 'juices'], bannedIn: [], requiresWarningIn: [],
  },
  E200: {
    name: 'Sorbic Acid', category: 'preservative', risk: 'low',
    shortExplanation: 'Naturally occurring preservative. Inhibits mould and yeast. Well tolerated by most people.',
    healthEffects: [], commonlyFoundIn: ['cheese', 'wine', 'baked goods', 'dried fruit'], bannedIn: [], requiresWarningIn: [],
  },
  E202: {
    name: 'Potassium Sorbate', category: 'preservative', risk: 'low',
    shortExplanation: 'Salt form of sorbic acid. Widely used and generally recognised as safe.',
    healthEffects: ['May cause mild skin irritation in sensitive individuals'],
    commonlyFoundIn: ['cheese', 'yoghurt', 'wine', 'fruit drinks'], bannedIn: [], requiresWarningIn: [],
  },
  E210: {
    name: 'Benzoic Acid', category: 'preservative', risk: 'medium',
    shortExplanation: 'Preservative that prevents bacterial growth. Can form benzene (a carcinogen) when combined with Vitamin C.',
    healthEffects: ['May form carcinogenic benzene with ascorbic acid (Vitamin C)', 'Can trigger asthma symptoms'],
    commonlyFoundIn: ['fizzy drinks', 'pickles', 'salad dressings'], bannedIn: [], requiresWarningIn: [],
  },
  E211: {
    name: 'Sodium Benzoate', category: 'preservative', risk: 'medium',
    shortExplanation: 'A preservative that prevents mould and bacteria. Reacts with Vitamin C to potentially form benzene.',
    healthEffects: ['Potential hyperactivity link in children', 'May form carcinogenic benzene with ascorbic acid'],
    commonlyFoundIn: ['fizzy drinks', 'fruit juices', 'pickles', 'soy sauce'],
    bannedIn: [], requiresWarningIn: ['EU (when combined with certain azo colorants)'],
  },
  E220: {
    name: 'Sulphur Dioxide', category: 'preservative', risk: 'medium',
    shortExplanation: 'Gas used as a preservative and antioxidant. Must be declared on labels if above 10mg/kg. Can trigger asthma.',
    healthEffects: ['Can trigger asthma attacks', 'May cause headaches in sensitive individuals'],
    commonlyFoundIn: ['wine', 'dried fruit', 'fruit juices', 'beer'],
    bannedIn: [], requiresWarningIn: ['EU', 'UK', 'US (above threshold)'],
  },
  E249: {
    name: 'Potassium Nitrite', category: 'preservative', risk: 'high',
    shortExplanation: 'Curing agent used in processed meats. Can form nitrosamines which are classified as probable carcinogens.',
    healthEffects: ['Forms nitrosamines — probable carcinogens', 'WHO classifies processed meats using nitrites as Group 1 carcinogen'],
    commonlyFoundIn: ['cured meats', 'hot dogs', 'bacon', 'ham'], bannedIn: [], requiresWarningIn: [],
  },
  E250: {
    name: 'Sodium Nitrite', category: 'preservative', risk: 'high',
    shortExplanation: 'Used to cure and colour processed meats. Linked to colorectal cancer at high intake. WHO Group 1 carcinogen context.',
    healthEffects: ['Linked to colorectal cancer via nitrosamine formation', 'Methemoglobinemia risk in infants'],
    commonlyFoundIn: ['bacon', 'salami', 'hot dogs', 'deli meats', 'smoked fish'], bannedIn: [], requiresWarningIn: [],
  },
  E251: {
    name: 'Sodium Nitrate', category: 'preservative', risk: 'high',
    shortExplanation: 'Similar risks to sodium nitrite. Used in cured and processed meats.',
    healthEffects: ['Converts to nitrite during digestion — cancer risk at high intake'],
    commonlyFoundIn: ['cured meats', 'salami', 'ham'], bannedIn: [], requiresWarningIn: [],
  },
  E282: {
    name: 'Calcium Propionate', category: 'preservative', risk: 'low',
    shortExplanation: 'Mould inhibitor commonly used in bread. Some research links it to irritability in children.',
    healthEffects: ['Some evidence of behavioural effects in children at high doses'],
    commonlyFoundIn: ['bread', 'bakery products', 'pizza bases'], bannedIn: [], requiresWarningIn: [],
  },
  E320: {
    name: 'BHA (Butylated Hydroxyanisole)', category: 'antioxidant', risk: 'medium',
    shortExplanation: 'Synthetic antioxidant that prevents fats from going rancid. Classified as a possible carcinogen by IARC.',
    healthEffects: ['IARC Group 2B: possibly carcinogenic to humans', 'Endocrine disruption concerns'],
    commonlyFoundIn: ['crisps', 'butter', 'cereals', 'instant noodles'], bannedIn: ['Japan'], requiresWarningIn: [],
  },
  E321: {
    name: 'BHT (Butylated Hydroxytoluene)', category: 'antioxidant', risk: 'medium',
    shortExplanation: 'Synthetic antioxidant used to prevent oxidation in fats and oils. Associated with thyroid disruption at high doses.',
    healthEffects: ['Potential endocrine disruptor', 'Some evidence of carcinogenicity in animals at high doses'],
    commonlyFoundIn: ['cereals', 'crisps', 'frozen foods', 'beer'], bannedIn: [], requiresWarningIn: [],
  },
  E322: {
    name: 'Lecithin', category: 'emulsifier', risk: 'low',
    shortExplanation: 'Natural emulsifier often derived from soy or sunflower. Generally safe, but may trigger reactions in severe soy allergy sufferers.',
    healthEffects: ['Mild soy allergy risk if soy-derived'],
    commonlyFoundIn: ['chocolate', 'baked goods', 'margarine', 'infant formula'],
    bannedIn: [], requiresWarningIn: ['Must declare source (soy/sunflower) in EU if soy-derived'],
  },
  E330: {
    name: 'Citric Acid', category: 'acidity_regulator', risk: 'low',
    shortExplanation: 'Naturally occurring acid found in citrus fruit. Widely used as a preservative and flavour enhancer. Very well tolerated.',
    healthEffects: [], commonlyFoundIn: ['fizzy drinks', 'sweets', 'jams', 'tinned foods'], bannedIn: [], requiresWarningIn: [],
  },
  E407: {
    name: 'Carrageenan', category: 'thickener', risk: 'medium',
    shortExplanation: 'Seaweed-derived thickener. Some evidence of gut inflammation in degraded form (poligeenan), but food-grade is generally considered safe.',
    healthEffects: ['Possible gut inflammation in sensitive individuals'],
    commonlyFoundIn: ['dairy alternatives', 'infant formula', 'deli meats'], bannedIn: [], requiresWarningIn: [],
  },
  E412: {
    name: 'Guar Gum', category: 'thickener', risk: 'low',
    shortExplanation: 'Natural thickener derived from guar beans. High doses may cause digestive discomfort.',
    healthEffects: ['Bloating and flatulence at high doses'],
    commonlyFoundIn: ['ice cream', 'sauces', 'gluten-free products'], bannedIn: [], requiresWarningIn: [],
  },
  E415: {
    name: 'Xanthan Gum', category: 'thickener', risk: 'low',
    shortExplanation: 'Fermented thickener widely used in gluten-free foods. Safe for most people. May cause bloating.',
    healthEffects: ['Digestive discomfort in large amounts'],
    commonlyFoundIn: ['salad dressings', 'gluten-free baked goods', 'sauces'], bannedIn: [], requiresWarningIn: [],
  },
  E420: {
    name: 'Sorbitol', category: 'sweetener', risk: 'low',
    shortExplanation: 'Sugar alcohol used as a humectant and sweetener. Laxative effects at doses above 50g/day.',
    healthEffects: ['Laxative effect at high doses'],
    commonlyFoundIn: ['sugar-free sweets', 'chewing gum', 'dried fruit'], bannedIn: [], requiresWarningIn: [],
  },
  E421: {
    name: 'Mannitol', category: 'sweetener', risk: 'medium',
    shortExplanation: 'Sugar alcohol used as a sweetener. Laxative effect at high doses. Not recommended for IBS sufferers.',
    healthEffects: ['Laxative effect at high doses', 'Digestive discomfort in IBS sufferers'],
    commonlyFoundIn: ['chewing gum', 'dietetic foods'], bannedIn: [], requiresWarningIn: [],
  },
  E450: {
    name: 'Diphosphates', category: 'raising_agent', risk: 'low',
    shortExplanation: 'Phosphate salts used as leavening and water retention agents. High phosphate intake is a concern for kidney patients.',
    healthEffects: ['High phosphate diet linked to reduced kidney function'],
    commonlyFoundIn: ['processed cheese', 'cured meats', 'baking powder'], bannedIn: [], requiresWarningIn: [],
  },
  E471: {
    name: 'Mono- and Diglycerides of Fatty Acids', category: 'emulsifier', risk: 'low',
    shortExplanation: 'Emulsifiers derived from fats. May contain traces of trans fats. Typically animal or vegetable origin — not always vegan.',
    healthEffects: ['May contain trace trans fats'],
    commonlyFoundIn: ['bread', 'cake', 'margarine', 'ice cream'], bannedIn: [], requiresWarningIn: [],
  },
  E476: {
    name: 'Polyglycerol Polyricinoleate (PGPR)', category: 'emulsifier', risk: 'low',
    shortExplanation: 'Emulsifier often used in chocolate as a cheaper alternative to cocoa butter. Generally considered safe.',
    healthEffects: [],
    commonlyFoundIn: ['chocolate', 'chocolate-flavoured products'], bannedIn: [], requiresWarningIn: [],
  },
  E500: {
    name: 'Sodium Carbonates (Baking Soda)', category: 'raising_agent', risk: 'low',
    shortExplanation: 'Common raising agent. Sodium bicarbonate (E500ii) is baking soda. Safe for most people.',
    healthEffects: [], commonlyFoundIn: ['baked goods', 'biscuits', 'crackers'], bannedIn: [], requiresWarningIn: [],
  },
  E503: {
    name: 'Ammonium Carbonates', category: 'raising_agent', risk: 'low',
    shortExplanation: 'Leavening agents used in baked goods. Release ammonia gas during baking — safe in finished products.',
    healthEffects: [], commonlyFoundIn: ['biscuits', 'crackers', 'baked goods'], bannedIn: [], requiresWarningIn: [],
  },
  E621: {
    name: 'Monosodium Glutamate (MSG)', category: 'flavour_enhancer', risk: 'low',
    shortExplanation: "Flavour enhancer that amplifies savoury taste. Considered safe by all major food regulators. 'Chinese Restaurant Syndrome' is not supported by clinical evidence.",
    healthEffects: ["Self-reported sensitivity in rare individuals — not confirmed in double-blind studies"],
    commonlyFoundIn: ['instant noodles', 'crisps', 'processed meats', 'fast food'], bannedIn: [], requiresWarningIn: [],
  },
  E627: {
    name: 'Disodium Guanylate', category: 'flavour_enhancer', risk: 'low',
    shortExplanation: 'Flavour enhancer often used alongside MSG. May be derived from fish or yeast — not always vegan.',
    healthEffects: ['Gout sufferers should avoid — high in purines'],
    commonlyFoundIn: ['instant soups', 'crisps', 'seasonings'], bannedIn: [], requiresWarningIn: [],
  },
  E631: {
    name: 'Disodium Inosinate', category: 'flavour_enhancer', risk: 'low',
    shortExplanation: 'Flavour enhancer derived from meat or fish. Not suitable for vegetarians or vegans. Often used with MSG.',
    healthEffects: ['Gout sufferers should avoid'],
    commonlyFoundIn: ['instant noodles', 'crisps', 'seasonings'], bannedIn: [], requiresWarningIn: [],
  },
  E951: {
    name: 'Aspartame', category: 'sweetener', risk: 'medium',
    shortExplanation: 'Artificial sweetener 200x sweeter than sugar. Must be avoided by people with phenylketonuria (PKU). IARC classified as possibly carcinogenic in 2023.',
    healthEffects: ['Must not be consumed by people with PKU', 'IARC Group 2B: possibly carcinogenic (2023) — evidence remains limited'],
    commonlyFoundIn: ['diet drinks', 'sugar-free chewing gum', 'low-calorie desserts'],
    bannedIn: [], requiresWarningIn: ["EU/UK: must display 'contains a source of phenylalanine'"],
  },
  E952: {
    name: 'Cyclamates', category: 'sweetener', risk: 'medium',
    shortExplanation: 'Artificial sweetener banned in the US since 1969 over cancer concerns. Still permitted in EU at restricted levels.',
    healthEffects: ['Possible carcinogen (animal studies) — banned in US'],
    commonlyFoundIn: ['diet drinks', 'tabletop sweeteners'], bannedIn: ['USA'], requiresWarningIn: [],
  },
  E954: {
    name: 'Saccharin', category: 'sweetener', risk: 'low',
    shortExplanation: 'One of the oldest artificial sweeteners. Previously suspected carcinogen — current evidence does not support this at normal intake levels.',
    healthEffects: [], commonlyFoundIn: ['diet drinks', 'tabletop sweeteners', 'some medicines'], bannedIn: [], requiresWarningIn: [],
  },
  E955: {
    name: 'Sucralose', category: 'sweetener', risk: 'low',
    shortExplanation: 'Chlorinated sugar derivative. Very high sweetening power. No calories. Recent research suggests possible gut microbiome disruption at high doses.',
    healthEffects: ['Emerging evidence of gut microbiome disruption at high doses'],
    commonlyFoundIn: ['diet drinks', 'protein bars', 'low-sugar baked goods'], bannedIn: [], requiresWarningIn: [],
  },
  E960: {
    name: 'Steviol Glycosides (Stevia)', category: 'sweetener', risk: 'low',
    shortExplanation: 'Natural sweetener extracted from the stevia plant. Well tolerated and generally regarded as safe.',
    healthEffects: [], commonlyFoundIn: ['diet drinks', 'yoghurts', 'baked goods'], bannedIn: [], requiresWarningIn: [],
  },
  E967: {
    name: 'Xylitol', category: 'sweetener', risk: 'low',
    shortExplanation: 'Sugar alcohol with dental health benefits. Laxative at high doses. Toxic to dogs.',
    healthEffects: ['Laxative effect at high doses (>50g/day)', 'Toxic to dogs — keep away from pets'],
    commonlyFoundIn: ['chewing gum', 'mints', 'some baked goods'], bannedIn: [], requiresWarningIn: [],
  },
};

// ─── Legacy simple format (kept for backward compat with VerdictCard's existing additives prop) ─
export const E_NUMBER_ADDITIVES: Record<string, { name: string; type: string; risk: 'low' | 'medium' | 'high'; notes?: string }> = 
  Object.fromEntries(
    Object.entries(ADDITIVES_DB).map(([code, d]) => [
      code,
      {
        name: d.name,
        type: d.category,
        risk: d.risk,
        notes: d.healthEffects[0],
      }
    ])
  );

export interface ParsedIngredient {
  name: string;
  normalised: string;
  isENumber: boolean;
  eCode?: string;
  additive?: typeof E_NUMBER_ADDITIVES[string];
}

export interface AllergenFlag {
  allergen: string;
  matchedIngredients: string[];
  severity: 'high' | 'medium';
  isUserAllergen: boolean;
}

export function parseIngredients(rawText: string): ParsedIngredient[] {
  if (!rawText || rawText.trim() === '') return [];

  // Remove content in brackets (sub-ingredients)
  let cleaned = rawText.replace(/\([^)]*\)/g, '');
  // Normalize separators
  cleaned = cleaned.replace(/;/g, ',');
  
  const tokens = cleaned
    .split(',')
    .map(s => s.replace(/[*_[\]]/g, '').trim())
    .filter(s => s.length > 1);

  return tokens.map(token => {
    const normalised = token.toLowerCase().trim();
    // Check for E-number pattern
    const eMatch = normalised.match(/e\s*(\d{3,4}[a-z]?)/i);
    if (eMatch) {
      const eCode = `E${eMatch[1].toUpperCase()}`;
      const additive = E_NUMBER_ADDITIVES[eCode];
      return { name: token, normalised, isENumber: true, eCode, additive };
    }
    return { name: token, normalised, isENumber: false };
  });
}

export function detectAllergens(
  ingredients: ParsedIngredient[],
  userAllergens: string[] = []
): AllergenFlag[] {
  const flags: AllergenFlag[] = [];
  const userAllergenLower = userAllergens.map(a => a.toLowerCase());

  for (const [allergen, keywords] of Object.entries(ALLERGEN_KEYWORDS)) {
    const matched = ingredients
      .filter(ing => keywords.some(kw => ing.normalised.includes(kw)))
      .map(ing => ing.name);

    if (matched.length > 0) {
      const isUserAllergen = userAllergenLower.some(
        ua => allergen.toLowerCase().includes(ua) || ua.includes(allergen.toLowerCase())
      );

      flags.push({
        allergen,
        matchedIngredients: matched,
        severity: isUserAllergen ? 'high' : 'medium',
        isUserAllergen,
      });
    }
  }

  return flags;
}

/** Returns simple additive objects (backward compat) */
export function getAdditives(ingredients: ParsedIngredient[]) {
  return ingredients
    .filter(i => i.isENumber && i.additive)
    .map(i => ({ code: i.eCode!, ...i.additive! }));
}

/** Returns richly detailed AdditiveDetail objects for the new AdditivesPanel */
export function getDetailedAdditives(ingredients: ParsedIngredient[]): AdditiveDetail[] {
  const seen = new Set<string>();
  const results: AdditiveDetail[] = [];

  for (const i of ingredients) {
    if (!i.isENumber || !i.eCode) continue;
    const code = i.eCode;
    if (seen.has(code)) continue;
    seen.add(code);

    const data = ADDITIVES_DB[code];
    if (data) {
      results.push({ code, ...data });
    }
  }

  return results;
}

/** One-sentence summary of detected additive risk profile — injected into the LLM prompt */
export function getAdditiveRiskSummary(additives: AdditiveDetail[]): string {
  if (!additives.length) return 'No recognised additives detected.';

  const high = additives.filter(a => a.risk === 'high');
  const medium = additives.filter(a => a.risk === 'medium');

  if (high.length) {
    const names = high.map(a => `${a.code} (${a.name})`).join(', ');
    return `${high.length} high-risk additive(s) detected: ${names}. These have significant health concerns at regular intake.`;
  }
  if (medium.length) {
    const names = medium.map(a => `${a.code} (${a.name})`).join(', ');
    return `${medium.length} medium-risk additive(s) detected: ${names}. Worth being aware of, especially for sensitive individuals.`;
  }
  return `${additives.length} additive(s) detected — all considered low risk at typical intake levels.`;
}
