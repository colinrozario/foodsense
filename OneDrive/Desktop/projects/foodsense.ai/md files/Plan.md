# foodsense.ai — Step-by-Step Build Plan
> Directed at a vibe coding platform (Cursor, Lovable, Replit Agent, etc.)
> Read this in full before writing a single line of code. Follow the steps in order.

---

## How to Use This Plan

Each step is an atomic unit of work. Complete it fully, verify it works, then move to the next. Do not skip steps. Do not combine steps. If a step produces an error, fix it before continuing.

Steps marked **[VERIFY]** require you to manually confirm the output before proceeding.

---

## PHASE 0 — Project Scaffolding

### Step 0.1 — Create the monorepo structure
```
Create a root directory called `foodsense/`.
Inside it, create two subdirectories: `frontend/` and `backend/`.
Create a root `README.md` and a root `.gitignore` (Node, Python, .env).
Initialise a git repository at the root.
```

### Step 0.2 — Scaffold the frontend
```
Inside `frontend/`, initialise a new Vite project:
  - Framework: React
  - Language: TypeScript (strict mode)

Install these dependencies:
  npm install:
    axios
    react-router-dom
    zustand
    @zxing/library
    react-webcam
    browser-image-compression
    clsx

  npm install -D:
    tailwindcss
    postcss
    autoprefixer
    @types/react
    @types/react-dom

Initialise Tailwind CSS (`npx tailwindcss init -p`).
Configure `tailwind.config.ts` to scan `./src/**/*.{ts,tsx}`.
Add Tailwind directives to `src/index.css`.
Set `strict: true` in `tsconfig.json`.
```

### Step 0.3 — Scaffold the backend
```
Inside `backend/`, create a Python virtual environment.
Install these packages (pin to specific versions):
  fastapi
  uvicorn[standard]
  sqlalchemy
  alembic
  psycopg2-binary
  redis
  pydantic
  pydantic-settings
  python-multipart
  httpx
  anthropic
  openai
  google-cloud-vision
  boto3
  python-magic
  langdetect
  pillow
  pytesseract
  pytest
  pytest-asyncio
  ruff
  mypy

Create `requirements.txt` from the installed packages.
Create `backend/.env.example` with all required environment variable keys (no values).
```

### Step 0.4 — Set up Docker Compose for local development
```
Create `docker-compose.yml` at the root with two services:
  - postgres: image postgres:15, port 5432, env POSTGRES_DB=foodsense POSTGRES_USER=foodsense POSTGRES_PASSWORD=foodsense
  - redis: image redis:7-alpine, port 6379

Create `backend/Dockerfile`:
  - Base: python:3.11-slim
  - Copy requirements.txt, install dependencies
  - Copy backend/ directory
  - CMD: uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

**[VERIFY]** Run `docker-compose up`. Confirm PostgreSQL and Redis start without errors.

---

## PHASE 1 — Backend Foundation

### Step 1.1 — Create the FastAPI application entry point
```
Create `backend/main.py`:
  - Initialise FastAPI app with title "foodsense API" and version "1.0.0"
  - Add CORSMiddleware: allow_origins from env (default: ["http://localhost:5173"])
  - Add health check endpoint: GET /health → { "status": "ok" }
  - Mount routers (empty for now): /scan, /product, /user
  - Add startup event that tests DB connection
```

### Step 1.2 — Create settings configuration
```
Create `backend/config.py` using pydantic-settings:
  - DATABASE_URL: str
  - REDIS_URL: str
  - GOOGLE_CLOUD_VISION_API_KEY: str
  - ANTHROPIC_API_KEY: str
  - OPENAI_API_KEY: str = ""
  - S3_BUCKET_NAME: str = ""
  - S3_ACCESS_KEY: str = ""
  - S3_SECRET_KEY: str = ""
  - S3_ENDPOINT_URL: str = ""
  - ALLOWED_ORIGINS: list[str] = ["http://localhost:5173"]
  - DEBUG: bool = False

