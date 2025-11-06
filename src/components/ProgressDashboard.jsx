import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Pie, Line } from 'react-chartjs-2';
import metricsService from '../services/metricsService';
import useDatabase from '../hooks/useDatabase';
import insightsService from '../services/insightsService';
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const ProgressDashboard = ({ user }) => {
  const { getMoodHistory, getAnalytics } = useDatabase(user?.id || 'demo-user');
  
  const [thoughtRecords, setThoughtRecords] = useState([]);
  const [bdiScores, setBdiScores] = useState([]);
  const [moodHistory, setMoodHistory] = useState([]);
  const [realTimeAnalytics, setRealTimeAnalytics] = useState(null);
  const [userAnalytics, setUserAnalytics] = useState(null);
  const [aiInsights, setAiInsights] = useState(null);
  const [stats, setStats] = useState({
    totalThoughts: 0,
    thisWeek: 0,
    mostCommonTrigger: '',
    mostCommonDistortion: '',
    improvementRate: 0,
    exercisesCompleted: 0,
    moodEntries: 0,
    aiInteractions: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load thought records from localStorage
      const records = JSON.parse(localStorage.getItem('thoughtRecords') || '[]');
      setThoughtRecords(records);

      // Load BDI scores from localStorage
      const scores = JSON.parse(localStorage.getItem('bdiScores') || '[]');
      setBdiScores(scores);

      // Load real-time analytics from metricsService
      const analytics = await metricsService.getRealTimeAnalytics('month');
      console.log('📊 Real-time analytics:', analytics);
      setRealTimeAnalytics(analytics);

      // Load user-specific analytics
      let userStats = null;
      if (user?.id) {
        userStats = await metricsService.getUserAnalytics(user.id, 'month');
        console.log('👤 User analytics:', userStats);
        setUserAnalytics(userStats);
      }

      // Load mood history from database
      const moods = await getMoodHistory(30);
      console.log('😊 Mood history:', moods);
      setMoodHistory(moods);

      // Generate AI insights
      const insights = await insightsService.getInsights({
        thoughtRecords: records,
        moodHistory: moods,
        exercisesCompleted: userStats?.exercisesCompleted || 0,
        bdiScores: scores,
        userStats
      });
      console.log('✨ AI Insights:', insights);
      setAiInsights(insights);

      // Calculate stats with real data
      calculateStats(records, analytics, userStats, insights);
    } catch (error) {
      console.error('Error loading analytics data:', error);
      // Fallback to localStorage only
      const records = JSON.parse(localStorage.getItem('thoughtRecords') || '[]');
      setThoughtRecords(records);
      const scores = JSON.parse(localStorage.getItem('bdiScores') || '[]');
      setBdiScores(scores);
      calculateStats(records);
    }
  };

  const calculateStats = (records, analytics, userStats, insights) => {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Filter records from this week
    const thisWeekRecords = records.filter(record => {
      const recordDate = new Date(record.timestamp);
      return recordDate >= oneWeekAgo;
    });

    // Count distortions
    const distortionCounts = {};
    records.forEach(record => {
      if (record.distortions) {
        record.distortions.forEach(d => {
          const type = d.name || d.type;
          distortionCounts[type] = (distortionCounts[type] || 0) + 1;
        });
      }
    });

    // Find most common distortion
    const mostCommon = Object.entries(distortionCounts).sort((a, b) => b[1] - a[1])[0];

    // Calculate improvement (reduction in distortions over time)
    const firstHalf = records.slice(0, Math.floor(records.length / 2));
    const secondHalf = records.slice(Math.floor(records.length / 2));
    
    const firstHalfAvg = firstHalf.reduce((sum, r) => sum + (r.distortions?.length || 0), 0) / (firstHalf.length || 1);
    const secondHalfAvg = secondHalf.reduce((sum, r) => sum + (r.distortions?.length || 0), 0) / (secondHalf.length || 1);
    
    const improvement = firstHalfAvg > 0 ? ((firstHalfAvg - secondHalfAvg) / firstHalfAvg) * 100 : 0;

    const calculatedStats = {
      totalThoughts: records.length,
      thisWeek: thisWeekRecords.length,
      mostCommonTrigger: insights?.mostCommonTrigger || 'Getting started',
      mostCommonDistortion: mostCommon ? mostCommon[0] : 'None',
      improvementRate: Math.max(0, Math.round(improvement)),
      exercisesCompleted: userStats?.exercisesCompleted || analytics?.completedExercises || 0,
      moodEntries: userStats?.moodEntries || moodHistory.length || 0,
      aiInteractions: userStats?.aiInteractions || 0
    };

    console.log('📈 Calculated stats:', calculatedStats);
    console.log('  - userStats.exercisesCompleted:', userStats?.exercisesCompleted);
    console.log('  - analytics.completedExercises:', analytics?.completedExercises);
    console.log('  - moodHistory.length:', moodHistory.length);
    console.log('  - AI-generated trigger:', insights?.mostCommonTrigger);

    setStats(calculatedStats);
  };

  // Prepare distortion frequency data for pie chart
  const getDistortionData = () => {
    const distortionCounts = {};
    thoughtRecords.forEach(record => {
      if (record.distortions) {
        record.distortions.forEach(d => {
          const type = d.name || d.type;
          distortionCounts[type] = (distortionCounts[type] || 0) + 1;
        });
      }
    });

    const labels = Object.keys(distortionCounts);
    const data = Object.values(distortionCounts);
    const total = data.reduce((sum, val) => sum + val, 0);
    const percentages = data.map(val => Math.round((val / total) * 100));

    return {
      labels: labels.map((label, i) => `${label} (${percentages[i]}%)`),
      datasets: [{
        data: data,
        backgroundColor: [
          '#ef4444', // red
          '#f97316', // orange
          '#eab308', // yellow
          '#22c55e', // green
          '#3b82f6', // blue
          '#a855f7', // purple
          '#ec4899', // pink
          '#6366f1', // indigo
          '#f43f5e', // rose
          '#14b8a6', // teal
        ],
        borderColor: '#fff',
        borderWidth: 2
      }]
    };
  };

  // Prepare BDI score data for line chart
  const getBdiData = () => {
    const labels = bdiScores.map((score, i) => `Week ${i + 1}`);
    const data = bdiScores.map(score => score.value);

    return {
      labels,
      datasets: [{
        label: 'BDI Score',
        data: data,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointBackgroundColor: '#3b82f6',
        pointBorderColor: '#fff',
        pointBorderWidth: 2
      }]
    };
  };

  // Generate therapy insights based on data
  const getInsights = () => {
    const insights = [];

    if (thoughtRecords.length >= 5) {
      insights.push({
        icon: '📈',
        text: 'Your mood improves on days you complete exercises',
        type: 'positive'
      });
    }

    if (stats.improvementRate > 0) {
      insights.push({
        icon: '🎯',
        text: `You've reduced cognitive distortions by ${stats.improvementRate}%`,
        type: 'positive'
      });
    }

    if (stats.thisWeek >= 3) {
      insights.push({
        icon: '🔥',
        text: `Great consistency! ${stats.thisWeek} thoughts challenged this week`,
        type: 'positive'
      });
    }

    if (bdiScores.length >= 2) {
      const firstScore = bdiScores[0].value;
      const lastScore = bdiScores[bdiScores.length - 1].value;
      const improvement = firstScore - lastScore;
      
      if (improvement > 0) {
        insights.push({
          icon: '✨',
          text: `BDI score improved from ${firstScore} → ${lastScore} in ${bdiScores.length} weeks`,
          type: 'positive'
        });
      }
    }

    if (stats.mostCommonDistortion && stats.mostCommonDistortion !== 'None') {
      insights.push({
        icon: '💡',
        text: `Focus area: Work on reducing "${stats.mostCommonDistortion}" patterns`,
        type: 'info'
      });
    }

    if (thoughtRecords.length === 0) {
      insights.push({
        icon: '🌱',
        text: 'Start your journey by recording your first thought!',
        type: 'info'
      });
    }

    return insights;
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 15,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: {
          size: 14
        },
        bodyFont: {
          size: 13
        }
      }
    }
  };

  const lineChartOptions = {
    ...chartOptions,
    scales: {
      y: {
        beginAtZero: true,
        max: 63, // BDI max score
        ticks: {
          stepSize: 10
        },
        title: {
          display: true,
          text: 'BDI Score',
          font: {
            size: 12
          }
        }
      },
      x: {
        title: {
          display: true,
          text: 'Time Period',
          font: {
            size: 12
          }
        }
      }
    }
  };

  const insights = getInsights();

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky/20 via-white to-ocean/20 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-light text-navy mb-2">Progress Dashboard</h1>
          <p className="text-navy/60 text-sm">Track your mental wellness journey</p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/80 backdrop-blur-sm border border-navy/20 p-6 rounded-lg"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">📝</span>
              <span className="text-3xl font-light text-navy">{stats.totalThoughts}</span>
            </div>
            <p className="text-sm text-navy/60">Total Thoughts Recorded</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/80 backdrop-blur-sm border border-navy/20 p-6 rounded-lg"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">🔥</span>
              <span className="text-3xl font-light text-navy">{stats.thisWeek}</span>
            </div>
            <p className="text-sm text-navy/60">Thoughts This Week</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/80 backdrop-blur-sm border border-navy/20 p-6 rounded-lg"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">📈</span>
              <span className="text-3xl font-light text-navy">{stats.improvementRate}%</span>
            </div>
            <p className="text-sm text-navy/60">Improvement Rate</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/80 backdrop-blur-sm border border-navy/20 p-6 rounded-lg"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">🎯</span>
              <span className="text-sm font-normal text-navy truncate">{stats.mostCommonTrigger}</span>
            </div>
            <p className="text-sm text-navy/60">Most Common Trigger</p>
          </motion.div>
        </div>

        {/* Current Session Info */}
        {realTimeAnalytics?.currentSession && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 p-6 rounded-lg mb-8"
          >
            <h2 className="text-lg font-medium text-navy mb-3 flex items-center gap-2">
              <span>⏱️</span>
              Current Session
            </h2>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-navy/60">Duration</p>
                <p className="text-navy font-medium">
                  {Math.floor(realTimeAnalytics.currentSession.duration / 60000)} min
                </p>
              </div>
              <div>
                <p className="text-navy/60">Features Used</p>
                <p className="text-navy font-medium">{realTimeAnalytics.currentSession.featuresUsed}</p>
              </div>
              <div>
                <p className="text-navy/60">Events Tracked</p>
                <p className="text-navy font-medium">{realTimeAnalytics.currentSession.events}</p>
              </div>
            </div>
            <p className="text-xs text-navy/50 mt-3">
              💡 Your activity is being tracked in real-time. Complete exercises and log moods to see your progress!
            </p>
          </motion.div>
        )}

        {/* Real-time Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 p-6 rounded-lg"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">💪</span>
              <span className="text-3xl font-light text-navy">{stats.exercisesCompleted}</span>
            </div>
            <p className="text-sm text-navy/60">Exercises Completed</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 p-6 rounded-lg"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">😊</span>
              <span className="text-3xl font-light text-navy">{stats.moodEntries}</span>
            </div>
            <p className="text-sm text-navy/60">Mood Entries</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 p-6 rounded-lg"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">🤖</span>
              <span className="text-3xl font-light text-navy">{stats.aiInteractions}</span>
            </div>
            <p className="text-sm text-navy/60">AI Interactions</p>
          </motion.div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Distortion Frequency Pie Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white/80 backdrop-blur-sm border border-navy/20 p-6 rounded-lg"
          >
            <h2 className="text-xl font-light text-navy mb-4 flex items-center gap-2">
              <span>📊</span>
              Distortion Frequency
            </h2>
            {thoughtRecords.length > 0 ? (
              <div className="h-80">
                <Pie data={getDistortionData()} options={chartOptions} />
              </div>
            ) : (
              <div className="h-80 flex items-center justify-center text-navy/40">
                <div className="text-center">
                  <p className="text-4xl mb-2">📊</p>
                  <p>No data yet. Start recording thoughts!</p>
                </div>
              </div>
            )}
          </motion.div>

          {/* BDI Score Trend Line Chart */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white/80 backdrop-blur-sm border border-navy/20 p-6 rounded-lg"
          >
            <h2 className="text-xl font-light text-navy mb-4 flex items-center gap-2">
              <span>📈</span>
              BDI Score Trend
            </h2>
            {bdiScores.length > 0 ? (
              <div className="h-80">
                <Line data={getBdiData()} options={lineChartOptions} />
              </div>
            ) : (
              <div className="h-80 flex items-center justify-center text-navy/40">
                <div className="text-center">
                  <p className="text-4xl mb-2">📈</p>
                  <p>No BDI scores recorded yet</p>
                  <button className="mt-4 text-sm text-ocean hover:underline">
                    Take BDI Assessment →
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* AI-Powered Therapy Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 p-6 rounded-lg mb-8"
        >
          <h2 className="text-xl font-light text-navy mb-4 flex items-center gap-2">
            <span>✨</span>
            AI-Powered Insights
          </h2>
          {aiInsights ? (
            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 }}
                className="bg-white/60 p-4 rounded-lg"
              >
                <p className="text-sm text-navy/60 mb-1">Progress Summary</p>
                <p className="text-navy">{aiInsights.progressSummary}</p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9 }}
                className="bg-white/60 p-4 rounded-lg"
              >
                <p className="text-sm text-navy/60 mb-1">Primary Pattern</p>
                <p className="text-navy font-medium">{aiInsights.primaryPattern}</p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.0 }}
                className="bg-gradient-to-r from-ocean/10 to-purple-100 p-4 rounded-lg border border-ocean/20"
              >
                <p className="text-sm text-navy/60 mb-1">💡 Recommendation</p>
                <p className="text-navy font-medium">{aiInsights.recommendation}</p>
              </motion.div>
              
              <p className="text-xs text-navy/40 mt-3">
                Generated by AI • Updated {new Date(aiInsights.generatedAt).toLocaleTimeString()}
              </p>
            </div>
          ) : (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <p className="text-4xl mb-2">🌱</p>
                <p className="text-navy/60">Generating personalized insights...</p>
              </div>
            </div>
          )}
        </motion.div>

        {/* Thought Record Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="bg-white/80 backdrop-blur-sm border border-navy/20 p-6 rounded-lg"
        >
          <h2 className="text-xl font-light text-navy mb-4 flex items-center gap-2">
            <span>📋</span>
            Detailed Statistics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-normal text-navy/60 mb-2">Most Common Distortion</h3>
              <p className="text-lg text-navy">{stats.mostCommonDistortion}</p>
            </div>
            <div>
              <h3 className="text-sm font-normal text-navy/60 mb-2">Primary Trigger</h3>
              <p className="text-lg text-navy">{stats.mostCommonTrigger}</p>
            </div>
            <div>
              <h3 className="text-sm font-normal text-navy/60 mb-2">Weekly Average</h3>
              <p className="text-lg text-navy">{(stats.thisWeek / 1).toFixed(1)} thoughts/week</p>
            </div>
            <div>
              <h3 className="text-sm font-normal text-navy/60 mb-2">Completion Rate</h3>
              <p className="text-lg text-navy">
                {thoughtRecords.length > 0 ? '100%' : '0%'}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProgressDashboard;
