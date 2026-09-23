

<!-- ================= LOGIN ================= -->
<div class="login" id="login">
  <div class="login-art">
    <canvas id="lanes" aria-hidden="true"></canvas>
    <div class="z">
      <h2>The whole freight business in one place.</h2>
      <p>Quotes, loads, dispatch, carrier compliance, invoicing and settlements — one record from booking to bank.</p>
    </div>
    <div class="z facts">
      <div><b>12,400</b><span>Carriers</span></div>
      <div><b>48</b><span>States</span></div>
      <div><b>$2M / $1M</b><span>Cargo / liability</span></div>
      <div><b>24/7</b><span>Dispatch</span></div>
    </div>
  </div>
  <div class="login-form">
    <div class="login-box">
      <div class="lg"><img id="logoLogin" alt="S&amp;S Cargo"></div>
      <h1>Sign in to Freight OS</h1>
      <p class="sub">Choose a role to explore the demo. No password needed.</p>
      <div class="roles" id="roles"></div>
      <div class="f" style="margin-bottom:14px"><label for="lemail">Email</label><input id="lemail" type="email" value="dana@sscargo.example"></div>
      <button class="btn btn-p" style="width:100%;padding:11px" id="loginGo">Continue</button>
      <p class="hint" style="margin-top:14px;font-size:11.5px;color:var(--ink-3)">Prototype build — sample data, no server, nothing leaves this page.</p>
    </div>
  </div>
</div>

<!-- ================= APP ================= -->
<div id="app" hidden>
  <aside class="side" id="side">
    <div class="side-brand"><span class="plate"><img id="logoSide" alt="S&amp;S Cargo"></span></div>
    <div id="sideNav"></div>
    <div class="side-foot">
      <div class="side-user"><span class="av" id="uav">DW</span><span><b id="uname">Dana Whitfield</b><span id="urole">Operations manager</span></span></div>
      <button class="btn btn-g btn-x" id="signout" style="color:#9EBEE6;width:100%;justify-content:flex-start">Sign out</button>
    </div>
  </aside>

  <div class="main">
    <div class="topbar">
      <button class="icon-btn" id="burger" aria-label="Menu"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 6h18M3 12h18M3 18h18"/></svg></button>
      <label class="gsearch">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.4-3.4"/></svg>
        <input id="gsearch" type="search" placeholder="Search loads, invoices, carriers, customers…" aria-label="Global search"><kbd>⌘K</kbd>
      </label>
      <div class="spacer"></div>
      <button class="btn btn-p btn-x" id="quickNew">+ New load</button>
      <button class="icon-btn" id="bell" aria-label="Notifications"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8a6 6 0 1 0-12 0c0 7-3 8-3 8h18s-3-1-3-8"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/></svg><em></em></button>
      <button class="icon-btn" id="themeBtn" aria-label="Toggle theme"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg></button>
    </div>
    <div class="pagehead" id="pagehead"></div>
    <div class="content" id="content"></div>
  </div>
</div>

<div class="scrim navscrim" id="navScrim" hidden></div>
<aside class="drawer" id="drawer" hidden aria-label="Record detail"></aside>
<div class="scrim" id="modalScrim" hidden><div class="modal" id="modal" role="dialog" aria-modal="true"></div></div>
<div class="toast" id="toast"><span id="toastMsg"></span></div>

