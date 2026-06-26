# JobLens

AI-powered resume analyzer. Paste a resume and job description, get a match score, skill gaps, and improvement suggestions.

**Live demo:** https://joblens-mu-pink.vercel.app

---

## Tech stack

- **Backend:** FastAPI, LangChain, OpenAI GPT-3.5-turbo, MongoDB Atlas Vector Search, Docker
- **Frontend:** React, Vite, Axios
- **Deployment:** Render (backend), Vercel (frontend)

## How it works

Each analysis runs the resume and job description through a LangChain prompt to GPT-3.5, which returns a structured JSON response with a match score, matched skills, missing skills, and suggestions. The resume text is then embedded using OpenAI's text-embedding-ada-002 (1536 dimensions) and stored in MongoDB Atlas for semantic search later.

## Run locally

Prerequisites: Python 3.11, Node.js 18+

```bash
git clone https://github.com/Akhila2108/joblens.git
cd joblens
```

Create a `.env` file:
```
OPENAI_API_KEY=your_key_here
MONGODB_URI=your_mongodb_uri_here
DATABASE_NAME=joblens_db
```

Note: Requires MongoDB Atlas with a vector search index named `vector_index` on the `analyses` collection.

Backend:
```bash
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Frontend:
```bash
cd frontend
npm install
npm run dev
```

## API

- `POST /api/v1/analyze` — analyze resume vs job description
- `GET /api/v1/analyses` — fetch recent analyses
- `GET /api/v1/search?query=...` — semantic search across past analyses