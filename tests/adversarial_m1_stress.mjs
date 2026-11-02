// Adversarial Stress Harness for Milestone 1: Shell Persona Decoupling, Routing, Emojis, and Tokens
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const ROOT_DIR = process.cwd();

// Complete Unicode Pictographic & Emoji Range (Standardized)
const UNICODE_EMOJI_REGEX = /[\u{1F300}-\u{1F5FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;

const results = [];

function recordResult(testId, name, passed, details = '') {
  results.push({ testId, name, passed, details });
  const status = passed ? '[PASS]' : '[FAIL]';
  console.log(`  ${status} ${testId}: ${name}${details ? ` (${details})` : ''}`);
}

console.log('\n======================================================================');
console.log('ADVERSARIAL STRESS SUITE: MILESTONE 1 CHALLENGE');
console.log('======================================================================\n');

// -----------------------------------------------------------------------------
// SECTION 1: ROUTING, PARAMETER PERMUTATIONS & PERSONA ISOLATION
// -----------------------------------------------------------------------------
console.log('--- Section 1: Route & Parameter Adversarial Matrix ---');

// Logic mirrored directly from src/components/layout/Sidebar.tsx and src/App.tsx
function evaluateSidebarNav({ pathname, activeTable, orders = [] }) {
  const isConsumerRoute =
    pathname === '/' ||
    pathname.startsWith('/menu') ||
    pathname.startsWith('/companion') ||
    pathname.startsWith('/guest-order') ||
    pathname.startsWith('/tracker') ||
    pathname.startsWith('/order') ||
    pathname.startsWith('/settlement');

  const trackerTarget = orders.length > 0 ? `/order/${orders[0].id}` : '/tracker';
  const settlementTarget = orders.length > 0 ? `/settlement/${orders[0].id}` : '/settlement';
  const tableParam = activeTable ? `?table=${activeTable}` : '';

  const navItems = [
    { id: 'home', label: 'Overview', to: '/' },
    { id: 'menu', label: 'Menu', to: `/menu${tableParam}`, badge: activeTable || undefined },
    { id: 'companion', label: 'Companion Order', to: `/companion${tableParam}` },
    { id: 'tracker', label: 'Order Tracker', to: `${trackerTarget}${tableParam}` },
    { id: 'settlement', label: 'Bill & Split', to: `${settlementTarget}${tableParam}` },
    { id: 'kds', label: 'Kitchen Pass (KDS)', to: '/kds', badge: 'KDS' },
    { id: 'cashier', label: 'Cashier POS', to: '/cashier', badge: 'POS' },
    { id: 'stand', label: 'Table QR Stand', to: '/stand' },
  ];

  const visibleNavItems = navItems.filter((item) => {
    if (['kds', 'cashier', 'stand'].includes(item.id)) {
      return !isConsumerRoute && !activeTable;
    }
    return true;
  });

  return {
    isConsumerRoute,
    visibleNavItems,
    visibleIds: visibleNavItems.map((i) => i.id),
  };
}

function evaluateAppShell({ pathname, search }) {
  const isKds = pathname.startsWith('/kds');
  const isStand = pathname.startsWith('/stand');
  const isCashier = pathname.startsWith('/cashier');

  const searchParams = new URLSearchParams(search);
  const tableParam = searchParams.get('table');
  const ingestedTable = tableParam ? tableParam.trim().toUpperCase() : null;

  const showsSidebar = !isKds && !isCashier;
  const showsFooter = !isKds && !isStand && !isCashier;

  return {
    isKds,
    isStand,
    isCashier,
    ingestedTable,
    showsSidebar,
    showsFooter,
  };
}

const testScenarios = [
  // Standard Seated Diner Routes
  { name: 'Standard Diner Menu with Table', path: '/menu', search: '?table=T-04', activeTable: 'T-04', expectLeaks: false },
  { name: 'Diner Menu with Empty Table Param', path: '/menu', search: '?table=', activeTable: null, expectLeaks: false },
  { name: 'Diner Menu with Whitespace Table Param', path: '/menu', search: '?table=%20%20', activeTable: null, expectLeaks: false },
  { name: 'Diner Menu with Lowercase Table Param', path: '/menu', search: '?table=t-04', activeTable: 'T-04', expectLeaks: false },
  { name: 'Diner Menu with Encoded Characters', path: '/menu', search: '?table=T%2004', activeTable: 'T 04', expectLeaks: false },
  { name: 'Diner Menu with Malicious XSS Param', path: '/menu', search: '?table=<script>alert(1)</script>', activeTable: '<SCRIPT>ALERT(1)</SCRIPT>', expectLeaks: false },
  
  // Companion Flow Routes
  { name: 'Companion Screen', path: '/companion', search: '', activeTable: null, expectLeaks: false },
  { name: 'Companion Screen with Table', path: '/companion', search: '?table=T-04', activeTable: 'T-04', expectLeaks: false },
  { name: 'Guest Order Alias Route', path: '/guest-order', search: '?table=T-04', activeTable: 'T-04', expectLeaks: false },
  
  // Tracker Routes
  { name: 'Tracker with Query Param', path: '/tracker', search: '?orderId=ORD-999', activeTable: 'T-04', expectLeaks: false },
  { name: 'Tracker Base Path', path: '/tracker', search: '', activeTable: null, expectLeaks: false },
  { name: 'Order ID Route Pattern', path: '/order/ORD-999', search: '', activeTable: 'T-04', expectLeaks: false },
  
  // Settlement Routes
  { name: 'Settlement Screen with Table', path: '/settlement', search: '?table=T-04', activeTable: 'T-04', expectLeaks: false },
  { name: 'Settlement with Order Param', path: '/settlement/ORD-999', search: '', activeTable: 'T-04', expectLeaks: false },
  { name: 'Settlement Base without Table', path: '/settlement', search: '', activeTable: null, expectLeaks: false },
  
  // Overview / Home Route
  { name: 'Home Landing Page (Empty State)', path: '/', search: '', activeTable: null, expectLeaks: false },
  { name: 'Home Landing Page with Table Param', path: '/', search: '?table=T-04', activeTable: 'T-04', expectLeaks: false },

  // Operations Workstations
  { name: 'Kitchen KDS Pass', path: '/kds', search: '', activeTable: null, expectOpsItems: true, workstation: true },
  { name: 'Cashier POS Terminal', path: '/cashier', search: '', activeTable: null, expectOpsItems: true, workstation: true },
  { name: 'Table Stand Generator (Stand-alone)', path: '/stand', search: '', activeTable: null, expectOpsItems: true },
  { name: 'Table Stand Generator with Table Param', path: '/stand', search: '?table=T-04', activeTable: 'T-04', expectLeaks: false },
];

testScenarios.forEach((sc, idx) => {
  const nav = evaluateSidebarNav({ pathname: sc.path, activeTable: sc.activeTable });
  const shell = evaluateAppShell({ pathname: sc.path, search: sc.search });

  const hasBackofficeLeak = nav.visibleIds.some((id) => ['kds', 'cashier', 'stand'].includes(id));
  
  if (sc.expectOpsItems) {
    const passed = nav.visibleIds.includes('kds') && nav.visibleIds.includes('cashier') && nav.visibleIds.includes('stand');
    recordResult(`ADV-1.${idx + 1}`, `Operations persona visibility on ${sc.name}`, passed, `Visible items: ${nav.visibleIds.join(', ')}`);
  } else {
    const passed = !hasBackofficeLeak;
    recordResult(`ADV-1.${idx + 1}`, `Zero back-office leaks on ${sc.name}`, passed, `Visible items: ${nav.visibleIds.join(', ')}`);
  }

  if (sc.workstation) {
    const shellPassed = !shell.showsSidebar && !shell.showsFooter;
    recordResult(`ADV-1.${idx + 1}.WS`, `Workstation unmounts dock & footer on ${sc.name}`, shellPassed);
  }
});

// -----------------------------------------------------------------------------
// SECTION 2: ADVERSARIAL AST & REGEX UNICODE EMOJI SCAN
// -----------------------------------------------------------------------------
console.log('\n--- Section 2: Strict Unicode Emoji AST/Regex Scan ---');

function scanDirForEmojis(dirRel) {
  const dirAbs = path.resolve(ROOT_DIR, dirRel);
  const found = [];

  function checkFile(full) {
    const ext = path.extname(full).toLowerCase();
    if (['.ts', '.tsx', '.css', '.html', '.json'].includes(ext)) {
      const content = fs.readFileSync(full, 'utf8');
      const lines = content.split('\n');
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const m = line.match(UNICODE_EMOJI_REGEX);
        if (m) {
          found.push({
            file: path.relative(ROOT_DIR, full),
            line: i + 1,
            emoji: m[0],
            snippet: line.trim().slice(0, 80),
          });
        }
      }
    }
  }

  function walk(current) {
    if (!fs.existsSync(current)) return;
    const stat = fs.statSync(current);
    if (!stat.isDirectory()) {
      checkFile(current);
      return;
    }
    const entries = fs.readdirSync(current, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        if (!['node_modules', '.git', 'dist'].includes(entry.name)) {
          walk(full);
        }
      } else {
        checkFile(full);
      }
    }
  }

  walk(dirAbs);
  return found;
}