Load settings as a singleton `get_settings()` function.
```

### Step 1.3 — Set up database models and migrations
```
Create `backend/db/session.py`:
  - SQLAlchemy async engine connected to DATABASE_URL
  - SessionLocal factory
  - get_db() dependency injection function

Create `backend/models/product.py`:
  - Product model with all columns from the schema in architecture.md

Create `backend/models/user.py`:
  - User, UserPreferences, ScanHistory models from architecture.md

Initialise Alembic:
  - Run: alembic init backend/db/migrations
  - Configure alembic.ini to use DATABASE_URL from env
  - Create initial migration: alembic revision --autogenerate -m "initial_schema"
  - Run migration: alembic upgrade head
```

**[VERIFY]** Connect to PostgreSQL. Confirm all four tables exist: `products`, `users`, `user_preferences`, `scan_history`.

### Step 1.4 — Create Pydantic schemas
```
Create `backend/schemas/scan.py`:
  - BarcodeRequest: barcode: str, user_id: Optional[str]
  - LabelScanRequest: user_id: Optional[str]
  - FlagItem: type: str, ingredient: str, severity: str
  - VerdictResponse: verdict: Literal["safe","caution","avoid"], verdict_reason: str, explanation: str, flags: list[FlagItem], action: str, confidence: float, disclaimer: str
  - ScanResult: product_name, brand, ingredients, allergens_detected, nutrition, additives, verdict_response: VerdictResponse, source: str

Create `backend/schemas/user.py`:
  - UserProfileCreate: user_id, allergies: list[str], dietary_prefs: list[str]
  - HistoryItem: product_name, verdict, scanned_at
```

### Step 1.5 — Create the internal data files
```
Create `backend/data/allergens.json`:
  An array of allergen objects:
  [
    { "name": "gluten", "keywords": ["wheat", "barley", "rye", "oats", "spelt", "gluten"] },
    { "name": "soy", "keywords": ["soy", "soya", "soybean", "soy lecithin"] },
    { "name": "dairy", "keywords": ["milk", "lactose", "whey", "casein", "butter", "cream", "cheese"] },
    { "name": "nuts", "keywords": ["peanut", "almond", "cashew", "walnut", "hazelnut", "pecan", "pistachio"] },
    { "name": "shellfish", "keywords": ["shrimp", "crab", "lobster", "prawn", "shellfish"] },
    { "name": "eggs", "keywords": ["egg", "albumen", "ovalbumin"] },
    { "name": "fish", "keywords": ["cod", "salmon", "tuna", "anchovy", "fish sauce"] },
    { "name": "sesame", "keywords": ["sesame", "tahini"] }
  ]

Create `backend/data/additives.json`:
  An object mapping E-numbers to name and risk level:
  {
    "E102": { "name": "Tartrazine", "type": "colorant", "risk": "medium", "notes": "May cause hyperactivity in children" },
    "E110": { "name": "Sunset Yellow", "type": "colorant", "risk": "medium" },
    "E211": { "name": "Sodium Benzoate", "type": "preservative", "risk": "medium" },
    "E250": { "name": "Sodium Nitrite", "type": "preservative", "risk": "high", "notes": "Linked to colorectal cancer at high intake" },
    "E320": { "name": "BHA", "type": "antioxidant", "risk": "medium" },
    "E322": { "name": "Lecithin", "type": "emulsifier", "risk": "low" },
    "E621": { "name": "MSG", "type": "flavour_enhancer", "risk": "low" }
    // Add at minimum 30 common E-numbers
  }
```

---

## PHASE 2 — Core Services

### Step 2.1 — Build the Barcode Service
```
Create `backend/services/barcode_service.py`:

