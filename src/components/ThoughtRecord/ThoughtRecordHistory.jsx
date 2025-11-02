import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ThoughtRecordEntry from './ThoughtRecordEntry';
import { getThoughtRecords, deleteThoughtRecord, getThoughtRecordStats } from '../../services/distortionDetection';
import { getDistortionById } from '../../utils/cognitiveDistortions';

const ThoughtRecordHistory = () => {
  const [records, setRecords] = useState([]);
  const [stats, setStats] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'week', 'month'

  useEffect(() => {
    loadRecords();
  }, [filter]);

  const loadRecords = () => {
    const allRecords = getThoughtRecords();
    const statistics = getThoughtRecordStats();
    
    // Filter by date
    let filtered = allRecords;
    if (filter === 'week') {
      const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
      filtered = allRecords.filter(r => r.createdAt > weekAgo);
    } else if (filter === 'month') {
      const monthAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
      filtered = allRecords.filter(r => r.createdAt > monthAgo);
    }
    
    setRecords(filtered);
    setStats(statistics);
  };

  const handleDelete = (recordId) => {
    if (window.confirm('Are you sure you want to delete this thought record?')) {
      deleteThoughtRecord(recordId);
      loadRecords();
    }
  };

  const getMostCommonDistortionName = () => {
    if (!stats || !stats.mostCommonDistortion) return 'None yet';
    const distortion = getDistortionById(stats.mostCommonDistortion);
    return distortion ? distortion.name : stats.mostCommonDistortion;
  };

  return (
    <div className="space-y-6">
      {/* Statistics */}
      {stats && stats.totalRecords > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/60 border-l-4 border-ocean p-6"
        >
          <h3 className="text-xl font-light text-navy mb-4">Your Progress</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="text-3xl font-light text-navy mb-1">
                {stats.totalRecords}
              </div>
              <div className="text-sm text-navy/60 font-light tracking-wider uppercase">
                Total Entries
              </div>
            </div>
            <div>
              <div className="text-3xl font-light text-navy mb-1">
                {Object.keys(stats.distortionCounts).length}
              </div>
              <div className="text-sm text-navy/60 font-light tracking-wider uppercase">
                Distortion Types Found
              </div>
            </div>
            <div>
              <div className="text-lg font-light text-navy mb-1">
                {getMostCommonDistortionName()}
              </div>
              <div className="text-sm text-navy/60 font-light tracking-wider uppercase">
                Most Common Pattern
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Filter buttons */}
      <div className="flex gap-3">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 text-sm font-normal transition-all ${
            filter === 'all'
              ? 'bg-navy text-white'
              : 'bg-white/60 text-navy/60 hover:bg-white'
          }`}
        >
          All Time
        </button>
        <button
          onClick={() => setFilter('week')}
          className={`px-4 py-2 text-sm font-normal transition-all ${
            filter === 'week'
              ? 'bg-navy text-white'
              : 'bg-white/60 text-navy/60 hover:bg-white'
          }`}
        >
          Past Week
        </button>
        <button
          onClick={() => setFilter('month')}
          className={`px-4 py-2 text-sm font-normal transition-all ${
            filter === 'month'
              ? 'bg-navy text-white'
              : 'bg-white/60 text-navy/60 hover:bg-white'
          }`}
        >
          Past Month
        </button>
      </div>

      {/* Records list */}
      <div>
        <h3 className="text-2xl font-light text-navy mb-4">
          {filter === 'all' ? 'All Entries' : filter === 'week' ? 'This Week' : 'This Month'}
        </h3>
        
        {records.length === 0 ? (
          <div className="bg-white/40 border-l-4 border-navy/10 p-8 text-center">
            <p className="text-navy/60 font-light">
              No thought records yet. Start by creating your first entry above!
            </p>
          </div>
        ) : (
          <AnimatePresence>
            {records.map(record => (
              <ThoughtRecordEntry
                key={record.id}
                record={record}
                onDelete={handleDelete}
              />
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default ThoughtRecordHistory;
