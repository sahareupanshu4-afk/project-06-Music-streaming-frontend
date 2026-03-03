import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Play, Shuffle } from 'lucide-react'
import { tracksApi } from '../lib/supabase'
import { usePlayer } from '../context/PlayerContext'
import { useTheme } from '../context/ThemeContext'
import TrackCard from '../components/Track/TrackCard'

// Sample tracks for each realm
const sampleTracksByRealm = {
  electronic: [
    { id: 'e1', title: 'Digital Dreams', artist: 'Synthwave Masters', album: 'Neon Nights', audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', duration: 240, bpm: 128, energy_level: 'drive', realm: 'electronic', play_count: 0, cover_url: 'https://picsum.photos/seed/e1/300/300.jpg' },
    { id: 'e2', title: 'Cyber Pulse', artist: 'Electro Beats', album: 'Future Sound', audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', duration: 210, bpm: 140, energy_level: 'drive', realm: 'electronic', play_count: 0, cover_url: 'https://picsum.photos/seed/e2/300/300.jpg' },
    { id: 'e3', title: 'Midnight Circuit', artist: 'Techno Vibes', album: 'Machine Soul', audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', duration: 300, bpm: 135, energy_level: 'hyper', realm: 'electronic', play_count: 0, cover_url: 'https://picsum.photos/seed/e3/300/300.jpg' },
  ],
  ambient: [
    { id: 'a1', title: 'Ocean Depths', artist: 'Ambient Waves', album: 'Deep Blue', audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3', duration: 360, bpm: 60, energy_level: 'calm', realm: 'ambient', play_count: 0, cover_url: 'https://picsum.photos/seed/a1/300/300.jpg' },
    { id: 'a2', title: 'Forest Rain', artist: 'Nature Sounds', album: 'Earth Elements', audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3', duration: 420, bpm: 50, energy_level: 'calm', realm: 'ambient', play_count: 0, cover_url: 'https://picsum.photos/seed/a2/300/300.jpg' },
  ],
  hiphop: [
    { id: 'h1', title: 'Street Vibes', artist: 'Urban Flow', album: 'City Beats', audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3', duration: 200, bpm: 95, energy_level: 'flow', realm: 'hiphop', play_count: 0, cover_url: 'https://picsum.photos/seed/h1/300/300.jpg' },
    { id: 'h2', title: 'Boom Bap', artist: 'Classic Hip Hop', album: 'Golden Era', audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', duration: 220, bpm: 90, energy_level: 'flow', realm: 'hiphop', play_count: 0, cover_url: 'https://picsum.photos/seed/h2/300/300.jpg' },
    { id: 'h3', title: 'Trap City', artist: 'Modern Beats', album: 'Trap Nation', audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', duration: 180, bpm: 140, energy_level: 'drive', realm: 'hiphop', play_count: 0, cover_url: 'https://picsum.photos/seed/h3/300/300.jpg' },
  ],
  rock: [
    { id: 'r1', title: 'Thunder Road', artist: 'Rock Legends', album: 'Highway Stars', audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', duration: 280, bpm: 130, energy_level: 'drive', realm: 'rock', play_count: 0, cover_url: 'https://picsum.photos/seed/r1/300/300.jpg' },
    { id: 'r2', title: 'Electric Storm', artist: 'Metal Kings', album: 'Thunder Strike', audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3', duration: 320, bpm: 145, energy_level: 'hyper', realm: 'rock', play_count: 0, cover_url: 'https://picsum.photos/seed/r2/300/300.jpg' },
  ],
  jazz: [
    { id: 'j1', title: 'Smooth Night', artist: 'Jazz Trio', album: 'Late Sessions', audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3', duration: 340, bpm: 85, energy_level: 'calm', realm: 'jazz', play_count: 0, cover_url: 'https://picsum.photos/seed/j1/300/300.jpg' },
    { id: 'j2', title: 'Blue Note', artist: 'Jazz Masters', album: 'Classic Vibes', audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3', duration: 380, bpm: 100, energy_level: 'flow', realm: 'jazz', play_count: 0, cover_url: 'https://picsum.photos/seed/j2/300/300.jpg' },
  ],
  pop: [
    { id: 'p1', title: 'Summer Hits', artist: 'Pop Stars', album: 'Chart Toppers', audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', duration: 200, bpm: 120, energy_level: 'flow', realm: 'pop', play_count: 0, cover_url: 'https://picsum.photos/seed/p1/300/300.jpg' },
    { id: 'p2', title: 'Dance Floor', artist: 'Party Mix', album: 'Club Anthems', audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', duration: 190, bpm: 128, energy_level: 'drive', realm: 'pop', play_count: 0, cover_url: 'https://picsum.photos/seed/p2/300/300.jpg' },
    { id: 'p3', title: 'Radio Edit', artist: 'Mainstream', album: 'Top 40', audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', duration: 210, bpm: 115, energy_level: 'flow', realm: 'pop', play_count: 0, cover_url: 'https://picsum.photos/seed/p3/300/300.jpg' },
  ],
  rnb: [
    { id: 'rn1', title: 'Slow Jam', artist: 'R&B Soul', album: 'Midnight Love', audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3', duration: 260, bpm: 80, energy_level: 'calm', realm: 'rnb', play_count: 0, cover_url: 'https://picsum.photos/seed/rn1/300/300.jpg' },
    { id: 'rn2', title: 'Groove On', artist: 'Soul Brothers', album: 'Smooth Vibes', audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3', duration: 240, bpm: 95, energy_level: 'flow', realm: 'rnb', play_count: 0, cover_url: 'https://picsum.photos/seed/rn2/300/300.jpg' },
  ],
  lofi: [
    { id: 'l1', title: 'Study Session', artist: 'Lo-Fi Beats', album: 'Chill Study', audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3', duration: 300, bpm: 70, energy_level: 'calm', realm: 'lofi', play_count: 0, cover_url: 'https://picsum.photos/seed/l1/300/300.jpg' },
    { id: 'l2', title: 'Rainy Day', artist: 'Chill Hop', album: 'Rainy Moods', audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', duration: 280, bpm: 75, energy_level: 'calm', realm: 'lofi', play_count: 0, cover_url: 'https://picsum.photos/seed/l2/300/300.jpg' },
  ],
}

const RealmDetail = () => {
  const { realmId } = useParams()
  const { playTrack } = usePlayer()
  const { getRealmTheme, REALM_THEMES } = useTheme()
  
  const [tracks, setTracks] = useState([])
  const [loading, setLoading] = useState(true)

  const theme = getRealmTheme(realmId)
  const realmInfo = {
    electronic: { name: 'Electronic', icon: '⚡', description: 'Synthesized beats and digital soundscapes' },
    ambient: { name: 'Ambient', icon: '🌌', description: 'Atmospheric textures and ethereal sounds' },
    hiphop: { name: 'Hip Hop', icon: '🎤', description: 'Urban beats and rhythmic poetry' },
    rock: { name: 'Rock', icon: '🎸', description: 'Guitar-driven energy and raw power' },
    jazz: { name: 'Jazz', icon: '🎷', description: 'Improvisational brilliance and smooth grooves' },
    classical: { name: 'Classical', icon: '🎻', description: 'Timeless orchestral masterpieces' },
    pop: { name: 'Pop', icon: '💫', description: 'Chart-topping hits and catchy melodies' },
    rnb: { name: 'R&B', icon: '🎵', description: 'Soulful rhythms and smooth vocals' },
    lofi: { name: 'Lo-Fi', icon: '🎧', description: 'Chill beats for studying and relaxation' },
    podcast: { name: 'Podcasts', icon: '🎙️', description: 'Stories, conversations, and knowledge' }
  }

  const realm = realmInfo[realmId] || { name: realmId, icon: '🎵', description: '' }

  useEffect(() => {
    fetchTracks()
  }, [realmId])

  const fetchTracks = async () => {
    setLoading(true)
    try {
      // Use sample tracks for immediate display
      const realmTracks = sampleTracksByRealm[realmId] || []
      setTracks(realmTracks)
    } catch (error) {
      console.error('Error fetching realm tracks:', error)
    } finally {
      setLoading(false)
    }
  }

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

  return (
    <div className="min-h-screen pt-20 pb-32">
      {/* Hero Section */}
      <div 
        className="relative py-16 mb-8"
        style={{
          background: `linear-gradient(180deg, ${theme.primary}20 0%, transparent 100%)`
        }}
      >
        <div className="max-w-7xl mx-auto px-4">
          {/* Back Button */}
          <Link 
            to="/realms"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Realms
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row items-center gap-6"
          >
            {/* Realm Icon */}
            <div 
              className="w-32 h-32 rounded-2xl flex items-center justify-center text-6xl"
              style={{ background: theme.gradient }}
            >
              {realm.icon}
            </div>

            <div className="text-center md:text-left flex-1">
              <h1 className="text-4xl md:text-5xl font-bold mb-2">{realm.name}</h1>
              <p className="text-gray-400 text-lg mb-4">{realm.description}</p>
              <p className="text-sm text-gray-500">{tracks.length} tracks available</p>
            </div>

            {/* Action Buttons */}
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
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="loader" />
          </div>
        ) : tracks.length > 0 ? (
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
            <p className="text-xl">No tracks found in this realm</p>
            <p className="text-sm mt-2">Check back later for new additions</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default RealmDetail