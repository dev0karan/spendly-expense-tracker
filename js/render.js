// ── MASTER RENDER ─────────────────────────────────────────────────
function render() {
  renderStats();
  renderTransactions();
  renderDonut();
  renderCatBars();
  renderBudgets();
  renderBiggest();
  renderTrend();
  renderHeatmap();
  renderCompare();
  renderDeepDive();
  renderRecurring();
  renderWrapped();
}

// ── STATS CARDS ───────────────────────────────────────────────────
function renderStats() {
  const total = expenses.reduce((s, e) => s + e.amount, 0);
  document.getElementById('totalSpent').textContent = fmt(total);
  document.getElementById('txCount').textContent    = expenses.length + ' transaction' + (expenses.length !== 1 ? 's' : '');

  const catT = {};
  expenses.forEach(e => { catT[e.category] = (catT[e.category] || 0) + e.amount; });
  const top  = Object.entries(catT).sort((a, b) => b[1] - a[1])[0];

  document.getElementById('topCat').textContent    = top ? CATS[top[0]].emoji + ' ' + top[0] : '—';
  document.getElementById('topCatAmt').textContent = top ? fmt(top[1]) + ' spent' : 'no data yet';

  const days = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  document.getElementById('dailyAvg').textContent = fmt(total / days);

  const lm = getLastMonthSpend();
  if (lm > 0) {
    const d = ((total - lm) / lm * 100).toFixed(0);
    document.getElementById('vsLast').innerHTML = d > 0
      ? `<span class="stat-badge badge-up">▲ ${d}% vs last month</span>`
      : `<span class="stat-badge badge-down">▼ ${Math.abs(d)}% vs last month</span>`;
  }

  if (expenses.length > 0) {
    const big = expenses.reduce((a, b) => a.amount > b.amount ? a : b);
    document.getElementById('bigAmt').textContent  = fmt(big.amount);
    document.getElementById('bigName').textContent = big.desc;
  }
}

