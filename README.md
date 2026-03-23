# 💸 Spendly — Smart Expense Tracker

A clean, modern, single-page expense tracker built with vanilla HTML, CSS, and JavaScript. No frameworks, no build tools, no dependencies — just open `index.html` and go.

![Dark mode dashboard with expense stats, donut chart, and transaction list](https://via.placeholder.com/900x500/0a0a0f/7c6af7?text=Spendly+Screenshot)

---

## ✨ Features

- **Dashboard** — Stats cards, weekly trend chart, spending donut, category bars, budget tracking
- **Analytics** — 30-day heatmap, monthly comparison, category deep dive
- **Recurring** — Track monthly subscriptions/bills and apply them in one click
- **Wrapped** — Monthly spending summary with fun insights
- **Export** — Download CSV or print a PDF report
- **Budgets** — Set per-category limits with over-budget alerts
- **Dark / Light mode** — Persisted via localStorage
- **Push notifications** — Browser budget alerts
- **Fully responsive** — Mobile-friendly layout

---

## 🗂️ Project Structure

```
spendly/
├── index.html          # Main HTML — structure & modals
├── css/
│   └── styles.css      # All styling, themes, animations
├── js/
│   ├── data.js         # Constants (CATS), state, localStorage helpers
│   ├── render.js       # All DOM rendering functions
│   ├── actions.js      # Add/delete expenses, budgets, recurring
│   └── utils.js        # Tabs, theme toggle, modals, export, toast
└── README.md
```

---

## 🚀 Getting Started

```bash
git clone https://github.com/YOUR_USERNAME/spendly.git
cd spendly
# Open in browser — no build step needed
open index.html
```

Or just double-click `index.html`.

---

## 🛠️ Roadmap / Ideas for Improvement

- [ ] Add income tracking and savings rate
- [ ] Multi-month data navigation (previous months)
- [ ] Import CSV from bank statements
- [ ] PWA support (offline, installable)
- [ ] Cloud sync / account support
- [ ] Multi-currency support
- [ ] Custom categories
- [ ] Spending goals
- [ ] Split expenses between people

---

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m "Add my feature"`
4. Push and open a Pull Request

---

## 📄 License

MIT — free to use, modify, and distribute.
