'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

export default function HomePage() {
  const [useBillId, setUseBillId] = useState(false);
  const [billNumber, setBillNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [services, setServices] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/feedback/services')
      .then(r => r.json())
      .then(data => setServices(data.services || []))
      .catch(() => {});
  }, []);

  const toggleService = (name) => {
    setSelectedServices(prev =>
      prev.includes(name) ? prev.filter(s => s !== name) : [...prev, name]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (useBillId && billNumber.trim()) {
      // Bill-based flow
      try {
        const res = await fetch(`/api/feedback/validate-bill?billNumber=${encodeURIComponent(billNumber.trim())}`);
        const data = await res.json();
        if (!res.ok) { setError(data.error || 'Invalid bill number'); setLoading(false); return; }
        router.push(`/feedback/${data.billId}`);
      } catch {
        setError('Connection error. Please try again.');
        setLoading(false);
      }
    } else {
      // Guest mode — pass selected categories via query params
      const params = new URLSearchParams();
      if (selectedServices.length > 0) {
        params.set('services', selectedServices.join(','));
      }
      router.push(`/feedback/guest${params.toString() ? '?' + params.toString() : ''}`);
    }
  };

  return (
    <main className={styles.main}>
      <div className={styles.watermark}>FEEDBACK</div>

      <div className={styles.content}>
        {/* Logo */}
        <div className={styles.logo}>
          <svg width="36" height="36" viewBox="0 0 40 40" fill="none">
            <path d="M20 4L36 12V28L20 36L4 28V12L20 4Z" stroke="rgba(255,255,255,0.7)" strokeWidth="2" fill="none"/>
            <path d="M20 16L24 18V22L20 24L16 22V18L20 16Z" fill="rgba(255,255,255,0.7)"/>
          </svg>
        </div>

        <div className={styles.card}>
          <p className={styles.stepLabel}>GUEST FEEDBACK</p>
          <div className={styles.progressTrack}>
            <div className={styles.progressFill} style={{ width: '0%' }} />
          </div>

          <h1 className={styles.title}>SHARE YOUR EXPERIENCE</h1>
          <p className={styles.desc}>Select the services you used and share your feedback. All fields are optional.</p>

          <form onSubmit={handleSubmit} className={styles.form}>
            {/* Bill ID Checkbox */}
            <label className={styles.checkboxRow}>
              <input
                type="checkbox"
                checked={useBillId}
                onChange={() => { setUseBillId(!useBillId); setError(''); }}
                className={styles.checkbox}
              />
              <span>I have a Bill ID</span>
            </label>

            {/* Bill Number Input (conditional) */}
            {useBillId && (
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
            )}

            {/* Category Selection (when no bill) */}
            {!useBillId && (
              <div className={styles.categorySection}>
                <p className={styles.catLabel}>SELECT SERVICES YOU USED</p>
                <p className={styles.catHint}>Optional — leave empty to see all categories</p>
                <div className={styles.chips}>
                  {services.map(svc => (
                    <button
                      key={svc.name}
                      type="button"
                      className={`${styles.chip} ${selectedServices.includes(svc.name) ? styles.chipActive : ''}`}
                      onClick={() => toggleService(svc.name)}
                    >
                      {svc.display_name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {error && <p className={styles.error}>{error}</p>}

            <button type="submit" className={styles.submitBtn} disabled={loading || (useBillId && !billNumber.trim())}>
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

          {/* Demo bills section only when bill mode is on */}
          {useBillId && (
            <div className={styles.testSection}>
              <p className={styles.testLabel}>Try a demo bill</p>
              <div className={styles.chips}>
                {['BILL-2026-001', 'BILL-2026-002', 'BILL-2026-003'].map(b => (
                  <button key={b} className={styles.chip} onClick={() => setBillNumber(b)}>{b}</button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
