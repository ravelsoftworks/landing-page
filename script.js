/* ==========================================================================
   RAVEL SOFTWORKS — INTERACTIVE SCRIPT
   ========================================================================== */

/* --------------------------------------------------------------------------
   CONFIGURE ME: the WhatsApp number every button on this page opens.
   International format, digits only, no "+" and no spaces.
   Example for a Bengaluru mobile: '919876543210'
   Left empty, WhatsApp opens with the message drafted but no recipient chosen.
   -------------------------------------------------------------------------- */
const WHATSAPP_NUMBER = '';

document.addEventListener('DOMContentLoaded', () => {
  initThemeEngine();
  initNavbar();
  initMobileMenu();
  initHeroSimulator();
  initRoiCalculator();
  initWhatsAppModal();
  initServiceModals();
  initModalChrome();
  initKeyboardShortcuts();
  initFooterYear();
});

const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function waLink(text) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}

/* --------------------------------------------------------------------------
   1. THEME
   The initial theme is applied by an inline script in <head> so there is no
   flash; this only handles the toggle and keeps the button label truthful.
   -------------------------------------------------------------------------- */
function initThemeEngine() {
  const toggle = document.getElementById('theme-toggle');
  const root = document.documentElement;

  function syncLabel() {
    const isDark = root.getAttribute('data-theme') === 'dark';
    if (toggle) {
      toggle.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
    }
    const meta = document.querySelector('meta[name="theme-color"]:not([media])');
    if (meta) meta.setAttribute('content', isDark ? '#070A12' : '#EEF2F8');
  }

  syncLabel();

  if (!toggle) return;

  toggle.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try {
      localStorage.setItem('ravel_theme', next);
    } catch (e) { /* private mode: the choice just won't persist */ }
    syncLabel();
    showToast(next === 'dark' ? 'Dark mode on' : 'Light mode on');
  });
}

/* --------------------------------------------------------------------------
   2. NAVBAR — shadow on scroll + current-section highlighting
   -------------------------------------------------------------------------- */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  const navLinks = Array.from(document.querySelectorAll('.nav-link'));

  // Only sections a nav link actually points at
  const targets = navLinks
    .map(link => {
      const id = link.getAttribute('href').slice(1);
      return { link, section: document.getElementById(id) };
    })
    .filter(entry => entry.section);

  let queued = false;

  function update() {
    queued = false;

    if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 12);

    const probe = window.scrollY + window.innerHeight * 0.35;
    let current = null;

    targets.forEach(({ link, section }) => {
      if (section.offsetTop <= probe) current = link;
    });

    // At the very bottom the last section wins, even if it's short
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 4) {
      current = targets.length ? targets[targets.length - 1].link : current;
    }

    navLinks.forEach(link => {
      if (link === current) {
        link.setAttribute('aria-current', 'true');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  }

  window.addEventListener('scroll', () => {
    if (!queued) {
      queued = true;
      requestAnimationFrame(update);
    }
  }, { passive: true });

  window.addEventListener('resize', update, { passive: true });
  update();
}

function initMobileMenu() {
  const menuBtn = document.getElementById('mobile-menu-btn');
  const navLinks = document.getElementById('nav-links');
  if (!menuBtn || !navLinks) return;

  function setOpen(open) {
    navLinks.classList.toggle('mobile-open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    menuBtn.querySelector('i').className = open ? 'fa-solid fa-xmark' : 'fa-solid fa-bars';
  }

  menuBtn.addEventListener('click', () => {
    setOpen(!navLinks.classList.contains('mobile-open'));
  });

  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => setOpen(false));
  });

  // Tapping the page or pressing Escape closes it
  document.addEventListener('click', (e) => {
    if (!navLinks.classList.contains('mobile-open')) return;
    if (!navLinks.contains(e.target) && !menuBtn.contains(e.target)) setOpen(false);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navLinks.classList.contains('mobile-open')) {
      setOpen(false);
      menuBtn.focus();
    }
  });

  // Desktop layout has no menu button, so never leave the panel stuck open
  window.addEventListener('resize', () => {
    if (window.innerWidth > 860) setOpen(false);
  }, { passive: true });
}

