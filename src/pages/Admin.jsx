import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Users, 
  Music, 
  TrendingUp, 
  Activity,
  Headphones,
  Clock,
  BarChart3,
  PieChart as PieChartIcon
} from 'lucide-react'
import { supabase, tracksApi, analyticsApi } from '../lib/supabase'
import { useTheme } from '../context/ThemeContext'
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts'

const Admin = () => {
  const { getRealmTheme } = useTheme()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTracks: 0,
    totalPlays: 0,
    activeSessions: 0
  })
  const [topTracks, setTopTracks] = useState([])
  const [realmStats, setRealmStats] = useState([])
  const [energyDistribution, setEnergyDistribution] = useState([])
  const [recentActivity, setRecentActivity] = useState([])

  useEffect(() => {
    fetchAdminData()
  }, [])

  const fetchAdminData = async () => {
    try {
      // Fetch total users
      const { count: totalUsers } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })

      // Fetch total tracks
      const { count: totalTracks } = await supabase
        .from('tracks')
        .select('*', { count: 'exact', head: true })

      // Fetch top tracks
      const { data: tracks } = await supabase
        .from('tracks')
        .select('*')
        .order('play_count', { ascending: false })
        .limit(10)

      // Calculate total plays
      const totalPlays = tracks?.reduce((sum, t) => sum + (t.play_count || 0), 0) || 0

      setStats({
        totalUsers: totalUsers || 0,
        totalTracks: totalTracks || 0,
        totalPlays,
        activeSessions: Math.floor(Math.random() * 100) + 50 // Mock data
      })

      setTopTracks(tracks || [])

      // Process realm stats
      const realmCounts = {}
      tracks?.forEach(track => {
        if (track.realm) {
          realmCounts[track.realm] = (realmCounts[track.realm] || 0) + 1
        }
      })

      const realmData = Object.entries(realmCounts).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value,
        color: getRealmTheme(name)?.primary || '#a855f7'
      }))

      setRealmStats(realmData)

      // Energy distribution
      setEnergyDistribution([
        { name: 'Calm', value: 30, color: '#4ade80' },
        { name: 'Flow', value: 35, color: '#60a5fa' },
        { name: 'Drive', value: 20, color: '#f472b6' },
        { name: 'Hyper', value: 15, color: '#fb923c' }
      ])

      // Recent activity (mock data)
      setRecentActivity([
        { time: '2 min ago', action: 'New user registered', type: 'user' },
        { time: '5 min ago', action: 'Track uploaded: "Midnight Dreams"', type: 'track' },
        { time: '10 min ago', action: 'Playlist created: "Chill Vibes"', type: 'playlist' },
        { time: '15 min ago', action: 'User upgraded to Premium', type: 'subscription' },
        { time: '20 min ago', action: 'New comment on "Electric Soul"', type: 'comment' }
      ])

    } catch (error) {
      console.error('Error fetching admin data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Hourly activity data
  const hourlyActivity = [
    { hour: '00:00', plays: 120 },
    { hour: '02:00', plays: 80 },
    { hour: '04:00', plays: 45 },
    { hour: '06:00', plays: 60 },
    { hour: '08:00', plays: 150 },
    { hour: '10:00', plays: 280 },
    { hour: '12:00', plays: 350 },
    { hour: '14:00', plays: 320 },
    { hour: '16:00', plays: 380 },
    { hour: '18:00', plays: 420 },
    { hour: '20:00', plays: 480 },
    { hour: '22:00', plays: 350 }
  ]

  const statCards = [
    { label: 'Total Users', value: stats.totalUsers, icon: Users, color: '#a855f7', change: '+12%' },
    { label: 'Total Tracks', value: stats.totalTracks, icon: Music, color: '#06b6d4', change: '+8%' },
    { label: 'Total Plays', value: stats.totalPlays.toLocaleString(), icon: Headphones, color: '#ec4899', change: '+24%' },
    { label: 'Active Now', value: stats.activeSessions, icon: Activity, color: '#10b981', change: '+5%' }
  ]

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
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-gray-400">Monitor your sound universe in real-time</p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass rounded-2xl p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <stat.icon 
                  className="w-8 h-8"
                  style={{ color: stat.color }}
                />
                <span className="text-xs text-green-400 font-medium">{stat.change}</span>
              </div>
              <p className="text-3xl font-bold mb-1">{stat.value}</p>
              <p className="text-sm text-gray-400">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Activity Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass rounded-2xl p-6"
          >
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-neon-purple" />
              Hourly Activity
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={hourlyActivity}>
                  <defs>
                    <linearGradient id="colorPlays" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="hour" stroke="#6b7280" fontSize={10} />
                  <YAxis stroke="#6b7280" fontSize={10} />
                  <Tooltip 
                    contentStyle={{ 
                      background: '#1a1a25', 
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="plays" 
                    stroke="#a855f7" 
                    fillOpacity={1} 
                    fill="url(#colorPlays)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Realm Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass rounded-2xl p-6"
          >
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-neon-cyan" />
              Realm Distribution
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={realmStats}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {realmStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-3 mt-4">
              {realmStats.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div 
                    className="w-2 h-2 rounded-full"
                    style={{ background: item.color }}
                  />
                  <span className="text-xs text-gray-400">{item.name}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Bottom Row */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Top Tracks */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass rounded-2xl p-6 lg:col-span-2"
          >
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-neon-pink" />
              Top Performing Tracks
            </h3>
            <div className="space-y-3">
              {topTracks.slice(0, 5).map((track, index) => (
                <div 
                  key={track.id}
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors"
                >
                  <span 
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
                    style={{ 
                      background: index < 3 
                        ? 'linear-gradient(135deg, #a855f7, #ec4899)' 
                        : 'rgba(255,255,255,0.1)'
                    }}
                  >
                    {index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{track.title}</p>
                    <p className="text-sm text-gray-400 truncate">{track.artist}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{track.play_count?.toLocaleString() || 0}</p>
                    <p className="text-xs text-gray-400">plays</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass rounded-2xl p-6"
          >
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-neon-green" />
              Recent Activity
            </h3>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div 
                    className={`w-2 h-2 rounded-full mt-2 ${
                      activity.type === 'user' ? 'bg-neon-purple' :
                      activity.type === 'track' ? 'bg-neon-cyan' :
                      activity.type === 'playlist' ? 'bg-neon-pink' :
                      activity.type === 'subscription' ? 'bg-neon-green' :
                      'bg-gray-400'
                    }`}
                  />
                  <div>
                    <p className="text-sm">{activity.action}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Energy Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass rounded-2xl p-6 mt-6"
        >
          <h3 className="text-lg font-bold mb-4">Energy Level Distribution</h3>
          <div className="grid grid-cols-4 gap-4">
            {energyDistribution.map((energy) => (
              <div 
                key={energy.name}
                className="text-center p-4 rounded-xl"
                style={{ background: `${energy.color}10` }}
              >
                <div 
                  className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-3"
                  style={{ background: `${energy.color}20` }}
                >
                  <span className="text-2xl font-bold" style={{ color: energy.color }}>
                    {energy.value}%
                  </span>
                </div>
                <p className="font-medium">{energy.name}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Admin