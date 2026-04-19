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

    const { data: bills, error } = await supabase
      .from('bills')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch bills' }, { status: 500 });
    }

    // Get services for each bill
    const enrichedBills = await Promise.all(
      (bills || []).map(async (bill) => {
        const { data: billServices } = await supabase
          .from('bill_services')
          .select('service_id, services!inner(name, display_name)')
          .eq('bill_id', bill.id);

        return {
          ...bill,
          bill_services: (billServices || []).map(bs => ({
            service_id: bs.service_id,
            service_name: bs.services.name,
            services: { display_name: bs.services.display_name },
          })),
        };
      })
    );

    // Get all available services
    const { data: allServices } = await supabase
      .from('services')
      .select('id, name, display_name')
      .eq('is_active', true)
      .order('display_name');

    return NextResponse.json({ bills: enrichedBills, services: allServices || [] });
  } catch (err) {
    console.error('Bills API error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { bill_number, customer_name, room_number, services } = await request.json();

    if (!bill_number || !customer_name) {
      return NextResponse.json({ error: 'Bill number and customer name are required' }, { status: 400 });
    }

    const supabase = getSupabase();

    // Insert bill
    const { data: bill, error: billError } = await supabase
      .from('bills')
      .insert({
        bill_number: bill_number.toUpperCase(),
        customer_name,
        room_number: room_number || null,
      })
      .select('id')
      .single();

    if (billError) {
      if (billError.code === '23505') {
        return NextResponse.json({ error: 'Bill number already exists' }, { status: 409 });
      }
      return NextResponse.json({ error: 'Failed to create bill' }, { status: 500 });
    }

    // Resolve service names to IDs and link
    if (services && services.length > 0) {
      const { data: svcRecords } = await supabase
        .from('services')
        .select('id, name')
        .in('name', services);

      if (svcRecords && svcRecords.length > 0) {
        const rows = svcRecords.map(svc => ({ bill_id: bill.id, service_id: svc.id }));
        await supabase.from('bill_services').insert(rows);
      }
    }

    return NextResponse.json({ success: true, billId: bill.id });
  } catch (err) {
    console.error('Create bill error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
