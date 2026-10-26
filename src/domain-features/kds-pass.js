/**
 * MatbakhLink Kitchen Display System (KDS Pass) Engine
 * Domain 6: Feature Module - Expeditor Pass & Cook Line Operations
 * Zero emojis — 100% Light Theme Firecrawl Compliance
 */
(function(window) {
  'use strict';

  const STORAGE_AUDIO_KEY = 'matbakh_kds_audio_enabled';

  // In-memory state
  const state = {
    orders: [],
    activeFilter: 'all', // 'all' | 'grill' | 'ready' | 'settled'
    searchQuery: '',
    audioEnabled: false,
    audioCtx: null,
    targetContainerId: 'kdsTicketsGrid',
    supabase: null
  };

  /**
   * Web Audio API Synthesizer (Zero asset dependency)
   * High-clarity kitchen chime frequencies
   */
  function initAudioContext() {
    if (!state.audioCtx && (window.AudioContext || window.webkitAudioContext)) {
      try {
        const AudioCtor = window.AudioContext || window.webkitAudioContext;
        state.audioCtx = new AudioCtor();
      } catch (e) {
        console.warn('AudioContext initialization notice:', e);
      }
    }
    if (state.audioCtx && state.audioCtx.state === 'suspended') {
      state.audioCtx.resume();
    }
  }

  function playTone(freq, duration, type = 'sine', gainLevel = 0.15, startTime = 0) {
    if (!state.audioEnabled || !state.audioCtx) return;
    try {
      const now = state.audioCtx.currentTime + startTime;
      const osc = state.audioCtx.createOscillator();
      const gain = state.audioCtx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(gainLevel, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(gain);
      gain.connect(state.audioCtx.destination);

      osc.start(now);
      osc.stop(now + duration);
    } catch (err) {
      console.warn('Audio synthesis notice:', err);
    }
  }

  /**
   * Sound Profiles for Ticket Lifecycle Events
   * @param {'new_order'|'cooking'|'ready'|'served'|'settled'|'ping'} cue
   */
  function playAudioCue(cue) {
    if (!state.audioEnabled) return;
    initAudioContext();

    switch (cue) {
      case 'new_order':
        // High double chime (D5 -> A5)
        playTone(587.33, 0.28, 'sine', 0.18, 0);
        playTone(880.00, 0.45, 'sine', 0.22, 0.12);
        break;

      case 'cooking':
        // Warm tactile confirmation tone
        playTone(329.63, 0.15, 'triangle', 0.14, 0);
        playTone(440.00, 0.22, 'sine', 0.12, 0.08);
        break;

      case 'ready':
        // Expeditor service bell triad (C5 -> E5 -> G5)
        playTone(523.25, 0.22, 'sine', 0.16, 0);
        playTone(659.25, 0.22, 'sine', 0.18, 0.09);
        playTone(783.99, 0.55, 'sine', 0.24, 0.18);
        break;

      case 'served':
        // Gentle delivery confirmation
        playTone(440.00, 0.20, 'sine', 0.14, 0);
        playTone(554.37, 0.35, 'sine', 0.16, 0.10);
        break;

      case 'settled':
        // Rich harmonic resolution chime (E5 + A5 sustained)
        playTone(659.25, 0.65, 'sine', 0.18, 0);
        playTone(880.00, 0.85, 'sine', 0.22, 0.08);
        playTone(1318.51, 0.95, 'triangle', 0.12, 0.14);
        break;

      default:
        playTone(600, 0.15, 'sine', 0.10, 0);
    }
  }

  function toggleAudio() {
    initAudioContext();
    state.audioEnabled = !state.audioEnabled;
    try {
      localStorage.setItem(STORAGE_AUDIO_KEY, state.audioEnabled.toString());
    } catch (e) {}

    if (state.audioEnabled) {
      playAudioCue('new_order');
    }

    updateToolbarUi();

    if (window.showToast) {
      window.showToast({
        title: state.audioEnabled ? 'Kitchen Audio Active' : 'Kitchen Audio Muted',
        message: state.audioEnabled
          ? 'Chimes enabled for new tickets, plating alerts, and table settlement.'
          : 'Sound muted. Visual cues remain active.',
        type: 'info'
      });
    }
  }

  /**
   * Listen for Table Settled events (dispatched from Table Payment or Cashier Terminal)
   */
  function initSettledListener() {
    window.addEventListener('table-settled', (event) => {
      const detail = event.detail || {};
      const orderIdStr = String(detail.orderId || detail.id || '');
      const cleanOrderId = orderIdStr.replace(/\D/g, '');
      const tableNum = String(detail.tableNumber || detail.table_number || '');

      let matched = false;
      state.orders.forEach(ord => {
        const ordIdStr = String(ord.id);
        const ordCleanId = ordIdStr.replace(/\D/g, '');
        const ordTable = String(ord.table_number || '');

        if ((cleanOrderId && ordCleanId === cleanOrderId) ||
            (tableNum && (ordTable === tableNum || ordTable.replace(/\D/g, '') === tableNum.replace(/\D/g, '')))) {
          ord.payment_status = 'settled';
          ord.is_paid = true;
          ord.settled_at = new Date().toISOString();
          if (detail.invoiceNumber) {
            ord.fiscal_invoice = detail.invoiceNumber;
          }
          if (ord.status === 'served') {
            ord.status = 'settled';
          }
          matched = true;
        }
      });

      if (matched) {
        playAudioCue('settled');
        render();
        if (window.showToast) {
          window.showToast({
            title: 'Table Bill Settled',
            message: `Table ${tableNum || 'Diner'} bill has settled. Ready for busser to clear and reset table.`,
            meta: 'PAID & SETTLED',
            type: 'success'
          });
        }
      }
    });
  }
  function getElapsedMinutes(isoString) {
    if (!isoString) return 0;
    const diffMs = Date.now() - new Date(isoString).getTime();
    return Math.max(0, Math.floor(diffMs / 60000));
  }

  /**
   * Update Ticket Lifecycle Status
   */
  async function updateTicketStatus(id, newStatus) {
    const ticket = state.orders.find(o => String(o.id) === String(id));
    if (!ticket) return;

    ticket.status = newStatus;
    if (newStatus === 'served') {
      ticket.served_at = new Date().toISOString();
    }
    if (newStatus === 'settled') {
      ticket.settled_at = new Date().toISOString();
      ticket.is_paid = true;
      ticket.payment_status = 'settled';
    }

    // Audio Cue
    playAudioCue(newStatus);

    // Sync with Supabase if connected
    if (state.supabase) {
      try {
        const updatePayload = { status: newStatus };
        if (newStatus === 'settled') {
          updatePayload.is_paid = true;
          updatePayload.payment_status = 'settled';
        }
        await state.supabase.from('orders').update(updatePayload).eq('id', id);
      } catch (err) {
        console.warn('Supabase update notice:', err);
      }
    }

    render();

    // Notification toast
    if (window.showToast) {
      const statusLabels = {
        cooking: 'Flame Grill Started',
        ready: 'Plated & Ready for Runner',
        served: 'Delivered to Table',
        settled: 'Table Settled & Cleared'
      };
      window.showToast({
        title: statusLabels[newStatus] || 'Ticket Updated',
        message: `Order #ORD-${id} for Table ${ticket.table_number} transitioned to ${newStatus.toUpperCase()}.`,
        meta: `TABLE ${ticket.table_number}`,
        type: newStatus === 'settled' ? 'success' : 'info'
      });
    }
  }

  /**
   * Direct Table Settlement Action (e.g. table-side digital payment or cashier pass)
   */
  async function markTableSettled(id) {
    await updateTicketStatus(id, 'settled');
  }

  /**
   * Filter orders based on active tab and search query
   */
  function getFilteredOrders() {
    return state.orders.filter(ord => {
      // Station filter
      if (state.activeFilter === 'grill') {
        if (ord.status !== 'new' && ord.status !== 'cooking' && ord.status !== 'preparing') {
          return false;
        }
      } else if (state.activeFilter === 'ready') {
        if (ord.status !== 'ready') {
          return false;
        }
      } else if (state.activeFilter === 'settled') {
        if (ord.status !== 'served' && ord.status !== 'settled') {
          return false;
        }
      }

      // Search query filter
      if (state.searchQuery) {
        const q = state.searchQuery.toLowerCase().trim();
        const matchTable = (ord.table_number || '').toLowerCase().includes(q);
        const matchId = String(ord.id).toLowerCase().includes(q);
        const matchGuest = (ord.customer_name || '').toLowerCase().includes(q);
        if (!matchTable && !matchId && !matchGuest) return false;
      }

      return true;
    });
  }

  /**
   * Render KDS Toolbar (Station Filters + Audio Switch + Search)
   */
  function renderToolbar(container) {
    let toolbar = document.getElementById('matbakhKdsToolbar');
    if (!toolbar) {
      toolbar = document.createElement('div');
      toolbar.id = 'matbakhKdsToolbar';
      toolbar.className = 'kds-toolbar-bar';
      container.parentNode.insertBefore(toolbar, container);
    }

    const counts = {
      all: state.orders.length,
      grill: state.orders.filter(o => o.status === 'new' || o.status === 'cooking' || o.status === 'preparing').length,
      ready: state.orders.filter(o => o.status === 'ready').length,
      settled: state.orders.filter(o => o.status === 'served' || o.status === 'settled').length
    };

    toolbar.innerHTML = `
      <div class="kds-station-filters">
        <button class="kds-filter-pill ${state.activeFilter === 'all' ? 'active' : ''}" onclick="window.MatbakhKds.setFilter('all')">
          <span>All Stations</span>
          <span class="kds-filter-count">${counts.all}</span>
        </button>
        <button class="kds-filter-pill ${state.activeFilter === 'grill' ? 'active' : ''}" onclick="window.MatbakhKds.setFilter('grill')">
          <span>Flame Grill / Prep</span>
          <span class="kds-filter-count">${counts.grill}</span>
        </button>
        <button class="kds-filter-pill ${state.activeFilter === 'ready' ? 'active' : ''}" onclick="window.MatbakhKds.setFilter('ready')">
          <span>Expo Ready</span>
          <span class="kds-filter-count">${counts.ready}</span>
        </button>
        <button class="kds-filter-pill ${state.activeFilter === 'settled' ? 'active' : ''}" onclick="window.MatbakhKds.setFilter('settled')">
          <span>Served &amp; Settled</span>
          <span class="kds-filter-count">${counts.settled}</span>
        </button>
      </div>

      <div class="kds-toolbar-right">
        <input
          type="text"
          class="kds-search-input"
          placeholder="Search Table or ID..."
          value="${state.searchQuery}"
          oninput="window.MatbakhKds.setSearch(this.value)"
        />
        <button class="kds-audio-toggle ${state.audioEnabled ? 'enabled' : ''}" onclick="window.MatbakhKds.toggleAudio()">
          <span class="kds-audio-dot"></span>
          <span>${state.audioEnabled ? 'Audio Chimes Active' : 'Mute Kitchen Audio'}</span>
        </button>
      </div>
    `;
  }

  function updateToolbarUi() {
    const container = document.getElementById(state.targetContainerId);
    if (container) renderToolbar(container);
  }

  /**
   * Render Ticket Cards
   */
  function render() {
    const container = document.getElementById(state.targetContainerId);
    if (!container) return;

    renderToolbar(container);

    const filtered = getFilteredOrders();

    // Update KPI counters if present on the page
    const kpiActive = document.getElementById('kpiActiveTotal') || document.getElementById('kdsActiveTotal');
    if (kpiActive) kpiActive.innerText = state.orders.filter(o => o.status !== 'settled').length;

    const kpiInGrill = document.getElementById('kpiInGrill') || document.getElementById('kdsInGrill');
    if (kpiInGrill) kpiInGrill.innerText = state.orders.filter(o => o.status === 'cooking' || o.status === 'preparing').length;

    const kpiDelayed = document.getElementById('kpiDelayed');
    if (kpiDelayed) {
      const delayedCount = state.orders.filter(o => o.status !== 'settled' && getElapsedMinutes(o.created_at) >= 15).length;
      kpiDelayed.innerText = delayedCount;
    }

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="kds-empty-board">
          <h4>No Active Tickets in this View</h4>
          <p>Tickets dispatched from guest table devices will stream here in real-time.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map(ord => {
      const elapsedMins = getElapsedMinutes(ord.created_at);
      const isDelayed = elapsedMins >= 15 && ord.status !== 'settled';

      let bandClass = 'band-new';
      let statusLabel = 'NEW TICKET';
      let actionBtnText = 'Start Flame Grill ->';
      let actionBtnClass = 'step-grill';
      let nextStatus = 'cooking';

      if (ord.status === 'cooking' || ord.status === 'preparing') {
        bandClass = 'band-cooking';
        statusLabel = 'ON FLAME GRILL';
        actionBtnText = 'Mark Ready for Table ->';
        actionBtnClass = 'step-ready';
        nextStatus = 'ready';
      } else if (ord.status === 'ready') {
        bandClass = 'band-ready';
        statusLabel = 'PLATED &amp; READY';
        actionBtnText = 'Mark Delivered to Table ->';
        actionBtnClass = 'step-ready';
        nextStatus = 'served';
      } else if (ord.status === 'served') {
        bandClass = 'band-served';
        statusLabel = 'SERVED TO TABLE';
        if (ord.payment_status === 'settled') {
          actionBtnText = 'Table Bussed &amp; Reset ->';
          actionBtnClass = 'step-settle';
          nextStatus = 'settled';
        } else {
          actionBtnText = 'Settle Bill &amp; Reset Table ->';
          actionBtnClass = 'step-settle';
          nextStatus = 'settled';
        }
      } else if (ord.status === 'settled') {
        bandClass = 'band-settled';
        statusLabel = 'PAID &amp; SETTLED';
        actionBtnText = 'Table Cleared &amp; Ready for Next Diner';
        actionBtnClass = 'step-archived';
        nextStatus = null;
      }

      const isSettled = ord.status === 'settled' || ord.payment_status === 'settled';
      const isPaid = isSettled || ord.is_paid || ord.payment_status === 'paid';

      return `
        <div class="kds-ticket-card ${isDelayed ? 'is-delayed' : ''}" data-ticket-id="${ord.id}">
          <div class="kds-ticket-band ${bandClass}">
            <span>#ORD-${ord.id} · TABLE ${ord.table_number}</span>
            <span>${statusLabel}</span>
          </div>

          ${isSettled ? `
            <div class="kds-settled-ribbon">
              <span>Bill Settled ${ord.fiscal_invoice ? `(${ord.fiscal_invoice})` : ''} · Ready to Buss</span>
              <span class="kds-settled-pill">PAID &amp; SETTLED</span>
            </div>
          ` : ''}

          <div class="kds-ticket-body">
            <div class="kds-ticket-meta-row">
              <span>Guest: <strong>${ord.customer_name || 'Guest Diner'}</strong></span>
              <span class="kds-timer-tag" style="font-family: var(--font-geist-mono); font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: var(--radius-pills, 999px); border: 1px solid var(--color-gridline); background: var(--color-vellum);">
                ${elapsedMins}m AGO
              </span>
            </div>

            <div class="kds-ticket-items">
              ${Array.isArray(ord.order_payload) ? ord.order_payload.map(item => `
                <div>
                  <div class="kds-dish-row">
                    <span>${item.quantity || 1}x ${item.name}</span>
                    <span class="kds-dish-portion">${item.portionLabel || item.portion || ''}</span>
                  </div>
                  ${item.extras && item.extras.length > 0 ? `
                    <div class="kds-dish-extras">+ ${item.extras.map(e => typeof e === 'object' ? e.label : e).join(', ')}</div>
                  ` : ''}
                  ${item.notes || item.specialNotes ? `
                    <div class="kds-dish-notes">Note: "${item.notes || item.specialNotes}"</div>
                  ` : ''}
                </div>
              `).join('') : `<div>${ord.items_summary || 'Standard Order Items'}</div>`}
            </div>
          </div>

          <div class="kds-ticket-footer">
            ${nextStatus ? `
              <button class="kds-btn-step ${actionBtnClass}" onclick="window.MatbakhKds.advanceStatus(${ord.id}, '${nextStatus}')">
                <span>${actionBtnText}</span>
              </button>
            ` : `
              <button class="kds-btn-step ${actionBtnClass}" disabled>
                <span>${actionBtnText}</span>
              </button>
            `}

            <div class="kds-secondary-actions">
              <span class="${isPaid ? 'kds-paid-badge' : 'kds-unpaid-badge'}">
                ${isPaid ? 'Paid at Table' : 'Tab Open'}
              </span>
              ${ord.status !== 'settled' ? `
                <button class="kds-btn-text-action" onclick="window.MatbakhKds.markSettled(${ord.id})">
                  Mark Table Settled
                </button>
              ` : `
                <span style="color: var(--color-slate); font-size: 11px;">Table Reset Completed</span>
              `}
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  /**
   * Load Tickets (Supabase with robust fallback)
   */
  async function loadTickets() {
    let loaded = [];

    if (state.supabase) {
      try {
        const { data, error } = await state.supabase
          .from('orders')
          .select('*')
          .order('id', { ascending: false })
          .limit(20);

        if (!error && data && data.length > 0) {
          loaded = data;
        }
      } catch (e) {
        console.warn('Supabase fetch fallback:', e);
      }
    }

    if (loaded.length === 0) {
      // Default initial baseline tickets
      loaded = [
        {
          id: 104,
          table_number: 'T-04',
          customer_name: 'Dr. Tarek',
          status: 'cooking',
          created_at: new Date(Date.now() - 5 * 60000).toISOString(),
          total_amount: 285.00,
          is_paid: true,
          payment_status: 'paid',
          order_payload: [
            { name: 'Angus Flame-Grilled Burger', portionLabel: 'Double Patty', extras: [{ label: 'Aged Cheddar' }], notes: 'sauce on side' },
            { name: 'Golden Seasoned Fries', portionLabel: 'Loaded Basket', extras: [], notes: '' }
          ]
        },
        {
          id: 102,
          table_number: 'T-02',
          customer_name: 'Nour Family',
          status: 'new',
          created_at: new Date(Date.now() - 2 * 60000).toISOString(),
          total_amount: 364.80,
          is_paid: false,
          payment_status: 'unpaid',
          order_payload: [
            { name: 'Flame-Grilled Tenderloin Steak', portionLabel: '250g Prime Cut', extras: [{ label: 'Truffle Mushroom' }], notes: 'Medium Rare' }
          ]
        },
        {
          id: 101,
          table_number: 'T-08',
          customer_name: 'Salma',
          status: 'served',
          created_at: new Date(Date.now() - 22 * 60000).toISOString(),
          total_amount: 195.00,
          is_paid: false,
          payment_status: 'unpaid',
          order_payload: [
            { name: 'Neapolitan Artisan Margherita', portionLabel: '14-inch Table Share', extras: [{ label: 'Burrata Center' }], notes: 'crispy crust' }
          ]
        }
      ];
    }

    state.orders = loaded;
    render();
  }

  /**
   * Realtime event listener
   */
  function initRealtime() {
    if (!state.supabase) return;

    try {
      state.supabase
        .channel('kds-stream-channel')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, payload => {
          if (payload && payload.new) {
            state.orders.unshift(payload.new);
            playAudioCue('new_order');
            render();
            if (window.showToast) {
              window.showToast({
                title: 'New Table Ticket Fired',
                message: `Order #ORD-${payload.new.id} arrived for Table ${payload.new.table_number}.`,
                meta: 'NEW TICKET',
                type: 'info'
              });
            }
          }
        })
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders' }, payload => {
          if (payload && payload.new) {
            const idx = state.orders.findIndex(o => String(o.id) === String(payload.new.id));
            if (idx !== -1) {
              const oldStatus = state.orders[idx].status;
              state.orders[idx] = payload.new;
              if (oldStatus !== payload.new.status) {
                playAudioCue(payload.new.status);
              }
            } else {
              state.orders.unshift(payload.new);
            }
            render();
          }
        })
        .subscribe();
    } catch (err) {
      console.warn('Realtime subscription notice:', err);
    }
  }

  /**
   * Public API
   */
  window.MatbakhKds = {
    init: function(options = {}) {
      if (options.containerId) state.targetContainerId = options.containerId;

      if (window.SUPABASE_CONFIG && window.supabase) {
        try {
          state.supabase = window.supabase.createClient(
            window.SUPABASE_CONFIG.url,
            window.SUPABASE_CONFIG.publishableKey || window.SUPABASE_CONFIG.anonKey
          );
        } catch (e) {}
      }

      try {
        state.audioEnabled = localStorage.getItem(STORAGE_AUDIO_KEY) === 'true';
      } catch (e) {
        state.audioEnabled = false;
      }

      loadTickets();
      initRealtime();
      initSettledListener();

      // Auto-refresh timers every 30 seconds
      setInterval(() => {
        render();
      }, 30000);
    },

    advanceStatus: updateTicketStatus,
    markSettled: markTableSettled,
    playAudioCue: playAudioCue,
    toggleAudio: toggleAudio,

    setFilter: function(filterName) {
      state.activeFilter = filterName;
      render();
    },

    setSearch: function(query) {
      state.searchQuery = query;
      render();
    },

    getOrders: () => state.orders,
    reload: loadTickets
  };

  function autoInit() {
    if (document.getElementById('kdsTicketsGrid')) {
      window.MatbakhKds.init({ containerId: 'kdsTicketsGrid' });
    } else if (document.getElementById('kdsTicketCards')) {
      window.MatbakhKds.init({ containerId: 'kdsTicketCards' });
    }
  }

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoInit);
  } else {
    autoInit();
  }
})(window);
