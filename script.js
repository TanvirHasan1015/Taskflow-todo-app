/**
 * ============================================================
 * TASKFLOW PRO — script.js
 * Ultimate Productivity Suite — Complete JavaScript
 *
 * TABLE OF CONTENTS
 *  1.  State & Constants
 *  2.  DOM References
 *  3.  Motivational Quotes
 *  4.  LocalStorage Helpers
 *  5.  Theme System (6 Themes)
 *  6.  Custom Background Upload
 *  7.  Sound Effects (Web Audio API)
 *  8.  Browser Notifications
 *  9.  Confetti Animation (Canvas)
 * 10.  Level / XP System
 * 11.  Daily Rewards
 * 12.  View Navigation
 * 13.  Task Helpers (ID, Date, Format)
 * 14.  Task Filter & Sort
 * 15.  Task Render
 * 16.  Task Operations (add / toggle / delete / edit / archive)
 * 17.  Recurring Tasks
 * 18.  Export (PDF / CSV) & Import
 * 19.  Pomodoro Timer
 * 20.  Calendar View
 * 21.  Habit Tracker
 * 22.  Goals (Daily / Weekly / Monthly)
 * 23.  Goal Tracking (Progress Bars)
 * 24.  Vision Board
 * 25.  Class Schedule
 * 26.  Settings (Sound Toggle, Notification Toggle)
 * 27.  Real-Time Updates (setInterval)
 * 28.  Event Listeners
 * 29.  Initialisation
 * ============================================================
 */


/* ============================================================
   1. STATE & CONSTANTS
   ============================================================ */

/** Main tasks array — each task object shape:
 *  { id, text, completed, archived, createdAt, dueDate,
 *    priority, category, repeat }
 */
let tasks = [];

// UI filter state
let currentFilter   = 'all';    // 'all' | 'active' | 'completed' | 'archived'
let currentCategory = 'all';    // 'all' | 'general' | 'study' | ...
let currentSort     = 'newest'; // 'newest' | 'oldest' | 'priority' | 'duedate'
let searchQuery     = '';
let editingTaskId   = null;

// Drag & drop
let dragSrcEl = null;

// Pomodoro state
let pomoMode        = 'study';  // 'study' | 'break' | 'longbreak'
let pomoSecondsLeft = 25 * 60;
let pomoTotalSecs   = 25 * 60;
let pomoRunning     = false;
let pomoInterval    = null;
let pomoSessionsToday = 0;

// Calendar state
let calYear  = new Date().getFullYear();
let calMonth = new Date().getMonth();   // 0-indexed

// XP / Level
let totalXP = 0;
const XP_LEVELS = [
  { level: 1, min: 0,   max: 9,   label: 'Level 1 — Beginner',      icon: '🌱' },
  { level: 2, min: 10,  max: 24,  label: 'Level 2 — Apprentice',    icon: '⚡' },
  { level: 3, min: 25,  max: 49,  label: 'Level 3 — Achiever',      icon: '🔥' },
  { level: 4, min: 50,  max: 99,  label: 'Level 4 — Champion',      icon: '💎' },
  { level: 5, min: 100, max: 199, label: 'Level 5 — Master',        icon: '🏆' },
  { level: 6, min: 200, max: 499, label: 'Level 6 — Legend',        icon: '👑' },
  { level: 7, min: 500, max: Infinity, label: 'Level 7 — Grandmaster', icon: '🌟' },
];

// Daily reward milestones (completions today)
const REWARD_MILESTONES  = [3, 5, 10];
let rewardsMilestonesFired = {};

// Habit data
let habits = [];

// Goals data
let goals = { daily: [], weekly: [], monthly: [] };

// Goal tracking
let trackedGoals = [];

// Vision board
let visionCards = [];

// Class schedule
let classes = [];

// Sound enabled flag
let soundEnabled = true;

// Notification enabled flag
let notifEnabled = false;

// Priority helpers
const PRIORITY_WEIGHT  = { high: 0, medium: 1, low: 2 };
const PRIORITY_LABELS  = { high: '🔴 High', medium: '🟡 Medium', low: '🟢 Low' };
const CATEGORY_LABELS  = { general:'📌 General', study:'📚 Study', work:'💼 Work', personal:'🧘 Personal', shopping:'🛒 Shopping', travel:'✈️ Travel' };
const REPEAT_LABELS    = { daily:'🔁 Daily', weekly:'🔁 Weekly', monthly:'🔁 Monthly', yearly:'🔁 Yearly' };
const DAYS_SHORT       = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const MONTHS_LONG      = ['January','February','March','April','May','June','July','August','September','October','November','December'];

// LocalStorage keys
const KEY_TASKS    = 'tfp_tasks';
const KEY_HABITS   = 'tfp_habits';
const KEY_GOALS    = 'tfp_goals';
const KEY_TRACKED  = 'tfp_tracked_goals';
const KEY_VISION   = 'tfp_vision';
const KEY_CLASSES  = 'tfp_classes';
const KEY_XP       = 'tfp_xp';
const KEY_POMO     = 'tfp_pomo_sessions';
const KEY_THEME    = 'tfp_theme';
const KEY_SOUND    = 'tfp_sound';
const KEY_NOTIF    = 'tfp_notif';
const KEY_BG       = 'tfp_bg';
const KEY_REWARDS  = 'tfp_rewards';
const KEY_REWARD_DATE = 'tfp_reward_date';

const MAX_CHARS = 120;
const CHAR_WARN = 20;


/* ============================================================
   2. DOM REFERENCES
   ============================================================ */
// Tasks view
const taskForm           = document.getElementById('task-form');
const taskInput          = document.getElementById('task-input');
const addBtn             = document.getElementById('add-btn');
const dueDateInput       = document.getElementById('due-date-input');
const prioritySelect     = document.getElementById('priority-select');
const categorySelect     = document.getElementById('category-select');
const repeatSelect       = document.getElementById('repeat-select');
const taskList           = document.getElementById('task-list');
const emptyState         = document.getElementById('empty-state');
const charCountEl        = document.getElementById('char-count');
const charCounterEl      = document.getElementById('char-counter');
const progressBar        = document.getElementById('progress-bar');
const progressPct        = document.getElementById('progress-pct');
const counterTotal       = document.getElementById('counter-total');
const counterDone        = document.getElementById('counter-done');
const counterRemain      = document.getElementById('counter-remain');
const clearCompletedBtn  = document.getElementById('clear-completed-btn');
const archiveCompletedBtn= document.getElementById('archive-completed-btn');
const filterTabs         = document.querySelectorAll('.filter-tab');
const catChips           = document.querySelectorAll('.cat-chip');
const searchInput        = document.getElementById('search-input');
const sortSelect         = document.getElementById('sort-select');
const quoteText          = document.getElementById('quote-text');
const exportPdfBtn       = document.getElementById('export-pdf-btn');
const exportCsvBtn       = document.getElementById('export-csv-btn');
const importFileInput    = document.getElementById('import-file-input');

// Edit modal
const editModal      = document.getElementById('edit-modal');
const editTaskInput  = document.getElementById('edit-task-input');
const editDueDate    = document.getElementById('edit-due-date');
const editPriority   = document.getElementById('edit-priority');
const editCategory   = document.getElementById('edit-category');
const editRepeat     = document.getElementById('edit-repeat');
const editSaveBtn    = document.getElementById('edit-save-btn');
const editCancelBtn  = document.getElementById('edit-cancel-btn');

// Level-up modal
const levelupModal    = document.getElementById('levelup-modal');
const levelupMsg      = document.getElementById('levelup-msg');
const levelupIcon     = document.getElementById('levelup-icon');
const levelupCloseBtn = document.getElementById('levelup-close-btn');

// Reward modal
const rewardModal    = document.getElementById('reward-modal');
const rewardIcon     = document.getElementById('reward-icon');
const rewardMsg      = document.getElementById('reward-msg');
const rewardCloseBtn = document.getElementById('reward-close-btn');

// Pomodoro
const pomoStudyTab   = document.getElementById('pomo-study-tab');
const pomoBreakTab   = document.getElementById('pomo-break-tab');
const pomoLongTab    = document.getElementById('pomo-longbreak-tab');
const pomoTimeEl     = document.getElementById('pomo-time');
const pomoStatusEl   = document.getElementById('pomo-status');
const pomoStartBtn   = document.getElementById('pomo-start-btn');
const pomoPauseBtn   = document.getElementById('pomo-pause-btn');
const pomoResetBtn   = document.getElementById('pomo-reset-btn');
const pomoDotsEl     = document.getElementById('pomo-dots');
const pomoCountEl    = document.getElementById('pomo-sessions-count');
const pomoRingEl     = document.getElementById('pomo-ring-progress');

// Calendar
const calPrevBtn    = document.getElementById('cal-prev-btn');
const calNextBtn    = document.getElementById('cal-next-btn');
const calMonthTitle = document.getElementById('cal-month-title');
const calendarGrid  = document.getElementById('calendar-grid');
const calTasksTitle = document.getElementById('cal-tasks-title');
const calTaskList   = document.getElementById('cal-task-list');

// Habits
const habitInput      = document.getElementById('habit-input');
const habitEmojiSel   = document.getElementById('habit-emoji-select');
const addHabitBtn     = document.getElementById('add-habit-btn');
const habitListEl     = document.getElementById('habit-list');

// Goals
const goalTabs        = document.querySelectorAll('.goal-tab');
const goalPanels      = document.querySelectorAll('.goal-panel');
const dailyGoalInput  = document.getElementById('daily-goal-input');
const weeklyGoalInput = document.getElementById('weekly-goal-input');
const monthlyGoalInput= document.getElementById('monthly-goal-input');
const addDailyBtn     = document.getElementById('add-daily-goal-btn');
const addWeeklyBtn    = document.getElementById('add-weekly-goal-btn');
const addMonthlyBtn   = document.getElementById('add-monthly-goal-btn');
const dailyGoalList   = document.getElementById('daily-goal-list');
const weeklyGoalList  = document.getElementById('weekly-goal-list');
const monthlyGoalList = document.getElementById('monthly-goal-list');
const dailyDateLabel  = document.getElementById('daily-date-label');
const weeklyDateLabel = document.getElementById('weekly-date-label');
const monthlyDateLabel= document.getElementById('monthly-date-label');

