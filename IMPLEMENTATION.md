# NyayBot — Complete Implementation Guide

## 📌 Project Overview

**NyayBot** is an AI-powered legal document simplifier and translator built for Indian citizens. It takes complex legal documents (rent agreements, court notices, employment contracts, etc.) and converts them into simple, easy-to-understand language — translated into 12 Indian languages.

### 🏗️ Architecture

```
┌─────────────────────────────────────────────────┐
│                   USER (Browser)                │
│                                                 │
│  ┌──────────┐  ┌────────────┐  ┌────────────┐  │
│  │ Landing  │→ │  Upload &  │→ │ Processing │  │
│  │   Page   │  │  Preview   │  │   Loader   │  │
│  └──────────┘  └────────────┘  └─────┬──────┘  │
│                                      │         │
│                              ┌───────▼───────┐ │
│                              │   Output      │ │
│                              │  Dashboard    │ │
│                              └───────────────┘ │
└──────────────────────┬──────────────────────────┘
                       │ HTTP POST /process
                       ▼
┌─────────────────────────────────────────────────┐
│               BACKEND (FastAPI)                 │
│                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────────┐  │
│  │ PDF Text │→ │ Chunker  │→ │ AI Simplify  │  │
│  │Extractor │  │ (800 wds)│  │ (Groq Llama) │  │
│  └──────────┘  └──────────┘  └──────┬───────┘  │
│                                     │          │
│                              ┌──────▼───────┐  │
│                              │  Translator  │  │
│                              │(GoogleTransl)│  │
│                              └──────────────┘  │
└─────────────────────────────────────────────────┘
```

---

## 📁 Project Structure (Pin-to-Pin)

```
legal-bot/
├── .gitignore              # Prevents node_modules, .env, __pycache__ from being uploaded
│
├── backend/                # Python FastAPI server
│   ├── .env                # Secret API keys (GROQ_API_KEY) — NOT uploaded to GitHub
│   ├── app.py              # Main server entry point
│   ├── Procfile            # Deployment config for Render.com
│   ├── requirements.txt    # Python dependencies list
│   ├── routes/
│   │   ├── __init__.py     # Makes 'routes' a Python package
│   │   └── process.py      # POST /process — the main API endpoint
│   ├── services/
│   │   ├── __init__.py     # Makes 'services' a Python package
│   │   ├── extractor.py    # Reads text from PDF/image files
│   │   ├── chunker.py      # Splits long text into smaller pieces
│   │   ├── ai_service.py   # Sends text to Groq AI for simplification
│   │   └── translator.py   # Translates text using Google Translate (free)
│   └── models/
│       └── schemas.py      # Data models (for future use)
│
├── frontend/               # React + Vite web application
│   ├── index.html          # HTML entry point with SEO meta tags
│   ├── package.json        # Node.js dependencies and scripts
│   ├── vite.config.js      # Vite build configuration
│   └── src/
│       ├── main.jsx        # React entry — renders <App /> into the DOM
│       ├── App.jsx          # Main component — stage machine controller
│       ├── styles/
│       │   └── global.css   # Global CSS, fonts, animations
│       ├── data/
│       │   └── mockData.js  # Language list, processing steps, demo data
│       └── components/
│           ├── Navbar.jsx           # Top navigation bar with logo
│           ├── HowItWorksModal.jsx  # "How it works" popup guide
│           ├── LandingHero.jsx      # Landing page with CTA button
│           ├── UploadBox.jsx        # Drag-and-drop file upload
│           ├── FilePreview.jsx      # Shows uploaded file + language picker
│           ├── LanguageSelector.jsx # Grid of 12 language buttons
│           ├── ProcessingLoader.jsx # Loading animation + API call
│           └── OutputDashboard.jsx  # Results: summary, content, checklist, chat
```

---

## 🔧 Step-by-Step Implementation

### Step 1: Frontend Entry Point (`main.jsx`)

```jsx
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
createRoot(document.getElementById('root')).render(<App />)
```
- This is the very first file that runs
- It finds the `<div id="root">` in `index.html` and injects the entire React app into it

---

### Step 2: Stage Machine (`App.jsx`)

