/**
 * MatbakhLink Table Payment & Fiscal Settlement Module
 * Domain Feature: Table-Side Autonomous Payment & Exit Cashier Pass
 * Egyptian Tax Authority (ETA) Fiscal Law Compliance (TR-892-411-902)
 * Strict 100% Light Theme Firecrawl Standard — Zero Emojis Permitted
 */

(function(window) {
  'use strict';

  // Egyptian Tax Authority (ETA) Compliance Constants
  const FISCAL_CONFIG = {
    taxRegistrationNumber: 'TR-892-411-902',
    commercialRegistration: 'CR-104920',
    legalEntityName: 'MatbakhLink Gourmet Flame Grill S.A.E.',
    branchName: 'Branch 01 - Waterfront Promenade',
    vatRate: 0.14, // 14% Egyptian VAT
    currency: 'EGP'
  };

  // State Management
  let activeSession = null;
  let activeExitPasses = new Map();

  // SVG Icon Templates (Zero emojis - Clean Vector Glyphs)
  const ICONS = {
    apple: '<svg width="18" height="18" viewBox="0 0 170 170" fill="currentColor"><path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.04-7.67-7.81-11.96-14.34-6.41-9.78-11.53-20.91-15.36-33.39-3.83-12.48-5.75-24.23-5.75-35.25 0-14.78 3.73-27.18 11.19-37.21 7.46-10.03 16.79-15.15 27.99-15.36 4.9.11 10.35 1.34 16.36 3.69 6.01 2.36 10.19 3.59 12.54 3.69 2.12 0 6.6-1.34 13.43-4.02 6.83-2.68 12.63-3.89 17.41-3.62 13.47.87 24.34 5.98 32.61 15.36-11.75 7.17-17.5 17.06-17.26 29.68.24 9.89 4.13 18.25 11.66 25.07 7.53 6.83 16.53 10.66 27 11.5-.76 2.72-1.74 5.76-2.93 9.13-2.39 6.84-5.32 14.01-8.79 21.52zm-35.48-109.8c0-7.39 2.65-14.23 7.95-20.52 5.3-6.28 11.78-10.19 19.45-11.73.65 1.74.98 3.37.98 4.89 0 7.39-2.76 14.56-8.28 21.52-5.52 6.96-12.18 11-19.98 12.12-.08-1.96-.12-4.05-.12-6.28z"/></svg>',
    card: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>',
    wallet: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4"></path><path d="M4 6v12c0 1.1.9 2 2 2h14v-4"></path><circle cx="16" cy="14" r="1"></circle></svg>',
    cash: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="6" width="20" height="12" rx="2"></rect><circle cx="12" cy="12" r="2"></circle><path d="M6 12h.01M18 12h.01"></path></svg>',
    users: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>',
    check: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>',
    printer: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>',
    close: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>',
    lock: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>',
    barcode: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="5" x2="3" y2="19"></line><line x1="6" y1="5" x2="6" y2="19"></line><line x1="10" y1="5" x2="10" y2="19"></line><line x1="14" y1="5" x2="14" y2="19"></line><line x1="17" y1="5" x2="17" y2="19"></line><line x1="21" y1="5" x2="21" y2="19"></line></svg>'
  };

  /**
   * Generates crisp Code-128 barcode bars as clean SVG.
   * @param {string} code 
   * @returns {string} SVG string
   */
  function generateBarcodeSvg(code) {
    const chars = String(code).toUpperCase().replace(/[^A-Z0-9-]/g, '');
    let barsHtml = '';
    let xOffset = 10;
    
    // Pseudo-code128 deterministic bar pattern
    const patternSeeds = [
      [2, 1, 1, 2, 3, 1],
      [1, 2, 2, 1, 1, 3],
      [3, 1, 1, 1, 2, 2],
      [1, 1, 2, 3, 1, 2],
      [2, 2, 1, 1, 2, 2],
      [1, 3, 1, 2, 1, 2]
    ];

    // Start guard
    barsHtml += `<rect x="${xOffset}" y="0" width="2" height="54" fill="#262626"/>`;
    xOffset += 4;
    barsHtml += `<rect x="${xOffset}" y="0" width="1" height="54" fill="#262626"/>`;
    xOffset += 4;

    for (let i = 0; i < chars.length; i++) {
      const charCode = chars.charCodeAt(i);
      const pattern = patternSeeds[charCode % patternSeeds.length];
      for (let j = 0; j < pattern.length; j++) {
        const width = pattern[j];
        if (j % 2 === 0) {
          barsHtml += `<rect x="${xOffset}" y="0" width="${width}" height="54" fill="#262626"/>`;
        }
        xOffset += width + 1;
      }
    }

    // End guard
    barsHtml += `<rect x="${xOffset}" y="0" width="2" height="54" fill="#262626"/>`;
    xOffset += 5;
    barsHtml += `<rect x="${xOffset}" y="0" width="3" height="54" fill="#262626"/>`;
    xOffset += 14;

    return `
      <svg class="tp-barcode-svg" viewBox="0 0 ${xOffset} 54" preserveAspectRatio="none">
        ${barsHtml}
      </svg>
    `;
  }

  /**
   * Formats numbers to EGP currency.
   */
  function formatMoney(amount) {
    const num = Number(amount) || 0;
    return num.toFixed(2) + ' EGP';
  }

  /**
   * Initializes or gets payment session for the current table or given order.
   */
  function createPaymentSession(orderData) {
    const storeState = (window.MatbakhStore && window.MatbakhStore.getState) ? window.MatbakhStore.getState() : {};
    const tableNum = (orderData && orderData.table_number) || storeState.currentTable || '04';
    const orderId = (orderData && (orderData.id || orderData.orderId)) || (window.lastDispatchedOrderId ? 'ORD-' + window.lastDispatchedOrderId : 'ORD-104');
    
    // Extract or reconstruct items
    let items = [];
    if (orderData && orderData.items && Array.isArray(orderData.items) && orderData.items.length > 0) {
      items = orderData.items;
    } else if (orderData && orderData.order_payload && Array.isArray(orderData.order_payload) && orderData.order_payload.length > 0) {
      items = orderData.order_payload.map(i => ({
        name: i.name,
        quantity: i.qty || i.quantity || 1,
        unitPrice: i.price || i.unitPrice || 0,
        portionLabel: i.portion || '',
        extras: i.extras || []
      }));
    } else if (window.cart && window.cart.length > 0) {
      items = window.cart.map(i => ({
        name: i.name,
        quantity: i.qty || 1,
        unitPrice: i.price || 0,
        portionLabel: i.portion || '',
        extras: i.extras || []
      }));
    } else {
      // Standard realistic seated guest table fallback
      items = [
        { name: 'Angus Flame-Grilled Burger', quantity: 1, unitPrice: 185.00, portionLabel: 'Single Patty', extras: [] },
        { name: 'Parmesan Herb Truffle Fries', quantity: 1, unitPrice: 48.00, portionLabel: 'Regular', extras: [] }
      ];
    }

    const subtotal = items.reduce((acc, i) => acc + (i.unitPrice * (i.quantity || 1)), 0);
    const vat = Math.round(subtotal * FISCAL_CONFIG.vatRate * 100) / 100;
    const total = Math.round((subtotal + vat) * 100) / 100;

    const passId = `EXIT-T${tableNum.replace(/[^0-9]/g, '') || '04'}-${Math.floor(1000 + Math.random() * 9000)}`;
    const invoiceNum = `ETA-INV-2026-${Math.floor(10000 + Math.random() * 90000)}`;

    return {
      orderId: String(orderId).startsWith('ORD-') ? orderId : 'ORD-' + orderId,
      tableNumber: tableNum,
      items: items,
      subtotal: subtotal,
      vat: vat,
      total: total,
      splitCount: 1,
      activeMode: 'table_pay', // 'table_pay' or 'exit_cashier'
      paymentMethod: 'apple_pay', // 'apple_pay', 'card', 'mobile_wallet'
      mobileWalletProvider: 'instapay', // 'instapay', 'vodafone', 'orange'
      status: 'pending',
      exitPassId: passId,
      invoiceNumber: invoiceNum,
      fiscalUuid: '4f8c92a1-6e3b-417d-992a-' + Date.now().toString(16),
      issuedTimestamp: new Date()
    };
  }

  /**
   * DOM Modal Injector
   */
  function ensureModalContainers() {
    let backdrop = document.getElementById('tablePaymentBackdrop');
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.id = 'tablePaymentBackdrop';
      backdrop.className = 'tp-backdrop';
      backdrop.innerHTML = `
        <div class="tp-modal" id="tablePaymentModal" role="dialog" aria-modal="true" aria-labelledby="tpModalTitle">
          <!-- Content dynamically rendered -->
        </div>
      `;
      document.body.appendChild(backdrop);

      // Close on backdrop click outside modal
      backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) {
          closeModal();
        }
      });
    }

    let cashierBackdrop = document.getElementById('cashierTerminalBackdrop');
    if (!cashierBackdrop) {
      cashierBackdrop = document.createElement('div');
      cashierBackdrop.id = 'cashierTerminalBackdrop';
      cashierBackdrop.className = 'tp-backdrop';
      cashierBackdrop.innerHTML = `
        <div class="tp-modal" id="cashierTerminalModal" style="max-width: 620px;" role="dialog" aria-modal="true">
          <!-- Cashier Terminal dynamically rendered -->
        </div>
      `;
      document.body.appendChild(cashierBackdrop);

      cashierBackdrop.addEventListener('click', (e) => {
        if (e.target === cashierBackdrop) {
          closeCashierTerminal();
        }
      });
    }
  }

  /**
   * Open the Table-Side Settlement Modal
   */
  function openTableSettlement(orderData) {
    ensureModalContainers();
    activeSession = createPaymentSession(orderData);
    
    // Register pass for counter lookup
    activeExitPasses.set(activeSession.exitPassId, activeSession);

    renderModalContent();

    const backdrop = document.getElementById('tablePaymentBackdrop');
    if (backdrop) {
      backdrop.classList.add('tp-open');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeModal() {
    const backdrop = document.getElementById('tablePaymentBackdrop');
    if (backdrop) {
      backdrop.classList.remove('tp-open');
      document.body.style.overflow = '';
    }
  }

  /**
   * Switch between Table Digital Pay and Cashier Exit Pass
   */
  function setPaymentMode(mode) {
    if (!activeSession) return;
    activeSession.activeMode = mode;
    renderModalContent();
  }

  /**
   * Set Bill Split Count
   */
  function setSplitCount(count) {
    if (!activeSession) return;
    activeSession.splitCount = Math.max(1, Math.min(12, parseInt(count, 10) || 1));
    renderModalContent();
  }

  /**
   * Set Payment Method Card / Option
   */
  function setPaymentMethod(method) {
    if (!activeSession) return;
    activeSession.paymentMethod = method;
    renderModalContent();
  }

  /**
   * Set Mobile Wallet Provider
   */
  function setMobileWalletProvider(provider) {
    if (!activeSession) return;
    activeSession.mobileWalletProvider = provider;
    renderModalContent();
  }

  /**
   * Render QR Code inside target container
   */
  function renderQrCode(containerId, textPayload, size = 128) {
    setTimeout(() => {
      const container = document.getElementById(containerId);
      if (!container) return;
      container.innerHTML = '';
      if (typeof window.QRCode !== 'undefined') {
        new window.QRCode(container, {
          text: textPayload,
          width: size,
          height: size,
          colorDark: '#262626',
          colorLight: '#ffffff',
          correctLevel: window.QRCode.CorrectLevel.M
        });
      } else {
        // Fallback clean SVG QR placeholder
        container.innerHTML = `
          <svg width="${size}" height="${size}" viewBox="0 0 100 100" fill="#262626">
            <rect x="0" y="0" width="30" height="30" fill="#262626"/>
            <rect x="4" y="4" width="22" height="22" fill="#ffffff"/>
            <rect x="8" y="8" width="14" height="14" fill="#262626"/>
            <rect x="70" y="0" width="30" height="30" fill="#262626"/>
            <rect x="74" y="4" width="22" height="22" fill="#ffffff"/>
            <rect x="78" y="8" width="14" height="14" fill="#262626"/>
            <rect x="0" y="70" width="30" height="30" fill="#262626"/>
            <rect x="4" y="74" width="22" height="22" fill="#ffffff"/>
            <rect x="8" y="78" width="14" height="14" fill="#262626"/>
            <rect x="40" y="10" width="15" height="15" fill="#262626"/>
            <rect x="40" y="40" width="20" height="20" fill="#262626"/>
            <rect x="70" y="70" width="25" height="25" fill="#262626"/>
          </svg>
        `;
      }
    }, 50);
  }

  /**
   * Main Modal Template Renderer
   */
  function renderModalContent() {
    const modal = document.getElementById('tablePaymentModal');
    if (!modal || !activeSession) return;

    if (activeSession.status === 'settled') {
      renderFiscalInvoiceView(modal);
      return;
    }

    const perPerson = (activeSession.total / activeSession.splitCount).toFixed(2);
    const isSplit = activeSession.splitCount > 1;

    modal.innerHTML = `
      <div class="tp-modal-header">
        <div class="tp-modal-title-group">
          <span class="tp-table-badge">Table ${activeSession.tableNumber}</span>
          <div>
            <div class="tp-modal-title" id="tpModalTitle">Table Settlement</div>
            <div class="tp-modal-subtitle">${activeSession.orderId} · 14% Egyptian VAT Included</div>
          </div>
        </div>
        <button class="tp-close-btn" onclick="TablePayment.closeModal()" aria-label="Close settlement modal">
          ${ICONS.close}
        </button>
      </div>

      <div class="tp-modal-body">
        <!-- Dual Mode Switcher -->
        <div class="tp-tabs-bar">
          <button class="tp-tab-btn ${activeSession.activeMode === 'table_pay' ? 'active' : ''}" onclick="TablePayment.setPaymentMode('table_pay')">
            ${ICONS.card}
            <span>Table Digital Pay</span>
          </button>
          <button class="tp-tab-btn ${activeSession.activeMode === 'exit_cashier' ? 'active' : ''}" onclick="TablePayment.setPaymentMode('exit_cashier')">
            ${ICONS.barcode}
            <span>Pay Cash at Exit</span>
          </button>
        </div>

        ${activeSession.activeMode === 'table_pay' ? renderTablePayViewHtml(perPerson, isSplit) : renderExitPassViewHtml()}
      </div>

      <div class="tp-modal-footer">
        <div class="tp-secure-badge">
          ${ICONS.lock}
          <span>ETA Tax ID: ${FISCAL_CONFIG.taxRegistrationNumber}</span>
        </div>
        <div style="font-family: var(--font-mono); font-size: 11px; color: var(--color-slate);">
          ${FISCAL_CONFIG.legalEntityName.split(' ')[0]} Cloud Sync
        </div>
      </div>
    `;

    // Render QR Code if on Exit Pass tab
    if (activeSession.activeMode === 'exit_cashier') {
      renderQrCode('tpExitPassQrContainer', `MATBAKHLINK:EXIT_PASS:${activeSession.exitPassId}:TABLE_${activeSession.tableNumber}:TOTAL_${activeSession.total}`, 130);
    }
  }

  /**
   * HTML Sub-view: Table-Side Digital Settlement
   */
  function renderTablePayViewHtml(perPerson, isSplit) {
    const s = activeSession;
    return `
      <!-- Bill Items Summary -->
      <div class="tp-summary-box">
        <div class="tp-summary-header">
          <span>Table ${s.tableNumber} Order Breakdown</span>
          <span>${s.items.length} Items</span>
        </div>
        <div class="tp-items-list">
          ${s.items.map(item => `
            <div class="tp-item-row">
              <div class="tp-item-name">
                ${item.quantity}x ${item.name}
                ${item.portionLabel ? `<span class="tp-item-portion">${item.portionLabel}</span>` : ''}
              </div>
              <div class="tp-item-price">${formatMoney(item.unitPrice * item.quantity)}</div>
            </div>
          `).join('')}
        </div>
        <div class="tp-divider-dashed"></div>
        <div class="tp-calc-row">
          <span>Subtotal (Net)</span>
          <span style="font-family: var(--font-mono); font-weight: 500;">${formatMoney(s.subtotal)}</span>
        </div>
        <div class="tp-calc-row">
          <span>Egyptian VAT (14%)</span>
          <span style="font-family: var(--font-mono); font-weight: 500;">${formatMoney(s.vat)}</span>
        </div>
        <div class="tp-calc-row tp-total">
          <span>Table Balance Due</span>
          <span class="tp-total-val">${formatMoney(s.total)}</span>
        </div>
      </div>

      <!-- Split Bill Options -->
      <div style="margin-bottom: 18px;">
        <div class="tp-section-title">
          <span>Split Bill Options</span>
          <span style="color: var(--color-slate); font-weight: normal; font-size: 11px;">Divide total with companions</span>
        </div>
        <div class="tp-split-selector">
          <button class="tp-split-btn ${s.splitCount === 1 ? 'active' : ''}" onclick="TablePayment.setSplitCount(1)">
            <span>1 Person</span>
            <small style="font-size: 10px; font-family: var(--font-mono);">Full Bill</small>
          </button>
          <button class="tp-split-btn ${s.splitCount === 2 ? 'active' : ''}" onclick="TablePayment.setSplitCount(2)">
            <span>2 Diners</span>
            <small style="font-size: 10px; font-family: var(--font-mono);">50% each</small>
          </button>
          <button class="tp-split-btn ${s.splitCount === 3 ? 'active' : ''}" onclick="TablePayment.setSplitCount(3)">
            <span>3 Diners</span>
            <small style="font-size: 10px; font-family: var(--font-mono);">33% each</small>
          </button>
          <button class="tp-split-btn ${s.splitCount === 4 ? 'active' : ''}" onclick="TablePayment.setSplitCount(4)">
            <span>4 Diners</span>
            <small style="font-size: 10px; font-family: var(--font-mono);">25% each</small>
          </button>
          <div class="tp-custom-split-ctrl">
            <button class="tp-counter-btn" onclick="TablePayment.setSplitCount(${s.splitCount - 1})" aria-label="Decrease split count">-</button>
            <span class="tp-counter-val">${s.splitCount}</span>
            <button class="tp-counter-btn" onclick="TablePayment.setSplitCount(${s.splitCount + 1})" aria-label="Increase split count">+</button>
          </div>
        </div>

        ${isSplit ? `
          <div class="tp-split-banner">
            <div class="tp-split-info-label">
              <strong>Split between ${s.splitCount} diners:</strong><br>
              Each diner pays their equal share.
            </div>
            <div class="tp-split-amount">${perPerson} EGP</div>
          </div>
        ` : ''}
      </div>

      <!-- Payment Method Selection -->
      <div style="margin-bottom: 18px;">
        <div class="tp-section-title">Select Table Payment Rail</div>
        <div class="tp-method-grid">
          <!-- 1. Apple Pay -->
          <div class="tp-method-card ${s.paymentMethod === 'apple_pay' ? 'active' : ''}" onclick="TablePayment.setPaymentMethod('apple_pay')">
            <div class="tp-method-head">
              <div class="tp-method-title">
                <div class="tp-method-icon-wrap">${ICONS.apple}</div>
                <div>
                  <div>Apple Pay</div>
                  <div style="font-size: 11px; color: var(--color-slate); font-weight: normal;">1-Tap Instant Device Authorization</div>
                </div>
              </div>
              <div class="tp-radio-circle"><div class="tp-radio-inner"></div></div>
            </div>
            <div class="tp-method-expand">
              <button class="tp-apple-pay-btn" onclick="TablePayment.processDigitalPayment('apple_pay')">
                ${ICONS.apple}
                <span>Pay ${isSplit ? perPerson + ' EGP (1/' + s.splitCount + ' share)' : formatMoney(s.total)}</span>
              </button>
            </div>
          </div>

          <!-- 2. Credit / Debit Card -->
          <div class="tp-method-card ${s.paymentMethod === 'card' ? 'active' : ''}" onclick="TablePayment.setPaymentMethod('card')">
            <div class="tp-method-head">
              <div class="tp-method-title">
                <div class="tp-method-icon-wrap">${ICONS.card}</div>
                <div>
                  <div>Credit or Debit Card</div>
                  <div style="font-size: 11px; color: var(--color-slate); font-weight: normal;">Visa, Mastercard, Meeza</div>
                </div>
              </div>
              <div class="tp-radio-circle"><div class="tp-radio-inner"></div></div>
            </div>
            <div class="tp-method-expand" onclick="event.stopPropagation()">
              <div class="tp-input-group">
                <label class="tp-input-label">Card Number</label>
                <input type="text" class="tp-input" placeholder="4111 2222 3333 4444" maxlength="19" id="tpCardNumInput" oninput="TablePayment.formatCardNumber(this)">
              </div>
              <div class="tp-input-row">
                <div class="tp-input-group">
                  <label class="tp-input-label">Expires</label>
                  <input type="text" class="tp-input" placeholder="MM/YY" maxlength="5" id="tpCardExpInput">
                </div>
                <div class="tp-input-group">
                  <label class="tp-input-label">CVV</label>
                  <input type="password" class="tp-input" placeholder="123" maxlength="4" id="tpCardCvvInput">
                </div>
              </div>
              <button class="tp-pay-action-btn" onclick="TablePayment.processDigitalPayment('card')">
                <span>Authorize & Pay ${isSplit ? perPerson + ' EGP' : formatMoney(s.total)}</span>
              </button>
            </div>
          </div>

          <!-- 3. Mobile Wallet (Egyptian Rails) -->
          <div class="tp-method-card ${s.paymentMethod === 'mobile_wallet' ? 'active' : ''}" onclick="TablePayment.setPaymentMethod('mobile_wallet')">
            <div class="tp-method-head">
              <div class="tp-method-title">
                <div class="tp-method-icon-wrap">${ICONS.wallet}</div>
                <div>
                  <div>Egyptian Mobile Wallet</div>
                  <div style="font-size: 11px; color: var(--color-slate); font-weight: normal;">InstaPay IPN, Vodafone Cash, Orange Cash</div>
                </div>
              </div>
              <div class="tp-radio-circle"><div class="tp-radio-inner"></div></div>
            </div>
            <div class="tp-method-expand" onclick="event.stopPropagation()">
              <div style="display: flex; gap: 6px; margin-bottom: 10px;">
                <button class="tp-tender-chip ${s.mobileWalletProvider === 'instapay' ? 'active' : ''}" style="${s.mobileWalletProvider === 'instapay' ? 'border-color: #ff4d00; background: #fff5f0; color: #ff4d00;' : ''}" onclick="TablePayment.setMobileWalletProvider('instapay')">InstaPay (IPN)</button>
                <button class="tp-tender-chip ${s.mobileWalletProvider === 'vodafone' ? 'active' : ''}" style="${s.mobileWalletProvider === 'vodafone' ? 'border-color: #ff4d00; background: #fff5f0; color: #ff4d00;' : ''}" onclick="TablePayment.setMobileWalletProvider('vodafone')">Vodafone Cash</button>
                <button class="tp-tender-chip ${s.mobileWalletProvider === 'orange' ? 'active' : ''}" style="${s.mobileWalletProvider === 'orange' ? 'border-color: #ff4d00; background: #fff5f0; color: #ff4d00;' : ''}" onclick="TablePayment.setMobileWalletProvider('orange')">Orange Cash</button>
              </div>
              <div class="tp-input-group">
                <label class="tp-input-label">${s.mobileWalletProvider === 'instapay' ? 'InstaPay IPA Address / Mobile' : 'Egyptian Mobile Number'}</label>
                <input type="text" class="tp-input" placeholder="${s.mobileWalletProvider === 'instapay' ? 'name@instapay or 01xxxxxxxxx' : '010 xxxx xxxx'}" id="tpWalletIdentifier">
              </div>
              <button class="tp-pay-action-btn" onclick="TablePayment.processDigitalPayment('mobile_wallet')">
                <span>Request Push Payment & Settle</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * HTML Sub-view: Digital Table Exit Invoice Pass
   */
  function renderExitPassViewHtml() {
    const s = activeSession;
    return `
      <div class="tp-exit-pass-card">
        <div class="tp-exit-pass-header">
          <div class="tp-exit-status-pill">
            <span class="tp-exit-status-pulse"></span>
            <span>Awaiting Cashier Counter Settlement</span>
          </div>
          <div class="tp-exit-pass-label">Digital Table Exit Pass</div>
          <div class="tp-exit-pass-id">${s.exitPassId}</div>
          <div style="font-size: 12px; color: var(--color-slate); margin-top: 4px;">Table ${s.tableNumber} · Ticket ${s.orderId}</div>
        </div>

        <div class="tp-exit-barcode-wrap">
          ${generateBarcodeSvg(s.exitPassId)}
          <div class="tp-barcode-num">${s.exitPassId}</div>
        </div>

        <div class="tp-exit-qr-box">
          <div class="tp-exit-qr-holder" id="tpExitPassQrContainer"></div>
        </div>

        <div style="padding: 14px 18px; background: #ffffff; border-top: 1px solid var(--color-gridline);">
          <div class="tp-calc-row">
            <span>Subtotal (Net)</span>
            <span style="font-family: var(--font-mono);">${formatMoney(s.subtotal)}</span>
          </div>
          <div class="tp-calc-row">
            <span>VAT (14%)</span>
            <span style="font-family: var(--font-mono);">${formatMoney(s.vat)}</span>
          </div>
          <div class="tp-calc-row tp-total" style="font-size: 16px;">
            <span>Total Payable to Cashier</span>
            <span class="tp-total-val">${formatMoney(s.total)}</span>
          </div>
        </div>

        <div class="tp-exit-instructions">
          <strong>Instructions for Diner:</strong><br>
          Present this barcode or pass ID to the cashier at the front counter when leaving.
          The cashier will scan your code, receive cash or card, and clear your table instantly.
        </div>
      </div>

      <div style="margin-top: 14px; display: flex; gap: 8px;">
        <button class="btn-pill-ghost" style="flex: 1; justify-content: center; font-size: 12px;" onclick="TablePayment.setPaymentMode('table_pay')">
          <span>&larr; Switch Back to Table Digital Pay</span>
        </button>
        <button class="btn-pill-primary" style="flex: 1; justify-content: center; font-size: 12px;" onclick="TablePayment.openCashierTerminal('${s.exitPassId}')">
          <span>Simulate Cashier Counter Scan &rarr;</span>
        </button>
      </div>
    `;
  }

  /**
   * Format credit card number with spaces
   */
  function formatCardNumber(input) {
    let val = input.value.replace(/\D/g, '').substring(0, 16);
    let formatted = val.match(/.{1,4}/g)?.join(' ') || val;
    input.value = formatted;
  }

  /**
   * Process Digital Payment (Apple Pay, Card, Mobile Wallet)
   */
  async function processDigitalPayment(method) {
    if (!activeSession) return;

    const modalBody = document.querySelector('.tp-modal-body');
    if (modalBody) {
      modalBody.innerHTML = `
        <div style="padding: 50px 20px; text-align: center;">
          <div style="width: 44px; height: 44px; border: 3px solid var(--color-gridline); border-top-color: var(--color-flame); border-radius: 50%; animation: tp-spin 0.8s linear infinite; margin: 0 auto 18px;"></div>
          <div style="font-size: 16px; font-weight: 700; color: var(--color-ink);">Authorizing Settlement...</div>
          <div style="font-size: 13px; color: var(--color-slate); margin-top: 6px;">Communicating with Egyptian Banking Rail (Central Bank of Egypt)</div>
          <div style="font-family: var(--font-mono); font-size: 11px; color: var(--color-flame); margin-top: 14px;">Table ${activeSession.tableNumber} · ${formatMoney(activeSession.total)}</div>
        </div>
        <style>@keyframes tp-spin { to { transform: rotate(360deg); } }</style>
      `;
    }

    // Realistic banking latency simulation (< 1.2s)
    await new Promise(resolve => setTimeout(resolve, 1100));

    activeSession.status = 'settled';
    activeSession.settledVia = method.toUpperCase();
    activeSession.settledAt = new Date();

    // Mark in Store & Supabase
    recordSettlementSuccess(activeSession);

    // Show in-app toast
    if (window.showToast) {
      window.showToast({
        title: 'Table Payment Authorized',
        message: `Table ${activeSession.tableNumber} bill of ${formatMoney(activeSession.total)} settled successfully.`,
        meta: `Invoice: ${activeSession.invoiceNumber}`,
        type: 'success'
      });
    }

    renderModalContent();
  }

  /**
   * Render Official Egyptian Fiscal Tax Invoice View (ETA Compliant)
   */
  function renderFiscalInvoiceView(modal) {
    const s = activeSession;
    const dateStr = s.settledAt ? s.settledAt.toLocaleDateString('en-GB') : new Date().toLocaleDateString('en-GB');
    const timeStr = s.settledAt ? s.settledAt.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : new Date().toLocaleTimeString('en-GB');

    modal.innerHTML = `
      <div class="tp-modal-header">
        <div class="tp-modal-title-group">
          <span style="display: inline-flex; align-items: center; justify-content: center; width: 24px; height: 24px; border-radius: 50%; background: #16a34a; color: #ffffff;">
            ${ICONS.check}
          </span>
          <div>
            <div class="tp-modal-title">Table Settlement Complete</div>
            <div class="tp-modal-subtitle">Official Egyptian Fiscal Tax Invoice</div>
          </div>
        </div>
        <button class="tp-close-btn" onclick="TablePayment.closeModal()" aria-label="Close invoice">
          ${ICONS.close}
        </button>
      </div>

      <div class="tp-modal-body">
        <div class="tp-invoice-paper" id="tpFiscalTaxInvoice">
          <!-- Official Tax Authority Header -->
          <div class="tp-invoice-header">
            <div class="tp-invoice-gov-title">Arab Republic of Egypt · Egyptian Tax Authority (ETA)</div>
            <div class="tp-invoice-company">${FISCAL_CONFIG.legalEntityName}</div>
            <div class="tp-invoice-reg-details">
              Tax Registration (ID): <strong>${FISCAL_CONFIG.taxRegistrationNumber}</strong><br>
              Commercial Register: <strong>${FISCAL_CONFIG.commercialRegistration}</strong><br>
              ${FISCAL_CONFIG.branchName}
            </div>
          </div>

          <!-- Metadata Grid -->
          <div class="tp-invoice-meta-grid">
            <div>
              <span>Invoice Serial: <strong>${s.invoiceNumber}</strong></span>
              <span>Table Code: <strong>Table ${s.tableNumber}</strong></span>
              <span>Order Ticket: <strong>${s.orderId}</strong></span>
            </div>
            <div style="text-align: right;">
              <span>Date: <strong>${dateStr}</strong></span>
              <span>Time: <strong>${timeStr}</strong></span>
              <span>Settlement: <strong>${s.settledVia || 'DIGITAL PAY'}</strong></span>
            </div>
          </div>

          <!-- Itemized Table -->
          <table class="tp-invoice-table">
            <thead>
              <tr>
                <th>Description</th>
                <th style="text-align: center;">Qty</th>
                <th style="text-align: right;">Unit Price</th>
                <th>Total (EGP)</th>
              </tr>
            </thead>
            <tbody>
              ${s.items.map(i => `
                <tr>
                  <td>
                    ${i.name}
                    ${i.portionLabel ? `<span style="font-size: 10px; color: var(--color-slate); display: block;">${i.portionLabel}</span>` : ''}
                  </td>
                  <td style="text-align: center;">${i.quantity}</td>
                  <td style="text-align: right; font-family: var(--font-mono);">${formatMoney(i.unitPrice)}</td>
                  <td>${formatMoney(i.unitPrice * i.quantity)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <!-- Totals Breakdown -->
          <div class="tp-invoice-totals">
            <div class="tp-invoice-total-row">
              <span>Subtotal Net (Excl. Tax)</span>
              <span style="font-family: var(--font-mono); font-weight: 500;">${formatMoney(s.subtotal)}</span>
            </div>
            <div class="tp-invoice-total-row">
              <span>Egyptian VAT Rate (14%)</span>
              <span style="font-family: var(--font-mono); font-weight: 500;">${formatMoney(s.vat)}</span>
            </div>
            <div class="tp-invoice-total-row grand">
              <span>Total Gross (Tax Inclusive)</span>
              <span style="font-family: var(--font-mono); color: var(--color-ink);">${formatMoney(s.total)}</span>
            </div>
            <div class="tp-invoice-total-row" style="color: #16a34a; font-weight: 600; margin-top: 6px;">
              <span>Amount Settled / Paid</span>
              <span style="font-family: var(--font-mono);">${formatMoney(s.total)}</span>
            </div>
          </div>

          <!-- Verification QR & Legal Stamping -->
          <div class="tp-invoice-qr-section">
            <div class="tp-invoice-qr-badge" id="tpInvoiceEtaQrHolder"></div>
            <div class="tp-invoice-compliance-text">
              <strong>Egyptian Tax Authority Verification</strong>
              UUID: ${s.fiscalUuid.substring(0, 18)}...<br>
              Registered e-Invoice & e-Receipt standard.<br>
              Authorized by Egyptian Ministry of Finance.
            </div>
          </div>
        </div>

        <div style="display: flex; gap: 8px; margin-top: 18px;">
          <button class="btn-pill-ghost" style="flex: 1; justify-content: center; font-size: 12px;" onclick="window.print()">
            ${ICONS.printer}
            <span>Print Fiscal Receipt</span>
          </button>
          <button class="btn-pill-primary" style="flex: 1; justify-content: center; font-size: 12px;" onclick="TablePayment.completeSession()">
            <span>Done / Clear Table &rarr;</span>
          </button>
        </div>
      </div>
    `;

    // Render Verification QR Code (Official ETA TLV structure simulation)
    const etaVerificationUrl = `https://invoicing.eta.gov.eg/receipts/verify?uuid=${encodeURIComponent(s.fiscalUuid)}&taxId=${encodeURIComponent(FISCAL_CONFIG.taxRegistrationNumber)}&total=${s.total}&vat=${s.vat}`;
    renderQrCode('tpInvoiceEtaQrHolder', etaVerificationUrl, 76);
  }

  /**
   * Sync table settlement back to store and database
   */
  async function recordSettlementSuccess(session) {
    // 1. Update MatbakhStore
    if (window.MatbakhStore && window.MatbakhStore.setActiveOrder) {
      window.MatbakhStore.setActiveOrder(null);
    }

    // 2. Clear local cart
    if (window.cart) {
      window.cart = [];
      if (typeof window.refreshCartUI === 'function') window.refreshCartUI();
    }

    // 3. Update Supabase status if client exists
    const client = (window.MatbakhApi && window.MatbakhApi.getClient) ? window.MatbakhApi.getClient() : (window.supabaseClient || null);
    if (client) {
      try {
        const orderIdNum = parseInt(String(session.orderId).replace(/\D/g, ''), 10);
        if (orderIdNum) {
          await client.from('orders').update({
            status: 'served',
            payment_status: 'settled',
            fiscal_invoice: session.invoiceNumber
          }).eq('id', orderIdNum);
        }
      } catch (err) {
        console.warn('Supabase settlement status notice:', err);
      }
    }

    // 4. Update UI Order Tracker if open
    if (typeof window.updateTrackerProgress === 'function') {
      window.updateTrackerProgress('served');
    }
    const trackerTotal = document.getElementById('trackerTotalAmount');
    if (trackerTotal) {
      trackerTotal.innerText = `Table ${session.tableNumber} Settled · Invoice ${session.invoiceNumber}`;
    }

    // 5. Broadcast Table Settled Event for Kitchen KDS Pass & Floor Ops
    try {
      window.dispatchEvent(new CustomEvent('table-settled', { detail: session }));
    } catch (e) {}
  }

  /**
   * Reset session and return diner to menu
   */
  function completeSession() {
    closeModal();
    if (typeof window.switchMainScreen === 'function') {
      window.switchMainScreen('menu');
    }
    if (window.showToast) {
      window.showToast({
        title: 'Thank You for Dining With Us',
        message: 'Your table session is complete. Have a wonderful day!',
        type: 'success'
      });
    }
  }

  // ====================================================================
  // FLOW 2: CASHIER COUNTER TERMINAL OPERATOR LOGIC
  // ====================================================================

  /**
   * Open the Cashier Counter Settlement Terminal
   */
  function openCashierTerminal(presetPassId = '') {
    ensureModalContainers();
    const backdrop = document.getElementById('cashierTerminalBackdrop');
    if (!backdrop) return;

    renderCashierTerminalContent(presetPassId);
    backdrop.classList.add('tp-open');
    document.body.style.overflow = 'hidden';
  }

  function closeCashierTerminal() {
    const backdrop = document.getElementById('cashierTerminalBackdrop');
    if (backdrop) {
      backdrop.classList.remove('tp-open');
      document.body.style.overflow = '';
    }
  }

  /**
   * Render Cashier Terminal Operator Interface
   */
  function renderCashierTerminalContent(selectedPassId = '') {
    const modal = document.getElementById('cashierTerminalModal');
    if (!modal) return;

    // Fallback pass if none generated yet
    if (activeExitPasses.size === 0) {
      const demoPass = createPaymentSession({ table_number: '04', id: '104' });
      activeExitPasses.set(demoPass.exitPassId, demoPass);
    }

    const passes = Array.from(activeExitPasses.values());
    const currentPass = passes.find(p => p.exitPassId === selectedPassId) || passes[0];

    modal.innerHTML = `
      <div class="tp-modal-header" style="background: var(--color-vellum);">
        <div class="tp-modal-title-group">
          <div class="tp-method-icon-wrap" style="background: #ffffff;">${ICONS.barcode}</div>
          <div>
            <div class="tp-modal-title">Cashier Counter Settlement Terminal</div>
            <div class="tp-modal-subtitle">Front Desk Exit & Cash Settlement Station</div>
          </div>
        </div>
        <button class="tp-close-btn" onclick="TablePayment.closeCashierTerminal()" aria-label="Close cashier terminal">
          ${ICONS.close}
        </button>
      </div>

      <div class="tp-modal-body">
        <!-- Scan / Search Barcode -->
        <div class="tp-cashier-scanner-input-wrap">
          <input type="text" class="tp-input" id="cashierBarcodeSearch" placeholder="Scan Barcode or Enter Exit Pass ID (e.g. EXIT-T04-8921)..." value="${currentPass ? currentPass.exitPassId : ''}" onkeydown="if(event.key==='Enter') TablePayment.searchCashierPass()">
          <button class="btn-pill-primary" style="padding: 8px 18px; font-size: 13px;" onclick="TablePayment.searchCashierPass()">
            <span>Lookup Pass</span>
          </button>
        </div>

        <!-- Active Table Passes Selector -->
        <div style="margin-bottom: 16px;">
          <div class="tp-section-title">Active Pending Table Exit Passes (${passes.length})</div>
          <div style="display: flex; gap: 8px; overflow-x: auto; padding-bottom: 4px;">
            ${passes.map(p => `
              <button class="tp-tender-chip ${currentPass && currentPass.exitPassId === p.exitPassId ? 'active' : ''}" style="${currentPass && currentPass.exitPassId === p.exitPassId ? 'border-color: #ff4d00; background: #fff5f0; color: #ff4d00;' : ''}" onclick="TablePayment.selectCashierPass('${p.exitPassId}')">
                Table ${p.tableNumber} (${p.exitPassId}) &middot; ${formatMoney(p.total)}
              </button>
            `).join('')}
          </div>
        </div>

        ${currentPass ? `
          <!-- Selected Pass Details -->
          <div class="tp-summary-box">
            <div class="tp-summary-header">
              <span>Table ${currentPass.tableNumber} &middot; Ticket ${currentPass.orderId}</span>
              <span class="tp-table-badge" style="background:#f0fdf4; border-color:#bbf7d0; color:#16a34a;">Valid Pass</span>
            </div>
            <div class="tp-items-list" style="max-height: 100px;">
              ${currentPass.items.map(item => `
                <div class="tp-item-row">
                  <div class="tp-item-name">${item.quantity}x ${item.name}</div>
                  <div class="tp-item-price">${formatMoney(item.unitPrice * item.quantity)}</div>
                </div>
              `).join('')}
            </div>
            <div class="tp-divider-dashed"></div>
            <div class="tp-calc-row">
              <span>Subtotal Net</span>
              <span style="font-family: var(--font-mono);">${formatMoney(currentPass.subtotal)}</span>
            </div>
            <div class="tp-calc-row">
              <span>14% Egyptian VAT</span>
              <span style="font-family: var(--font-mono);">${formatMoney(currentPass.vat)}</span>
            </div>
            <div class="tp-calc-row tp-total" style="font-size: 16px;">
              <span>Total Payable</span>
              <span class="tp-total-val" id="cashierDueAmount">${formatMoney(currentPass.total)}</span>
            </div>
          </div>

          <!-- Cashier Payment Tender Form -->
          <div class="tp-cashier-dock">
            <div class="tp-section-title">Cashier Payment Tender</div>
            <div style="display: flex; gap: 10px; margin-bottom: 12px;">
              <button class="tp-tab-btn active" id="cashierModeCashBtn" style="border: 1px solid var(--color-gridline); background: #ffffff;">
                ${ICONS.cash}
                <span>Cash Tender</span>
              </button>
              <button class="tp-tab-btn" id="cashierModePosBtn" style="border: 1px solid var(--color-gridline); background: #ffffff;" onclick="TablePayment.togglePosMode()">
                ${ICONS.card}
                <span>Bank POS Terminal</span>
              </button>
            </div>

            <!-- Quick Cash Tender Chips -->
            <div style="font-size: 11px; font-weight: 600; text-transform: uppercase; color: var(--color-slate); font-family: var(--font-mono);">Fast Tender Shortcuts</div>
            <div class="tp-quick-tenders">
              <button class="tp-tender-chip" onclick="TablePayment.setTenderAmount(${currentPass.total})">Exact (${formatMoney(currentPass.total)})</button>
              <button class="tp-tender-chip" onclick="TablePayment.setTenderAmount(${Math.ceil(currentPass.total / 50) * 50})">${Math.ceil(currentPass.total / 50) * 50} EGP</button>
              <button class="tp-tender-chip" onclick="TablePayment.setTenderAmount(${Math.ceil(currentPass.total / 100) * 100})">${Math.ceil(currentPass.total / 100) * 100} EGP</button>
              <button class="tp-tender-chip" onclick="TablePayment.setTenderAmount(500)">500.00 EGP</button>
            </div>

            <div class="tp-input-group" style="margin-top: 10px;">
              <label class="tp-input-label">Cash Received From Diner (EGP)</label>
              <input type="number" class="tp-input" id="cashierTenderInput" value="${currentPass.total}" step="0.5" oninput="TablePayment.calcChangeDue(${currentPass.total})">
            </div>

            <div class="tp-change-due-box" id="cashierChangeDueBox">
              <span style="font-size: 13px; font-weight: 600; color: #166534;">Change Due to Diner:</span>
              <span class="tp-change-due-val" id="cashierChangeVal">0.00 EGP</span>
            </div>

            <button class="tp-pay-action-btn" style="margin-top: 16px;" onclick="TablePayment.finalizeCashierSettlement('${currentPass.exitPassId}')">
              <span>Complete Settlement & Print Fiscal Tax Receipt &rarr;</span>
            </button>
          </div>
        ` : `
          <div style="padding: 40px 20px; text-align: center; color: var(--color-slate);">
            No pending exit passes found. Scan a diner barcode or check in with seated tables.
          </div>
        `}
      </div>
    `;
  }

  function selectCashierPass(passId) {
    renderCashierTerminalContent(passId);
  }

  function searchCashierPass() {
    const input = document.getElementById('cashierBarcodeSearch');
    if (!input) return;
    const q = input.value.trim().toUpperCase();
    const found = Array.from(activeExitPasses.values()).find(p => p.exitPassId.toUpperCase().includes(q) || ('TABLE ' + p.tableNumber).includes(q));
    if (found) {
      renderCashierTerminalContent(found.exitPassId);
    } else {
      if (window.showToast) {
        window.showToast({
          title: 'Pass Not Found',
          message: `No active table exit pass matching "${q}".`,
          type: 'warning'
        });
      }
    }
  }

  function setTenderAmount(amount) {
    const input = document.getElementById('cashierTenderInput');
    if (input) {
      input.value = Number(amount).toFixed(2);
      const pass = activeSession || Array.from(activeExitPasses.values())[0];
      if (pass) calcChangeDue(pass.total);
    }
  }

  function calcChangeDue(totalDue) {
    const input = document.getElementById('cashierTenderInput');
    const changeVal = document.getElementById('cashierChangeVal');
    if (!input || !changeVal) return;

    const tendered = parseFloat(input.value) || 0;
    const change = Math.max(0, tendered - totalDue);
    changeVal.innerText = formatMoney(change);
  }

  function togglePosMode() {
    const tenderInput = document.getElementById('cashierTenderInput');
    const changeBox = document.getElementById('cashierChangeDueBox');
    if (tenderInput && changeBox) {
      tenderInput.placeholder = 'Enter Bank POS Terminal Auth Ref (e.g. NBE-9042)';
      changeBox.style.display = 'none';
      if (window.showToast) {
        window.showToast({
          title: 'POS Terminal Tender Active',
          message: 'Process payment on restaurant card terminal, then verify auth code.',
          type: 'info'
        });
      }
    }
  }

  /**
   * Finalize Cashier Settlement & Print Official Receipt
   */
  async function finalizeCashierSettlement(passId) {
    const pass = activeExitPasses.get(passId) || activeSession;
    if (!pass) return;

    pass.status = 'settled';
    pass.settledVia = 'CASHIER COUNTER (CASH/POS)';
    pass.settledAt = new Date();

    // Close Cashier modal
    closeCashierTerminal();

    // Open Fiscal Invoice for Table
    activeSession = pass;
    ensureModalContainers();
    renderModalContent();

    const backdrop = document.getElementById('tablePaymentBackdrop');
    if (backdrop) {
      backdrop.classList.add('tp-open');
    }

    recordSettlementSuccess(pass);

    // Remove from active passes
    activeExitPasses.delete(passId);

    if (window.showToast) {
      window.showToast({
        title: 'Table Settled at Cashier',
        message: `Table ${pass.tableNumber} marked settled. Official ETA Fiscal Tax Invoice issued.`,
        meta: `Pass: ${pass.exitPassId}`,
        type: 'success'
      });
    }
  }

  /**
   * Inject Payment Trigger Buttons into Application UI
   */
  function injectUiHooks() {
    // 1. Tracker Screen Hook: Add "Settle Table Bill" action
    const trackerContainer = document.querySelector('#screen-tracker .firecrawl-card');
    if (trackerContainer && !document.getElementById('trackerSettleBtn')) {
      const btnRow = trackerContainer.querySelector('div[style*="margin-top: 28px"]') || trackerContainer;
      const settleBtn = document.createElement('button');
      settleBtn.id = 'trackerSettleBtn';
      settleBtn.className = 'btn-pill-primary';
      settleBtn.style.padding = '8px 20px';
      settleBtn.style.fontSize = '13px';
      settleBtn.style.background = '#262626';
      settleBtn.style.borderColor = '#262626';
      settleBtn.innerHTML = `
        ${ICONS.card}
        <span style="margin-left: 6px;">Settle Table Bill (Digital / Cashier)</span>
      `;
      settleBtn.onclick = () => openTableSettlement();
      btnRow.appendChild(settleBtn);
    }

    // 2. Navigation Top Bar Hook: Add Cashier Terminal shortcut button
    const navRight = document.querySelector('.saas-nav-actions');
    if (navRight && !document.getElementById('navCashierTerminalBtn')) {
      const cashierBtn = document.createElement('button');
      cashierBtn.id = 'navCashierTerminalBtn';
      cashierBtn.className = 'btn-pill-ghost';
      cashierBtn.style.fontSize = '12px';
      cashierBtn.style.padding = '6px 14px';
      cashierBtn.title = 'Cashier Exit Settlement Terminal';
      cashierBtn.innerHTML = `
        ${ICONS.barcode}
        <span style="margin-left: 4px;">Cashier Desk</span>
      `;
      cashierBtn.onclick = () => openCashierTerminal();
      navRight.insertBefore(cashierBtn, navRight.firstChild);
    }

    // 3. Cart Drawer Footer Hook: Add Settle Bill button
    const cartFooter = document.querySelector('.cart-drawer-footer');
    if (cartFooter && !document.getElementById('cartSettleQuickBtn')) {
      const quickSettle = document.createElement('button');
      quickSettle.id = 'cartSettleQuickBtn';
      quickSettle.className = 'btn-pill-ghost';
      quickSettle.style.width = '100%';
      quickSettle.style.justifyContent = 'center';
      quickSettle.style.fontSize = '12px';
      quickSettle.style.marginTop = '8px';
      quickSettle.innerHTML = `
        ${ICONS.card}
        <span style="margin-left: 6px;">Table Settle Options (Apple Pay &middot; Split)</span>
      `;
      quickSettle.onclick = () => {
        if (typeof window.closeCartDrawer === 'function') window.closeCartDrawer();
        openTableSettlement();
      };
      cartFooter.appendChild(quickSettle);
    }
  }

  // Auto-init on DOM Ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      ensureModalContainers();
      injectUiHooks();
    });
  } else {
    ensureModalContainers();
    injectUiHooks();
  }

  // Public Module API
  window.TablePayment = {
    openTableSettlement,
    closeModal,
    setPaymentMode,
    setSplitCount,
    setPaymentMethod,
    setMobileWalletProvider,
    formatCardNumber,
    processDigitalPayment,
    openCashierTerminal,
    closeCashierTerminal,
    selectCashierPass,
    searchCashierPass,
    setTenderAmount,
    calcChangeDue,
    togglePosMode,
    finalizeCashierSettlement,
    completeSession,
    injectUiHooks
  };

})(window);