// ── TRANSACTION LIST ──────────────────────────────────────────────
function renderTransactions() {
  const list  = document.getElementById('txList');
  const shown = txFilter === 'all' ? expenses : expenses.filter(e => e.category === txFilter);

  if (shown.length === 0) {
    list.innerHTML = `<div class="empty"><div class="ei">🧾</div><p>${
      txFilter === 'all' ? 'No expenses yet.<br>Add your first one!' : 'No ' + txFilter + ' expenses'
    }</p></div>`;
    return;
  }

  list.innerHTML = shown.map(e => {
    const cat = CATS[e.category] || CATS.Other;
    const ds  = new Date(e.date + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    return `<div class="tx-item${e.isRecurring ? ' rec-tx' : ''}">
      <div class="tx-icon" style="background:${cat.color}22">${cat.emoji}</div>
      <div class="tx-info">
        <div class="tx-name">${e.desc}</div>
        <div class="tx-meta">${e.category} · ${ds}${e.isRecurring ? ' · 🔁' : ''}</div>
      </div>
      <div class="tx-right">
        <div class="tx-amount" style="color:${cat.color}">${fmt(e.amount)}</div>
        <button class="tx-del" onclick="deleteExpense(${e.id})">✕</button>
      </div>
    </div>`;
  }).join('');
}

// ── DONUT CHART ───────────────────────────────────────────────────
function renderDonut() {
  const total  = expenses.reduce((s, e) => s + e.amount, 0);
  const catT   = {};
  expenses.forEach(e => { catT[e.category] = (catT[e.category] || 0) + e.amount; });
  const sorted = Object.entries(catT).sort((a, b) => b[1] - a[1]);

  document.getElementById('donutVal').textContent = fmt(total);
  const svg = document.getElementById('donutChart');
  const cx = 74, cy = 74, r = 57, sw = 13, circ = 2 * Math.PI * r;
  svg.innerHTML = '';

  if (total === 0) {
    const c = makeSvgCircle(cx, cy, r);
    c.setAttribute('stroke', '#2a2a3a');
    c.setAttribute('stroke-width', sw);
    svg.appendChild(c);
    return;
  }

  let off = 0;
  sorted.forEach(([cat, amt], i) => {
    const pct  = amt / total;
    const dash = pct * circ;
    const gap  = circ - dash;
    const col  = CATS[cat]?.color || '#aaa';
    const c    = makeSvgCircle(cx, cy, r);
    c.setAttribute('stroke', col);
    c.setAttribute('stroke-width', sw);
    c.setAttribute('stroke-dasharray', `${dash} ${gap}`);
    c.setAttribute('stroke-dashoffset', -off);
    c.setAttribute('transform', `rotate(-90 ${cx} ${cy})`);
    c.setAttribute('stroke-linecap', 'round');
    c.style.transition = `stroke-dashoffset .6s ease ${i * .05}s`;
    svg.appendChild(c);
    off += dash + 1.5;
  });
}

function makeSvgCircle(cx, cy, r) {
  const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  c.setAttribute('cx', cx);
  c.setAttribute('cy', cy);
  c.setAttribute('r', r);
  c.setAttribute('fill', 'none');
  return c;
}

// ── CATEGORY BARS ─────────────────────────────────────────────────
function renderCatBars() {
  const total  = expenses.reduce((s, e) => s + e.amount, 0);
  const catT   = {};
  expenses.forEach(e => { catT[e.category] = (catT[e.category] || 0) + e.amount; });
  const sorted = Object.entries(catT).sort((a, b) => b[1] - a[1]);
  const el     = document.getElementById('catBars');

  if (sorted.length === 0) { el.innerHTML = ''; return; }

  el.innerHTML = sorted.map(([cat, amt]) => {
    const pct = total > 0 ? (amt / total * 100) : 0;
    const col = CATS[cat]?.color || '#aaa';
    const em  = CATS[cat]?.emoji || '📦';
    return `<div class="bar-item">
      <div class="bar-meta">
        <div class="bar-name"><span class="dot" style="background:${col}"></span>${em} ${cat}</div>
        <div class="bar-info">${fmt(amt)} <span style="opacity:.5">${pct.toFixed(0)}%</span></div>
      </div>
      <div class="bar-track"><div class="bar-fill" style="width:${pct}%;background:${col}"></div></div>
    </div>`;
  }).join('');
}

// ── BUDGET BARS ───────────────────────────────────────────────────
function renderBudgets() {
  const el      = document.getElementById('budgetBars');
  const catT    = {};
  expenses.forEach(e => { catT[e.category] = (catT[e.category] || 0) + e.amount; });
  const entries = Object.entries(budgets);

  if (entries.length === 0) {
    el.innerHTML = '<div class="empty" style="padding:16px"><p>No budgets set yet</p></div>';
    return;
  }

  el.innerHTML = entries.map(([cat, limit]) => {
    const spent = catT[cat] || 0;
    const pct   = Math.min(spent / limit * 100, 100);
    const over  = spent > limit;
    const col   = pct >= 100 ? '#f76a8c' : pct >= 80 ? '#f7c76a' : (CATS[cat]?.color || '#aaa');
    return `<div class="bar-item" style="margin-bottom:12px">
      <div class="bar-meta">
        <div class="bar-name ${pct >= 80 ? 'warn-text' : ''} ${over ? 'danger-text' : ''}">
          ${CATS[cat]?.emoji || '📦'} ${cat}${over ? '<span class="over-badge">OVER</span>' : ''}
        </div>
        <div class="bar-info" style="color:${col}">${fmt(spent)} / ${fmt(limit)}</div>
      </div>
      <div class="bar-track"><div class="bar-fill" style="width:${pct}%;background:${col}"></div></div>
    </div>`;
  }).join('');
}

// ── BIGGEST EXPENSE ───────────────────────────────────────────────
function renderBiggest() {
  const p = document.getElementById('bigPanel');
  if (expenses.length === 0) { p.style.display = 'none'; return; }

  const big = expenses.reduce((a, b) => a.amount > b.amount ? a : b);
  const cat = CATS[big.category] || CATS.Other;

  p.style.display = 'block';
  document.getElementById('bigCard').innerHTML = `
    <div class="big-icon">${cat.emoji}</div>
    <div class="big-info">
      <div class="big-label">Biggest Single Expense</div>
      <div class="big-name">${big.desc}</div>
      <div style="font-family:var(--font-m);font-size:9px;color:var(--muted);margin-top:2px">
        ${big.category} · ${new Date(big.date + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
      </div>
    </div>
    <div class="big-amt">${fmt(big.amount)}</div>`;
}

// ── TREND CHART (SVG) ─────────────────────────────────────────────
function renderTrend() {
  const svg = document.getElementById('trendChart');
  const lb  = document.getElementById('trendLabels');
  if (!svg) return;

  const weeks = [];
  for (let i = 7; i >= 0; i--) {
    const d  = new Date(now); d.setDate(d.getDate() - i * 7);
    const ws = new Date(d);   ws.setDate(d.getDate() - 6);
    weeks.push({
      label: 'W' + (8 - i),
      total: expenses
        .filter(e => { const ed = new Date(e.date); return ed >= ws && ed <= d; })
        .reduce((s, e) => s + e.amount, 0),
    });
  }

  const max = Math.max(...weeks.map(w => w.total), 1);
  const W   = svg.clientWidth || 360, H = 120;
  const pad = { t: 12, r: 8, b: 8, l: 8 };

  const pts = weeks.map((w, i) => ({
    x: pad.l + (i / (weeks.length - 1)) * (W - pad.l - pad.r),
    y: pad.t + (1 - w.total / max) * (H - pad.t - pad.b),
    v: w.total,
  }));

  const pathD = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const areaD = `${pathD} L${pts[pts.length - 1].x},${H} L${pts[0].x},${H} Z`;
  const isDark = document.documentElement.getAttribute('data-theme') !== 'light';

  svg.innerHTML = `
    <defs>
      <linearGradient id="tg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%"   stop-color="#7c6af7" stop-opacity="0.25"/>
        <stop offset="100%" stop-color="#7c6af7" stop-opacity="0.02"/>
      </linearGradient>
    </defs>
    <path d="${areaD}" fill="url(#tg)"/>
    <path d="${pathD}" fill="none" stroke="#7c6af7" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
    ${pts.map(p => `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="4" fill="#7c6af7" stroke="${isDark ? '#1a1a26' : '#fff'}" stroke-width="2"/>`).join('')}
    ${pts.map(p => p.v > 0 ? `<text x="${p.x.toFixed(1)}" y="${(p.y - 10).toFixed(1)}" text-anchor="middle" font-size="9" font-family="DM Mono" fill="#6b6b80">${fmt(p.v)}</text>` : '').join('')}`;

  lb.innerHTML = weeks.map(w => `<span class="tlabel">${w.label}</span>`).join('');
}

// ── HEATMAP ───────────────────────────────────────────────────────
function renderHeatmap() {
  const grid = document.getElementById('heatmapGrid');
  const ds   = {};
  expenses.forEach(e => { ds[e.date] = (ds[e.date] || 0) + e.amount; });

  const days = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now); d.setDate(d.getDate() - i);
    const k = d.toISOString().split('T')[0];
    days.push({ k, v: ds[k] || 0 });
  }

  const max = Math.max(...days.map(d => d.v), 1);
  grid.innerHTML = days.map(d => {
    const pct = d.v / max;
    const a   = pct < 0.01 ? 0 : pct < 0.33 ? 0.3 : pct < 0.66 ? 0.65 : 1;
    const bg  = a === 0 ? 'var(--border)' : `rgba(124,106,247,${a})`;
    return `<div class="hm-day" style="background:${bg}" data-tip="${d.v > 0 ? d.k + ': ' + fmt(d.v) : d.k}"></div>`;
  }).join('');
}