/* --------------------------------------------------------------------------
   3. WORKFLOW SIMULATOR
   -------------------------------------------------------------------------- */
const WORKFLOW_PRESETS = {
  onboarding: {
    trigger: 'New client intake form submitted',
    agent: 'Extracting PDF data, checking the CRM, drafting the contract',
    thinking: [
      'Parsing client attachments',
      'Checking the CRM for duplicates',
      'Generating the NDA draft',
      'Routing complete'
    ],
    outcome: 'CRM updated and welcome pack sent',
    before: '3 days',
    after: '3 hours',
    speedup: '24x faster'
  },
  leads: {
    trigger: 'Inbound lead captured from web and email',
    agent: 'Enriching company data and scoring intent',
    thinking: [
      'Querying the enrichment API',
      'Scoring against your ideal customer profile',
      'Drafting a personalised reply'
    ],
    outcome: 'High-intent lead booked on a rep calendar',
    before: '48 hours',
    after: '15 minutes',
    speedup: '192x faster'
  },
  reports: {
    trigger: 'Weekly operations report scheduled',
    agent: 'Aggregating SQL data and analysing sentiment',
    thinking: [
      'Connecting to the database cluster',
      'Analysing multi-channel metrics',
      'Formatting the report deck'
    ],
    outcome: 'Executive summary delivered to Slack and inbox',
    before: '1 day',
    after: '5 minutes',
    speedup: '288x faster'
  },
  invoices: {
    trigger: 'Vendor invoice received in the inbox',
    agent: 'Reading the PDF, matching the PO, checking for anomalies',
    thinking: [
      'Running the OCR scan',
      'Matching line items to PO 8491',
      'Validating tax calculations'
    ],
    outcome: 'ERP updated and invoice routed for payment',
    before: '5 days',
    after: '1 hour',
    speedup: '120x faster'
  }
};

let thinkingInterval = null;

function initHeroSimulator() {
  const tabs = Array.from(document.querySelectorAll('.tab-btn'));
  if (!tabs.length) return;

  function select(tab, moveFocus) {
    tabs.forEach(t => {
      const isCurrent = t === tab;
      t.setAttribute('aria-selected', String(isCurrent));
      t.tabIndex = isCurrent ? 0 : -1;
    });
    if (moveFocus) tab.focus();
    runWorkflowSimulation(WORKFLOW_PRESETS[tab.dataset.preset]);
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => select(tab, false));

    // Arrow keys move between tabs, as a tablist is expected to
    tab.addEventListener('keydown', (e) => {
      const i = tabs.indexOf(tab);
      let next = null;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = tabs[(i + 1) % tabs.length];
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = tabs[(i - 1 + tabs.length) % tabs.length];
      if (e.key === 'Home') next = tabs[0];
      if (e.key === 'End') next = tabs[tabs.length - 1];
      if (next) {
        e.preventDefault();
        select(next, true);
      }
    });
  });

  runWorkflowSimulation(WORKFLOW_PRESETS.onboarding);
}

function runWorkflowSimulation(data) {
  if (!data) return;

  const set = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  };

  set('trigger-title', data.trigger);
  set('agent-title', data.agent);
  set('outcome-title', data.outcome);
  set('sim-time-before', data.before);
  set('sim-time-after', data.after);
  set('sim-speedup-badge', data.speedup);

  const thinkingText = document.getElementById('agent-thinking-text');
  if (thinkingInterval) clearInterval(thinkingInterval);
  if (!thinkingText || !data.thinking.length) return;

  thinkingText.textContent = data.thinking[0];

  // The ticker is decoration; don't loop it for people who asked for less motion
  if (prefersReducedMotion()) return;

  let i = 0;
  thinkingInterval = setInterval(() => {
    i = (i + 1) % data.thinking.length;
    thinkingText.textContent = data.thinking[i];
  }, 1800);
}

