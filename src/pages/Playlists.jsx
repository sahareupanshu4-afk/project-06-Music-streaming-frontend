import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Music } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { playlistsApi } from '../lib/supabase'
import { Link } from 'react-router-dom'

const Playlists = () => {
  const { user } = useAuth()
  const [playlists, setPlaylists] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchPlaylists()
    }
  }, [user])

  const fetchPlaylists = async () => {
    try {
      const { data } = await playlistsApi.getByUser(user.id)
      setPlaylists(data || [])
    } catch (error) {
      console.error('Error fetching playlists:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="loader" />
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-20 pb-32">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold mb-2">Your Playlists</h1>
            <p className="text-gray-400">Create and manage your personal collections</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            New Playlist
          </motion.button>
        </motion.div>

        {playlists.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {playlists.map((playlist, index) => (
              <motion.div
                key={playlist.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.02 }}
                className="glass rounded-xl p-4 cursor-pointer"
              >
                <div 
                  className="aspect-square rounded-lg mb-3 flex items-center justify-center"
                  style={{ 
                    background: playlist.theme_color 
                      ? `linear-gradient(135deg, ${playlist.theme_color}, ${playlist.theme_color}66)`
                      : 'linear-gradient(135deg, #a855f7, #ec4899)'
                  }}
                >
                  <Music className="w-12 h-12 text-white/50" />
                </div>
                <h3 className="font-medium truncate">{playlist.name}</h3>
                <p className="text-sm text-gray-400">
                  {playlist.playlist_tracks?.length || 0} tracks
                </p>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-400">
            <Music className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No playlists yet</p>
            <p className="text-sm mt-2">Create your first playlist to get started</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Playlists