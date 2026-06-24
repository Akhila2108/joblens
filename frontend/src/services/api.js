import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://joblens-j6mq.onrender.com',
  headers: {
    'Content-Type': 'application/json'
  }
})

export const analyzeMatch = async (resumeText, jobDescription) => {
  const response = await api.post('/api/v1/analyze', {
    resume_text: resumeText,
    job_description: jobDescription
  })
  return response.data
}

export const getRecentAnalyses = async () => {
  const response = await api.get('/api/v1/analyses')
  return response.data
}

export const searchAnalyses = async (query, topK = 5) => {
  const response = await api.get('/api/v1/search', {
    params: { query, top_k: topK }
  })
  return response.data
}