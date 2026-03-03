import { useEffect, useRef, useMemo } from 'react'
import { useTheme } from '../../context/ThemeContext'
import { usePlayer } from '../../context/PlayerContext'

const ParticleBackground = () => {
  const canvasRef = useRef(null)
  const { getRealmTheme, currentTheme, particleIntensity } = useTheme()
  const { isPlaying, audioData } = usePlayer()
  const theme = getRealmTheme(currentTheme)

  // Generate particles
  const particles = useMemo(() => {
    const count = Math.floor(50 * particleIntensity)
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: Math.random() * 3 + 1,
      speedX: (Math.random() - 0.5) * 0.5,
      speedY: (Math.random() - 0.5) * 0.5,
      opacity: Math.random() * 0.5 + 0.2
    }))
  }, [particleIntensity])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    let animationFrameId
    let particleArray = [...particles]

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Get audio intensity for reactive particles
    const getAudioIntensity = () => {
      if (!audioData?.frequencyData) return 0
      const sum = audioData.frequencyData.reduce((a, b) => a + b, 0)
      return sum / (audioData.frequencyData.length * 255)
    }

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      const audioIntensity = isPlaying ? getAudioIntensity() : 0

      particleArray.forEach((particle, index) => {
        // Update position
        particle.x += particle.speedX * (1 + audioIntensity * 2)
        particle.y += particle.speedY * (1 + audioIntensity * 2)

        // Wrap around edges
        if (particle.x < 0) particle.x = canvas.width
        if (particle.x > canvas.width) particle.x = 0
        if (particle.y < 0) particle.y = canvas.height
        if (particle.y > canvas.height) particle.y = 0

        // Draw particle
        const size = particle.size * (1 + audioIntensity * 2)
        const opacity = particle.opacity * (1 + audioIntensity)

        ctx.beginPath()
        ctx.arc(particle.x, particle.y, size, 0, Math.PI * 2)
        ctx.fillStyle = `${theme.primary}${Math.floor(opacity * 255).toString(16).padStart(2, '0')}`
        ctx.fill()

        // Draw connections
        particleArray.slice(index + 1).forEach((otherParticle) => {
          const dx = particle.x - otherParticle.x
          const dy = particle.y - otherParticle.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < 150) {
            ctx.beginPath()
            ctx.moveTo(particle.x, particle.y)
            ctx.lineTo(otherParticle.x, otherParticle.y)
            ctx.strokeStyle = `${theme.primary}${Math.floor((1 - distance / 150) * 50).toString(16).padStart(2, '0')}`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        })
      })

      animationFrameId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      cancelAnimationFrame(animationFrameId)
    }
  }, [particles, theme, isPlaying, audioData])

  return (
    <canvas
      ref={canvasRef}
      className="particles-container"
      style={{ opacity: 0.6 }}
    />
  )
}

export default ParticleBackground