import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export async function POST(request) {
  try {
    const { billId, guestType, visitPurpose, stayDuration, answers } = await request.json();
    if (!billId || !answers) {
      return NextResponse.json({ error: 'Missing required data' }, { status: 400 });
    }

    const supabase = getSupabase();

    // Create feedback response
    const { data: response, error: respError } = await supabase
      .from('feedback_responses')
      .insert({
        bill_id: billId,
        guest_type: guestType || null,
        visit_purpose: visitPurpose || null,
        stay_duration: stayDuration || null,
      })
      .select('id')
      .single();

    if (respError) {
      console.error('Insert response error:', respError);
      if (respError.code === '23505') {
        return NextResponse.json({ error: 'Feedback already submitted for this bill' }, { status: 409 });
      }
      return NextResponse.json({ error: 'Failed to save feedback' }, { status: 500 });
    }

    // Insert all answers
    const answerRows = Object.entries(answers).map(([questionId, answer]) => ({
      response_id: response.id,
      question_id: questionId,
      answer: answer,
    }));

    if (answerRows.length > 0) {
      const { error: ansError } = await supabase
        .from('feedback_answers')
        .insert(answerRows);

      if (ansError) {
        console.error('Insert answers error:', ansError);
        return NextResponse.json({ error: 'Failed to save answers' }, { status: 500 });
      }
    }

    // Mark bill as feedback submitted
    await supabase
      .from('bills')
      .update({ is_feedback_submitted: true })
      .eq('id', billId);

    return NextResponse.json({ success: true, responseId: response.id });
  } catch (err) {
    console.error('Submit feedback error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
