export default function ResultsPage({ summary, onNavigate, selectedWord }) {
  if (!summary) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, padding: '40px 16px' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
        <div style={{
          background: 'var(--surface2)', border: '1px solid var(--border)',
          borderRadius: '16px', padding: '16px', textAlign: 'center', marginBottom: '16px',
        }}>
          <p style={{ fontSize: '14px', fontFamily: 'Nunito', fontWeight: 600, color: 'var(--text2)' }}>
            Complete a challenge round to see your results
          </p>
        </div>
        <button
          onClick={() => onNavigate?.('home')}
          style={{
            background: 'linear-gradient(135deg, #00897B, #00D4B8)', border: 'none',
            borderRadius: '12px', padding: '12px 24px', color: '#fff',
            fontFamily: 'Nunito', fontWeight: 700, cursor: 'pointer',
          }}
        >
          ← Go Home
        </button>
      </div>
    )
  }

  const attempts = summary.attempts || []
  const avgTime = attempts.length > 0
    ? (attempts.reduce((sum, a) => sum + a.response_time_ms, 0) / attempts.length / 1000).toFixed(1)
    : '0.0'

  const celebrationEmoji = summary.accuracy >= 90 ? '🎉' : summary.accuracy >= 70 ? '😊' : summary.accuracy >= 50 ? '😐' : '💪'

  const stats = [
    { value: `${summary.accuracy}%`, label: 'ACCURACY', color: 'var(--teal)' },
    { value: `${summary.best_streak}🔥`, label: 'BEST STREAK', color: 'var(--gold)' },
    { value: `${summary.correct}/${summary.total_questions}`, label: 'CORRECT', color: 'var(--purple)' },
    { value: `${avgTime}s`, label: 'AVG TIME', color: 'var(--text)' },
  ]

  return (
    <div style={{ padding: '0 16px 16px' }}>
      {/* Section A — Celebration hero */}
      <div style={{ textAlign: 'center', paddingTop: '8px', marginBottom: '18px' }}>
        <div className="animate-celebration" style={{ fontSize: '68px', lineHeight: 1, marginBottom: '12px', display: 'inline-block' }}>
          {celebrationEmoji}
        </div>
        <div style={{ fontFamily: '"Baloo 2"', fontWeight: 800, fontSize: '28px', color: 'var(--text)', marginBottom: '4px' }}>
          Round Complete!
        </div>
        <div style={{ fontSize: '14px', fontFamily: 'Nunito', fontWeight: 700, color: 'var(--text2)' }}>
          You played {summary.word_tamil} ({summary.total_questions} senses)
        </div>
      </div>

      {/* Section B — Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
        {stats.map(stat => (
          <div key={stat.label} style={{
            background: 'var(--surface2)', border: '1px solid var(--border2)',
            borderRadius: '18px', padding: '16px', textAlign: 'center',
          }}>
            <div style={{ fontFamily: '"Baloo 2"', fontWeight: 800, fontSize: '32px', color: stat.color, lineHeight: 1, marginBottom: '4px' }}>
              {stat.value}
            </div>
            <div style={{
              fontSize: '10px', fontFamily: 'Nunito', fontWeight: 800,
              textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text3)',
            }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Section C — XP earned banner */}
      <div style={{
        background: 'var(--gold-dim)',
        border: '1.5px solid rgba(244,161,46,0.3)',
        borderRadius: '16px', padding: '14px 18px',
        display: 'flex', alignItems: 'center', gap: '12px',
        marginBottom: '14px',
      }}>
        <span style={{ fontSize: '32px' }}>⭐</span>
        <div>
          <div style={{ fontFamily: '"Baloo 2"', fontWeight: 800, fontSize: '22px', color: 'var(--gold)' }}>
            +{summary.xp_earned} XP earned!
          </div>
          <div style={{ fontSize: '12px', fontFamily: 'Nunito', fontWeight: 600, color: 'var(--text2)' }}>
            {summary.best_streak >= 5 ? 'Streak bonus included!' : 'Keep going for streak bonus!'}
          </div>
        </div>
      </div>

      {/* Section D — Attempt review list */}
      <div style={{ marginBottom: '16px' }}>
        {attempts.map((attempt, idx) => (
          <div key={idx} style={{
            background: attempt.is_correct ? 'var(--green-dim)' : 'var(--coral-dim)',
            border: `1px solid ${attempt.is_correct ? 'rgba(34,197,94,0.2)' : 'rgba(232,82,58,0.18)'}`,
            borderRadius: '13px', padding: '10px 13px', marginBottom: '7px',
            display: 'flex', alignItems: 'center', gap: '10px',
          }}>
            <span style={{ fontSize: '15px', flexShrink: 0 }}>
              {attempt.is_correct ? '✅' : '❌'}
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <span style={{
                fontFamily: '"Baloo 2"', fontWeight: 800, fontSize: '16px',
                color: attempt.is_correct ? 'var(--text)' : 'var(--coral)',
              }}>
                {attempt.player_answer}
              </span>
              {!attempt.is_correct && (
                <span style={{ fontSize: '12px', color: 'var(--green)', marginLeft: '8px' }}>
                  → {attempt.correct_answer}
                </span>
              )}
              <div style={{ fontSize: '11px', fontFamily: 'Nunito', fontWeight: 700, color: 'var(--text3)' }}>
                {attempt.sense_label}
              </div>
            </div>
            <span style={{ fontSize: '11px', fontFamily: 'Nunito', fontWeight: 700, color: 'var(--text3)', flexShrink: 0 }}>
              {(attempt.response_time_ms / 1000).toFixed(1)}s
            </span>
          </div>
        ))}
      </div>

      {/* Section E — Action buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
        <button
          onClick={() => onNavigate?.('home')}
          style={{
            width: '100%',
            background: 'linear-gradient(135deg, #00897B, #00D4B8)',
            boxShadow: '0 6px 20px rgba(0,212,184,0.35)',
            border: 'none', borderRadius: '15px', padding: '16px',
            fontFamily: '"Baloo 2"', fontWeight: 800, fontSize: '16px', color: '#fff',
            cursor: 'pointer',
          }}
        >
          🏠 Back to Home
        </button>
        <button
          onClick={() => onNavigate?.('explore', { word: selectedWord })}
          style={{
            width: '100%',
            background: 'var(--surface2)', border: '1.5px solid var(--border2)',
            borderRadius: '15px', padding: '15px',
            fontFamily: '"Baloo 2"', fontWeight: 800, fontSize: '15px', color: 'var(--text2)',
            cursor: 'pointer',
          }}
        >
          🕸️ Explore Semantic Web
        </button>
      </div>
    </div>
  )
}
