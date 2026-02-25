import { createContext, useContext, useState, useEffect } from 'react'

const TourContext = createContext()

export const useTour = () => {
  const context = useContext(TourContext)
  if (!context) throw new Error('useTour must be used within TourProvider')
  return context
}

export function TourProvider({ children }) {
  const [activeTour, setActiveTour] = useState(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  const startTour = (tourId) => {
    setActiveTour(tourId)
    setCurrentStep(0)
    setIsVisible(true)
  }

  const nextStep = () => {
    setCurrentStep((prev) => prev + 1)
  }

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(0, prev - 1))
  }

  const endTour = () => {
    setIsVisible(false)
    setTimeout(() => {
      setActiveTour(null)
      setCurrentStep(0)
    }, 300)
  }

  const skipTour = () => {
    endTour()
    // Mark tour as completed in localStorage
    if (activeTour) {
      localStorage.setItem(`tour_${activeTour}_completed`, 'true')
    }
  }

  return (
    <TourContext.Provider
      value={{
        activeTour,
        currentStep,
        isVisible,
        startTour,
        nextStep,
        prevStep,
        endTour,
        skipTour,
      }}
    >
      {children}
    </TourContext.Provider>
  )
}