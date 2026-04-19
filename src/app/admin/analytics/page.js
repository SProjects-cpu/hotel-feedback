'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import styles from './analytics.module.css';

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!sessionStorage.getItem('admin_token')) { router.push('/admin/login'); return; }
    fetch('/api/admin/analytics')
      .then(r => r.json())
      .then(data => { setAnalytics(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const getScoreColor = (s) => s >= 3.5 ? '#10b981' : s >= 2.5 ? '#3b82f6' : s >= 1.5 ? '#f59e0b' : '#ef4444';

  if (loading) return <div className={styles.loading}>Loading analytics...</div>;

  const chartData = (analytics?.categoryAverages || []).map(cat => ({
    name: cat.name.length > 12 ? cat.name.substring(0, 12) + '...' : cat.name,
    fullName: cat.name,
    score: cat.average,
  }));

  const guestTypeData = Object.entries(analytics?.guestTypeDistribution || {}).map(([type, count]) => ({ type, count }));

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1>Analytics</h1>
        <p>Detailed performance breakdown</p>
      </div>

      <div className={styles.overallCard}>
        <div className={styles.overallLabel}>Overall Satisfaction</div>
        <div className={styles.overallScore} style={{ color: getScoreColor(analytics?.overallAverage) }}>
          {analytics?.overallAverage || 0}
          <span className={styles.overallMax}>/4.0</span>
        </div>
        <div className={styles.overallPct}>{analytics?.overallPercentage || 0}% positive feedback</div>
      </div>

      <div className={styles.chartsGrid}>
        <div className={styles.chartCard}>
          <h2>Category Scores</h2>
          <div className={styles.chartArea}>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e8ecf1" vertical={false}/>
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false}/>
                  <YAxis domain={[0, 4]} stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false}/>
                  <Tooltip cursor={{ fill: 'rgba(0,0,0,0.03)' }}
                    contentStyle={{ background: '#fff', border: '1px solid #e8ecf1', borderRadius: '8px', fontSize: '13px' }}
                    formatter={(v, n, p) => [`${v}/4`, p.payload.fullName]}/>
                  <Bar dataKey="score" radius={[4,4,0,0]}>
                    {chartData.map((e, i) => <Cell key={i} fill={getScoreColor(e.score)}/>)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : <div className={styles.empty}>No data yet</div>}
          </div>
        </div>

        <div className={styles.chartCard}>
          <h2>Guest Distribution</h2>
          <div className={styles.distList}>
            {guestTypeData.length > 0 ? guestTypeData.map((item, idx) => (
              <div key={idx} className={styles.distRow}>
                <span className={styles.distLabel}>{item.type}</span>
                <div className={styles.distBar}>
                  <div className={styles.distFill} style={{ width: `${(item.count / (analytics?.totalResponses || 1)) * 100}%` }}/>
                </div>
                <span className={styles.distCount}>{item.count}</span>
              </div>
            )) : <div className={styles.empty}>No data yet</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
