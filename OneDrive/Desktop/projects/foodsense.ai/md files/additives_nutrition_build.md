# Build Instructions — Additives, E-Numbers & Nutrition Panel
> Feed these steps into your editor one at a time. Complete and verify each before moving to the next.

---

## STEP 1 — Expand the additives data file

Open `backend/data/additives.json` and replace its contents entirely with this:

```json
{
  "E100": {
    "name": "Curcumin",
    "category": "colorant",
    "risk_level": "low",
    "short_explanation": "Natural yellow dye derived from turmeric. No known health concerns at typical food doses.",
    "health_effects": [],
    "commonly_found_in": ["curry powder", "mustard", "margarine"],
    "banned_in": [],
    "requires_warning_in": []
  },
  "E102": {
    "name": "Tartrazine",
    "category": "colorant",
    "risk_level": "medium",
    "short_explanation": "Synthetic yellow dye linked to hyperactivity in children. Banned in several countries.",
    "health_effects": ["May cause hyperactivity in children", "Potential trigger for aspirin-sensitive individuals"],
    "commonly_found_in": ["fizzy drinks", "sweets", "instant noodles", "cereals"],
    "banned_in": ["Norway", "Austria", "Finland"],
    "requires_warning_in": ["EU", "UK"]
  },
  "E110": {
    "name": "Sunset Yellow FCF",
    "category": "colorant",
    "risk_level": "medium",
    "short_explanation": "Synthetic orange-yellow dye. One of the 'Southampton Six' colorants linked to hyperactivity.",
    "health_effects": ["Linked to hyperactivity in children", "May cause urticaria in sensitive individuals"],
    "commonly_found_in": ["orange squash", "apricot jam", "lollipops"],
    "banned_in": ["Norway", "Finland"],
    "requires_warning_in": ["EU", "UK"]
  },
  "E120": {
    "name": "Cochineal / Carmine",
    "category": "colorant",
    "risk_level": "medium",
    "short_explanation": "Red dye made from crushed cochineal insects. Not vegan or vegetarian. Can cause severe allergic reactions.",
    "health_effects": ["Severe allergic reactions reported", "Anaphylaxis in rare cases"],
    "commonly_found_in": ["yoghurts", "juices", "sweets", "cosmetics"],
    "banned_in": [],
    "requires_warning_in": ["EU (must declare on label)"]
  },
  "E129": {
    "name": "Allura Red AC",
    "category": "colorant",
    "risk_level": "medium",
    "short_explanation": "Synthetic red dye. Part of the Southampton Six. EU requires a hyperactivity warning.",
    "health_effects": ["Linked to hyperactivity in children"],
    "commonly_found_in": ["sports drinks", "sweets", "sauces"],
    "banned_in": ["Denmark", "Belgium", "France", "Switzerland"],
    "requires_warning_in": ["EU", "UK"]
  },
  "E133": {
    "name": "Brilliant Blue FCF",
    "category": "colorant",
    "risk_level": "low",
    "short_explanation": "Synthetic blue dye. Generally considered safe at approved levels.",
    "health_effects": [],
    "commonly_found_in": ["ice cream", "sweets", "sports drinks"],
    "banned_in": ["Belgium", "France", "Germany", "Switzerland"],
    "requires_warning_in": []
  },
  "E200": {
    "name": "Sorbic Acid",
    "category": "preservative",
    "risk_level": "low",
    "short_explanation": "Naturally occurring preservative. Inhibits mould and yeast. Well tolerated by most people.",
    "health_effects": [],
    "commonly_found_in": ["cheese", "wine", "baked goods", "dried fruit"],
    "banned_in": [],
    "requires_warning_in": []
  },
  "E202": {
    "name": "Potassium Sorbate",
    "category": "preservative",
    "risk_level": "low",
    "short_explanation": "Salt form of sorbic acid. Widely used and generally recognised as safe.",
    "health_effects": ["May cause mild skin irritation in sensitive individuals"],
    "commonly_found_in": ["cheese", "yoghurt", "wine", "fruit drinks"],
    "banned_in": [],
    "requires_warning_in": []
  },
  "E210": {
    "name": "Benzoic Acid",
    "category": "preservative",
    "risk_level": "medium",
    "short_explanation": "Preservative that prevents bacterial growth. Can form benzene (a carcinogen) when combined with Vitamin C.",
    "health_effects": ["May form carcinogenic benzene with ascorbic acid (Vitamin C)", "Can trigger asthma symptoms"],
    "commonly_found_in": ["fizzy drinks", "pickles", "salad dressings"],
    "banned_in": [],
    "requires_warning_in": []
  },
  "E211": {
    "name": "Sodium Benzoate",
    "category": "preservative",
    "risk_level": "medium",
    "short_explanation": "A preservative that prevents mould and bacteria. Reacts with Vitamin C to potentially form benzene.",
    "health_effects": ["Potential hyperactivity link in children", "May form carcinogenic benzene with ascorbic acid"],
    "commonly_found_in": ["fizzy drinks", "fruit juices", "pickles", "soy sauce"],
    "banned_in": [],
    "requires_warning_in": ["EU (when combined with certain azo colorants)"]
  },
  "E220": {
    "name": "Sulphur Dioxide",
    "category": "preservative",
    "risk_level": "medium",
    "short_explanation": "Gas used as a preservative and antioxidant. Must be declared on labels if above 10mg/kg. Can trigger asthma.",
    "health_effects": ["Can trigger asthma attacks", "May cause headaches in sensitive individuals"],
    "commonly_found_in": ["wine", "dried fruit", "fruit juices", "beer"],
    "banned_in": [],
    "requires_warning_in": ["EU", "UK", "US (above threshold)"]
  },
  "E249": {
    "name": "Potassium Nitrite",
    "category": "preservative",
    "risk_level": "high",
    "short_explanation": "Curing agent used in processed meats. Can form nitrosamines which are classified as probable carcinogens.",
    "health_effects": ["Forms nitrosamines — probable carcinogens", "WHO classifies processed meats using nitrites as Group 1 carcinogen"],
    "commonly_found_in": ["cured meats", "hot dogs", "bacon", "ham"],
    "banned_in": [],
    "requires_warning_in": []
  },
  "E250": {
    "name": "Sodium Nitrite",
    "category": "preservative",
    "risk_level": "high",
    "short_explanation": "Used to cure and colour processed meats. Linked to colorectal cancer at high intake levels. WHO Group 1 carcinogen context.",
    "health_effects": ["Linked to colorectal cancer via nitrosamine formation", "Methemoglobinemia risk in infants"],
    "commonly_found_in": ["bacon", "salami", "hot dogs", "deli meats", "smoked fish"],
    "banned_in": [],
    "requires_warning_in": []
  },
  "E282": {
    "name": "Calcium Propionate",
    "category": "preservative",
    "risk_level": "low",
    "short_explanation": "Mould inhibitor commonly used in bread. Some research links it to irritability and sleep disturbances in children.",
    "health_effects": ["Some evidence of behavioural effects in children at high doses"],
    "commonly_found_in": ["bread", "bakery products", "pizza bases"],
    "banned_in": [],
    "requires_warning_in": []
  },
  "E320": {
    "name": "BHA (Butylated Hydroxyanisole)",
    "category": "antioxidant",
    "risk_level": "medium",
    "short_explanation": "Synthetic antioxidant that prevents fats from going rancid. Classified as a possible carcinogen by IARC.",
    "health_effects": ["IARC Group 2B: possibly carcinogenic to humans", "Endocrine disruption concerns"],
    "commonly_found_in": ["crisps", "butter", "cereals", "instant noodles"],
    "banned_in": ["Japan"],
    "requires_warning_in": []
  },
  "E321": {
    "name": "BHT (Butylated Hydroxytoluene)",
    "category": "antioxidant",
    "risk_level": "medium",
    "short_explanation": "Synthetic antioxidant used to prevent oxidation in fats and oils. Associated with thyroid disruption at high doses.",
    "health_effects": ["Potential endocrine disruptor", "Some evidence of carcinogenicity in animals at high doses"],
    "commonly_found_in": ["cereals", "crisps", "frozen foods", "beer"],
    "banned_in": [],
    "requires_warning_in": []
  },
  "E322": {
    "name": "Lecithin",
    "category": "emulsifier",
    "risk_level": "low",
    "short_explanation": "Natural emulsifier often derived from soy or sunflower. Generally safe, but may trigger reactions in severe soy allergy sufferers.",
    "health_effects": ["Mild soy allergy risk if soy-derived"],
    "commonly_found_in": ["chocolate", "baked goods", "margarine", "infant formula"],
    "banned_in": [],
    "requires_warning_in": ["Must declare source (soy/sunflower) in EU if soy-derived"]
  },
  "E330": {
    "name": "Citric Acid",
    "category": "acidity_regulator",
    "risk_level": "low",
    "short_explanation": "Naturally occurring acid found in citrus fruit. Widely used as a preservative and flavour enhancer. Very well tolerated.",
    "health_effects": [],
    "commonly_found_in": ["fizzy drinks", "sweets", "jams", "tinned foods"],
    "banned_in": [],
    "requires_warning_in": []
  },
  "E412": {
    "name": "Guar Gum",
    "category": "thickener",
    "risk_level": "low",
    "short_explanation": "Natural thickener derived from guar beans. High doses may cause digestive discomfort.",
    "health_effects": ["Bloating and flatulence at high doses"],
    "commonly_found_in": ["ice cream", "sauces", "gluten-free products"],
    "banned_in": [],
    "requires_warning_in": []
  },
  "E415": {
    "name": "Xanthan Gum",
    "category": "thickener",
    "risk_level": "low",
    "short_explanation": "Fermented thickener widely used in gluten-free foods. Safe for most people. May cause bloating.",
    "health_effects": ["Digestive discomfort in large amounts"],
    "commonly_found_in": ["salad dressings", "gluten-free baked goods", "sauces"],
    "banned_in": [],
    "requires_warning_in": []
  },
  "E450": {
    "name": "Diphosphates",
    "category": "raising_agent",
    "risk_level": "low",
    "short_explanation": "Phosphate salts used as leavening and water retention agents. High phosphate intake from all sources is a concern for kidney patients.",
    "health_effects": ["High phosphate diet linked to reduced kidney function at population level"],
    "commonly_found_in": ["processed cheese", "cured meats", "baking powder"],
    "banned_in": [],
    "requires_warning_in": []
  },
  "E471": {
    "name": "Mono- and Diglycerides of Fatty Acids",
    "category": "emulsifier",
    "risk_level": "low",
    "short_explanation": "Emulsifiers derived from fats. May contain traces of trans fats. Typically animal or vegetable origin — not always vegan.",
    "health_effects": ["May contain trace trans fats"],
    "commonly_found_in": ["bread", "cake", "margarine", "ice cream"],
    "banned_in": [],
    "requires_warning_in": []
  },
  "E500": {
    "name": "Sodium Carbonates (Baking Soda)",
    "category": "raising_agent",
    "risk_level": "low",
    "short_explanation": "Common raising agent. Sodium bicarbonate (E500ii) is baking soda. Safe for most people.",
    "health_effects": [],
    "commonly_found_in": ["baked goods", "biscuits", "crackers"],
    "banned_in": [],
    "requires_warning_in": []
  },
  "E621": {
    "name": "Monosodium Glutamate (MSG)",
    "category": "flavour_enhancer",
    "risk_level": "low",
    "short_explanation": "Flavour enhancer that amplifies savoury taste. Considered safe by all major food regulators. 'Chinese Restaurant Syndrome' is not supported by clinical evidence.",
    "health_effects": ["Self-reported sensitivity in rare individuals — not confirmed in double-blind studies"],
    "commonly_found_in": ["instant noodles", "crisps", "processed meats", "fast food"],
    "banned_in": [],
    "requires_warning_in": []
  },
  "E627": {
    "name": "Disodium Guanylate",
    "category": "flavour_enhancer",
    "risk_level": "low",
    "short_explanation": "Flavour enhancer often used alongside MSG. May be derived from fish or yeast — not always vegan.",
    "health_effects": ["Gout sufferers should avoid — high in purines"],
    "commonly_found_in": ["instant soups", "crisps", "seasonings"],
    "banned_in": [],
    "requires_warning_in": []
  },
  "E951": {
    "name": "Aspartame",
    "category": "sweetener",
    "risk_level": "medium",
    "short_explanation": "Artificial sweetener 200x sweeter than sugar. Must be avoided by people with phenylketonuria (PKU). IARC classified as 'possibly carcinogenic' in 2023 — regulators have not changed approved limits.",
    "health_effects": ["Must not be consumed by people with PKU", "IARC Group 2B: possibly carcinogenic (2023) — evidence remains limited"],
    "commonly_found_in": ["diet drinks", "sugar-free chewing gum", "low-calorie desserts"],
    "banned_in": [],
    "requires_warning_in": ["EU/UK: must display 'contains a source of phenylalanine'"]
  },
  "E954": {
    "name": "Saccharin",
    "category": "sweetener",
    "risk_level": "low",
    "short_explanation": "One of the oldest artificial sweeteners. Previously suspected carcinogen — current evidence does not support this at normal intake levels.",
    "health_effects": [],
    "commonly_found_in": ["diet drinks", "tabletop sweeteners", "some medicines"],
    "banned_in": [],
    "requires_warning_in": []
  },
  "E955": {
    "name": "Sucralose",
    "category": "sweetener",
    "risk_level": "low",
    "short_explanation": "Chlorinated sugar derivative. Very high sweetening power. No calories. Recent research suggests possible gut microbiome disruption at high doses.",
    "health_effects": ["Emerging evidence of gut microbiome disruption at high doses"],
    "commonly_found_in": ["diet drinks", "protein bars", "low-sugar baked goods"],
    "banned_in": [],
    "requires_warning_in": []
  }
}
```

