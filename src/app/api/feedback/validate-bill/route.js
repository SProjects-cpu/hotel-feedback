import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const billNumber = searchParams.get('billNumber');
    if (!billNumber) {
      return NextResponse.json({ error: 'Bill number is required' }, { status: 400 });
    }

    const supabase = getSupabase();

    const { data: bill, error: billError } = await supabase
      .from('bills')
      .select('id, bill_number, is_feedback_submitted')
      .eq('bill_number', billNumber)
      .single();

    if (billError || !bill) {
      return NextResponse.json({ error: 'Bill number not found. Please check and try again.' }, { status: 404 });
    }

    if (bill.is_feedback_submitted) {
      return NextResponse.json({ error: 'Feedback has already been submitted for this bill.' }, { status: 409 });
    }

    return NextResponse.json({ billId: bill.id, billNumber: bill.bill_number });
  } catch (err) {
    console.error('Validate bill error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { billNumber } = await request.json();
    if (!billNumber) {
      return NextResponse.json({ error: 'Bill number is required' }, { status: 400 });
    }

    const supabase = getSupabase();

    const { data: bill, error: billError } = await supabase
      .from('bills')
      .select('id, bill_number, is_feedback_submitted')
      .eq('bill_number', billNumber)
      .single();

    if (billError || !bill) {
      return NextResponse.json({ error: 'Bill number not found. Please check and try again.' }, { status: 404 });
    }

    if (bill.is_feedback_submitted) {
      return NextResponse.json({ error: 'Feedback has already been submitted for this bill.' }, { status: 409 });
    }

    return NextResponse.json({ billId: bill.id, billNumber: bill.bill_number });
  } catch (err) {
    console.error('Validate bill error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
