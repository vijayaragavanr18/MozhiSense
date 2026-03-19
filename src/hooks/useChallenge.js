import { useCallback, useState } from 'react'

/**
 * Custom hook for managing drag-and-drop word selection
 * Ready for dnd-kit integration
 */
export function useDragDropChallenge() {
  const [selectedWord, setSelectedWord] = useState(null)
  const [feedback, setFeedback] = useState(null)
  const [answered, setAnswered] = useState(false)

  const handleSelectWord = useCallback((wordId) => {
    setSelectedWord(wordId)
  }, [])

  const handleSubmitAnswer = useCallback((correctWordId) => {
    const isCorrect = selectedWord === correctWordId
    setFeedback({
      isCorrect,
      message: isCorrect ? '✅ Correct!' : '❌ Try again!'
    })
    setAnswered(true)
    return isCorrect
  }, [selectedWord])

  const reset = useCallback(() => {
    setSelectedWord(null)
    setFeedback(null)
    setAnswered(false)
  }, [])

  return {
    selectedWord,
    feedback,
    answered,
    handleSelectWord,
    handleSubmitAnswer,
    reset
  }
}

/**
 * Custom hook for managing game session state
 */
export function useGameSession() {
  const [currentQuestion, setCurrentQuestion] = useState(1)
  const [score, setScore] = useState(0)
  const [hearts, setHearts] = useState(3)
  const [sessionData, setSessionData] = useState([])

  const addAnswer = useCallback((isCorrect) => {
    if (isCorrect) {
      setScore(prev => prev + 1)
    } else if (hearts > 0) {
      setHearts(prev => prev - 1)
    }
    setSessionData(prev => [...prev, { question: currentQuestion, isCorrect }])
  }, [currentQuestion, hearts])

  const nextQuestion = useCallback(() => {
    setCurrentQuestion(prev => prev + 1)
  }, [])

  return {
    currentQuestion,
    score,
    hearts,
    sessionData,
    addAnswer,
    nextQuestion
  }
}

/**
 * Custom hook for semantic graph interaction
 */
export function useSemanticGraph() {
  const [selectedSense, setSelectedSense] = useState(null)
  const [hoveredNode, setHoveredNode] = useState(null)

  const handleSelectSense = useCallback((senseId) => {
    setSelectedSense(senseId)
  }, [])

  const handleHoverNode = useCallback((nodeId) => {
    setHoveredNode(nodeId)
  }, [])

  return {
    selectedSense,
    hoveredNode,
    handleSelectSense,
    handleHoverNode
  }
}
