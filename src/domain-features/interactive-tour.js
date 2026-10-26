/**
 * MatbakhLink Interactive Product Tour
 * Domain 6: Feature Module - Interactive Sandbox Studio
 * Zero emojis — Firecrawl Light Theme Standard
 */
(function(window) {
  'use strict';

  const TOUR_STAGES = {
    menu: {
      title: 'Stage 1: Guest Dine-In Mobile Menu',
      desc: 'Seated diners scan Table 04 QR code to open the menu with zero app download.',
      badge: 'Table 04 Active',
      buttonText: 'Launch Full Diner Menu ->',
      screen: 'menu',
      renderHtml: () => `
        <div style="display: flex; gap: 20px; align-items: center; justify-content: space-between; flex-wrap: wrap;">
          <div style="flex: 1; min-width: 260px;">
            <div style="font-size: 11px; font-family: var(--font-mono); color: var(--color-flame); text-transform: uppercase; font-weight: 600; margin-bottom: 4px;">Zero-Friction Seated Entry</div>
            <h4 style="font-size: 16px; font-weight: 700; margin-bottom: 6px;">Angus Flame-Grilled Burger</h4>
            <p style="font-size: 13px; color: var(--color-slate); margin-bottom: 12px;">540 kcal · Brioche bun, house flame glaze, aged cheddar.</p>
            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
              <span style="font-family: var(--font-mono); font-size: 11px; background: #fff7ed; color: #ff4d00; padding: 2px 8px; border-radius: 999px;">Single (185.00 EGP)</span>
              <span style="font-family: var(--font-mono); font-size: 11px; background: #ffffff; border: 1px solid #e5e7eb; color: #727272; padding: 2px 8px; border-radius: 999px;">Double Patty (+45.00 EGP)</span>
            </div>
          </div>
          <div style="background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 14px 18px; text-align: right;">
            <div style="font-size: 11px; font-family: var(--font-mono); color: var(--color-slate);">TABLE TOTAL (inc. 14% VAT)</div>
            <div style="font-family: var(--font-mono); font-size: 20px; font-weight: 700; color: #262626;">210.90 EGP</div>
            <div style="font-size: 11px; color: #16a34a; font-weight: 500; margin-top: 4px;">Instant Dispatch &lt; 0.8s</div>
          </div>
        </div>
      `
    },
    kds: {
      title: 'Stage 2: Kitchen Display Pass (KDS)',
      desc: 'Cook line displays tickets with high-visibility urgency colors and timer tracking.',
      badge: 'Cook Line Pass',
      buttonText: 'Launch Full KDS Screen ->',
      screen: 'kds',
      renderHtml: () => `
        <div style="display: flex; gap: 20px; align-items: center; justify-content: space-between; flex-wrap: wrap;">
          <div style="flex: 1; min-width: 260px;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
              <span style="font-family: var(--font-mono); font-weight: 700; font-size: 14px;">#ORD-104</span>
              <span style="font-family: var(--font-mono); font-size: 11px; background: #eff6ff; color: #2563eb; padding: 2px 8px; border-radius: 999px; font-weight: 600;">ON FLAME GRILL (03:45)</span>
            </div>
            <div style="font-size: 13px; font-weight: 600; color: #262626;">Table 04 · Dine-In</div>
            <p style="font-size: 12px; color: var(--color-slate); margin-top: 2px;">1x Angus Burger (Double Patty, Well Done) · 1x Truffle Fries</p>
          </div>
          <div style="display: flex; gap: 8px;">
            <button class="btn-pill-primary" style="padding: 6px 14px; font-size: 12px;" onclick="switchMainScreen('kds')">Mark Plated & Ready</button>
          </div>
        </div>
      `
    },
    tracker: {
      title: 'Stage 3: Real-Time Order Tracker',
      desc: 'Guests see their food progress step-by-step from grill to table delivery.',
      badge: 'Live Guest Tracker',
      buttonText: 'View Order Tracker ->',
      screen: 'tracker',
      renderHtml: () => `
        <div style="display: flex; gap: 16px; align-items: center; justify-content: space-between; flex-wrap: wrap;">
          <div style="flex: 1;">
            <div style="font-family: var(--font-mono); font-size: 11px; color: var(--color-slate); text-transform: uppercase;">Ticket #ORD-104 Destination</div>
            <h4 style="font-size: 16px; font-weight: 700; margin-top: 2px;">Table 04 Active Session</h4>
            <div style="display: flex; align-items: center; gap: 12px; margin-top: 10px;">
              <span style="display: inline-flex; align-items: center; gap: 6px; font-size: 12px; color: #ff4d00; font-weight: 600;">
                <span style="width: 8px; height: 8px; border-radius: 50%; background: #ff4d00;"></span>
                Step 2: Flame-Grill Preparation
              </span>
              <span style="font-family: var(--font-mono); font-size: 11px; color: var(--color-slate);">Est. 8-10 mins</span>
            </div>
          </div>
          <div style="background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 12px 16px; text-align: center;">
            <div style="font-size: 11px; font-family: var(--font-mono); color: var(--color-slate);">SYNC LATENCY</div>
            <div style="font-family: var(--font-mono); font-size: 16px; font-weight: 700; color: #16a34a;">142ms</div>
          </div>
        </div>
      `
    },
    stand: {
      title: 'Stage 4: Acrylic Table Stand Generator',
      desc: 'Generate printable vector table stands encoded with exact table coordinates.',
      badge: 'Zero CapEx Hardware',
      buttonText: 'Deploy QR Table Stands ->',
      screen: 'stand',
      renderHtml: () => `
        <div style="display: flex; gap: 20px; align-items: center; justify-content: space-between; flex-wrap: wrap;">
          <div style="flex: 1; min-width: 260px;">
            <div style="font-family: var(--font-mono); font-size: 11px; color: var(--color-slate); text-transform: uppercase;">Physical Tabletop Deployment</div>
            <h4 style="font-size: 16px; font-weight: 700; margin-top: 2px;">Table Stand QR Card</h4>
            <p style="font-size: 13px; color: var(--color-slate); margin-top: 4px;">Point camera to order. Works on cellular 4G native with zero guest captive Wi-Fi hassle.</p>
          </div>
          <button class="btn-pill-ghost" style="padding: 7px 16px; font-size: 12px;" onclick="window.open('table-stand.html', '_blank')">
            Print Acrylic Card Preview
          </button>
        </div>
      `
    }
  };

  let activeTab = 'menu';

  function setTourTab(tabKey) {
    if (!TOUR_STAGES[tabKey]) return;
    activeTab = tabKey;

    document.querySelectorAll('.tour-tab-pill').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabKey);
    });

    const stage = TOUR_STAGES[tabKey];
    const box = document.getElementById('tourStageBox');
    const ctaBtn = document.getElementById('tourActionBtn');

    if (box) {
      box.innerHTML = stage.renderHtml();
    }
    if (ctaBtn) {
      ctaBtn.innerText = stage.buttonText;
      ctaBtn.onclick = () => window.switchMainScreen(stage.screen);
    }
  }

  window.MatbakhTour = {
    setTab: setTourTab,
    init: () => setTourTab('menu')
  };

  window.setTourTab = setTourTab;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTourTab('menu'));
  } else {
    setTimeout(() => setTourTab('menu'), 50);
  }
})(window);
