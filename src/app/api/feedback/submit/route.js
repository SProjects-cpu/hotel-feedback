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

    const supabase = getSupabase();
    const isGuestMode = !billId || billId === 'guest';

    // Create feedback response
    const insertData = {
      guest_type: guestType || null,
      visit_purpose: visitPurpose || null,
      stay_duration: stayDuration || null,
    };

    if (!isGuestMode) {
      insertData.bill_id = billId;
    }

    const { data: response, error: respError } = await supabase
      .from('feedback_responses')
      .insert(insertData)
      .select('id')
      .single();

    if (respError) {
      console.error('Insert response error:', respError);
      if (respError.code === '23505') {
        return NextResponse.json({ error: 'Feedback already submitted for this bill' }, { status: 409 });
      }
      return NextResponse.json({ error: 'Failed to save feedback' }, { status: 500 });
    }

    // Insert answers (if any provided)
    const answerEntries = answers ? Object.entries(answers) : [];
    if (answerEntries.length > 0) {
      const answerRows = answerEntries.map(([questionId, answer]) => ({
        response_id: response.id,
        question_id: questionId,
        answer: answer,
      }));

      const { error: ansError } = await supabase
        .from('feedback_answers')
        .insert(answerRows);

      if (ansError) {
        console.error('Insert answers error:', ansError);
        return NextResponse.json({ error: 'Failed to save answers' }, { status: 500 });
      }
    }

    // Mark bill as feedback submitted (only if bill-based)
    if (!isGuestMode) {
      await supabase
        .from('bills')
        .update({ is_feedback_submitted: true })
        .eq('id', billId);
    }

    return NextResponse.json({ success: true, responseId: response.id });
  } catch (err) {
    console.error('Submit feedback error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
