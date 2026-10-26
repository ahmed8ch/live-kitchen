/**
 * MatbakhLink Shared Utilities & Helpers
 * Domain 7: Pure helper functions and formatters
 * Zero emojis — Strict compliance
 */
(function(window) {
  'use strict';

  function formatEgp(val) {
    const num = Number(val) || 0;
    return num.toFixed(2) + ' EGP';
  }

  function formatCalories(kcal) {
    const num = Number(kcal) || 0;
    return num + ' kcal';
  }

  function generateOrderId() {
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    return 'ORD-' + randomSuffix;
  }

  function formatDuration(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return String(mins).padStart(2, '0') + ':' + String(secs).padStart(2, '0');
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

  window.MatbakhUtils = {
    formatEgp,
    formatCalories,
    generateOrderId,
    formatDuration,
    escapeHtml
  };
})(window);