/* --------------------------------------------------------------------------
   4. ROI CALCULATOR
   -------------------------------------------------------------------------- */
const AUTOMATABLE_SHARE = 0.75;   // share of the entered manual hours we assume is automatable
const WEEKS_PER_MONTH = 4.3;
const BLENDED_HOURLY_RATE = 15;   // USD, matches the caption under the figure

function initRoiCalculator() {
  const teamSlider = document.getElementById('team-size-slider');
  const hoursSlider = document.getElementById('hours-slider');
  if (!teamSlider || !hoursSlider) return;

  const teamVal = document.getElementById('team-size-val');
  const hoursVal = document.getElementById('hours-val');
  const resHours = document.getElementById('res-hours-saved');
  const resCost = document.getElementById('res-cost-saved');
  const resSpeedup = document.getElementById('res-speedup');
  const ctaBtn = document.getElementById('calc-cta-btn');

  // Paint the filled portion of the track to match the value
  function paintTrack(slider) {
    const min = Number(slider.min);
    const max = Number(slider.max);
    const pct = ((Number(slider.value) - min) / (max - min)) * 100;
    slider.style.setProperty('--range-fill', `${pct}%`);
  }

  function calculate() {
    const people = parseInt(teamSlider.value, 10);
    const hoursPerWeek = parseInt(hoursSlider.value, 10);

    const peopleLabel = `${people} ${people === 1 ? 'person' : 'people'}`;
    if (teamVal) teamVal.textContent = peopleLabel;
    if (hoursVal) hoursVal.textContent = `${hoursPerWeek} hrs/week`;

    // Screen readers should hear the unit, not a bare number
    teamSlider.setAttribute('aria-valuetext', peopleLabel);
    hoursSlider.setAttribute('aria-valuetext', `${hoursPerWeek} hours per week`);

    const hoursSavedMonth = Math.round(people * hoursPerWeek * WEEKS_PER_MONTH * AUTOMATABLE_SHARE);
    const annualCostSaved = Math.round(hoursSavedMonth * 12 * BLENDED_HOURLY_RATE);

    if (resHours) resHours.textContent = `${hoursSavedMonth.toLocaleString()} hrs`;
    if (resCost) resCost.textContent = `$${annualCostSaved.toLocaleString()}`;

    let speedup = '10x - 20x';
    if (people > 30) speedup = '20x - 45x';
    if (people > 70) speedup = '50x+';
    if (resSpeedup) resSpeedup.textContent = speedup;

    paintTrack(teamSlider);
    paintTrack(hoursSlider);
  }

  teamSlider.addEventListener('input', calculate);
  hoursSlider.addEventListener('input', calculate);
  calculate();

  if (ctaBtn) {
    ctaBtn.addEventListener('click', () => openWhatsAppDrawer(ctaBtn));
  }
}

/* --------------------------------------------------------------------------
   5. MODAL PLUMBING — focus, scroll lock, restore
   -------------------------------------------------------------------------- */
const FOCUSABLE = 'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';
let lastFocused = null;

function openModal(modal, invoker) {
  if (!modal) return;
  lastFocused = invoker || document.activeElement;

  modal.hidden = false;
  // Force a reflow so the display:none -> flex change lands before the transition
  void modal.offsetWidth;
  modal.classList.add('active');
  document.body.classList.add('scroll-locked');

  // Focus the panel itself so a screen reader reads the dialog from its title,
  // and the first Tab lands on the close button. It has to wait for the next
  // frame: until the visibility transition has committed, focus() is ignored.
  const panel = modal.querySelector('.modal-content');
  if (panel) requestAnimationFrame(() => panel.focus());
}

