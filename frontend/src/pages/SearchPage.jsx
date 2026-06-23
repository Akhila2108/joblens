import { useState } from 'react'
import { searchAnalyses } from '../services/api'
import styles from './SearchPage.module.css'

function SearchPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searched, setSearched] = useState(false)

  const handleSearch = async () => {
    if (!query.trim()) return
    setError('')
    setResults([])
    setLoading(true)
    setSearched(true)
    try {
      const data = await searchAnalyses(query.trim())
      setResults(data.results || [])
    } catch (err) {
      setError('Could not complete search. Make sure your backend is running.')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch()
  }

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
        <h1 className={styles.title}>Search analyses</h1>
        <p className={styles.subtitle}>
          Semantic search across your past analyses using vector similarity
        </p>
      </div>

      <div className={styles.searchBar}>
        <input
          className={styles.input}
          type="text"
          placeholder="e.g. Python backend engineer with AWS experience"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          className={styles.searchBtn}
          onClick={handleSearch}
          disabled={loading || !query.trim()}
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {!loading && searched && results.length === 0 && !error && (
        <div className={styles.empty}>
          No results found. Try a different search query.
        </div>
      )}

      <div className={styles.results}>
        {results.map((item, index) => (
          <div key={index} className={styles.resultItem}>
            <div className={styles.resultTop}>
              <div className={styles.resultLeft}>
                <div
                  className={styles.scoreCircle}
                  style={{
                    color: getScoreColor(item.match_score),
                    background: getScoreBg(item.match_score)
                  }}
                >
                  {item.match_score}
                </div>
                <div className={styles.snippets}>
                  <div className={styles.jdSnippet}>
                    {item.jd_snippet
                      ? item.jd_snippet.substring(0, 100) + '...'
                      : 'Job description not available'}
                  </div>
                  <div className={styles.resumeSnippet}>
                    {item.resume_snippet
                      ? item.resume_snippet.substring(0, 80) + '...'
                      : 'Resume not available'}
                  </div>
                </div>
              </div>
              {item.score && (
                <div className={styles.similarityBadge}>
                  {Math.round(item.score * 100)}% similar
                </div>
              )}
            </div>
            {item.analysis?.matched_skills?.length > 0 && (
              <div className={styles.skills}>
                {item.analysis.matched_skills.slice(0, 5).map((skill, i) => (
                  <span key={i} className={styles.skillBadge}>{skill}</span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default SearchPage