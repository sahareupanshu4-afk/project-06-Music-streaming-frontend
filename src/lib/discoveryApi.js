/**
 * Discovery API Client
 * Handles all external API calls for music and podcast discovery
 * Connects to backend endpoints that integrate with MusicBrainz, TheAudioDB, ListenNotes, and PodcastIndex
 */

// API base URL - defaults to localhost in development
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api';

// Generic fetch wrapper with error handling
const fetchApi = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error.message);
    throw error;
  }
};

// ============ Music Discovery APIs ============

export const musicDiscoveryApi = {
  /**
   * Search for music across all sources (artists, tracks, albums)
   */
  search: async (query, type = 'all', limit = 10) => {
    return fetchApi(`/music/discover/search?q=${encodeURIComponent(query)}&type=${type}&limit=${limit}`);
  },

  /**
   * Search for artists specifically
   */
  searchArtists: async (query, limit = 10) => {
    return fetchApi(`/music/discover/artists?q=${encodeURIComponent(query)}&limit=${limit}`);
  },

  /**
   * Search for albums specifically
   */
  searchAlbums: async (query, limit = 10) => {
    return fetchApi(`/music/discover/albums?q=${encodeURIComponent(query)}&limit=${limit}`);
  },

  /**
   * Get artist details with discography
   */
  getArtistDetails: async (artistName) => {
    return fetchApi(`/music/discover/artist/${encodeURIComponent(artistName)}`);
  },

  /**
   * Get album details with tracks
   */
  getAlbumDetails: async (albumId) => {
    return fetchApi(`/music/discover/album/${albumId}`);
  },

  /**
   * Get popular tracks for an artist
   */
  getArtistPopularTracks: async (artistName) => {
    return fetchApi(`/music/discover/artist/${encodeURIComponent(artistName)}/popular`);
  },
};

// ============ MusicBrainz Direct Access ============

export const musicBrainzApi = {
  /**
   * Search MusicBrainz database
   */
  search: async (query, type = 'all', limit = 10, offset = 0) => {
    return fetchApi(`/music/musicbrainz/search?q=${encodeURIComponent(query)}&type=${type}&limit=${limit}&offset=${offset}`);
  },

  /**
   * Get entity by MusicBrainz ID
   */
  getById: async (type, mbid) => {
    return fetchApi(`/music/musicbrainz/${type}/${mbid}`);
  },
};

// ============ TheAudioDB Direct Access ============

export const audioDbApi = {
  /**
   * Search TheAudioDB
   */
  search: async (query, type = 'artist') => {
    return fetchApi(`/music/audiodb/search?q=${encodeURIComponent(query)}&type=${type}`);
  },

  /**
   * Get entity by TheAudioDB ID
   */
  getById: async (type, id) => {
    return fetchApi(`/music/audiodb/${type}/${id}`);
  },
};

// ============ Podcast Discovery APIs ============

export const podcastDiscoveryApi = {
  /**
   * Check API configuration status
   */
  getApiStatus: async () => {
    return fetchApi('/podcasts/status/apis');
  },

  /**
   * Search podcasts across all sources
   */
  search: async (query, type = 'podcast', limit = 20) => {
    return fetchApi(`/podcasts/discover/search?q=${encodeURIComponent(query)}&type=${type}&limit=${limit}`);
  },

  /**
   * Get trending podcasts
   */
  getTrending: async (limit = 20) => {
    return fetchApi(`/podcasts/discover/trending?limit=${limit}`);
  },

  /**
   * Search podcast episodes
   */
  searchEpisodes: async (query, limit = 20) => {
    return fetchApi(`/podcasts/discover/episodes?q=${encodeURIComponent(query)}&limit=${limit}`);
  },

  /**
   * Get recent episodes
   */
  getRecentEpisodes: async (limit = 20) => {
    return fetchApi(`/podcasts/discover/recent?limit=${limit}`);
  },

  /**
   * Get podcast categories
   */
  getCategories: async () => {
    return fetchApi('/podcasts/discover/categories');
  },

  /**
   * Get podcast details
   */
  getPodcast: async (podcastId, source = 'listennotes') => {
    return fetchApi(`/podcasts/discover/podcast/${podcastId}?source=${source}`);
  },

  /**
   * Get episodes for a podcast
   */
  getPodcastEpisodes: async (podcastId, source = 'listennotes', limit = 20) => {
    return fetchApi(`/podcasts/discover/podcast/${podcastId}/episodes?source=${source}&limit=${limit}`);
  },

  /**
   * Get episode details
   */
  getEpisode: async (episodeId, source = 'listennotes') => {
    return fetchApi(`/podcasts/discover/episode/${episodeId}?source=${source}`);
  },
};

// ============ ListenNotes Direct Access ============

export const listenNotesApi = {
  /**
   * Search ListenNotes directly
   */
  search: async (query, type = 'podcast', offset = 0) => {
    return fetchApi(`/podcasts/listennotes/search?q=${encodeURIComponent(query)}&type=${type}&offset=${offset}`);
  },

  /**
   * Get best podcasts
   */
  getBestPodcasts: async (genreId = null, page = 1) => {
    const params = new URLSearchParams({ page });
    if (genreId) params.append('genreId', genreId);
    return fetchApi(`/podcasts/listennotes/best?${params}`);
  },

  /**
   * Get podcast by ID
   */
  getPodcast: async (podcastId) => {
    return fetchApi(`/podcasts/listennotes/podcast/${podcastId}`);
  },

  /**
   * Get episode by ID
   */
  getEpisode: async (episodeId) => {
    return fetchApi(`/podcasts/listennotes/episode/${episodeId}`);
  },
};

// ============ PodcastIndex Direct Access ============

export const podcastIndexApi = {
  /**
   * Search PodcastIndex directly
   */
  search: async (query, limit = 20) => {
    return fetchApi(`/podcasts/podcastindex/search?q=${encodeURIComponent(query)}&limit=${limit}`);
  },

  /**
   * Get trending podcasts
   */
  getTrending: async (limit = 20, category = null) => {
    const params = new URLSearchParams({ limit });
    if (category) params.append('category', category);
    return fetchApi(`/podcasts/podcastindex/trending?${params}`);
  },

  /**
   * Get podcast by ID
   */
  getPodcast: async (podcastId) => {
    return fetchApi(`/podcasts/podcastindex/podcast/${podcastId}`);
  },
};

// ============ Combined Search Helper ============

export const combinedSearch = async (query, options = {}) => {
  const { musicLimit = 10, podcastLimit = 10 } = options;

  try {
    const [musicResult, podcastResult] = await Promise.all([
      musicDiscoveryApi.search(query, 'all', musicLimit),
      podcastDiscoveryApi.search(query, 'all', podcastLimit),
    ]);

    return {
      success: true,
      data: {
        music: musicResult.data || { tracks: [], artists: [], albums: [] },
        podcasts: podcastResult.data || { podcasts: [], episodes: [] },
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      data: {
        music: { tracks: [], artists: [], albums: [] },
        podcasts: { podcasts: [], episodes: [] },
      },
    };
  }
};

export default {
  musicDiscovery: musicDiscoveryApi,
  musicBrainz: musicBrainzApi,
  audioDb: audioDbApi,
  podcastDiscovery: podcastDiscoveryApi,
  listenNotes: listenNotesApi,
  podcastIndex: podcastIndexApi,
  combinedSearch,
};