import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(req: NextRequest, { params }: { params: { code: string } }) {
  const token = new URL(req.url).searchParams.get('token') || '';

  const { data: ev } = await supabaseAdmin
    .from('events')
    .select('id, code, host_name, total_budget_cents, currency, exchange_date, notes, status')
    .eq('code', params.code).single();
  if (!ev) return NextResponse.json({ error: 'Event not found' }, { status: 404 });

  const { data: giver } = await supabaseAdmin
    .from('participants').select('id, name, token').eq('event_id', ev.id).eq('token', token).single();
  if (!giver) return NextResponse.json({ error: 'Invalid token' }, { status: 404 });

  const { data: asg } = await supabaseAdmin
    .from('assignments').select('recipient_id').eq('event_id', ev.id).eq('giver_id', giver.id).single();
  if (!asg) return NextResponse.json({ error: 'Assignment not ready' }, { status: 409 });

  const { data: rec } = await supabaseAdmin
    .from('participants').select('name, wishlist, interests, split_main_pct').eq('id', asg.recipient_id).single();

  return NextResponse.json({
    event: {
      hostName: ev.host_name,
      budgetCents: ev.total_budget_cents,
      currency: ev.currency,
      exchangeDate: ev.exchange_date,
      notes: ev.notes
    },
    me: { name: giver.name },
    recipient: rec
  });
}
