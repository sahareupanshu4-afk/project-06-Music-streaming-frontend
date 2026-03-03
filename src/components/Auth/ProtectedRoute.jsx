import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import LoadingScreen from '../UI/LoadingScreen'
import { useState, useEffect } from 'react'

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()
  const location = useLocation()
  const [timeoutReached, setTimeoutReached] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading) {
        setTimeoutReached(true)
      }
    }, 5000) // 5 second timeout

    return () => clearTimeout(timer)
  }, [loading])

  // If loading and timeout not reached, show loading
  if (loading && !timeoutReached) {
    return <LoadingScreen />
  }

  // If timeout reached or not loading and no user, redirect to login
  if (!user || timeoutReached) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}

export default ProtectedRoute
