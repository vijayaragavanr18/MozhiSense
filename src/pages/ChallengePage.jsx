import { useEffect, useRef, useState } from 'react'
import { DndContext, useDraggable, useDroppable } from '@dnd-kit/core'
import { getChallenges, getSessionSummary, preGenerateAllChallenges, recordAttempt, startSession } from '../api'

function DragTile({ option, index, answered, correctAnswer, filledAnswer, isCorrectAnswer }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: option.text,
    disabled: answered,
  })

  const isThisCorrect = option.text === correctAnswer
  const isThisChosen = option.text === filledAnswer
  const isChosenWrong = isThisChosen && !isCorrectAnswer

  let bg = 'var(--surface2)'
  let borderColor = 'var(--border2)'
  let textColor = 'var(--text)'
  let extraStyle = {}

  if (answered) {
    if (isThisCorrect) {
      bg = 'var(--green-dim)'
      borderColor = 'var(--green)'
      textColor = 'var(--green)'
    } else if (isChosenWrong) {
      bg = 'var(--coral-dim)'
      borderColor = 'var(--coral)'
      textColor = 'var(--coral)'
      extraStyle = { animation: 'shake 0.4s ease-in-out' }
    } else {
      extraStyle = { opacity: 0.3, pointerEvents: 'none' }
    }
  }

  return (
    <button
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={{
        background: bg, border: `2px solid ${borderColor}`,
        borderRadius: '16px', padding: '14px 10px',
        fontFamily: '"Baloo 2"', fontWeight: 700, fontSize: '18px', color: textColor,
        textAlign: 'center', cursor: answered ? 'default' : 'grab',
        touchAction: 'none',
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
        opacity: isDragging ? 0.4 : undefined,
        transition: 'all 0.15s ease',
        ...extraStyle,
      }}
    >
      {option.text}
    </button>
  )
}

function BlankSlot({ filledAnswer, isCorrect, isWrong, answered }) {
  const { setNodeRef, isOver } = useDroppable({ id: 'blank-slot' })

  let borderStyle = '2.5px dashed var(--teal)'
  let bg = 'var(--teal-dim)'
  let textColor = 'var(--teal)'
  let content = '___'
  let animClass = ''

  if (answered && isCorrect) {
    borderStyle = '2.5px solid var(--green)'
    bg = 'var(--green-dim)'
    textColor = 'var(--green)'
    content = filledAnswer
    animClass = 'animate-blank-fill'
  } else if (answered && isWrong) {
    borderStyle = '2.5px solid var(--coral)'
    bg = 'var(--coral-dim)'
    textColor = 'var(--coral)'
    content = '✗'
  } else if (filledAnswer) {
    content = filledAnswer
  } else if (isOver) {
    bg = 'rgba(0,212,184,0.25)'
  }

  return (
    <span
      ref={setNodeRef}
      className={animClass}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        minWidth: '110px', height: '40px', borderRadius: '10px',
        border: borderStyle, background: bg, color: textColor,
        fontFamily: '"Baloo 2"', fontWeight: 800, fontSize: '17px',
        margin: '0 4px', verticalAlign: 'middle',
      }}
    >
      {content}
    </span>
  )
}