async function `fetch_product_by_barcode(barcode: str) -> dict | None`:
  1. Validate barcode matches pattern ^[0-9]{8,14}$. Raise ValueError if not.
  2. Call: GET https://world.openfoodfacts.org/api/v0/product/{barcode}.json
     - Timeout: 3 seconds
     - Use httpx.AsyncClient
  3. If status != 200 or product_status != 1: return None
  4. Extract from response:
     - product_name, brands, ingredients_text, nutriments, allergens_tags
  5. Normalise nutriments into: { calories, sugar_g, salt_g, fat_g, saturated_fat_g }
  6. Return normalised dict
  Wrap entire function in try/except. Log errors. Return None on any failure.
```

**[VERIFY]** Test with barcode `5901234123457` (Wedel chocolate). Confirm product name and ingredients are returned.

### Step 2.2 — Build the Ingredient Parser Service
```
Create `backend/services/ingredient_parser.py`:

Load allergens.json and additives.json at module import time.

function `parse_ingredients(raw_text: str) -> list[dict]`:
  1. Lowercase the raw_text.
  2. Remove content inside parentheses (recursive).
  3. Split on commas and semicolons.
  4. Strip each token of leading/trailing whitespace and punctuation.
  5. Return list of { "name": token, "normalised": token.lower().strip() }

function `detect_allergens(ingredients: list[dict]) -> list[str]`:
  For each ingredient, check if any allergen keyword is a substring of the ingredient name.
  Return list of unique allergen names detected.

function `detect_additives(ingredients: list[dict]) -> list[dict]`:
  Match ingredient names against E-number patterns (E followed by 3 digits).
  Look up matched codes in additives dict.
  Return list of { code, name, type, risk }.

function `cross_check_user_allergens(detected: list[str], user_allergies: list[str]) -> list[str]`:
  Return intersection of detected allergens and user's declared allergies.
  These are HIGH severity flags.
```

**[VERIFY]** Test with: `"Wheat flour, Sugar, Palm oil, E322 (Soy Lecithin), Salt"`. Should detect: gluten, soy. Should detect E322 as Lecithin.

### Step 2.3 — Build the OCR Service
```
Create `backend/services/ocr_service.py`:

async function `extract_text_from_image(image_bytes: bytes) -> tuple[str, float]`:
  Returns (extracted_text, confidence_score).

  Primary path - Google Cloud Vision:
    1. Initialise google.cloud.vision.ImageAnnotatorClient
    2. Call document_text_detection with image bytes
    3. Extract full_text_annotation.text and average confidence
    4. Return (text, confidence)

  Fallback path (if Vision fails or confidence < 0.5):
    1. Open image with PIL
    2. Convert to grayscale
    3. Apply contrast enhancement (factor 1.5)
    4. Run pytesseract.image_to_data() with output_type=dict
    5. Calculate mean confidence from non-empty words
    6. Return (text, confidence)

  If both fail: raise OCRFailedError with message.
```

### Step 2.4 — Build the Translation Service
```
Create `backend/services/translation_service.py`:

function `detect_language(text: str) -> str`:
  Use langdetect library.
  Return ISO 639-1 language code (e.g., "fr", "de", "zh").
  If detection fails, return "unknown".

async function `translate_to_english(text: str, source_lang: str) -> str`:
  If source_lang == "en": return text unchanged.
  Call LibreTranslate API (or DeepL if configured).
  If translation fails: log warning, return original text with a flag in the result.
  Timeout: 3 seconds.
```

### Step 2.5 — Build the LLM Service
```
Create `backend/services/llm_service.py`:

Load prompt template from `backend/prompts/safety_verdict.txt` at module import.

Create `backend/prompts/safety_verdict.txt` with this content:
---
SYSTEM:
You are a food safety assistant. You receive structured data about a packaged food product and a user's dietary profile. You return a JSON object with a safety verdict.

Rules:
- Be conservative. When in doubt, flag as "caution".
- Never give medical advice.
- Always include the disclaimer field.
- verdict must be exactly one of: "safe", "caution", "avoid".
- If ingredients suggest a user's allergy is present, verdict must be "avoid".
- Respond ONLY with valid JSON. No preamble, no markdown.

