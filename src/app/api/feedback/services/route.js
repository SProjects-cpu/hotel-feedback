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
    const { data: services } = await supabase
      .from('services')
      .select('id, name, display_name')
      .eq('is_active', true)
      .order('display_name');

    return NextResponse.json({ services: services || [] });
  } catch (err) {
    console.error('Services API error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
