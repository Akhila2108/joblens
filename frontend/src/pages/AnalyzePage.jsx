import { useState } from 'react'
import { analyzeMatch } from '../services/api'
import styles from './AnalyzePage.module.css'

function AnalyzePage() {
  const [resumeText, setResumeText] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleAnalyze = async () => {
    setError('')
    setResult(null)

    if (!resumeText.trim() || !jobDescription.trim()) {
      setError('Please fill in both fields.')
      return
    }
    if (resumeText.trim().length < 100) {
      setError('Resume is too short. Please add more detail (minimum 100 characters).')
      return
    }
    if (jobDescription.trim().length < 100) {
      setError('Job description is too short. Please add more detail (minimum 100 characters).')
      return
    }

    setLoading(true)
    try {
      const data = await analyzeMatch(resumeText, jobDescription)
      setResult(data)
    } catch (err) {
      setError('Could not reach the API. Make sure your backend is running at localhost:8000.')
    } finally {
      setLoading(false)
    }
  }

  const getScoreColor = (score) => {
    if (score >= 80) return '#1D9E75'
    if (score >= 60) return '#EF9F27'
    return '#E24B4A'
  }

  const getVerdict = (score) => {
    if (score >= 80) return 'Strong match'
    if (score >= 60) return 'Good fit'
    if (score >= 40) return 'Partial match'
    return 'Needs work'
  }

  return (
    <div className={styles.container}>
      <div className={styles.hero}>
        <h1 className={styles.heroTitle}>
          Know your <span className={styles.heroAccent}>match score</span> before you apply
        </h1>
        <p className={styles.heroSubtitle}>
          Paste your resume and job description. Get an instant AI analysis —
          match score, skill gaps, and exactly what to improve.
        </p>
      </div>

      <div className={styles.formGrid}>
        <div className={styles.field}>
          <div className={styles.fieldHeader}>
            <label className={styles.fieldLabel}>Your resume</label>
            <span className={styles.charCount}>{resumeText.length} chars</span>
          </div>
          <textarea
            className={styles.textarea}
            rows={12}
            placeholder="Paste your full resume text here..."
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
          />
        </div>
        <div className={styles.field}>
          <div className={styles.fieldHeader}>
            <label className={styles.fieldLabel}>Job description</label>
            <span className={styles.charCount}>{jobDescription.length} chars</span>
          </div>
          <textarea
            className={styles.textarea}
            rows={12}
            placeholder="Paste the job description here..."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
          />
        </div>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.btnRow}>
        <button
          className={styles.analyzeBtn}
          onClick={handleAnalyze}
          disabled={loading}
        >
          {loading ? 'Analyzing...' : 'Analyze match'}
        </button>
        <span className={styles.hint}>Takes 5–10 seconds · Powered by GPT-3.5</span>
      </div>

      {result && (
        <div className={styles.results}>
          <div className={styles.resultsHeader}>Analysis results</div>
          <div className={styles.resultsGrid}>

            <div className={styles.scoreCard}>
              <div className={styles.scoreLabel}>Match score</div>
              <div
                className={styles.scoreNumber}
                style={{ color: getScoreColor(result.match_score) }}
              >
                {result.match_score}
              </div>
              <div
                className={styles.scoreVerdict}
                style={{ color: getScoreColor(result.match_score) }}
              >
                {getVerdict(result.match_score)}
              </div>
            </div>

            <div className={styles.detailCards}>
              <div className={styles.detailCard}>
                <div className={`${styles.detailTitle} ${styles.green}`}>Matched skills</div>
                <div className={styles.badges}>
                  {result.matched_skills.length > 0
                    ? result.matched_skills.map((skill, i) => (
                        <span key={i} className={`${styles.badge} ${styles.badgeGreen}`}>{skill}</span>
                      ))
                    : <span className={styles.empty}>None identified</span>
                  }
                </div>
              </div>

              <div className={styles.detailCard}>
                <div className={`${styles.detailTitle} ${styles.red}`}>Missing skills</div>
                <div className={styles.badges}>
                  {result.missing_skills.length > 0
                    ? result.missing_skills.map((skill, i) => (
                        <span key={i} className={`${styles.badge} ${styles.badgeRed}`}>{skill}</span>
                      ))
                    : <span className={styles.empty}>None — great match!</span>
                  }
                </div>
              </div>

              <div className={styles.detailCard}>
                <div className={`${styles.detailTitle} ${styles.amber}`}>Suggestions</div>
                <ul className={styles.suggestions}>
                  {result.improvement_suggestions.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>

              <div className={styles.detailCard}>
                <div className={`${styles.detailTitle} ${styles.blue}`}>Summary</div>
                <p className={styles.summary}>{result.summary}</p>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  )
}

export default AnalyzePage