---

## STEP 2 — Create the additive enrichment service

Create a new file `backend/services/additive_service.py`:

```python
from __future__ import annotations
import json
import re
from pathlib import Path
from typing import Optional
from pydantic import BaseModel

_ADDITIVES_PATH = Path(__file__).parent.parent / "data" / "additives.json"
_ADDITIVES_DB: dict = {}


def _load() -> None:
    global _ADDITIVES_DB
    if not _ADDITIVES_DB:
        _ADDITIVES_DB = json.loads(_ADDITIVES_PATH.read_text())


class AdditiveDetail(BaseModel):
    code: str
    name: str
    category: str
    risk_level: str                   # "low" | "medium" | "high"
    short_explanation: str
    health_effects: list[str]
    commonly_found_in: list[str]
    banned_in: list[str]
    requires_warning_in: list[str]


def enrich_additives(ingredient_tokens: list[str]) -> list[AdditiveDetail]:
    """
    Given a list of normalised ingredient tokens, extract any E-number references
    and return fully enriched AdditiveDetail objects for each one found in the DB.
    Tokens may look like: "e102", "e-102", "E102", "(e211)", "tartrazine".
    """
    _load()
    found: list[AdditiveDetail] = []
    seen_codes: set[str] = set()

    e_pattern = re.compile(r"\be[-\s]?(\d{3,4}[a-z]?)\b", re.IGNORECASE)

    for token in ingredient_tokens:
        # Match by E-number pattern
        matches = e_pattern.findall(token)
        for match in matches:
            code = f"E{match.upper()}"
            if code not in seen_codes and code in _ADDITIVES_DB:
                seen_codes.add(code)
                found.append(AdditiveDetail(code=code, **_ADDITIVES_DB[code]))

        # Match by common name (case-insensitive full match)
        token_clean = token.strip().lower()
        for code, data in _ADDITIVES_DB.items():
            if code in seen_codes:
                continue
            if data["name"].lower() == token_clean:
                seen_codes.add(code)
                found.append(AdditiveDetail(code=code, **data))

    return found


def get_additive_risk_summary(additives: list[AdditiveDetail]) -> str:
    """
    Returns a one-sentence plain English summary of the additive risk profile.
    Used to inject into the LLM prompt.
    """
    if not additives:
        return "No recognised additives detected."

    high   = [a for a in additives if a.risk_level == "high"]
    medium = [a for a in additives if a.risk_level == "medium"]

    if high:
        names = ", ".join(f"{a.code} ({a.name})" for a in high)
        return f"{len(high)} high-risk additive(s) detected: {names}. These have significant health concerns at regular intake."
    if medium:
        names = ", ".join(f"{a.code} ({a.name})" for a in medium)
        return f"{len(medium)} medium-risk additive(s) detected: {names}. These are worth being aware of, especially for sensitive individuals."
    return f"{len(additives)} additive(s) detected — all considered low risk at typical intake levels."
```

