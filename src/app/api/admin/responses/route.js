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

    // Get all responses with bill info
    const { data: responses, error } = await supabase
      .from('feedback_responses')
      .select(`
        id, guest_type, visit_purpose, stay_duration, submitted_at,
        bills!inner(id, bill_number, customer_name, room_number, check_in_date, check_out_date)
      `)
      .order('submitted_at', { ascending: false });

    if (error) {
      console.error('Fetch responses error:', error);
      return NextResponse.json({ error: 'Failed to fetch responses' }, { status: 500 });
    }

    // For each response, get answers with question + category info
    const enrichedResponses = await Promise.all(
      (responses || []).map(async (resp) => {
        const { data: answers } = await supabase
          .from('feedback_answers')
          .select(`
            id, answer,
            questions!inner(id, sr_no, question_text, options, category_id,
              categories!inner(id, slug, name, sort_order)
            )
          `)
          .eq('response_id', resp.id);

        // Group answers by category
        const categoryAnswers = {};
        (answers || []).forEach(a => {
          const catSlug = a.questions.categories.slug;
          if (!categoryAnswers[catSlug]) {
            categoryAnswers[catSlug] = {
              name: a.questions.categories.name,
              sort_order: a.questions.categories.sort_order,
              answers: [],
            };
          }
          categoryAnswers[catSlug].answers.push({
            question: a.questions.question_text,
            answer: a.answer,
            sr_no: a.questions.sr_no,
          });
        });

        // Sort answers within each category
        Object.values(categoryAnswers).forEach(cat => {
          cat.answers.sort((a, b) => a.sr_no - b.sr_no);
        });

        return {
          id: resp.id,
          guest_type: resp.guest_type,
          visit_purpose: resp.visit_purpose,
          stay_duration: resp.stay_duration,
          submitted_at: resp.submitted_at,
          bill: resp.bills,
          categoryAnswers,
        };
      })
    );

    return NextResponse.json({ responses: enrichedResponses });
  } catch (err) {
    console.error('Admin responses error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