// Goal tracking
const trackingGoalInput = document.getElementById('tracking-goal-input');
const trackingProgressInput = document.getElementById('tracking-progress-input');
const trackingIconInput = document.getElementById('tracking-icon-input');
const addTrackingGoalBtn = document.getElementById('add-tracking-goal-btn');
const trackingGoalList   = document.getElementById('tracking-goal-list');

// Vision board
const visionTitleInput = document.getElementById('vision-title-input');
const visionEmojiInput = document.getElementById('vision-emoji-input');
const visionCatInput   = document.getElementById('vision-cat-input');
const visionDescInput  = document.getElementById('vision-desc-input');
const addVisionBtn     = document.getElementById('add-vision-btn');
const visionBoardEl    = document.getElementById('vision-board');

// Class schedule
const classNameInput  = document.getElementById('class-name-input');
const classDaySelect  = document.getElementById('class-day-select');
const classStartInput = document.getElementById('class-start-input');
const classEndInput   = document.getElementById('class-end-input');
const classRoomInput  = document.getElementById('class-room-input');
const classColorInput = document.getElementById('class-color-input');
const addClassBtn     = document.getElementById('add-class-btn');
const scheduleGrid    = document.getElementById('schedule-grid');

// Settings
const themeToggle     = document.getElementById('theme-toggle');
const themeIcon       = document.getElementById('theme-icon');
const themeLabel      = document.getElementById('theme-label');
const themeCards      = document.querySelectorAll('.theme-card');
const bgUploadInput   = document.getElementById('bg-upload-input');
const bgClearBtn      = document.getElementById('bg-clear-btn');
const bgStatusText    = document.getElementById('bg-status-text');
const soundToggle     = document.getElementById('sound-toggle');
const notifToggle     = document.getElementById('notif-toggle');
const requestNotifBtn = document.getElementById('request-notif-btn');
const notifStatus     = document.getElementById('notif-status');
const resetAllBtn     = document.getElementById('reset-all-btn');
const testAddSound    = document.getElementById('test-add-sound');
const testCompleteSound = document.getElementById('test-complete-sound');
const testDeleteSound  = document.getElementById('test-delete-sound');

// Sidebar / mobile
const navBtns        = document.querySelectorAll('.nav-btn');
const sidebar        = document.getElementById('sidebar');
const mobileMenuBtn  = document.getElementById('mobile-menu-btn');
const levelBadge     = document.getElementById('level-badge');
const levelText      = document.getElementById('level-text');
const xpBar          = document.getElementById('xp-bar');
const xpTextEl       = document.getElementById('xp-text');
const mobileLevelBadge = document.getElementById('mobile-level-badge');


/* ============================================================
   3. MOTIVATIONAL QUOTES
   ============================================================ */
const QUOTES = [
  "The secret of getting ahead is getting started. — Mark Twain",
  "It always seems impossible until it's done. — Nelson Mandela",
  "Don't watch the clock; do what it does. Keep going. — Sam Levenson",
  "The only way to do great work is to love what you do. — Steve Jobs",
  "Success is not final, failure is not fatal: it is the courage to continue. — Churchill",
  "Believe you can and you're halfway there. — Theodore Roosevelt",
  "You don't have to be great to start, but you have to start to be great. — Zig Ziglar",
  "Action is the foundational key to all success. — Pablo Picasso",
  "Well done is better than well said. — Benjamin Franklin",
  "The future depends on what you do today. — Mahatma Gandhi",
  "Push yourself, because no one else is going to do it for you.",
  "Great things never come from comfort zones.",
  "Dream it. Wish it. Do it.",
  "Small steps every day lead to big results.",
  "Discipline is the bridge between goals and accomplishment. — Jim Rohn",
  "Focus on progress, not perfection.",
  "Your only limit is your mind.",
  "Start where you are. Use what you have. Do what you can. — Arthur Ashe",
];

function showRandomQuote() {
  if (quoteText) {
    quoteText.textContent = QUOTES[Math.floor(Math.random() * QUOTES.length)];
  }
}


/* ============================================================
   4. LOCALSTORAGE HELPERS
   ============================================================ */
function save(key, data) {
  try { localStorage.setItem(key, JSON.stringify(data)); } catch(e) {}
}

function load(key, fallback = []) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch(e) { return fallback; }
}


/* ============================================================
   5. THEME SYSTEM (6 Themes)
   ============================================================ */
const DARK_LIGHT_ACCENT = {
  dark:      { icon: '🌙', label: 'Dark' },
  light:     { icon: '☀️', label: 'Light' },
  blue:      { icon: '🔵', label: 'Blue' },
  green:     { icon: '🟢', label: 'Green' },
  purple:    { icon: '💜', label: 'Purple' },
  cyberpunk: { icon: '⚡', label: 'Cyberpunk' },
};

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);

  // Update dark/light toggle button
  const info = DARK_LIGHT_ACCENT[theme] || DARK_LIGHT_ACCENT.dark;
  if (themeIcon)  themeIcon.textContent  = info.icon;
  if (themeLabel) themeLabel.textContent = info.label;

  // Highlight active theme card in settings
  themeCards.forEach(card => {
    const isActive = card.dataset.theme === theme;
    card.classList.toggle('theme-card--active', isActive);
    card.setAttribute('aria-pressed', String(isActive));
  });

  save(KEY_THEME, theme);
}

function toggleDarkLight() {
  const cur = document.documentElement.getAttribute('data-theme') || 'dark';
  applyTheme(cur === 'dark' ? 'light' : 'dark');
}

function loadTheme() {
  const saved = load(KEY_THEME, 'dark');
  applyTheme(typeof saved === 'string' ? saved : 'dark');
}


/* ============================================================
   6. CUSTOM BACKGROUND UPLOAD
   ============================================================ */
function applyBackground(dataUrl) {
  const overlay = document.getElementById('bg-overlay');
  if (!overlay) return;
  if (dataUrl) {
    overlay.style.backgroundImage = `url('${dataUrl}')`;
    overlay.style.opacity = '0.25';
    if (bgStatusText) bgStatusText.textContent = '✅ Custom background applied';
  } else {
    overlay.style.backgroundImage = '';
    overlay.style.opacity = '0';
    if (bgStatusText) bgStatusText.textContent = 'No custom background set';
  }
}

function loadBackground() {
  const saved = localStorage.getItem(KEY_BG);
  if (saved) applyBackground(saved);
}


/* ============================================================
   7. SOUND EFFECTS (Web Audio API)
   ============================================================ */
function playSound(type) {
  if (!soundEnabled) return;
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    const makeNote = (freq, startTime, duration, vol = 0.08, wave = 'sine') => {
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = wave;
      osc.frequency.setValueAtTime(freq, startTime);
      gain.gain.setValueAtTime(vol, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
      osc.start(startTime);
      osc.stop(startTime + duration);
    };

    const t = ctx.currentTime;
    switch (type) {
      case 'add':
        // Ascending two-tone
        makeNote(440, t,       0.12, 0.08);
        makeNote(660, t + 0.1, 0.18, 0.08);
        break;

      case 'complete':
        // Pleasant major chord arpeggio
        [523, 659, 784, 1047].forEach((f, i) => makeNote(f, t + i * 0.07, 0.4, 0.07));
        break;

      case 'delete':
        // Descending tone
        makeNote(440, t,       0.1, 0.08);
        makeNote(280, t + 0.1, 0.2, 0.06);
        break;

      case 'pomodoro':
        // 3-beep alarm
        [880, 880, 880].forEach((f, i) => makeNote(f, t + i * 0.35, 0.28, 0.12, 'square'));
        break;

      case 'levelup':
        // Triumphant arpeggio
        [523, 659, 784, 1047, 1319].forEach((f, i) => makeNote(f, t + i * 0.08, 0.3, 0.09));
        break;

      case 'reward':
        [784, 1047, 784, 1047].forEach((f, i) => makeNote(f, t + i * 0.12, 0.22, 0.08));
        break;

      default:
        makeNote(440, t, 0.15, 0.08);
    }
  } catch(e) {
    console.warn('Sound error:', e);
  }
}


/* ============================================================
   8. BROWSER NOTIFICATIONS
   ============================================================ */
function updateNotifStatus() {
  if (!('Notification' in window)) {
    if (notifStatus) notifStatus.textContent = 'Status: Not supported in this browser';
    return;
  }
  const perm = Notification.permission;
  if (notifStatus) {
    notifStatus.textContent = `Status: ${perm === 'granted' ? '✅ Enabled' : perm === 'denied' ? '❌ Blocked (reset in browser settings)' : '⚠️ Not enabled'}`;
  }
  notifEnabled = perm === 'granted';
  if (notifToggle) notifToggle.checked = notifEnabled;
}

async function requestNotifPermission() {
  if (!('Notification' in window)) return;
  const perm = await Notification.requestPermission();
  notifEnabled = perm === 'granted';
  updateNotifStatus();
}

function sendNotification(title, body, icon = '📋') {
  if (!notifEnabled || Notification.permission !== 'granted') return;
  try {
    new Notification(title, { body, icon: '✦' });
  } catch(e) {}
}

/** Check for tasks due today and send notification */
function checkDueTodayNotifications() {
  if (!notifEnabled) return;
  const todayStr = getTodayStr();
  const due = tasks.filter(t => !t.completed && !t.archived && t.dueDate === todayStr);
  if (due.length > 0) {
    const titles = due.slice(0, 3).map(t => `• ${t.text}`).join('\n');
    sendNotification(`📅 ${due.length} task${due.length > 1 ? 's' : ''} due today!`, titles);
  }
}


/* ============================================================
   9. CONFETTI ANIMATION (Canvas)
   ============================================================ */
