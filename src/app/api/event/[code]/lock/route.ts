import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyHostKey } from '@/lib/crypto';
import { derangement } from '@/lib/match';

export async function POST(req: NextRequest, { params }: { params: { code: string } }) {
  const { hostKey } = await req.json();

  const { data: ev, error: eerr } = await supabaseAdmin
    .from('events').select('id, status, host_key_hash').eq('code', params.code).single();
  if (eerr || !ev) return NextResponse.json({ error: 'Event not found' }, { status: 404 });

  if (!verifyHostKey(hostKey || '', ev.host_key_hash))
    return NextResponse.json({ error: 'Invalid host key' }, { status: 403 });

  const { data: ps, error: perr } = await supabaseAdmin
    .from('participants').select('id').eq('event_id', ev.id);
  if (perr) return NextResponse.json({ error: perr.message }, { status: 500 });
  if (!ps || ps.length < 2) return NextResponse.json({ error: 'Need at least 2 participants' }, { status: 400 });

  const givers = ps.map(p => p.id);
  const recipients = derangement([...givers]);
  const rows = givers.map((g, i) => ({ event_id: ev.id, giver_id: g, recipient_id: recipients[i] }));

  const { error: aerr } = await supabaseAdmin.from('assignments').insert(rows);
  if (aerr) return NextResponse.json({ error: aerr.message }, { status: 500 });

  const { error: uerr } = await supabaseAdmin.from('events').update({ status: 'assigned' }).eq('id', ev.id);
  if (uerr) return NextResponse.json({ error: uerr.message }, { status: 500 });

  return NextResponse.json({ ok: true, assigned: ps.length });
}
