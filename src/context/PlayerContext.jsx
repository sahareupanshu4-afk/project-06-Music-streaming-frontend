import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'

const PlayerContext = createContext(null)

const ENERGY_LEVELS = {
  calm: { min: 0, max: 90, color: '#4ade80', label: 'Calm' },
  flow: { min: 90, max: 120, color: '#60a5fa', label: 'Flow' },
  drive: { min: 120, max: 150, color: '#f472b6', label: 'Drive' },
  hyper: { min: 150, max: 300, color: '#fb923c', label: 'Hyper' }
}

export function PlayerProvider({ children }) {
  const { user, updateSoundDNA } = useAuth()
  
  const [currentTrack, setCurrentTrack] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(0.8)
  const [isMuted, setIsMuted] = useState(false)
  const [queue, setQueue] = useState([])
  const [queueIndex, setQueueIndex] = useState(0)
  const [shuffle, setShuffle] = useState(false)
  const [repeat, setRepeat] = useState('none')
  const [isFullscreen, setIsFullscreen] = useState(false)
  
  const [audioData, setAudioData] = useState({
    frequencyData: new Uint8Array(128),
    waveformData: new Uint8Array(128)
  })
  const [dominantColor, setDominantColor] = useState('#a855f7')
  
  const audioRef = useRef(null)
  const audioContextRef = useRef(null)
  const analyserRef = useRef(null)
  const sourceRef = useRef(null)
  const animationFrameRef = useRef(null)
  
  const initAudioContext = useCallback(() => {
    if (!audioContextRef.current && audioRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)()
      analyserRef.current = audioContextRef.current.createAnalyser()
      analyserRef.current.fftSize = 256
      analyserRef.current.smoothingTimeConstant = 0.8
      
      sourceRef.current = audioContextRef.current.createMediaElementSource(audioRef.current)
      sourceRef.current.connect(analyserRef.current)
      analyserRef.current.connect(audioContextRef.current.destination)
    }
  }, [])
  
  const analyzeAudio = useCallback(() => {
    if (analyserRef.current && isPlaying) {
      const frequencyData = new Uint8Array(analyserRef.current.frequencyBinCount)
      const waveformData = new Uint8Array(analyserRef.current.frequencyBinCount)
      
      analyserRef.current.getByteFrequencyData(frequencyData)
      analyserRef.current.getByteTimeDomainData(waveformData)
      
      setAudioData({ frequencyData, waveformData })
    }
    animationFrameRef.current = requestAnimationFrame(analyzeAudio)
  }, [isPlaying])
  
  const playTrack = useCallback(async (track, trackList = []) => {
    try {
      if (trackList.length > 0) {
        setQueue(trackList)
        const index = trackList.findIndex(t => t.id === track.id)
        setQueueIndex(index >= 0 ? index : 0)
      } else {
        setQueue([track])
        setQueueIndex(0)
      }

      if (!currentTrack || currentTrack.id !== track.id) {
        setCurrentTrack(track)

        setTimeout(() => {
          if (audioRef.current) {
            audioRef.current.load()
            audioRef.current.play().then(() => {
              setIsPlaying(true)
            }).catch(err => {
              console.error('Audio play error:', err)
              setIsPlaying(false)
            })
          }
        }, 100)
      } else {
        if (audioRef.current) {
          audioRef.current.play().then(() => {
            setIsPlaying(true)
          }).catch(err => {
            console.error('Audio resume error:', err)
          })
        }
      }
      
      if (user) {
        await supabase.from('analytics').insert({
          user_id: user.id,
          track_id: track.id,
          played_at: new Date().toISOString(),
          session_duration: 0
        })
        
        await supabase.from('recently_played').upsert({
          user_id: user.id,
          track_id: track.id,
          last_position: 0,
          energy_snapshot: getEnergyLevel(track.bpm),
          played_at: new Date().toISOString()
        }, { onConflict: 'user_id,track_id' })
        
        await supabase.rpc('increment_play_count', { track_id: track.id })
      }
    } catch (error) {
      console.error('Error playing track:', error)
    }
  }, [user])
  
  const getEnergyLevel = (bpm) => {
    if (!bpm) return 'flow'
    if (bpm < 90) return 'calm'
    if (bpm < 120) return 'flow'
    if (bpm < 150) return 'drive'
    return 'hyper'
  }
  
  const togglePlay = useCallback(() => {
    if (audioRef.current && currentTrack) {
      if (isPlaying) {
        audioRef.current.pause()
        setIsPlaying(false)
      } else {
        if (audioContextRef.current?.state === 'suspended') {
          audioContextRef.current.resume()
        }
        audioRef.current.play().then(() => {
          setIsPlaying(true)
        }).catch(err => {
          console.error('Audio resume error:', err)
        })
      }
    }
  }, [isPlaying, currentTrack])
  
  const seek = useCallback((time) => {
    if (audioRef.current && currentTrack) {
      const maxTime = duration || currentTrack.duration || 0
      const clampedTime = Math.max(0, Math.min(time, maxTime))
      
      if (audioRef.current.readyState >= 1) {
        audioRef.current.currentTime = clampedTime
      }
      setCurrentTime(clampedTime)
    }
  }, [duration, currentTrack])
  
  const nextTrack = useCallback(() => {
    if (queue.length === 0) return
    
    let nextIndex
    if (shuffle) {
      nextIndex = Math.floor(Math.random() * queue.length)
    } else {
      nextIndex = (queueIndex + 1) % queue.length
    }
    
    setQueueIndex(nextIndex)
    setCurrentTrack(queue[nextIndex])
    setIsPlaying(true)
  }, [queue, queueIndex, shuffle])
  
  const previousTrack = useCallback(() => {
    if (queue.length === 0) return
    
    if (currentTime > 3) {
      seek(0)
      return
    }
    
    const prevIndex = queueIndex === 0 ? queue.length - 1 : queueIndex - 1
    setQueueIndex(prevIndex)
    setCurrentTrack(queue[prevIndex])
    setIsPlaying(true)
  }, [queue, queueIndex, currentTime, seek])
  
  const changeVolume = useCallback((newVolume) => {
    if (audioRef.current) {
      audioRef.current.volume = newVolume
      setVolume(newVolume)
      setIsMuted(newVolume === 0)
    }
  }, [])
  
  const toggleMute = useCallback(() => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = volume || 0.8
        setIsMuted(false)
      } else {
        audioRef.current.volume = 0
        setIsMuted(true)
      }
    }
  }, [isMuted, volume])
  
  const toggleShuffle = useCallback(() => {
    setShuffle(!shuffle)
  }, [shuffle])
  
  const toggleRepeat = useCallback(() => {
    const modes = ['none', 'all', 'one']
    const currentIndex = modes.indexOf(repeat)
    setRepeat(modes[(currentIndex + 1) % modes.length])
  }, [repeat])
  
  const addToQueue = useCallback((track) => {
    setQueue(prev => [...prev, track])
  }, [])
  
  const removeFromQueue = useCallback((index) => {
    setQueue(prev => prev.filter((_, i) => i !== index))
  }, [])
  
  const clearQueue = useCallback(() => {
    setQueue([])
    setQueueIndex(0)
  }, [])
  
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime)
    const handleDurationChange = () => setDuration(audio.duration)
    const handleEnded = () => {
      if (repeat === 'one') {
        audio.currentTime = 0
        audio.play()
      } else if (repeat === 'all' || queueIndex < queue.length - 1) {
        nextTrack()
      } else {
        setIsPlaying(false)
      }
    }
    const handlePlay = () => {
      initAudioContext()
      analyzeAudio()
    }
    const handlePause = () => {
      cancelAnimationFrame(animationFrameRef.current)
    }

    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('durationchange', handleDurationChange)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('play', handlePlay)
    audio.addEventListener('pause', handlePause)
    audio.addEventListener('error', (e) => console.error('Audio error:', e))

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('durationchange', handleDurationChange)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('play', handlePlay)
      audio.removeEventListener('pause', handlePause)
      cancelAnimationFrame(animationFrameRef.current)
    }
  }, [initAudioContext, analyzeAudio, repeat, queueIndex, queue.length, nextTrack])
  
  useEffect(() => {
    const saveProgress = async () => {
      if (user && currentTrack && currentTime > 0) {
        await supabase
          .from('recently_played')
          .update({ last_position: currentTime })
          .eq('user_id', user.id)
          .eq('track_id', currentTrack.id)
      }
    }
    
    const interval = setInterval(saveProgress, 10000)
    return () => clearInterval(interval)
  }, [user, currentTrack, currentTime])
  
  useEffect(() => {
    if (user && currentTrack) {
      const updateListeningData = async () => {
        const { data } = await supabase
          .from('users')
          .select('sound_dna_json')
          .eq('id', user.id)
          .single()
        
        if (data?.sound_dna_json) {
          const soundDNA = data.sound_dna_json
          const energy = getEnergyLevel(currentTrack.bpm)
          soundDNA.top_energy = energy
          
          if (currentTrack.realm) {
            soundDNA.dominant_realm = currentTrack.realm
          }
          
          soundDNA.listening_consistency = Math.min(100, (soundDNA.listening_consistency || 0) + 1)
          
          if (currentTrack.artist && !soundDNA.favorite_artists?.includes(currentTrack.artist)) {
            soundDNA.favorite_artists = [...(soundDNA.favorite_artists || []), currentTrack.artist].slice(0, 10)
          }
          
          await updateSoundDNA(soundDNA)
        }
      }
      
      updateListeningData()
    }
  }, [currentTrack, user, updateSoundDNA])
  
  const value = {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    queue,
    queueIndex,
    shuffle,
    repeat,
    isFullscreen,
    audioData,
    dominantColor,
    playTrack,
    togglePlay,
    seek,
    nextTrack,
    previousTrack,
    changeVolume,
    toggleMute,
    toggleShuffle,
    toggleRepeat,
    addToQueue,
    removeFromQueue,
    clearQueue,
    setIsFullscreen,
    setDominantColor,
    getEnergyLevel,
    ENERGY_LEVELS,
    audioRef
  }
  
  return (
    <PlayerContext.Provider value={value}>
      {children}
      <audio
        ref={audioRef}
        src={currentTrack?.audio_url ? `/api/audio/proxy?url=${encodeURIComponent(currentTrack.audio_url)}` : ''}
        preload="metadata"
        className="hidden"
      />
    </PlayerContext.Provider>
  )
}

export function usePlayer() {
  const context = useContext(PlayerContext)
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider')
  }
  return context
}

export default PlayerContext