function launchConfetti() {
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999';
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
  document.body.appendChild(canvas);

  const ctx    = canvas.getContext('2d');
  const colors = ['#7c6ef6','#a78bfa','#34d399','#fbbf24','#f87171','#60a5fa','#f472b6','#fb923c'];
  const shapes = ['rect','circle'];

  // Create 150 particles
  const particles = Array.from({ length: 150 }, () => ({
    x:      Math.random() * canvas.width,
    y:      -Math.random() * canvas.height * 0.3 - 10,
    w:      Math.random() * 11 + 5,
    h:      Math.random() * 7 + 3,
    color:  colors[Math.floor(Math.random() * colors.length)],
    shape:  shapes[Math.floor(Math.random() * shapes.length)],
    vx:     (Math.random() - 0.5) * 5,
    vy:     Math.random() * 4 + 2,
    angle:  Math.random() * Math.PI * 2,
    spin:   (Math.random() - 0.5) * 0.25,
    opacity: 1,
  }));

  let frameId;
  const animate = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let anyAlive = false;

    particles.forEach(p => {
      p.x      += p.vx;
      p.y      += p.vy;
      p.vy     += 0.09;          // gravity
      p.angle  += p.spin;
      p.opacity -= 0.007;
      if (p.opacity <= 0) return;
      anyAlive = true;

      ctx.save();
      ctx.globalAlpha = Math.max(0, p.opacity);
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle);
      ctx.fillStyle = p.color;
      if (p.shape === 'circle') {
        ctx.beginPath();
        ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      }
      ctx.restore();
    });

    if (anyAlive) {
      frameId = requestAnimationFrame(animate);
    } else {
      canvas.remove();
    }
  };

  animate();
  setTimeout(() => { cancelAnimationFrame(frameId); canvas.remove(); }, 5000);
}


/* ============================================================
   10. LEVEL / XP SYSTEM
   ============================================================ */
function getCurrentLevel(xp) {
  for (let i = XP_LEVELS.length - 1; i >= 0; i--) {
    if (xp >= XP_LEVELS[i].min) return XP_LEVELS[i];
  }
  return XP_LEVELS[0];
}

function addXP(amount) {
  const prevLevel = getCurrentLevel(totalXP);
  totalXP += amount;
  save(KEY_XP, totalXP);
  const newLevel = getCurrentLevel(totalXP);
  updateLevelUI();

  if (newLevel.level > prevLevel.level) {
    // Level up!
    playSound('levelup');
    launchConfetti();
    levelupIcon.textContent = newLevel.icon;
    levelupMsg.textContent  = `You reached ${newLevel.label}!`;
    openModal(levelupModal);
  }
}

function updateLevelUI() {
  const lvl  = getCurrentLevel(totalXP);
  const next = XP_LEVELS.find(l => l.level === lvl.level + 1);

  const text  = `${lvl.icon} Level ${lvl.level}`;
  const badge = `Lv.${lvl.level}`;

  if (levelBadge)      levelBadge.textContent = badge;
  if (levelText)       levelText.textContent  = text;
  if (mobileLevelBadge) mobileLevelBadge.textContent = badge;

  if (xpBar && xpTextEl) {
    if (next) {
      const range = next.min - lvl.min;
      const progress = totalXP - lvl.min;
      const pct = Math.min(100, Math.round((progress / range) * 100));
      xpBar.style.width = `${pct}%`;
      xpTextEl.textContent = `${totalXP} / ${next.min} XP`;
    } else {
      xpBar.style.width = '100%';
      xpTextEl.textContent = `${totalXP} XP — MAX LEVEL!`;
    }
  }
}


/* ============================================================
   11. DAILY REWARDS
   ============================================================ */
const REWARD_MESSAGES = [
  { icon: '🌟', msg: 'You\'re on a roll! Keep it up!' },
  { icon: '🏆', msg: 'Champion! You\'re crushing your goals!' },
  { icon: '🚀', msg: 'Blast off! Productivity level: MAXIMUM!' },
  { icon: '🎖️', msg: 'Elite performer! Outstanding work!' },
  { icon: '🦁', msg: 'Unstoppable! You\'re a productivity lion!' },
  { icon: '💎', msg: 'Diamond focus! You\'re achieving greatness!' },
];

function checkDailyReward() {
  const today = getTodayStr();
  const savedDate = localStorage.getItem(KEY_REWARD_DATE);

  // Reset rewards fired if it's a new day
  if (savedDate !== today) {
    rewardsMilestonesFired = {};
    localStorage.setItem(KEY_REWARD_DATE, today);
    save(KEY_REWARDS, {});
  } else {
    rewardsMilestonesFired = load(KEY_REWARDS, {});
  }

  // Count tasks completed today
  const completedToday = tasks.filter(t =>
    t.completed && t.completedAt && t.completedAt.startsWith(today)
  ).length;

  REWARD_MILESTONES.forEach(milestone => {
    if (completedToday >= milestone && !rewardsMilestonesFired[milestone]) {
      rewardsMilestonesFired[milestone] = true;
      save(KEY_REWARDS, rewardsMilestonesFired);
      showRewardModal(milestone);
    }
  });
}

function showRewardModal(milestone) {
  const reward = REWARD_MESSAGES[Math.floor(Math.random() * REWARD_MESSAGES.length)];
  rewardIcon.textContent = reward.icon;
  rewardMsg.textContent  = `You completed ${milestone} tasks today! ${reward.msg}`;
  playSound('reward');
  openModal(rewardModal);
}


/* ============================================================
   12. VIEW NAVIGATION
   ============================================================ */
function switchView(viewId) {
  // Hide all views
  document.querySelectorAll('.view').forEach(v => v.classList.remove('view--active'));
  // Show target view
  const target = document.getElementById(`view-${viewId}`);
  if (target) target.classList.add('view--active');

  // Update nav buttons
  navBtns.forEach(btn => btn.classList.toggle('nav-btn--active', btn.dataset.view === viewId));

  // View-specific setup
  if (viewId === 'calendar') renderCalendar();
  if (viewId === 'goals')    updateGoalDateLabels();

  // Close mobile sidebar
  closeMobileSidebar();
}

function closeMobileSidebar() {
  sidebar.classList.remove('mobile-open');
  const overlay = document.querySelector('.sidebar-overlay');
  if (overlay) overlay.classList.remove('visible');
  if (mobileMenuBtn) mobileMenuBtn.setAttribute('aria-expanded', 'false');
}

function openMobileSidebar() {
  sidebar.classList.add('mobile-open');
  // Create/show overlay
  let overlay = document.querySelector('.sidebar-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'sidebar-overlay';
    document.body.appendChild(overlay);
    overlay.addEventListener('click', closeMobileSidebar);
  }
  overlay.classList.add('visible');
  if (mobileMenuBtn) mobileMenuBtn.setAttribute('aria-expanded', 'true');
}


/* ============================================================
   13. TASK HELPERS
   ============================================================ */
