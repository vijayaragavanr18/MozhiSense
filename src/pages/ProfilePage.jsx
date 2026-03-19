import { useState, useEffect } from 'react'

const LEVELS = [
  { min: 0, max: 499, level: 1, title: 'Learner', emoji: '🌱' },
  { min: 500, max: 999, level: 2, title: 'Reader', emoji: '📖' },
  { min: 1000, max: 1699, level: 3, title: 'Scholar', emoji: '🎓' },
  { min: 1700, max: 2499, level: 4, title: 'Linguist', emoji: '🗣️' },
  { min: 2500, max: Infinity, level: 5, title: 'Tamil Master', emoji: '👑' },
]

function getLevel(xp) {
  return LEVELS.find(l => xp >= l.min && xp <= l.max) || LEVELS[LEVELS.length - 1]
}

function StatCard({ value, label, color, emoji }) {
  return (
    <div style={{
      background: 'var(--surface2)', border: '1px solid var(--border2)',
      borderRadius: '18px', padding: '20px 16px', textAlign: 'center',
    }}>
      {emoji && <div style={{ fontSize: '24px', marginBottom: '6px' }}>{emoji}</div>}
      <div style={{
        fontFamily: '"Baloo 2"', fontWeight: 800, fontSize: '28px',
        color: color || 'var(--text)', lineHeight: 1, marginBottom: '4px',
      }}>
        {value}
      </div>
      <div style={{
        fontSize: '10px', fontFamily: 'Nunito', fontWeight: 800,
        textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text3)',
      }}>
        {label}
      </div>
    </div>
  )
}

function LevelBadge({ level }) {
  return (
    <div style={{
      background: 'var(--teal-dim)', border: '1.5px solid var(--teal-border)',
      borderRadius: '22px', padding: '24px', textAlign: 'center', marginBottom: '16px',
    }}>
      <div style={{ fontSize: '56px', marginBottom: '8px', lineHeight: 1 }}>{level.emoji}</div>
      <div style={{
        fontFamily: '"Baloo 2"', fontWeight: 800, fontSize: '24px',
        color: 'var(--teal)', marginBottom: '2px',
      }}>
        Level {level.level}
      </div>
      <div style={{
        fontSize: '14px', fontFamily: 'Nunito', fontWeight: 700, color: 'var(--text2)',
      }}>
        {level.title}
      </div>
    </div>
  )
}

