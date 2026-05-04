from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document
from pymongo import MongoClient
from app.config import OPENAI_API_KEY, MONGODB_URI, DATABASE_NAME, analyses_collection
import os

# Initialize OpenAI
embeddings = OpenAIEmbeddings(openai_api_key=OPENAI_API_KEY)
llm = ChatOpenAI(
    openai_api_key=OPENAI_API_KEY,
    model_name="gpt-3.5-turbo",
    temperature=0.3
)

# Text splitter for chunking documents
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=500,
    chunk_overlap=50
)

def embed_text(text: str) -> list:
    """Convert text to vector embeddings"""
    return embeddings.embed_query(text)

def chunk_text(text: str) -> list:
    """Split text into chunks for processing"""
    docs = text_splitter.create_documents([text])
    return [doc.page_content for doc in docs]

def analyze_match(resume_text: str, job_description: str) -> dict:
    """
    Core function: Analyze match between resume and job description
    Returns match score, matched skills, missing skills, and suggestions
    """
    prompt = f"""
    You are an expert career coach and technical recruiter.
    
    Analyze the match between this resume and job description.
    
    RESUME:
    {resume_text}
    
    JOB DESCRIPTION:
    {job_description}
    
    Provide a detailed analysis in this exact JSON format:
    {{
        "match_score": <number between 0-100>,
        "matched_skills": [<list of skills found in both resume and JD>],
        "missing_skills": [<list of skills in JD but not in resume>],
        "strong_points": [<list of candidate's strong points for this role>],
        "improvement_suggestions": [<list of specific suggestions to improve the resume>],
        "summary": "<2-3 sentence overall assessment>"
    }}
    
    Return ONLY the JSON, no extra text.
    """
    
    response = llm.invoke(prompt)
    
    import json
    try:
        result = json.loads(response.content)
    except:
        result = {"error": "Could not parse response", "raw": response.content}
    
    return result

def store_analysis(resume_text: str, job_description: str, analysis: dict) -> str:
    """Store analysis result in MongoDB"""
    
    # Generate embeddings for semantic search later
    resume_embedding = embed_text(resume_text[:1000])  # First 1000 chars
    jd_embedding = embed_text(job_description[:1000])
    
    document = {
        "resume_snippet": resume_text[:500],
        "jd_snippet": job_description[:500],
        "resume_embedding": resume_embedding,
        "jd_embedding": jd_embedding,
        "analysis": analysis,
        "match_score": analysis.get("match_score", 0)
    }
    
    result = analyses_collection.insert_one(document)
    return str(result.inserted_id)


def semantic_search(query_text: str, top_k: int = 5) -> list:
    """
    Search past analyses semantically using vector similarity
    Find analyses similar to the query text
    """
    from app.config import db
    
    # Convert query to embedding
    query_embedding = embed_text(query_text)
    
    # MongoDB Atlas Vector Search pipeline
    pipeline = [
        {
            "$vectorSearch": {
                "index": "vector_index",
                "path": "resume_embedding",
                "queryVector": query_embedding,
                "numCandidates": 50,
                "limit": top_k
            }
        },
        {
            "$project": {
                "resume_snippet": 1,
                "jd_snippet": 1,
                "match_score": 1,
                "analysis": 1,
                "score": {"$meta": "vectorSearchScore"}
            }
        }
    ]
    
    results = list(db["analyses"].aggregate(pipeline))
    
    # Convert ObjectId to string
    for r in results:
        r["_id"] = str(r["_id"])
    
    return results