function generateId() {
  return `t_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

function getTodayStr() {
  return new Date().toISOString().split('T')[0];
}

function getWeekStr(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay()); // Start of week (Sunday)
  return d.toISOString().split('T')[0];
}

function getMonthStr(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

/** Format a Date.now() timestamp to a human-readable string */
function formatCreatedAt(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  const now = new Date();
  const diffMs = now - d;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr  = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1)  return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24)  return `${diffHr}h ago`;
  if (diffDay < 7)  return `${diffDay}d ago`;

  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/** Return { text, cls } for a due date string (YYYY-MM-DD) */
function formatDueDate(dateStr) {
  if (!dateStr) return null;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const due   = new Date(dateStr + 'T00:00:00');
  const diffDays = Math.round((due - today) / 86400000);

  if (diffDays < 0)  return { text: `Overdue ${Math.abs(diffDays)}d`, cls: 'overdue' };
  if (diffDays === 0) return { text: 'Due Today',     cls: 'today'   };
  if (diffDays === 1) return { text: 'Due Tomorrow',  cls: ''         };
  return { text: `Due ${due.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`, cls: '' };
}

/** Calculate the next due date for a recurring task */
function getNextDueDate(dueDateStr, repeat) {
  const base = dueDateStr ? new Date(dueDateStr + 'T00:00:00') : new Date();
  switch (repeat) {
    case 'daily':   base.setDate(base.getDate() + 1);         break;
    case 'weekly':  base.setDate(base.getDate() + 7);         break;
    case 'monthly': base.setMonth(base.getMonth() + 1);       break;
    case 'yearly':  base.setFullYear(base.getFullYear() + 1); break;
  }
  return base.toISOString().split('T')[0];
}


/* ============================================================
   14. TASK FILTER & SORT
   ============================================================ */
function getProcessedTasks() {
  let result = [...tasks];

  // Status filter
  switch (currentFilter) {
    case 'active':    result = result.filter(t => !t.completed && !t.archived); break;
    case 'completed': result = result.filter(t =>  t.completed && !t.archived); break;
    case 'archived':  result = result.filter(t =>  t.archived);                 break;
    default:          result = result.filter(t => !t.archived);                 break;
  }

  // Category filter
  if (currentCategory !== 'all') {
    result = result.filter(t => t.category === currentCategory);
  }

  // Search filter
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    result = result.filter(t => t.text.toLowerCase().includes(q));
  }

  // Sort
  switch (currentSort) {
    case 'oldest':
      result.sort((a, b) => a.createdAt - b.createdAt);
      break;
    case 'priority':
      result.sort((a, b) => (PRIORITY_WEIGHT[a.priority] ?? 1) - (PRIORITY_WEIGHT[b.priority] ?? 1));
      break;
    case 'duedate':
      result.sort((a, b) => {
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate) - new Date(b.dueDate);
      });
      break;
    default: // newest
      result.sort((a, b) => b.createdAt - a.createdAt);
  }

  return result;
}


/* ============================================================
   15. TASK RENDER
   ============================================================ */
function createTaskElement(task) {
  const li = document.createElement('li');
  li.className = [
    'task-item',
    task.completed ? 'completed' : '',
    task.archived  ? 'archived'  : '',
  ].filter(Boolean).join(' ');
  li.dataset.id       = task.id;
  li.dataset.priority = task.priority || 'medium';
  li.setAttribute('draggable', 'true');

  // Checkbox
  const checkbox = document.createElement('input');
  checkbox.type      = 'checkbox';
  checkbox.className = 'task-checkbox';
  checkbox.checked   = task.completed;
  checkbox.setAttribute('aria-label', `Mark "${task.text}" as ${task.completed ? 'incomplete' : 'complete'}`);
  checkbox.addEventListener('change', () => toggleTask(task.id));

  // Body
  const body = document.createElement('div');
  body.className = 'task-body';

  // Text
  const textEl = document.createElement('span');
  textEl.className   = 'task-text';
  textEl.textContent = task.text;

  // Meta row
  const meta = document.createElement('div');
  meta.className = 'task-meta';

  // Priority badge
  const priBadge = document.createElement('span');
  priBadge.className   = `badge badge-priority-${task.priority || 'medium'}`;
  priBadge.textContent = PRIORITY_LABELS[task.priority] || '🟡 Medium';
  meta.appendChild(priBadge);

  // Category badge (skip 'general' to keep UI clean)
  if (task.category && task.category !== 'general') {
    const catBadge = document.createElement('span');
    catBadge.className   = 'badge badge-category';
    catBadge.textContent = CATEGORY_LABELS[task.category] || task.category;
    meta.appendChild(catBadge);
  }

  // Repeat badge
  if (task.repeat && task.repeat !== 'none') {
    const repBadge = document.createElement('span');
    repBadge.className   = 'badge badge-repeat';
    repBadge.textContent = REPEAT_LABELS[task.repeat] || `🔁 ${task.repeat}`;
    meta.appendChild(repBadge);
  }

  // Due date badge
  if (task.dueDate) {
    const dueInfo = formatDueDate(task.dueDate);
    if (dueInfo) {
      const dueBadge = document.createElement('span');
      dueBadge.className   = `badge-due ${dueInfo.cls}`;
      dueBadge.textContent = `📅 ${dueInfo.text}`;
      meta.appendChild(dueBadge);
    }
  }

  // Creation time (Feature 16)
  const timeEl = document.createElement('span');
  timeEl.className   = 'task-time';
  timeEl.textContent = formatCreatedAt(task.createdAt);
  meta.appendChild(timeEl);

  body.appendChild(textEl);
  body.appendChild(meta);

  // Action buttons container
  const actions = document.createElement('div');
  actions.className = 'task-actions';

  // Edit button
  const editBtn = document.createElement('button');
  editBtn.className = 'icon-btn edit-btn';
  editBtn.innerHTML = '✏️';
  editBtn.setAttribute('aria-label', `Edit: ${task.text}`);
  editBtn.title = 'Edit task';
  editBtn.addEventListener('click', (e) => { e.stopPropagation(); openEditModal(task.id); });

  // Archive button
  const archBtn = document.createElement('button');
  archBtn.className = 'icon-btn archive-task-btn';
  archBtn.innerHTML = task.archived ? '📤' : '📦';
  archBtn.setAttribute('aria-label', task.archived ? 'Unarchive' : 'Archive');
  archBtn.title = task.archived ? 'Unarchive task' : 'Archive task';
  archBtn.addEventListener('click', (e) => { e.stopPropagation(); archiveTask(task.id); });

  // Delete button
  const delBtn = document.createElement('button');
  delBtn.className = 'icon-btn delete-btn';
  delBtn.innerHTML = '✕';
  delBtn.setAttribute('aria-label', `Delete: ${task.text}`);
  delBtn.title = 'Delete task';
  delBtn.addEventListener('click', (e) => { e.stopPropagation(); removeTask(task.id, li); });

  actions.appendChild(editBtn);
  actions.appendChild(archBtn);
  actions.appendChild(delBtn);

  li.appendChild(checkbox);
  li.appendChild(body);
  li.appendChild(actions);

  // Drag events
  li.addEventListener('dragstart', handleDragStart);
  li.addEventListener('dragend',   handleDragEnd);
  li.addEventListener('dragover',  handleDragOver);
  li.addEventListener('dragleave', handleDragLeave);
  li.addEventListener('drop',      handleDrop);

  return li;
}

function renderTasks() {
  taskList.innerHTML = '';
  const processed = getProcessedTasks();

  if (processed.length === 0) {
    emptyState.classList.add('visible');
    emptyState.setAttribute('aria-hidden', 'false');

    const icon = emptyState.querySelector('.empty-state__icon');
    const text = emptyState.querySelector('.empty-state__text');
    const hint = emptyState.querySelector('.empty-state__hint');

    if (searchQuery) {
      icon.textContent = '🔍'; text.textContent = 'No matching tasks';
      hint.textContent = `No tasks match "${searchQuery}"`;
    } else if (currentFilter === 'completed') {
      icon.textContent = '✅'; text.textContent = 'No completed tasks yet';
      hint.textContent = 'Check off some tasks to see them here';
    } else if (currentFilter === 'active') {
      icon.textContent = '🎉'; text.textContent = "You're all caught up!";
      hint.textContent = 'All tasks are done — great job!';
    } else if (currentFilter === 'archived') {
      icon.textContent = '📦'; text.textContent = 'No archived tasks';
      hint.textContent = 'Archive completed tasks to keep things tidy';
    } else {
      icon.textContent = '🎯'; text.textContent = 'No tasks here yet!';
      hint.textContent = 'Add a task above to get started';
    }
  } else {
    emptyState.classList.remove('visible');
    emptyState.setAttribute('aria-hidden', 'true');
    processed.forEach(task => taskList.appendChild(createTaskElement(task)));
  }

  updateCounters();
  updateProgressBar();
}


/* ============================================================
   16. TASK OPERATIONS
   ============================================================ */
function addTask(text) {
  const trimmed = text.trim();
  if (!trimmed) { shakeInput(taskInput); return; }

  const newTask = {
    id:          generateId(),
    text:        trimmed,
    completed:   false,
    archived:    false,
    createdAt:   Date.now(),
    completedAt: null,
    dueDate:     dueDateInput.value   || null,
    priority:    prioritySelect.value || 'medium',
    category:    categorySelect.value || 'general',
    repeat:      repeatSelect.value   || 'none',
  };

  tasks.unshift(newTask);
  save(KEY_TASKS, tasks);
  renderTasks();
  playSound('add');

  // Reset form
  taskInput.value      = '';
  dueDateInput.value   = '';
  prioritySelect.value = 'medium';
  categorySelect.value = 'general';
  repeatSelect.value   = 'none';
  updateCharCounter('');

  addBtn.classList.add('btn-pop');
  addBtn.addEventListener('animationend', () => addBtn.classList.remove('btn-pop'), { once: true });
  taskInput.focus();
}

function toggleTask(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;

  task.completed = !task.completed;
  task.completedAt = task.completed ? new Date().toISOString() : null;

  if (task.completed) {
    // Confetti! Sound! XP!
    launchConfetti();
    playSound('complete');
    addXP(1);
    checkDailyReward();

    // Handle recurring task (Feature 14 & 34)
    if (task.repeat && task.repeat !== 'none') {
      handleRecurringTask(task);
    }
  }

  // Update DOM without full re-render
  const li = taskList.querySelector(`[data-id="${id}"]`);
  if (li) {
    li.classList.toggle('completed', task.completed);
    const checkbox = li.querySelector('.task-checkbox');
    if (checkbox) checkbox.checked = task.completed;
  }

  if (currentFilter !== 'all') renderTasks();

  save(KEY_TASKS, tasks);
  updateCounters();
  updateProgressBar();
}

function removeTask(id, el) {
  playSound('delete');
  el.classList.add('removing');
  el.addEventListener('animationend', () => {
    tasks = tasks.filter(t => t.id !== id);
    save(KEY_TASKS, tasks);
    renderTasks();
  }, { once: true });
}

function archiveTask(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;
  task.archived = !task.archived;
  save(KEY_TASKS, tasks);
  renderTasks();
}

function archiveAllCompleted() {
  tasks.forEach(t => { if (t.completed && !t.archived) t.archived = true; });
  save(KEY_TASKS, tasks);
  renderTasks();
}

function clearAllCompleted() {
  const els = taskList.querySelectorAll('.task-item.completed');
  if (els.length === 0) return;
  playSound('delete');
  els.forEach(el => el.classList.add('removing'));
  const last = els[els.length - 1];
  last.addEventListener('animationend', () => {
    tasks = tasks.filter(t => !t.completed);
    save(KEY_TASKS, tasks);
    renderTasks();
  }, { once: true });
}

function saveEdit() {
  const task = tasks.find(t => t.id === editingTaskId);
  if (!task) { closeModal(editModal); return; }

  const newText = editTaskInput.value.trim();
  if (!newText) { shakeInput(editTaskInput); return; }

  task.text     = newText;
  task.dueDate  = editDueDate.value    || null;
  task.priority = editPriority.value   || 'medium';
  task.category = editCategory.value   || 'general';
  task.repeat   = editRepeat.value     || 'none';

  save(KEY_TASKS, tasks);
  renderTasks();
  closeModal(editModal);
}


/* ============================================================
   17. RECURRING TASKS (Feature 14 & 34)
   ============================================================ */
function handleRecurringTask(completedTask) {
  const nextTask = {
    id:          generateId(),
    text:        completedTask.text,
    completed:   false,
    archived:    false,
    createdAt:   Date.now(),
    completedAt: null,
    dueDate:     getNextDueDate(completedTask.dueDate, completedTask.repeat),
    priority:    completedTask.priority,
    category:    completedTask.category,
    repeat:      completedTask.repeat,
  };

  // Insert at beginning of array
  tasks.unshift(nextTask);
  save(KEY_TASKS, tasks);

  // Notify user
  sendNotification(
    `🔁 Recurring task created`,
    `"${nextTask.text}" is ready for ${nextTask.repeat === 'daily' ? 'tomorrow' : 'next ' + nextTask.repeat}`
  );
}


/* ============================================================
   18. EXPORT (PDF / CSV) & IMPORT
   ============================================================ */

/** Export to PDF using window.print() */
function exportToPDF() {
  window.print();
}

/** Export to CSV (opens in Excel) */
function exportToCSV() {
  const headers = ['Title','Status','Priority','Category','Repeat','Due Date','Created At'];
  const rows = tasks.filter(t => !t.archived).map(t => [
    `"${t.text.replace(/"/g, '""')}"`,
    t.completed ? 'Completed' : 'Active',
    t.priority  || 'medium',
    t.category  || 'general',
    t.repeat    || 'none',
    t.dueDate   || '',
    new Date(t.createdAt).toLocaleString(),
  ]);

  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `taskflow_tasks_${getTodayStr()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/** Import tasks from a JSON file */
function importTasks(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const imported = JSON.parse(e.target.result);
      if (!Array.isArray(imported)) { alert('Invalid file format. Expected a JSON array.'); return; }

      // Merge — skip duplicates by text + createdAt
      const existing = new Set(tasks.map(t => t.id));
      let added = 0;
      imported.forEach(t => {
        if (!existing.has(t.id) && t.text) {
          t.id        = t.id        || generateId();
          t.completed = t.completed || false;
          t.archived  = t.archived  || false;
          t.priority  = t.priority  || 'medium';
          t.category  = t.category  || 'general';
          t.repeat    = t.repeat    || 'none';
          t.createdAt = t.createdAt || Date.now();
          tasks.push(t);
          added++;
        }
      });

      save(KEY_TASKS, tasks);
      renderTasks();
      alert(`✅ Imported ${added} tasks successfully!`);
    } catch(err) {
      alert('❌ Could not parse JSON file. Make sure it\'s a valid TaskFlow export.');
    }
  };
  reader.readAsText(file);
}


/* ============================================================
   19. POMODORO TIMER (Feature 11)
   ============================================================ */
const POMO_DURATIONS = { study: 25 * 60, break: 5 * 60, longbreak: 15 * 60 };
const POMO_CIRCUMFERENCE = 2 * Math.PI * 96; // 2πr where r=96

function setPomoMode(mode) {
  pomoMode        = mode;
  pomoSecondsLeft = POMO_DURATIONS[mode];
  pomoTotalSecs   = POMO_DURATIONS[mode];
  pomoRunning     = false;
  clearInterval(pomoInterval);

  // Update tabs
  [pomoStudyTab, pomoBreakTab, pomoLongTab].forEach(tab => {
    tab.classList.toggle('pomo-tab--active', tab.dataset.mode === mode);
  });

  // Update buttons
  pomoStartBtn.disabled = false;
  pomoPauseBtn.disabled = true;

  updatePomoDisplay();
}

function updatePomoDisplay() {
  const min = String(Math.floor(pomoSecondsLeft / 60)).padStart(2, '0');
  const sec = String(pomoSecondsLeft % 60).padStart(2, '0');
  pomoTimeEl.textContent = `${min}:${sec}`;

  // SVG ring
  const progress   = (pomoTotalSecs - pomoSecondsLeft) / pomoTotalSecs;
  const offset     = POMO_CIRCUMFERENCE * (1 - progress);
  if (pomoRingEl) {
    pomoRingEl.style.strokeDasharray  = POMO_CIRCUMFERENCE;
    pomoRingEl.style.strokeDashoffset = offset;
  }

  // Status text
  const modeLabels = { study: '📚 Focus time!', break: '☕ Short break', longbreak: '🛌 Long break' };
  pomoStatusEl.textContent = pomoRunning ? modeLabels[pomoMode] : (pomoSecondsLeft === POMO_DURATIONS[pomoMode] ? 'Ready to focus' : 'Paused');
}

function startPomo() {
  if (pomoRunning) return;
  pomoRunning = true;
  pomoStartBtn.disabled = true;
  pomoPauseBtn.disabled = false;

  pomoInterval = setInterval(() => {
    pomoSecondsLeft--;
    updatePomoDisplay();

    if (pomoSecondsLeft <= 0) {
      clearInterval(pomoInterval);
      pomoRunning = false;
      pomoStartBtn.disabled = false;
      pomoPauseBtn.disabled = true;
      onPomoComplete();
    }
  }, 1000);
}

function pausePomo() {
  if (!pomoRunning) return;
  pomoRunning = false;
  clearInterval(pomoInterval);
  pomoStartBtn.disabled = false;
  pomoPauseBtn.disabled = true;
  updatePomoDisplay();
}

function resetPomo() {
  pausePomo();
  setPomoMode(pomoMode);
}

function onPomoComplete() {
  playSound('pomodoro');
  sendNotification('⏱️ Pomodoro Complete!', pomoMode === 'study' ? 'Time for a break! ☕' : 'Break over — back to work! 📚');
  pomoStatusEl.textContent = pomoMode === 'study' ? '✅ Session complete!' : '✅ Break over!';

  if (pomoMode === 'study') {
    pomoSessionsToday++;
    save(KEY_POMO, { date: getTodayStr(), count: pomoSessionsToday });
    addXP(5); // Bonus XP for completing a pomodoro
    renderPomoDots();
    pomoCountEl.textContent = `${pomoSessionsToday} session${pomoSessionsToday !== 1 ? 's' : ''}`;
  }

  // Auto-switch mode
  if (pomoMode === 'study') {
    setTimeout(() => setPomoMode(pomoSessionsToday % 4 === 0 ? 'longbreak' : 'break'), 1500);
  } else {
    setTimeout(() => setPomoMode('study'), 1500);
  }
}

function renderPomoDots() {
  if (!pomoDotsEl) return;
  pomoDotsEl.innerHTML = '';
  const displayCount = Math.min(pomoSessionsToday, 8);
  for (let i = 0; i < 8; i++) {
    const dot = document.createElement('div');
    dot.className = `pomo-dot${i < displayCount ? ' filled' : ''}`;
    pomoDotsEl.appendChild(dot);
  }
}

function loadPomoSessions() {
  const saved = load(KEY_POMO, {});
  if (saved.date === getTodayStr()) {
    pomoSessionsToday = saved.count || 0;
  } else {
    pomoSessionsToday = 0;
  }
  renderPomoDots();
  if (pomoCountEl) pomoCountEl.textContent = `${pomoSessionsToday} session${pomoSessionsToday !== 1 ? 's' : ''}`;
}


/* ============================================================
   20. CALENDAR VIEW (Feature 12)
   ============================================================ */
function renderCalendar() {
  calMonthTitle.textContent = `${MONTHS_LONG[calMonth]} ${calYear}`;
  calendarGrid.innerHTML = '';

  const firstDay = new Date(calYear, calMonth, 1).getDay();
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const today = new Date(); today.setHours(0, 0, 0, 0);

  // Dates that have tasks
  const taskDates = new Set(
    tasks.filter(t => t.dueDate && !t.archived)
         .map(t => t.dueDate)
  );

  // Empty cells before first day
  for (let i = 0; i < firstDay; i++) {
    const empty = document.createElement('div');
    empty.className = 'cal-day cal-day--empty';
    calendarGrid.appendChild(empty);
  }

  // Day cells
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${calYear}-${String(calMonth + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    const cellDate = new Date(calYear, calMonth, day);
    const isToday  = cellDate.getTime() === today.getTime();
    const hasTasks = taskDates.has(dateStr);

    const cell = document.createElement('div');
    cell.className = [
      'cal-day',
      isToday   ? 'cal-day--today'     : '',
      hasTasks  ? 'cal-day--has-tasks' : '',
    ].filter(Boolean).join(' ');
    cell.textContent = day;
    cell.setAttribute('role', 'gridcell');
    cell.setAttribute('aria-label', `${MONTHS_LONG[calMonth]} ${day}${hasTasks ? ', has tasks' : ''}`);

    cell.addEventListener('click', () => showCalendarDayTasks(dateStr, day));
    calendarGrid.appendChild(cell);
  }
}

function showCalendarDayTasks(dateStr, day) {
  // Deselect previous
  calendarGrid.querySelectorAll('.cal-day--selected').forEach(c => c.classList.remove('cal-day--selected'));
  // Select clicked
  const cells = calendarGrid.querySelectorAll('.cal-day');
  cells.forEach(c => { if (c.textContent == day && !c.classList.contains('cal-day--empty')) c.classList.add('cal-day--selected'); });

  const dayTasks = tasks.filter(t => t.dueDate === dateStr && !t.archived);
  calTasksTitle.textContent = `📌 ${MONTHS_LONG[calMonth]} ${day} — ${dayTasks.length} task${dayTasks.length !== 1 ? 's' : ''}`;
  calTaskList.innerHTML = '';

  if (dayTasks.length === 0) {
    calTaskList.innerHTML = '<li style="color:var(--clr-text-muted);font-size:0.82rem;padding:8px 0">No tasks on this date.</li>';
    return;
  }

  dayTasks.forEach(t => {
    const li = document.createElement('li');
    li.className = 'cal-task-item';

    const dot = document.createElement('div');
    dot.className = 'dot';
    dot.style.background = t.priority === 'high' ? 'var(--clr-high)' : t.priority === 'low' ? 'var(--clr-low)' : 'var(--clr-medium)';

    const span = document.createElement('span');
    span.textContent = t.text;
    if (t.completed) span.style.textDecoration = 'line-through';

    li.appendChild(dot);
    li.appendChild(span);
    calTaskList.appendChild(li);
  });
}


/* ============================================================
   21. HABIT TRACKER (Feature 23)
   ============================================================ */
function addHabit() {
  const text  = habitInput.value.trim();
  const emoji = habitEmojiSel.value;
  if (!text) { shakeInput(habitInput); return; }

  const habit = {
    id:             generateId(),
    text,
    emoji,
    createdAt:      Date.now(),
    completedDates: [],   // array of 'YYYY-MM-DD' strings
  };

  habits.push(habit);
  save(KEY_HABITS, habits);
  renderHabits();
  habitInput.value = '';
  playSound('add');
}

function toggleHabitToday(id) {
  const habit = habits.find(h => h.id === id);
  if (!habit) return;

  const today = getTodayStr();
  const idx   = habit.completedDates.indexOf(today);

  if (idx === -1) {
    habit.completedDates.push(today);
    playSound('complete');
    addXP(1);
  } else {
    habit.completedDates.splice(idx, 1);
  }

  save(KEY_HABITS, habits);
  renderHabits();
}

function deleteHabit(id) {
  habits = habits.filter(h => h.id !== id);
  save(KEY_HABITS, habits);
  renderHabits();
}

function getStreak(completedDates) {
  if (!completedDates.length) return 0;
  const sorted = [...completedDates].sort().reverse();
  const today  = new Date(); today.setHours(0,0,0,0);
  let streak   = 0;
  let check    = new Date(today);

  for (const dateStr of sorted) {
    const d = new Date(dateStr + 'T00:00:00');
    d.setHours(0,0,0,0);
    if (d.getTime() === check.getTime()) {
      streak++;
      check.setDate(check.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

function renderHabits() {
  if (!habitListEl) return;
  habitListEl.innerHTML = '';

  if (habits.length === 0) {
    habitListEl.innerHTML = `<div class="empty-state visible"><div class="empty-state__icon">🔥</div><p class="empty-state__text">No habits yet!</p><p class="empty-state__hint">Add a habit above to start building streaks</p></div>`;
    return;
  }

  const today = getTodayStr();

  // Last 7 days for heatmap
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i)); d.setHours(0,0,0,0);
    return d.toISOString().split('T')[0];
  });

  habits.forEach(habit => {
    const isDoneToday = habit.completedDates.includes(today);
    const streak      = getStreak(habit.completedDates);

    const card = document.createElement('div');
    card.className = 'habit-card glass-card';
    card.style.padding = '14px';
    card.style.marginBottom = '0';

    // Emoji / complete button
    const emojiBtn = document.createElement('button');
    emojiBtn.className = `habit-emoji-btn${isDoneToday ? ' completed-today' : ''}`;
    emojiBtn.textContent = habit.emoji;
    emojiBtn.setAttribute('aria-label', isDoneToday ? 'Mark habit incomplete' : 'Mark habit complete');
    emojiBtn.title = isDoneToday ? '✅ Done today! Click to undo' : 'Click to mark done today';
    emojiBtn.addEventListener('click', () => toggleHabitToday(habit.id));

    // Info
    const info = document.createElement('div');
    info.className = 'habit-info';

    const name = document.createElement('div');
    name.className   = 'habit-name';
    name.textContent = habit.text;

    const streakRow = document.createElement('div');
    streakRow.className = 'habit-streak';
    streakRow.innerHTML = `<span class="streak-fire">🔥</span> <strong>${streak}</strong> day streak${isDoneToday ? ' · ✅ Done today' : ''}`;

    // 7-day heatmap dots
    const weekRow = document.createElement('div');
    weekRow.className = 'habit-week';
    last7.forEach((dateStr, i) => {
      const dot = document.createElement('div');
      const done = habit.completedDates.includes(dateStr);
      dot.className = `habit-dot${done ? ' done' : ''}`;
      if (!done) dot.textContent = DAYS_SHORT[new Date(dateStr + 'T00:00:00').getDay()].charAt(0);
      dot.title = dateStr;
      weekRow.appendChild(dot);
    });

    info.appendChild(name);
    info.appendChild(streakRow);
    info.appendChild(weekRow);

    // Delete button
    const delBtn = document.createElement('button');
    delBtn.className = 'habit-delete-btn';
    delBtn.innerHTML = '🗑️';
    delBtn.title = 'Remove habit';
    delBtn.addEventListener('click', () => deleteHabit(habit.id));

    card.appendChild(emojiBtn);
    card.appendChild(info);
    card.appendChild(delBtn);
    habitListEl.appendChild(card);
  });
}


/* ============================================================
   22. GOALS — Daily / Weekly / Monthly (Features 24-26)
   ============================================================ */
function updateGoalDateLabels() {
  const today  = new Date();
  const weekStart = new Date(today); weekStart.setDate(today.getDate() - today.getDay());
  const weekEnd   = new Date(weekStart); weekEnd.setDate(weekStart.getDate() + 6);

  if (dailyDateLabel) dailyDateLabel.textContent = `Today: ${today.toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric' })}`;
  if (weeklyDateLabel) weeklyDateLabel.textContent = `This week: ${weekStart.toLocaleDateString('en-US',{month:'short',day:'numeric'})} — ${weekEnd.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}`;
  if (monthlyDateLabel) monthlyDateLabel.textContent = `This month: ${today.toLocaleDateString('en-US',{month:'long',year:'numeric'})}`;
}