---

## STEP 3 — Create the nutrition enrichment service

Create a new file `backend/services/nutrition_service.py`:

```python
from __future__ import annotations
from pydantic import BaseModel
from typing import Optional


# WHO / NHS daily reference values (per adult, 2000kcal diet)
DAILY_REFERENCE = {
    "calories":       2000.0,   # kcal
    "fat_g":          70.0,     # g
    "saturated_fat_g": 20.0,    # g
    "carbs_g":        260.0,    # g
    "sugar_g":        50.0,     # g  (WHO free sugar guideline: 25g; NHS: 30g; using 50g as labelling standard)
    "fibre_g":        30.0,     # g
    "protein_g":      50.0,     # g
    "salt_g":         6.0,      # g  (WHO recommends <5g; UK label standard is 6g)
}

# Thresholds per 100g for traffic-light colour coding (UK FSA standard)
TRAFFIC_LIGHT = {
    "fat_g":           {"low": 3.0,  "high": 17.5},
    "saturated_fat_g": {"low": 1.5,  "high": 5.0},
    "sugar_g":         {"low": 5.0,  "high": 22.5},
    "salt_g":          {"low": 0.3,  "high": 1.5},
}


class NutrientRow(BaseModel):
    label: str
    value_per_100g: Optional[float]
    unit: str
    daily_percent: Optional[float]      # % of adult daily reference
    traffic_light: Optional[str]        # "green" | "amber" | "red"
    context: Optional[str]              # plain English note


class EnrichedNutrition(BaseModel):
    per_100g: list[NutrientRow]
    per_serving: Optional[list[NutrientRow]]
    serving_size_g: Optional[float]
    overall_nutrition_note: str         # one sentence summary for display
    high_concern_nutrients: list[str]   # e.g. ["sugar", "salt"] — drives UI warnings


def _traffic(key: str, value: float) -> str:
    if key not in TRAFFIC_LIGHT:
        return "none"
    thresholds = TRAFFIC_LIGHT[key]
    if value <= thresholds["low"]:
        return "green"
    if value >= thresholds["high"]:
        return "red"
    return "amber"


def _daily_pct(key: str, value: float) -> Optional[float]:
    ref = DAILY_REFERENCE.get(key)
    if ref is None or ref == 0:
        return None
    return round((value / ref) * 100, 1)


def _context_note(key: str, value: float, tl: str) -> str:
    notes = {
        ("sugar_g", "red"):         f"{value}g per 100g is high. Exceeds the UK FSA 'high sugar' threshold of 22.5g.",
        ("sugar_g", "amber"):       f"{value}g per 100g is moderate.",
        ("sugar_g", "green"):       f"{value}g per 100g is low sugar.",
        ("salt_g",  "red"):         f"{value}g per 100g is high. Frequent consumption raises blood pressure risk.",
        ("salt_g",  "amber"):       f"{value}g per 100g is moderate salt.",
        ("fat_g",   "red"):         f"{value}g total fat per 100g is high.",
        ("saturated_fat_g", "red"): f"{value}g saturated fat per 100g is high. Linked to raised LDL cholesterol.",
    }
    return notes.get((key, tl), "")


def enrich_nutrition(raw: dict, serving_size_g: Optional[float] = None) -> EnrichedNutrition:
    """
    raw: dict with optional keys calories, fat_g, saturated_fat_g, carbs_g,
         sugar_g, fibre_g, protein_g, salt_g — all per 100g.
    """
    rows: list[NutrientRow] = []
    high_concern: list[str] = []

    field_map = [
        ("calories",       "Calories",        "kcal"),
        ("fat_g",          "Fat",             "g"),
        ("saturated_fat_g","Saturated fat",   "g"),
        ("carbs_g",        "Carbohydrates",   "g"),
        ("sugar_g",        "Sugars",          "g"),
        ("fibre_g",        "Fibre",           "g"),
        ("protein_g",      "Protein",         "g"),
        ("salt_g",         "Salt",            "g"),
    ]

    for key, label, unit in field_map:
        value = raw.get(key)
        if value is None:
            rows.append(NutrientRow(
                label=label, value_per_100g=None, unit=unit,
                daily_percent=None, traffic_light=None, context="Not available"
            ))
            continue

        tl  = _traffic(key, value)
        pct = _daily_pct(key, value)
        ctx = _context_note(key, value, tl)

        if tl == "red":
            high_concern.append(label.lower())

        rows.append(NutrientRow(
            label=label, value_per_100g=value, unit=unit,
            daily_percent=pct, traffic_light=tl, context=ctx
        ))

    # Per-serving rows
    serving_rows: Optional[list[NutrientRow]] = None
    if serving_size_g:
        serving_rows = []
        ratio = serving_size_g / 100.0
        for row in rows:
            if row.value_per_100g is None:
                serving_rows.append(row.model_copy())
                continue
            sv = round(row.value_per_100g * ratio, 1)
            serving_rows.append(NutrientRow(
                label=row.label, value_per_100g=sv, unit=row.unit,
                daily_percent=_daily_pct(
                    next((k for k, l, _ in field_map if l == row.label), ""), sv
                ),
                traffic_light=row.traffic_light,
                context=row.context
            ))

    # Overall note
    if not high_concern:
        overall = "Nutritional profile is within normal ranges."
    elif len(high_concern) == 1:
        overall = f"High {high_concern[0]} content. Check your daily intake if consuming regularly."
    else:
        concerns = " and ".join(high_concern)
        overall = f"High {concerns} detected. Limit serving size and frequency."

    return EnrichedNutrition(
        per_100g=rows,
        per_serving=serving_rows,
        serving_size_g=serving_size_g,
        overall_nutrition_note=overall,
        high_concern_nutrients=high_concern
    )
```