USER:
Analyse this product for the user:

Product: {product_name} by {brand}
Ingredients: {ingredients_list}
Allergens detected: {allergens_detected}
User allergies: {user_allergies}
User dietary preferences: {user_dietary_prefs}
Nutritional highlights (per 100g):
  Calories: {calories} kcal
  Sugar: {sugar_g}g
  Salt: {salt_g}g
  Fat: {fat_g}g

Additives detected: {additives_list}

Return JSON with this exact structure:
{
  "verdict": "safe|caution|avoid",
  "verdict_reason": "One sentence explaining the verdict.",
  "explanation": "2-3 sentences in plain English for a non-expert.",
  "flags": [
    { "type": "allergen|nutrition|additive", "ingredient": "name", "severity": "high|medium|low" }
  ],
  "action": "What the user should do.",
  "confidence": 0.0 to 1.0,
  "disclaimer": "This is informational only and not medical advice. Consult the manufacturer for severe allergy concerns."
}
---

async function `get_verdict(context: PromptContext) -> VerdictResponse`:
  1. Fill template with context fields.
  2. Check token estimate. If > 1500 tokens, truncate ingredients list to first 50 items.
  3. Call Anthropic Claude API (claude-sonnet-4-20250514, max_tokens=800).
  4. Parse response text as JSON.
  5. Validate against VerdictResponse Pydantic model.
  6. If confidence < 0.7: downgrade verdict (safe→caution, caution→avoid).
  7. Return VerdictResponse.
  On any failure: raise LLMFailedError.
```

**[VERIFY]** Test `get_verdict` with a mock product context. Confirm the returned object matches VerdictResponse schema.

---

## PHASE 3 — API Routers

### Step 3.1 — Build the Scan Router
```
Create `backend/routers/scan.py`:

POST /scan/barcode:
  1. Validate BarcodeRequest (Pydantic).
  2. Check Redis for key f"scan:{barcode}:{user_pref_hash}".
  3. If cache hit: return cached ScanResult.
  4. Call barcode_service.fetch_product_by_barcode().
  5. If None: return 404 { error: "BARCODE_NOT_FOUND" }.
  6. Call ingredient_parser.parse_ingredients() on ingredients_text.
  7. Call allergen_service.detect_allergens() and detect_additives().
  8. Get user preferences from DB if user_id provided.
  9. Call llm_service.get_verdict() with assembled context.
  10. Assemble ScanResult.
  11. Write to Redis (TTL: 86400 seconds).
  12. Write to PostgreSQL scan_history if user_id provided.
  13. Return ScanResult.

POST /scan/label:
  1. Accept multipart/form-data.
  2. Validate file: type must be image/jpeg, image/png, or image/webp. Size ≤ 5MB.
  3. Upload to S3 (temp bucket, TTL lifecycle 1h).
  4. Call ocr_service.extract_text_from_image() with file bytes.
  5. If confidence < 0.4: return 400 { error: "IMAGE_QUALITY_TOO_LOW", message: "Please retake the photo with better lighting." }
  6. Call translation_service.detect_language() and translate if needed.
  7. Call ingredient_parser.parse_ingredients() on translated text.
  8. Continue same as barcode flow from step 7.
  9. Return ScanResult.
  After response sent: delete S3 object.
```

### Step 3.2 — Build the User Router
```
Create `backend/routers/user.py`:

POST /user/profile:
  1. Validate UserProfileCreate.
  2. Upsert into user_preferences table (insert or update on conflict).
  3. Return { success: true, user_id }.

GET /user/history:
  1. Query param: user_id (required), limit (default 10, max 10).
  2. Return last N scan_history records for user, joined with product name and verdict.
  3. Return list[HistoryItem].
