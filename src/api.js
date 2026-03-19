import axios from 'axios'

const BASE = 'http://localhost:8000'
const api = axios.create({ baseURL: BASE })

export const getWords = () => api.get('/words')
export const getWordSenses = (wordTamil) => api.get(`/words/${encodeURIComponent(wordTamil)}/senses`)
export const getChallenges = (wordTamil, options = {}) => {
	const params = new URLSearchParams()
	if (options.sense_id) params.set('sense_id', options.sense_id)
	if (options.weak_first) params.set('weak_first', 'true')

	const query = params.toString()
	const path = `/challenges/${encodeURIComponent(wordTamil)}${query ? `?${query}` : ''}`
	return api.get(path)
}
export const startSession = (wordTamil) => api.post(`/sessions/start?word_tamil=${encodeURIComponent(wordTamil)}`)
export const recordAttempt = (payload) => api.post('/sessions/attempt', payload)
export const getSessionSummary = (sessionId) => api.get(`/sessions/${sessionId}/summary`)
export const getGraphData = (wordTamil) => api.get(`/graph/${encodeURIComponent(wordTamil)}`)
export const preGenerateAllChallenges = () => api.post('/admin/pregenerate/all')