---

## STEP 4 — Update the Pydantic scan schema

Open `backend/schemas/scan.py`. Add these new models and update `ScanResult`:

```python
# Add these new models

class AdditiveDetail(BaseModel):
    code: str
    name: str
    category: str
    risk_level: str
    short_explanation: str
    health_effects: list[str]
    commonly_found_in: list[str]
    banned_in: list[str]
    requires_warning_in: list[str]


class NutrientRow(BaseModel):
    label: str
    value_per_100g: Optional[float]
    unit: str
    daily_percent: Optional[float]
    traffic_light: Optional[str]
    context: Optional[str]


class EnrichedNutrition(BaseModel):
    per_100g: list[NutrientRow]
    per_serving: Optional[list[NutrientRow]]
    serving_size_g: Optional[float]
    overall_nutrition_note: str
    high_concern_nutrients: list[str]


# Update ScanResult — add these two fields:

class ScanResult(BaseModel):
    product_name: str
    brand: Optional[str]
    ingredients: list[str]
    allergens_detected: list[str]
    nutrition: dict                           # raw nutrition (keep existing)
    nutrition_enriched: EnrichedNutrition     # NEW — enriched with context
    additives: list[dict]                     # keep existing for backwards compat
    additives_detailed: list[AdditiveDetail]  # NEW — full AdditiveDetail objects
    verdict_response: VerdictResponse
    source: str
```

