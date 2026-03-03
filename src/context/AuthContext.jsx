import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState(null)

  useEffect(() => {
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        setSession(session)
        setUser(session?.user ?? null)
        
        if (session?.user) {
          await fetchProfile(session.user.id)
        }
      } catch (error) {
        console.error('Error getting session:', error)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        
        if (session?.user) {
          await ensureUserProfile(session.user)
          await fetchProfile(session.user.id)
        } else {
          setProfile(null)
        }
        
        setLoading(false)
      }
    )

    return () => {
      subscription?.unsubscribe()
    }
  }, [])

  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error
      setProfile(data)
    } catch (error) {
      console.error('Error fetching profile:', error)
    }
  }

  const ensureUserProfile = async (authUser) => {
    try {
      const { data: existingProfile, error } = await supabase
        .from('users')
        .select('id')
        .eq('id', authUser.id)
        .single()

      if (!existingProfile) {
        await supabase.from('users').insert({
          id: authUser.id,
          email: authUser.email,
          name: authUser.user_metadata?.full_name || authUser.user_metadata?.name || authUser.email.split('@')[0],
          avatar_url: authUser.user_metadata?.avatar_url || authUser.user_metadata?.picture,
          role: 'user',
          sound_dna_json: {
            top_energy: 'flow',
            dominant_realm: 'electronic',
            listening_consistency: 0,
            favorite_artists: [],
            mood_history: []
          }
        })
      }
    } catch (error) {
      console.error('Error ensuring user profile:', error)
    }
  }

  const signUp = async (email, password, metadata = {}) => {
    try {
      setLoading(true)
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            ...metadata,
            role: 'user'
          },
          emailRedirectTo: undefined
        }
      })

      if (error) throw error

      if (data.user) {
        await supabase.from('users').insert({
          id: data.user.id,
          email: email,
          name: metadata.name || email.split('@')[0],
          role: 'user',
          sound_dna_json: {
            top_energy: 'flow',
            dominant_realm: 'electronic',
            listening_consistency: 0,
            favorite_artists: [],
            mood_history: []
          }
        })
      }

      if (data.session) {
        setSession(data.session)
        setUser(data.session.user)
        await fetchProfile(data.user.id)
      }

      return { data, error: null, needsConfirmation: !data.session }
    } catch (error) {
      return { data: null, error }
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email, password) => {
    try {
      setLoading(true)
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      setUser(null)
      setProfile(null)
      setSession(null)
      return { error: null }
    } catch (error) {
      return { error }
    } finally {
      setLoading(false)
    }
  }

  const signInWithGoogle = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      })

      if (error) throw error

      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (updates) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single()

      if (error) throw error
      setProfile(data)
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  const updateSoundDNA = async (soundDNA) => {
    return updateProfile({ sound_dna_json: soundDNA })
  }

  const isAdmin = () => {
    return profile?.role === 'admin' || profile?.role === 'super_admin'
  }

  const value = {
    user,
    profile,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    signInWithGoogle,
    updateProfile,
    updateSoundDNA,
    isAdmin,
    fetchProfile
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthContext