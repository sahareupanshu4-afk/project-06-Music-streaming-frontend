import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Play, Shuffle, Edit, Trash2 } from 'lucide-react'
import { playlistsApi } from '../lib/supabase'
import { usePlayer } from '../context/PlayerContext'
import { useAuth } from '../context/AuthContext'
import TrackCard from '../components/Track/TrackCard'

const PlaylistDetail = () => {
  const { playlistId } = useParams()
  const { playTrack } = usePlayer()
  const { user } = useAuth()
  
  const [playlist, setPlaylist] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPlaylist()
  }, [playlistId])

  const fetchPlaylist = async () => {
    setLoading(true)
    try {
      const { data } = await playlistsApi.getById(playlistId)
      setPlaylist(data)
    } catch (error) {
      console.error('Error fetching playlist:', error)
    } finally {
      setLoading(false)
    }
  }

  const tracks = playlist?.playlist_tracks?.map(pt => pt.tracks).filter(Boolean) || []

  const playAll = () => {
    if (tracks.length > 0) {
      playTrack(tracks[0], tracks)
    }
  }

  const shufflePlay = () => {
    if (tracks.length > 0) {
      const shuffled = [...tracks].sort(() => Math.random() - 0.5)
      playTrack(shuffled[0], shuffled)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="loader" />
      </div>
    )
  }

  if (!playlist) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Playlist not found</h2>
          <Link to="/playlists" className="btn-primary">Back to Playlists</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-20 pb-32">
      {/* Hero Section */}
      <div 
        className="relative py-16 mb-8"
        style={{
          background: playlist.theme_color 
            ? `linear-gradient(180deg, ${playlist.theme_color}30 0%, transparent 100%)`
            : 'linear-gradient(180deg, rgba(168, 85, 247, 0.2) 0%, transparent 100%)'
        }}
      >
        <div className="max-w-7xl mx-auto px-4">
          <Link 
            to="/playlists"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Playlists
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row items-center gap-6"
          >
            <div 
              className="w-48 h-48 rounded-2xl flex items-center justify-center"
              style={{ 
                background: playlist.theme_color 
                  ? `linear-gradient(135deg, ${playlist.theme_color}, ${playlist.theme_color}66)`
                  : 'linear-gradient(135deg, #a855f7, #ec4899)'
              }}
            >
              <span className="text-6xl">🎵</span>
            </div>

            <div className="text-center md:text-left flex-1">
              <p className="text-sm text-gray-400 uppercase tracking-wider mb-2">Playlist</p>
              <h1 className="text-4xl md:text-5xl font-bold mb-2">{playlist.name}</h1>
              <p className="text-gray-400 mb-4">{tracks.length} tracks</p>
              {user?.id === playlist.user_id && (
                <div className="flex gap-2 justify-center md:justify-start">
                  <button className="btn-secondary flex items-center gap-2 text-sm">
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                  <button className="btn-secondary flex items-center gap-2 text-sm text-red-400">
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={playAll}
                className="btn-primary flex items-center gap-2"
                disabled={tracks.length === 0}
              >
                <Play className="w-5 h-5" />
                Play All
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={shufflePlay}
                className="btn-secondary flex items-center gap-2"
                disabled={tracks.length === 0}
              >
                <Shuffle className="w-5 h-5" />
                Shuffle
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Tracks Grid */}
      <div className="max-w-7xl mx-auto px-4">
        {tracks.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {tracks.map((track, index) => (
              <motion.div
                key={track.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <TrackCard 
                  track={track}
                  onPlay={() => playTrack(track, tracks)}
                />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-400">
            <p className="text-xl">This playlist is empty</p>
            <p className="text-sm mt-2">Add some tracks to get started</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default PlaylistDetail