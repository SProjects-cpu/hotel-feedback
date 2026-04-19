'use client';
import { useRouter } from 'next/navigation';
import styles from './thankyou.module.css';

export default function ThankYouPage() {
  const router = useRouter();
  return (
    <main className={styles.main}>
      <div className={styles.content}>
        <div className={styles.checkCircle}>
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="24" r="22" stroke="var(--success)" strokeWidth="2.5" opacity="0.3"/>
            <circle cx="24" cy="24" r="22" stroke="var(--success)" strokeWidth="2.5"
              strokeDasharray="138" strokeDashoffset="138" className={styles.circleAnim}/>
            <path d="M15 24L21 30L33 18" stroke="var(--success)" strokeWidth="2.5"
              strokeLinecap="round" strokeLinejoin="round"
              strokeDasharray="30" strokeDashoffset="30" className={styles.checkAnim}/>
          </svg>
        </div>
        <h1 className={styles.title}>Thank You</h1>
        <p className={styles.message}>Your feedback has been submitted successfully. Your input helps us serve you better.</p>
        <button onClick={() => router.push('/')} className={styles.homeBtn}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M6 4L2 8L6 12M2 8H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back to Home
        </button>
      </div>
    </main>
  );
}