function addGoal(period) {
  const input = period === 'daily' ? dailyGoalInput : period === 'weekly' ? weeklyGoalInput : monthlyGoalInput;
  const text  = input.value.trim();
  if (!text) { shakeInput(input); return; }

  const goal = {
    id:        generateId(),
    text,
    completed: false,
    createdAt: Date.now(),
    period,
    date:      period === 'daily' ? getTodayStr() : period === 'weekly' ? getWeekStr() : getMonthStr(),
  };

  goals[period].push(goal);
  save(KEY_GOALS, goals);
  renderGoals(period);
  input.value = '';
  playSound('add');
}

function toggleGoal(period, id) {
  const goal = goals[period].find(g => g.id === id);
  if (!goal) return;
  goal.completed = !goal.completed;
  if (goal.completed) { playSound('complete'); addXP(1); }
  save(KEY_GOALS, goals);
  renderGoals(period);
}

function deleteGoal(period, id) {
  goals[period] = goals[period].filter(g => g.id !== id);
  save(KEY_GOALS, goals);
  renderGoals(period);
}

function renderGoals(period) {
  const listEl = period === 'daily' ? dailyGoalList : period === 'weekly' ? weeklyGoalList : monthlyGoalList;
  if (!listEl) return;
  listEl.innerHTML = '';

  const periodGoals = goals[period] || [];

  if (periodGoals.length === 0) {
    listEl.innerHTML = `<p style="color:var(--clr-text-muted);font-size:0.84rem;text-align:center;padding:20px 0">No ${period} goals yet. Add one above!</p>`;
    return;
  }

  periodGoals.forEach(goal => {
    const item = document.createElement('div');
    item.className = `goal-item${goal.completed ? ' completed-goal' : ''}`;

    const checkbox = document.createElement('input');
    checkbox.type    = 'checkbox';
    checkbox.className = 'task-checkbox';
    checkbox.checked = goal.completed;
    checkbox.addEventListener('change', () => toggleGoal(period, goal.id));

    const text = document.createElement('span');
    text.className   = 'goal-text';
    text.textContent = goal.text;

    const del = document.createElement('button');
    del.className = 'icon-btn delete-btn';
    del.innerHTML = '✕';
    del.addEventListener('click', () => deleteGoal(period, goal.id));

    item.appendChild(checkbox);
    item.appendChild(text);
    item.appendChild(del);
    listEl.appendChild(item);
  });
}