export default function ChallengePage({ word, selectedSenseId, onNavigate }) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [challenges, setChallenges] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [sessionId, setSessionId] = useState(null)
  const [filledAnswer, setFilledAnswer] = useState(null)
  const [answered, setAnswered] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [lives, setLives] = useState(3)
  const [retryCount, setRetryCount] = useState(0)
  const questionStartRef = useRef(Date.now())

  const challenge = challenges[currentIndex]

  useEffect(() => {
    if (!word?.tamil) {
      setLoading(false)
      setError('Please select a word from Home first.')
      return
    }

    setLoading(true)
    setError('')

    const init = async () => {
      try {
        let sid = null
        try {
          const sessionRes = await startSession(word.tamil)
          sid = sessionRes.data.session_id
          setSessionId(sid)
        } catch {
          // Graceful degradation — continue without session
        }

        let challengeRes
        try {
          challengeRes = await getChallenges(word.tamil, { sense_id: selectedSenseId, weak_first: false })
        } catch (err) {
          if (err?.response?.status === 503) {
            await preGenerateAllChallenges()
            challengeRes = await getChallenges(word.tamil, { sense_id: selectedSenseId, weak_first: false })
          } else {
            throw err
          }
        }

        const list = challengeRes.data.challenges || []
        if (list.length === 0) {
          setError('No challenges available for this word yet.')
          return
        }

        setChallenges(list)
        setCurrentIndex(0)
        questionStartRef.current = Date.now()
      } catch {
        setError('Failed to load challenges. Check backend, pre-generation, and Ollama availability.')
      } finally {
        setLoading(false)
      }
    }

    init()
  }, [word?.tamil, selectedSenseId, retryCount])

  useEffect(() => {
    if (!challenge) return
    setFilledAnswer(null)
    setAnswered(false)
    setIsCorrect(false)
    questionStartRef.current = Date.now()
  }, [currentIndex, challenge?.id])

  const handleDragEnd = async (event) => {
    if (!challenge || answered) return
    const { over, active } = event
    if (!over || over.id !== 'blank-slot') return

    const dropped = active.id
    if (!dropped) return

    const correct = dropped === challenge.correct_answer
    const responseTime = Date.now() - questionStartRef.current

    setFilledAnswer(dropped)
    setAnswered(true)
    setIsCorrect(correct)
    if (!correct) setLives(l => Math.max(0, l - 1))

    if (sessionId) {
      try {
        await recordAttempt({
          session_id: sessionId,
          challenge_id: challenge.id,
          word_tamil: word.tamil,
          sense_label: challenge.sense_label,
          player_answer: dropped,
          correct_answer: challenge.correct_answer,
          is_correct: correct,
          response_time_ms: responseTime,
        })
      } catch {
        // Silently ignore attempt recording failures
      }
    }
  }

  const handleContinue = async () => {
    if (currentIndex < challenges.length - 1) {
      setCurrentIndex(i => i + 1)
      return
    }

    // Last question — get summary
    if (sessionId) {
      try {
        const res = await getSessionSummary(sessionId)
        const summary = res.data

        // Update localStorage
        const currentXp = parseInt(localStorage.getItem('mozhisense_xp') || '0', 10)
        localStorage.setItem('mozhisense_xp', String(currentXp + (summary.xp_earned || 0)))

        // Streak logic
        const today = new Date().toDateString()
        const lastPlayed = localStorage.getItem('mozhisense_last_played')
        let streak = parseInt(localStorage.getItem('mozhisense_streak') || '0', 10)

        const yesterday = new Date(Date.now() - 86400000).toDateString()
        if (lastPlayed === yesterday) streak += 1
        else if (lastPlayed === today) { /* same */ }
        else streak = 1

        localStorage.setItem('mozhisense_streak', String(streak))
        localStorage.setItem('mozhisense_last_played', today)

        // Daily count
        let dailyCount = parseInt(localStorage.getItem('mozhisense_daily_count') || '0', 10)
        if (lastPlayed !== today) dailyCount = 0
        dailyCount += summary.total_questions || 0
        localStorage.setItem('mozhisense_daily_count', String(dailyCount))

        onNavigate?.('results', { summary, sessionId })
      } catch {
        onNavigate?.('home')
      }
    } else {
      onNavigate?.('home')
    }
  }

  // Loading state
  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, padding: '40px 16px' }}>
        <div style={{ fontFamily: '"Baloo 2"', fontWeight: 800, fontSize: '48px', color: 'var(--teal)', marginBottom: '16px' }}>
          {word?.tamil || '...'}
        </div>
        <div style={{ fontSize: '14px', fontFamily: 'Nunito', color: 'var(--text2)', marginBottom: '8px' }}>
          Generating challenges with AI...
        </div>
        <div style={{ fontSize: '12px', fontFamily: 'Nunito', color: 'var(--text3)', marginBottom: '20px' }}>
          This may take a few seconds on first load
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{
              width: '8px', height: '8px', borderRadius: '50%', background: 'var(--teal)',
              animation: `dot-pulse 1.4s ease-in-out ${i * 0.2}s infinite`,
            }} />
          ))}
        </div>
      </div>
    )
  }

  // Error state
  if (error || !challenge) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, padding: '40px 16px' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
        <div style={{
          background: 'var(--surface2)', border: '1px solid var(--border)',
          borderRadius: '16px', padding: '16px', textAlign: 'center', marginBottom: '16px', maxWidth: '280px',
        }}>
          <p style={{ fontSize: '14px', fontFamily: 'Nunito', fontWeight: 600, color: 'var(--text2)' }}>
            {error || 'Unable to render challenge.'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setRetryCount(c => c + 1)}
            style={{
              background: 'linear-gradient(135deg, #00897B, #00D4B8)', border: 'none',
              borderRadius: '12px', padding: '12px 24px', color: '#fff',
              fontFamily: 'Nunito', fontWeight: 700, fontSize: '14px', cursor: 'pointer',
            }}
          >
            ↻ Retry
          </button>
          <button
            onClick={() => onNavigate?.('home')}
            style={{
              background: 'var(--surface2)', border: '1px solid var(--border2)',
              borderRadius: '12px', padding: '12px 24px', color: 'var(--text2)',
              fontFamily: 'Nunito', fontWeight: 700, fontSize: '14px', cursor: 'pointer',
            }}
          >
            ← Home
          </button>
        </div>
      </div>
    )
  }

  const parts = (challenge.sentence_tamil || '').split('___')
  const before = parts[0] || ''
  const after = parts[1] || ''
  const isWrong = answered && !isCorrect
  const options = challenge.options || []

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div style={{ padding: '0 0 16px' }}>
        {/* Section A — Header bar */}
        <div style={{ padding: '0 16px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => onNavigate?.('home')}
            style={{
              width: '38px', height: '38px', background: 'var(--surface2)',
              border: '1px solid var(--border2)', borderRadius: '12px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--text)', cursor: 'pointer', fontSize: '16px', flexShrink: 0,
            }}
          >
            ←
          </button>

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', gap: '3px', marginBottom: '6px' }}>
              {challenges.map((_, idx) => (
                <div key={idx} style={{
                  flex: 1, height: '6px', borderRadius: '3px',
                  background: idx < currentIndex ? 'var(--teal)'
                    : idx === currentIndex ? 'var(--gold)' : 'var(--surface3)',
                  animation: idx === currentIndex ? 'pip-pulse 1.2s ease-in-out infinite' : undefined,
                }} />
              ))}
            </div>
            <div style={{ fontSize: '11px', fontFamily: 'Nunito', fontWeight: 800, color: 'var(--text3)' }}>
              Question {currentIndex + 1} of {challenges.length}  ·  {challenge.sense_label}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '4px', fontSize: '18px', flexShrink: 0 }}>
            {[0, 1, 2].map(i => (
              <span key={i} style={{
                filter: i < lives ? 'none' : 'grayscale(1)',
                opacity: i < lives ? 1 : 0.25,
                transition: 'all 0.3s ease',
              }}>
                ❤️
              </span>
            ))}
          </div>
        </div>

        {/* Section B — Word context card */}
        <div style={{
          margin: '0 16px 14px', background: 'var(--surface2)', border: '1px solid var(--border2)',
          borderRadius: '22px', padding: '18px 20px', overflow: 'hidden', position: 'relative',
        }}>
          <div style={{
            position: 'absolute', top: '-50px', right: '-50px',
            width: '160px', height: '160px',
            background: 'radial-gradient(circle, rgba(0,212,184,0.1), transparent 70%)',
            pointerEvents: 'none',
          }} />
          <div style={{ fontSize: '10px', fontFamily: 'Nunito', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text3)', marginBottom: '6px' }}>
            Word in focus
          </div>
          <div style={{ fontFamily: '"Baloo 2"', fontWeight: 800, fontSize: '50px', color: 'var(--text)', lineHeight: 1, marginBottom: '4px' }}>
            {word.tamil}
          </div>
          <div style={{ fontSize: '13px', fontFamily: 'Nunito', fontWeight: 700, color: 'var(--text3)', marginBottom: '10px' }}>
            {word.roman}
          </div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {(word.senses || []).map(sense => {
              const isActive = sense.id === challenge.sense_id
              return (
                <span key={sense.id} style={{
                  borderRadius: '10px', padding: '5px 12px',
                  fontFamily: '"Baloo 2"', fontWeight: 800, fontSize: '12px',
                  background: isActive ? 'var(--teal-dim)' : 'rgba(255,255,255,0.05)',
                  color: isActive ? 'var(--teal)' : 'var(--text3)',
                  border: `1px solid ${isActive ? 'var(--teal-border)' : 'var(--border)'}`,
                }}>
                  {sense.label}
                </span>
              )
            })}
          </div>
        </div>

        {/* Section C — Question label */}
        <div style={{
          padding: '0 16px', marginBottom: '12px',
          fontSize: '11px', fontFamily: 'Nunito', fontWeight: 800,
          textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text3)',
        }}>
          Fill in the blank
        </div>

        {/* Section D — Sentence card */}
        <div style={{
          margin: '0 16px 14px', background: 'var(--surface2)', border: '1px solid var(--border2)',
          borderRadius: '20px', padding: '20px',
        }}>
          <div style={{
            fontFamily: '"Baloo 2"', fontWeight: 700, fontSize: '21px',
            color: 'var(--text)', lineHeight: 1.7,
          }}>
            {before}
            <BlankSlot filledAnswer={filledAnswer} isCorrect={isCorrect} isWrong={isWrong} answered={answered} />
            {after}
          </div>
          <div style={{ fontSize: '12px', fontFamily: 'Nunito', fontWeight: 700, color: 'var(--text3)', fontStyle: 'italic', marginTop: '8px' }}>
            {challenge.sentence_english}
          </div>
        </div>

        {/* Section E — Options grid */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '9px',
          padding: '0 16px', marginBottom: '14px',
        }}>
          {options.map((option, idx) => (
            <DragTile
              key={`${option.text}-${idx}`}
              option={option}
              index={idx}
              answered={answered}
              correctAnswer={challenge.correct_answer}
              filledAnswer={filledAnswer}
              isCorrectAnswer={isCorrect}
            />
          ))}
        </div>

        {/* Section F — Feedback toast */}
        {answered && (
          <div className="animate-slide-up-toast" style={{
            margin: '0 16px 14px',
            background: isCorrect ? 'var(--green-dim)' : 'var(--coral-dim)',
            border: `1.5px solid ${isCorrect ? 'rgba(34,197,94,0.3)' : 'rgba(232,82,58,0.25)'}`,
            borderRadius: '16px', padding: '14px 16px',
            display: 'flex', gap: '12px',
          }}>
            <div style={{
              width: '38px', height: '38px', flexShrink: 0,
              background: isCorrect ? 'rgba(34,197,94,0.2)' : 'rgba(232,82,58,0.2)',
              borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '20px',
            }}>
              {isCorrect ? '✅' : '❌'}
            </div>
            <div>
              <div style={{ fontSize: '13px', fontFamily: 'Nunito', fontWeight: 800, color: 'var(--text)', marginBottom: '4px' }}>
                {isCorrect ? 'Correct! சரியான விடை!' : `Wrong. The answer is: ${challenge.correct_answer}`}
              </div>
              <div style={{ fontSize: '11px', fontFamily: 'Nunito', fontWeight: 600, color: 'var(--text2)', lineHeight: 1.5 }}>
                {challenge.morphological_note}
              </div>
            </div>
          </div>
        )}

        {/* Section G — Continue button */}
        {answered && (
          <div style={{ padding: '0 16px' }}>
            <button
              onClick={handleContinue}
              style={{
                width: '100%',
                background: isCorrect
                  ? 'linear-gradient(135deg, #00897B, #00D4B8)'
                  : 'linear-gradient(135deg, #C0392B, #E8523A)',
                boxShadow: isCorrect
                  ? '0 6px 20px rgba(0,212,184,0.35)'
                  : '0 6px 20px rgba(232,82,58,0.3)',
                border: 'none', borderRadius: '16px', padding: '16px',
                fontFamily: '"Baloo 2"', fontWeight: 800, fontSize: '16px', color: '#fff',
                cursor: 'pointer', transition: 'all 0.2s ease',
              }}
            >
              {currentIndex < challenges.length - 1
                ? (isCorrect ? 'Continue →' : 'Got it →')
                : 'See Results →'
              }
            </button>
          </div>
        )}
      </div>
    </DndContext>
  )
}
