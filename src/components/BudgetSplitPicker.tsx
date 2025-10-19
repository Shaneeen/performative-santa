'use client';
import { useMemo } from 'react';

export default function BudgetSplitPicker({
  totalCents, value, onChange, currency='SGD'
}: { totalCents: number; value: number; onChange: (n:number)=>void; currency?: string }) {
  const mainCents = useMemo(() => Math.round((value/100)*totalCents), [value,totalCents]);
  const extraCents = totalCents - mainCents;
  const fmt = (c:number) => new Intl.NumberFormat('en-SG',{style:'currency',currency}).format(c/100);

  return (
    <div className="p-4 rounded-2xl bg-blossom-100 shadow-soft">
      <label className="block mb-2 font-medium text-gray-800">
        Budget split: <span className="text-matcha-400">Main ({value}%)</span> / Extra ({100-value}%)
      </label>
      <input type="range" min={0} max={100} step={5} value={value}
             onChange={e=>onChange(parseInt(e.target.value))} className="w-full" />
      <div className="mt-3 text-sm">
        <div>Total: <b>{fmt(totalCents)}</b></div>
        <div>Main ≈ <b>{fmt(mainCents)}</b> • Extra ≈ <b>{fmt(extraCents)}</b></div>
      </div>
      <p className="mt-2 text-xs text-gray-600">Tip: choose 0/100 or 100/0 if you want only Extra or only Main.</p>
    </div>
  );
}
