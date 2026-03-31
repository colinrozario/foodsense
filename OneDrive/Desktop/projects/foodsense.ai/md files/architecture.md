# foodsense.ai — Architecture Document
> Version: 1.0 | Scope: MVP | Audience: Engineering

---

## 1. System Overview

foodsense.ai is a client-server web application composed of:

- A **React/Vite SPA** (frontend) — mobile-first PWA
- A **FastAPI monolith** (backend) — handles OCR, barcode lookup, LLM orchestration
- **PostgreSQL** — persistent user data and product cache
- **Redis** — short-lived product lookup cache
- **S3-compatible storage** — temporary image staging (not long-term retention)
- **External APIs** — OpenFoodFacts, Google Cloud Vision, Anthropic/OpenAI LLM

All services are containerised with Docker. Frontend deploys to Vercel. Backend deploys to AWS (EC2 or ECS).

---

## 2. High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                         │
│                                                                 │
│   ┌───────────────┐   ┌───────────────┐   ┌────────────────┐   │
│   │  Barcode Scan │   │  Label Upload │   │  User Profile  │   │
│   │  (ZXing-js)   │   │  (Camera/File)│   │  & History     │   │
│   └──────┬────────┘   └──────┬────────┘   └───────┬────────┘   │
│          └──────────────────┬┘                    │            │
│                             │  REST API (JSON)     │            │
└─────────────────────────────┼────────────────────┼────────────┘
                              │                    │
                              ▼                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                     FastAPI Backend                             │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │ /scan/barcode│  │ /scan/label  │  │ /user/* endpoints    │  │
│  └──────┬───────┘  └──────┬───────┘  └──────────────────────┘  │
│         │                 │                                     │
│  ┌──────▼───────┐  ┌──────▼───────────────────┐               │
│  │  Barcode     │  │  OCR Pipeline             │               │
│  │  Lookup      │  │  (Vision API → Tesseract) │               │
│  │  Service     │  │  + Language Detection     │               │
│  │              │  │  + Translation            │               │
│  └──────┬───────┘  └──────┬───────────────────┘               │
│         │                 │                                     │
│         └────────┬────────┘                                    │
│                  ▼                                              │
│  ┌───────────────────────────────┐                             │
│  │   Ingredient Parser Service   │                             │
│  │   - Normalise raw text        │                             │
│  │   - Allergen detection        │                             │
│  │   - E-number lookup           │                             │
│  │   - User profile cross-check  │                             │
│  └───────────────┬───────────────┘                             │
│                  ▼                                              │
│  ┌───────────────────────────────┐                             │
│  │   LLM Orchestration Layer     │                             │
│  │   - Build structured prompt   │                             │
│  │   - Call Anthropic/OpenAI     │                             │
│  │   - Parse + validate response │                             │
│  │   - Return typed verdict JSON │                             │
│  └───────────────┬───────────────┘                             │
│                  │                                              │
└──────────────────┼──────────────────────────────────────────────┘
                   │
       ┌───────────┼──────────────────────────────────────┐
       │           │                                      │
       ▼           ▼                                      ▼
┌──────────┐  ┌──────────┐  ┌────────────────────────────────────┐
│PostgreSQL│  │  Redis   │  │        External APIs               │
│          │  │  Cache   │  │                                    │
│ - users  │  │          │  │  ┌─────────────────────────────┐   │
│ - prefs  │  │ product  │  │  │ OpenFoodFacts API            │   │
│ - history│  │ lookup   │  │  │ Google Cloud Vision API      │   │
│ - product│  │ TTL:24hr │  │  │ Anthropic Claude / OpenAI    │   │
│   cache  │  │          │  │  │ (LibreTranslate / DeepL)     │   │
└──────────┘  └──────────┘  │  └─────────────────────────────┘   │
                             └────────────────────────────────────┘
```

---

## 3. Project Directory Structure

```
foodsense/
│
├── frontend/                          # React + Vite SPA
│   ├── public/
│   │   ├── manifest.json              # PWA manifest
│   │   └── icons/
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx
│   │   ├── router.tsx                 # React Router v6 config
│   │   │
│   │   ├── pages/
│   │   │   ├── Home.tsx               # Landing / scan entry point
│   │   │   ├── ScanBarcode.tsx        # Live camera barcode view
│   │   │   ├── ScanLabel.tsx          # Upload / capture label photo
│   │   │   ├── Result.tsx             # Safety card + verdict
│   │   │   ├── Profile.tsx            # Dietary prefs setup
│   │   │   └── History.tsx            # Last 10 scans
│   │   │
│   │   ├── components/
│   │   │   ├── ui/                    # Design system primitives
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Card.tsx
│   │   │   │   ├── Badge.tsx
│   │   │   │   ├── Spinner.tsx
│   │   │   │   └── Modal.tsx
│   │   │   ├── scanner/
│   │   │   │   ├── BarcodeReader.tsx  # ZXing camera wrapper
│   │   │   │   └── LabelUploader.tsx  # File/camera image handler
│   │   │   ├── result/
│   │   │   │   ├── VerdictCard.tsx    # Safe/Caution/Avoid + color
│   │   │   │   ├── IngredientList.tsx # Flagged ingredient breakdown
│   │   │   │   ├── NutritionPanel.tsx # Nutritional highlights
│   │   │   │   └── AllergenFlags.tsx  # Allergen warning chips
│   │   │   └── layout/
│   │   │       ├── Header.tsx
│   │   │       ├── BottomNav.tsx
│   │   │       └── PageWrapper.tsx
│   │   │
│   │   ├── hooks/
│   │   │   ├── useBarcodeScan.ts      # ZXing integration hook
│   │   │   ├── useScanResult.ts       # API call + state management
│   │   │   └── useUserProfile.ts      # Profile read/write
│   │   │
│   │   ├── store/
│   │   │   ├── profileStore.ts        # Zustand: user prefs
│   │   │   └── historyStore.ts        # Zustand: scan history
│   │   │
│   │   ├── api/
│   │   │   ├── client.ts              # Axios instance + interceptors
│   │   │   ├── scan.ts                # /scan/* API calls
│   │   │   └── user.ts                # /user/* API calls
│   │   │
│   │   ├── types/
│   │   │   ├── scan.types.ts          # ScanResult, Verdict, Flag
│   │   │   └── user.types.ts          # UserProfile, Allergy enum
│   │   │
│   │   └── utils/
│   │       ├── verdictColor.ts        # safe→green, avoid→red
│   │       └── formatNutrition.ts
│   │
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   └── tsconfig.json
│
├── backend/                           # Python FastAPI
│   ├── main.py                        # App entry, router mounts
│   ├── config.py                      # Settings via pydantic-settings
│   ├── dependencies.py                # DB session, auth injection
│   │
│   ├── routers/
│   │   ├── scan.py                    # /scan/barcode, /scan/label
│   │   ├── product.py                 # /product/:id
│   │   └── user.py                    # /user/profile, /user/history
│   │
│   ├── services/
│   │   ├── barcode_service.py         # OpenFoodFacts fetch + normalise
│   │   ├── ocr_service.py             # Vision API → Tesseract fallback
│   │   ├── translation_service.py     # Language detect + translate
│   │   ├── ingredient_parser.py       # Raw text → structured ingredients
│   │   ├── allergen_service.py        # Cross-ref against allergen DB
│   │   └── llm_service.py             # Prompt build → LLM call → parse
│   │
│   ├── models/
│   │   ├── product.py                 # SQLAlchemy Product model
│   │   └── user.py                    # SQLAlchemy User + Preferences
│   │
│   ├── schemas/
│   │   ├── scan.py                    # Pydantic request/response schemas
│   │   └── user.py                    # Pydantic user schemas
│   │
│   ├── db/
│   │   ├── session.py                 # SQLAlchemy engine + session
│   │   └── migrations/                # Alembic migrations
│   │
│   ├── data/
│   │   ├── allergens.json             # Canonical allergen keyword list
│   │   ├── additives.json             # E-number → name + risk mapping
│   │   └── ingredient_synonyms.json   # Alias normalisation map
│   │
│   ├── prompts/
│   │   └── safety_verdict.txt         # LLM system + user prompt template
│   │
│   ├── tests/
│   │   ├── test_barcode.py
│   │   ├── test_ocr.py
│   │   ├── test_ingredient_parser.py
│   │   └── test_llm_service.py
│   │
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
│
├── docker-compose.yml                 # Local dev: API + Postgres + Redis
├── .github/
│   └── workflows/
│       ├── ci.yml                     # Lint + test on PR
│       └── deploy.yml                 # Deploy on merge to main
└── README.md
```

---

## 4. Data Flow — Barcode Scan

```
1. Frontend (BarcodeReader.tsx)
   └─ ZXing decodes barcode from camera frame
   └─ POST /scan/barcode { barcode: "5901234123457" }

2. Backend (routers/scan.py)
   └─ Check Redis cache → HIT: return cached product
   └─ MISS: call barcode_service.py

3. barcode_service.py
   └─ GET https://world.openfoodfacts.org/api/v0/product/{barcode}
   └─ Extract: name, brand, ingredients_text, nutrients, allergens_tags
   └─ Normalise into internal ProductSchema

4. ingredient_parser.py
   └─ Tokenise raw ingredient string
   └─ Match against allergens.json + additives.json
   └─ Return structured IngredientList with flags

5. allergen_service.py
   └─ Cross-reference detected allergens vs user profile
   └─ Add personalised warnings

6. llm_service.py
   └─ Build prompt from prompts/safety_verdict.txt template
   └─ Inject: product name, ingredients, allergens, nutrition, user_prefs
   └─ Call Claude / GPT-4o → receive JSON response
   └─ Validate response schema (Pydantic)
   └─ Return: { verdict, explanation, flags[], action }

7. Backend
   └─ Write to Redis (TTL: 24h)
   └─ Write to PostgreSQL (product_cache table)
   └─ Return full ScanResult to frontend

8. Frontend (Result.tsx)
   └─ Render VerdictCard, IngredientList, AllergenFlags, NutritionPanel
```

---

## 5. Data Flow — Label OCR Scan

```
1. Frontend (LabelUploader.tsx)
   └─ User uploads/captures image
   └─ POST /scan/label (multipart/form-data) { image: File, user_id }

2. Backend
   └─ Save image temporarily to S3 (signed URL, TTL: 1h)
   └─ Pass S3 URL to ocr_service.py

3. ocr_service.py
   └─ Call Google Cloud Vision API (document_text_detection)
   └─ If Vision fails or returns low confidence → Tesseract fallback
   └─ Return raw extracted text + confidence score

4. translation_service.py
   └─ Detect language (Vision API or langdetect)
   └─ If not English → call translation API (LibreTranslate / DeepL)
   └─ Return English text

5. ingredient_parser.py
   └─ Extract ingredient block from full label text
   └─ Tokenise and normalise
   └─ Match additives, allergens

6. → Same as Barcode flow steps 5–8
```

---

## 6. LLM Prompt Schema

The LLM is given **structured input only**. No raw OCR text is passed. Prompt is assembled from a template file (`prompts/safety_verdict.txt`).

**Input sent to LLM:**
```json
{
  "product_name": "Oreo Original",
  "brand": "Nabisco",
  "ingredients": ["enriched flour", "sugar", "palm oil", "cocoa", "high fructose corn syrup", "soy lecithin"],
  "allergens_detected": ["gluten", "soy"],
  "nutrition": {
    "calories_per_100g": 480,
    "sugar_g": 36,
    "salt_g": 0.6,
    "fat_g": 20,
    "saturated_fat_g": 6
  },
  "additives": [{ "code": "E322", "name": "Soy Lecithin", "risk": "low" }],
  "user_preferences": {
    "allergies": ["soy"],
    "diet": ["vegan"]
  }
}
```

**Expected LLM JSON output (validated via Pydantic):**
```json
{
  "verdict": "avoid",
  "verdict_reason": "Contains soy lecithin — directly conflicts with your soy allergy.",
  "explanation": "This product contains soy lecithin and enriched wheat flour. It is not suitable for your dietary profile.",
  "flags": [
    { "type": "allergen", "ingredient": "soy lecithin", "severity": "high" },
    { "type": "allergen", "ingredient": "gluten (wheat)", "severity": "high" },
    { "type": "nutrition", "label": "High Sugar", "value": "36g per 100g" }
  ],
  "action": "Do not consume. Check for alternatives without soy derivatives.",
  "confidence": 0.95,
  "disclaimer": "This is informational only and not medical advice."
}
```

---

## 7. Database Schema

```sql
-- Products (cached from OpenFoodFacts or OCR)
CREATE TABLE products (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barcode         VARCHAR(50) UNIQUE,
  name            TEXT NOT NULL,
  brand           TEXT,
  ingredients_raw TEXT,
  ingredients_parsed JSONB,
  nutrition       JSONB,
  allergens       TEXT[],
  additives       JSONB,
  source          VARCHAR(20) CHECK (source IN ('openfoodfacts', 'ocr')),
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- Users
CREATE TABLE users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email           TEXT UNIQUE,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- User Preferences
CREATE TABLE user_preferences (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
  allergies       TEXT[],
  dietary_prefs   TEXT[],
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- Scan History
CREATE TABLE scan_history (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
  product_id      UUID REFERENCES products(id),
  verdict         VARCHAR(10) CHECK (verdict IN ('safe', 'caution', 'avoid')),
  llm_response    JSONB,
  scanned_at      TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_scan_history_user ON scan_history(user_id, scanned_at DESC);
CREATE INDEX idx_products_barcode ON products(barcode);
```

---

## 8. API Contract

### POST /scan/barcode
```
Request:  { barcode: string, user_id?: string }
Response: ScanResult (see LLM output schema above + product metadata)
Errors:   404 if barcode not in OpenFoodFacts, 422 on validation failure
```

### POST /scan/label
```
Request:  multipart/form-data { image: File, user_id?: string }
Response: ScanResult
Errors:   400 if image cannot be processed, 422 on OCR failure
```

### GET /product/:id
```
Response: Cached product metadata (no LLM verdict, raw data only)
```

### POST /user/profile
```
Request:  { user_id: string, allergies: string[], dietary_prefs: string[] }
Response: { success: true, user_id: string }
```

### GET /user/history
```
Query:    ?user_id=xxx&limit=10
Response: ScanHistory[] (last N scans with verdict + product name)
```

---

## 9. Caching Strategy

| Layer | What | TTL | Invalidation |
|---|---|---|---|
| Redis | Full ScanResult per barcode | 24 hours | On OpenFoodFacts data change (manual or webhook) |
| Redis | LLM verdict per (product_id + user_pref hash) | 1 hour | On user profile update |
| PostgreSQL | Product metadata | Permanent | Manual admin update |
| Browser | User profile (Zustand persist) | Session | On profile update |

---

## 10. Environment Variables

```bash
# Backend
DATABASE_URL=postgresql://user:pass@localhost:5432/foodsense
REDIS_URL=redis://localhost:6379
GOOGLE_CLOUD_VISION_API_KEY=
ANTHROPIC_API_KEY=
OPENAI_API_KEY=                  # fallback
LIBRETRANSLATE_URL=              # self-hosted or cloud
S3_BUCKET_NAME=
S3_ACCESS_KEY=
S3_SECRET_KEY=
S3_ENDPOINT_URL=                 # for non-AWS S3-compatible

# Frontend
VITE_API_BASE_URL=https://api.foodsense.ai
```

---

## 11. Infrastructure

```
Production:
  Frontend  → Vercel (auto-deploy on main branch)
  Backend   → AWS ECS (Fargate) or single EC2 + Docker Compose
  Database  → AWS RDS PostgreSQL (t3.micro for MVP)
  Cache     → AWS ElastiCache Redis (t3.micro)
  Storage   → AWS S3 (images bucket, lifecycle: delete after 1h)
  CDN       → Cloudfront (frontend assets)

Local Dev:
  docker-compose up → spins Postgres + Redis
  Frontend: npm run dev (Vite HMR)
  Backend:  uvicorn main:app --reload
```

---

## 12. Third-Party Service Dependency Map

| Service | Purpose | Fallback |
|---|---|---|
| OpenFoodFacts API | Barcode product data | OCR flow |
| Google Cloud Vision | Label OCR | Tesseract (local) |
| Anthropic Claude | LLM explanation | OpenAI GPT-4o |
| LibreTranslate / DeepL | Translation | Skip, flag language warning |
| AWS S3 | Image staging | Local disk (dev only) |

---

*This document reflects MVP architecture. Architectural decisions are intentionally conservative — favour operational simplicity over premature optimisation.*