---

## STEP 5 — Wire the two new services into the scan router

Open `backend/routers/scan.py`.

In both the `/scan/barcode` and `/scan/label` handlers, after `ingredient_parser` runs and before the LLM call, add these two steps:

```python
from services.additive_service import enrich_additives, get_additive_risk_summary
from services.nutrition_service import enrich_nutrition

# After ingredient_parser step:

# 1. Enrich additives
additives_detailed = enrich_additives(parsed_ingredient_tokens)
additive_risk_summary = get_additive_risk_summary(additives_detailed)

# 2. Enrich nutrition
raw_nutrition = {
    "calories":        product_data.get("calories"),
    "fat_g":           product_data.get("fat_g"),
    "saturated_fat_g": product_data.get("saturated_fat_g"),
    "carbs_g":         product_data.get("carbs_g"),
    "sugar_g":         product_data.get("sugar_g"),
    "fibre_g":         product_data.get("fibre_g"),
    "protein_g":       product_data.get("protein_g"),
    "salt_g":          product_data.get("salt_g"),
}
nutrition_enriched = enrich_nutrition(
    raw=raw_nutrition,
    serving_size_g=product_data.get("serving_size_g")
)

# 3. Pass additive_risk_summary into the LLM prompt context
llm_context["additive_risk_summary"] = additive_risk_summary
llm_context["nutrition_summary"]     = nutrition_enriched.overall_nutrition_note

# 4. Add to ScanResult
scan_result.additives_detailed  = additives_detailed
scan_result.nutrition_enriched  = nutrition_enriched
```

