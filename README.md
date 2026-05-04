# JobLens - AI-Powered Job Application Intelligence API

An AI-powered backend system that analyzes the match between a resume and job description using LLM-based reasoning, vector embeddings, and semantic search.

## Live Demo
**API:** http://44.211.254.61:8000  
**Interactive Docs:** http://44.211.254.61:8000/docs

## Tech Stack
- **Backend:** FastAPI (Python)
- **AI/LLM:** LangChain + OpenAI GPT-3.5-turbo
- **Embeddings:** OpenAI text-embedding-ada-002 (1536 dimensions)
- **Database:** MongoDB Atlas + Vector Search
- **Containerization:** Docker + Docker Compose
- **Cloud:** AWS EC2 (us-east-1)
- **Version Control:** GitHub

## Architecture
Resume + Job Description
↓
FastAPI Backend (AWS EC2)
↓
LangChain Pipeline
↙          ↘
OpenAI API    MongoDB Atlas
(GPT-3.5 +    Vector Search
embeddings)   (1536-dim vectors)
↓
Structured JSON Response
(match score, gaps, suggestions)

##  API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST   | `/api/v1/analyze` | Analyze resume vs job description match |
| GET    | `/api/v1/analyses` | Get 10 most recent analyses |
| GET    | `/api/v1/search` | Semantic search across past analyses |
| GET    | `/health` | Health check |

##  Key Features
- **AI Match Scoring** - GPT-3.5 analyzes skill alignment and returns a 0-100 match score
- **Skill Gap Analysis** - Identifies matched and missing skills between resume and JD
- **Vector Embeddings** - Each analysis stored as 1536-dimensional vectors in MongoDB Atlas
- **Semantic Search** - Find similar past analyses using cosine similarity (not keyword matching)
- **Production Ready** - Dockerized and deployed on AWS EC2 with auto-restart

## Run Locally

```bash
# Clone the repo
git clone https://github.com/Akhila2108/joblens.git
cd joblens

# Create virtual environment
python -m venv venv
venv\Scripts\activate  # Windows
source venv/bin/activate  # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Add your OPENAI_API_KEY and MONGODB_URI

# Run with Docker
docker build -t joblens-api .
docker run -p 8000:8000 --env-file .env joblens-api

# Or run directly
uvicorn app.main:app --reload
```

##  Sample Response

```json
{
  "analysis_id": "69f79bfa093b26b62d027d3a",
  "match_score": 70,
  "matched_skills": ["Python", "PostgreSQL", "Docker", "AWS"],
  "missing_skills": ["LangChain", "MongoDB", "CI/CD pipelines"],
  "strong_points": [
    "AWS Certified Solutions Architect certification is a strong point"
  ],
  "improvement_suggestions": [
    "Highlight experience with CI/CD pipelines and LangChain"
  ],
  "summary": "Strong backend foundation with cloud experience..."
}
```
