// Use /api for local dev proxy (configured in vite.config.js)
const BASE_URL = '/api'

export const getWords = async () => {
  const response = await fetch(`${BASE_URL}/words`)
  if (!response.ok) throw new Error('Failed to fetch words')
  return response.json()
}

// Backend expects: GET /challenges/{word_tamil}?sense_id=...
export const getChallenges = async (word, senseId = null) => {
  let url = `${BASE_URL}/challenges/${encodeURIComponent(word)}`
  if (senseId) url += `?sense_id=${encodeURIComponent(senseId)}`
  const response = await fetch(url)
  if (!response.ok) throw new Error('Failed to fetch challenges')
  return response.json()
}

// Backend expects: POST /sessions/start?word_tamil=...
export const startSession = async (word, senseId = null) => {
  let url = `${BASE_URL}/sessions/start?word_tamil=${encodeURIComponent(word)}`
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  })
  if (!response.ok) throw new Error('Failed to start session')
  return response.json()
}

export const recordAttempt = async (payload) => {
  const response = await fetch(`${BASE_URL}/sessions/attempt`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  if (!response.ok) throw new Error('Failed to record attempt')
  return response.json()
}

export const getSessionSummary = async (sessionId) => {
  const response = await fetch(`${BASE_URL}/sessions/${sessionId}/summary`)
  if (!response.ok) throw new Error('Failed to get session summary')
  return response.json()
}

// Backend expects: GET /graph/{word_tamil}
export const getGraphData = async (word) => {
  const response = await fetch(`${BASE_URL}/graph/${encodeURIComponent(word)}`)
  if (!response.ok) throw new Error('Failed to fetch graph data')
  return response.json()
}
