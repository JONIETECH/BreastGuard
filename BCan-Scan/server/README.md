# BCan-Scan API Server

A lightweight Express proxy that exposes the HuggingFace Gradio space
(`EmmasonMutsaka/BreastCancer-Ai-Screening`) as a simple REST API, primarily
for the BreastGuard Flutter app.

## Why this exists

The Flutter app cannot call the Gradio SDK directly due to CORS restrictions
and mobile HTTP quirks. This server sits between the Flutter app and Gradio —
it accepts a standard `multipart/form-data` POST, calls Gradio on the server
side, and returns clean JSON.

## Running

### Development (API server only)
```bash
npm run server
# Server starts on http://localhost:3001
```

### Development (API server + Vite SPA together)
```bash
npm run dev:all
# Vite SPA → http://localhost:5174
# API server → http://localhost:3001
# Vite proxies /api/* to the API server automatically
```

## Endpoints

### `GET /api/health`
Liveness probe. Flutter uses this to check connectivity before sending a case.

**Response 200:**
```json
{
  "status": "ok",
  "space": "EmmasonMutsaka/BreastCancer-Ai-Screening",
  "timestamp": "2026-06-01T22:52:54.749Z"
}
```

---

### Auth endpoints

The same handlers are exposed locally here and as Vercel serverless functions in `api/auth/`.

#### `POST /api/auth/signup`

Create a new account.

**Request:**
```json
{
  "email": "you@example.com",
  "password": "min-8-chars",
  "fullName": "Your Name"
}
```

**Response 201:**
```json
{
  "user": {
    "id": "...",
    "email": "you@example.com",
    "fullName": "Your Name",
    "role": "CLINICIAN",
    "createdAt": "..."
  }
}
```

#### `POST /api/auth/login`

Authenticate and receive an `httpOnly` cookie. The Flutter app also receives a `token` field for mobile storage.

**Request:**
```json
{
  "email": "you@example.com",
  "password": "..."
}
```

**Response 200:**
```json
{
  "user": { ... },
  "token": "jwt-for-mobile"
}
```

#### `GET /api/auth/me`

Return the current authenticated user. Reads the `httpOnly` cookie or an `Authorization: Bearer <token>` header.

#### `POST /api/auth/logout`

Clear the auth cookie.

---

### `POST /api/inference`
Runs the full AI inference pipeline.

**Request:** `multipart/form-data`

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `image` | File | ✅ | — | PNG or JPG histopathology image (max 10 MB) |
| `age` | string | ❌ | `"45"` | Patient age in years |
| `symptom_dur` | string | ❌ | `"4"` | Symptom duration in weeks |
| `fam_hist` | string | ❌ | `"No"` | `"Yes"` or `"No"` |
| `repro_hist` | string | ❌ | `"Normal"` | `"Normal"`, `"Early Menarche"`, or `"Nulliparous"` |
| `query` | string | ❌ | *(default clinical query)* | Clinical question for guideline retrieval |

**Response 200:**
```json
{
  "classification": "Malignant",
  "confidence": 94,
  "level": "High",
  "score": 94,
  "report": "=====\nBREAST CANCER SCREENING AI...",
  "attentionMapUrl": "https://..."
}
```

`classification` is one of: `"Malignant"` | `"Benign"` | `"Review Required"`

**Error Response:**
```json
{ "error": "Human-readable error message" }
```

## Flutter Integration Example (Dart)

```dart
import 'package:http/http.dart' as http;
import 'dart:io';

Future<Map<String, dynamic>> runInference({
  required File image,
  String age = '45',
  String symptomDur = '4',
  String famHist = 'No',
  String reproHist = 'Normal',
  String query = 'What are the recommended next steps for this patient?',
}) async {
  final uri = Uri.parse('https://your-domain.com/api/inference');
  final request = http.MultipartRequest('POST', uri);

  request.fields['age'] = age;
  request.fields['symptom_dur'] = symptomDur;
  request.fields['fam_hist'] = famHist;
  request.fields['repro_hist'] = reproHist;
  request.fields['query'] = query;
  request.files.add(await http.MultipartFile.fromPath('image', image.path));

  final response = await request.send();
  final body = await response.stream.bytesToString();

  if (response.statusCode == 200) {
    return jsonDecode(body) as Map<String, dynamic>;
  } else {
    final err = jsonDecode(body);
    throw Exception(err['error'] ?? 'Inference failed');
  }
}
```

## Deployment Notes

- **Local / VPS / Railway / Render:** Run `npm run server` and point Flutter to `http://<ip>:3001`
- **Vercel / Netlify:** The Express server won't work on static hosts. Ask the dev to migrate `server/index.js` to Vercel Serverless Functions (`/api/inference.js`) — the logic is identical.
- **PORT:** Set the `PORT` environment variable to override the default `3001`.
