import { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext(null)

// Sound Realm themes
const REALM_THEMES = {
  electronic: {
    primary: '#a855f7',
    secondary: '#ec4899',
    gradient: 'linear-gradient(135deg, #a855f7, #ec4899)',
    glow: 'rgba(168, 85, 247, 0.5)'
  },
  ambient: {
    primary: '#06b6d4',
    secondary: '#3b82f6',
    gradient: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
    glow: 'rgba(6, 182, 212, 0.5)'
  },
  hiphop: {
    primary: '#f97316',
    secondary: '#eab308',
    gradient: 'linear-gradient(135deg, #f97316, #eab308)',
    glow: 'rgba(249, 115, 22, 0.5)'
  },
  rock: {
    primary: '#ef4444',
    secondary: '#f97316',
    gradient: 'linear-gradient(135deg, #ef4444, #f97316)',
    glow: 'rgba(239, 68, 68, 0.5)'
  },
  jazz: {
    primary: '#8b5cf6',
    secondary: '#a855f7',
    gradient: 'linear-gradient(135deg, #8b5cf6, #a855f7)',
    glow: 'rgba(139, 92, 246, 0.5)'
  },
  classical: {
    primary: '#6366f1',
    secondary: '#8b5cf6',
    gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    glow: 'rgba(99, 102, 241, 0.5)'
  },
  pop: {
    primary: '#ec4899',
    secondary: '#f472b6',
    gradient: 'linear-gradient(135deg, #ec4899, #f472b6)',
    glow: 'rgba(236, 72, 153, 0.5)'
  },
  rnb: {
    primary: '#10b981',
    secondary: '#06b6d4',
    gradient: 'linear-gradient(135deg, #10b981, #06b6d4)',
    glow: 'rgba(16, 185, 129, 0.5)'
  },
  lofi: {
    primary: '#64748b',
    secondary: '#94a3b8',
    gradient: 'linear-gradient(135deg, #64748b, #94a3b8)',
    glow: 'rgba(100, 116, 139, 0.5)'
  },
  podcast: {
    primary: '#14b8a6',
    secondary: '#10b981',
    gradient: 'linear-gradient(135deg, #14b8a6, #10b981)',
    glow: 'rgba(20, 184, 166, 0.5)'
  }
}

export function ThemeProvider({ children }) {
  const [currentTheme, setCurrentTheme] = useState('electronic')
  const [dynamicBackground, setDynamicBackground] = useState(null)
  const [particleIntensity, setParticleIntensity] = useState(1)
  const [glowIntensity, setGlowIntensity] = useState(1)
  const [reducedMotion, setReducedMotion] = useState(false)

  // Check for user's motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mediaQuery.matches)
    
    const handler = (e) => setReducedMotion(e.matches)
    mediaQuery.addEventListener('change', handler)
    
    return () => mediaQuery.removeEventListener('change', handler)
  }, [])

  // Get theme colors for a realm
  const getRealmTheme = (realm) => {
    return REALM_THEMES[realm] || REALM_THEMES.electronic
  }

  // Update theme based on track
  const updateThemeFromTrack = (track) => {
    if (track?.realm) {
      setCurrentTheme(track.realm)
    }
  }

  // Set dynamic background from image color
  const setDynamicBackgroundFromColor = (color) => {
    setDynamicBackground({
      background: `radial-gradient(ellipse at center, ${color}22 0%, transparent 70%)`,
      overlay: `linear-gradient(180deg, transparent 0%, #0a0a0f 100%)`
    })
  }

  // Generate gradient from multiple colors
  const generateGradient = (colors) => {
    if (!colors || colors.length === 0) return null
    
    const gradientStops = colors.map((color, index) => {
      const position = (index / (colors.length - 1)) * 100
      return `${color} ${position}%`
    }).join(', ')
    
    return `linear-gradient(135deg, ${gradientStops})`
  }

  // Get energy color
  const getEnergyColor = (energy) => {
    const colors = {
      calm: '#4ade80',
      flow: '#60a5fa',
      drive: '#f472b6',
      hyper: '#fb923c'
    }
    return colors[energy] || colors.flow
  }

  // Get mood color
  const getMoodColor = (mood) => {
    const moodColors = {
      happy: '#fbbf24',
      sad: '#3b82f6',
      energetic: '#f97316',
      calm: '#10b981',
      romantic: '#ec4899',
      melancholic: '#8b5cf6',
      upbeat: '#06b6d4',
      dark: '#64748b',
      dreamy: '#a855f7',
      focused: '#14b8a6'
    }
    return moodColors[mood] || '#a855f7'
  }

  const value = {
    currentTheme,
    setCurrentTheme,
    dynamicBackground,
    setDynamicBackground,
    particleIntensity,
    setParticleIntensity,
    glowIntensity,
    setGlowIntensity,
    reducedMotion,
    REALM_THEMES,
    getRealmTheme,
    updateThemeFromTrack,
    setDynamicBackgroundFromColor,
    generateGradient,
    getEnergyColor,
    getMoodColor
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

export default ThemeContext