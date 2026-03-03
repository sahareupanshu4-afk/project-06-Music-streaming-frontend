import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import { AuthProvider } from './context/AuthContext'
import { PlayerProvider } from './context/PlayerContext'
import { ThemeProvider } from './context/ThemeContext'
import Layout from './components/Layout/Layout'
import LoadingScreen from './components/UI/LoadingScreen'
import ProtectedRoute from './components/Auth/ProtectedRoute'
import AdminRoute from './components/Auth/AdminRoute'

// Lazy loaded pages for better performance
const Home = lazy(() => import('./pages/Home'))
const Realms = lazy(() => import('./pages/Realms'))
const RealmDetail = lazy(() => import('./pages/RealmDetail'))
const Player = lazy(() => import('./pages/Player'))
const Search = lazy(() => import('./pages/Search'))
const Library = lazy(() => import('./pages/Library'))
const Playlists = lazy(() => import('./pages/Playlists'))
const PlaylistDetail = lazy(() => import('./pages/PlaylistDetail'))
const Podcasts = lazy(() => import('./pages/Podcasts'))
const History = lazy(() => import('./pages/History'))
const Profile = lazy(() => import('./pages/Profile'))
const Settings = lazy(() => import('./pages/Settings'))
const Admin = lazy(() => import('./pages/Admin'))
const Login = lazy(() => import('./pages/Auth/Login'))
const Register = lazy(() => import('./pages/Auth/Register'))
const EnergyWave = lazy(() => import('./pages/EnergyWave'))
const MoodUniverse = lazy(() => import('./pages/MoodUniverse'))

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <PlayerProvider>
            <Suspense fallback={<LoadingScreen />}>
              <Routes>
                {/* Auth Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                {/* Main Routes with Layout */}
                <Route path="/" element={<Layout />}>
                  <Route index element={<Home />} />
                  <Route path="realms" element={<Realms />} />
                  <Route path="realms/:realmId" element={<RealmDetail />} />
                  <Route path="player" element={<Player />} />
                  <Route path="search" element={<Search />} />
                  <Route path="energy" element={<EnergyWave />} />
                  <Route path="mood" element={<MoodUniverse />} />
                  
                  {/* Protected Routes */}
                  <Route path="library" element={
                    <ProtectedRoute>
                      <Library />
                    </ProtectedRoute>
                  } />
                  <Route path="playlists" element={
                    <ProtectedRoute>
                      <Playlists />
                    </ProtectedRoute>
                  } />
                  <Route path="playlists/:playlistId" element={
                    <ProtectedRoute>
                      <PlaylistDetail />
                    </ProtectedRoute>
                  } />
                  <Route path="podcasts" element={<Podcasts />} />
                  <Route path="history" element={
                    <ProtectedRoute>
                      <History />
                    </ProtectedRoute>
                  } />
                  <Route path="profile" element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  } />
                  <Route path="settings" element={
                    <ProtectedRoute>
                      <Settings />
                    </ProtectedRoute>
                  } />
                  
                  {/* Admin Routes */}
                  <Route path="admin" element={
                    <AdminRoute>
                      <Admin />
                    </AdminRoute>
                  } />
                </Route>
              </Routes>
            </Suspense>
          </PlayerProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  )
}

export default App