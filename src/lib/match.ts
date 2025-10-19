export function derangement<T>(arr: T[], maxTries = 500): T[] {
    const n = arr.length;
    if (n < 2) throw new Error('Need at least 2 participants');
    for (let t = 0; t < maxTries; t++) {
      const out = [...arr];
      for (let i = n - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [out[i], out[j]] = [out[j], out[i]];
      }
      let ok = true;
      for (let i = 0; i < n; i++) if (out[i] === arr[i]) { ok = false; break; }
      if (ok) return out;
    }
    return arr.map((_, i) => arr[(i + 1) % arr.length]); // fallback
  }
  