export default function ProfilePage({ onNavigate, lastSummary }) {
  const [, setTick] = useState(0)

  // Re-read localStorage values on mount
  useEffect(() => { setTick(t => t + 1) }, [])

  const xp = parseInt(localStorage.getItem('mozhisense_xp') || '0', 10)
  const streak = parseInt(localStorage.getItem('mozhisense_streak') || '0', 10)
  const dailyCount = parseInt(localStorage.getItem('mozhisense_daily_count') || '0', 10)
  const lastPlayed = localStorage.getItem('mozhisense_last_played') || 'Never'

  const level = getLevel(xp)
  const levelSize = level.max === Infinity ? 500 : (level.max - level.min + 1)
  const xpInLevel = xp - level.min
  const xpProgress = Math.min((xpInLevel / levelSize) * 100, 100)
  const xpToNext = level.max === Infinity ? '∞' : (level.max - xp + 1)
  const nextLevel = level.level < 5 ? level.level + 1 : 5

  return (
    <div style={{ padding: '8px 16px 16px' }}>
      {/* Profile Header */}
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <div style={{
          width: '80px', height: '80px', borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--teal), #00897B)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 12px', fontSize: '36px',
          boxShadow: '0 6px 24px rgba(0,212,184,0.3)',
        }}>
          👤
        </div>
        <div style={{
          fontFamily: '"Baloo 2"', fontWeight: 800, fontSize: '24px', color: 'var(--text)',
        }}>
          Tamil Learner
        </div>
        <div style={{
          fontSize: '12px', fontFamily: 'Nunito', fontWeight: 600, color: 'var(--text3)',
        }}>
          Learning Tamil words through semantics
        </div>
      </div>

      {/* Level Badge */}
      <LevelBadge level={level} />

      {/* XP Progress */}
      <div style={{
        background: 'var(--surface2)', border: '1px solid var(--border)',
        borderRadius: '16px', padding: '14px 18px', marginBottom: '14px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ fontSize: '12px', fontFamily: 'Nunito', fontWeight: 800, color: 'var(--text2)' }}>
            Progress to Level {nextLevel}
          </span>
          <span style={{ fontSize: '12px', fontFamily: 'Nunito', fontWeight: 800, color: 'var(--gold)' }}>
            {xp} XP
          </span>
        </div>
        <div style={{
          height: '10px', background: 'var(--surface)', borderRadius: '5px',
          overflow: 'hidden', marginBottom: '6px',
        }}>
          <div style={{
            height: '100%', width: `${xpProgress}%`, borderRadius: '5px',
            background: 'linear-gradient(90deg, var(--teal), #00A693)',
            transition: 'width 0.6s ease',
          }} />
        </div>
        <div style={{ fontSize: '11px', fontFamily: 'Nunito', fontWeight: 600, color: 'var(--text3)', textAlign: 'center' }}>
          {xpToNext} XP to Level {nextLevel}
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px',
      }}>
        <StatCard value={xp} label="Total XP" color="var(--gold)" emoji="⭐" />
        <StatCard value={`${streak} 🔥`} label="Day Streak" color="var(--coral)" />
        <StatCard value={dailyCount} label="Today's Challenges" color="var(--teal)" emoji="📝" />
        <StatCard value={`Lv.${level.level}`} label={level.title} color="var(--purple)" emoji={level.emoji} />
      </div>

      {/* Last Session Summary */}
      {lastSummary && (
        <div style={{
          background: 'var(--surface2)', border: '1px solid var(--border2)',
          borderRadius: '18px', padding: '16px', marginBottom: '16px',
        }}>
          <div style={{
            fontSize: '11px', fontFamily: 'Nunito', fontWeight: 800,
            textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text3)',
            marginBottom: '10px',
          }}>
            Last Session
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontFamily: '"Baloo 2"', fontWeight: 800, fontSize: '20px', color: 'var(--text)' }}>
              {lastSummary.word_tamil}
            </span>
            <span style={{
              background: 'var(--green-dim)', color: 'var(--green)',
              borderRadius: '8px', padding: '4px 10px',
              fontSize: '12px', fontFamily: 'Nunito', fontWeight: 800,
            }}>
              {lastSummary.accuracy}% accuracy
            </span>
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <span style={{ fontSize: '12px', fontFamily: 'Nunito', fontWeight: 700, color: 'var(--text3)' }}>
              ✅ {lastSummary.correct}/{lastSummary.total_questions}
            </span>
            <span style={{ fontSize: '12px', fontFamily: 'Nunito', fontWeight: 700, color: 'var(--text3)' }}>
              🔥 {lastSummary.best_streak} streak
            </span>
            <span style={{ fontSize: '12px', fontFamily: 'Nunito', fontWeight: 700, color: 'var(--gold)' }}>
              +{lastSummary.xp_earned} XP
            </span>
          </div>
        </div>
      )}

      {/* Activity Info */}
      <div style={{
        background: 'var(--surface2)', border: '1px solid var(--border)',
        borderRadius: '16px', padding: '14px 18px', marginBottom: '16px',
      }}>
        <div style={{
          fontSize: '11px', fontFamily: 'Nunito', fontWeight: 800,
          textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text3)',
          marginBottom: '10px',
        }}>
          Activity
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ fontSize: '13px', fontFamily: 'Nunito', fontWeight: 600, color: 'var(--text2)' }}>Last played</span>
          <span style={{ fontSize: '13px', fontFamily: 'Nunito', fontWeight: 700, color: 'var(--text)' }}>{lastPlayed}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '13px', fontFamily: 'Nunito', fontWeight: 600, color: 'var(--text2)' }}>Daily goal</span>
          <span style={{ fontSize: '13px', fontFamily: 'Nunito', fontWeight: 700, color: 'var(--teal)' }}>{dailyCount} / 10 challenges</span>
        </div>
      </div>

      {/* Level Roadmap */}
      <div style={{
        background: 'var(--surface2)', border: '1px solid var(--border)',
        borderRadius: '16px', padding: '14px 18px', marginBottom: '16px',
      }}>
        <div style={{
          fontSize: '11px', fontFamily: 'Nunito', fontWeight: 800,
          textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text3)',
          marginBottom: '12px',
        }}>
          Level Roadmap
        </div>
        {LEVELS.map(l => {
          const isCompleted = xp > l.max
          const isCurrent = l.level === level.level
          return (
            <div key={l.level} style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '8px 0',
              borderBottom: l.level < 5 ? '1px solid var(--border)' : 'none',
              opacity: isCompleted || isCurrent ? 1 : 0.4,
            }}>
              <span style={{ fontSize: '20px', width: '28px', textAlign: 'center' }}>
                {isCompleted ? '✅' : isCurrent ? l.emoji : '🔒'}
              </span>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: '13px', fontFamily: 'Nunito', fontWeight: 700,
                  color: isCurrent ? 'var(--teal)' : 'var(--text)',
                }}>
                  Level {l.level} — {l.title}
                </div>
                <div style={{ fontSize: '11px', fontFamily: 'Nunito', fontWeight: 600, color: 'var(--text3)' }}>
                  {l.min} – {l.max === Infinity ? '∞' : l.max} XP
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* CTA */}
      <button
        onClick={() => onNavigate?.('home')}
        style={{
          width: '100%',
          background: 'linear-gradient(135deg, #00897B, #00D4B8)',
          border: 'none', borderRadius: '16px', padding: '16px',
          fontFamily: '"Baloo 2"', fontWeight: 800, fontSize: '16px', color: '#fff',
          boxShadow: '0 6px 20px rgba(0,212,184,0.3)',
          cursor: 'pointer',
        }}
      >
        ▶  Continue Learning
      </button>
    </div>
  )
}
