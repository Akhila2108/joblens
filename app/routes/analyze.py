from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.analyzer import analyze_match, store_analysis, semantic_search

router = APIRouter()

# Request models
class AnalyzeRequest(BaseModel):
    resume_text: str
    job_description: str

class AnalyzeResponse(BaseModel):
    analysis_id: str
    match_score: int
    matched_skills: list
    missing_skills: list
    strong_points: list
    improvement_suggestions: list
    summary: str

@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze_job_match(request: AnalyzeRequest):
    """
    Analyze match between a resume and job description.
    Returns match score, skills gap analysis, and improvement suggestions.
    """
    if not request.resume_text or not request.job_description:
        raise HTTPException(
            status_code=400,
            detail="Both resume_text and job_description are required"
        )

    if len(request.resume_text) < 50:
        raise HTTPException(
            status_code=400,
            detail="Resume text is too short. Please provide full resume content."
        )

    if len(request.job_description) < 50:
        raise HTTPException(
            status_code=400,
            detail="Job description is too short. Please provide full job description."
        )

    # Run analysis
    analysis = analyze_match(request.resume_text, request.job_description)

    if "error" in analysis:
        raise HTTPException(
            status_code=500,
            detail="Analysis failed. Please try again."
        )

    # Store in MongoDB
    analysis_id = store_analysis(
        request.resume_text,
        request.job_description,
        analysis
    )

    return AnalyzeResponse(
        analysis_id=analysis_id,
        match_score=analysis.get("match_score", 0),
        matched_skills=analysis.get("matched_skills", []),
        missing_skills=analysis.get("missing_skills", []),
        strong_points=analysis.get("strong_points", []),
        improvement_suggestions=analysis.get("improvement_suggestions", []),
        summary=analysis.get("summary", "")
    )

@router.get("/analyses")
async def get_recent_analyses():
    """Get the 10 most recent analyses"""
    from app.config import analyses_collection
    analyses = list(analyses_collection.find(
        {},
        {"_id": 0, "resume_embedding": 0, "jd_embedding": 0}
    ).sort("_id", -1).limit(10))
    return {"analyses": analyses, "count": len(analyses)}


@router.get("/search")
async def search_similar_analyses(query: str, top_k: int = 5):
    """
    Semantic search across past analyses using vector similarity.
    Example: /api/v1/search?query=Python backend engineer with AWS experience
    """
    if not query:
        raise HTTPException(status_code=400, detail="Query parameter is required")
    
    results = semantic_search(query, top_k)
    
    return {
        "query": query,
        "results_count": len(results),
        "results": results
    }