The app uses a **stage machine pattern** with 5 stages:

| Stage | Component | What Happens |
|-------|-----------|-------------|
| `landing` | `LandingHero` | User sees the welcome page with "Upload Document" button |
| `upload` | `UploadBox` | User drags/drops or clicks to upload a PDF |
| `preview` | `FilePreview` | User sees the file name, selects a language |
| `processing` | `ProcessingLoader` | Loading animation plays while backend processes |
| `output` | `OutputDashboard` | Translated, simplified result is displayed |

**Key state variables:**
- `stage` — which screen to show
- `file` — the uploaded PDF/image file
- `lang` — selected language code (e.g. "hi" for Hindi)
- `apiData` — the response from the backend

---

### Step 3: File Upload (`UploadBox.jsx`)

- Supports **drag-and-drop** and **click-to-browse**
- Validates file type (PDF, JPG, PNG only)
- Validates file size (max 20 MB)
- Shows error messages for invalid files

---

### Step 4: Language Selection (`LanguageSelector.jsx` + `FilePreview.jsx`)

The user picks from **12 Indian languages**:

| Code | Language | Native Script |
|------|----------|--------------|
| en | English | English |
| hi | Hindi | हिन्दी |
| te | Telugu | తెలుగు |
| ta | Tamil | தமிழ் |
| kn | Kannada | ಕನ್ನಡ |
| bn | Bengali | বাংলা |
| mr | Marathi | मराठी |
| gu | Gujarati | ગુજરાતી |
| ml | Malayalam | മലയാളം |
| pa | Punjabi | ਪੰਜਾਬੀ |
| ur | Urdu | اردو |
| or | Odia | ଓଡ଼ିଆ |

---

### Step 5: API Call (`ProcessingLoader.jsx`)

When the user clicks "Analyze & Simplify", this component:

1. Creates a `FormData` object with the file and language name
2. Sends a `POST` request to `{VITE_API_URL}/process`
3. Shows a beautiful step-by-step loading animation
4. When the backend responds, passes data to `OutputDashboard`
5. If backend is unreachable, shows helpful error messages

**The API URL is configurable** — uses `VITE_API_URL` environment variable for production, falls back to `http://localhost:8000` for development.

---

### Step 6: Backend Entry Point (`app.py`)

```python
app = FastAPI(title="NyayBot API")
app.add_middleware(CORSMiddleware, allow_origins=["*"])
app.include_router(process.router)
```

- Creates the FastAPI server
- Enables **CORS** so the React frontend can talk to it
- Registers the `/process` route

---

### Step 7: Document Processing Pipeline (`routes/process.py`)

When a POST request hits `/process`, the backend runs this pipeline:

```
PDF File → Extract Text → Chunk Text → AI Simplify → Translate → Return JSON
```

**Detailed flow:**

1. **Extract** (`extractor.py`): Uses `pdfplumber` to read text from PDF pages. Falls back to `pytesseract` OCR for images.

2. **Chunk** (`chunker.py`): Splits the extracted text into chunks of ~800 words each. This prevents the AI from being overwhelmed by very long documents.

3. **Simplify** (`ai_service.py`): Each chunk is sent to **Groq's Llama-3.1-8b-instant** model with a specialized legal simplification prompt. If the API key is missing/invalid, it gracefully falls back to basic text cleanup.

4. **Translate** (`translator.py`): The simplified English text is translated into the user's chosen language using **Google Translate** (via `deep-translator` library). Large texts are automatically split into 4500-character chunks to respect API limits.

5. **Generate Actions**: Creates a 6-item action checklist and translates it too.

**Response format:**
```json
{
  "summary": "Translated summary of the document...",
  "content": "Full translated simplified content...",
  "actions": ["Action 1 in selected language", "Action 2...", ...]
}
```

---

### Step 8: AI Simplification Engine (`ai_service.py`)

**System prompt sent to Groq AI:**
> "You are a legal document simplifier for Indian citizens. Take complex legal text and rewrite it in simple, clear language that anyone can understand. Keep important details like dates, amounts, names, and obligations. Use short sentences and bullet points where appropriate. Do NOT add legal advice."

