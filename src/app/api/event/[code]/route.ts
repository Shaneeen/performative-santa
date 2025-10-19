import { NextRequest, NextResponse } from 'next/server';
import { supabaseAnon } from '@/lib/supabase';

export async function GET(_: NextRequest, { params }: { params: { code: string } }) {
  const { data, error } = await supabaseAnon
    .from('events')
    .select('id, code, host_name, total_budget_cents, currency, exchange_date, notes, status')
    .eq('code', params.code)
    .single();

  if (error || !data) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(data);
}
