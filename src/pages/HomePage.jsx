import { useEffect, useState } from 'react'
import { getWords } from '../api'

// Level system
const LEVELS = [
  { min: 0, max: 499, level: 1, title: 'Learner' },
  { min: 500, max: 999, level: 2, title: 'Reader' },
  { min: 1000, max: 1699, level: 3, title: 'Scholar' },
  { min: 1700, max: 2499, level: 4, title: 'Linguist' },
  { min: 2500, max: Infinity, level: 5, title: 'Tamil Master' },
]

function getLevel(xp) {
  return LEVELS.find(l => xp >= l.min && xp <= l.max) || LEVELS[LEVELS.length - 1]
}

function StreakRing({ streak }) {
  const radius = 30
  const circumference = 2 * Math.PI * radius
  const maxStreak = 30
  const progress = Math.min(streak / maxStreak, 1)
  const dashOffset = circumference * (1 - progress)

  return (
    <div style={{ width: '80px', height: '80px', position: 'relative', flexShrink: 0 }}>
      <svg width="80" height="80" viewBox="0 0 80 80">
        <circle cx="40" cy="40" r={radius} fill="none" stroke="var(--surface)" strokeWidth="6" />
        <circle
          cx="40" cy="40" r={radius} fill="none"
          stroke="var(--gold)" strokeWidth="6" strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={dashOffset}
          style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%', transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      <div style={{
        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ fontFamily: '"Baloo 2"', fontWeight: 800, fontSize: '28px', color: 'var(--gold)', lineHeight: 1 }}>
          {streak}
        </span>
        <span style={{ fontSize: '9px', fontFamily: 'Nunito', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text3)' }}>
          🔥 days
        </span>
      </div>
    </div>
  )
}

function WordCard({ word, index, onClick }) {
  const nounCount = (word.senses || []).filter(s => s.pos === 'noun').length
  const verbCount = (word.senses || []).filter(s => s.pos === 'verb').length

  return (
    <button
      onClick={onClick}
      style={{
        width: '148px', flexShrink: 0,
        background: 'var(--surface2)', border: '1px solid var(--border2)',
        borderRadius: '20px', padding: '16px', cursor: 'pointer',
        textAlign: 'left', transition: 'all 0.2s ease',
        animation: `slide-up 0.4s cubic-bezier(0.22, 1, 0.36, 1) ${index * 0.05}s both`,
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'var(--teal-border)'
        e.currentTarget.style.transform = 'translateY(-3px)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'var(--border2)'
        e.currentTarget.style.transform = 'translateY(0)'
      }}
    >
      <div style={{ fontFamily: '"Baloo 2"', fontWeight: 800, fontSize: '30px', color: 'var(--text)', lineHeight: 1, marginBottom: '4px' }}>
        {word.tamil}
      </div>
      <div style={{ fontSize: '11px', fontFamily: 'Nunito', fontWeight: 700, color: 'var(--text3)', marginBottom: '8px' }}>
        {word.roman}
      </div>
      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '8px' }}>
        {nounCount > 0 && (
          <span style={{
            background: 'var(--purple-dim)', color: 'var(--purple)',
            fontSize: '10px', fontFamily: 'Nunito', fontWeight: 800,
            borderRadius: '8px', padding: '2px 7px',
          }}>
            noun×{nounCount}
          </span>
        )}
        {verbCount > 0 && (
          <span style={{
            background: 'var(--teal-dim)', color: 'var(--teal)',
            fontSize: '10px', fontFamily: 'Nunito', fontWeight: 800,
            borderRadius: '8px', padding: '2px 7px',
          }}>
            verb×{verbCount}
          </span>
        )}
      </div>
      <div style={{ height: '4px', background: 'var(--surface)', borderRadius: '2px', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: '30%', background: 'var(--teal)', borderRadius: '2px', transition: 'width 0.3s ease' }} />
      </div>
      <div style={{ fontSize: '10px', fontFamily: 'Nunito', fontWeight: 800, color: 'var(--text3)', marginTop: '5px' }}>
        30%
      </div>
    </button>
  )
}

