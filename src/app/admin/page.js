'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './dashboard.module.css';

function StatIcon({ type }) {
  const icons = {
    responses: <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="currentColor" strokeWidth="1.5" fill="none"/>,
    rate: <><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" fill="none"/><path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></>,
    score: <path d="M12 2L15 8.5L22 9.3L17 14L18.2 21L12 17.8L5.8 21L7 14L2 9.3L9 8.5L12 2Z" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinejoin="round"/>,
    pending: <><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M14.24 14.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M14.24 9.76l2.83-2.83" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></>,
  };
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none">{icons[type]}</svg>;
}

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!sessionStorage.getItem('admin_token')) { router.push('/admin/login'); return; }
    Promise.all([
      fetch('/api/admin/analytics').then(r => r.json()),
      fetch('/api/admin/responses').then(r => r.json()),
    ]).then(([a, r]) => {
      setAnalytics(a);
      setResponses(r.responses || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const getScoreColor = (s) => s >= 3.5 ? 'var(--score-excellent)' : s >= 2.5 ? 'var(--score-good)' : s >= 1.5 ? 'var(--score-average)' : 'var(--score-poor)';
  const getScoreLabel = (s) => s >= 3.5 ? 'Excellent' : s >= 2.5 ? 'Good' : s >= 1.5 ? 'Average' : 'Poor';

  if (loading) return <div className={styles.page}><div className={styles.loadingGrid}>{[...Array(4)].map((_,i)=><div key={i} className={styles.skeleton}/>)}</div></div>;

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1>Dashboard</h1>
        <p>Overview of guest feedback and satisfaction metrics</p>
      </div>

      <div className={styles.statsGrid}>
        {[
          { label: 'Total Responses', value: analytics?.totalResponses || 0, icon: 'responses', color: '#3b82f6' },
          { label: 'Response Rate', value: `${analytics?.responseRate || 0}%`, icon: 'rate', color: '#10b981' },
          { label: 'Overall Score', value: analytics?.overallAverage || 0, icon: 'score', color: '#f59e0b' },
          { label: 'Pending Feedback', value: analytics?.pendingFeedback || 0, icon: 'pending', color: '#8b5cf6' },
        ].map((stat, i) => (
          <div key={i} className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: `${stat.color}12`, color: stat.color }}>
              <StatIcon type={stat.icon} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>{stat.value}</span>
              <span className={styles.statLabel}>{stat.label}</span>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.gridRow}>
        {/* Category Performance */}
        <div className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <h2>Category Performance</h2>
            <Link href="/admin/analytics" className={styles.viewAll}>View all</Link>
          </div>
          <div className={styles.categoryList}>
            {(analytics?.categoryAverages || []).map((cat) => (
              <div key={cat.slug} className={styles.categoryRow}>
                <span className={styles.catName}>{cat.name}</span>
                <div className={styles.catBar}>
                  <div className={styles.catBarFill} style={{ width: `${cat.percentage}%`, background: getScoreColor(cat.average) }}/>
                </div>
                <span className={styles.catScore} style={{ color: getScoreColor(cat.average) }}>{cat.average}</span>
              </div>
            ))}
            {(!analytics?.categoryAverages || analytics.categoryAverages.length === 0) && (
              <p className={styles.empty}>No data yet</p>
            )}
          </div>
        </div>

        {/* Recent Responses */}
        <div className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <h2>Recent Responses</h2>
            <Link href="/admin/responses" className={styles.viewAll}>View all</Link>
          </div>
          <div className={styles.responseList}>
            {responses.slice(0, 5).map((resp) => (
              <Link key={resp.id} href={`/admin/responses/${resp.id}`} className={styles.responseRow}>
                <div className={styles.respAvatar}>{(resp.bill?.customer_name || 'G')[0]}</div>
                <div className={styles.respInfo}>
                  <span className={styles.respName}>{resp.bill?.customer_name || 'Guest'}</span>
                  <span className={styles.respMeta}>{resp.bill?.bill_number} · {resp.guest_type || 'Unknown'}</span>
                </div>
                <span className={styles.respDate}>
                  {new Date(resp.submitted_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                </span>
              </Link>
            ))}
            {responses.length === 0 && <p className={styles.empty}>No responses yet</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