```

### Step 3.3 — Build the Product Router
```
Create `backend/routers/product.py`:

GET /product/{product_id}:
  1. Query products table by UUID.
  2. If not found: return 404.
  3. Return product metadata (no LLM verdict — raw data only).
```

**[VERIFY]** Use a REST client (Bruno or curl). Hit all five endpoints. Confirm correct responses and error shapes.

---

## PHASE 4 — Frontend Core

### Step 4.1 — Set up the router and layout
```
Create `src/router.tsx` with React Router v6:
  Routes:
    / → Home.tsx
    /scan/barcode → ScanBarcode.tsx
    /scan/label → ScanLabel.tsx
    /result → Result.tsx (receives state via router location.state)
    /profile → Profile.tsx
    /history → History.tsx

Create `src/components/layout/PageWrapper.tsx`:
  - Full height container
  - Max-width 480px centered
  - Background: white or off-white
  - Bottom padding to account for BottomNav

Create `src/components/layout/BottomNav.tsx`:
  - Fixed bottom navigation
  - 3 tabs: Scan (home icon), History (clock icon), Profile (user icon)
  - Active state styling
  - 44px minimum height tap targets
```

### Step 4.2 — Set up the API client
```
Create `src/api/client.ts`:
  - Axios instance with baseURL from VITE_API_BASE_URL env var
  - Default timeout: 10000ms
  - Request interceptor: add Content-Type: application/json
  - Response interceptor: on error, extract error.response.data.error.message and re-throw as typed ApiError

Create `src/types/scan.types.ts`:
  - Mirror the Pydantic schemas: FlagItem, VerdictResponse, ScanResult

Create `src/types/user.types.ts`:
  - UserProfile: { user_id: string, allergies: string[], dietaryPrefs: string[] }
  - HistoryItem: { product_name: string, verdict: "safe"|"caution"|"avoid", scanned_at: string }

Create `src/api/scan.ts`:
  - scanBarcode(barcode: string, userId?: string): Promise<ScanResult>
  - scanLabel(image: File, userId?: string): Promise<ScanResult>

Create `src/api/user.ts`:
  - saveProfile(profile: UserProfile): Promise<void>
  - getHistory(userId: string, limit?: number): Promise<HistoryItem[]>
```

### Step 4.3 — Build the Zustand stores
```
Create `src/store/profileStore.ts`:
  State:
    - userId: string (generate UUID on first load if not present)
    - allergies: string[]
    - dietaryPrefs: string[]
  Actions:
    - setAllergies(allergies: string[])
    - setDietaryPrefs(prefs: string[])
  Persist: localStorage key "foodsense_profile"

Create `src/store/historyStore.ts`:
  State:
    - history: { result: ScanResult, scannedAt: string }[]
  Actions:
    - addScan(result: ScanResult)
    - clearHistory()
  Persist: localStorage key "foodsense_history"
  Max 10 entries (slice on add)
```

### Step 4.4 — Build the UI design system primitives
```
Create these components in `src/components/ui/`:

Button.tsx:
  Props: variant ("primary"|"secondary"|"ghost"), size ("sm"|"md"|"lg"), loading: boolean, disabled: boolean
  Loading state: replace children with spinner + "Processing..." text, disable the button

Card.tsx:
  Props: className, children
  Simple rounded-xl shadow-sm border wrapper

Badge.tsx:
  Props: variant ("safe"|"caution"|"avoid"|"allergen"|"additive"), label: string
  safe → green, caution → amber, avoid → red, allergen → red, additive → orange

Spinner.tsx:
  Animated circular spinner, size prop

Modal.tsx:
  Overlay + centered card, close on backdrop click
```

### Step 4.5 — Build the Home page
```
Create `src/pages/Home.tsx`:
  Layout:
    - Top: App name "foodsense" + tagline "Stop eating blind."
    - Center: Two large action cards:
        "Scan Barcode" → navigates to /scan/barcode
        "Scan Label" → navigates to /scan/label
    - Below: Small text: "Last scan: {last scan name if exists}"
    - No clutter. This is the entry point.
