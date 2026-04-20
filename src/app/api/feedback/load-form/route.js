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
    const servicesParam = searchParams.get('services'); // comma-separated service names for guest mode

    const supabase = getSupabase();
    let bill = null;
    let serviceIds = [];

    if (billId && billId !== 'guest') {
      // Bill-based mode
      const { data: billData, error: billError } = await supabase
        .from('bills')
        .select('id, bill_number, is_feedback_submitted')
        .eq('id', billId)
        .single();

      if (billError || !billData) {
        return NextResponse.json({ error: 'Bill not found' }, { status: 404 });
      }

      if (billData.is_feedback_submitted) {
        return NextResponse.json({ error: 'Feedback already submitted' }, { status: 409 });
      }

      bill = billData;

      // Get services linked to this bill
      const { data: billServices } = await supabase
        .from('bill_services')
        .select('service_id')
        .eq('bill_id', billId);

      serviceIds = (billServices || []).map(bs => bs.service_id);
    } else if (servicesParam) {
      // Guest mode with selected services — resolve names to IDs
      const serviceNames = servicesParam.split(',').filter(Boolean);
      if (serviceNames.length > 0) {
        const { data: svcRecords } = await supabase
          .from('services')
          .select('id')
          .in('name', serviceNames);
        serviceIds = (svcRecords || []).map(s => s.id);
      }
    }
    // else: guest mode with no services selected — show ALL categories

    // Get categories
    const { data: allCategories } = await supabase
      .from('categories')
      .select('id, slug, name, sort_order, service_id')
      .eq('is_active', true)
      .order('sort_order');

    // Filter categories:
    // - If serviceIds is empty (guest mode, no selection) → show ALL categories
    // - If serviceIds has items → show matching + universal (service_id is null)
    let applicableCategories;
    if (serviceIds.length === 0 && !billId) {
      // Guest mode, no services selected → show all
      applicableCategories = allCategories || [];
    } else {
      applicableCategories = (allCategories || []).filter(cat =>
        cat.service_id === null || serviceIds.includes(cat.service_id)
      );
    }

    // Get questions for applicable categories
    const categoryIds = applicableCategories.map(c => c.id);
    let questions = [];
    if (categoryIds.length > 0) {
      const { data: qData } = await supabase
        .from('questions')
        .select('id, category_id, sr_no, question_text, options, question_type, is_required, sort_order')
        .in('category_id', categoryIds)
        .order('sort_order');
      questions = qData || [];
    }

    // Group questions by category
    const categoriesWithQuestions = applicableCategories.map(cat => ({
      ...cat,
      questions: questions.filter(q => q.category_id === cat.id),
    }));

    return NextResponse.json({
      bill,
      guestMode: !billId || billId === 'guest',
      categories: categoriesWithQuestions,
    });
  } catch (err) {
    console.error('Load form error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
