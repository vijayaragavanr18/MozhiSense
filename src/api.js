// Use the provided VITE_API_URL or fallback to local dev proxy
const BASE_URL = import.meta.env.VITE_API_URL || '/api'

export const getWords = async () => {
  const response = await fetch(`${BASE_URL}/words`)
  if (!response.ok) throw new Error('Failed to fetch words')
  return response.json()
}

export const getChallenges = async (word, senseId = null) => {
  let url = `${BASE_URL}/challenges?word=${encodeURIComponent(word)}`
  if (senseId) url += `&sense_id=${encodeURIComponent(senseId)}`
  const response = await fetch(url)
  if (!response.ok) throw new Error('Failed to fetch challenges')
  return response.json()
}

export const startSession = async (word, senseId = null) => {
  const response = await fetch(`${BASE_URL}/sessions/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ word, sense_id: senseId })
  })
  if (!response.ok) throw new Error('Failed to start session')
  return response.json()
}

export const recordAttempt = async (sessionId, challengeId, selectedAnswer, correct, responseTimeMs) => {
  const response = await fetch(`${BASE_URL}/sessions/${sessionId}/attempt`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      challenge_id: challengeId,
      selected_answer: selectedAnswer,
      correct,
      response_time_ms: responseTimeMs
    })
  })
  if (!response.ok) throw new Error('Failed to record attempt')
  return response.json()
}

export const getSessionSummary = async (sessionId) => {
  const response = await fetch(`${BASE_URL}/sessions/${sessionId}/summary`)
  if (!response.ok) throw new Error('Failed to get session summary')
  return response.json()
}

export const getGraphData = async (word) => {
  const response = await fetch(`${BASE_URL}/graph?word=${encodeURIComponent(word)}`)
  if (!response.ok) throw new Error('Failed to fetch graph data')
  return response.json()
}
