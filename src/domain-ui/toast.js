/**
 * MatbakhLink Toast Notification Module
 * Zero emojis — 100% Light Theme Firecrawl Design Standard
 */
(function(window) {
  'use strict';

  let container = null;

  function ensureContainer() {
    if (!container || !document.body.contains(container)) {
      container = document.getElementById('matbakh-toast-container');
      if (!container) {
        container = document.createElement('div');
        container.id = 'matbakh-toast-container';
        container.setAttribute('aria-live', 'polite');
        document.body.appendChild(container);
      }
    }
    return container;
  }

  const ICONS = {
    success: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`,
    info: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`,
    warning: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`
  };

  /**
   * Display an in-app non-blocking toast banner.
   * @param {Object} options
   * @param {string} options.title - Toast header (e.g. "Order Dispatched")
   * @param {string} options.message - Descriptive text
   * @param {string} [options.meta] - Optional monospace badge (e.g. "ORD-108 · 128ms")
   * @param {'success'|'info'|'warning'} [options.type='info']
   * @param {number} [options.duration=3600] - Duration in ms before auto-dismiss
   */
  function showToast(options) {
    if (typeof options === 'string') {
      options = { message: options, title: 'Notification', type: 'info' };
    }

    const {
      title = 'Notice',
      message = '',
      meta = '',
      type = 'info',
      duration = 3600
    } = options;

    const parent = ensureContainer();
    const toast = document.createElement('div');
    toast.className = 'matbakh-toast';
    toast.setAttribute('role', 'status');

    const iconSvg = ICONS[type] || ICONS.info;

    toast.innerHTML = `
      <div class="toast-icon-wrap ${type}">
        ${iconSvg}
      </div>
      <div class="toast-body">
        <div class="toast-title-row">
          <span class="toast-title">${escapeHtml(title)}</span>
          ${meta ? `<span class="toast-meta">${escapeHtml(meta)}</span>` : ''}
        </div>
        ${message ? `<p class="toast-message">${escapeHtml(message)}</p>` : ''}
      </div>
      <button class="toast-close-btn" aria-label="Dismiss notification">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    `;

    parent.appendChild(toast);

    // Trigger animation in
    requestAnimationFrame(() => {
      toast.classList.add('toast-visible');
    });

    let dismissTimer = null;

    function dismiss() {
      if (dismissTimer) clearTimeout(dismissTimer);
      toast.classList.remove('toast-visible');
      toast.classList.add('toast-hiding');
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 260);
    }

    const closeBtn = toast.querySelector('.toast-close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', dismiss);
    }

    if (duration > 0) {
      dismissTimer = setTimeout(dismiss, duration);
    }

    return { dismiss };
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  window.MatbakhToast = { show: showToast };
  window.showToast = showToast;

})(window);
