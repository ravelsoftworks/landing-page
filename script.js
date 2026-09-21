/* ==========================================================================
   RAVEL SOFTWORKS — INTERACTIVE SCRIPT ENGINE
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initThemeEngine();
  initNavbarScroll();
  initHeroSimulator();
  initRoiCalculator();
  initWhatsAppModal();
  initServiceModals();
  initMobileMenu();
  initKeyboardShortcuts();
  initMacControls();
});

/* --------------------------------------------------------------------------
   1. DUAL THEME SWITCHING ENGINE
   -------------------------------------------------------------------------- */
function initThemeEngine() {
  const themeToggleBtn = document.getElementById('theme-toggle');
  const htmlTag = document.documentElement;

  const savedTheme = localStorage.getItem('ravel_theme') || 'dark';
  htmlTag.setAttribute('data-theme', savedTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const currentTheme = htmlTag.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      
      htmlTag.setAttribute('data-theme', newTheme);
      localStorage.setItem('ravel_theme', newTheme);
      showMacToast(`Switched to ${newTheme === 'dark' ? 'Dark Mode' : 'Light Mode'}`);
    });
  }
}

/* --------------------------------------------------------------------------
   2. NAVBAR SCROLL EFFECT & NAVIGATION
   -------------------------------------------------------------------------- */
function initNavbarScroll() {
  const navLinks = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    let current = '';
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 130;
      if (window.scrollY >= sectionTop) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  });
}

function initMobileMenu() {
  const menuBtn = document.getElementById('mobile-menu-btn');
  const navLinks = document.getElementById('nav-links');

  if (menuBtn && navLinks) {
    menuBtn.addEventListener('click', () => {
      navLinks.classList.toggle('mobile-open');
    });

    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('mobile-open');
      });
    });
  }
}

/* --------------------------------------------------------------------------
   3. HERO INTERACTIVE WORKFLOW SIMULATOR
   -------------------------------------------------------------------------- */
const WORKFLOW_PRESETS = {
  onboarding: {
    trigger: "New Client Intake Form Submitted",
    agent: "Extracting PDF Data, Verifying CRM & Drafting Contract",
    thinking: ["Parsing client attachments...", "Checking Salesforce duplicates...", "Generating NDA draft...", "Autonomous routing done!"],
    outcome: "CRM Updated & Welcome Package Sent via WhatsApp",
    before: "3 Days",
    after: "3 Hours",
    speedup: "24x Faster"
  },
  leads: {
    trigger: "Inbound Lead Captured from Web & Email",
    agent: "Enriching Company Data & Autonomous Intent Scoring",
    thinking: ["Querying LinkedIn data API...", "Evaluating ICP criteria score...", "Drafting personalized email response..."],
    outcome: "High-intent Lead Booked on Sales Rep Calendar",
    before: "48 Hours",
    after: "15 Minutes",
    speedup: "192x Faster"
  },
  reports: {
    trigger: "Weekly Operations Analytics Schedule Triggered",
    agent: "Aggregating SQL Data & Sentiment Analysis",
    thinking: ["Connecting to DB cluster...", "Analyzing multi-channel metrics...", "Formatting PDF report deck..."],
    outcome: "Executive Summary Delivered to Slack & C-Suite Inbox",
    before: "1 Day",
    after: "5 Minutes",
    speedup: "288x Faster"
  },
  invoices: {
    trigger: "Vendor Invoice PDF Received in Inbox",
    agent: "OCR Extraction, PO Matching & Anomaly Verification",
    thinking: ["Running OCR scan...", "Matching line items to PO #8491...", "Validating tax calculations..."],
    outcome: "ERP Updated & Invoice Auto-Routed for Payment",
    before: "5 Days",
    after: "1 Hour",
    speedup: "120x Faster"
  }
};

let thinkingInterval = null;

function initHeroSimulator() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const presetKey = btn.getAttribute('data-preset');
      if (WORKFLOW_PRESETS[presetKey]) {
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        runWorkflowSimulation(WORKFLOW_PRESETS[presetKey]);
        showMacToast(`Simulating: ${btn.textContent.trim()} Workflow`);
      }
    });
  });

  runWorkflowSimulation(WORKFLOW_PRESETS.onboarding);
}

function runWorkflowSimulation(data) {
  const triggerTitle = document.getElementById('trigger-title');
  const agentTitle = document.getElementById('agent-title');
  const thinkingText = document.getElementById('agent-thinking-text');
  const outcomeTitle = document.getElementById('outcome-title');
  const timeBefore = document.getElementById('sim-time-before');
  const timeAfter = document.getElementById('sim-time-after');
  const speedupBadge = document.getElementById('sim-speedup-badge');

  if (triggerTitle) triggerTitle.textContent = data.trigger;
  if (agentTitle) agentTitle.textContent = data.agent;
  if (outcomeTitle) outcomeTitle.textContent = data.outcome;
  if (timeBefore) timeBefore.textContent = data.before;
  if (timeAfter) timeAfter.textContent = data.after;
  if (speedupBadge) speedupBadge.textContent = data.speedup;

  if (thinkingInterval) clearInterval(thinkingInterval);
  let stepIdx = 0;
  if (thinkingText && data.thinking.length > 0) {
    thinkingText.textContent = data.thinking[0];
    thinkingInterval = setInterval(() => {
      stepIdx = (stepIdx + 1) % data.thinking.length;
      thinkingText.textContent = data.thinking[stepIdx];
    }, 1800);
  }
}

