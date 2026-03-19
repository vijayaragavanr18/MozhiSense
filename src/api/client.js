/**
 * API Integration Layer
 * Centralize all backend API calls here
 * 
 * Usage:
 * import { fetchChallenge, submitAnswer } from '@/api/client'
 * 
 * const challenge = await fetchChallenge(wordId)
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// ── Authentication API ──

export async function login(email, password) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  
  if (!response.ok) throw new Error('Login failed')
  return response.json()
}

export async function signup(email, password, name) {
  const response = await fetch(`${API_BASE_URL}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name }),
  })
  
  if (!response.ok) throw new Error('Signup failed')
  return response.json()
}

export async function logout() {
  const response = await fetch(`${API_BASE_URL}/auth/logout`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
  })
  
  if (!response.ok) throw new Error('Logout failed')
}

// ── User API ──

export async function getCurrentUser() {
  const response = await fetch(`${API_BASE_URL}/user/me`, {
    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
  })
  
  if (!response.ok) throw new Error('Failed to fetch user')
  return response.json()
}

export async function updateUserProfile(name, photoUrl) {
  const response = await fetch(`${API_BASE_URL}/user/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
    body: JSON.stringify({ name, photoUrl }),
  })
  
  if (!response.ok) throw new Error('Failed to update profile')
  return response.json()
}

export async function getUserStats() {
  const response = await fetch(`${API_BASE_URL}/user/stats`, {
    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
  })
  
  if (!response.ok) throw new Error('Failed to fetch stats')
  return response.json()
}

// ── Words API ──

export async function fetchWord(wordId) {
  const response = await fetch(`${API_BASE_URL}/words/${wordId}`)
  
  if (!response.ok) throw new Error('Failed to fetch word')
  return response.json()
}

export async function fetchAllWords(limit = 20, page = 1) {
  const response = await fetch(
    `${API_BASE_URL}/words?limit=${limit}&page=${page}`
  )
  
  if (!response.ok) throw new Error('Failed to fetch words')
  return response.json()
}

export async function searchWords(query) {
  const response = await fetch(`${API_BASE_URL}/words/search?q=${query}`)
  
  if (!response.ok) throw new Error('Failed to search words')
  return response.json()
}

export async function getRecentWords() {
  const response = await fetch(`${API_BASE_URL}/user/recent-words`, {
    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
  })
  
  if (!response.ok) throw new Error('Failed to fetch recent words')
  return response.json()
}

// ── Challenges API ──

export async function fetchChallenge(wordId) {
  const response = await fetch(`${API_BASE_URL}/challenges?wordId=${wordId}`)
  
  if (!response.ok) throw new Error('Failed to fetch challenge')
  return response.json()
}

export async function submitAnswer(challengeId, selectedWord) {
  const response = await fetch(`${API_BASE_URL}/challenges/${challengeId}/submit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
    body: JSON.stringify({ selectedWord }),
  })
  
  if (!response.ok) throw new Error('Failed to submit answer')
  return response.json()
}

export async function startSession(wordIds) {
  const response = await fetch(`${API_BASE_URL}/sessions/start`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
    body: JSON.stringify({ wordIds }),
  })
  
  if (!response.ok) throw new Error('Failed to start session')
  return response.json()
}

export async function endSession(sessionId, stats) {
  const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}/end`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
    body: JSON.stringify(stats),
  })
  
  if (!response.ok) throw new Error('Failed to end session')
  return response.json()
}

// ── Semantic Graph API ──

export async function getSemanticGraph(wordId) {
  const response = await fetch(`${API_BASE_URL}/semantic-graph/${wordId}`)
  
  if (!response.ok) throw new Error('Failed to fetch semantic graph')
  return response.json()
}

export async function getSenses(wordId) {
  const response = await fetch(`${API_BASE_URL}/words/${wordId}/senses`)
  
  if (!response.ok) throw new Error('Failed to fetch senses')
  return response.json()
}

export async function getMorphologicalForms(wordId) {
  const response = await fetch(`${API_BASE_URL}/words/${wordId}/morphs`)
  
  if (!response.ok) throw new Error('Failed to fetch morphological forms')
  return response.json()
}

// ── Results API ──

export async function fetchSessionResults(sessionId) {
  const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}/results`, {
    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
  })
  
  if (!response.ok) throw new Error('Failed to fetch results')
  return response.json()
}

export async function getPerformanceAnalytics() {
  const response = await fetch(`${API_BASE_URL}/analytics/performance`, {
    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
  })
  
  if (!response.ok) throw new Error('Failed to fetch analytics')
  return response.json()
}

// ── Error Handling Utility ──

export async function handleApiError(error) {
  console.error('API Error:', error)
  
  if (error.message.includes('401')) {
    // Handle unauthorized - redirect to login
    localStorage.removeItem('token')
    window.location.href = '/login'
  }
  
  return {
    success: false,
    error: error.message,
  }
}

// ── Request Interceptor for Token ──

export function getAuthHeaders() {
  const token = localStorage.getItem('token')
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  }
}

// ── Fetch Wrapper ──

export async function apiCall(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`
  
  const response = await fetch(url, {
    headers: getAuthHeaders(),
    ...options,
  })
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'API call failed')
  }
  
  return response.json()
}

// Export for easy usage
export const api = {
  // Auth
  login,
  signup,
  logout,
  
  // User
  getCurrentUser,
  updateUserProfile,
  getUserStats,
  
  // Words
  fetchWord,
  fetchAllWords,
  searchWords,
  getRecentWords,
  
  // Challenges
  fetchChallenge,
  submitAnswer,
  startSession,
  endSession,
  
  // Semantic Graph
  getSemanticGraph,
  getSenses,
  getMorphologicalForms,
  
  // Results
  fetchSessionResults,
  getPerformanceAnalytics,
}

export default api
