import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAppContext } from '../App';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import {
  Award,
  Leaf,
  TreePine,
  Zap,
  TrendingUp,
  Trophy,
  Star,
  Target,
  Medal,
  Crown,
  Sparkles,
  RefreshCw
} from 'lucide-react';

const API_URL = 'http://localhost:8000';

const Progress = () => {
  const { userProgress, setUserProgress, userId } = useAppContext();
  const [leaderboard, setLeaderboard] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [animatedStats, setAnimatedStats] = useState({
    ecoPoints: 0,
    devicesEvaluated: 0,
    co2Saved: 0,
    level: 1
  });

  // Demo data for when API is not available
  const demoProgress = {
    eco_points: 285,
    devices_evaluated: 8,
    total_co2_saved: 156,
    level: 3,
    level_progress: 85,
    points_history: [
      { date: '2024-01-15', points: 35, action: 'Evaluated smartphone' },
      { date: '2024-01-18', points: 45, action: 'Evaluated laptop' },
      { date: '2024-01-20', points: 25, action: 'Scheduled pickup' },
      { date: '2024-01-22', points: 40, action: 'Evaluated tablet' },
      { date: '2024-01-25', points: 30, action: 'Evaluated smartwatch' },
      { date: '2024-01-28', points: 50, action: 'Evaluated desktop' },
      { date: '2024-02-01', points: 35, action: 'Evaluated headphones' },
      { date: '2024-02-05', points: 25, action: 'Recycled device' }
    ],
    badges: [
      { id: 'first_eval', name: 'First Step', rarity: 'common', description: 'Evaluated your first device', icon: '🌱' },
      { id: 'eco_starter', name: 'Eco Starter', rarity: 'common', description: 'Earned 50 eco points', icon: '🌿' },
      { id: 'carbon_saver', name: 'Carbon Saver', rarity: 'rare', description: 'Saved 100kg of CO2', icon: '🌍' },
      { id: 'device_master', name: 'Device Master', rarity: 'rare', description: 'Evaluated 5 devices', icon: '📱' }
    ]
  };

  const demoLeaderboard = [
    { rank: 1, name: 'EcoWarrior23', points: 2450, level: 25, co2_saved: 1230 },
    { rank: 2, name: 'GreenTech_Pro', points: 2180, level: 22, co2_saved: 980 },
    { rank: 3, name: 'RecycleKing', points: 1890, level: 19, co2_saved: 875 },
    { rank: 4, name: 'SustainableLife', points: 1720, level: 18, co2_saved: 820 },
    { rank: 5, name: 'TechSaver99', points: 1580, level: 16, co2_saved: 760 },
    { rank: 6, name: 'CircularEco', points: 1420, level: 15, co2_saved: 690 },
    { rank: 7, name: 'GreenDevice', points: 1350, level: 14, co2_saved: 645 },
    { rank: 8, name: 'EarthFirst', points: 1280, level: 13, co2_saved: 610 },
    { rank: 9, name: 'ReuseMaster', points: 1150, level: 12, co2_saved: 550 },
    { rank: 10, name: 'EcoTechie', points: 1080, level: 11, co2_saved: 520 }
  ];

  // All available badges
  const allBadges = [
    { id: 'first_eval', name: 'First Step', rarity: 'common', description: 'Evaluated your first device', icon: '🌱' },
    { id: 'eco_starter', name: 'Eco Starter', rarity: 'common', description: 'Earned 50 eco points', icon: '🌿' },
    { id: 'green_beginner', name: 'Green Beginner', rarity: 'common', description: 'Completed 3 evaluations', icon: '🍀' },
    { id: 'carbon_saver', name: 'Carbon Saver', rarity: 'rare', description: 'Saved 100kg of CO2', icon: '🌍' },
    { id: 'device_master', name: 'Device Master', rarity: 'rare', description: 'Evaluated 10 devices', icon: '📱' },
    { id: 'level_5', name: 'Rising Star', rarity: 'rare', description: 'Reached level 5', icon: '⭐' },
    { id: 'eco_champion', name: 'Eco Champion', rarity: 'epic', description: 'Earned 500 eco points', icon: '🏆' },
    { id: 'planet_guardian', name: 'Planet Guardian', rarity: 'epic', description: 'Saved 500kg of CO2', icon: '🛡️' },
    { id: 'level_10', name: 'Eco Legend', rarity: 'epic', description: 'Reached level 10', icon: '👑' }
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [progressRes, leaderboardRes] = await Promise.all([
          fetch(`${API_URL}/progress/${userId}`),
          fetch(`${API_URL}/leaderboard`)
        ]);

        if (progressRes.ok) {
          const progressData = await progressRes.json();
          setUserProgress({
            ...userProgress,
            ...progressData
          });
        } else {
          setUserProgress(demoProgress);
        }

        if (leaderboardRes.ok) {
          const leaderboardData = await leaderboardRes.json();
          setLeaderboard(leaderboardData.leaderboard);
        } else {
          setLeaderboard(demoLeaderboard);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setUserProgress(demoProgress);
        setLeaderboard(demoLeaderboard);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  // Animate stats
  useEffect(() => {
    if (isLoading) return;

    const progress = userProgress.eco_points ? userProgress : demoProgress;
    const duration = 1500;
    const steps = 60;
    const interval = duration / steps;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const p = currentStep / steps;
      const easeOut = 1 - Math.pow(1 - p, 3);

      setAnimatedStats({
        ecoPoints: Math.floor(progress.eco_points * easeOut),
        devicesEvaluated: Math.floor(progress.devices_evaluated * easeOut),
        co2Saved: Math.floor(progress.total_co2_saved * easeOut),
        level: progress.level
      });

      if (currentStep >= steps) {
        clearInterval(timer);
        setAnimatedStats({
          ecoPoints: progress.eco_points,
          devicesEvaluated: progress.devices_evaluated,
          co2Saved: progress.total_co2_saved,
          level: progress.level
        });
      }
    }, interval);

    return () => clearInterval(timer);
  }, [isLoading, userProgress]);

  const progress = userProgress.eco_points ? userProgress : demoProgress;
  const currentLeaderboard = leaderboard.length > 0 ? leaderboard : demoLeaderboard;

  // Prepare chart data
  const chartData = (progress.points_history || demoProgress.points_history).map((item, index) => ({
    name: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    points: item.points,
    cumulative: (progress.points_history || demoProgress.points_history)
      .slice(0, index + 1)
      .reduce((sum, i) => sum + i.points, 0)
  }));

  // Tree size based on level
  const getTreeSize = () => {
    const level = progress.level || 1;
    if (level <= 2) return { trunkHeight: 40, leaves: 1 };
    if (level <= 4) return { trunkHeight: 60, leaves: 2 };
    if (level <= 6) return { trunkHeight: 80, leaves: 3 };
    if (level <= 8) return { trunkHeight: 100, leaves: 4 };
    return { trunkHeight: 120, leaves: 5 };
  };

  const treeConfig = getTreeSize();

  // Get earned badges
  const earnedBadgeIds = (progress.badges || []).map(b => b.id);

  if (isLoading) {
    return (
      <div className="progress-page">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p className="loading-text">Loading your progress...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="progress-page">
      <div className="progress-container">
        <motion.div
          className="progress-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="evaluate-title">My Progress</h1>
          <p className="evaluate-subtitle">
            Track your eco-journey and see the impact you're making.
          </p>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          className="stats-overview"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="stat-card">
            <div className="stat-icon">🌿</div>
            <div className="stat-value">{animatedStats.ecoPoints}</div>
            <div className="stat-label">Eco Points</div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">📱</div>
            <div className="stat-value">{animatedStats.devicesEvaluated}</div>
            <div className="stat-label">Devices Evaluated</div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🌍</div>
            <div className="stat-value">{animatedStats.co2Saved}</div>
            <div className="stat-label">kg CO2 Saved</div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">⚡</div>
            <div className="stat-value">Lv.{animatedStats.level}</div>
            <div className="stat-label">Current Level</div>
          </div>
        </motion.div>

        {/* Level Progress */}
        <motion.div
          className="level-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="level-header">
            <div className="level-info">
              <div className="level-badge">{progress.level || 1}</div>
              <div className="level-text">
                <h3>Level {progress.level || 1}</h3>
                <p>{progress.level >= 10 ? 'Eco Legend' : progress.level >= 5 ? 'Rising Star' : 'Eco Enthusiast'}</p>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--accent-primary)' }}>
                {progress.eco_points || 0}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Total Points</div>
            </div>
          </div>

          <div className="level-progress-bar">
            <motion.div
              className="level-progress-fill"
              initial={{ width: 0 }}
              animate={{ width: `${progress.level_progress || 85}%` }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
          </div>

          <div className="level-progress-text">
            <span>{progress.eco_points % 100 || 85} / 100 points to next level</span>
            <span>Level {(progress.level || 1) + 1}</span>
          </div>
        </motion.div>

        {/* Tree Animation */}
        <motion.div
          className="tree-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h3 style={{ marginBottom: 'var(--spacing-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--spacing-sm)' }}>
            <TreePine size={24} style={{ color: 'var(--accent-primary)' }} />
            Your Eco Tree
          </h3>

          <div className="tree-container">
            <motion.div
              className="tree"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              {/* Tree Leaves */}
              <div className="tree-leaves">
                {[...Array(treeConfig.leaves)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="leaf-layer"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.8 + i * 0.2 }}
                    style={{
                      borderLeftWidth: `${40 + (treeConfig.leaves - i) * 15}px`,
                      borderRightWidth: `${40 + (treeConfig.leaves - i) * 15}px`,
                      borderBottomWidth: `${30 + (treeConfig.leaves - i) * 10}px`,
                      borderBottomColor: i === 0 ? '#00d4aa' : i === 1 ? '#00b894' : '#55efc4'
                    }}
                  />
                ))}
              </div>

              {/* Tree Trunk */}
              <motion.div
                className="tree-trunk"
                initial={{ height: 0 }}
                animate={{ height: treeConfig.trunkHeight }}
                transition={{ duration: 0.5, delay: 0.5 }}
              />
            </motion.div>
          </div>

          <p className="tree-message">
            {progress.level >= 10 
              ? '🌳 Your tree is fully grown! You\'re an Eco Legend!'
              : progress.level >= 5
              ? '🌲 Your tree is growing strong! Keep up the great work!'
              : '🌱 Your tree is sprouting! Evaluate more devices to help it grow!'}
          </p>
        </motion.div>

        {/* Points Graph */}
        <motion.div
          className="graph-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h3 className="graph-title">
            <TrendingUp size={20} style={{ color: 'var(--accent-primary)', marginRight: 'var(--spacing-sm)' }} />
            Points Progress
          </h3>

          <div className="graph-container">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorPoints" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00d4aa" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#00d4aa" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  dataKey="name" 
                  stroke="#718096" 
                  fontSize={12}
                  tickLine={false}
                />
                <YAxis 
                  stroke="#718096" 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip 
                  contentStyle={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-primary)'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="cumulative" 
                  stroke="#00d4aa" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorPoints)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Badges Section */}
        <motion.div
          className="badges-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <h3 className="graph-title">
            <Award size={20} style={{ color: 'var(--accent-primary)', marginRight: 'var(--spacing-sm)' }} />
            Badges & Achievements
          </h3>

          <div className="badges-grid">
            {allBadges.map((badge) => {
              const isEarned = earnedBadgeIds.includes(badge.id);
              return (
                <motion.div
                  key={badge.id}
                  className={`badge-card ${badge.rarity} ${!isEarned ? 'locked' : ''}`}
                  whileHover={{ scale: isEarned ? 1.05 : 1 }}
                >
                  <div className="badge-icon" style={{ opacity: isEarned ? 1 : 0.3 }}>
                    {badge.icon}
                  </div>
                  <div className="badge-name">{badge.name}</div>
                  <div className="badge-description">{badge.description}</div>
                  <span className={`badge-rarity ${badge.rarity}`}>
                    {badge.rarity}
                  </span>
                  {!isEarned && (
                    <div style={{
                      position: 'absolute',
                      top: 'var(--spacing-sm)',
                      right: 'var(--spacing-sm)',
                      fontSize: '1.2rem'
                    }}>
                      🔒
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          className="activity-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <h3 className="graph-title">
            <RefreshCw size={20} style={{ color: 'var(--accent-primary)', marginRight: 'var(--spacing-sm)' }} />
            Recent Activity
          </h3>

          <div className="activity-list">
            {(progress.points_history || demoProgress.points_history).slice(-5).reverse().map((activity, index) => (
              <motion.div
                key={index}
                className="activity-item"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.7 + index * 0.1 }}
              >
                <div className="activity-icon">
                  {activity.action.includes('Evaluated') ? '📱' : 
                   activity.action.includes('pickup') ? '🚚' : 
                   activity.action.includes('Recycled') ? '♻️' : '🌿'}
                </div>
                <div className="activity-content">
                  <div className="activity-text">{activity.action}</div>
                  <div className="activity-date">
                    {new Date(activity.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </div>
                </div>
                <div className="activity-points">+{activity.points}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Global Leaderboard */}
        <motion.div
          className="leaderboard-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          <h3 className="leaderboard-title">
            <Trophy size={20} style={{ color: 'var(--accent-primary)' }} />
            Global Leaderboard
          </h3>

          <div className="leaderboard-list">
            {currentLeaderboard.map((user, index) => (
              <motion.div
                key={user.rank}
                className={`leaderboard-item ${index < 3 ? 'top-3' : ''}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.8 + index * 0.05 }}
              >
                <div className="leaderboard-rank">
                  {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : user.rank}
                </div>
                <div className="leaderboard-user">
                  <div className="leaderboard-avatar">
                    {user.name.charAt(0)}
                  </div>
                  <span className="leaderboard-name">{user.name}</span>
                </div>
                <div className="leaderboard-stats">
                  <span className="leaderboard-points">{user.points.toLocaleString()} pts</span>
                  <span className="leaderboard-level">Lv.{user.level}</span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Current User Position */}
          <div style={{
            marginTop: 'var(--spacing-lg)',
            padding: 'var(--spacing-md)',
            background: 'rgba(0, 212, 170, 0.1)',
            border: '1px solid var(--border-accent)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'var(--gradient-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '700'
              }}>
                Y
              </div>
              <div>
                <div style={{ fontWeight: '600' }}>You</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Rank #{Math.floor(Math.random() * 100) + 50}
                </div>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ color: 'var(--accent-primary)', fontWeight: '600' }}>
                {progress.eco_points || 285} pts
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Lv.{progress.level || 3}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Progress;