function closeModal(modal) {
  if (!modal || modal.hidden) return;

  modal.classList.remove('active');
  document.body.classList.remove('scroll-locked');

  const panel = modal.querySelector('.modal-content');
  if (panel) panel.classList.remove('fullscreen');

  const finish = () => {
    modal.hidden = true;
    if (lastFocused && document.contains(lastFocused)) lastFocused.focus();
    lastFocused = null;
  };

  if (prefersReducedMotion()) {
    finish();
  } else {
    setTimeout(finish, 200);
  }
}

function openModals() {
  return Array.from(document.querySelectorAll('.modal-overlay')).filter(m => !m.hidden);
}

// Keep Tab inside whichever modal is open
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Tab') return;
  const modal = openModals()[0];
  if (!modal) return;

  const items = Array.from(modal.querySelectorAll(FOCUSABLE))
    .filter(el => el.offsetParent !== null);
  if (!items.length) return;

  const first = items[0];
  const last = items[items.length - 1];

  const onPanel = document.activeElement === modal.querySelector('.modal-content');

  if (e.shiftKey && (document.activeElement === first || onPanel)) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first.focus();
  }
});

/* --------------------------------------------------------------------------
   6. WHATSAPP DRAWER
   -------------------------------------------------------------------------- */
let selectedGoal = 'agentic AI workflows';

function initWhatsAppModal() {
  const modal = document.getElementById('wa-modal');
  const sendBtn = document.getElementById('send-wa-direct');
  const noteInput = document.getElementById('wa-custom-msg');
  const optBtns = Array.from(document.querySelectorAll('.wa-opt-btn'));

  ['open-whatsapp-drawer', 'hero-wa-btn', 'final-wa-btn', 'footer-wa-btn'].forEach(id => {
    const btn = document.getElementById(id);
    if (btn) btn.addEventListener('click', () => openWhatsAppDrawer(btn));
  });

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal(modal);
    });
  }

  function updateLink() {
    if (!sendBtn) return;
    const note = noteInput ? noteInput.value.trim() : '';
    let text = `Hi Ravel Softworks, I'm interested in ${selectedGoal} for my company.`;
    if (note) text += ` ${note}`;
    sendBtn.href = waLink(text);
  }

  optBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      optBtns.forEach(b => b.setAttribute('aria-pressed', String(b === btn)));
      selectedGoal = btn.dataset.goal;
      updateLink();
    });
  });

  if (noteInput) noteInput.addEventListener('input', updateLink);

  // Re-sync the option buttons whenever the drawer is opened with a preset goal
  document.addEventListener('ravel:goalchange', () => {
    optBtns.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.goal === selectedGoal)));
    updateLink();
  });

  updateLink();
}

function openWhatsAppDrawer(invoker, presetGoal) {
  if (presetGoal) {
    selectedGoal = presetGoal;
    document.dispatchEvent(new CustomEvent('ravel:goalchange'));
  }
  openModal(document.getElementById('wa-modal'), invoker);
}

/* --------------------------------------------------------------------------
   7. SERVICE DETAIL MODALS
   -------------------------------------------------------------------------- */
const SERVICE_DATA = {
  1: {
    title: 'Agentic AI workflows',
    tag: 'Autonomous systems',
    icon: 'fa-diagram-project',
    desc: 'Custom AI agents that run multi-step business processes, from pulling data out of documents to making the decision at the end, without anyone holding their hand.',
    features: [
      'Multi-agent orchestration and task delegation',
      'Model fine-tuning and prompt architecture',
      'Self-correcting error handling and fallback loops',
      'Live database and business-tool execution',
      'Human-in-the-loop review triggers'
    ]
  },
  2: {
    title: 'Process automation',
    tag: 'High throughput',
    icon: 'fa-gears',
    desc: 'We find the repetitive, time-draining tasks across your operations and hand them to intelligent, self-correcting systems built for high volume.',
    features: [
      'End-to-end operational workflow audit',
      'Custom data ingestion and scraping bots',
      'API integration across CRM, ERP and Slack',
      'Automated document generation and email triggers',
      'Round-the-clock monitoring and auto-recovery'
    ]
  },
  3: {
    title: 'AI integration & optimization',
    tag: 'Return on what you own',
    icon: 'fa-network-wired',
    desc: 'Already paying for AI tools? We connect, tune and optimize what you have so it returns something measurable instead of sitting half-used.',
    features: [
      'Retrieval-augmented generation over your own documents',
      'Private vector database deployment',
      'Cost-per-call reduction and model routing',
      'Dashboards for the metrics that matter',
      'Data masking for security and compliance'
    ]
  },
  4: {
    title: 'Custom IT solutions',
    tag: 'Full-stack infrastructure',
    icon: 'fa-server',
    desc: 'Beyond AI, we build and maintain the systems underneath it: web applications, analytics dashboards and the cloud infrastructure your automations run on.',
    features: [
      'Modern web applications built to last',
      'Cloud architecture and deployment',
      'REST and GraphQL API development',
      'Real-time analytics and telemetry dashboards',
      'Ongoing support and maintenance'
    ]
  }
};

