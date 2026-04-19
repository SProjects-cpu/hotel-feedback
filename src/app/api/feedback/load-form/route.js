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
    const billId = searchParams.get('billId');
    if (!billId) {
      return NextResponse.json({ error: 'billId is required' }, { status: 400 });
    }

    const supabase = getSupabase();

    // Get bill info
    const { data: bill, error: billError } = await supabase
      .from('bills')
      .select('id, bill_number, is_feedback_submitted')
      .eq('id', billId)
      .single();

    if (billError || !bill) {
      return NextResponse.json({ error: 'Bill not found' }, { status: 404 });
    }

    if (bill.is_feedback_submitted) {
      return NextResponse.json({ error: 'Feedback already submitted' }, { status: 409 });
    }

    // Get services linked to this bill
    const { data: billServices } = await supabase
      .from('bill_services')
      .select('service_id')
      .eq('bill_id', billId);

    const serviceIds = (billServices || []).map(bs => bs.service_id);

    // Get categories: those with matching service_id OR service_id is null (always shown)
    const { data: allCategories } = await supabase
      .from('categories')
      .select('id, slug, name, sort_order, service_id')
      .eq('is_active', true)
      .order('sort_order');

    const applicableCategories = (allCategories || []).filter(cat =>
      cat.service_id === null || serviceIds.includes(cat.service_id)
    );

    // Get questions for applicable categories
    const categoryIds = applicableCategories.map(c => c.id);
    const { data: questions } = await supabase
      .from('questions')
      .select('id, category_id, sr_no, question_text, options, question_type, is_required, sort_order')
      .in('category_id', categoryIds)
      .order('sort_order');

    // Group questions by category
    const categoriesWithQuestions = applicableCategories.map(cat => ({
      ...cat,
      questions: (questions || []).filter(q => q.category_id === cat.id),
    }));

    return NextResponse.json({
      bill,
      categories: categoriesWithQuestions,
    });
  } catch (err) {
    console.error('Load form error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
