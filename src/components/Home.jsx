import React, { useState } from 'react';
import { motion } from 'framer-motion';

const Home = ({ user, onMoodSelect, onNavigate, moodHistory = [] }) => {
  const [selectedMood, setSelectedMood] = useState(null);

  // Comprehensive mood options - using theme colors only
  const moods = [
    { id: 'very-happy', emoji: '😄', label: 'Very Happy', color: 'from-sky/80 to-sky border-ocean/30' },
    { id: 'happy', emoji: '😊', label: 'Happy', color: 'from-mint/80 to-mint border-ocean/30' },
    { id: 'good', emoji: '🙂', label: 'Good', color: 'from-sky/60 to-mint/60 border-ocean/30' },
    { id: 'okay', emoji: '😐', label: 'Okay', color: 'from-mint/50 to-sky/50 border-ocean/20' },
    { id: 'sad', emoji: '😔', label: 'Sad', color: 'from-ocean/20 to-sky/60 border-ocean/30' },
    { id: 'very-sad', emoji: '😢', label: 'Very Sad', color: 'from-ocean/30 to-highlight/30 border-ocean/40' },
    { id: 'anxious', emoji: '😰', label: 'Anxious', color: 'from-highlight/20 to-sky/50 border-highlight/30' },
    { id: 'angry', emoji: '😤', label: 'Angry', color: 'from-highlight/30 to-ocean/30 border-highlight/40' },
    { id: 'stressed', emoji: '😫', label: 'Stressed', color: 'from-ocean/25 to-mint/50 border-ocean/35' },
    { id: 'tired', emoji: '😴', label: 'Tired', color: 'from-sky/40 to-mint/40 border-ocean/25' },
  ];

  const handleMoodClick = (mood) => {
    setSelectedMood(mood.id);
    // Trigger animation and then call parent handler
    setTimeout(() => {
      if (onMoodSelect) {
        onMoodSelect(mood);
      }
    }, 300);
  };

  // Calculate weekly mood stats
  const getWeeklyStats = () => {
    if (!moodHistory || moodHistory.length === 0) {
      return {
        mostFrequent: 'No data yet',
        totalEntries: 0,
        trend: 'Start tracking your mood!',
        weeklyData: Array(7).fill(null)
      };
    }

    // Get last 7 days
    const today = new Date();
    const last7Days = Array(7).fill(null).map((_, i) => {
      const date = new Date(today);
      date.setDate(date.getDate() - (6 - i));
      return date.toLocaleDateString();
    });

    // Map moods to each day
    const weeklyData = last7Days.map(date => {
      const dayMoods = moodHistory.filter(entry => {
        const entryDate = typeof entry === 'string' ? new Date().toLocaleDateString() : entry.date;
        return entryDate === date;
      });
      
      if (dayMoods.length === 0) return null;
      
      // Get the most recent mood for that day
      const latestMood = dayMoods[dayMoods.length - 1];
      const moodId = typeof latestMood === 'string' ? latestMood : latestMood.id;
      return moodId;
    });

    // Count mood frequencies
    const moodCounts = {};
    moodHistory.forEach(entry => {
      const moodId = typeof entry === 'string' ? entry : entry.id;
      moodCounts[moodId] = (moodCounts[moodId] || 0) + 1;
    });

    const mostFrequent = Object.keys(moodCounts).length > 0 
      ? Object.keys(moodCounts).reduce((a, b) => moodCounts[a] > moodCounts[b] ? a : b)
      : 'okay';

    const totalEntries = weeklyData.filter(m => m !== null).length;

    return {
      mostFrequent: moods.find(m => m.id === mostFrequent)?.label || 'Mixed',
      totalEntries,
      trend: totalEntries >= 5 ? 'Great consistency!' : 'Keep it up!',
      weeklyData
    };
  };

  const weeklyStats = getWeeklyStats();

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Section - Greeting & Mood Selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-4"
      >
        {/* Greeting - Left Aligned */}
        <div className="space-y-2 text-left">
          <h1 className="text-3xl md:text-4xl font-display font-extrabold text-navy tracking-tight">
            Hi {user?.displayName?.split(' ')[0] || 'there'}! 👋
          </h1>
          <p className="text-lg md:text-xl text-navy/70 font-light tracking-wide">
            How is your mood today?
          </p>
        </div>

        {/* Mood Selection Row */}
        <div className="flex flex-wrap justify-start gap-3 md:gap-4">
          {moods.map((mood, index) => (
            <motion.button
              key={mood.id}
              onClick={() => handleMoodClick(mood)}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
              whileHover={{ scale: 1.1, y: -5 }}
              whileTap={{ scale: 0.95 }}
              className={`
                flex flex-col items-center justify-center
                w-20 h-20 md:w-24 md:h-24
                rounded-2xl border-2
                bg-gradient-to-br ${mood.color}
                shadow-soft hover:shadow-elevated
                transition-all duration-200
                ${selectedMood === mood.id ? 'ring-4 ring-ocean ring-offset-2' : ''}
              `}
            >
              <span className="text-3xl md:text-4xl mb-1">{mood.emoji}</span>
              <span className="text-xs md:text-sm font-semibold text-navy/90 tracking-tight">
                {mood.label}
              </span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Bottom Section - Split Layout */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6 px-4"
      >
        {/* Left Side - Weekly Overview */}
        <motion.div
          whileHover={{ y: -4 }}
          className="card bg-gradient-to-br from-white to-sky/30 border-2 border-ocean/20 p-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-ocean to-highlight flex items-center justify-center">
              <span className="text-2xl">📊</span>
            </div>
            <h2 className="text-2xl font-display font-bold text-navy tracking-tight">Weekly Overview</h2>
          </div>

          <div className="space-y-4">
            {/* Stats Display */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/80 rounded-xl p-4 border border-ocean/10">
                <p className="text-xs font-medium text-navy/60 mb-1 tracking-wide uppercase">Most Frequent</p>
                <p className="text-lg font-bold text-navy tracking-tight">
                  {weeklyStats.mostFrequent}
                </p>
              </div>
              <div className="bg-white/80 rounded-xl p-4 border border-ocean/10">
                <p className="text-xs font-medium text-navy/60 mb-1 tracking-wide uppercase">Check-ins</p>
                <p className="text-lg font-bold text-navy tracking-tight">
                  {weeklyStats.totalEntries}/7
                </p>
              </div>
            </div>

            {/* Mini Visualization */}
            <div className="bg-white/80 rounded-xl p-4 border border-ocean/10">
              <p className="text-xs font-medium text-navy/60 mb-3 tracking-wide uppercase">Mood Trend</p>
              <div className="flex items-end justify-between h-24 gap-1">
                {weeklyStats.weeklyData.map((moodId, i) => {
                  // Map mood to a height value (higher = more positive)
                  const moodHeights = {
                    'very-happy': 100,
                    'happy': 85,
                    'good': 70,
                    'okay': 50,
                    'sad': 35,
                    'very-sad': 20,
                    'anxious': 40,
                    'angry': 30,
                    'stressed': 35,
                    'tired': 45
                  };
                  
                  const height = moodId ? moodHeights[moodId] || 50 : 10;
                  const hasData = moodId !== null;
                  
                  return (
                    <div
                      key={i}
                      className="flex-1 bg-gradient-to-t from-ocean to-highlight rounded-t-lg transition-all duration-300"
                      style={{
                        height: `${height}%`,
                        opacity: hasData ? 1 : 0.15
                      }}
                      title={hasData ? moods.find(m => m.id === moodId)?.label : 'No data'}
                    />
                  );
                })}
              </div>
              <div className="flex justify-between mt-2 text-xs font-medium text-navy/50">
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
                <span>Sun</span>
              </div>
            </div>

            {/* Trend Message */}
            <div className="bg-mint/40 rounded-xl p-4 border border-ocean/10">
              <p className="text-sm font-medium text-navy/80 text-center">
                ✨ {weeklyStats.trend}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Right Side - Talk Options */}
        <motion.div
          whileHover={{ y: -4 }}
          className="card bg-gradient-to-br from-white to-mint/30 border-2 border-ocean/20 p-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-highlight to-ocean flex items-center justify-center">
              <span className="text-2xl">💬</span>
            </div>
            <h2 className="text-2xl font-display font-bold text-navy tracking-tight">Want to Talk?</h2>
          </div>

          <div className="space-y-4">
            {/* AI Coach Button */}
            <motion.button
              onClick={() => onNavigate && onNavigate('coach')}
              whileHover={{ scale: 1.02, x: 4 }}
              whileTap={{ scale: 0.98 }}
              className="w-full group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-ocean to-highlight opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
              <div className="relative bg-gradient-to-br from-ocean/10 to-highlight/10 hover:from-ocean/20 hover:to-highlight/20 border-2 border-ocean/30 rounded-2xl p-6 transition-all duration-200">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-ocean to-highlight flex items-center justify-center shadow-soft">
                    <span className="text-3xl">🤖</span>
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="text-xl font-display font-bold text-navy mb-1 tracking-tight">
                      Talk to your AI Coach
                    </h3>
                    <p className="text-sm font-light text-navy/70">
                      Get personalized guidance and support
                    </p>
                  </div>
                  <svg
                    className="w-6 h-6 text-ocean group-hover:translate-x-1 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            </motion.button>

            {/* Friend Button */}
            <motion.button
              onClick={() => onNavigate && onNavigate('your-friend')}
              whileHover={{ scale: 1.02, x: 4 }}
              whileTap={{ scale: 0.98 }}
              className="w-full group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-highlight to-sky opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
              <div className="relative bg-gradient-to-br from-highlight/10 to-sky/20 hover:from-highlight/20 hover:to-sky/30 border-2 border-highlight/30 rounded-2xl p-6 transition-all duration-200">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-highlight to-sky flex items-center justify-center shadow-soft">
                    <span className="text-3xl">👥</span>
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="text-xl font-display font-bold text-navy mb-1 tracking-tight">
                      Talk to your Friend
                    </h3>
                    <p className="text-sm font-light text-navy/70">
                      Connect with your supportive companion
                    </p>
                  </div>
                  <svg
                    className="w-6 h-6 text-highlight group-hover:translate-x-1 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            </motion.button>

            {/* Additional Quick Action */}
            <div className="pt-4">
              <motion.button
                onClick={() => onNavigate && onNavigate('analytics')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-white/80 hover:bg-white border border-ocean/20 rounded-xl p-4 text-center transition-all duration-200 shadow-soft hover:shadow-elevated"
              >
                <span className="text-2xl block mb-1">📊</span>
                <span className="text-sm font-semibold text-navy tracking-tight">View Full Analytics</span>
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* BDI Assessment Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="px-4 py-8 border-t border-navy/10"
      >
        <div className="flex items-start gap-4 mb-6">
          <span className="text-3xl">📋</span>
          <div className="flex-1">
            <h3 className="text-xl font-light text-navy mb-2 tracking-tight">
              Depression Assessment
            </h3>
            <p className="text-navy/60 text-sm font-light leading-relaxed">
              Burns Depression Checklist — Track your mental wellness over time. 
              Takes 5-10 minutes.
            </p>
          </div>
        </div>
        <motion.button
          onClick={() => onNavigate && onNavigate('bdi-assessment')}
          whileHover={{ x: 4 }}
          whileTap={{ scale: 0.99 }}
          className="w-full bg-navy text-white font-normal py-4 px-6 transition-all duration-200 border-l-4 border-ocean hover:border-highlight"
        >
          Start Assessment →
        </motion.button>
      </motion.div>

      {/* Daily Tip Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.5 }}
        className="px-4"
      >
        <div className="card bg-gradient-to-r from-mint/30 to-sky/30 border border-ocean/10">
          <div className="flex items-start gap-4">
            <span className="text-3xl">💭</span>
            <div>
              <h3 className="font-display font-bold text-navy mb-2 tracking-tight">Daily Tip</h3>
              <p className="text-navy/80 text-sm font-light leading-relaxed">
                Taking a moment to check in with your emotions is a powerful act of self-care. 
                Remember, all feelings are valid and temporary.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Home;
