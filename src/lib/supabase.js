import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Helper functions for database operations

// Tracks
export const tracksApi = {
  // Sample tracks for development when no database is available
  sampleTracks: [
    {
      id: '1',
      title: 'Calm Ocean Waves',
      artist: 'Nature Sounds',
      album: 'Relaxing Nature',
      audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      duration: 180,
      bpm: 60,
      energy_level: 'calm',
      realm: 'ambient',
      play_count: 0,
      created_at: '2024-01-01T00:00:00Z',
      cover_url: 'https://picsum.photos/seed/track1/300/300.jpg',
      color: '#4ade80'
    },
    {
      id: '2',
      title: 'Morning Flow',
      artist: 'Acoustic Breeze',
      album: 'Coffee Shop Vibes',
      audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
      duration: 210,
      bpm: 105,
      energy_level: 'flow',
      realm: 'pop',
      play_count: 0,
      created_at: '2024-01-02T00:00:00Z',
      cover_url: 'https://picsum.photos/seed/track2/300/300.jpg',
      color: '#60a5fa'
    },
    {
      id: '3',
      title: 'City Drive',
      artist: 'Electronic Pulse',
      album: 'Urban Nights',
      audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
      duration: 240,
      bpm: 130,
      energy_level: 'drive',
      realm: 'electronic',
      play_count: 0,
      created_at: '2024-01-03T00:00:00Z',
      cover_url: 'https://picsum.photos/seed/track3/300/300.jpg',
      color: '#f472b6'
    },
    {
      id: '4',
      title: 'Workout Energy',
      artist: 'Fitness Beats',
      album: 'Gym Motivation',
      audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
      duration: 180,
      bpm: 160,
      energy_level: 'hyper',
      realm: 'hiphop',
      play_count: 0,
      created_at: '2024-01-04T00:00:00Z',
      cover_url: 'https://picsum.photos/seed/track4/300/300.jpg',
      color: '#fb923c'
    },
    {
      id: '5',
      title: 'Jazz Evening',
      artist: 'Smooth Trio',
      album: 'Late Night Sessions',
      audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
      duration: 300,
      bpm: 85,
      energy_level: 'calm',
      realm: 'jazz',
      play_count: 0,
      created_at: '2024-01-05T00:00:00Z',
      cover_url: 'https://picsum.photos/seed/track5/300/300.jpg',
      color: '#8b5cf6'
    },
    {
      id: '6',
      title: 'Rock Anthem',
      artist: 'Electric Storm',
      album: 'Classic Rock',
      audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
      duration: 240,
      bpm: 140,
      energy_level: 'drive',
      realm: 'rock',
      play_count: 0,
      created_at: '2024-01-06T00:00:00Z',
      cover_url: 'https://picsum.photos/seed/track6/300/300.jpg',
      color: '#ef4444'
    }
  ],

  getAll: async (filters = {}) => {
    // If we have sample tracks and no database connection, return sample tracks
    if (typeof window !== 'undefined' && !supabase.url.includes('supabase')) {
      console.log('Using sample tracks instead of database');
      return Promise.resolve({
        data: tracksApi.sampleTracks.filter(track => {
          if (filters.realm && track.realm !== filters.realm) return false;
          if (filters.energy && track.energy_level !== filters.energy) return false;
          return true;
        })
      });
    }

    let query = supabase
      .from('tracks')
      .select('*')
      .order('created_at', { ascending: false })

    if (filters.realm) {
      query = query.eq('realm', filters.realm)
    }
    if (filters.energy) {
      query = query.eq('energy_level', filters.energy)
    }
    if (filters.limit) {
      query = query.limit(filters.limit)
    }

    return query
  },
  
  getById: async (id) => {
    return supabase
      .from('tracks')
      .select('*')
      .eq('id', id)
      .single()
  },
  
  search: async (query) => {
    return supabase
      .from('tracks')
      .select('*')
      .or(`title.ilike.%${query}%,artist.ilike.%${query}%`)
      .limit(20)
  },
  
  getByRealm: async (realm) => {
    return supabase
      .from('tracks')
      .select('*')
      .eq('realm', realm)
      .order('play_count', { ascending: false })
  },
  
  getByEnergy: async (energy) => {
    const bpmRanges = {
      calm: [0, 90],
      flow: [90, 120],
      drive: [120, 150],
      hyper: [150, 300]
    }
    
    const [min, max] = bpmRanges[energy] || [0, 300]
    
    return supabase
      .from('tracks')
      .select('*')
      .gte('bpm', min)
      .lt('bpm', max)
      .order('play_count', { ascending: false })
  },
  
  getTopPlayed: async (limit = 10) => {
    try {
      const result = await supabase
        .from('tracks')
        .select('*')
        .order('play_count', { ascending: false })
        .limit(limit)
      
      if (result.data && result.data.length > 0) {
        return { data: result.data, error: null }
      }
      
      // Return sample tracks if no database data
      return { 
        data: tracksApi.sampleTracks.slice(0, limit), 
        error: null 
      }
    } catch (error) {
      return { 
        data: tracksApi.sampleTracks.slice(0, limit), 
        error: null 
      }
    }
  }
}

