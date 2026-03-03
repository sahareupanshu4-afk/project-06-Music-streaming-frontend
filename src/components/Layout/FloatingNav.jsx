import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Home, 
  Search, 
  Library, 
  User, 
  Compass,
  Radio,
  Disc3,
  Zap,
  Menu,
  X,
  LogOut,
  Settings,
  Headphones,
  Clock
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'

const FloatingNav = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  const { getRealmTheme, currentTheme } = useTheme()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  const theme = getRealmTheme(currentTheme)

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close menu on route change
  useEffect(() => {
    setIsMenuOpen(false)
  }, [location.pathname])

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  // Main navigation items
  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/realms', icon: Compass, label: 'Realms' },
    { path: '/energy', icon: Zap, label: 'Energy' },
    { path: '/search', icon: Search, label: 'Search' },
  ]

  // Secondary navigation items
  const secondaryItems = [
    { path: '/library', icon: Library, label: 'Library', protected: true },
    { path: '/playlists', icon: Disc3, label: 'Playlists', protected: true },
    { path: '/history', icon: Clock, label: 'History', protected: true },
    { path: '/podcasts', icon: Radio, label: 'Podcasts' },
    { path: '/profile', icon: User, label: 'Profile', protected: true },
  ]

  const isActive = (path) => location.pathname === path

  return (
    <>
      {/* Top Navigation Bar */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'py-2' : 'py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4">
          <div 
            className={`glass rounded-2xl px-6 py-3 flex items-center justify-between transition-all duration-300 ${
              scrolled ? 'shadow-lg' : ''
            }`}
          >
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <motion.div
                whileHover={{ rotate: 180 }}
                transition={{ duration: 0.5 }}
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: theme.gradient }}
              >
                <Headphones className="w-5 h-5 text-white" />
              </motion.div>
              <span className="text-xl font-bold gradient-text hidden sm:block">
                SoundVerse
              </span>
            </Link>

            {/* Center Navigation - Desktop */}
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="relative px-4 py-2 rounded-xl transition-all duration-300 group"
                >
                  <motion.div
                    className="flex items-center gap-2"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <item.icon 
                      className={`w-5 h-5 transition-colors duration-300 ${
                        isActive(item.path) ? 'text-neon-purple' : 'text-gray-400 group-hover:text-white'
                      }`} 
                    />
                    <span className={`text-sm font-medium transition-colors duration-300 ${
                      isActive(item.path) ? 'text-white' : 'text-gray-400 group-hover:text-white'
                    }`}>
                      {item.label}
                    </span>
                  </motion.div>
                  
                  {/* Active Indicator */}
                  {isActive(item.path) && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute inset-0 rounded-xl -z-10"
                      style={{ background: `${theme.primary}20` }}
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </Link>
              ))}
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-3">
              {/* History Link - Desktop (only when logged in) */}
              {user && (
                <Link
                  to="/history"
                  className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/5 transition-colors"
                >
                  <Clock className="w-5 h-5 text-gray-400 hover:text-white" />
                  <span className="text-sm text-gray-400 hover:text-white">History</span>
                </Link>
              )}
              
              {/* User Menu - Desktop */}
              {user ? (
                <div className="hidden md:flex items-center gap-2">
                  <Link
                    to="/settings"
                    className="p-2 rounded-xl hover:bg-white/5 transition-colors"
                  >
                    <Settings className="w-5 h-5 text-gray-400 hover:text-white" />
                  </Link>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSignOut}
                    className="p-2 rounded-xl hover:bg-white/5 transition-colors"
                  >
                    <LogOut className="w-5 h-5 text-gray-400 hover:text-white" />
                  </motion.button>
                </div>
              ) : (
                <div className="hidden md:flex items-center gap-2">
                  <Link
                    to="/login"
                    className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="btn-primary text-sm"
                  >
                    Get Started
                  </Link>
                </div>
              )}

              {/* Mobile Menu Button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 rounded-xl hover:bg-white/5 transition-colors"
              >
                {isMenuOpen ? (
                  <X className="w-6 h-6 text-white" />
                ) : (
                  <Menu className="w-6 h-6 text-white" />
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-0 top-20 z-40 px-4 md:hidden"
          >
            <div className="glass rounded-2xl p-4 shadow-xl">
              {/* Main Navigation */}
              <div className="space-y-1 mb-4">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                      isActive(item.path) 
                        ? 'bg-neon-purple/20 text-white' 
                        : 'hover:bg-white/5 text-gray-400'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                ))}
              </div>

              {/* Divider */}
              <div className="h-px bg-white/10 my-4" />

              {/* Secondary Navigation */}
              <div className="space-y-1">
                {secondaryItems.map((item) => (
                  !item.protected || user ? (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                        isActive(item.path) 
                          ? 'bg-neon-purple/20 text-white' 
                          : 'hover:bg-white/5 text-gray-400'
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  ) : null
                ))}
              </div>

              {/* Auth Buttons */}
              <div className="mt-4 pt-4 border-t border-white/10">
                {user ? (
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-gray-400 transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Sign Out</span>
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <Link
                      to="/login"
                      className="flex-1 text-center py-3 rounded-xl border border-white/10 text-white font-medium hover:bg-white/5 transition-colors"
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/register"
                      className="flex-1 text-center py-3 rounded-xl btn-primary font-medium"
                    >
                      Get Started
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Navigation - Mobile */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
      >
        <div className="mx-4 mb-4">
          <div className="glass rounded-2xl p-2 flex items-center justify-around">
            {navItems.slice(0, 4).map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="relative p-3 rounded-xl transition-all duration-300"
              >
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  className="relative"
                >
                  <item.icon 
                    className={`w-6 h-6 transition-colors duration-300 ${
                      isActive(item.path) ? 'text-neon-purple' : 'text-gray-400'
                    }`} 
                  />
                  
                  {/* Active Dot */}
                  {isActive(item.path) && (
                    <motion.div
                      layoutId="activeDot"
                      className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-neon-purple"
                      transition={{ type: 'spring', bounce: 0.5 }}
                    />
                  )}
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </motion.div>
    </>
  )
}

export default FloatingNav