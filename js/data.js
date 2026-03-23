// ── CATEGORIES ────────────────────────────────────────────────────
const CATS = {
  Food:          { emoji: '🍔', color: '#f76a8c' },
  Transport:     { emoji: '🚗', color: '#7c6af7' },
  Shopping:      { emoji: '🛍', color: '#f7c76a' },
  Health:        { emoji: '💊', color: '#6af7c8' },
  Entertainment: { emoji: '🎬', color: '#f79c6a' },
  Bills:         { emoji: '🧾', color: '#6aaef7' },
  Education:     { emoji: '📚', color: '#c86af7' },
  Other:         { emoji: '📦', color: '#a0a0b0' },
};

// ── STATE ──────────────────────────────────────────────────────────
let expenses  = JSON.parse(localStorage.getItem('sp2_expenses')  || '[]');
let budgets   = JSON.parse(localStorage.getItem('sp2_budgets')   || '{}');
let recurring = JSON.parse(localStorage.getItem('sp2_recurring') || '[]');
let txFilter  = 'all';
const now     = new Date();

// ── PERSISTENCE ───────────────────────────────────────────────────
function save() {
  localStorage.setItem('sp2_expenses',  JSON.stringify(expenses));
  localStorage.setItem('sp2_budgets',   JSON.stringify(budgets));
  localStorage.setItem('sp2_recurring', JSON.stringify(recurring));
}

// ── UTILITIES ─────────────────────────────────────────────────────
function fmt(n) {
  return '₹' + Number(n).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}
function catTotal(cat) {
  return expenses.filter(e => e.category === cat).reduce((s, e) => s + e.amount, 0);
}
function getLastMonthSpend() {
  const s = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const e = new Date(now.getFullYear(), now.getMonth(), 0);
  return expenses
    .filter(ex => { const d = new Date(ex.date + 'T00:00:00'); return d >= s && d <= e; })
    .reduce((t, ex) => t + ex.amount, 0);
}
