/**
 * MatbakhLink Shell & Navigation State Machine
 * Domain 1: Layout & Navigation Control
 * Zero emojis — Strict Firecrawl Light Theme Architecture
 */
(function(window) {
  'use strict';

  // Default UI State: Enforce compact sidebar on root initial paint
  const STORAGE_KEY = 'matbakh_sidebar_expanded';

  function initShell() {
    const sidebar = document.getElementById('cfSidebar');
    const collapseText = document.getElementById('collapseBtnText');

    if (!sidebar) return;

    // Check if user explicitly expanded sidebar in this browser session
    const userPrefersExpanded = localStorage.getItem(STORAGE_KEY) === 'true';

    if (userPrefersExpanded) {
      sidebar.classList.remove('collapsed');
      if (collapseText) collapseText.innerText = 'Collapse';
    } else {
      sidebar.classList.add('collapsed');
      if (collapseText) collapseText.innerText = '';
    }
  }

  function toggleSidebarCollapse() {
    const sidebar = document.getElementById('cfSidebar');
    const collapseText = document.getElementById('collapseBtnText');
    if (!sidebar) return;

    const isNowCollapsed = sidebar.classList.toggle('collapsed');
    if (collapseText) {
      collapseText.innerText = isNowCollapsed ? '' : 'Collapse';
    }
    // Persist explicit user toggle
    localStorage.setItem(STORAGE_KEY, (!isNowCollapsed).toString());
  }

  function toggleMobileSidebar() {
    const sidebar = document.getElementById('cfSidebar');
    const backdrop = document.getElementById('sidebarBackdrop');
    if (!sidebar) return;

    sidebar.classList.toggle('open');
    if (backdrop) {
      backdrop.classList.toggle('active');
    }
  }

  function closeMobileSidebar() {
    const sidebar = document.getElementById('cfSidebar');
    const backdrop = document.getElementById('sidebarBackdrop');
    if (sidebar) sidebar.classList.remove('open');
    if (backdrop) backdrop.classList.remove('active');
  }

  window.MatbakhShell = {
    init: initShell,
    toggleCollapse: toggleSidebarCollapse,
    toggleMobile: toggleMobileSidebar,
    closeMobile: closeMobileSidebar
  };

  // Bind global helpers for backward compatibility with inline triggers
  window.toggleSidebarCollapse = toggleSidebarCollapse;
  window.toggleMobileSidebar = toggleMobileSidebar;
  window.closeMobileSidebar = closeMobileSidebar;

  // Run initial state setup on DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initShell);
  } else {
    initShell();
  }
})(window);
