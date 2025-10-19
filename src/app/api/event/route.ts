import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { makeCode, makeHostKey } from '@/lib/crypto';
import { z } from 'zod';

const Body = z.object({
  hostName: z.string().min(1),
  totalBudget: z.number().int().positive(), // cents
  currency: z.string().default('SGD'),
  exchangeDate: z.string().optional(),
  notes: z.string().optional()
});

export async function POST(req: NextRequest) {
  const data = Body.parse(await req.json());
  const { hostKey, hostKeyHash } = makeHostKey();
  const code = makeCode(6);

  const { data: ev, error } = await supabaseAdmin
    .from('events')
    .insert({
      code,
      host_name: data.hostName,
      total_budget_cents: data.totalBudget,
      currency: data.currency,
      exchange_date: data.exchangeDate ?? null,
      notes: data.notes ?? null,
      host_key_hash: hostKeyHash,
      status: 'collecting'
    })
    .select('id, code, host_name, currency, total_budget_cents, exchange_date, notes')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    event: ev,
    hostKey,
    hostPanel: `/e/${ev.code}?hostKey=${hostKey}`
  });
}
