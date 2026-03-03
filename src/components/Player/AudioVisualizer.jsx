import { useRef, useEffect } from 'react'
import { motion } from 'framer-motion'

const AudioVisualizer = ({ frequencyData, size = 'large', color = '#a855f7' }) => {
  const canvasRef = useRef(null)
  const animationRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !frequencyData) return

    const ctx = canvas.getContext('2d')
    const { width, height } = canvas

    // Clear canvas
    ctx.clearRect(0, 0, width, height)

    // Create gradient
    const gradient = ctx.createLinearGradient(0, height, 0, 0)
    gradient.addColorStop(0, color)
    gradient.addColorStop(1, `${color}66`)

    // Draw bars
    const barCount = size === 'small' ? 16 : 64
    const barWidth = width / barCount
    const barGap = 2

    for (let i = 0; i < barCount; i++) {
      const dataIndex = Math.floor(i * (frequencyData.length / barCount))
      const value = frequencyData[dataIndex] || 0
      const barHeight = (value / 255) * height

      ctx.fillStyle = gradient
      ctx.fillRect(
        i * barWidth + barGap / 2,
        height - barHeight,
        barWidth - barGap,
        barHeight
      )
    }
  }, [frequencyData, size, color])

  const dimensions = {
    small: { width: 48, height: 48 },
    medium: { width: 200, height: 100 },
    large: { width: 400, height: 200 }
  }

  const { width, height } = dimensions[size]

  return (
    <motion.canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="visualizer"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      style={{
        width: size === 'small' ? 48 : '100%',
        height: size === 'small' ? 48 : height
      }}
    />
  )
}

// Circular Visualizer Component
export const CircularVisualizer = ({ frequencyData, size = 200, color = '#a855f7' }) => {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !frequencyData) return

    const ctx = canvas.getContext('2d')
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const radius = size / 3

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw circular bars
    const barCount = 64
    const angleStep = (Math.PI * 2) / barCount

    for (let i = 0; i < barCount; i++) {
      const dataIndex = Math.floor(i * (frequencyData.length / barCount))
      const value = frequencyData[dataIndex] || 0
      const barHeight = (value / 255) * (size / 4)

      const angle = i * angleStep - Math.PI / 2
      const x1 = centerX + Math.cos(angle) * radius
      const y1 = centerY + Math.sin(angle) * radius
      const x2 = centerX + Math.cos(angle) * (radius + barHeight)
      const y2 = centerY + Math.sin(angle) * (radius + barHeight)

      const gradient = ctx.createLinearGradient(x1, y1, x2, y2)
      gradient.addColorStop(0, color)
      gradient.addColorStop(1, `${color}00`)

      ctx.beginPath()
      ctx.moveTo(x1, y1)
      ctx.lineTo(x2, y2)
      ctx.strokeStyle = gradient
      ctx.lineWidth = 3
      ctx.lineCap = 'round'
      ctx.stroke()
    }
  }, [frequencyData, size, color])

  return (
    <motion.canvas
      ref={canvasRef}
      width={size}
      height={size}
      className="circular-visualizer"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    />
  )
}

// Waveform Visualizer Component
export const WaveformVisualizer = ({ waveformData, width = 400, height = 100, color = '#a855f7' }) => {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !waveformData) return

    const ctx = canvas.getContext('2d')
    const centerY = height / 2

    // Clear canvas
    ctx.clearRect(0, 0, width, height)

    // Draw waveform
    ctx.beginPath()
    ctx.moveTo(0, centerY)

    const sliceWidth = width / waveformData.length

    for (let i = 0; i < waveformData.length; i++) {
      const value = waveformData[i] / 128.0
      const y = (value * height) / 2

      if (i === 0) {
        ctx.moveTo(0, y)
      } else {
        ctx.lineTo(i * sliceWidth, y)
      }
    }

    ctx.lineTo(width, centerY)
    ctx.strokeStyle = color
    ctx.lineWidth = 2
    ctx.stroke()

    // Fill area under waveform
    ctx.lineTo(width, height)
    ctx.lineTo(0, height)
    ctx.closePath()
    
    const gradient = ctx.createLinearGradient(0, 0, 0, height)
    gradient.addColorStop(0, `${color}40`)
    gradient.addColorStop(1, `${color}00`)
    ctx.fillStyle = gradient
    ctx.fill()
  }, [waveformData, width, height, color])

  return (
    <motion.canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="waveform-visualizer"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      style={{ width: '100%', height }}
    />
  )
}

export default AudioVisualizer