function renderAllGoals() {
  renderGoals('daily');
  renderGoals('weekly');
  renderGoals('monthly');
}

function pruneOldGoals() {
  // Remove goals from past periods
  const today = getTodayStr();
  const week  = getWeekStr();
  const month = getMonthStr();
  goals.daily   = goals.daily.filter(g => g.date === today);
  goals.weekly  = goals.weekly.filter(g => g.date === week);
  goals.monthly = goals.monthly.filter(g => g.date === month);
  save(KEY_GOALS, goals);
}


/* ============================================================
   23. GOAL TRACKING (Feature 15)
   ============================================================ */
function addTrackedGoal() {
  const text     = trackingGoalInput.value.trim();
  const progress = parseInt(trackingProgressInput.value, 10) || 0;
  const icon     = trackingIconInput.value.trim() || '🎯';
  if (!text) { shakeInput(trackingGoalInput); return; }

  const tGoal = {
    id:       generateId(),
    text,
    icon,
    progress: Math.min(100, Math.max(0, progress)),
    createdAt: Date.now(),
  };

  trackedGoals.push(tGoal);
  save(KEY_TRACKED, trackedGoals);
  renderTrackedGoals();

  trackingGoalInput.value    = '';
  trackingProgressInput.value = '0';
  trackingIconInput.value    = '🎯';
  playSound('add');
}

function updateTrackedGoalProgress(id, newPct) {
  const g = trackedGoals.find(g => g.id === id);
  if (!g) return;
  g.progress = Math.min(100, Math.max(0, newPct));
  if (g.progress === 100) { playSound('complete'); addXP(5); launchConfetti(); }
  save(KEY_TRACKED, trackedGoals);
  renderTrackedGoals();
}

function deleteTrackedGoal(id) {
  trackedGoals = trackedGoals.filter(g => g.id !== id);
  save(KEY_TRACKED, trackedGoals);
  renderTrackedGoals();
}

