'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

const TEST_BILLS = ['BILL-2026-001', 'BILL-2026-002', 'BILL-2026-003', 'BILL-2026-005'];

export default function HomePage() {
  const [billNumber, setBillNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!billNumber.trim()) { setError('Please enter your bill number'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/feedback/validate-bill?billNumber=${encodeURIComponent(billNumber.trim())}`);
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Invalid bill number'); setLoading(false); return; }
      router.push(`/feedback/${data.billId}`);
    } catch {
      setError('Connection error. Please try again.');
      setLoading(false);
    }
  };

  return (
    <main className={styles.main}>
      {/* Background watermark */}
      <div className={styles.watermark}>FEEDBACK</div>

      <div className={styles.content}>
        {/* Logo */}
        <div className={styles.logo}>
          <svg width="36" height="36" viewBox="0 0 40 40" fill="none">
            <path d="M20 4L36 12V28L20 36L4 28V12L20 4Z" stroke="rgba(255,255,255,0.7)" strokeWidth="2" fill="none"/>
            <path d="M20 16L24 18V22L20 24L16 22V18L20 16Z" fill="rgba(255,255,255,0.7)"/>
          </svg>
        </div>

        {/* Card */}
        <div className={styles.card}>
          <p className={styles.stepLabel}>GUEST FEEDBACK</p>
          <div className={styles.progressTrack}>
            <div className={styles.progressFill} style={{ width: '0%' }} />
          </div>

          <h1 className={styles.title}>SHARE YOUR EXPERIENCE</h1>
          <p className={styles.desc}>Enter your bill number to begin your personalized feedback form.</p>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.inputWrapper}>
              <input
                type="text"
                value={billNumber}
                onChange={(e) => { setBillNumber(e.target.value.toUpperCase()); setError(''); }}
                placeholder="BILL-2026-XXXX"
                className={styles.input}
                autoFocus
              />
            </div>
            {error && <p className={styles.error}>{error}</p>}

            <button type="submit" className={styles.submitBtn} disabled={loading || !billNumber.trim()}>
              {loading ? <span className={styles.loader}/> : (
                <>
                  Start Feedback
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path d="M4 9H14M10 5L14 9L10 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </>
              )}
            </button>
          </form>

          <div className={styles.testSection}>
            <p className={styles.testLabel}>Try a demo bill</p>
            <div className={styles.chips}>
              {TEST_BILLS.map(b => (
                <button key={b} className={styles.chip} onClick={() => setBillNumber(b)}>{b}</button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