// Podcasts
export const podcastsApi = {
  getAll: async () => {
    return supabase
      .from('podcasts')
      .select('*')
      .order('created_at', { ascending: false })
  },
  
  getById: async (id) => {
    return supabase
      .from('podcasts')
      .select('*')
      .eq('id', id)
      .single()
  }
}

// Playlists
export const playlistsApi = {
  getByUser: async (userId) => {
    return supabase
      .from('playlists')
      .select(`
        *,
        playlist_tracks (
          id,
          track_id,
          tracks (*)
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
  },
  
  getById: async (id) => {
    return supabase
      .from('playlists')
      .select(`
        *,
        playlist_tracks (
          id,
          track_id,
          tracks (*)
        )
      `)
      .eq('id', id)
      .single()
  },
  
  create: async (playlist) => {
    return supabase
      .from('playlists')
      .insert(playlist)
      .select()
      .single()
  },
  
  update: async (id, updates) => {
    return supabase
      .from('playlists')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
  },
  
  delete: async (id) => {
    return supabase
      .from('playlists')
      .delete()
      .eq('id', id)
  },
  
  addTrack: async (playlistId, trackId) => {
    return supabase
      .from('playlist_tracks')
      .insert({ playlist_id: playlistId, track_id: trackId })
  },
  
  removeTrack: async (playlistId, trackId) => {
    return supabase
      .from('playlist_tracks')
      .delete()
      .eq('playlist_id', playlistId)
      .eq('track_id', trackId)
  }
}

// Favorites
export const favoritesApi = {
  getByUser: async (userId) => {
    return supabase
      .from('favorites')
      .select(`
        id,
        tracks (*)
      `)
      .eq('user_id', userId)
  },
  
  add: async (userId, trackId) => {
    return supabase
      .from('favorites')
      .insert({ user_id: userId, track_id: trackId })
  },
  
  remove: async (userId, trackId) => {
    return supabase
      .from('favorites')
      .delete()
      .eq('user_id', userId)
      .eq('track_id', trackId)
  },
  
  isFavorite: async (userId, trackId) => {
    const { data } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('track_id', trackId)
      .single()
    
    return !!data
  }
}

// Recently Played
export const recentlyPlayedApi = {
  getByUser: async (userId, limit = 20) => {
    return supabase
      .from('recently_played')
      .select(`
        id,
        last_position,
        played_at,
        tracks (*)
      `)
      .eq('user_id', userId)
      .order('played_at', { ascending: false })
      .limit(limit)
  }
}

// Analytics
export const analyticsApi = {
  getUserStats: async (userId) => {
    const { data: recentTracks } = await supabase
      .from('analytics')
      .select(`
        id,
        played_at,
        session_duration,
        tracks (realm, energy_level, bpm)
      `)
      .eq('user_id', userId)
      .order('played_at', { ascending: false })
      .limit(100)
    
    return recentTracks
  },
  
  getAdminStats: async () => {
    const { count: totalUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
    
    const { data: topTracks } = await supabase
      .from('tracks')
      .select('*')
      .order('play_count', { ascending: false })
      .limit(10)
    
    const { data: realmStats } = await supabase
      .from('tracks')
      .select('realm, play_count')
    
    return {
      totalUsers,
      topTracks,
      realmStats
    }
  }
}

export default supabase