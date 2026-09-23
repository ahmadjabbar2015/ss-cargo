S&S CARGO — FREIGHT OS
Freight brokerage + dispatch operations app (working prototype)
================================================================

WHAT THIS IS
A single-file web app for running a freight brokerage and dispatch
business end to end: quote, book, dispatch, deliver, invoice, get
paid, pay the carrier. Not a marketing site — this is the software
the staff would sit in all day.

HOW TO OPEN
Double-click index.html. No server, no build, no install.
Fully standalone: zero network requests, works offline.
Sign in with any role (no password) — "Operations manager" sees
everything.

MODULES
  Dashboard    Cash position, AR/AP, revenue and margin trend,
               a ranked "needs action" queue, activity feed
  Quotes       Pipeline with a live pricing calculator; margin
               under 10% is blocked pending manager override.
               Win a quote and it books as a real load.
  Loads        Full register with live margin per load. Open any
               load for Overview / Financials / Timeline /
               Documents. Advance status; on delivery it creates
               a POD and a carrier settlement automatically.
  Dispatch     Trucks, drivers and who is covering what.
  Invoices     ACCOUNTS RECEIVABLE. Draft → Sent → Partial →
  (AR)         Paid / Overdue / Disputed. Create invoices from
               delivered loads (grouped by customer), send them,
               record full or partial payments by ACH / wire /
               check / card, batch-select and settle several at
               once, resolve disputes. Aging buckets and per-
               customer exposure recalculate as you work.
  Carrier pay  ACCOUNTS PAYABLE. Settlements with gross pay,
  (AP)         deductions (fuel advance recovery), quick-pay fee
               (3%, next-day) vs Net 30, and factored carriers
               paid to their factor under the NOA on file.
               Approve individually or in bulk, then run a
               payment batch with a preview of the total debit.
  Payments     Every dollar in and out, cash-in vs cash-out by
               week, totals by method, and customer payment
               methods on file (last four only).
  Customers    Credit limits with live utilisation, terms,
               open AR, lifetime revenue and margin.
  Carriers     Onboarding queue (approve / decline), active
               roster, insurance expiry flags, on-time and
               rating scorecards, amount currently owed.
  Reports      Customer and lane profitability, revenue by
               equipment, carrier scorecard.
  Settings     Company profile, authority and insurance, default
               terms, users and roles, accessorial catalog,
               integrations.

IT ACTUALLY CALCULATES
Nothing is a static mock-up. One data model drives it all:
  load margin   = (linehaul + customer accessorials)
                − (carrier pay + carrier accessorials)
  invoice status derives from balance and due date
  AR aging, DSO, credit utilisation, cash position, settlement
  net pay, quick-pay fees and every KPI recompute on each action.
Add a detention charge to a load and it flows to the invoice
total and the margin. Record a payment and the load flips to
Paid, the aging chart shifts and cash position moves.

STATE
Your changes are saved in the browser (localStorage) so the demo
survives a refresh. "Reset demo data" on the Dashboard restores
the starting state before a meeting.

WHAT IS NOT REAL
  - No backend, no database, no API. Everything is in the page.
  - No authentication — the login is a role picker.
  - No real payment rails. No card or bank credentials are
    stored or transmitted; only a last-four label is displayed.
  - All companies, MC/DOT numbers, rates and invoices are
    invented sample data.

MAKING IT YOURS
  - Logo: the LOGO constant near the bottom of the script (a
    base64 PNG). Swap it for your own.
  - Colours: the :root token block at the top of the <style>.
    --brand and --brand-2 are the S&S blues; light and dark
    palettes are both defined there.
  - Sample data: the CUSTOMERS, CARRIERS, TRUCKS, LANES and
    QUOTES arrays, plus buildLoads() and seed().
  - Business rules: quick-pay fee %, target margin, override
    threshold and payment terms live in seed() and the Settings
    view.

NEXT STEP IF YOU BUILD IT FOR REAL
The natural stack is a Postgres schema mirroring this data model
(customers, carriers, loads, accessorials, invoices, payments,
settlements), a REST or GraphQL API, and this UI on top.
Integrations worth doing first: FMCSA SAFER for carrier
verification, an accounting sync (QuickBooks/Xero), an ACH
processor for customer payments, and a tracking provider.