**Fallback mechanism:**
- If `GROQ_API_KEY` is missing → skips AI, returns cleaned text
- If API returns 401 (invalid key) → permanently disables AI for that session, uses fallback
- If any other error → returns cleaned text, logs error

---

### Step 9: Translation Engine (`translator.py`)

- Uses **Google Translate** via the `deep-translator` library (100% free)
- Automatically detects source language (`source="auto"`)
- Handles large documents by splitting into 4500-char chunks
- Returns original text on failure (never crashes)

---

### Step 10: Output Dashboard (`OutputDashboard.jsx`)

Displays three sections:

1. **Summary Card** — Blue gradient card with a brief document summary
2. **Simplified Content** — Full translated text split into readable paragraphs
3. **Action Checklist** — Interactive checklist with progress bar (users can check off items)
4. **Chat Box** — Toggle-able Q&A interface for asking questions about the document

---

## 🌐 Deployment Architecture

```
┌─────────────────┐        ┌──────────────────┐
│   Netlify.com   │        │    Render.com     │
│  (Frontend)     │───────▶│    (Backend)      │
│  React + Vite   │  HTTP  │  FastAPI + Python │
│  Static Files   │        │  AI + Translation │
└─────────────────┘        └──────────────────┘
       │                          │
       │                    ┌─────▼─────┐
       │                    │  Groq AI  │
       │                    │ (Llama 3) │
       │                    └───────────┘
       │                          │
       │                    ┌─────▼──────┐
       │                    │  Google    │
       │                    │ Translate  │
       └────────────────────┴────────────┘
```

- **Frontend** hosted on Netlify (free) — serves the React UI
- **Backend** hosted on Render (free) — runs the Python AI pipeline
- **Groq AI** — free tier, Llama 3.1 model for text simplification
- **Google Translate** — free, via deep-translator library

---

## 🔑 Environment Variables

| Variable | Where | Purpose |
|----------|-------|---------|
| `GROQ_API_KEY` | Backend `.env` + Render | Authenticates with Groq AI |
| `VITE_API_URL` | Netlify env vars | Tells frontend where the backend lives |

---

## 📦 Dependencies

### Backend (Python)
| Package | Purpose |
|---------|---------|
| `fastapi` | Web framework for the API |
| `uvicorn` | ASGI server to run FastAPI |
| `python-multipart` | Handle file uploads |
| `pdfplumber` | Extract text from PDF files |
| `python-dotenv` | Load .env file variables |
| `groq` | Official Groq AI SDK |
| `deep-translator` | Free Google Translate wrapper |
| `Pillow` | Image processing for OCR |
| `httpx<0.28.0` | HTTP client (pinned for Groq compatibility) |

### Frontend (React)
| Package | Purpose |
|---------|---------|
| `react` | UI framework |
| `react-dom` | DOM rendering |
| `vite` | Lightning-fast build tool |
| `@vitejs/plugin-react` | React support for Vite |

---

## 🚀 How to Run Locally

### Backend
```bash
cd backend
pip install -r requirements.txt
# Add your GROQ_API_KEY to .env
uvicorn app:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
# Opens at http://localhost:5173
```

---

## 🏆 Key Features

1. **12 Indian Languages** — Hindi, Telugu, Tamil, Kannada, Bengali, Marathi, Gujarati, Malayalam, Punjabi, Urdu, Odia, English
2. **AI-Powered Simplification** — Groq Llama 3.1 rewrites legal jargon into plain language
3. **Free Translation** — Google Translate handles all 12 languages at zero cost
4. **Robust Fallback** — Works even without a valid AI key (skips simplification, still translates)
5. **Interactive Checklist** — Users get actionable steps with a progress tracker
6. **Document Chat** — Ask questions about the uploaded document
7. **Drag & Drop Upload** — Supports PDF, JPG, PNG up to 20MB
8. **How It Works Guide** — Beautiful modal explaining the process in 4 steps
9. **Responsive Design** — Works on desktop, tablet, and mobile
10. **Zero Storage** — Documents are processed in memory and never saved

---

*Built with ❤️ for Indian citizens who deserve to understand the law in their own language.*