---

## STEP 6 — Update the LLM prompt template

Open `backend/prompts/safety_verdict.txt`. In the USER section, add these two lines after the existing `Additives detected:` line:

```
Additive risk summary: {additive_risk_summary}
Nutrition summary: {nutrition_summary}
```

Also add `additive_summary` and `nutrition_context` to the expected JSON output schema in the prompt:

```
"additive_summary": "One sentence summary of additive risk for this product.",
"nutrition_context": "One sentence explaining the most notable nutritional concern."
```

And add these two fields to the `VerdictResponse` Pydantic model in `backend/schemas/scan.py`:
```python
additive_summary:   Optional[str] = None
nutrition_context:  Optional[str] = None
```

---

## STEP 7 — Create the frontend type definitions

Open `src/types/scan.types.ts`. Add:

```typescript
export interface AdditiveDetail {
  code: string
  name: string
  category: string
  risk_level: 'low' | 'medium' | 'high'
  short_explanation: string
  health_effects: string[]
  commonly_found_in: string[]
  banned_in: string[]
  requires_warning_in: string[]
}

export interface NutrientRow {
  label: string
  value_per_100g: number | null
  unit: string
  daily_percent: number | null
  traffic_light: 'green' | 'amber' | 'red' | null
  context: string | null
}

export interface EnrichedNutrition {
  per_100g: NutrientRow[]
  per_serving: NutrientRow[] | null
  serving_size_g: number | null
  overall_nutrition_note: string
  high_concern_nutrients: string[]
}

// Update existing ScanResult to add:
// additives_detailed: AdditiveDetail[]
// nutrition_enriched: EnrichedNutrition
// In VerdictResponse also add:
// additive_summary?: string
// nutrition_context?: string
```

---

## STEP 8 — Build the AdditivesPanel component

Create `src/components/result/AdditivesPanel.tsx`:

```tsx
import { AdditiveDetail } from '../../types/scan.types'
import { useState } from 'react'

const RISK_CONFIG = {
  high:   { bg: 'bg-red-50',    border: 'border-red-200',    dot: 'bg-red-500',    label: 'High risk',   text: 'text-red-800'   },
  medium: { bg: 'bg-amber-50',  border: 'border-amber-200',  dot: 'bg-amber-500',  label: 'Medium risk', text: 'text-amber-800' },
  low:    { bg: 'bg-green-50',  border: 'border-green-200',  dot: 'bg-green-500',  label: 'Low risk',    text: 'text-green-800' },
}

const CATEGORY_LABEL: Record<string, string> = {
  colorant:           'Colorant',
  preservative:       'Preservative',
  emulsifier:         'Emulsifier',
  antioxidant:        'Antioxidant',
  sweetener:          'Sweetener',
  flavour_enhancer:   'Flavour enhancer',
  thickener:          'Thickener',
  raising_agent:      'Raising agent',
  acidity_regulator:  'Acidity regulator',
}

interface Props {
  additives: AdditiveDetail[]
  additiveSummary?: string
}

export function AdditivesPanel({ additives, additiveSummary }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null)

  if (!additives || additives.length === 0) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-4">
        <p className="text-sm font-medium text-green-800">No recognised additives or E-numbers detected</p>
      </div>
    )
  }

  const sorted = [...additives].sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 }
    return order[a.risk_level] - order[b.risk_level]
  })

  return (
    <div className="space-y-3">

      {/* Summary line from LLM */}
      {additiveSummary && (
        <p className="text-sm text-gray-600 leading-relaxed">{additiveSummary}</p>
      )}

      {/* Additive cards */}
      {sorted.map((additive) => {
        const cfg = RISK_CONFIG[additive.risk_level]
        const isOpen = expanded === additive.code

        return (
          <div
            key={additive.code}
            className={`rounded-xl border ${cfg.border} ${cfg.bg} overflow-hidden`}
          >
            {/* Header row — always visible */}
            <button
              className="w-full text-left px-4 py-3 flex items-start gap-3"
              onClick={() => setExpanded(isOpen ? null : additive.code)}
            >
              <span className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-medium text-gray-500">{additive.code}</span>
                  <span className={`text-sm font-medium ${cfg.text}`}>{additive.name}</span>
                  <span className="text-xs text-gray-400">
                    {CATEGORY_LABEL[additive.category] ?? additive.category}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-0.5 leading-snug">{additive.short_explanation}</p>
              </div>
              <span className="text-gray-400 text-xs mt-1 flex-shrink-0">{isOpen ? '▲' : '▼'}</span>
            </button>

            {/* Expanded detail */}
            {isOpen && (
              <div className="px-4 pb-4 pt-0 border-t border-black/5 space-y-3">

                {additive.health_effects.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Health effects</p>
                    <ul className="space-y-1">
                      {additive.health_effects.map((effect, i) => (
                        <li key={i} className="text-sm text-gray-700 flex gap-2">
                          <span className="text-gray-400">–</span>{effect}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Commonly found in</p>
                  <div className="flex flex-wrap gap-1">
                    {additive.commonly_found_in.map((item) => (
                      <span key={item} className="text-xs bg-white/70 border border-black/10 rounded-full px-2.5 py-0.5 text-gray-600">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                {additive.banned_in.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-red-600 uppercase tracking-wide mb-1">Banned in</p>
                    <p className="text-sm text-red-700">{additive.banned_in.join(', ')}</p>
                  </div>
                )}

                {additive.requires_warning_in.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-amber-600 uppercase tracking-wide mb-1">Requires warning label in</p>
                    <p className="text-sm text-amber-700">{additive.requires_warning_in.join(', ')}</p>
                  </div>
                )}

              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
```

