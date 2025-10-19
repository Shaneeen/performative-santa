'use client';
import { useEffect, useMemo, useState } from 'react';
import BudgetSplitPicker from '@/components/BudgetSplitPicker';
import Logo from '@/components/Logo';

type EventInfo = {
  id?: string; code: string; host_name: string;
  total_budget_cents: number; currency: string;
  exchange_date?: string; notes?: string; status: 'collecting'|'locked'|'assigned'
};

export default function EventPage({ params }: any) {
  const code = params.code as string;
  const tokenFromQS = typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search).get('token') || ''
    : '';
  const hostKey = typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search).get('hostKey') || ''
    : '';

  const [ev, setEv] = useState<EventInfo | null>(null);
  const [name, setName] = useState('');
  const [wishlist, setWishlist] = useState('');
  const [split, setSplit] = useState(80);
  const [token, setToken] = useState(tokenFromQS);
  const [view, setView] = useState<any>(null);
  const [busy, setBusy] = useState(false);
  const isHostPanel = !!hostKey;

  useEffect(() => { fetch(`/api/event/${code}`).then(r=>r.json()).then(setEv); }, [code]);
  useEffect(() => {
    if (token && ev?.status === 'assigned') {
      fetch(`/api/event/${code}/whoami?token=${token}`).then(r=>r.json()).then(setView);
    }
  }, [token, ev?.status, code]);

  const budgetText = useMemo(() => {
    if (!ev) return '';
    const fmt = new Intl.NumberFormat('en-SG', { style:'currency', currency: ev.currency }).format;
    return fmt(ev.total_budget_cents/100);
  }, [ev]);

  async function join() {
    if (!ev) return;
    setBusy(true);
    const res = await fetch(`/api/event/${code}/join`, {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ name, wishlist, interests: [], splitMainPct: split })
    }).then(r=>r.json());
    setBusy(false);
    if (res.token) {
      setToken(res.token);
      alert(`Saved! Your short code: ${res.shortCode}. Bookmark this page or keep your link.`);
      history.replaceState(null, '', res.nextLink);
    } else alert(res.error || 'Failed');
  }

  async function lockAndAssign() {
    setBusy(true);
    const res = await fetch(`/api/event/${code}/lock`, {
      method: 'POST',
      headers: { 'Content-Type':'application/json' },
      body: JSON.stringify({ hostKey })
    }).then(r=>r.json());
    setBusy(false);
    if (res.ok) { alert(`Locked and assigned ${res.assigned} participants`); location.reload(); }
    else alert(res.error || 'Failed to lock');
  }

  if (!ev) return <div className="p-6">Loading…</div>;

  return (
    <div className="min-h-screen bg-blossom-50">
      <div className="max-w-md mx-auto p-6">
        <Logo />
        <p className="mt-1 text-gray-700">
          Host: {ev.host_name} • Budget: <b>{budgetText}</b>
          {ev.exchange_date ? <> • Exchange: {ev.exchange_date}</> : null}
        </p>
        {ev.notes ? <p className="mt-1 text-gray-600">{ev.notes}</p> : null}

        {ev.status === 'collecting' && (
          <>
            <div className="mt-5 p-4 bg-white rounded-2xl shadow-soft">
              <label className="block text-sm font-medium">Your name</label>
              <input className="mt-1 w-full rounded-xl border p-2"
                     value={name} onChange={e=>setName(e.target.value)} placeholder="e.g., Shaneen" />
              <label className="block mt-4 text-sm font-medium">Wishlist / Interests</label>
              <textarea className="mt-1 w-full rounded-xl border p-2" rows={4}
                        value={wishlist} onChange={e=>setWishlist(e.target.value)}
                        placeholder="Links or notes (Shopee/Lazada/Amazon)…" />
              <div className="mt-4">
                <BudgetSplitPicker totalCents={ev.total_budget_cents} value={split} onChange={setSplit} currency={ev.currency} />
                <p className="mt-2 text-xs text-gray-600">
                  Split meaning: <b>Main (good)</b> gets your chosen %, <b>Extra (silly/funny)</b> gets the rest.
                </p>
              </div>
              <button disabled={busy || !name}
                      onClick={join}
                      className="mt-4 w-full rounded-2xl bg-matcha-400 text-white py-3 font-semibold hover:opacity-90">
                {busy ? 'Saving…' : 'Submit'}
              </button>
            </div>

            {isHostPanel && (
              <div className="mt-6 p-4 bg-blossom-100 rounded-2xl">
                <p className="text-sm font-medium">Host panel</p>
                <button onClick={lockAndAssign}
                        className="mt-2 w-full rounded-2xl bg-blossom-400 text-white py-3 font-semibold hover:opacity-90">
                  {busy ? 'Working…' : 'Lock & Assign'}
                </button>
                <p className="mt-2 text-xs text-gray-700">Locking freezes edits and creates assignments. (v1: re-draw = new event)</p>
              </div>
            )}
          </>
        )}

        {ev.status !== 'collecting' && (
          <div className="mt-6 p-4 bg-white rounded-2xl shadow-soft">
            <h2 className="font-semibold">Your assignment</h2>
            {!token && <p className="text-sm mt-1">Open your personal token link or ask the host to resend it.</p>}
            {view?.recipient ? <AssignmentView data={view} /> :
              <p className="text-sm text-gray-600 mt-2">After the host locks, refresh to see your recipient.</p>}
          </div>
        )}
      </div>
    </div>
  );
}

function AssignmentView({ data }: { data: any }) {
  const { event, me, recipient } = data;
  const fmt = new Intl.NumberFormat('en-SG', { style:'currency', currency: event.currency }).format;
  const main = Math.round(event.budgetCents * (recipient.split_main_pct/100));
  const extra = event.budgetCents - main;
  return (
    <div>
      <p className="mt-1 text-gray-700">Hi <b>{me.name}</b> — you are buying for:</p>
      <div className="mt-3 p-4 bg-blossom-100 rounded-2xl">
        <div className="text-xl font-bold text-matcha-400">{recipient.name}</div>
        <div className="text-sm mt-1">
          Budget: <b>{fmt(event.budgetCents/100)}</b> → Main {recipient.split_main_pct}% (~{fmt(main/100)}) / Extra {100-recipient.split_main_pct}% (~{fmt(extra/100)})
        </div>
        {recipient.wishlist && (
          <div className="mt-3">
            <div className="font-semibold">Wishlist / Interests</div>
            <p className="whitespace-pre-wrap text-sm mt-1">{recipient.wishlist}</p>
          </div>
        )}
      </div>
      {event.exchangeDate && <p className="mt-3 text-sm">Exchange date: {event.exchangeDate}</p>}
      {event.notes && <p className="text-sm text-gray-700">Notes: {event.notes}</p>}
    </div>
  );
}
