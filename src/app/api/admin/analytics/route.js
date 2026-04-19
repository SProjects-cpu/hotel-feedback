import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export async function GET() {
  try {
    const supabase = getSupabase();

    // Total responses
    const { count: totalResponses } = await supabase
      .from('feedback_responses')
      .select('id', { count: 'exact', head: true });

    // Total bills
    const { count: totalBills } = await supabase
      .from('bills')
      .select('id', { count: 'exact', head: true });

    // Pending feedback
    const { count: pendingFeedback } = await supabase
      .from('bills')
      .select('id', { count: 'exact', head: true })
      .eq('is_feedback_submitted', false);

    // Get all answers with category info for score calculation
    const { data: allAnswers } = await supabase
      .from('feedback_answers')
      .select(`
        answer,
        questions!inner(
          category_id,
          categories!inner(slug, name, sort_order)
        )
      `);

    // Score mapping
    const scoreMap = {
      'Excellent': 4, 'Very Satisfied': 4, 'Very Smooth': 4, 'Very Fast': 4,
      'Very Fresh': 4, 'Very Easy': 4, 'Fully': 4, 'Definitely': 4,
      'None': 4, 'Well Trained': 4, 'Easily Available': 4, 'Always Available': 4,
      'Immediately': 4, 'Very Satisfactory': 4, 'Very Clear': 4, 'Very Short': 4,
      'Fully Resolved': 4, 'Perfect': 4, 'Fully Available': 4,
      'No improvement needed': 4,
      'Good': 3, 'Satisfied': 3, 'Smooth': 3, 'Fast': 3, 'Fresh': 3,
      'Easy': 3, 'Probably': 3, 'Short': 3, 'Clear': 3, 'Mostly Available': 3,
      'Few Hours': 3, 'Satisfactory': 3, 'Moderately Trained': 3,
      'Available with Delay': 3, 'Partial': 3, 'Yes': 3,
      'Average': 2, 'Neutral': 2, 'Moderate': 2, 'Partially': 2,
      'Not Sure': 2, 'Acceptable': 2, 'Occasionally': 2, 'Limited': 2,
      'Confusing': 2, 'Less': 2, 'Minor': 2,
      'Poor': 1, 'Dissatisfied': 1, 'Slow': 1, 'Difficult': 1,
      'Very Difficult': 1, 'No': 1, 'Not Resolved': 1, 'Not Satisfactory': 1,
      'Not Available': 1, 'Small': 1, 'Delayed': 1, 'Poorly Trained': 1,
      'Long': 1, 'Major': 1,
    };

    // Calculate category averages
    const categoryStats = {};
    (allAnswers || []).forEach(a => {
      const slug = a.questions.categories.slug;
      if (slug === 'guest_categorization' || slug === 'final_experience') return;
      if (!categoryStats[slug]) {
        categoryStats[slug] = {
          name: a.questions.categories.name,
          sort_order: a.questions.categories.sort_order,
          totalScore: 0,
          count: 0,
        };
      }
      const score = scoreMap[a.answer] || 2;
      categoryStats[slug].totalScore += score;
      categoryStats[slug].count += 1;
    });

    const categoryAverages = Object.entries(categoryStats)
      .map(([slug, s]) => ({
        slug,
        name: s.name,
        sort_order: s.sort_order,
        average: s.count > 0 ? +(s.totalScore / s.count).toFixed(2) : 0,
        percentage: s.count > 0 ? +((s.totalScore / s.count / 4) * 100).toFixed(1) : 0,
        responseCount: s.count,
      }))
      .sort((a, b) => a.sort_order - b.sort_order);

    // Overall average
    const totalScore = categoryAverages.reduce((s, c) => s + c.average, 0);
    const overallAverage = categoryAverages.length > 0 ? +(totalScore / categoryAverages.length).toFixed(2) : 0;

    // Guest type distribution
    const { data: guestTypes } = await supabase
      .from('feedback_responses')
      .select('guest_type');

    const guestTypeDist = {};
    (guestTypes || []).forEach(g => {
      const type = g.guest_type || 'Unknown';
      guestTypeDist[type] = (guestTypeDist[type] || 0) + 1;
    });

    return NextResponse.json({
      totalResponses: totalResponses || 0,
      totalBills: totalBills || 0,
      pendingFeedback: pendingFeedback || 0,
      responseRate: totalBills > 0 ? +((totalResponses / totalBills) * 100).toFixed(1) : 0,
      overallAverage,
      overallPercentage: +((overallAverage / 4) * 100).toFixed(1),
      categoryAverages,
      guestTypeDistribution: guestTypeDist,
    });
  } catch (err) {
    console.error('Analytics error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