---

## STEP 9 — Build the NutritionPanel component

Create `src/components/result/NutritionPanel.tsx`:

```tsx
import { EnrichedNutrition, NutrientRow } from '../../types/scan.types'
import { useState } from 'react'

const TRAFFIC_COLOR = {
  green: { bar: 'bg-green-500',  text: 'text-green-700',  bg: 'bg-green-50'  },
  amber: { bar: 'bg-amber-500',  text: 'text-amber-700',  bg: 'bg-amber-50'  },
  red:   { bar: 'bg-red-500',    text: 'text-red-700',    bg: 'bg-red-50'    },
  none:  { bar: 'bg-gray-200',   text: 'text-gray-500',   bg: 'bg-gray-50'   },
}

function NutrientBarRow({ row }: { row: NutrientRow }) {
  const tl = row.traffic_light ?? 'none'
  const colors = TRAFFIC_COLOR[tl]
  const pct = Math.min(row.daily_percent ?? 0, 100)

  return (
    <div className="py-2.5 border-b border-black/5 last:border-0">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm text-gray-700">{row.label}</span>
        <div className="flex items-center gap-2">
          {row.value_per_100g !== null ? (
            <span className="text-sm font-medium text-gray-900">
              {row.value_per_100g}{row.unit}
            </span>
          ) : (
            <span className="text-sm text-gray-400">—</span>
          )}
          {row.daily_percent !== null && (
            <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${colors.bg} ${colors.text}`}>
              {row.daily_percent}%
            </span>
          )}
        </div>
      </div>

      {/* Progress bar */}
      {row.value_per_100g !== null && (
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${colors.bar}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}

      {/* Context note */}
      {row.context && tl !== 'none' && tl !== 'green' && (
        <p className={`text-xs mt-1 ${colors.text}`}>{row.context}</p>
      )}
    </div>
  )
}

interface Props {
  nutrition: EnrichedNutrition
  nutritionContext?: string
}

