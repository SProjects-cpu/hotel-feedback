/**
 * Maps answer text to a numeric score (1-4) for analytics.
 */
export function getAnswerScore(answer) {
  const scoreMap = {
    // Score 4 - Best
    'Excellent': 4, 'Very Satisfied': 4, 'Very Smooth': 4, 'Very Fast': 4,
    'Very Fresh': 4, 'Very Easy': 4, 'Fully': 4, 'Definitely': 4,
    'None': 4, 'Well Trained': 4, 'Easily Available': 4, 'Always Available': 4,
    'Immediately': 4, 'Very Satisfactory': 4, 'Very Clear': 4, 'Very Short': 4,
    'Fully Resolved': 4, 'Perfect': 4, 'Fully Available': 4,
    'No improvement needed': 4,

    // Score 3 - Good
    'Good': 3, 'Satisfied': 3, 'Smooth': 3, 'Fast': 3, 'Fresh': 3,
    'Easy': 3, 'Probably': 3, 'Short': 3, 'Clear': 3, 'Mostly Available': 3,
    'Few Hours': 3, 'Satisfactory': 3, 'Moderately Trained': 3,
    'Available with Delay': 3, 'Partial': 3, 'Yes': 3,

    // Score 2 - Average
    'Average': 2, 'Neutral': 2, 'Moderate': 2, 'Partially': 2,
    'Not Sure': 2, 'Acceptable': 2, 'Occasionally': 2, 'Limited': 2,
    'Confusing': 2, 'Less': 2, 'Minor': 2,

    // Score 1 - Poor
    'Poor': 1, 'Dissatisfied': 1, 'Slow': 1, 'Difficult': 1,
    'Very Difficult': 1, 'No': 1, 'Not Resolved': 1, 'Not Satisfactory': 1,
    'Not Available': 1, 'Small': 1, 'Delayed': 1, 'Poorly Trained': 1,
    'Long': 1, 'Major': 1,
  };

  return scoreMap[answer] || 2;
}

/**
 * Calculates average score for a set of answers.
 */
export function calculateAverageScore(answers) {
  if (!answers || answers.length === 0) return 0;
  const total = answers.reduce((sum, a) => sum + getAnswerScore(a.answer), 0);
  return (total / answers.length).toFixed(2);
}

/**
 * Converts a 1-4 score to a percentage (0-100).
 */
export function scoreToPercentage(score) {
  return ((score / 4) * 100).toFixed(1);
}

/**
 * Gets a color based on score (for visual indicators).
 */
export function getScoreColor(score) {
  if (score >= 3.5) return '#10b981'; // Green
  if (score >= 2.5) return '#f59e0b'; // Amber
  if (score >= 1.5) return '#f97316'; // Orange
  return '#ef4444'; // Red
}

/**
 * Gets sentiment label from score.
 */
export function getScoreLabel(score) {
  if (score >= 3.5) return 'Excellent';
  if (score >= 2.5) return 'Good';
  if (score >= 1.5) return 'Average';
  return 'Poor';
}

/**
 * Format date for display.
 */
export function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Format date with time.
 */
export function formatDateTime(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
