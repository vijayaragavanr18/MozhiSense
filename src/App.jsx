import { useState, useCallback } from 'react'
import HomePage from './pages/HomePage'
import ChallengePage from './pages/ChallengePage'
import SemanticGraphPage from './pages/SemanticGraphPage'
import ResultsPage from './pages/ResultsPage'
import ProfilePage from './pages/ProfilePage'
import TopBar from './components/shared/TopBar'
import BottomNav from './components/shared/BottomNav'

export default function App() {
  const [currentPage, setCurrentPage] = useState('home')
  const [selectedWord, setSelectedWord] = useState(null)
  const [sessionId, setSessionId] = useState(null)
  const [sessionSummary, setSessionSummary] = useState(null)
  const [targetSenseId, setTargetSenseId] = useState(null)
  const [pageKey, setPageKey] = useState(0)

  const navigate = useCallback((page, data = {}) => {
    if (data.word) setSelectedWord(data.word)
    if (data.sessionId) setSessionId(data.sessionId)
    if (data.summary) setSessionSummary(data.summary)
    if (data.senseId !== undefined) {
      setTargetSenseId(data.senseId)
    } else if (page !== 'play') {
      setTargetSenseId(null)
    }

    // Nav guards — only for play/explore
    if ((page === 'play' || page === 'explore') && !selectedWord && !data.word) {
      setCurrentPage('home')
      setPageKey(k => k + 1)
      return
    }

    setCurrentPage(page)
    setPageKey(k => k + 1)
  }, [selectedWord, sessionSummary])

  const handleBottomNavChange = useCallback((tab) => {
    navigate(tab)
  }, [navigate])

  // Map the current page to the active bottom nav tab
  const activeNavTab = currentPage === 'results' ? 'profile' : currentPage

  const activePage = (() => {
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={navigate} selectedWord={selectedWord} />
      case 'play':
        return (
          <ChallengePage
            word={selectedWord}
            selectedSenseId={targetSenseId}
            onNavigate={navigate}
          />
        )
      case 'explore':
        return <SemanticGraphPage word={selectedWord} onNavigate={navigate} />
      case 'results':
        return (
          <ResultsPage
            summary={sessionSummary}
            onNavigate={navigate}
            selectedWord={selectedWord}
          />
        )
      case 'profile':
        return <ProfilePage onNavigate={navigate} lastSummary={sessionSummary} />
      default:
        return <HomePage onNavigate={navigate} selectedWord={selectedWord} />
    }
  })()

  return (
    <div className="app-layout">
      <header className="app-topbar">
        <TopBar />
      </header>

      <main className="app-main" key={pageKey} style={{ animation: 'page-fade 0.2s ease-out' }}>
        {activePage}
      </main>

      <nav className="app-bottomnav">
        <BottomNav active={activeNavTab} onChange={handleBottomNavChange} />
      </nav>
    </div>
  )
}
