'use client';
import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './response-detail.module.css';

export default function ResponseDetailPage({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionStorage.getItem('admin_token')) { router.push('/admin/login'); return; }
    fetch('/api/admin/responses')
      .then(r => r.json())
      .then(data => {
        const resp = (data.responses || []).find(r => r.id === id);
        setResponse(resp || null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const getAnswerColor = (answer) => {
    const excellent = ['Excellent','Very Satisfied','Very Smooth','Very Fast','Very Fresh','Very Easy','Fully','Definitely','None','Well Trained','Easily Available','Always Available','Immediately','Very Satisfactory','Very Clear','Very Short','Fully Resolved','Perfect','Fully Available','No improvement needed'];
    const good = ['Good','Satisfied','Smooth','Fast','Fresh','Easy','Probably','Short','Clear','Mostly Available','Few Hours','Satisfactory','Moderately Trained','Available with Delay','Partial','Yes'];
    const avg = ['Average','Neutral','Moderate','Partially','Not Sure','Acceptable','Occasionally','Limited','Confusing','Less','Minor'];
    if (excellent.includes(answer)) return 'var(--score-excellent)';
    if (good.includes(answer)) return 'var(--score-good)';
    if (avg.includes(answer)) return 'var(--score-average)';
    return 'var(--score-poor)';
  };

  if (loading) return <div className={styles.loading}>Loading...</div>;
  if (!response) return <div className={styles.loading}><p>Response not found</p><Link href="/admin/responses">Back</Link></div>;

  return (
    <div className={styles.page}>
      <Link href="/admin/responses" className={styles.backLink}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 3L5 7L9 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        Back to Responses
      </Link>

      <div className={styles.header}>
        <h1>Feedback Details</h1>
        <span className={styles.date}>{new Date(response.submitted_at).toLocaleString('en-IN')}</span>
      </div>

      <div className={styles.guestCard}>
        <div className={styles.guestAvatar}>{(response.bill?.customer_name || 'G')[0]}</div>
        <div className={styles.guestInfo}>
          <h2>{response.bill?.customer_name}</h2>
          <div className={styles.tags}>
            <span className={styles.tag}>{response.bill?.bill_number}</span>
            {response.guest_type && <span className={styles.tag}>{response.guest_type}</span>}
            {response.visit_purpose && <span className={styles.tag}>{response.visit_purpose}</span>}
            {response.stay_duration && <span className={styles.tag}>{response.stay_duration}</span>}
          </div>
        </div>
      </div>

      <div className={styles.answersGrid}>
        {Object.entries(response.categoryAnswers).map(([slug, cat]) => (
          <div key={slug} className={styles.catSection}>
            <h3 className={styles.catTitle}>{cat.name}</h3>
            <div className={styles.answersList}>
              {cat.answers.map((ans, idx) => (
                <div key={idx} className={styles.answerRow}>
                  <span className={styles.qText}><span className={styles.qNum}>{ans.sr_no}.</span> {ans.question}</span>
                  <span className={styles.answerBadge} style={{ color: getAnswerColor(ans.answer), borderColor: getAnswerColor(ans.answer), background: `color-mix(in srgb, ${getAnswerColor(ans.answer)} 8%, transparent)` }}>
                    {ans.answer}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
