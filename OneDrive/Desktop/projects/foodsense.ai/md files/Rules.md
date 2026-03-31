# foodsense.ai — Engineering & Design Rules
> These are non-negotiable constraints for building a shippable MVP. Every rule exists because its absence causes bugs, scope creep, security issues, or a product that cannot be shipped.

---

## SECTION A — General Engineering Rules

### A1. TypeScript is mandatory on the frontend. No exceptions.
All `.ts` and `.tsx` files must have strict mode enabled. No `any` types. No `@ts-ignore` without a written comment explaining why. Every API response must be typed via shared Pydantic/TypeScript schema alignment.

### A2. Python type hints are mandatory on the backend.
Every function signature must have typed parameters and return types. Use `pydantic` models for all request/response schemas. Never pass `dict` where a typed model belongs.

### A3. Never hardcode secrets. Ever.
All API keys, database URLs, and credentials live in `.env` files. `.env` files are never committed to version control. The `.env.example` file is always kept up to date and committed.

### A4. All external API calls must be wrapped in try/except (backend) or try/catch (frontend).
Every call to OpenFoodFacts, Google Vision, LLM, or translation services must handle failure gracefully. Return a typed error response to the client. Never let an unhandled exception crash the server.

### A5. Validate all inputs — on both client AND server.
Frontend validation is for UX. Backend validation is for security. Never rely on frontend validation alone. Use Pydantic on every FastAPI endpoint. Reject malformed input with a 422 response and clear error message.

### A6. No direct database queries outside of the service layer.
Routers call services. Services call the DB layer. Routers never import SQLAlchemy session directly. This separation makes testing possible.

### A7. Redis caching must be applied before any LLM call.
The LLM is the most expensive operation in the pipeline. Before calling the LLM, always check Redis for a cached response keyed on `product_id + sha256(user_preferences)`. Cache hits must return within 100ms.

### A8. Every endpoint returns a consistent response envelope.
Success:
```json
{ "success": true, "data": { ... } }
```
Error:
```json
{ "success": false, "error": { "code": "BARCODE_NOT_FOUND", "message": "..." } }
```
Never return raw exceptions or Python tracebacks to the client.

### A9. Image files must never be stored permanently.
Images uploaded for OCR are staged in S3 with a lifecycle policy of 1 hour. After OCR completes, the reference is deleted. No user photos are retained beyond the processing window.

### A10. Write tests for every service function.
Minimum coverage targets:
- `ingredient_parser.py`: 90%+
- `allergen_service.py`: 90%+
- `llm_service.py`: 80%+ (mock LLM responses in tests)
- `barcode_service.py`: 80%+
- `ocr_service.py`: 70%+ (integration test with real images)

---

## SECTION B — LLM Rules

### B1. The LLM receives only structured, sanitised data. Never raw text.
Raw OCR output, raw label photos, and raw barcode data are pre-processed before reaching the LLM prompt. The LLM prompt must be assembled from typed fields in `PromptContext` schema — not by string concatenation of raw input.

### B2. LLM output must always be parsed against a strict Pydantic schema.
If the LLM returns a response that does not conform to the `VerdictResponse` Pydantic model, do not surface it to the user. Log the raw response and return a `ANALYSIS_FAILED` error to the client.

### B3. Prompt templates live in files, not code.
The system prompt and user prompt templates are stored in `backend/prompts/safety_verdict.txt`. They are loaded at startup. Changing the prompt does not require a code deployment.

### B4. The LLM must always be instructed to include a disclaimer.
The system prompt must contain explicit instruction: *"Always include a disclaimer that this is not medical advice and users with severe allergies should consult the manufacturer."* The `disclaimer` field in `VerdictResponse` is required, not optional.

### B5. Conservative by default.
If the LLM confidence score is below 0.7, the verdict is downgraded:
- `safe` → `caution`
- `caution` → `avoid`
Surfaced to the user as: *"We're not fully certain — treat this as a cautionary flag."*

