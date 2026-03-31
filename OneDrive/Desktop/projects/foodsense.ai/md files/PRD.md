# foodsense.ai — Product Requirements Document (MVP)
> Version: 1.0 | Status: Approved for Build | Audience: Engineering, Design, QA

---

## 1. Executive Summary

**foodsense.ai** is an AI-powered food intelligence web application that allows any user to scan a packaged food product — via barcode or label photo — and receive an instant, plain-English breakdown of what's inside it: ingredients, allergens, additives, nutritional highlights, and a safety verdict tailored to their dietary profile.

The core value proposition is **universal accessibility**: it works on labels from any country, in any language, for any dietary restriction, in under 5 seconds.

---

## 2. Problem Statement

Consumers globally face three compounding problems when evaluating packaged food:

1. **Language barriers** — Imported goods carry labels in foreign languages that consumers cannot read.
2. **Complexity** — Ingredient lists are long, jargon-heavy, and filled with additive codes (E-numbers) that have no plain-language meaning.
3. **Personalization gap** — Generic labels don't tell a user with a nut allergy, a diabetic, or a vegan what *they* specifically need to know.

Existing tools (physical label, Google Translate, manual search) are fragmented, slow, and require expert knowledge to interpret correctly.

---

## 3. What This Product IS

| Capability | Description |
|---|---|
| **Barcode Scanner** | Uses device camera to detect EAN/UPC barcodes and fetch structured product data from OpenFoodFacts. |
| **Label OCR Scanner** | Accepts an uploaded or captured photo of a food label. Extracts and parses ingredient lists and nutrition tables. Handles non-English text with automatic translation. |
| **Ingredient Intelligence** | Detects allergens, E-number additives, preservatives, artificial colorants, and cross-references against the user's profile. |
| **LLM Explanation Engine** | Sends structured product data to an LLM and returns a human-readable safety verdict: Safe / Caution / Avoid — with specific flags and plain-English reasoning. |
| **User Dietary Profile** | Stores user allergies and dietary preferences (vegan, halal, keto, sugar-conscious, etc.) to personalise every scan result. |
| **Scan History** | Retains the last 10 scans per user for quick reference and comparison. |
| **Multi-Language Support** | Auto-detects label language and translates ingredient text before parsing. |

---

## 4. What This Product IS NOT

This section is as important as section 3. Scope creep kills MVPs.

| Out of Scope | Reason |
|---|---|
| **Medical or clinical recommendations** | We are not a diagnostic tool. No dosage advice, treatment suggestions, or disease-specific guidance will be given. All explanations are general wellness-oriented. |
| **Nutrition tracking / calorie diary** | We surface nutritional highlights per scan, not a cumulative diet log. |
| **Social features** (reviews, ratings, community posts) | No user-generated content, no feeds, no social graph. |
| **Offline mode / on-device model** | All OCR and LLM inference is server-side. No local model execution. |
| **Grocery lists or shopping cart** | We read products, we don't help purchase them. |
| **Restaurant menus or fresh produce** | Scope is strictly packaged food with labels or barcodes. |
| **Medical allergen certification** | Our allergen flags are best-effort informational warnings, not clinical-grade certifications. Users with severe allergies are always directed to consult the manufacturer. |
| **Real-time price or availability data** | We have no e-commerce integration. |
| **Custom ingredient database editing by users** | The ingredient dictionary is maintained internally. No crowdsourced editing in MVP. |
| **Mobile native app (iOS/Android)** | MVP is a mobile-optimised Progressive Web App (PWA). No App Store or Play Store submission. |

---

## 5. Target Users

### Primary

- **International travellers & expats** buying food in countries whose language they don't speak.
- **Allergy sufferers** (nuts, soy, gluten, dairy, shellfish) who need fast, accurate allergen flags.
- **Health-conscious consumers** tracking sugar, sodium, artificial additives.
- **Vegans, vegetarians, halal/kosher observers** who need ingredient-level diet compliance.

### Secondary

- **Parents** scanning food for young children.
- **Type 2 diabetics and hypertension patients** needing high-sugar or high-sodium warnings (non-medical, informational only).
- **Fitness communities** (keto, clean-label, low-carb).

---

## 6. Core User Flows

### Flow A — Barcode Scan (Primary)
```
Open app → Tap "Scan" → Camera activates → Point at barcode
→ Barcode decoded (ZXing) → OpenFoodFacts API called
→ Product data structured → LLM prompt assembled
→ LLM returns verdict → Safety Card displayed to user
```

### Flow B — Label Photo Scan (Fallback)
```
Open app → Tap "Upload Label" → Select photo or take photo
→ Image sent to Google Cloud Vision OCR → Text extracted
→ Language detected → Translation if non-English
→ Ingredient parser structures data → LLM prompt assembled
→ LLM returns verdict → Safety Card displayed to user
```

### Flow C — Profile Setup (Onboarding)
```
First launch → "Tell us about you" screen
→ Select allergies (multi-select) → Select dietary preferences
→ Profile saved locally + server → Applied to all future scans
```

---

## 7. MVP Success Metrics

| Metric | Target |
|---|---|
| Barcode recognition coverage | ≥ 70% (OpenFoodFacts dataset) |
| Ingredient extraction accuracy (clean photos) | ≥ 70% |
| End-to-end scan → verdict time | < 5 seconds |
| User satisfaction score | ≥ 4.0 / 5.0 |
| Repeat scan usage | ≥ 20% of users return for a second scan |
| False positive allergen rate | Minimised; conservative flags only |

---

## 8. Constraints & Guardrails

- **LLM output must never claim to be medical advice.** Every explanation includes a standard disclaimer.
- **Allergen warnings are advisory only.** We flag, we don't certify. Copy must make this clear.
- **No fabricated ingredient data.** If OCR extraction confidence is low, we surface a warning rather than hallucinate structure.
- **LLM responses are structured JSON.** Free-form LLM prose is not surfaced directly without parsing through a defined schema.
- **No PII stored unnecessarily.** User profiles store preferences only — no scan images retained after processing.

---

## 9. Non-Functional Requirements

| Requirement | Target |
|---|---|
| Mobile-first responsive design | Must work on 375px+ viewports |
| API response time (barcode) | < 2s from scan to data fetch |
| API response time (OCR + LLM) | < 5s end-to-end |
| Uptime target | 99.5% |
| Accessibility | WCAG 2.1 AA minimum |
| Browser support | Chrome 90+, Safari 15+, Firefox 90+ |

---

## 10. Phased Delivery

### Phase 1 — Core (Weeks 1–3)
Barcode lookup, OCR extraction, first LLM integration, basic UI, explanation card.

### Phase 2 — Intelligence Layer (Weeks 4–5)
User profiles, allergen/additive dictionary, Redis caching, scan history, improved OCR parsing pipeline.

### Phase 3 — Future (Post-MVP)
Offline OCR, native mobile wrapper, multi-LLM routing, personal nutrition scoring, full i18n.

---

*This PRD is the source of truth for MVP scope. Any feature not listed in Section 3 requires explicit approval before being added to the build.*