```

### Step 4.6 — Build the Barcode Scanner page
```
Create `src/pages/ScanBarcode.tsx`:

  Use the ZXing BrowserMultiFormatReader.
  
  On mount:
    1. Request camera permission.
    2. Start decoding from video stream.
    3. On successful decode: stop camera, call scanBarcode() API, navigate to /result with result in state.
    4. Show loading state while API call is in progress.
    5. On error: show retry button.
  
  On unmount: ALWAYS stop the media stream and reset the reader.
  
  UI:
    - Full-screen camera viewfinder with a centered scan frame (rectangle overlay)
    - Instruction text: "Point camera at barcode"
    - Cancel button (top left) → navigates back

Create `src/hooks/useBarcodeScan.ts`:
  Encapsulate all ZXing logic here. Page component just calls the hook.
```

### Step 4.7 — Build the Label Scanner page
```
Create `src/pages/ScanLabel.tsx`:
  
  Two modes:
    A. "Take Photo" → opens device camera using <input type="file" accept="image/*" capture="environment">
    B. "Upload Image" → file picker (no capture attribute)
  
  On image selected:
    1. Show preview thumbnail.
    2. Compress image using browser-image-compression (max 1200px, quality 0.8).
    3. Show compressed file size.
    4. "Analyse Label" button → calls scanLabel() API → navigate to /result.
    5. Loading state during upload + processing.
    6. Error state with retry if API fails.
```

### Step 4.8 — Build the Result page
```
Create `src/pages/Result.tsx`:
  
  Receives ScanResult from router state. If no state, redirect to /.
  
  On mount: call historyStore.addScan(result).
  
  Layout (top to bottom):
    1. VerdictCard.tsx — ABOVE THE FOLD, full width
    2. Product name + brand
    3. AllergenFlags.tsx — chips for each detected allergen
    4. IngredientList.tsx — scrollable list with flagged items highlighted
    5. NutritionPanel.tsx — calories, sugar, salt, fat as visual bars or text
    6. LLM explanation text (from verdict_response.explanation)
    7. Action recommendation (from verdict_response.action)
    8. Disclaimer text (small, grey, bottom)
    9. "Scan Another" button → navigates to /

Create `src/components/result/VerdictCard.tsx`:
  - Full-width card
  - Background colour based on verdict: safe=#16a34a, caution=#d97706, avoid=#dc2626
  - Large verdict label: "SAFE" / "CAUTION" / "AVOID"
  - verdict_reason text below
  - Must be visible without scrolling on a 375px iPhone screen

Create `src/components/result/AllergenFlags.tsx`:
  - Display each allergen as a red Badge chip
  - Personal allergen matches highlighted with a warning icon
  - If no allergens: show "No allergens detected" in green

Create `src/components/result/IngredientList.tsx`:
  - Collapsible list (first 5 visible, expand to see all)
  - Flagged ingredients (allergens/additives) shown in red/orange with flag icon
  - Unknown/safe ingredients in grey

Create `src/components/result/NutritionPanel.tsx`:
  - Cards for: Calories, Sugar, Salt, Fat
  - Visual indicator if values are high (> thresholds: sugar>20g, salt>1.5g, fat>20g)
```

### Step 4.9 — Build the Profile page
```
Create `src/pages/Profile.tsx`:
  
  Two sections:

  1. Allergies (multi-select):
    Options: Gluten, Dairy, Soy, Nuts, Eggs, Shellfish, Fish, Sesame
    Each option is a toggleable pill/chip.
    Selected state is persisted in profileStore.

  2. Dietary Preferences (multi-select):
    Options: Vegan, Vegetarian, Halal, Kosher, Keto, Sugar-Conscious, Low-Sodium
    Same toggleable pill pattern.

  "Save Preferences" button:
    - Calls user.saveProfile() API.
    - Shows success toast.
    - Persists to Zustand store.