### B6. Verdict enum is fixed. No creative outputs.
The verdict field must be exactly one of: `"safe"`, `"caution"`, `"avoid"`. Any other value is treated as a parse failure.

### B7. Never expose raw LLM errors to users.
If the LLM API is down or returns a non-200, the user sees a friendly error: *"We couldn't analyse this product right now. Please try again."* LLM errors are logged server-side with full context.

### B8. Implement a token budget.
Max tokens sent to the LLM: 1,500. Max tokens received: 800. If the ingredient list exceeds the budget, truncate and note it in the prompt: *"Ingredients list truncated to first 50 items."*

---

## SECTION C — Frontend Rules

### C1. Mobile-first. Always.
Design starts at 375px. Desktop is an enhancement. No horizontal overflow. Tap targets must be minimum 44×44px. Text must be readable at system font size.

### C2. The scan flow must work in 2 taps from the home screen.
Home → Scan type selection → Camera/Upload. No more than 2 screens before the user can start scanning.

### C3. Loading states are mandatory on every async operation.
Every button that triggers an API call must show a loading spinner immediately on click. Disable the button during loading. Show an error state if the call fails. Never leave the user staring at a frozen UI.

### C4. The verdict card must be visually unambiguous.
- `safe` → Green (#16a34a background or border, white text)
- `caution` → Amber (#d97706)
- `avoid` → Red (#dc2626)

The verdict label must be visible above the fold on any mobile device. No scrolling required to see the verdict.

### C5. No business logic on the frontend.
Allergen matching, ingredient parsing, verdict calculation — all of this happens on the backend. The frontend receives a fully-resolved `ScanResult` and renders it. Never recompute verdict logic in React.

### C6. API calls go through the central `api/client.ts` Axios instance.
Never use raw `fetch()` outside of `api/`. The Axios instance handles: base URL, timeout (10s), auth headers, and global error interceptor. All API functions are typed with request and response types.

### C7. User preferences are stored in Zustand with persistence.
`profileStore.ts` uses `zustand/middleware/persist` to sync to `localStorage`. On first load, the store is hydrated from local storage. When synced to the server, optimistic updates are applied immediately.

### C8. The app must degrade gracefully without a user account.
Anonymous scanning must work. User preferences default to "no restrictions" if no profile exists. History is stored in Zustand local state only for anonymous users.

### C9. ZXing barcode scanning must stop the camera on unmount.
Every `BarcodeReader.tsx` instance must clean up the camera stream in `useEffect` return. Memory leak from an open camera stream is a blocking bug.

### C10. No inline styles. No magic numbers.
All styling goes through Tailwind utility classes. Design tokens (colors, spacing) are defined in `tailwind.config.ts`. If you need a value that doesn't exist in Tailwind, add it to the config — don't inline it.

---

## SECTION D — Security Rules

### D1. CORS is locked to known origins.
The FastAPI backend configures `CORSMiddleware` with an explicit `allow_origins` list. `allow_origins=["*"]` is never used in production.

### D2. File upload size is strictly limited.
Image uploads for OCR are capped at **5MB**. Backend rejects larger files with a 413 error before passing them to any processing service.

### D3. File type validation is enforced server-side.
Accepted image types: `image/jpeg`, `image/png`, `image/webp`. Validation is done on the MIME type from the file bytes (via `python-magic`), not just the file extension. Never trust the client-provided content-type.

### D4. Barcode input is sanitised before use in any query.
Barcode strings must match `/^[0-9]{8,14}$/` before being passed to OpenFoodFacts or any DB query. Reject anything that doesn't match.

### D5. Environment-specific configuration.
`DEBUG=True` is never set in production. Production environment variables are managed via the deployment platform's secret manager (AWS Secrets Manager or Vercel Environment Variables), not `.env` files on servers.

### D6. Database queries use parameterised statements only.
No string formatting or f-string interpolation for SQL. SQLAlchemy ORM handles this automatically. Never use `text()` with user-supplied values.

---

## SECTION E — Data & Privacy Rules

### E1. No PII in logs.
Log files must never contain: email addresses, user IDs in plaintext, or ingredient/scan data that could identify a user's health condition. Log correlation IDs only.

### E2. User emails are optional.
Anonymous usage is fully supported. Email is requested only for account-based history sync. It is never required.

### E3. Scan images are deleted after processing.
S3 lifecycle policy: 1 hour. Post-processing, the image reference is removed from all application state. This must be documented in the privacy policy.

### E4. Dietary preference data is never shared with third parties.
This data (allergies, dietary restrictions) is sensitive health-adjacent information. It is used exclusively for personalising scan results within the app and is never passed to analytics providers, ad networks, or external APIs beyond what is necessary for processing.

---

## SECTION F — Performance Rules

### F1. Total scan-to-result time must be under 5 seconds.
Benchmark targets per operation:
- Barcode lookup (cached): < 200ms
- Barcode lookup (uncached, OpenFoodFacts): < 1.5s
- OCR (Google Vision API): < 2s
- LLM call: < 3s
- Total (uncached OCR path): < 5.5s (acceptable at MVP, optimise in Phase 2)

### F2. Redis is the first check. Always.
Before any external API call (OpenFoodFacts, LLM), check Redis. This rule applies regardless of how unlikely a cache hit seems.

### F3. OpenFoodFacts must have a timeout.
Set a 3-second timeout on the OpenFoodFacts API call. If it times out, fall back to the OCR flow and notify the user: *"Barcode not found — please scan the label directly."*

### F4. Images are compressed client-side before upload.
Before uploading a label photo, compress it client-side to max 1200px on the longest side and 80% JPEG quality using `browser-image-compression`. This reduces upload time and OCR processing cost.

### F5. LLM responses are streamed only if UI supports it.
For MVP, use non-streaming LLM calls for simpler implementation. Do not implement streaming unless the P90 LLM response time exceeds 4 seconds under load.

---

## SECTION G — CI/CD & Deployment Rules

### G1. No direct commits to `main`.
All changes go through a Pull Request. PRs require passing CI (lint + tests) before merge. No force pushes to `main`.

### G2. CI runs on every PR.
GitHub Actions pipeline runs:
1. Frontend: ESLint + TypeScript type check + Vite build
2. Backend: ruff (lint) + mypy (type check) + pytest

### G3. Migrations run before deployment, not after.
Alembic migrations are applied as a pre-deployment step in the CI/CD pipeline. Never deploy application code that references a DB column before running the migration that creates it.

### G4. Docker images are tagged with git SHA.
Never use `latest` as a Docker image tag in production. Tag images with the git commit SHA for full traceability.

### G5. Zero-downtime deployments.
Use rolling deployment or blue/green on ECS. Database migrations must be backward-compatible with the previous app version (no column renames or drops in the same release as a new feature).

---

## SECTION H — Code Quality Rules

### H1. Functions do one thing.
If a function name has "and" in it, split it. `extract_and_translate_ingredients()` should be two functions. Each service function has a single, testable responsibility.

### H2. No function longer than 50 lines.
If a function exceeds 50 lines, refactor it. This is a strong signal it's doing too many things.

### H3. Errors are typed, not stringly-typed.
Define error codes as enums or constants:
```python
class ScanError(str, Enum):
    BARCODE_NOT_FOUND = "BARCODE_NOT_FOUND"
    OCR_FAILED = "OCR_FAILED"
    LLM_PARSE_FAILED = "LLM_PARSE_FAILED"
```
Never return `{ "error": "something went wrong" }` with no code.

### H4. All TODO comments must include a GitHub issue number.
`# TODO: improve OCR preprocessing (#42)` — not `# TODO: fix this later`.

### H5. No commented-out code in PRs.
Delete it. Git history exists for a reason.

---

*These rules are living guidelines. They may be updated as the product matures. Any rule change must be reviewed by a senior engineer and documented with a reason.*