export function NutritionPanel({ nutrition, nutritionContext }: Props) {
  const [view, setView] = useState<'100g' | 'serving'>('100g')
  const hasServing = !!nutrition.per_serving && !!nutrition.serving_size_g

  const rows = view === 'serving' && hasServing
    ? nutrition.per_serving!
    : nutrition.per_100g

  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">

      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-gray-900">Nutrition</h3>
          <p className="text-xs text-gray-500 mt-0.5">{nutrition.overall_nutrition_note}</p>
        </div>
        {hasServing && (
          <div className="flex bg-gray-100 rounded-lg p-0.5 text-xs gap-0.5">
            {(['100g', 'serving'] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  view === v
                    ? 'bg-white text-gray-900 shadow-sm font-medium'
                    : 'text-gray-500'
                }`}
              >
                {v === '100g' ? 'Per 100g' : `Per serving (${nutrition.serving_size_g}g)`}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="px-4 pt-2 flex gap-3">
        {(['green', 'amber', 'red'] as const).map((tl) => (
          <div key={tl} className="flex items-center gap-1">
            <span className={`w-2 h-2 rounded-full ${TRAFFIC_COLOR[tl].bar}`} />
            <span className="text-xs text-gray-400 capitalize">
              {tl === 'green' ? 'Low' : tl === 'amber' ? 'Medium' : 'High'}
            </span>
          </div>
        ))}
        <span className="text-xs text-gray-400 ml-auto">% of daily intake</span>
      </div>

      {/* Rows */}
      <div className="px-4 pb-1">
        {rows.map((row) => (
          <NutrientBarRow key={row.label} row={row} />
        ))}
      </div>

      {/* LLM nutrition context */}
      {nutritionContext && (
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
          <p className="text-xs text-gray-600 leading-relaxed">{nutritionContext}</p>
        </div>
      )}
    </div>
  )
}
```

---

## STEP 10 — Update the Result page to render both panels

Open `src/pages/Result.tsx`.

Import both new components:
```tsx
import { AdditivesPanel } from '../components/result/AdditivesPanel'
import { NutritionPanel }  from '../components/result/NutritionPanel'
```

In the JSX, add them in this order (after the existing `AllergenFlags` and `IngredientList`):

```tsx
{/* Nutrition section */}
{result.nutrition_enriched && (
  <section>
    <h2 className="text-base font-medium text-gray-800 mb-3">Nutritional values</h2>
    <NutritionPanel
      nutrition={result.nutrition_enriched}
      nutritionContext={result.verdict_response.nutrition_context}
    />
  </section>
)}

{/* Additives & E-numbers section */}
{result.additives_detailed && result.additives_detailed.length > 0 && (
  <section>
    <h2 className="text-base font-medium text-gray-800 mb-3">
      Additives & E-numbers
      <span className="ml-2 text-xs font-normal text-gray-400">
        {result.additives_detailed.length} detected
      </span>
    </h2>
    <AdditivesPanel
      additives={result.additives_detailed}
      additiveSummary={result.verdict_response.additive_summary}
    />
  </section>
)}
```

---

## STEP 11 — Write tests for the two new services

Create `backend/tests/test_additive_service.py`:

```python
from services.additive_service import enrich_additives, get_additive_risk_summary

def test_detects_e_number_in_token():
    result = enrich_additives(["E211", "sugar", "salt"])
    codes = [a.code for a in result]
    assert "E211" in codes

def test_detects_lowercase_e_number():
    result = enrich_additives(["e102"])
    assert any(a.code == "E102" for a in result)

def test_detects_e_number_with_dash():
    result = enrich_additives(["e-250"])
    assert any(a.code == "E250" for a in result)

def test_detects_by_common_name():
    result = enrich_additives(["tartrazine"])
    assert any(a.code == "E102" for a in result)

def test_no_duplicates():
    result = enrich_additives(["E211", "e211", "sodium benzoate"])
    codes = [a.code for a in result]
    assert len(codes) == len(set(codes))

def test_risk_summary_high():
    result = enrich_additives(["E250"])
    summary = get_additive_risk_summary(result)
    assert "high-risk" in summary.lower()

def test_empty_returns_no_additives_message():
    summary = get_additive_risk_summary([])
    assert "no recognised" in summary.lower()
```

Create `backend/tests/test_nutrition_service.py`:

```python
from services.nutrition_service import enrich_nutrition

SAMPLE = {
    "calories": 480,
    "fat_g": 20,
    "saturated_fat_g": 6,
    "carbs_g": 65,
    "sugar_g": 36,
    "fibre_g": 2,
    "protein_g": 5,
    "salt_g": 0.6,
}

def test_returns_all_eight_nutrients():
    result = enrich_nutrition(SAMPLE)
    labels = [r.label for r in result.per_100g]
    assert len(labels) == 8

def test_high_sugar_is_red():
    result = enrich_nutrition(SAMPLE)
    sugar_row = next(r for r in result.per_100g if r.label == "Sugars")
    assert sugar_row.traffic_light == "red"

def test_daily_percent_calculated():
    result = enrich_nutrition(SAMPLE)
    sugar_row = next(r for r in result.per_100g if r.label == "Sugars")
    assert sugar_row.daily_percent == round((36 / 50) * 100, 1)

def test_serving_size_scales_values():
    result = enrich_nutrition(SAMPLE, serving_size_g=30)
    assert result.per_serving is not None
    cal_row = next(r for r in result.per_serving if r.label == "Calories")
    assert cal_row.value_per_100g == round(480 * 0.3, 1)

def test_high_concern_nutrients_populated():
    result = enrich_nutrition(SAMPLE)
    assert "sugars" in result.high_concern_nutrients

def test_missing_value_returns_none_gracefully():
    result = enrich_nutrition({"calories": 200})
    fat_row = next(r for r in result.per_100g if r.label == "Fat")
    assert fat_row.value_per_100g is None
    assert fat_row.context == "Not available"
```

Run both test files:
```
pytest backend/tests/test_additive_service.py backend/tests/test_nutrition_service.py -v
```
All tests must pass before continuing.

---

## STEP 12 — Final verification checklist

Do these checks manually before calling this feature complete:

```
[ ] Scan a product with known E-numbers (e.g., Haribo Goldbears — contains E100, E104, E110, E120, E122, E129, E133)
    → All detected E-numbers appear in AdditivesPanel
    → Each card shows: name, category, risk level, explanation, health effects, commonly found in

[ ] Scan the same product and tap each additive card
    → Expands to show full detail
    → Collapses when tapped again
    → High-risk additives appear at the top (sorted by risk)

[ ] NutritionPanel shows all 8 nutrient rows
    → Traffic-light colours are correct (check sugar row on a high-sugar product)
    → Progress bars fill proportionally to daily % value
    → "Per 100g / Per serving" toggle appears when serving_size_g is available

[ ] Scan a product with NO additives
    → AdditivesPanel shows "No recognised additives detected" in green

[ ] Check a product with unknown E-numbers not in the DB
    → They do not crash — missing codes are silently skipped
    → Only recognised codes appear in the panel

[ ] LLM additive_summary and nutrition_context appear on Result page
    → Both are non-empty strings
    → Additive summary correctly reflects risk level
```