```

### Step 4.10 — Build the History page
```
Create `src/pages/History.tsx`:

  Load from historyStore (local) and optionally sync from GET /user/history API.
  
  Display list of last 10 scans:
    - Product name
    - Verdict badge (colour-coded)
    - Scanned time (relative: "2 hours ago")
    - Tap → navigate to /result with that result's data in state
  
  If empty: "No scans yet. Scan your first product!" with a CTA button.
```

**[VERIFY]** Complete a full scan flow: Scan barcode → view result → check history shows the scan.

---

## PHASE 5 — Integration & Polish

### Step 5.1 — Connect the full barcode flow end-to-end
```
Trace the complete path:
  Frontend: ScanBarcode → scanBarcode() API call
  Backend: POST /scan/barcode → barcode_service → ingredient_parser → allergen_service → llm_service → ScanResult
  Frontend: Navigate to Result page with ScanResult

Test with 5 different barcodes of products you have physically.
Fix any type mismatches between frontend ScanResult type and backend response shape.
```

### Step 5.2 — Connect the full OCR flow end-to-end
```
Same trace as 5.1 but for:
  Frontend: ScanLabel → scanLabel() API call (multipart)
  Backend: POST /scan/label → ocr_service → translation_service → ingredient_parser → allergen_service → llm_service → ScanResult
  Frontend: Navigate to Result page

Test with 5 label photos: one English, one French, one German, one blurry image, one very dense ingredient list.
```

### Step 5.3 — Add loading and error states across the app
```
Verify every async operation has:
  ✓ Loading spinner while pending
  ✓ Error message if it fails (not a JS alert — a UI component)
  ✓ Retry option where appropriate

Specifically check:
  - Barcode scanner initialisation (camera permission denied → graceful message)
  - scanBarcode API call failure → "Product not found. Try scanning the label."
  - scanLabel API call failure → "Label could not be read. Please try again."
  - LLM failure → "Analysis unavailable right now. Raw ingredients are shown below."
  - Profile save failure → toast error
```

### Step 5.4 — Add Redis caching verification
```
Make the same barcode scan twice.
Measure response time for first scan vs second scan.
Second scan must be significantly faster (< 500ms vs < 2s).
Log a [CACHE HIT] message server-side for verification.
```

### Step 5.5 — Mobile UI audit
```
Open the app on a real mobile device or Chrome DevTools mobile emulator (iPhone SE: 375×667).
Check every page:
  ✓ No horizontal scroll
  ✓ All text readable (min 14px body, 16px inputs)
  ✓ All tap targets ≥ 44px height
  ✓ Bottom nav doesn't obscure content
  ✓ VerdictCard is visible without scrolling on Result page
  ✓ Barcode viewfinder fills the screen properly
  ✓ Keyboard doesn't break layout on Profile page
Fix any layout issues before proceeding.
```

---

## PHASE 6 — Testing

### Step 6.1 — Write backend unit tests
```
Create `backend/tests/test_ingredient_parser.py`:
  - Test: English ingredient string → correct tokens
  - Test: Ingredient with E322 → detects Soy Lecithin additive
  - Test: "Contains: wheat, milk, soy" → detects gluten, dairy, soy allergens
  - Test: Empty string → returns empty list, no crash

Create `backend/tests/test_barcode_service.py`:
  - Test: Valid barcode format passes validation
  - Test: Invalid barcode (letters) raises ValueError
  - Test: OpenFoodFacts 200 response → normalised product dict
  - Test: OpenFoodFacts 404 → returns None (mock httpx)

Create `backend/tests/test_llm_service.py`:
  - Test: Properly formatted context → valid VerdictResponse (mock Anthropic API)
  - Test: LLM returns invalid JSON → raises LLMFailedError
  - Test: confidence < 0.7 → verdict is downgraded

