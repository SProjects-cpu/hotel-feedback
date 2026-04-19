'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './responses.module.css';

export default function ResponsesPage() {
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const router = useRouter();

  useEffect(() => {
    if (!sessionStorage.getItem('admin_token')) { router.push('/admin/login'); return; }
    fetch('/api/admin/responses')
      .then(r => r.json())
      .then(data => { setResponses(data.responses || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = filter === 'all' ? responses : responses.filter(r => r.guest_type === filter);
  const guestTypes = [...new Set(responses.map(r => r.guest_type).filter(Boolean))];

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1>Responses</h1>
        <p>{responses.length} total responses received</p>
      </div>

      <div className={styles.filters}>
        <button className={`${styles.filterBtn} ${filter === 'all' ? styles.filterActive : ''}`} onClick={() => setFilter('all')}>All ({responses.length})</button>
        {guestTypes.map(type => (
          <button key={type} className={`${styles.filterBtn} ${filter === type ? styles.filterActive : ''}`} onClick={() => setFilter(type)}>
            {type} ({responses.filter(r => r.guest_type === type).length})
          </button>
        ))}
      </div>

      <div className={styles.tableCard}>
        {loading ? (
          <div className={styles.loadingList}>{[...Array(5)].map((_, i) => <div key={i} className={styles.skeleton} />)}</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Guest</th>
                <th>Bill Number</th>
                <th>Type</th>
                <th>Purpose</th>
                <th>Submitted</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(resp => (
                <tr key={resp.id}>
                  <td>
                    <div className={styles.guestCell}>
                      <div className={styles.avatar}>{(resp.bill?.customer_name || 'G')[0]}</div>
                      <span>{resp.bill?.customer_name || 'Guest'}</span>
                    </div>
                  </td>
                  <td><code className={styles.code}>{resp.bill?.bill_number}</code></td>
                  <td>{resp.guest_type || '—'}</td>
                  <td>{resp.visit_purpose || '—'}</td>
                  <td>{new Date(resp.submitted_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                  <td><Link href={`/admin/responses/${resp.id}`} className={styles.viewBtn}>View</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!loading && filtered.length === 0 && <div className={styles.empty}>No responses found</div>}
      </div>
    </div>
  );
}