/* --------------------------------------------------------------------------
   4. DYNAMIC ROI CALCULATOR
   -------------------------------------------------------------------------- */
function initRoiCalculator() {
  const teamSlider = document.getElementById('team-size-slider');
  const hoursSlider = document.getElementById('hours-slider');
  const teamVal = document.getElementById('team-size-val');
  const hoursVal = document.getElementById('hours-val');
  
  const resHoursSaved = document.getElementById('res-hours-saved');
  const resCostSaved = document.getElementById('res-cost-saved');
  const resSpeedup = document.getElementById('res-speedup');
  const calcCtaBtn = document.getElementById('calc-cta-btn');

  function calculateROI() {
    if (!teamSlider || !hoursSlider) return;

    const teamSize = parseInt(teamSlider.value, 10);
    const hoursPerWeek = parseInt(hoursSlider.value, 10);

    if (teamVal) teamVal.textContent = `${teamSize} people`;
    if (hoursVal) hoursVal.textContent = `${hoursPerWeek} hrs/week`;

    const totalWeeklyHours = teamSize * hoursPerWeek;
    const hoursSavedMonth = Math.round(totalWeeklyHours * 4.3 * 0.75);
    const annualCostSaved = Math.round(hoursSavedMonth * 12 * 15);

    if (resHoursSaved) resHoursSaved.textContent = `${hoursSavedMonth.toLocaleString()} hrs`;
    if (resCostSaved) resCostSaved.textContent = `$${annualCostSaved.toLocaleString()}`;
    
    let speedupText = "10x - 20x";
    if (teamSize > 30) speedupText = "20x - 45x";
    if (teamSize > 70) speedupText = "50x+";
    if (resSpeedup) resSpeedup.textContent = speedupText;
  }

  if (teamSlider && hoursSlider) {
    teamSlider.addEventListener('input', calculateROI);
    hoursSlider.addEventListener('input', calculateROI);
    calculateROI();
  }

  if (calcCtaBtn) {
    calcCtaBtn.addEventListener('click', () => {
      openWhatsAppDrawer("Agentic ROI Automation Inquiry");
    });
  }
}

/* --------------------------------------------------------------------------
   5. WHATSAPP DRAWER & MODAL INTEGRATION
   -------------------------------------------------------------------------- */
let selectedGoal = "Agentic AI Workflows";

function initWhatsAppModal() {
  const modal = document.getElementById('wa-modal');
  const openBtns = [
    document.getElementById('open-whatsapp-drawer'),
    document.getElementById('hero-wa-btn'),
    document.getElementById('final-wa-btn'),
    document.getElementById('footer-wa-btn')
  ];
  const optBtns = document.querySelectorAll('.wa-opt-btn');
  const sendDirectBtn = document.getElementById('send-wa-direct');
  const customMsgInput = document.getElementById('wa-custom-msg');

  openBtns.forEach(btn => {
    if (btn) {
      btn.addEventListener('click', () => openWhatsAppDrawer());
    }
  });

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal(modal);
    });
  }

  optBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      optBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedGoal = btn.getAttribute('data-goal');
      updateWhatsAppLink();
    });
  });

  if (customMsgInput) {
    customMsgInput.addEventListener('input', updateWhatsAppLink);
  }

  function updateWhatsAppLink() {
    if (!sendDirectBtn) return;
    const note = customMsgInput ? customMsgInput.value.trim() : '';
    let text = `Hi Ravel Softworks team! I'm interested in ${selectedGoal} for my company.`;
    if (note) {
      text += ` Note: ${note}`;
    }
    sendDirectBtn.href = `https://wa.me/?text=${encodeURIComponent(text)}`;
  }

  updateWhatsAppLink();
}

function openWhatsAppDrawer(presetGoal) {
  const modal = document.getElementById('wa-modal');
  if (presetGoal) {
    selectedGoal = presetGoal;
  }
  if (modal) {
    modal.classList.add('active');
    showMacToast("WhatsApp Chat Launcher Active");
  }
}

function closeModal(modalElement) {
  if (modalElement) {
    modalElement.classList.remove('active');
    const content = modalElement.querySelector('.modal-content');
    if (content) content.classList.remove('fullscreen');
  }
}

/* --------------------------------------------------------------------------
   6. SERVICE DETAIL MODALS
   -------------------------------------------------------------------------- */
