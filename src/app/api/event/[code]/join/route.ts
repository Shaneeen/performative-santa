import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { z } from 'zod';
import { makeShortCode } from '@/lib/crypto';
import { customAlphabet } from 'nanoid';

const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 24);
const Body = z.object({
  name: z.string().min(1),
  wishlist: z.string().optional(),
  interests: z.array(z.string()).optional(),
  splitMainPct: z.number().int().min(0).max(100)
});

export async function POST(req: NextRequest, { params }: { params: { code: string } }) {
  const body = Body.parse(await req.json());

  const { data: ev, error: eerr } = await supabaseAdmin
    .from('events').select('id, status').eq('code', params.code).single();
  if (eerr || !ev) return NextResponse.json({ error: 'Event not found' }, { status: 404 });
  if (ev.status !== 'collecting') return NextResponse.json({ error: 'Event is not collecting' }, { status: 400 });

  const token = nanoid();
  const short = makeShortCode(4);

  const { data: p, error } = await supabaseAdmin
    .from('participants')
    .insert({
      event_id: ev.id,
      name: body.name,
      wishlist: body.wishlist ?? '',
      interests: body.interests ?? [],
      split_main_pct: body.splitMainPct,
      token, short_code: short
    })
    .select('id, token, short_code')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    token: p.token,
    shortCode: p.short_code,
    nextLink: `/e/${params.code}?token=${p.token}`
  });
}
