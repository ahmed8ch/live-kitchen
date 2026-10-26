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

  /**
   * Switch the active screen across the workspace and synchronize all nav items.
   * @param {'hero' | 'menu' | 'tracker' | 'stand' | 'kds'} screenId
   */
  function switchMainScreen(screenId) {
    const screens = {
      hero: document.getElementById('screen-hero'),
      menu: document.getElementById('screen-menu'),
      tracker: document.getElementById('screen-tracker'),
      stand: document.getElementById('screen-stand'),
      kds: document.getElementById('screen-kds')
    };

    // Close any deprecated screens
    const floorScreen = document.getElementById('screen-floor');
    if (floorScreen) floorScreen.style.display = 'none';

    // Hide all valid screens
    Object.keys(screens).forEach(id => {
      if (screens[id]) screens[id].style.display = 'none';
    });

    // Show target screen
    if (screens[screenId]) {
      screens[screenId].style.display = 'block';
    } else if (screens.hero) {
      screens.hero.style.display = 'block';
      screenId = 'hero';
    }

    // Synchronize Top SaaS Navigation Links
    document.querySelectorAll('.saas-nav-link').forEach(link => {
      link.classList.remove('active');
    });
    const activeTopLink = document.getElementById('navLink-' + screenId);
    if (activeTopLink) activeTopLink.classList.add('active');

    // Synchronize Sidebar Buttons
    document.querySelectorAll('.cf-nav-item').forEach(btn => {
      btn.classList.remove('active');
    });
    const activeSideBtn = document.getElementById('sideBtn-' + screenId);
    if (activeSideBtn) activeSideBtn.classList.add('active');

    // Close mobile drawer on navigation
    closeMobileSidebar();

    // Scroll workspace to top smoothly
    const ws = document.getElementById('mainWorkspace');
    if (ws) ws.scrollTop = 0;
  }

  window.MatbakhShell = {
    init: initShell,
    toggleCollapse: toggleSidebarCollapse,
    toggleMobile: toggleMobileSidebar,
    closeMobile: closeMobileSidebar,
    switchScreen: switchMainScreen
  };

  // Bind global helpers for backward compatibility with inline triggers
  window.toggleSidebarCollapse = toggleSidebarCollapse;
  window.toggleMobileSidebar = toggleMobileSidebar;
  window.closeMobileSidebar = closeMobileSidebar;
  window.switchMainScreen = switchMainScreen;

  // Run initial state setup on DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initShell);
  } else {
    initShell();
  }
})(window);