const SERVICE_DATA = {
  1: {
    title: "Agentic AI Workflows",
    tag: "Autonomous Systems",
    icon: "fa-diagram-project",
    desc: "Custom AI agents that handle multi-step business processes, from data extraction and validation to autonomous decision-making, without manual hand-holding.",
    features: [
      "Multi-agent orchestration & task delegation",
      "LLM fine-tuning & prompt architecture",
      "Self-correcting error handling & fallback loops",
      "Real-time database and enterprise tool execution",
      "Human-in-the-loop review triggers"
    ]
  },
  2: {
    title: "Process Automation",
    tag: "High Throughput",
    icon: "fa-gears",
    desc: "We identify repetitive, time-draining tasks across your operations and automate them with intelligent, self-correcting systems built for enterprise reliability.",
    features: [
      "End-to-end operational workflow audit",
      "Custom web-scraping & data ingestion bots",
      "API integration across CRM, ERP, and Slack",
      "Automated document generation & email triggers",
      "24/7 uptime monitoring & auto-recovery"
    ]
  },
  3: {
    title: "AI Integration & Optimization",
    tag: "ROI Maximizer",
    icon: "fa-network-wired",
    desc: "Already using AI tools? We fine-tune, connect, and optimize your existing stack so they actually deliver measurable ROI instead of sitting half-used.",
    features: [
      "RAG (Retrieval-Augmented Generation) setups",
      "Private vector database deployment (Pinecone / Qdrant)",
      "Cost reduction per API call optimization",
      "Custom UI dashboards for AI metrics",
      "Security & compliance data masking"
    ]
  },
  4: {
    title: "Custom IT Solutions",
    tag: "Full-Stack Infra",
    icon: "fa-server",
    desc: "Beyond AI, we build, scale, and maintain the robust underlying systems, web applications, analytics dashboards, and cloud infrastructure your automations run on.",
    features: [
      "High-performance modern web apps (React / Next / Node)",
      "Cloud architecture & deployment (AWS / GCP / Vercel)",
      "RESTful & GraphQL API development",
      "Real-time analytics & telemetry dashboards",
      "Dedicated ongoing support & maintenance"
    ]
  }
};

function initServiceModals() {
  const modal = document.getElementById('service-modal');
  const ctaBtn = document.getElementById('svc-modal-cta');

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal(modal);
    });
  }

  if (ctaBtn) {
    ctaBtn.addEventListener('click', () => {
      closeModal(modal);
      const title = document.getElementById('svc-modal-title').textContent;
      openWhatsAppDrawer(`Service Inquiry: ${title}`);
    });
  }
}

window.openServiceModal = function(serviceId) {
  const modal = document.getElementById('service-modal');
  const data = SERVICE_DATA[serviceId];
  if (!data || !modal) return;

  document.getElementById('svc-modal-title').textContent = data.title;
  document.getElementById('svc-modal-tag').textContent = data.tag;
  document.getElementById('svc-modal-desc').textContent = data.desc;
  
  const iconContainer = document.getElementById('svc-modal-icon');
  if (iconContainer) {
    iconContainer.innerHTML = `<i class="fa-solid ${data.icon}"></i>`;
  }

  const featuresList = document.getElementById('svc-modal-features');
  if (featuresList) {
    featuresList.innerHTML = data.features.map(f => `
      <li><i class="fa-solid fa-circle-check"></i> ${f}</li>
    `).join('');
  }

  modal.classList.add('active');
  showMacToast(`Capability: ${data.title}`);
};

/* --------------------------------------------------------------------------
   7. TRAFFIC LIGHT WINDOW CONTROLS (🔴 CLOSE, 🟡 MINIMIZE, 🟢 FULLSCREEN)
   -------------------------------------------------------------------------- */
function initKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      openWhatsAppDrawer();
    }
    if (e.key === 'Escape') {
      closeModal(document.getElementById('wa-modal'));
      closeModal(document.getElementById('service-modal'));
    }
  });
}

function initMacControls() {
  // Red Close Controls
  document.querySelectorAll('.modal-ctrl-close').forEach(ctrl => {
    ctrl.addEventListener('click', (e) => {
      const modal = e.target.closest('.modal-overlay');
      if (modal) closeModal(modal);
    });
  });

  // Yellow Minimize Controls
  document.querySelectorAll('.modal-ctrl-minimize').forEach(ctrl => {
    ctrl.addEventListener('click', (e) => {
      const modal = e.target.closest('.modal-overlay');
      if (modal) {
        closeModal(modal);
        showMacToast("Window Minimized");
      }
    });
  });

  // Green Expand/Fullscreen Controls
  document.querySelectorAll('.modal-ctrl-expand').forEach(ctrl => {
    ctrl.addEventListener('click', (e) => {
      const modalContent = e.target.closest('.modal-content');
      if (modalContent) {
        const isFullscreen = modalContent.classList.toggle('fullscreen');
        showMacToast(isFullscreen ? "Expanded to Full Screen" : "Restored Normal Screen");
      }
    });
  });
}

/* --------------------------------------------------------------------------
   8. NOTIFICATION TOAST UTILITY
   -------------------------------------------------------------------------- */
let toastTimeout = null;

function showMacToast(msg) {
  const toast = document.getElementById('mac-toast');
  const toastMsg = document.getElementById('mac-toast-msg');

  if (toast && toastMsg) {
    toastMsg.textContent = msg;
    toast.classList.add('active');

    if (toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      toast.classList.remove('active');
    }, 3200);
  }
}
