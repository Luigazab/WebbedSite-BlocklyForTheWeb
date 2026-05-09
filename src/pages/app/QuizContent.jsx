import { useState } from 'react'
import QuizAssessment from './QuizAssessment'
import QuizResult from './QuizResult'

const QuizContent = ({ lesson, onFinish }) => {
  const [quizState, setQuizState] = useState('taking') // 'taking' | 'result'
  const [attemptResult, setAttemptResult] = useState(null)

  const handleQuizComplete = (result) => {
    // result = { score, total, timeTaken, answers: [{questionId, selectedOptionId, isCorrect}] }
    setAttemptResult(result)
    setQuizState('result')
  }

  const handleRetake = () => {
    setAttemptResult(null)
    setQuizState('taking')
  }

  if (quizState === 'taking') {
    return (
      <QuizAssessment
        lesson={lesson}
        onComplete={handleQuizComplete}
      />
    )
  }

  return (
    <QuizResult
      lesson={lesson}
      result={attemptResult}
      onRetake={handleRetake}
      onFinish={onFinish}
    />
  )
}

export default QuizContent