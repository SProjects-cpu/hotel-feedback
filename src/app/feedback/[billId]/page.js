'use client';
import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import styles from './feedback.module.css';

export default function FeedbackPage({ params }) {
  const { billId } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [bill, setBill] = useState(null);
  const [categories, setCategories] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [direction, setDirection] = useState('next');

  useEffect(() => {
    loadForm();
  }, [billId]);

  const loadForm = async () => {
    try {
      const res = await fetch(`/api/feedback/load-form?billId=${billId}`);
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Failed to load form'); setLoading(false); return; }
      setBill(data.bill);
      setCategories(data.categories);
      setLoading(false);
    } catch {
      setError('Failed to load form. Please try again.');
      setLoading(false);
    }
  };

  const currentCategory = categories[currentStep];
  const totalSteps = categories.length;
  const progress = totalSteps > 0 ? ((currentStep + 1) / totalSteps) * 100 : 0;

  const setAnswer = (questionId, value) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const isCurrentStepComplete = () => {
    if (!currentCategory) return false;
    return currentCategory.questions.every(q => !q.is_required || answers[q.id]);
  };

  const goNext = () => {
    if (currentStep < totalSteps - 1) {
      setDirection('next');
      setCurrentStep(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const goPrev = () => {
    if (currentStep > 0) {
      setDirection('prev');
      setCurrentStep(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const guestCat = categories.find(c => c.slug === 'guest_categorization');
      let guestType = null, visitPurpose = null, stayDuration = null;
      if (guestCat) {
        guestCat.questions.forEach(q => {
          const ans = answers[q.id];
          if (q.sr_no === 1) guestType = ans;
          if (q.sr_no === 2) visitPurpose = ans;
          if (q.sr_no === 3) stayDuration = ans;
        });
      }
      const res = await fetch('/api/feedback/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ billId, guestType, visitPurpose, stayDuration, answers }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to submit');
        setSubmitting(false);
        return;
      }
      router.push('/feedback/thank-you');
    } catch {
      setError('Failed to submit. Please try again.');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className={styles.main}>
        <div className={styles.centerMessage}>
          <div className={styles.spinner} />
          <p>Loading your personalized form...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className={styles.main}>
        <div className={styles.centerMessage}>
          <p className={styles.errorText}>{error}</p>
          <button onClick={() => router.push('/')} className={styles.ghostBtn}>Go Back</button>
        </div>
      </main>
    );
  }

  const isLastStep = currentStep === totalSteps - 1;

  return (
    <main className={styles.main}>
      <div className={styles.watermark}>{currentCategory?.name?.toUpperCase()}</div>

      <div className={styles.topBar}>
        <button onClick={() => router.push('/')} className={styles.exitBtn}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          Exit
        </button>
        <span className={styles.billLabel}>{bill?.bill_number}</span>
      </div>

      <div className={styles.formArea}>
        <div className={styles.card}>
          {/* Step + Progress */}
          <p className={styles.stepLabel}>STEP {currentStep + 1}/{totalSteps}</p>
          <div className={styles.progressTrack}>
            <div className={styles.progressFill} style={{ width: `${progress}%` }} />
          </div>

          {/* Category */}
          {currentCategory && (
            <div key={currentCategory.id} className={`${styles.categoryBlock} ${direction === 'next' ? styles.slideRight : styles.slideLeft}`}>
              <h2 className={styles.categoryTitle}>{currentCategory.name.toUpperCase()}</h2>

              <div className={styles.questions}>
                {currentCategory.questions.map((question, qIdx) => (
                  <div key={question.id} className={styles.questionBlock} style={{ animationDelay: `${qIdx * 0.04}s` }}>
                    <p className={styles.questionText}>
                      <span className={styles.qNum}>{question.sr_no}.</span>
                      {question.question_text}
                    </p>
                    <div className={styles.options}>
                      {(question.options || []).map((option, oIdx) => (
                        <button
                          key={oIdx}
                          type="button"
                          className={`${styles.optionPill} ${answers[question.id] === option ? styles.optionActive : ''}`}
                          onClick={() => setAnswer(question.id, option)}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className={styles.nav}>
            <button onClick={goPrev} disabled={currentStep === 0} className={styles.backBtn}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M10 4L6 8L10 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Back
            </button>
            {isLastStep ? (
              <button onClick={handleSubmit} disabled={submitting || !isCurrentStepComplete()} className={styles.nextBtn}>
                {submitting ? <span className={styles.spinner}/> : 'Submit'}
                {!submitting && (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8L6.5 11.5L13 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </button>
            ) : (
              <button onClick={goNext} disabled={!isCurrentStepComplete()} className={styles.nextBtn}>
                Next
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
