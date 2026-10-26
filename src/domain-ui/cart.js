/**
 * MatbakhLink Domain UI: Cart & Floating Bottom Bar Component
 * Zero emojis — Strict Firecrawl 100% Light Theme Architecture
 */
(function(window) {
  'use strict';

  const DEFAULT_DISH_FALLBACK_IMG = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=200&q=80';

  /**
   * Escape HTML special characters for safe innerHTML injection.
   */
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /**
   * Ensure persistent floating bottom cart bar DOM element exists.
   */
  function ensureFloatingCartBar() {
    let bar = document.getElementById('matbakhFloatingCartBar');
    if (!bar) {
      bar = document.createElement('div');
      bar.id = 'matbakhFloatingCartBar';
      bar.setAttribute('role', 'button');
      bar.setAttribute('tabindex', '0');
      bar.setAttribute('aria-label', 'Open order cart');
      bar.innerHTML = `
        <div class="floating-cart-left">
          <span class="floating-cart-table-pill" id="floatingCartTablePill">Table 04 Order</span>
          <div class="floating-cart-info-text">
            <span class="floating-cart-items-count" id="floatingCartItemsCount">0 Items</span>
            <span class="floating-cart-divider" aria-hidden="true">&bull;</span>
            <span class="floating-cart-total-price" id="floatingCartTotalPrice">0.00 EGP</span>
          </div>
        </div>
        <button class="floating-cart-action-btn" type="button" aria-label="View Cart">
          <span>View Cart</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </button>
      `;

      bar.addEventListener('click', function(e) {
        openCartDrawer();
      });

      bar.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openCartDrawer();
        }
      });

      document.body.appendChild(bar);
    }
    return bar;
  }

  let isCartDrawerOpen = false;

  /**
   * Update floating bottom cart bar presentation.
   * @param {Array} cart - Active cart items
   * @param {string} currentTable - Active table code (e.g. '04' or 'T-04')
   */
  function updateFloatingCartBar(cart, currentTable) {
    const bar = ensureFloatingCartBar();
    const safeCart = Array.isArray(cart) ? cart : [];
    const totalItems = safeCart.reduce((acc, i) => acc + (i.qty || 1), 0);

    // Clear any stuck inline display property
    bar.style.display = '';

    const activeScreen = window.currentScreen || 'menu';

    if (totalItems <= 0 || activeScreen === 'hero' || isCartDrawerOpen) {
      bar.classList.remove('is-visible');
      document.body.classList.remove('has-floating-cart');
      return;
    }

    const sub = safeCart.reduce((acc, i) => acc + (i.price * (i.qty || 1)), 0);
    const vat = sub * 0.14;
    const total = sub + vat;

    const tablePill = document.getElementById('floatingCartTablePill');
    const itemsCountEl = document.getElementById('floatingCartItemsCount');
    const totalPriceEl = document.getElementById('floatingCartTotalPrice');

    if (tablePill) {
      if (currentTable) {
        const tableCode = String(currentTable).replace(/^T-/, '');
        tablePill.innerText = `Table ${tableCode} Order`;
      } else {
        tablePill.innerText = 'Dine-In Order';
      }
    }
    if (itemsCountEl) {
      itemsCountEl.innerText = `${totalItems} ${totalItems === 1 ? 'Item' : 'Items'}`;
    }
    if (totalPriceEl) {
      totalPriceEl.innerText = `${total.toFixed(2)} EGP`;
    }

    bar.classList.add('is-visible');
    document.body.classList.add('has-floating-cart');
  }

  /**
   * Open the slide-over cart drawer with scroll locking and safe-area adjustment.
   */
  function openCartDrawer() {
    isCartDrawerOpen = true;
    const drawer = document.getElementById('cartDrawer');
    const backdrop = document.getElementById('cartBackdrop');

    if (drawer) drawer.classList.add('open');
    if (backdrop) backdrop.classList.add('active');

    // Prevent background scroll chain
    document.body.style.overflow = 'hidden';

    // Smoothly hide floating bar while drawer is visible
    const bar = document.getElementById('matbakhFloatingCartBar');
    if (bar) {
      bar.classList.remove('is-visible');
      document.body.classList.remove('has-floating-cart');
    }
  }

  /**
   * Close the slide-over cart drawer and restore background scrolling.
   */
  function closeCartDrawer() {
    isCartDrawerOpen = false;
    const drawer = document.getElementById('cartDrawer');
    const backdrop = document.getElementById('cartBackdrop');

    if (drawer) drawer.classList.remove('open');
    if (backdrop) backdrop.classList.remove('active');

    // Restore background scrolling
    document.body.style.overflow = '';

    const bar = document.getElementById('matbakhFloatingCartBar');
    if (bar) bar.style.display = '';

    // Restore floating bar immediately if items exist and on menu screen
    const activeCart = window.cart || [];
    updateFloatingCartBar(activeCart, window.currentTable);
  }

  /**
   * Find photographic asset for a given cart item.
   * @param {Object} item
   * @returns {string} Image URL
   */
  function resolveDishImage(item) {
    if (item.image) return item.image;
    if (window.RICH_MENU && Array.isArray(window.RICH_MENU)) {
      const match = window.RICH_MENU.find(m => m.id === item.id);
      if (match && match.image) return match.image;
    }
    return DEFAULT_DISH_FALLBACK_IMG;
  }

  /**
   * Fully refreshed Cart UI renderer with null pointer guards and 56x56 thumbnails.
   * @param {Array} cart - Array of cart item objects
   * @param {string} currentTable - Active table code
   */
  function renderCart(cart, currentTable) {
    const list = document.getElementById('cartItemsList');
    const badge = document.getElementById('cartItemCountBadge');
    const headerBadge = document.getElementById('headerCartCount');

    const safeCart = Array.isArray(cart) ? cart : [];
    const totalItems = safeCart.reduce((acc, i) => acc + (i.qty || 1), 0);

    // Safe null pointer check for cart badge inside drawer
    if (badge) {
      badge.innerText = `${totalItems} ${totalItems === 1 ? 'Item' : 'Items'}`;
    }

    // Safe null pointer check for header cart counter badge (Resolves Issue #4)
    if (headerBadge) {
      headerBadge.innerText = totalItems;
    }

    // Update floating bottom bar
    updateFloatingCartBar(safeCart, currentTable);

    // Empty state handling
    if (!list) return;

    if (safeCart.length === 0) {
      list.innerHTML = `
        <div class="cart-empty-state">
          <div class="cart-empty-icon-wrap" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <path d="M16 10a4 4 0 0 1-8 0"></path>
            </svg>
          </div>
          <div>Your table cart is empty.</div>
          <div style="font-size: 12px; color: var(--color-slate, #727272); margin-top: 4px;">Touch any dish on the menu to customize and add!</div>
        </div>
      `;

      const subEl = document.getElementById('cartSubtotal');
      const vatEl = document.getElementById('cartVat');
      const totalEl = document.getElementById('cartTotal');
      if (subEl) subEl.innerText = '0.00 EGP';
      if (vatEl) vatEl.innerText = '0.00 EGP';
      if (totalEl) totalEl.innerText = '0.00 EGP';
      return;
    }

    // Render list with 56x56 rounded photo thumbnails (Resolves Issue #3)
    list.innerHTML = safeCart.map((item, idx) => {
      const imgUrl = resolveDishImage(item);
      const itemTotal = (item.price * (item.qty || 1)).toFixed(2);
      const extrasText = (item.extras && item.extras.length > 0)
        ? item.extras.map(e => escapeHtml(typeof e === 'string' ? e : e.label)).join(', ')
        : '';

      return `
        <div class="cart-item-card">
          <img src="${escapeHtml(imgUrl)}" alt="${escapeHtml(item.name)}" class="cart-item-thumb" loading="lazy" onerror="this.src='${DEFAULT_DISH_FALLBACK_IMG}'">
          <div class="cart-item-content">
            <div class="cart-item-top-row">
              <strong class="cart-item-name">${escapeHtml(item.name)}</strong>
              <button class="cart-item-remove-btn" onclick="removeCartItem(${idx})" aria-label="Remove ${escapeHtml(item.name)}">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            ${item.portion ? `<div class="cart-item-portion">${escapeHtml(item.portion)}</div>` : ''}
            ${extrasText ? `<div class="cart-item-extras">Extras: ${extrasText}</div>` : ''}
            ${item.notes ? `<div class="cart-item-notes">Note: "${escapeHtml(item.notes)}"</div>` : ''}
            <div class="cart-item-bottom-row">
              <div class="cart-qty-pill">
                <button type="button" class="cart-qty-btn" onclick="changeCartQty(${idx}, -1)" aria-label="Decrease quantity">&minus;</button>
                <span class="cart-qty-val">${item.qty || 1}</span>
                <button type="button" class="cart-qty-btn" onclick="changeCartQty(${idx}, 1)" aria-label="Increase quantity">&plus;</button>
              </div>
              <span class="cart-item-price">${itemTotal} EGP</span>
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Totals calculations
    const sub = safeCart.reduce((acc, i) => acc + (i.price * (i.qty || 1)), 0);
    const vat = sub * 0.14;
    const total = sub + vat;

    const subEl = document.getElementById('cartSubtotal');
    const vatEl = document.getElementById('cartVat');
    const totalEl = document.getElementById('cartTotal');

    if (subEl) subEl.innerText = `${sub.toFixed(2)} EGP`;
    if (vatEl) vatEl.innerText = `${vat.toFixed(2)} EGP`;
    if (totalEl) totalEl.innerText = `${total.toFixed(2)} EGP`;
  }

  // Bind Escape key to close cart drawer
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      const drawer = document.getElementById('cartDrawer');
      if (drawer && drawer.classList.contains('open')) {
        closeCartDrawer();
      }
    }
  });

  // Export module API to window and global scope
  window.MatbakhCartUI = {
    renderCart,
    openCartDrawer,
    closeCartDrawer,
    updateFloatingCartBar,
    ensureFloatingCartBar
  };

  window.openCartDrawer = openCartDrawer;
  window.closeCartDrawer = closeCartDrawer;

})(window);