// ── MONTHLY COMPARISON ────────────────────────────────────────────
function renderCompare() {
  const el      = document.getElementById('compareRows');
  const monthly = {};
  expenses.forEach(e => {
    const d = new Date(e.date + 'T00:00:00');
    const k = d.toLocaleString('default', { month: 'short', year: '2-digit' });
    monthly[k] = (monthly[k] || 0) + e.amount;
  });
  const entries = Object.entries(monthly).slice(-6);

  if (entries.length === 0) {
    el.innerHTML = '<div class="empty" style="padding:16px"><p>Add expenses to see comparison</p></div>';
    return;
  }

  const max = Math.max(...entries.map(e => e[1]));
  el.innerHTML = entries.map(([m, t]) =>
    `<div class="cmp-row">
      <div class="cmp-month">${m}</div>
      <div class="cmp-track"><div class="cmp-fill" style="width:${(t / max * 100).toFixed(0)}%"></div></div>
      <div class="cmp-val">${fmt(t)}</div>
    </div>`
  ).join('');
}

// ── DEEP DIVE ─────────────────────────────────────────────────────
function renderDeepDive() {
  const el   = document.getElementById('deepDive');
  const catT = {}, catC = {};
  expenses.forEach(e => {
    catT[e.category] = (catT[e.category] || 0) + e.amount;
    catC[e.category] = (catC[e.category] || 0) + 1;
  });
  const sorted = Object.entries(catT).sort((a, b) => b[1] - a[1]);

  if (sorted.length === 0) {
    el.innerHTML = '<div class="empty" style="padding:16px"><p>Add expenses to see insights</p></div>';
    return;
  }

  el.innerHTML = sorted.map(([cat, total]) => {
    const avg = Math.round(total / catC[cat]);
    const col = CATS[cat]?.color || '#aaa';
    return `<div style="background:var(--surface);border:1px solid var(--border);border-left:3px solid ${col};border-radius:10px;padding:11px 13px;margin-bottom:8px">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <span style="font-size:12px;font-weight:700">${CATS[cat]?.emoji} ${cat}</span>
        <span style="font-family:var(--font-m);font-size:12px;color:${col}">${fmt(total)}</span>
      </div>
      <div style="font-family:var(--font-m);font-size:9px;color:var(--muted);margin-top:4px">
        ${catC[cat]} tx · avg ${fmt(avg)} each
      </div>
    </div>`;
  }).join('');
}