Run: pytest backend/tests/ -v
All tests must pass.
```

### Step 6.2 — Write frontend type checks
```
Run: npx tsc --noEmit
Fix all TypeScript errors. Zero errors required before shipping.
```

### Step 6.3 — Run linting
```
Backend: ruff check backend/ — fix all issues
Frontend: npx eslint src/ — fix all issues
```

---

## PHASE 7 — Deployment

### Step 7.1 — Set up GitHub Actions CI
```
Create `.github/workflows/ci.yml`:
  Triggers: on push to any branch, on PR to main.
  Jobs:
    frontend-checks:
      - npm ci
      - npx tsc --noEmit
      - npx eslint src/
      - npm run build (must succeed)
    backend-checks:
      - pip install -r requirements.txt
      - ruff check backend/
      - mypy backend/
      - pytest backend/tests/ -v
```

### Step 7.2 — Deploy frontend to Vercel
```
Connect GitHub repo to Vercel.
Set:
  Framework: Vite
  Root directory: frontend/
  Build command: npm run build
  Output directory: dist/
Add environment variable: VITE_API_BASE_URL = your production backend URL
Deploy. Verify the app loads on the Vercel URL.
```

### Step 7.3 — Deploy backend to AWS
```
Option A (simple): EC2 t3.micro
  1. Install Docker on EC2.
  2. Pull repo, run docker-compose up -d (with production .env).
  3. Use Nginx as reverse proxy on port 80/443.
  4. SSL via Let's Encrypt (certbot).

Option B (scalable): ECS Fargate
  1. Push Docker image to ECR (tag with git SHA).
  2. Create ECS task definition.
  3. Deploy service.
  4. Use Application Load Balancer in front.

Either way: set all environment variables via AWS Secrets Manager or EC2 .env file.
Run: alembic upgrade head on the production database after first deploy.
```

### Step 7.4 — Smoke test production
```
On the live production URL, perform:
  ✓ Barcode scan of a known product (e.g., Coca-Cola: 5449000000996)
  ✓ Label photo upload of a packaged product
  ✓ Profile setup with at least 2 allergies
  ✓ Verify allergen flags appear correctly on result for a product containing that allergen
  ✓ Verify History shows the two scans you just did
  ✓ Verify error state: scan a barcode that doesn't exist
```

---

## PHASE 8 — Post-Launch (Phase 2 Prep)

These are NOT MVP. Document them as backlog tickets after launch:

```
[ ] Improve OCR preprocessing: adaptive thresholding, deskew, denoise
[ ] Add confidence score display on Result page
[ ] Implement full ingredient synonym dictionary
[ ] Add product not found → "Help us add it" flow (barcode submission)
[ ] Add "Compare Products" feature (2 scan results side by side)
[ ] Add nutrition scoring (Nutri-Score or custom)
[ ] Improve LLM prompt with few-shot examples
[ ] Add rate limiting on scan endpoints (per IP: 30/hour)
[ ] User authentication (email/password or OAuth)
[ ] Full i18n for UI (i18next)
```

---

## Build Checklist Before Shipping

```
[ ] All 5 API endpoints return correct responses and error shapes
[ ] Full barcode scan flow works end-to-end in production
[ ] Full OCR scan flow works end-to-end in production
[ ] Verdict card is visually unambiguous (correct colors)
[ ] Allergen flags correctly reflect user profile
[ ] Redis cache is working (second scan is fast)
[ ] No TypeScript errors (tsc --noEmit passes)
[ ] All backend tests pass (pytest)
[ ] Mobile UI tested at 375px width — no layout issues
[ ] Images deleted from S3 after processing
[ ] No secrets in git history
[ ] CI pipeline passes on GitHub Actions
[ ] Production smoke test completed (Phase 7.4)
```

---

*Follow this plan sequentially. Ship Phase 1-7 before writing a single line of Phase 8.*
