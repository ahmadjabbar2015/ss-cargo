# S&S Cargo Freight OS — User Manual

Freight OS is the operations system for running a freight brokerage end to end: **quote a load → book it → dispatch it → deliver it → invoice the customer → get paid → pay the carrier.** Everything lives in one screen — the sidebar switches views, nothing reloads the page.

---

## 1. Signing In

- Go to the app URL and sign in with your email and password on the **Login** screen.
- After login you land on a different screen depending on your role:
  - **Billing** → Invoices
  - **Dispatcher** → Dispatch
  - Everyone else → Dashboard
- Click **Log out** (from the sidebar/header) to end your session at any time.

> **Note:** All signed-in users currently see the full sidebar and every screen — roles decide only your starting page, not what you're allowed to see or do. There's no self-service "forgot password" — ask an admin to reset it for you.

---

## 2. Getting Around

- **Sidebar** — grouped into *Operations*, *Finance*, *Network*, *Company*. Click any item to switch views instantly.
- **Global search** — press `Ctrl+K` (or click the search box) and type a load ID, invoice number, customer, or carrier name. Press Enter to jump straight to that record.
- **Notification bell** — shows a count of items needing attention (overdue invoices, expiring insurance, at-risk loads); click it to jump to the Dashboard.
- **Badges** on sidebar items show live counts (new quotes, active loads, overdue invoices, pending settlements, pending carrier applications).
- **Theme toggle** — switch between light and dark mode; your choice is remembered.
- Every action you take (recording a payment, sending an invoice, approving a settlement, etc.) confirms with a small toast message in the corner.

---

## 3. Dashboard

Your home base — a snapshot of the whole business:

- **KPI tiles**: cash position, open receivables, carrier pay due, collections due in the next 30 days, revenue/margin month-to-date, active loads, average margin per load.
- **Attention queue**: a list of things that need a decision right now (an overdue invoice, insurance about to expire, a load at risk) — each has a one-click action to resolve it.
- **Activity feed**: recent events across the system.
- **Cash chart**: 8 weeks of money in vs. money out.
- **AR aging meters** and a **margin-by-week chart**.
- **Top profitable lanes**.
- Quick actions: **Reset demo data**, **Create invoice**, **+ New load**.

---

## 4. Quotes

Where freight requests start.

- Filter by status: **New / Quoted / Won / Lost**.
- KPI tiles show unpriced quotes, quotes waiting on the customer's decision, your win rate, and total pipeline value.
- Click a quote to open the **pricing calculator**:
  - Enter the customer rate and the carrier cost — margin $ and margin % update live, along with rate-per-mile.
  - If margin drops below **10%**, the system flags it and requires manager sign-off before you can send the quote.
  - **Send quote** — send it to the customer.
  - **Win & book load** — converts the quote into a real load on the Loads board.
  - **Mark lost** — closes it out as lost.

---

## 5. Loads

The full register of freight you're moving.

- **Search** by load ID, lane, customer, carrier, or PO number; **filter** by status.
- KPI tiles: total revenue, cost, and margin across visible loads.
- Each row shows a 4-stage progress bar: **Booked → At pickup → In transit → Delivered** (or flagged **At risk**).
- **+ New load** to create one manually. **Export** currently just simulates emailing a CSV (not a real download yet).
- Click a load to open its detail drawer, with tabs:
  - **Overview** — customer, carrier, pickup/delivery, weight, commodity. **Advance status** moves it to the next stage; **Add accessorial** adds an extra charge (detention, lumper, etc.).
  - **Financials** — billed amount, carrier pay, margin, and links to the related invoice/settlement.
  - **Timeline** — a 4-step delivery timeline with timestamps.
  - **Documents** — POD and other files (upload button is a placeholder for now).
- Marking a load **Delivered** automatically creates its proof-of-delivery document and a carrier settlement.

---

## 6. Dispatch

Real-time view of your fleet.

- **Truck/driver board**, grouped by status: Available / On load / Out of service. **Assign** a truck to a load from here.
- **In-motion table** — loads currently moving, with an **Advance** button to push each one to its next status.

---

## 7. Invoices (Accounts Receivable)

Billing customers and tracking what's owed to you.

