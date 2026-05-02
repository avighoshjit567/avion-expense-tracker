# Avion Expense Tracker

A personal income + expense tracker built with Vue 3, TypeScript, and reusable UI components.

## Live app

GitHub Pages deployment is configured for this repository. Once the Pages workflow finishes, the app will be available at:

- <https://avighoshjit567.github.io/avion-expense-tracker/>

## What it includes

- dashboard with cash-flow summary cards
- income, expense, and transfer tracking
- account management
- category management
- monthly budgets with progress tracking
- local-first persistence in `localStorage`
- JSON export/import backup flow
- dark mode
- reusable UI layer:
  - `BaseButton`
  - `BaseInput`
  - `BaseModal`
  - `AppDataTable`
  - `PageHeader`
  - `SummaryCard`

## Local development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Notes

This app is intentionally local-first so it can work immediately without any backend setup. All data stays in the browser unless you export it yourself.
