/**
 * Custom hook for API calls with loading and error states
 * Usage:
 * 
 * const { data, loading, error } = useApi(() => fetchChallenge(wordId))
 */

import { useState, useEffect, useCallback } from 'react'

export function useApi(apiCall, autoFetch = true) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(autoFetch)
  const [error, setError] = useState(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const result = await apiCall()
      setData(result)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [apiCall])

  useEffect(() => {
    if (autoFetch) {
      fetch()
    }
  }, [autoFetch, fetch])

  return {
    data,
    loading,
    error,
    refetch: fetch,
  }
}

/**
 * Hook for mutation operations (POST, PUT, DELETE)
 * Usage:
 * 
 * const { mutate, loading } = useMutation(submitAnswer)
 * await mutate(challengeId, selectedWord)
 */

export function useMutation(mutationFn) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)

  const mutate = useCallback(
    async (...args) => {
      setLoading(true)
      setError(null)
      
      try {
        const result = await mutationFn(...args)
        setData(result)
        return result
      } catch (err) {
        setError(err.message)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [mutationFn]
  )

  return {
    mutate,
    loading,
    error,
    data,
  }
}