const srcEmojis = scanDirForEmojis('src');
recordResult('ADV-2.1', 'Zero Unicode emojis anywhere in src/ (code, comments, UI)', srcEmojis.length === 0, `Found: ${srcEmojis.length}`);
if (srcEmojis.length > 0) {
  srcEmojis.slice(0, 5).forEach((e) => console.log(`    ! Emoji in ${e.file}:${e.line} -> "${e.emoji}" in "${e.snippet}"`));
}

const indexHtmlEmojis = scanDirForEmojis('index.html');
recordResult('ADV-2.2', 'Zero Unicode emojis in index.html entry point', indexHtmlEmojis.length === 0, `Found: ${indexHtmlEmojis.length}`);

// -----------------------------------------------------------------------------
// SECTION 3: DETECT.MJS MULTI-FLAG AUDIT & ANTI-PATTERN REGRESSIONS
// -----------------------------------------------------------------------------
console.log('\n--- Section 3: avoid-ai-design detect.mjs Multi-Flag Audit ---');

function runDetectMjs(args) {
  try {
    const stdout = execSync(`node .agents/skills/avoid-ai-design/scripts/detect.mjs ${args}`, {
      cwd: ROOT_DIR,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    return { exitCode: 0, stdout };
  } catch (err) {
    return { exitCode: err.status || 1, stdout: (err.stdout ? err.stdout.toString() : '') + (err.stderr ? err.stderr.toString() : '') };
  }
}

const detectP2 = runDetectMjs('src --min=P2 --json');
let p2Json = null;
try {
  p2Json = JSON.parse(detectP2.stdout);
} catch (e) {}

recordResult('ADV-3.1', 'detect.mjs returns exit code 0 on src/', detectP2.exitCode === 0, `Exit code: ${detectP2.exitCode}`);
recordResult('ADV-3.2', 'detect.mjs reports 0 total findings across src/', p2Json && p2Json.summary && p2Json.summary.total === 0, `Total findings: ${p2Json?.summary?.total}`);
recordResult('ADV-3.3', 'detect.mjs reports 0 P0 findings in src/', p2Json && p2Json.summary && p2Json.summary.P0 === 0, `P0: ${p2Json?.summary?.P0}`);
recordResult('ADV-3.4', 'detect.mjs reports 0 P1 findings in src/', p2Json && p2Json.summary && p2Json.summary.P1 === 0, `P1: ${p2Json?.summary?.P1}`);
recordResult('ADV-3.5', 'detect.mjs reports 0 P2 findings in src/', p2Json && p2Json.summary && p2Json.summary.P2 === 0, `P2: ${p2Json?.summary?.P2}`);

// File-specific audits
const sidebarAudit = runDetectMjs('src/components/layout/Sidebar.tsx --min=P2 --json');
let sidebarJson = null;
try { sidebarJson = JSON.parse(sidebarAudit.stdout); } catch (e) {}
recordResult('ADV-3.6', 'Sidebar.tsx has 0 anti-pattern findings', sidebarJson && sidebarJson.summary && sidebarJson.summary.total === 0);

const appAudit = runDetectMjs('src/App.tsx --min=P2 --json');
let appJson = null;
try { appJson = JSON.parse(appAudit.stdout); } catch (e) {}
recordResult('ADV-3.7', 'App.tsx has 0 anti-pattern findings', appJson && appJson.summary && appJson.summary.total === 0);

const cssAudit = runDetectMjs('src/index.css --min=P2 --json');
let cssJson = null;
try { cssJson = JSON.parse(cssAudit.stdout); } catch (e) {}
recordResult('ADV-3.8', 'index.css has 0 anti-pattern findings (C5 glow fixed)', cssJson && cssJson.summary && cssJson.summary.total === 0);

// -----------------------------------------------------------------------------
// SECTION 4: VISUAL REGRESSION RISKS, TOUCH ERGONOMICS & TOKENS
// -----------------------------------------------------------------------------
console.log('\n--- Section 4: Visual Regression, Touch Ergonomics & Tokens ---');

const sidebarCode = fs.readFileSync(path.resolve(ROOT_DIR, 'src/components/layout/Sidebar.tsx'), 'utf8');
const appCode = fs.readFileSync(path.resolve(ROOT_DIR, 'src/App.tsx'), 'utf8');
const cssCode = fs.readFileSync(path.resolve(ROOT_DIR, 'src/index.css'), 'utf8');

// 4.1 Mobile Menu Drawer Toggle Touch Target
const mobileToggleTarget44 = /<button[\s\S]*?onClick=\{\(\)\s*=>\s*setMobileDrawerOpen\(!mobileDrawerOpen\)\}[\s\S]*?min-w-\[44px\]\s+min-h-\[44px\]/.test(sidebarCode);
recordResult(
  'ADV-4.1',
  'Mobile drawer toggle button has minimum 44x44px touch target',
  mobileToggleTarget44,
  mobileToggleTarget44 ? 'min-w-[44px] min-h-[44px]' : 'Current: min-w-[40px] min-h-[40px]'
);

// 4.2 Mobile Dine-In Menu Header Button Touch Target
const mobileMenuHeaderButton44 = /to=\{menuTarget\}[^>]*min-h-\[44px\]/.test(sidebarCode);
recordResult(
  'ADV-4.2',
  'Mobile header "Dine-In Menu" button has minimum 44px height',
  mobileMenuHeaderButton44,
  mobileMenuHeaderButton44 ? 'Compliant' : 'Missing min-h-[44px] (currently py-1.5)'
);

// 4.3 Mobile Drawer Scrollability in Landscape / Short Viewports
const mobileDrawerScrollable = /className="[^"]*w-72[^"]*overflow-y-auto/.test(sidebarCode);
recordResult(
  'ADV-4.3',
  'Mobile drawer container has overflow-y-auto for short/landscape viewports',
  mobileDrawerScrollable,
  mobileDrawerScrollable ? 'Scrollable' : 'Missing overflow-y-auto (risk of clipping)'
);

// 4.4 Standardized Radii Compliance in Sidebar.tsx
const nonStandardRadiiInSidebar = sidebarCode.match(/rounded-\[(?!full)\d+px\]|rounded-xl|rounded-md|rounded-sm/g);
recordResult(
  'ADV-4.4',
  'Sidebar.tsx uses strictly standardized 3-tier radii (999px, 16px, 8px)',
  !nonStandardRadiiInSidebar,
  nonStandardRadiiInSidebar ? `Non-standard radii: ${nonStandardRadiiInSidebar.join(', ')}` : 'Compliant'
);

// 4.5 Prohibited Text "Port Said" in Sidebar, App, and index.css
const portSaidInShell = /Port Said/i.test(sidebarCode) || /Port Said/i.test(appCode) || /Port Said/i.test(cssCode);
recordResult(
  'ADV-4.5',
  'Absence of "Port Said" or academic labels in shell files',
  !portSaidInShell,
  portSaidInShell ? 'Detected "Port Said"' : 'Clean'
);

// 4.6 App.tsx Footer Staff Links Filter
const footerContainsStaffLinks = appCode.includes('Staff KDS Line') || appCode.includes('Cashier Register');
recordResult(
  'ADV-4.6',
  'App.tsx global consumer footer excludes Staff KDS and Cashier links',
  !footerContainsStaffLinks,
  footerContainsStaffLinks ? 'Leaked staff links in footer' : 'Clean'
);

// 4.7 Hardcoded Table in WorkstationBarrier.tsx
const barrierCode = fs.readFileSync(path.resolve(ROOT_DIR, 'src/components/layout/WorkstationBarrier.tsx'), 'utf8');
const hardcodedTableInBarrier = barrierCode.includes('to="/menu?table=T-04"');
recordResult(
  'ADV-4.7',
  'WorkstationBarrier.tsx preserves activeTable rather than hardcoding T-04',
  !hardcodedTableInBarrier,
  hardcodedTableInBarrier ? 'Hardcodes to="/menu?table=T-04"' : 'Dynamic'
);

// -----------------------------------------------------------------------------
// SUMMARY
// -----------------------------------------------------------------------------
console.log('\n======================================================================');
const totalTests = results.length;
const passedTests = results.filter((r) => r.passed).length;
const failedTests = results.filter((r) => !r.passed).length;

console.log(`TOTAL ADVERSARIAL STRESS TESTS: ${totalTests}`);
console.log(`PASSED: ${passedTests}`);
console.log(`FAILED: ${failedTests}`);
console.log('======================================================================\n');

if (failedTests > 0) {
  console.log('FAILED TESTS SUMMARY:');
  results.filter((r) => !r.passed).forEach((r) => {
    console.log(`  - ${r.testId}: ${r.name} -> ${r.details}`);
  });
}

process.exit(failedTests > 0 ? 1 : 0);