function initServiceModals() {
  const modal = document.getElementById('service-modal');
  const ctaBtn = document.getElementById('svc-modal-cta');

  document.querySelectorAll('.service-link-btn').forEach(btn => {
    btn.addEventListener('click', () => openServiceModal(btn.dataset.service, btn));
  });

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal(modal);
    });
  }

  if (ctaBtn) {
    ctaBtn.addEventListener('click', () => {
      const title = document.getElementById('svc-modal-title').textContent;
      const opener = lastFocused;
      closeModal(modal);
      openWhatsAppDrawer(opener, title.toLowerCase());
    });
  }
}

function openServiceModal(serviceId, invoker) {
  const modal = document.getElementById('service-modal');
  const data = SERVICE_DATA[serviceId];
  if (!data || !modal) return;

  document.getElementById('svc-modal-title').textContent = data.title;
  document.getElementById('svc-modal-tag').textContent = data.tag;
  document.getElementById('svc-modal-desc').textContent = data.desc;
  document.getElementById('svc-modal-icon').innerHTML =
    `<i class="fa-solid ${data.icon}"></i>`;

  const list = document.getElementById('svc-modal-features');
  list.textContent = '';
  data.features.forEach(feature => {
    const li = document.createElement('li');
    li.innerHTML = '<i class="fa-solid fa-circle-check" aria-hidden="true"></i>';
    li.append(document.createTextNode(` ${feature}`));
    list.appendChild(li);
  });

  openModal(modal, invoker);
}

/* --------------------------------------------------------------------------
   8. WINDOW CHROME & SHORTCUTS
   -------------------------------------------------------------------------- */
function initModalChrome() {
  document.querySelectorAll('.modal-ctrl-close, .modal-ctrl-minimize').forEach(ctrl => {
    ctrl.addEventListener('click', (e) => {
      closeModal(e.target.closest('.modal-overlay'));
    });
  });

  document.querySelectorAll('.modal-ctrl-expand').forEach(ctrl => {
    ctrl.addEventListener('click', (e) => {
      const panel = e.target.closest('.modal-content');
      if (!panel) return;
      const full = panel.classList.toggle('fullscreen');
      ctrl.setAttribute('aria-label', full ? 'Exit full screen' : 'Toggle full screen');
    });
  });
}

function initKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      openWhatsAppDrawer(document.activeElement);
    }
    if (e.key === 'Escape') {
      openModals().forEach(closeModal);
    }
  });
}

function initFooterYear() {
  const el = document.getElementById('footer-year');
  if (el) el.textContent = String(new Date().getFullYear());
}

/* --------------------------------------------------------------------------
   9. TOAST
   -------------------------------------------------------------------------- */
let toastTimeout = null;

function showToast(msg) {
  const toast = document.getElementById('mac-toast');
  const toastMsg = document.getElementById('mac-toast-msg');
  if (!toast || !toastMsg) return;

  toastMsg.textContent = msg;
  toast.classList.add('active');

  if (toastTimeout) clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toast.classList.remove('active'), 3000);
}
