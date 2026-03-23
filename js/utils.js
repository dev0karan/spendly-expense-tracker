// ── TABS ──────────────────────────────────────────────────────────
function switchTab(name, btn) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.getElementById('view-' + name).classList.add('active');
  btn.classList.add('active');
  if (name === 'analytics') setTimeout(renderTrend, 60);
}

// ── THEME ─────────────────────────────────────────────────────────
function toggleTheme() {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  document.documentElement.setAttribute('data-theme', isDark ? 'light' : 'dark');
  document.getElementById('themeBtn').textContent = isDark ? '🌞' : '🌙';
  localStorage.setItem('sp2_theme', isDark ? 'light' : 'dark');
  setTimeout(renderTrend, 80);
}

// ── MODALS ────────────────────────────────────────────────────────
function openModal(id)  { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }
function openExportModal() { openModal('exportModal'); }

// Close modal on backdrop click
document.querySelectorAll('.modal-bg').forEach(m =>
  m.addEventListener('click', e => { if (e.target === m) m.classList.remove('open'); })
);

// ── EXPORT & SHARE ────────────────────────────────────────────────
function exportCSV() {
  if (expenses.length === 0) { toast('⚠️ No data to export', 'e'); return; }
  const header = 'Date,Description,Category,Amount\n';
  const rows   = expenses.map(e => `${e.date},"${e.desc}",${e.category},${e.amount}`).join('\n');
  const a      = document.createElement('a');
  a.href       = URL.createObjectURL(new Blob([header + rows], { type: 'text/csv' }));
  a.download   = 'spendly-expenses.csv';
  a.click();
  toast('📊 CSV downloaded!', 's');
}

function exportPDF() {
  if (expenses.length === 0) { toast('⚠️ No data to export', 'e'); return; }

  const total    = expenses.reduce((s, e) => s + e.amount, 0);
  const catT     = {};
  expenses.forEach(e => { catT[e.category] = (catT[e.category] || 0) + e.amount; });

  const catRows = Object.entries(catT)
    .sort((a, b) => b[1] - a[1])
    .map(([c, a]) => `<tr><td>${CATS[c]?.emoji} ${c}</td><td align="right">₹${a.toLocaleString('en-IN')}</td><td align="right">${(a / total * 100).toFixed(1)}%</td></tr>`)
    .join('');

  const txRows = expenses.slice(0, 25)
    .map(e => `<tr><td>${e.date}</td><td>${e.desc}</td><td>${e.category}</td><td align="right">₹${e.amount.toLocaleString('en-IN')}</td></tr>`)
    .join('');

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Spendly Report</title>
    <style>
      body { font-family: Arial, sans-serif; padding: 40px; color: #222; }
      h1   { color: #7c6af7; }
      table { width: 100%; border-collapse: collapse; margin: 16px 0; }
      th, td { padding: 8px 12px; border: 1px solid #ddd; font-size: 13px; }
      th { background: #7c6af7; color: #fff; }
      .total { font-size: 24px; font-weight: 800; color: #7c6af7; margin: 16px 0; }
      @media print { body { padding: 20px; } }
    </style>
    </head><body>
    <h1>💸 Spendly Expense Report</h1>
    <p>Generated: ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
    <div class="total">Total Spent: ₹${total.toLocaleString('en-IN')}</div>
    <h2>Category Breakdown</h2>
    <table><tr><th>Category</th><th>Amount</th><th>%</th></tr>${catRows}</table>
    <h2>Transactions (last 25)</h2>
    <table><tr><th>Date</th><th>Description</th><th>Category</th><th>Amount</th></tr>${txRows}</table>
    </body></html>`;

  const w = window.open('', '_blank');
  w.document.write(html);
  w.document.close();
  w.print();
  toast('📄 PDF ready!', 's');
}

function shareWrapped() {
  const total = expenses.reduce((s, e) => s + e.amount, 0);
  const catT  = {};
  expenses.forEach(e => { catT[e.category] = (catT[e.category] || 0) + e.amount; });
  const top  = Object.entries(catT).sort((a, b) => b[1] - a[1])[0];
  const text = `💸 My Spendly Summary\n━━━━━━━━━━━━━━━━━━━━\nTotal Spent: ${fmt(total)}\nTransactions: ${expenses.length}\nTop Category: ${top ? CATS[top[0]].emoji + ' ' + top[0] : '—'}\nDaily Avg: ${fmt(total / 31)}\n━━━━━━━━━━━━━━━━━━━━\n#Spendly #ExpenseTracker`;
  navigator.clipboard.writeText(text)
    .then(() => toast('📋 Copied to clipboard!', 's'))
    .catch(() => toast('⚠️ Copy failed', 'e'));
}

function clearAll() {
  if (!confirm('Clear ALL data? This cannot be undone.')) return;
  expenses = []; budgets = {}; recurring = [];
  save(); render();
  toast('🗑️ All data cleared', 'i');
}

// ── NOTIFICATIONS ─────────────────────────────────────────────────
function requestNotif() {
  if (!('Notification' in window)) { toast('⚠️ Browser does not support notifications', 'e'); return; }
  Notification.requestPermission().then(p => {
    p === 'granted' ? toast('🔔 Notifications enabled!', 's') : toast('🔕 Notifications blocked', 'e');
  });
}

// ── TOAST ─────────────────────────────────────────────────────────
function toast(msg, type = 'i') {
  const t = document.createElement('div');
  t.className = `toast t${type}`;
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => {
    t.style.opacity    = '0';
    t.style.transition = 'opacity .3s';
    setTimeout(() => t.remove(), 300);
  }, 2200);
}