// ── RECURRING LIST ────────────────────────────────────────────────
function renderRecurring() {
  const el    = document.getElementById('recList');
  const total = recurring.reduce((s, r) => s + r.amount, 0);
  document.getElementById('recTotal').textContent = fmt(total);

  if (recurring.length === 0) {
    el.innerHTML = '<div class="empty"><div class="ei">🔁</div><p>No recurring expenses yet</p></div>';
    document.getElementById('recBreakdown').innerHTML = '';
    return;
  }

  el.innerHTML = recurring.map(r => {
    const cat = CATS[r.category] || CATS.Other;
    return `<div class="rec-item">
      <div style="font-size:20px">${cat.emoji}</div>
      <div class="rec-info">
        <div class="rec-name">${r.name}</div>
        <div class="rec-meta">${r.category} · Monthly</div>
      </div>
      <div class="rec-amt">${fmt(r.amount)}</div>
      <button class="rec-del" onclick="deleteRecurring(${r.id})">✕</button>
    </div>`;
  }).join('');

  document.getElementById('recBreakdown').innerHTML =
    `<button onclick="applyRecurring()" style="width:100%;padding:10px;background:rgba(247,199,106,0.1);border:1px solid rgba(247,199,106,0.28);border-radius:10px;color:var(--accent4);font-family:var(--font-d);font-size:12px;font-weight:700;cursor:pointer;margin-top:12px;transition:all .2s">
      🔁 Apply to This Month
    </button>`;
}

// ── WRAPPED SUMMARY ───────────────────────────────────────────────
function renderWrapped() {
  const total = expenses.reduce((s, e) => s + e.amount, 0);
  const catT  = {};
  expenses.forEach(e => { catT[e.category] = (catT[e.category] || 0) + e.amount; });
  const top  = Object.entries(catT).sort((a, b) => b[1] - a[1])[0];
  const days = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

  document.getElementById('wrapEmoji').textContent   = total === 0 ? '💸' : top ? CATS[top[0]].emoji : '💸';
  document.getElementById('wrapInsight').textContent = total === 0
    ? 'Add some expenses to see your summary!'
    : top ? `You love ${top[0]}! It's your #1 spending category.` : 'Great job tracking!';

  document.getElementById('wrapStats').innerHTML = total === 0 ? '' :
    `<div class="ws"><div class="ws-val">${fmt(total)}</div><div class="ws-label">Total Spent</div></div>
     <div class="ws"><div class="ws-val">${expenses.length}</div><div class="ws-label">Transactions</div></div>
     <div class="ws"><div class="ws-val">${fmt(total / days)}</div><div class="ws-label">Daily Avg</div></div>
     <div class="ws"><div class="ws-val">${Object.keys(catT).length}</div><div class="ws-label">Categories</div></div>`;

  const fi = document.getElementById('funInsights');
  if (total === 0) {
    fi.innerHTML = '<div class="empty" style="padding:16px"><p>Add expenses to unlock insights</p></div>';
    return;
  }

  const ins = [];
  if (top) ins.push(`🏆 You spent the most on <strong>${top[0]}</strong> — ${fmt(top[1])} (${(top[1] / total * 100).toFixed(0)}% of total)`);
  if (total / days > 500) ins.push(`☕ Your daily spend (${fmt(total / days)}) could buy ${Math.floor(total / days / 80)} cups of chai!`);
  if (expenses.length > 0) {
    const big = expenses.reduce((a, b) => a.amount > b.amount ? a : b);
    ins.push(`💥 Biggest splurge: <strong>${big.desc}</strong> at ${fmt(big.amount)}`);
  }
  const lm = getLastMonthSpend();
  if (lm > 0) {
    const d = total - lm;
    ins.push(d > 0
      ? `📈 Spent ${fmt(Math.abs(d))} <strong>more</strong> than last month`
      : `📉 Saved ${fmt(Math.abs(d))} vs last month! 🎉`);
  }
  ins.push(`📅 <strong>${expenses.length} transactions</strong> logged this month`);

  fi.innerHTML = ins.map(i =>
    `<div style="padding:9px 12px;background:var(--surface);border:1px solid var(--border);border-radius:10px;font-size:12px;margin-bottom:7px;line-height:1.6">${i}</div>`
  ).join('');
}
