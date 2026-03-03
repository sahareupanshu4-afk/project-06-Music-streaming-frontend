import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Volume2, 
  Globe, 
  Moon,
  LogOut
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useNavigate } from 'react-router-dom'

const Settings = () => {
  const { user, signOut } = useAuth()
  const { particleIntensity, setParticleIntensity, glowIntensity, setGlowIntensity } = useTheme()
  const navigate = useNavigate()
  
  const [activeSection, setActiveSection] = useState('account')
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    newReleases: true,
    recommendations: true
  })

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const sections = [
    { id: 'account', label: 'Account', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'audio', label: 'Audio', icon: Volume2 },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'language', label: 'Language', icon: Globe }
  ]

  return (
    <div className="min-h-screen pt-20 pb-32">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-2">Settings</h1>
          <p className="text-gray-400">Customize your SoundVerse experience</p>
        </motion.div>

        <div className="grid md:grid-cols-4 gap-6">
          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass rounded-2xl p-4"
          >
            <nav className="space-y-1">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    activeSection === section.id
                      ? 'bg-neon-purple/20 text-neon-purple'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <section.icon className="w-5 h-5" />
                  {section.label}
                </button>
              ))}
            </nav>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:col-span-3 glass rounded-2xl p-6"
          >
            {activeSection === 'account' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold mb-4">Account Settings</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-400">Email</label>
                    <p className="text-white">{user?.email}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm text-gray-400">Name</label>
                    <p className="text-white">{user?.user_metadata?.name || 'Not set'}</p>
                  </div>

                  <button className="btn-secondary">Edit Profile</button>
                </div>

                <div className="pt-6 border-t border-white/10">
                  <h3 className="font-medium mb-4">Danger Zone</h3>
                  <button 
                    onClick={handleSignOut}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}

            {activeSection === 'notifications' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold mb-4">Notification Preferences</h2>
                
                {Object.entries({
                  email: 'Email Notifications',
                  push: 'Push Notifications',
                  newReleases: 'New Releases',
                  recommendations: 'Recommendations'
                }).map(([key, label]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span>{label}</span>
                    <button
                      onClick={() => setNotifications(prev => ({ ...prev, [key]: !prev[key] }))}
                      className={`w-12 h-6 rounded-full transition-colors ${
                        notifications[key] ? 'bg-neon-purple' : 'bg-white/10'
                      }`}
                    >
                      <motion.div
                        className="w-5 h-5 bg-white rounded-full"
                        animate={{ x: notifications[key] ? 26 : 2 }}
                      />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {activeSection === 'appearance' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold mb-4">Appearance</h2>
                
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Particle Intensity</label>
                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.1"
                    value={particleIntensity}
                    onChange={(e) => setParticleIntensity(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Glow Intensity</label>
                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.1"
                    value={glowIntensity}
                    onChange={(e) => setGlowIntensity(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span>Dark Mode</span>
                  <span className="text-neon-purple">Always On</span>
                </div>
              </div>
            )}

            {activeSection === 'audio' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold mb-4">Audio Settings</h2>
                
                <div className="flex items-center justify-between">
                  <span>Audio Quality</span>
                  <select className="bg-white/5 border border-white/10 rounded-lg px-4 py-2">
                    <option>High (320kbps)</option>
                    <option>Medium (192kbps)</option>
                    <option>Low (128kbps)</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <span>Normalize Volume</span>
                  <button className="w-12 h-6 rounded-full bg-neon-purple">
                    <motion.div
                      className="w-5 h-5 bg-white rounded-full"
                      animate={{ x: 26 }}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <span>Crossfade</span>
                  <select className="bg-white/5 border border-white/10 rounded-lg px-4 py-2">
                    <option>Off</option>
                    <option>2 seconds</option>
                    <option>5 seconds</option>
                    <option>10 seconds</option>
                  </select>
                </div>
              </div>
            )}

            {activeSection === 'privacy' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold mb-4">Privacy Settings</h2>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p>Public Profile</p>
                    <p className="text-sm text-gray-400">Allow others to see your profile</p>
                  </div>
                  <button className="w-12 h-6 rounded-full bg-neon-purple">
                    <motion.div className="w-5 h-5 bg-white rounded-full" style={{ marginLeft: 26 }} />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p>Show Listening Activity</p>
                    <p className="text-sm text-gray-400">Share what you're listening to</p>
                  </div>
                  <button className="w-12 h-6 rounded-full bg-white/10">
                    <motion.div className="w-5 h-5 bg-white rounded-full" style={{ marginLeft: 2 }} />
                  </button>
                </div>
              </div>
            )}

            {activeSection === 'language' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold mb-4">Language & Region</h2>
                
                <div className="flex items-center justify-between">
                  <span>Language</span>
                  <select className="bg-white/5 border border-white/10 rounded-lg px-4 py-2">
                    <option>English</option>
                    <option>Spanish</option>
                    <option>French</option>
                    <option>German</option>
                    <option>Hindi</option>
                  </select>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default Settings