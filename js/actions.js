// ── ADD / DELETE EXPENSES ─────────────────────────────────────────
function addExpense() {
  const desc   = document.getElementById('desc').value.trim();
  const amount = parseFloat(document.getElementById('amount').value);
  const cat    = document.getElementById('category').value;
  const date   = document.getElementById('date').value;

  if (!desc || isNaN(amount) || amount <= 0 || !date) {
    toast('⚠️ Fill all fields', 'e');
    return;
  }

  expenses.unshift({ id: Date.now(), desc, amount, category: cat, date });
  save();
  render();

  document.getElementById('desc').value = '';
  document.getElementById('amount').value = '';
  document.getElementById('date').valueAsDate = new Date();
  toast('✅ Expense added!', 's');
  checkBudget(cat);
}

function deleteExpense(id) {
  expenses = expenses.filter(e => e.id !== id);
  save();
  render();
  toast('🗑️ Deleted', 'i');
}

function filterTx(v) {
  txFilter = v;
  renderTransactions();
}

// ── RECURRING EXPENSES ────────────────────────────────────────────
function saveRecurring() {
  const name = document.getElementById('recName').value.trim();
  const amt  = parseFloat(document.getElementById('recAmt').value);
  const cat  = document.getElementById('recCat').value;

  if (!name || isNaN(amt) || amt <= 0) { toast('⚠️ Fill all fields', 'e'); return; }

  recurring.push({ id: Date.now(), name, amount: amt, category: cat });
  save();
  renderRecurring();
  closeModal('recModal');
  document.getElementById('recName').value = '';
  document.getElementById('recAmt').value  = '';
  toast('🔁 Recurring added!', 's');
}

function deleteRecurring(id) {
  recurring = recurring.filter(r => r.id !== id);
  save();
  renderRecurring();
  toast('🗑️ Removed', 'i');
}

function applyRecurring() {
  const key     = `sp2_applied_${now.getFullYear()}_${now.getMonth()}`;
  const applied = JSON.parse(localStorage.getItem(key) || '[]');
  let n = 0;

  recurring.forEach(r => {
    if (!applied.includes(r.id)) {
      const d = new Date(now.getFullYear(), now.getMonth(), 1);
      expenses.push({
        id: Date.now() + Math.random(),
        desc: r.name + ' (recurring)',
        amount: r.amount,
        category: r.category,
        date: d.toISOString().split('T')[0],
        isRecurring: true,
      });
      applied.push(r.id);
      n++;
    }
  });

  if (n > 0) {
    localStorage.setItem(key, JSON.stringify(applied));
    save();
    render();
    toast(`🔁 Applied ${n} recurring expense${n > 1 ? 's' : ''}!`, 's');
  } else {
    toast('ℹ️ Already applied this month', 'i');
  }
}

// ── BUDGETS ───────────────────────────────────────────────────────
function saveBudget() {
  const cat = document.getElementById('budgetCat').value;
  const amt = parseFloat(document.getElementById('budgetAmt').value);

  if (isNaN(amt) || amt <= 0) { toast('⚠️ Enter valid amount', 'e'); return; }

  budgets[cat] = amt;
  save();
  renderBudgets();
  closeModal('budgetModal');
  document.getElementById('budgetAmt').value = '';
  toast('💰 Budget set!', 's');
}

function checkBudget(cat) {
  if (!budgets[cat]) return;
  const spent = catTotal(cat);
  const pct   = spent / budgets[cat] * 100;

  if (pct >= 100) showBanner(`🚨 ${cat} budget exceeded! ${fmt(spent)} / ${fmt(budgets[cat])}`);
  else if (pct >= 80) showBanner(`⚠️ ${cat} budget at ${pct.toFixed(0)}% — ${fmt(spent)} of ${fmt(budgets[cat])}`);

  if (pct >= 80 && Notification.permission === 'granted') {
    new Notification('Spendly Budget Alert', {
      body: `${cat}: ${fmt(spent)} of ${fmt(budgets[cat])} (${pct.toFixed(0)}%)`,
      icon: '💸',
    });
  }
}

function showBanner(t) {
  document.getElementById('notifText').textContent = t;
  document.getElementById('notifBanner').style.display = 'flex';
}
