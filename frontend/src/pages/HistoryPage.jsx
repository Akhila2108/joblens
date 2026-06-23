import { useState, useEffect } from 'react'
import { getRecentAnalyses } from '../services/api'
import styles from './HistoryPage.module.css'

function HistoryPage() {
  const [analyses, setAnalyses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchAnalyses = async () => {
      try {
        const data = await getRecentAnalyses()
        setAnalyses(data.analyses || [])
      } catch (err) {
        setError('Could not load analyses. Make sure your backend is running.')
      } finally {
        setLoading(false)
      }
    }
    fetchAnalyses()
  }, [])

  const getScoreColor = (score) => {
    if (score >= 80) return '#1D9E75'
    if (score >= 60) return '#EF9F27'
    return '#E24B4A'
  }

  const getScoreBg = (score) => {
    if (score >= 80) return '#E1F5EE'
    if (score >= 60) return '#FAEEDA'
    return '#FCEBEB'
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Recent analyses</h1>
        <p className={styles.subtitle}>Your 10 most recent resume analyses</p>
      </div>

      {loading && <div className={styles.loading}>Loading...</div>}
      {error && <div className={styles.error}>{error}</div>}

      {!loading && !error && analyses.length === 0 && (
        <div className={styles.empty}>
          No analyses yet. Go to the Analyze page to get started.
        </div>
      )}

      <div className={styles.list}>
        {analyses.map((item, index) => (
          <div key={index} className={styles.item}>
            <div
              className={styles.scoreCircle}
              style={{
                color: getScoreColor(item.match_score),
                background: getScoreBg(item.match_score)
              }}
            >
              {item.match_score}
            </div>
            <div className={styles.info}>
              <div className={styles.jdSnippet}>
                {item.jd_snippet
                  ? item.jd_snippet.substring(0, 80) + '...'
                  : 'Job description not available'}
              </div>
              <div className={styles.resumeSnippet}>
                {item.resume_snippet
                  ? item.resume_snippet.substring(0, 60) + '...'
                  : 'Resume not available'}
              </div>
            </div>
            <div className={styles.skills}>
              {item.analysis?.matched_skills?.slice(0, 3).map((skill, i) => (
                <span key={i} className={styles.skillBadge}>{skill}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default HistoryPage