- KPI tiles: open receivables, overdue $, average days-to-pay (DSO), disputed $.
- A banner reminds you when delivered loads still need to be invoiced.
- **Search** and **filter** by status: Draft / Sent / Partial / Overdue / Paid / Disputed.
- Select multiple invoices with the row checkboxes to **Send/remind** or **Record payments** in bulk.
- Per row: **Send** (for Draft invoices) or **Record payment**.
- **+ Create invoice** opens a picker of delivered, not-yet-invoiced loads grouped by customer — pick which ones to bill.
- **Send statements** sends account statements to customers.
- **Record a payment**: choose ACH, Wire, Check, Card, or Cash, full or partial. A full payment closes the invoice and marks its load(s) **Paid**.
- Side charts: receivables aging and per-customer credit exposure.

---

## 8. Carrier Pay (Accounts Payable / Settlements)

Paying the carriers who hauled your freight.

- KPI tiles: payable open, awaiting approval, paid month-to-date, quick-pay fees earned.
- Filter by status: Pending / Approved / Paid.
- **Approve all pending** or **Run payment batch** (previews the total debit before sending).
- Each settlement shows gross pay, deductions (e.g. fuel-advance recovery), the quick-pay fee (3%, paid next business day) vs. standard Net 30, and the final net pay — plus whether payment goes direct to the carrier or to a factoring company.
- Per-row **Approve** / **Pay now**.
- Side panels: what's currently owed by carrier, and an explainer of how carrier pay works.

---

## 9. Payments

A single ledger of every dollar moving in or out.

- Filter by direction: All / Money in / Money out.
- 8-week cash chart and totals broken down by payment method.
- **Payment methods on file** — per customer, masked to the last 4 digits, with an **Update** option.

---

## 10. Customers

- KPI tiles: active customers, total exposure, credit granted, customers over 80% of their credit limit.
- Table of accounts: payment terms, payment method, load count, lifetime revenue, credit utilization bar, open AR.
- **+ Add customer** opens a form (name, contact, email, phone, terms, credit limit, payment method) — this is saved to the database; if the database is briefly unreachable it's kept locally until it can sync.
- Click a customer to open their profile: **Account / Loads / Invoices** tabs.

---

## 11. Carriers

- KPI tiles: active carriers, awaiting decision, insurance expiring within 30 days, average on-time %.
- **Onboarding queue** — new carrier applicants, each with **Approve** / **Decline**.
- **Active roster** table: equipment type, loads hauled, on-time %, star rating, quick-pay vs. Net-30, factoring status, insurance expiry, amount currently owed.
- Click a carrier for their profile: **Profile / Loads / Settlements** tabs, with a warning banner if insurance is about to expire.

---

## 12. Reports

- Revenue and margin month-to-date, revenue per load, revenue per mile.
- Weekly revenue and margin charts.
- Customer profitability table (margin % color-coded).
- Lane profitability.
- Revenue by equipment type.
- Carrier scorecard — loads hauled, on-time %, rating, and a Preferred / Approved / Watch tag.

---

## 13. Settings

Mostly reference/display information in the current build (not editable yet):

- Company profile (legal name, MC/DOT numbers, bond, insurance coverage).
- Default business terms (payment terms, quick-pay fee %, target margin 15%, manager-override threshold 10%, fuel-advance ceiling).
- Users & roles list (view only).
- Accessorial rate catalog (Detention, Layover, TONU, Lumper, Driver assist, Tarps).
- Integrations list (QuickBooks Online, Stripe/ACH, FMCSA SAFER, Macropoint tracking, TAFS factoring, Twilio SMS) — Connect/Manage buttons are placeholders.

---

## 14. How the Numbers Work

- **Load margin** = (customer linehaul + customer accessorials) − (carrier pay + carrier accessorials).
- **Target gross margin**: 15%. Below **10%** margin, a quote needs manager sign-off before it can be sent.
- **Quick-pay**: carrier gets paid next business day for a 3% fee, instead of standard **Net 30**.
- **Fuel advances** are capped at 40% of linehaul and recovered as a deduction on the carrier's settlement.
- Dashboard, AR aging, DSO, cash position, and settlement math all recalculate live as you take actions — there's no separate "save and refresh" step.

---

## 15. Known Limitations (current build)

- No role-based screen restrictions — every signed-in user can see and act on every screen.
- "Export" buttons (Loads, Invoices) simulate an emailed CSV rather than producing a real file.
- Document upload on a load is a placeholder.
- Settings screen is view-only; integrations aren't actually connected.
- No self-service password reset.