export default function HomePage({ onNavigate, selectedWord }) {
  const [words, setWords] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [retryCount, setRetryCount] = useState(0)

  const xp = parseInt(localStorage.getItem('mozhisense_xp') || '0', 10)
  const streak = parseInt(localStorage.getItem('mozhisense_streak') || '0', 10)
  const dailyCount = parseInt(localStorage.getItem('mozhisense_daily_count') || '0', 10)

  const level = getLevel(xp)
  const levelSize = level.max === Infinity ? 500 : (level.max - level.min + 1)
  const xpInLevel = xp - level.min
  const xpProgress = Math.min((xpInLevel / levelSize) * 100, 100)
  const xpToNext = level.max === Infinity ? '∞' : (level.max - xp + 1)
  const nextLevel = level.level < 5 ? level.level + 1 : 5

  useEffect(() => {
    setLoading(true)
    setError('')
    getWords()
      .then(res => setWords(res.data.words || []))
      .catch(() => setError("Couldn't load words. Is the backend running?"))
      .finally(() => setLoading(false))
  }, [retryCount])

  const dailyProgress = Math.min((dailyCount / 10) * 100, 100)

  return (
    <div style={{ padding: '0 0 16px' }}>
      {/* Section A — Streak + Daily Goal */}
      <div style={{
        margin: '0 16px 16px', background: 'var(--surface2)', border: '1px solid var(--border2)',
        borderRadius: '20px', padding: '20px', display: 'flex', gap: '16px',
      }}>
        <StreakRing streak={streak} />
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: '"Baloo 2"', fontWeight: 800, fontSize: '18px', color: 'var(--text)', marginBottom: '4px' }}>
            வணக்கம்!
          </div>
          <div style={{ fontSize: '12px', fontFamily: 'Nunito', fontWeight: 600, color: 'var(--text2)', marginBottom: '10px' }}>
            Don't break the streak today!
          </div>
          <div style={{ height: '7px', background: 'var(--surface)', borderRadius: '4px', overflow: 'hidden', marginBottom: '6px' }}>
            <div style={{ height: '100%', width: `${dailyProgress}%`, background: 'var(--teal)', borderRadius: '4px', transition: 'width 0.4s ease' }} />
          </div>
          <div style={{ fontSize: '11px', fontFamily: 'Nunito', fontWeight: 700, color: 'var(--text3)' }}>
            Daily goal: <span style={{ color: 'var(--teal)' }}>{dailyCount}</span> / 10 done
          </div>
        </div>
      </div>

      {/* Section B — XP Level Bar */}
      <div style={{
        margin: '0 16px 14px', background: 'var(--surface2)', border: '1px solid var(--border)',
        borderRadius: '18px', padding: '14px 18px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ fontSize: '12px', fontFamily: 'Nunito', fontWeight: 800, color: 'var(--text2)' }}>
            Level {level.level} — {level.title}
          </span>
          <span style={{ fontSize: '12px', fontFamily: 'Nunito', fontWeight: 800, color: 'var(--gold)' }}>
            {xp} / {level.max === Infinity ? '∞' : level.max} XP
          </span>
        </div>
        <div style={{ height: '8px', background: 'var(--surface)', borderRadius: '4px', overflow: 'hidden', marginBottom: '6px' }}>
          <div style={{
            height: '100%', width: `${xpProgress}%`, borderRadius: '4px',
            background: 'linear-gradient(90deg, var(--teal), #00A693)', transition: 'width 0.4s ease',
          }} />
        </div>
        <div style={{ fontSize: '11px', fontFamily: 'Nunito', fontWeight: 600, color: 'var(--text3)' }}>
          {xpToNext} XP to Level {nextLevel}
        </div>
      </div>

      {/* Section C — Continue Learning */}
      <div style={{ padding: '0 20px', marginBottom: '10px' }}>
        <div style={{
          fontSize: '11px', fontFamily: 'Nunito', fontWeight: 800,
          textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text3)',
        }}>
          Continue learning
        </div>
      </div>

      {loading && (
        <div style={{ display: 'flex', gap: '10px', padding: '0 16px 16px', overflowX: 'auto' }}>
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-skeleton" style={{
              width: '148px', height: '160px', flexShrink: 0,
              background: 'var(--surface2)', borderRadius: '20px',
            }} />
          ))}
        </div>
      )}

      {error && (
        <div style={{ padding: '0 16px', marginBottom: '16px' }}>
          <div style={{
            background: 'var(--surface2)', border: '1px solid var(--border)',
            borderRadius: '16px', padding: '16px', textAlign: 'center',
          }}>
            <div style={{ fontSize: '14px', fontFamily: 'Nunito', color: 'var(--text2)', marginBottom: '12px' }}>
              {error}
            </div>
            <button
              onClick={() => setRetryCount(c => c + 1)}
              style={{
                background: 'transparent', border: '1.5px solid var(--teal)', borderRadius: '12px',
                padding: '10px 24px', color: 'var(--teal)', fontFamily: 'Nunito', fontWeight: 700,
                fontSize: '14px', cursor: 'pointer',
              }}
            >
              ↻ Retry
            </button>
          </div>
        </div>
      )}

      {!loading && !error && words.length === 0 && (
        <div style={{
          margin: '0 16px 16px', background: 'var(--surface2)', border: '1px solid var(--border)',
          borderRadius: '16px', padding: '24px', textAlign: 'center',
        }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>📭</div>
          <div style={{ fontSize: '14px', fontFamily: 'Nunito', color: 'var(--text2)' }}>No words available yet</div>
        </div>
      )}

      {!loading && !error && words.length > 0 && (
        <div className="scrollbar-hide" style={{
          display: 'flex', gap: '10px', padding: '0 16px 16px',
          overflowX: 'auto',
        }}>
          {words.map((word, idx) => (
            <WordCard
              key={word.tamil}
              word={word}
              index={idx}
              onClick={() => onNavigate?.('play', { word })}
            />
          ))}
        </div>
      )}

      {/* Section D — Play CTA */}
      <div style={{ padding: '0 16px' }}>
        <button
          onClick={() => {
            const w = selectedWord || words[0]
            if (w) onNavigate?.('play', { word: w })
          }}
          style={{
            width: '100%',
            background: 'linear-gradient(135deg, #00897B, #00D4B8)',
            border: 'none', borderRadius: '18px', padding: '18px',
            fontFamily: '"Baloo 2"', fontWeight: 800, fontSize: '18px', color: '#fff',
            boxShadow: '0 8px 28px rgba(0,212,184,0.35)',
            cursor: 'pointer', transition: 'all 0.2s ease',
          }}
        >
          ▶  Start Learning
        </button>
      </div>
    </div>
  )
}
