'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './login.module.css';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAccess, setShowAccess] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Simulate auth verification delay
    await new Promise(r => setTimeout(r, 1200));

    if (email === 'admin@hotel.com' && password === 'admin123') {
      setShowAccess(true);
      sessionStorage.setItem('admin_token', 'authenticated');
      setTimeout(() => router.push('/admin'), 800);
    } else {
      setError('ACCESS DENIED — Invalid credentials');
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.scanline} />

      <div className={styles.card}>
        {showAccess ? (
          <div className={styles.accessGranted}>
            <div className={styles.accessIcon}>
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <circle cx="16" cy="16" r="14" stroke="#10b981" strokeWidth="2"/>
                <path d="M10 16L14 20L22 12" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <p className={styles.accessText}>ACCESS GRANTED</p>
            <p className={styles.accessSub}>Redirecting to dashboard...</p>
          </div>
        ) : (
          <>
            <div className={styles.header}>
              <div className={styles.lockIcon}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <rect x="3" y="9" width="14" height="9" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                  <path d="M6 9V6a4 4 0 018 0v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  <circle cx="10" cy="14" r="1.5" fill="currentColor"/>
                </svg>
              </div>
              <h1 className={styles.title}>SECURE ACCESS</h1>
              <p className={styles.subtitle}>Authorization required to proceed</p>
            </div>

            <form onSubmit={handleLogin} className={styles.form}>
              {error && <div className={styles.errorBanner}>{error}</div>}

              <div className={styles.field}>
                <label className={styles.label}>IDENTIFIER</label>
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="admin@hotel.com" className={styles.input} autoFocus />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>PASSPHRASE</label>
                <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="Enter passphrase" className={styles.input} />
              </div>

              <button type="submit" className={styles.loginBtn} disabled={loading}>
                {loading ? (
                  <span className={styles.loadingText}>
                    <span className={styles.dot}>.</span>
                    <span className={styles.dot}>.</span>
                    <span className={styles.dot}>.</span>
                    VERIFYING
                  </span>
                ) : 'AUTHENTICATE'}
              </button>
            </form>

            <div className={styles.footer}>
              <p className={styles.footerText}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1"/>
                  <path d="M6 4v3M6 8.5v0" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
                </svg>
                Encrypted connection secured
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