function renderTrackedGoals() {
  if (!trackingGoalList) return;
  trackingGoalList.innerHTML = '';

  if (trackedGoals.length === 0) {
    trackingGoalList.innerHTML = `<p style="color:var(--clr-text-muted);font-size:0.84rem;text-align:center;padding:20px 0">No tracked goals yet. Add one above!</p>`;
    return;
  }

  trackedGoals.forEach(g => {
    const card = document.createElement('div');
    card.className = 'tracking-card';

    const header = document.createElement('div');
    header.className = 'tracking-card-header';

    const title = document.createElement('div');
    title.className = 'tracking-card-title';
    title.innerHTML = `<span>${g.icon}</span> ${g.text}`;

    const pct = document.createElement('span');
    pct.className   = 'tracking-pct';
    pct.textContent = `${g.progress}%`;

    const del = document.createElement('button');
    del.className = 'icon-btn delete-btn';
    del.innerHTML = '✕';
    del.style.marginLeft = '4px';
    del.addEventListener('click', () => deleteTrackedGoal(g.id));

    header.appendChild(title);
    header.appendChild(pct);
    header.appendChild(del);

    const barWrap = document.createElement('div');
    barWrap.className = 'tracking-bar-wrap';
    const bar = document.createElement('div');
    bar.className = 'tracking-bar';
    bar.style.width = `${g.progress}%`;
    barWrap.appendChild(bar);

    const controls = document.createElement('div');
    controls.className = 'tracking-controls';

    const slider = document.createElement('input');
    slider.type      = 'range';
    slider.className = 'tracking-slider';
    slider.min = '0'; slider.max = '100'; slider.value = g.progress;
    slider.addEventListener('input', () => {
      const v = parseInt(slider.value, 10);
      bar.style.width = `${v}%`;
      pct.textContent = `${v}%`;
    });
    slider.addEventListener('change', () => updateTrackedGoalProgress(g.id, parseInt(slider.value, 10)));

    const badge = document.createElement('span');
    badge.className = `badge ${g.progress >= 100 ? 'badge-priority-low' : g.progress >= 50 ? 'badge-priority-medium' : 'badge-priority-high'}`;
    badge.textContent = g.progress >= 100 ? '✅ Done!' : g.progress >= 50 ? '🔥 Almost!' : '⚡ In Progress';

    controls.appendChild(slider);
    controls.appendChild(badge);

    card.appendChild(header);
    card.appendChild(barWrap);
    card.appendChild(controls);
    trackingGoalList.appendChild(card);
  });
}


/* ============================================================
   24. VISION BOARD (Feature 27)
   ============================================================ */
function addVisionCard() {
  const title = visionTitleInput.value.trim();
  const emoji = visionEmojiInput.value.trim() || '🌟';
  const cat   = visionCatInput.value.trim()   || 'Vision';
  const desc  = visionDescInput.value.trim()  || '';
  if (!title) { shakeInput(visionTitleInput); return; }

  const card = { id: generateId(), title, emoji, cat, desc, createdAt: Date.now() };
  visionCards.push(card);
  save(KEY_VISION, visionCards);
  renderVisionBoard();

  visionTitleInput.value = '';
  visionEmojiInput.value = '🌟';
  visionCatInput.value   = '';
  visionDescInput.value  = '';
  playSound('add');
}

function deleteVisionCard(id) {
  visionCards = visionCards.filter(c => c.id !== id);
  save(KEY_VISION, visionCards);
  renderVisionBoard();
}

function renderVisionBoard() {
  if (!visionBoardEl) return;
  visionBoardEl.innerHTML = '';

  if (visionCards.length === 0) {
    visionBoardEl.innerHTML = `<p style="color:var(--clr-text-muted);font-size:0.84rem;text-align:center;padding:20px 0;grid-column:1/-1">Your vision board is empty. Add your first vision card!</p>`;
    return;
  }

  visionCards.forEach(vc => {
    const card = document.createElement('div');
    card.className = 'vision-card';

    const emoji = document.createElement('span');
    emoji.className   = 'vision-card-emoji';
    emoji.textContent = vc.emoji;

    const cat = document.createElement('div');
    cat.className   = 'vision-card-cat';
    cat.textContent = vc.cat;

    const title = document.createElement('div');
    title.className   = 'vision-card-title';
    title.textContent = vc.title;

    const desc = document.createElement('div');
    desc.className   = 'vision-card-desc';
    desc.textContent = vc.desc;

    const del = document.createElement('button');
    del.className = 'vision-card-delete';
    del.innerHTML = '✕';
    del.title = 'Remove vision card';
    del.addEventListener('click', () => deleteVisionCard(vc.id));

    card.appendChild(emoji);
    card.appendChild(cat);
    card.appendChild(title);
    if (vc.desc) card.appendChild(desc);
    card.appendChild(del);
    visionBoardEl.appendChild(card);
  });
}


/* ============================================================
   25. CLASS SCHEDULE (Feature 22)
   ============================================================ */
const SCHED_DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

function addClass() {
  const name  = classNameInput.value.trim();
  const day   = classDaySelect.value;
  const start = classStartInput.value;
  const end   = classEndInput.value;
  const room  = classRoomInput.value.trim();
  const color = classColorInput.value;

  if (!name || !start || !end) { alert('Please fill in the class name, start time, and end time.'); return; }

  const cls = { id: generateId(), name, day, start, end, room, color };
  classes.push(cls);
  save(KEY_CLASSES, classes);
  renderSchedule();

  classNameInput.value  = '';
  classRoomInput.value  = '';
  playSound('add');
}

function deleteClass(id) {
  classes = classes.filter(c => c.id !== id);
  save(KEY_CLASSES, classes);
  renderSchedule();
}

function renderSchedule() {
  if (!scheduleGrid) return;
  scheduleGrid.innerHTML = '';

  // Build simple card list view (more practical than a time-grid for variable schedules)
  if (classes.length === 0) {
    scheduleGrid.innerHTML = `<p style="color:var(--clr-text-muted);font-size:0.84rem;text-align:center;padding:20px 0">No classes added yet. Add your first class above!</p>`;
    return;
  }

  // Group by day
  const byDay = {};
  SCHED_DAYS.forEach(d => { byDay[d] = []; });
  classes.forEach(c => { if (byDay[c.day]) byDay[c.day].push(c); });

  SCHED_DAYS.forEach(day => {
    const dayCls = byDay[day];
    if (dayCls.length === 0) return;

    const dayHeader = document.createElement('div');
    dayHeader.style.cssText = 'font-size:0.78rem;font-weight:700;color:var(--clr-text-muted);text-transform:uppercase;letter-spacing:0.06em;margin:10px 0 4px;';
    dayHeader.textContent = day === 'Mon' ? '📅 Monday' : day === 'Tue' ? '📅 Tuesday' : day === 'Wed' ? '📅 Wednesday' : day === 'Thu' ? '📅 Thursday' : day === 'Fri' ? '📅 Friday' : day === 'Sat' ? '📅 Saturday' : '📅 Sunday';
    scheduleGrid.appendChild(dayHeader);

    dayCls.sort((a, b) => a.start.localeCompare(b.start)).forEach(cls => {
      const item = document.createElement('div');
      item.className = 'class-item';
      item.style.borderLeftColor = cls.color;

      const colorDot = document.createElement('div');
      colorDot.style.cssText = `width:10px;height:10px;border-radius:50%;background:${cls.color};flex-shrink:0`;

      const info = document.createElement('div');
      info.className = 'class-item-info';
      info.innerHTML = `<span class="class-item-name">${cls.name}</span><span class="class-item-time">🕐 ${cls.start} – ${cls.end}</span>${cls.room ? `<span class="class-item-room">📍 ${cls.room}</span>` : ''}`;

      const del = document.createElement('button');
      del.className = 'icon-btn delete-btn';
      del.innerHTML = '✕';
      del.addEventListener('click', () => deleteClass(cls.id));

      item.appendChild(colorDot);
      item.appendChild(info);
      item.appendChild(del);
      scheduleGrid.appendChild(item);
    });
  });
}


/* ============================================================
   26. SETTINGS
   ============================================================ */
function loadSettings() {
  soundEnabled = load(KEY_SOUND, true);
  if (soundToggle) soundToggle.checked = soundEnabled;
  updateNotifStatus();
}


/* ============================================================
   27. REAL-TIME UPDATES (Feature 30)
   ============================================================ */
function realTimeUpdate() {
  // Update task creation time displays
  document.querySelectorAll('.task-time').forEach(el => {
    const li = el.closest('[data-id]');
    if (!li) return;
    const task = tasks.find(t => t.id === li.dataset.id);
    if (task) el.textContent = formatCreatedAt(task.createdAt);
  });
}


/* ============================================================
   DRAG & DROP (Feature 9 — kept from previous version)
   ============================================================ */
function handleDragStart(e) {
  dragSrcEl = this;
  this.classList.add('dragging');
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/plain', this.dataset.id);
}

function handleDragEnd() {
  this.classList.remove('dragging');
  document.querySelectorAll('.task-item.drag-over').forEach(el => el.classList.remove('drag-over'));
  dragSrcEl = null;
}

function handleDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
  if (this !== dragSrcEl) {
    document.querySelectorAll('.task-item.drag-over').forEach(el => el.classList.remove('drag-over'));
    this.classList.add('drag-over');
  }
}

function handleDragLeave() { this.classList.remove('drag-over'); }

function handleDrop(e) {
  e.preventDefault(); e.stopPropagation();
  this.classList.remove('drag-over');
  if (!dragSrcEl || dragSrcEl === this) return;

  const srcId  = dragSrcEl.dataset.id;
  const destId = this.dataset.id;
  const realSrcIdx  = tasks.findIndex(t => t.id === srcId);
  const realDestIdx = tasks.findIndex(t => t.id === destId);
  if (realSrcIdx === -1 || realDestIdx === -1) return;

  const [moved] = tasks.splice(realSrcIdx, 1);
  tasks.splice(realDestIdx, 0, moved);
  save(KEY_TASKS, tasks);
  renderTasks();
}


/* ============================================================
   MODAL HELPERS
   ============================================================ */
function openModal(modal) {
  modal.classList.add('visible');
  modal.setAttribute('aria-hidden', 'false');
}

function closeModal(modal) {
  modal.classList.remove('visible');
  modal.setAttribute('aria-hidden', 'true');
}

function openEditModal(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;
  editingTaskId        = id;
  editTaskInput.value  = task.text;
  editDueDate.value    = task.dueDate   || '';
  editPriority.value   = task.priority  || 'medium';
  editCategory.value   = task.category  || 'general';
  editRepeat.value     = task.repeat    || 'none';
  openModal(editModal);
  editTaskInput.focus();
}


/* ============================================================
   UI HELPERS
   ============================================================ */
function updateCounters() {
  const nonArchived  = tasks.filter(t => !t.archived);
  const total        = nonArchived.length;
  const completed    = nonArchived.filter(t => t.completed).length;
  const remaining    = total - completed;

  animateCounter(counterTotal,  total);
  animateCounter(counterDone,   completed);
  animateCounter(counterRemain, remaining);
}

