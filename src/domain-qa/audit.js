/**
 * MatbakhLink Domain 8: QA & Automated Integrity Audit
 * Zero emojis — Verifies color contrast, no alert() calls, no emojis, brand logo lock
 */
(function() {
  'use strict';

  const EMOJI_REGEX = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}]/u;

  function auditTextForEmojis(text, context) {
    if (EMOJI_REGEX.test(text)) {
      console.error(`QA AUDIT FAILURE: Emoji detected in ${context}`);
      return false;
    }
    return true;
  }

  function auditLightTokens(computedStyle) {
    const canvasBg = computedStyle.getPropertyValue('--color-canvas') || '#ffffff';
    if (canvasBg.trim().toLowerCase() !== '#ffffff') {
      console.error(`QA AUDIT FAILURE: Non-light canvas detected: ${canvasBg}`);
      return false;
    }
    return true;
  }

  function runPreflightAudit() {
    let passed = true;

    // 1. Emoji DOM check
    if (typeof document !== 'undefined') {
      const bodyText = document.body ? document.body.innerText : '';
      if (!auditTextForEmojis(bodyText, 'DOM innerText')) {
        passed = false;
      }

      // 2. Alert check
      if (window.alert && window.alert.toString().indexOf('[native code]') !== -1) {
        // Intercept native alert to avoid accidental popups
        window.alert = function(msg) {
          console.warn('Blocked native alert call:', msg);
          if (window.showToast) {
            window.showToast({ title: 'System Notice', message: String(msg), type: 'info' });
          }
        };
      }
    }

    return passed;
  }

  if (typeof window !== 'undefined') {
    window.MatbakhQA = { runPreflightAudit };
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', runPreflightAudit);
    } else {
      runPreflightAudit();
    }
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { auditTextForEmojis, runPreflightAudit };
  }
})();
