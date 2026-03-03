import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Radio, Play, Search, TrendingUp, Clock, Loader2, AlertCircle, RefreshCw } from 'lucide-react'
import { podcastsApi } from '../lib/supabase'
import { podcastDiscoveryApi } from '../lib/discoveryApi'
import { usePlayer } from '../context/PlayerContext'

const Podcasts = () => {
  const { playTrack } = usePlayer()
  const [podcasts, setPodcasts] = useState([])
  const [trendingPodcasts, setTrendingPodcasts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [apiStatus, setApiStatus] = useState(null)
  const [activeTab, setActiveTab] = useState('trending') // 'trending', 'library', 'search'
  const [error, setError] = useState(null)

  useEffect(() => {
    initializePodcasts()
  }, [])

  const initializePodcasts = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Check API status
      const status = await podcastDiscoveryApi.getApiStatus()
      setApiStatus(status)

      // Fetch local podcasts
      const { data: localPodcasts } = await podcastsApi.getAll()
      setPodcasts(localPodcasts || [])

      // Fetch trending podcasts from external APIs
      if (status?.combined?.configured || status?.listennotes?.configured || status?.podcastindex?.configured) {
        const trending = await podcastDiscoveryApi.getTrending(20)
        setTrendingPodcasts(trending.data || [])
      }
    } catch (err) {
      console.error('Error initializing podcasts:', err)
      setError('Failed to load podcasts. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    setSearching(true)
    setSearchResults([])
    
    try {
      const result = await podcastDiscoveryApi.search(searchQuery, 'podcast', 20)
      setSearchResults(result.data?.podcasts || [])
    } catch (err) {
      console.error('Search error:', err)
    } finally {
      setSearching(false)
    }
  }

  const handlePlayEpisode = (episode) => {
    // Convert episode to track format for player
    const track = {
      id: episode.id,
      title: episode.title,
      artist: episode.podcastTitle || episode.publisher || 'Unknown Podcast',
      audio_url: episode.audioUrl,
      cover_url: episode.thumbnail,
      duration: episode.audioLength,
      source: 'podcast'
    }
    playTrack(track, [track])
  }

  // Podcast Card Component
  const PodcastCard = ({ podcast, index, showSource = false }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ scale: 1.02 }}
      className="glass rounded-xl overflow-hidden cursor-pointer group"
    >
      <div className="relative aspect-square">
        {podcast.thumbnail || podcast.cover_url ? (
          <img
            src={podcast.thumbnail || podcast.cover_url}
            alt={podcast.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-neon-cyan to-neon-green flex items-center justify-center">
            <Radio className="w-16 h-16 text-white/50" />
          </div>
        )}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handlePlayEpisode(podcast)}
            className="w-14 h-14 rounded-full bg-neon-cyan flex items-center justify-center"
          >
            <Play className="w-6 h-6 text-white ml-1" />
          </motion.button>
        </div>
        {showSource && podcast.source && (
          <div className="absolute top-2 right-2">
            <span className="text-xs px-2 py-1 rounded-full bg-black/60 text-white">
              {podcast.source}
            </span>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-medium truncate">{podcast.title}</h3>
        <p className="text-sm text-gray-400 line-clamp-2 mt-1">
          {podcast.description || podcast.publisher || podcast.author}
        </p>
        {podcast.totalEpisodes && (
          <p className="text-xs text-gray-500 mt-2">
            {podcast.totalEpisodes} episodes
          </p>
        )}
        {podcast.episodeCount && (
          <p className="text-xs text-gray-500 mt-2">
            {podcast.episodeCount} episodes
          </p>
        )}
      </div>
    </motion.div>
  )

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center pt-20">
        <Loader2 className="w-10 h-10 animate-spin text-neon-cyan" />
        <p className="mt-4 text-gray-400">Loading podcasts...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-20 pb-32">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Podcasts</h1>
              <p className="text-gray-400">Stories, conversations, and knowledge</p>
            </div>
            <button
              onClick={initializePodcasts}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search podcasts..."
              className="w-full input-field pl-12 pr-4 py-3"
            />
          </form>

          {/* API Status Warning */}
          {apiStatus && !apiStatus.combined?.configured && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20"
            >
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-yellow-500 font-medium">External APIs not configured</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Add ListenNotes or PodcastIndex API keys to enable podcast search and trending features.
                    See the backend/.env file for configuration options.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => setActiveTab('trending')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm whitespace-nowrap transition-all ${
                activeTab === 'trending'
                  ? 'bg-neon-cyan text-white'
                  : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              Trending
            </button>
            <button
              onClick={() => setActiveTab('library')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm whitespace-nowrap transition-all ${
                activeTab === 'library'
                  ? 'bg-neon-cyan text-white'
                  : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <Clock className="w-4 h-4" />
              My Library ({podcasts.length})
            </button>
            {searchQuery && (
              <button
                onClick={() => setActiveTab('search')}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm whitespace-nowrap transition-all ${
                  activeTab === 'search'
                    ? 'bg-neon-cyan text-white'
                    : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <Search className="w-4 h-4" />
                Search Results
              </button>
            )}
          </div>
        </motion.div>

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-400" />
            <p className="text-gray-400">{error}</p>
            <button
              onClick={initializePodcasts}
              className="mt-4 px-4 py-2 rounded-lg bg-neon-cyan text-white"
            >
              Try Again
            </button>
          </motion.div>
        )}

        {/* Content */}
        {!error && (
          <>
            {/* Trending Tab */}
            {activeTab === 'trending' && (
              <div>
                <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-neon-cyan" />
                  Trending Podcasts
                </h2>
                {trendingPodcasts.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {trendingPodcasts.map((podcast, index) => (
                      <PodcastCard 
                        key={podcast.id || index} 
                        podcast={podcast} 
                        index={index}
                        showSource={true}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-400">
                    <Radio className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No trending podcasts available</p>
                    <p className="text-sm mt-2">Configure ListenNotes or PodcastIndex API to see trending podcasts</p>
                  </div>
                )}
              </div>
            )}

            {/* Library Tab */}
            {activeTab === 'library' && (
              <div>
                <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-neon-purple" />
                  My Library
                </h2>
                {podcasts.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {podcasts.map((podcast, index) => (
                      <PodcastCard 
                        key={podcast.id} 
                        podcast={podcast} 
                        index={index}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-400">
                    <Radio className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No podcasts in your library yet</p>
                    <p className="text-sm mt-2">Search and add podcasts to your library</p>
                  </div>
                )}
              </div>
            )}

            {/* Search Tab */}
            {activeTab === 'search' && (
              <div>
                <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
                  <Search className="w-5 h-5 text-neon-pink" />
                  Search Results for "{searchQuery}"
                </h2>
                {searching ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-neon-cyan" />
                    <p className="mt-4 text-gray-400">Searching podcasts...</p>
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {searchResults.map((podcast, index) => (
                      <PodcastCard 
                        key={podcast.id || index} 
                        podcast={podcast} 
                        index={index}
                        showSource={true}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-400">
                    <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No podcasts found for "{searchQuery}"</p>
                    <p className="text-sm mt-2">Try a different search term</p>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* API Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-12 glass rounded-xl p-6"
        >
          <h2 className="text-lg font-medium mb-4">Podcast Sources</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${apiStatus?.listennotes?.configured ? 'bg-green-500' : 'bg-gray-500'}`} />
              <div>
                <p className="font-medium">ListenNotes</p>
                <p className="text-sm text-gray-400">
                  {apiStatus?.listennotes?.configured ? 'Connected' : 'Not configured'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${apiStatus?.podcastindex?.configured ? 'bg-green-500' : 'bg-gray-500'}`} />
              <div>
                <p className="font-medium">PodcastIndex</p>
                <p className="text-sm text-gray-400">
                  {apiStatus?.podcastindex?.configured ? 'Connected' : 'Not configured'}
                </p>
              </div>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            Add API keys to your backend/.env file to enable podcast discovery features.
          </p>
        </motion.div>
      </div>
    </div>
  )
}

export default Podcasts