function animateCounter(el, newVal) {
  if (!el) return;
  const old = parseInt(el.textContent, 10) || 0;
  if (old !== newVal) {
    el.textContent = newVal;
    el.classList.remove('bump');
    void el.offsetWidth; // force reflow
    el.classList.add('bump');
    el.addEventListener('animationend', () => el.classList.remove('bump'), { once: true });
  }
}

function updateProgressBar() {
  const nonArchived = tasks.filter(t => !t.archived);
  const total       = nonArchived.length;
  const completed   = nonArchived.filter(t => t.completed).length;
  const pct         = total > 0 ? Math.round((completed / total) * 100) : 0;
  progressBar.style.width = `${pct}%`;
  progressBar.setAttribute('aria-valuenow', pct);
  progressPct.textContent = `${pct}%`;
}

function updateCharCounter(value) {
  const len = value.length;
  charCountEl.textContent = len;
  charCounterEl.classList.toggle('near-limit', len > MAX_CHARS - CHAR_WARN);
}

function shakeInput(el) {
  if (!el) return;
  el.classList.add('input-shake');
  el.addEventListener('animationend', () => el.classList.remove('input-shake'), { once: true });
}


/* ============================================================
   28. EVENT LISTENERS
   ============================================================ */
function setupEventListeners() {

  // ---- Navigation ----
  navBtns.forEach(btn => {
    btn.addEventListener('click', () => switchView(btn.dataset.view));
  });

  mobileMenuBtn.addEventListener('click', openMobileSidebar);

  // ---- Theme ----
  themeToggle.addEventListener('click', toggleDarkLight);

  themeCards.forEach(card => {
    card.addEventListener('click', () => applyTheme(card.dataset.theme));
  });

  // ---- Tasks ----
  taskForm.addEventListener('submit', (e) => { e.preventDefault(); addTask(taskInput.value); });
  taskInput.addEventListener('input', () => updateCharCounter(taskInput.value));
  searchInput.addEventListener('input', (e) => { searchQuery = e.target.value.trim(); renderTasks(); });
  sortSelect.addEventListener('change', () => { currentSort = sortSelect.value; renderTasks(); });

  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      currentFilter = tab.dataset.filter;
      filterTabs.forEach(t => t.classList.toggle('filter-tab--active', t === tab));
      renderTasks();
    });
  });

  catChips.forEach(chip => {
    chip.addEventListener('click', () => {
      currentCategory = chip.dataset.cat;
      catChips.forEach(c => c.classList.toggle('cat-chip--active', c === chip));
      renderTasks();
    });
  });

  clearCompletedBtn.addEventListener('click',   clearAllCompleted);
  archiveCompletedBtn.addEventListener('click',  archiveAllCompleted);

  exportPdfBtn.addEventListener('click', exportToPDF);
  exportCsvBtn.addEventListener('click', exportToCSV);
  importFileInput.addEventListener('change', (e) => { importTasks(e.target.files[0]); e.target.value = ''; });

  // ---- Edit Modal ----
  editSaveBtn.addEventListener('click',   saveEdit);
  editCancelBtn.addEventListener('click', () => closeModal(editModal));
  editModal.addEventListener('click', (e) => { if (e.target === editModal) closeModal(editModal); });
  editTaskInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') saveEdit(); });

  // ---- Level-up modal ----
  levelupCloseBtn.addEventListener('click', () => closeModal(levelupModal));
  levelupModal.addEventListener('click', (e) => { if (e.target === levelupModal) closeModal(levelupModal); });

  // ---- Reward modal ----
  rewardCloseBtn.addEventListener('click', () => closeModal(rewardModal));
  rewardModal.addEventListener('click',   (e) => { if (e.target === rewardModal) closeModal(rewardModal); });

  // ---- Escape key closes any open modal ----
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    [editModal, levelupModal, rewardModal].forEach(m => {
      if (m.classList.contains('visible')) closeModal(m);
    });
  });

  // ---- Pomodoro ----
  [pomoStudyTab, pomoBreakTab, pomoLongTab].forEach(tab => {
    tab.addEventListener('click', () => setPomoMode(tab.dataset.mode));
  });
  pomoStartBtn.addEventListener('click', startPomo);
  pomoPauseBtn.addEventListener('click', pausePomo);
  pomoResetBtn.addEventListener('click', resetPomo);

  // ---- Calendar ----
  calPrevBtn.addEventListener('click', () => {
    calMonth--;
    if (calMonth < 0) { calMonth = 11; calYear--; }
    renderCalendar();
  });
  calNextBtn.addEventListener('click', () => {
    calMonth++;
    if (calMonth > 11) { calMonth = 0; calYear++; }
    renderCalendar();
  });

  // ---- Habits ----
  addHabitBtn.addEventListener('click', addHabit);
  habitInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') addHabit(); });

  // ---- Goals ----
  goalTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      goalTabs.forEach(t => t.classList.toggle('goal-tab--active', t === tab));
      goalPanels.forEach(p => p.classList.toggle('hidden', p.id !== `gpanel-${tab.dataset.gtab}`));
    });
  });

  addDailyBtn.addEventListener('click',   () => addGoal('daily'));
  addWeeklyBtn.addEventListener('click',  () => addGoal('weekly'));
  addMonthlyBtn.addEventListener('click', () => addGoal('monthly'));

  dailyGoalInput.addEventListener('keydown',   (e) => { if (e.key === 'Enter') addGoal('daily'); });
  weeklyGoalInput.addEventListener('keydown',  (e) => { if (e.key === 'Enter') addGoal('weekly'); });
  monthlyGoalInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') addGoal('monthly'); });

  // ---- Tracked Goals ----
  addTrackingGoalBtn.addEventListener('click', addTrackedGoal);

  // ---- Vision Board ----
  addVisionBtn.addEventListener('click', addVisionCard);

  // ---- Class Schedule ----
  addClassBtn.addEventListener('click', addClass);

  // ---- Settings ----
  soundToggle.addEventListener('change', () => {
    soundEnabled = soundToggle.checked;
    save(KEY_SOUND, soundEnabled);
  });

  notifToggle.addEventListener('change', () => {
    if (notifToggle.checked) requestNotifPermission();
    else { notifEnabled = false; updateNotifStatus(); }
  });

  requestNotifBtn.addEventListener('click', requestNotifPermission);

  testAddSound.addEventListener('click',      () => playSound('add'));
  testCompleteSound.addEventListener('click', () => playSound('complete'));
  testDeleteSound.addEventListener('click',   () => playSound('delete'));

  // ---- Background Upload ----
  bgUploadInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target.result;
      localStorage.setItem(KEY_BG, dataUrl);
      applyBackground(dataUrl);
    };
    reader.readAsDataURL(file);
  });

  bgClearBtn.addEventListener('click', () => {
    localStorage.removeItem(KEY_BG);
    applyBackground(null);
  });

  // ---- Reset All ----
  resetAllBtn.addEventListener('click', () => {
    if (!confirm('⚠️ This will permanently delete ALL your data (tasks, habits, goals, schedule, settings). Are you sure?')) return;
    [KEY_TASKS, KEY_HABITS, KEY_GOALS, KEY_TRACKED, KEY_VISION, KEY_CLASSES, KEY_XP, KEY_POMO, KEY_THEME, KEY_SOUND, KEY_NOTIF, KEY_BG, KEY_REWARDS, KEY_REWARD_DATE].forEach(k => localStorage.removeItem(k));
    location.reload();
  });
}


/* ============================================================
   29. INITIALISATION
   ============================================================ */
function init() {
  // Load all persisted data
  tasks        = load(KEY_TASKS,   []);
  habits       = load(KEY_HABITS,  []);
  goals        = load(KEY_GOALS,   { daily: [], weekly: [], monthly: [] });
  trackedGoals = load(KEY_TRACKED, []);
  visionCards  = load(KEY_VISION,  []);
  classes      = load(KEY_CLASSES, []);
  totalXP      = load(KEY_XP,      0);

  // Ensure goals has all 3 periods
  if (!goals.daily)   goals.daily   = [];
  if (!goals.weekly)  goals.weekly  = [];
  if (!goals.monthly) goals.monthly = [];

  // Apply saved settings
  loadTheme();
  loadBackground();
  loadSettings();

  // Prune stale period goals
  pruneOldGoals();

  // Initial renders
  renderTasks();
  renderHabits();
  renderAllGoals();
  renderTrackedGoals();
  renderVisionBoard();
  renderSchedule();
  updateLevelUI();
  updateGoalDateLabels();

  // Pomodoro
  loadPomoSessions();
  setPomoMode('study');

  // SVG gradient for pomo ring (injected inline)
  const svg = document.querySelector('.pomo-ring');
  if (svg) {
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const grad = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
    grad.id = 'pomoGrad';
    grad.setAttribute('x1', '0%'); grad.setAttribute('y1', '0%');
    grad.setAttribute('x2', '100%'); grad.setAttribute('y2', '100%');
    const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop1.setAttribute('offset', '0%'); stop1.setAttribute('stop-color', '#7c6ef6');
    const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop2.setAttribute('offset', '100%'); stop2.setAttribute('stop-color', '#a78bfa');
    grad.appendChild(stop1); grad.appendChild(stop2);
    defs.appendChild(grad); svg.prepend(defs);
  }

  // Motivational quote
  showRandomQuote();

  // Notifications check
  updateNotifStatus();
  checkDueTodayNotifications();

  // Real-time update loop (every 60 seconds)
  setInterval(realTimeUpdate, 60000);

  // Reward date check
  const rewardDate = localStorage.getItem(KEY_REWARD_DATE);
  if (rewardDate !== getTodayStr()) {
    rewardsMilestonesFired = {};
    localStorage.setItem(KEY_REWARD_DATE, getTodayStr());
    save(KEY_REWARDS, {});
  } else {
    rewardsMilestonesFired = load(KEY_REWARDS, {});
  }

  // Register all event listeners
  setupEventListeners();

  // Focus task input
  if (taskInput) taskInput.focus();

  console.log(`✦ TaskFlow Pro initialised. ${tasks.length} tasks | ${habits.length} habits | XP: ${totalXP}`);
}

// 🚀 Kick off!
init();
