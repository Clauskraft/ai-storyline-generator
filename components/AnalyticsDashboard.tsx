import React, { useState, useEffect } from 'react';
import { analyticsService } from '../services/analyticsService';

interface AnalyticsDashboardProps {
  presentationId?: string;
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ presentationId }) => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
    const interval = setInterval(loadStats, 30000); // Update every 30s
    return () => clearInterval(interval);
  }, []);

  const loadStats = () => {
    const summary = analyticsService.getSummary();
    setStats(summary);
    setLoading(false);
  };

  if (loading) {
    return <div className="text-center text-gray-400">Loading analytics...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-sm text-gray-400 mb-2">Total Events</h3>
          <p className="text-3xl font-bold text-white">{stats?.totalEvents || 0}</p>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-sm text-gray-400 mb-2">Session Duration</h3>
          <p className="text-3xl font-bold text-white">
            {stats?.sessionDuration ? Math.round(stats.sessionDuration / 1000 / 60) : 0}m
          </p>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-sm text-gray-400 mb-2">Recent Activity</h3>
          <p className="text-3xl font-bold text-white">{stats?.recentEvents?.length || 0}</p>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-bold mb-4">Recent Events</h3>
        <div className="space-y-2">
          {stats?.recentEvents?.slice().reverse().map((event: any, index: number) => (
            <div key={index} className="flex justify-between items-center text-sm">
              <span className="text-gray-300">{event.event}</span>
              <span className="text-gray-500">
                {event.timestamp ? new Date(event.timestamp).toLocaleTimeString() : ''}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;

