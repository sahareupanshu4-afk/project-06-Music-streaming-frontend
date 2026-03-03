import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search as SearchIcon, X, Filter, TrendingUp, Clock, Music, Radio, User, Disc, ExternalLink, Loader2 } from 'lucide-react'
import { tracksApi } from '../lib/supabase'
import { musicDiscoveryApi, podcastDiscoveryApi, combinedSearch } from '../lib/discoveryApi'
import { usePlayer } from '../context/PlayerContext'
import { useTheme } from '../context/ThemeContext'
import TrackCard from '../components/Track/TrackCard'

const Search = () => {
  const { playTrack } = usePlayer()
  const { REALM_THEMES, getEnergyColor } = useTheme()
  
  const [query, setQuery] = useState('')
  const [activeTab, setActiveTab] = useState('all') // 'all', 'tracks', 'artists', 'albums', 'podcasts'
  const [results, setResults] = useState({
    local: [],
    tracks: [],
    artists: [],
    albums: [],
    podcasts: [],
    episodes: []
  })
  const [loading, setLoading] = useState(false)
  const [recentSearches, setRecentSearches] = useState([])
  const [filters, setFilters] = useState({
    realm: '',
    energy: '',
    bpmMin: 0,
    bpmMax: 300
  })
  const [showFilters, setShowFilters] = useState(false)
  const [searchSource, setSearchSource] = useState('local') // 'local' or 'external'

  // Debounced search
  const debouncedSearch = useCallback(
    debounce(async (searchQuery) => {
      if (searchQuery.length < 2) {
        setResults({
          local: [],
          tracks: [],
          artists: [],
          albums: [],
          podcasts: [],
          episodes: []
        })
        return
      }

      setLoading(true)
      try {
        // Search local database
        const localPromise = tracksApi.search(searchQuery)
        
        // Search external APIs
        const externalPromise = combinedSearch(searchQuery, {
          musicLimit: 10,
          podcastLimit: 10
        })

        const [localData, externalData] = await Promise.all([localPromise, externalPromise])

        setResults({
          local: localData.data || [],
          tracks: externalData.data?.music?.tracks || [],
          artists: externalData.data?.music?.artists || [],
          albums: externalData.data?.music?.albums || [],
          podcasts: externalData.data?.podcasts?.podcasts || [],
          episodes: externalData.data?.podcasts?.episodes || []
        })
      } catch (error) {
        console.error('Search error:', error)
      } finally {
        setLoading(false)
      }
    }, 500),
    []
  )

  useEffect(() => {
    debouncedSearch(query)
  }, [query, debouncedSearch])

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches')
    if (saved) {
      setRecentSearches(JSON.parse(saved))
    }
  }, [])

  // Save search to recent
  const saveSearch = (searchQuery) => {
    const updated = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 5)
    setRecentSearches(updated)
    localStorage.setItem('recentSearches', JSON.stringify(updated))
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (query.trim()) {
      saveSearch(query.trim())
      debouncedSearch(query.trim())
    }
  }

  const clearSearch = () => {
    setQuery('')
    setResults({
      local: [],
      tracks: [],
      artists: [],
      albums: [],
      podcasts: [],
      episodes: []
    })
  }

  // Filter chips
  const realms = ['electronic', 'ambient', 'hiphop', 'rock', 'jazz', 'pop', 'rnb', 'lofi']
  const energyLevels = ['calm', 'flow', 'drive', 'hyper']

  // Trending searches
  const trendingSearches = ['Electronic', 'Lo-Fi', 'Chill', 'Workout', 'Focus', 'Coldplay', 'Technology Podcasts']

  // Tabs configuration
  const tabs = [
    { id: 'all', label: 'All', icon: SearchIcon },
    { id: 'local', label: 'My Library', icon: Music },
    { id: 'artists', label: 'Artists', icon: User },
    { id: 'albums', label: 'Albums', icon: Disc },
    { id: 'podcasts', label: 'Podcasts', icon: Radio }
  ]

  // Get filtered results based on active tab
  const getFilteredResults = () => {
    switch (activeTab) {
      case 'local':
        return { type: 'local', data: results.local }
      case 'artists':
        return { type: 'artists', data: results.artists }
      case 'albums':
        return { type: 'albums', data: results.albums }
      case 'podcasts':
        return { type: 'podcasts', data: results.podcasts }
      case 'all':
      default:
        return { type: 'all', data: results }
    }
  }

  // Render artist card
  const ArtistCard = ({ artist, index }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="glass rounded-xl p-4 hover:scale-105 transition-transform cursor-pointer"
    >
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-neon-purple to-neon-pink flex items-center justify-center overflow-hidden">
          {artist.thumbnail ? (
            <img src={artist.thumbnail} alt={artist.name} className="w-full h-full object-cover" />
          ) : (
            <User className="w-8 h-8 text-white" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium truncate">{artist.name}</h3>
          <p className="text-sm text-gray-400 truncate">
            {artist.genre || artist.type || 'Artist'}
          </p>
          {artist.country && (
            <p className="text-xs text-gray-500">{artist.country}</p>
          )}
        </div>
        {artist.source && (
          <span className="text-xs px-2 py-1 rounded-full bg-white/5 text-gray-400">
            {artist.source}
          </span>
        )}
      </div>
    </motion.div>
  )

  // Render album card
  const AlbumCard = ({ album, index }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="glass rounded-xl overflow-hidden hover:scale-105 transition-transform cursor-pointer group"
    >
      <div className="aspect-square relative">
        {album.thumbnail ? (
          <img src={album.thumbnail} alt={album.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-neon-cyan to-neon-green flex items-center justify-center">
            <Disc className="w-16 h-16 text-white/50" />
          </div>
        )}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="w-12 h-12 rounded-full bg-neon-cyan flex items-center justify-center"
          >
            <ExternalLink className="w-5 h-5 text-white" />
          </motion.button>
        </div>
      </div>
      <div className="p-3">
        <h3 className="font-medium truncate text-sm">{album.title}</h3>
        <p className="text-xs text-gray-400 truncate">{album.artist}</p>
        {album.year && (
          <p className="text-xs text-gray-500 mt-1">{album.year}</p>
        )}
      </div>
    </motion.div>
  )

  // Render podcast card
  const PodcastCard = ({ podcast, index }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="glass rounded-xl overflow-hidden hover:scale-105 transition-transform cursor-pointer group"
    >
      <div className="aspect-square relative">
        {podcast.thumbnail ? (
          <img src={podcast.thumbnail} alt={podcast.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-neon-cyan to-neon-green flex items-center justify-center">
            <Radio className="w-16 h-16 text-white/50" />
          </div>
        )}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="w-12 h-12 rounded-full bg-neon-cyan flex items-center justify-center"
          >
            <ExternalLink className="w-5 h-5 text-white" />
          </motion.button>
        </div>
      </div>
      <div className="p-3">
        <h3 className="font-medium truncate text-sm">{podcast.title}</h3>
        <p className="text-xs text-gray-400 truncate">{podcast.publisher || podcast.author}</p>
        {podcast.totalEpisodes && (
          <p className="text-xs text-gray-500 mt-1">{podcast.totalEpisodes} episodes</p>
        )}
      </div>
    </motion.div>
  )

  const filteredResults = getFilteredResults()
  const hasResults = results.local.length > 0 || 
                     results.tracks.length > 0 || 
                     results.artists.length > 0 || 
                     results.albums.length > 0 ||
                     results.podcasts.length > 0

  return (
    <div className="min-h-screen pt-20 pb-32">
      <div className="max-w-7xl mx-auto px-4">
        {/* Search Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-6">Search</h1>
          
          {/* Search Input */}
          <form onSubmit={handleSearch} className="relative">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search tracks, artists, albums, podcasts..."
              className="w-full input-field pl-12 pr-24 py-4 text-lg"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
              {query && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="p-2 hover:bg-white/5 rounded-lg"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2 rounded-lg transition-colors ${
                  showFilters ? 'bg-neon-purple text-white' : 'hover:bg-white/5 text-gray-400'
                }`}
              >
                <Filter className="w-5 h-5" />
              </button>
            </div>
          </form>

          {/* Filters Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 glass rounded-xl p-4 overflow-hidden"
              >
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Realm Filter */}
                  <div>
                    <h4 className="text-sm font-medium mb-3 text-gray-300">Realm</h4>
                    <div className="flex flex-wrap gap-2">
                      {realms.map((realm) => (
                        <button
                          key={realm}
                          onClick={() => setFilters(prev => ({
                            ...prev,
                            realm: prev.realm === realm ? '' : realm
                          }))}
                          className={`px-3 py-1 rounded-full text-sm transition-all ${
                            filters.realm === realm
                              ? 'text-white'
                              : 'bg-white/5 text-gray-400 hover:text-white'
                          }`}
                          style={{
                            background: filters.realm === realm
                              ? REALM_THEMES[realm]?.gradient
                              : undefined
                          }}
                        >
                          {realm.charAt(0).toUpperCase() + realm.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Energy Filter */}
                  <div>
                    <h4 className="text-sm font-medium mb-3 text-gray-300">Energy Level</h4>
                    <div className="flex flex-wrap gap-2">
                      {energyLevels.map((energy) => (
                        <button
                          key={energy}
                          onClick={() => setFilters(prev => ({
                            ...prev,
                            energy: prev.energy === energy ? '' : energy
                          }))}
                          className={`px-3 py-1 rounded-full text-sm transition-all ${
                            filters.energy === energy
                              ? 'text-white'
                              : 'bg-white/5 text-gray-400 hover:text-white'
                          }`}
                          style={{
                            background: filters.energy === energy
                              ? getEnergyColor(energy)
                              : undefined
                          }}
                        >
                          {energy.charAt(0).toUpperCase() + energy.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tabs */}
          {query.length >= 2 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 flex gap-2 overflow-x-auto pb-2"
            >
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm whitespace-nowrap transition-all ${
                    activeTab === tab.id
                      ? 'bg-neon-purple text-white'
                      : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </motion.div>
          )}
        </motion.div>

        {/* Results or Suggestions */}
        {query.length >= 2 ? (
          // Search Results
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-neon-purple" />
                <p className="mt-4 text-gray-400">Searching across multiple sources...</p>
              </div>
            ) : (
              <>
                {/* All Results View */}
                {activeTab === 'all' && (
                  <div className="space-y-8">
                    {/* Local Library Results */}
                    {results.local.length > 0 && (
                      <div>
                        <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
                          <Music className="w-5 h-5 text-neon-purple" />
                          My Library ({results.local.length})
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                          {results.local.slice(0, 5).map((track, index) => (
                            <motion.div
                              key={track.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.05 }}
                            >
                              <TrackCard 
                                track={track}
                                onPlay={() => playTrack(track, results.local)}
                              />
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Artists */}
                    {results.artists.length > 0 && (
                      <div>
                        <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
                          <User className="w-5 h-5 text-neon-pink" />
                          Artists ({results.artists.length})
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {results.artists.slice(0, 6).map((artist, index) => (
                            <ArtistCard key={artist.id || index} artist={artist} index={index} />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Albums */}
                    {results.albums.length > 0 && (
                      <div>
                        <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
                          <Disc className="w-5 h-5 text-neon-cyan" />
                          Albums ({results.albums.length})
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                          {results.albums.slice(0, 6).map((album, index) => (
                            <AlbumCard key={album.id || index} album={album} index={index} />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Podcasts */}
                    {results.podcasts.length > 0 && (
                      <div>
                        <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
                          <Radio className="w-5 h-5 text-neon-green" />
                          Podcasts ({results.podcasts.length})
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                          {results.podcasts.slice(0, 6).map((podcast, index) => (
                            <PodcastCard key={podcast.id || index} podcast={podcast} index={index} />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* No Results */}
                    {!hasResults && (
                      <div className="text-center py-12 text-gray-400">
                        <SearchIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No results found for "{query}"</p>
                        <p className="text-sm mt-2">Try different keywords or check your filters</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Local Library Tab */}
                {activeTab === 'local' && (
                  <div>
                    <h2 className="text-lg font-medium mb-4">
                      {results.local.length} tracks in your library
                    </h2>
                    {results.local.length > 0 ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {results.local.map((track, index) => (
                          <motion.div
                            key={track.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                          >
                            <TrackCard 
                              track={track}
                              onPlay={() => playTrack(track, results.local)}
                            />
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 text-gray-400">
                        <Music className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No tracks found in your library</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Artists Tab */}
                {activeTab === 'artists' && (
                  <div>
                    <h2 className="text-lg font-medium mb-4">
                      {results.artists.length} artists found
                    </h2>
                    {results.artists.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {results.artists.map((artist, index) => (
                          <ArtistCard key={artist.id || index} artist={artist} index={index} />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 text-gray-400">
                        <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No artists found</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Albums Tab */}
                {activeTab === 'albums' && (
                  <div>
                    <h2 className="text-lg font-medium mb-4">
                      {results.albums.length} albums found
                    </h2>
                    {results.albums.length > 0 ? (
                      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {results.albums.map((album, index) => (
                          <AlbumCard key={album.id || index} album={album} index={index} />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 text-gray-400">
                        <Disc className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No albums found</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Podcasts Tab */}
                {activeTab === 'podcasts' && (
                  <div>
                    <h2 className="text-lg font-medium mb-4">
                      {results.podcasts.length} podcasts found
                    </h2>
                    {results.podcasts.length > 0 ? (
                      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {results.podcasts.map((podcast, index) => (
                          <PodcastCard key={podcast.id || index} podcast={podcast} index={index} />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 text-gray-400">
                        <Radio className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No podcasts found</p>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </motion.div>
        ) : (
          // Suggestions
          <div className="space-y-8">
            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-gray-400" />
                  Recent Searches
                </h2>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((search, index) => (
                    <motion.button
                      key={search}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => setQuery(search)}
                      className="px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 text-sm transition-colors"
                    >
                      {search}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Trending Searches */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-neon-pink" />
                Trending Searches
              </h2>
              <div className="flex flex-wrap gap-2">
                {trendingSearches.map((search, index) => (
                  <motion.button
                    key={search}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => setQuery(search)}
                    className="px-4 py-2 rounded-full bg-neon-pink/10 hover:bg-neon-pink/20 text-neon-pink text-sm transition-colors"
                  >
                    {search}
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* Browse by Realm */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-lg font-medium mb-4">Browse by Realm</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {realms.map((realm, index) => (
                  <motion.button
                    key={realm}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => setQuery(realm)}
                    className="glass rounded-xl p-4 text-left hover:scale-105 transition-transform"
                    style={{ 
                      borderColor: `${REALM_THEMES[realm]?.primary}40`
                    }}
                  >
                    <div 
                      className="w-10 h-10 rounded-lg mb-3"
                      style={{ background: REALM_THEMES[realm]?.gradient }}
                    />
                    <h3 className="font-medium">{realm.charAt(0).toUpperCase() + realm.slice(1)}</h3>
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* API Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass rounded-xl p-6"
            >
              <h2 className="text-lg font-medium mb-4">Enhanced Search</h2>
              <p className="text-gray-400 text-sm mb-4">
                Search now includes results from multiple external APIs:
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-neon-purple" />
                  <span className="text-gray-300">MusicBrainz</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-neon-pink" />
                  <span className="text-gray-300">TheAudioDB</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-neon-cyan" />
                  <span className="text-gray-300">ListenNotes</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-neon-green" />
                  <span className="text-gray-300">PodcastIndex</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
}

// Debounce utility
function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

export default Search