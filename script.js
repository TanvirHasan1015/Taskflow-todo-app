/**
 * ============================================================
 * TASKFLOW — script.js
 * Modern To-Do List Application
 *
 * TABLE OF CONTENTS
 * 1. State & Constants
 * 2. DOM Element References
 * 3. LocalStorage Helpers
 * 4. Render Functions
 * 5. Task Operations (add / toggle / delete)
 * 6. UI Update Helpers (stats, progress, footer)
 * 7. Filter Logic
 * 8. Event Listeners
 * 9. Initialisation
 * ============================================================
 */


/* ============================================================
   1. STATE & CONSTANTS
   The app's "memory" — everything the app needs to know is
   held in these variables.
   ============================================================ */

/**
 * The master array of task objects.
 * Each task has the shape:
 *   { id: string, text: string, completed: boolean, createdAt: number }
 */
let tasks = [];

/**
 * The currently active filter. Can be:
 *   'all' | 'active' | 'completed'
 */
let currentFilter = 'all';

/** LocalStorage key used to persist tasks between page loads. */
const STORAGE_KEY = 'taskflow_tasks';

/** Character limit for task text (matches the HTML maxlength). */
const MAX_CHARS = 120;

/** How many chars remaining before we warn the user. */
const CHAR_WARN_THRESHOLD = 20;


/* ============================================================
   2. DOM ELEMENT REFERENCES
   Cache references to DOM nodes we'll interact with often.
   Doing this once is faster than querying the DOM every time.
   ============================================================ */
const taskForm         = document.getElementById('task-form');
const taskInput        = document.getElementById('task-input');
const addBtn           = document.getElementById('add-btn');
const taskList         = document.getElementById('task-list');
const emptyState       = document.getElementById('empty-state');
const charCountEl      = document.getElementById('char-count');
const charCounterEl    = document.getElementById('char-counter');
const progressBar      = document.getElementById('progress-bar');
const statTotalNum     = document.getElementById('stat-total-num');
const statDoneNum      = document.getElementById('stat-done-num');
const footerRemaining  = document.getElementById('footer-remaining');
const clearCompletedBtn = document.getElementById('clear-completed-btn');
const filterTabs       = document.querySelectorAll('.filter-tab');


/* ============================================================
   3. LOCALSTORAGE HELPERS
   Simple functions to save and load tasks so they survive
   page refreshes.
   ============================================================ */

/**
 * Saves the current tasks array to localStorage as JSON.
 * Called every time the tasks array changes.
 */
function saveTasks() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (err) {
    // LocalStorage can fail in private/incognito mode — fail silently.
    console.warn('TaskFlow: Could not save tasks to localStorage.', err);
  }
}

/**
 * Loads tasks from localStorage.
 * Returns an empty array if nothing is saved yet (first visit).
 *
 * @returns {Array} Array of task objects.
 */
function loadTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.warn('TaskFlow: Could not load tasks from localStorage.', err);
    return [];
  }
}


/* ============================================================
   4. RENDER FUNCTIONS
   These functions build the HTML for each task and update
   what the user sees on screen.
   ============================================================ */

/**
 * Generates a unique ID string for each new task.
 * We use Date.now() plus a random suffix to avoid collisions.
 *
 * @returns {string} A unique ID like "task_1717123456789_4j2k".
 */
function generateId() {
  return `task_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

/**
 * Filters the tasks array based on the current filter setting.
 *
 * @returns {Array} Subset of tasks to display.
 */
function getFilteredTasks() {
  switch (currentFilter) {
    case 'active':
      return tasks.filter(t => !t.completed);
    case 'completed':
      return tasks.filter(t => t.completed);
    default: // 'all'
      return tasks;
  }
}

/**
 * Creates and returns a <li> DOM element for a single task.
 * This is called once per visible task when re-rendering the list.
 *
 * @param {Object} task - The task object { id, text, completed, createdAt }
 * @returns {HTMLElement} The fully constructed <li> element.
 */
function createTaskElement(task) {
  // Create the list item container
  const li = document.createElement('li');
  li.className = `task-item${task.completed ? ' completed' : ''}`;
  li.dataset.id = task.id;   // store the task's ID on the element for easy lookup

  // ---- Checkbox ----
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.className = 'task-checkbox';
  checkbox.checked = task.completed;
  checkbox.setAttribute('aria-label', `Mark "${task.text}" as ${task.completed ? 'incomplete' : 'complete'}`);
  // Toggle the task's completed state when the checkbox changes
  checkbox.addEventListener('change', () => toggleTask(task.id));

  // ---- Task Text Label ----
  const label = document.createElement('span');
  label.className = 'task-text';
  label.textContent = task.text;
  // Clicking the label also toggles the checkbox (for convenience)
  label.addEventListener('click', () => {
    checkbox.checked = !checkbox.checked;
    toggleTask(task.id);
  });

  // ---- Delete Button ----
  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'delete-btn';
  deleteBtn.innerHTML = '&#10005;';  // ✕ character
  deleteBtn.setAttribute('aria-label', `Delete task: ${task.text}`);
  deleteBtn.title = 'Delete task';
  // Trigger animated removal when clicked
  deleteBtn.addEventListener('click', () => removeTask(task.id, li));

  // Assemble the task item
  li.appendChild(checkbox);
  li.appendChild(label);
  li.appendChild(deleteBtn);

  return li;
}

/**
 * Re-renders the entire task list based on the current filter.
 * Also shows/hides the empty-state message as needed.
 * Called whenever tasks change or the filter changes.
 */
function renderTasks() {
  // Clear the current list
  taskList.innerHTML = '';

  const filteredTasks = getFilteredTasks();

  if (filteredTasks.length === 0) {
    // No tasks for this filter — show the empty state illustration
    emptyState.classList.add('visible');
    emptyState.setAttribute('aria-hidden', 'false');

    // Customise the empty state message per filter
    const icon = emptyState.querySelector('.empty-state__icon');
    const text = emptyState.querySelector('.empty-state__text');
    const hint = emptyState.querySelector('.empty-state__hint');

    if (currentFilter === 'completed') {
      icon.textContent = '✅';
      text.textContent = 'No completed tasks yet';
      hint.textContent = 'Check off some tasks to see them here';
    } else if (currentFilter === 'active') {
      icon.textContent = '🎉';
      text.textContent = "You're all caught up!";
      hint.textContent = 'All tasks are done — great job!';
    } else {
      icon.textContent = '🎯';
      text.textContent = 'No tasks here yet!';
      hint.textContent = 'Add a task above to get started';
    }
  } else {
    // Tasks exist — hide the empty state and render each task
    emptyState.classList.remove('visible');
    emptyState.setAttribute('aria-hidden', 'true');

    filteredTasks.forEach(task => {
      const el = createTaskElement(task);
      taskList.appendChild(el);
    });
  }

  // After rendering, update stats, progress bar, and footer
  updateStats();
  updateProgressBar();
  updateFooter();
}


/* ============================================================
   5. TASK OPERATIONS
   The core business logic: add, toggle, and remove tasks.
   ============================================================ */

/**
 * Adds a new task to the list.
 * Validates the input, creates a task object, and re-renders.
 *
 * @param {string} text - The raw text from the input field.
 */
function addTask(text) {
  // Trim whitespace
  const trimmed = text.trim();

  // Validate: don't add empty tasks
  if (!trimmed) {
    shakeInput();  // animate the input to signal an error
    return;
  }

  // Build the new task object
  const newTask = {
    id: generateId(),
    text: trimmed,
    completed: false,
    createdAt: Date.now(),
  };

  // Add to the front of the array so new tasks appear at the top
  tasks.unshift(newTask);

  // Persist and re-render
  saveTasks();
  renderTasks();

  // Clear the input and reset the char counter
  taskInput.value = '';
  updateCharCounter('');

  // Briefly animate the Add button for visual feedback
  addBtn.classList.add('btn-pop');
  addBtn.addEventListener('animationend', () => addBtn.classList.remove('btn-pop'), { once: true });

  // Return focus to the input for rapid task entry
  taskInput.focus();
}

/**
 * Toggles a task between completed and active states.
 *
 * @param {string} id - The unique ID of the task to toggle.
 */
function toggleTask(id) {
  // Find the task in our array and flip its completed flag
  const task = tasks.find(t => t.id === id);
  if (!task) return;

  task.completed = !task.completed;

  // Reflect the change on the DOM element without a full re-render
  const li = taskList.querySelector(`[data-id="${id}"]`);
  if (li) {
    li.classList.toggle('completed', task.completed);
  }

  // If we're filtering by active or completed, a re-render is needed
  // to remove the task from the current view
  if (currentFilter !== 'all') {
    renderTasks();
  }

  saveTasks();
  updateStats();
  updateProgressBar();
  updateFooter();
}

/**
 * Removes a task from the list with an animated exit.
 *
 * @param {string}      id - The unique ID of the task to remove.
 * @param {HTMLElement} el - The task's <li> DOM element.
 */
function removeTask(id, el) {
  // Add the exit animation class
  el.classList.add('removing');

  // Wait for the animation to finish, then remove from DOM and state
  el.addEventListener('animationend', () => {
    // Remove task from the array
    tasks = tasks.filter(t => t.id !== id);
    saveTasks();
    renderTasks();
  }, { once: true });
}

/**
 * Removes all completed tasks at once.
 * Triggered by the "Clear completed" footer button.
 */
function clearCompleted() {
  // Animate each completed task before removing
  const completedEls = taskList.querySelectorAll('.task-item.completed');

  if (completedEls.length === 0) return;

  // Add the removing class to all completed items simultaneously
  completedEls.forEach(el => el.classList.add('removing'));

  // After the last animation finishes, clean up state
  const lastEl = completedEls[completedEls.length - 1];
  lastEl.addEventListener('animationend', () => {
    tasks = tasks.filter(t => !t.completed);
    saveTasks();
    renderTasks();
  }, { once: true });
}


/* ============================================================
   6. UI UPDATE HELPERS
   Small functions to keep the stat pills, progress bar,
   and footer text in sync with the current tasks array.
   ============================================================ */

/**
 * Updates the "Total" and "Done" stat counters in the header.
 */
function updateStats() {
  const total     = tasks.length;
  const completed = tasks.filter(t => t.completed).length;

  statTotalNum.textContent = total;
  statDoneNum.textContent  = completed;
}

/**
 * Updates the animated horizontal progress bar.
 * The bar fills up as more tasks are completed.
 */
function updateProgressBar() {
  const total     = tasks.length;
  const completed = tasks.filter(t => t.completed).length;

  // Calculate percentage (0 if no tasks to avoid NaN)
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  progressBar.style.width       = `${percent}%`;
  progressBar.setAttribute('aria-valuenow', percent);
}

/**
 * Updates the footer text showing how many tasks are still active.
 */
function updateFooter() {
  const active = tasks.filter(t => !t.completed).length;
  footerRemaining.textContent = `${active} task${active !== 1 ? 's' : ''} remaining`;
}

/**
 * Updates the character counter below the input.
 * Warns the user (red text) when they're near the limit.
 *
 * @param {string} value - The current value of the task input.
 */
function updateCharCounter(value) {
  const len = value.length;
  charCountEl.textContent = len;

  // Show warning style when < CHAR_WARN_THRESHOLD characters remain
  const isNearLimit = len > MAX_CHARS - CHAR_WARN_THRESHOLD;
  charCounterEl.classList.toggle('near-limit', isNearLimit);
}

/**
 * Triggers a "shake" animation on the input to signal an error
 * (e.g., trying to add an empty task).
 */
function shakeInput() {
  taskInput.classList.add('input-shake');
  taskInput.addEventListener('animationend', () => {
    taskInput.classList.remove('input-shake');
  }, { once: true });
}


/* ============================================================
   7. FILTER LOGIC
   Handles switching between "All", "Active", and "Completed"
   filter views.
   ============================================================ */

/**
 * Sets the active filter and updates the UI accordingly.
 *
 * @param {string} filter - One of 'all', 'active', or 'completed'.
 */
function setFilter(filter) {
  currentFilter = filter;

  // Update the active class on the filter tab buttons
  filterTabs.forEach(tab => {
    const isActive = tab.dataset.filter === filter;
    tab.classList.toggle('filter-tab--active', isActive);
  });

  // Re-render the list with the new filter applied
  renderTasks();
}


/* ============================================================
   8. EVENT LISTENERS
   Wire up all interactive elements to their handler functions.
   ============================================================ */

/**
 * Handle form submission (pressing Enter or clicking the Add button).
 * We listen to the form's 'submit' event rather than the button's
 * 'click' so that pressing Enter also triggers it.
 */
taskForm.addEventListener('submit', (event) => {
  // Prevent the default browser form submission (which would reload the page)
  event.preventDefault();
  addTask(taskInput.value);
});

/**
 * Update the character counter every time the user types.
 */
taskInput.addEventListener('input', () => {
  updateCharCounter(taskInput.value);
});

/**
 * Wire up each filter tab button.
 * We read the filter name from the button's `data-filter` attribute.
 */
filterTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    setFilter(tab.dataset.filter);
  });
});

/**
 * "Clear completed" footer button.
 */
clearCompletedBtn.addEventListener('click', clearCompleted);


/* ============================================================
   9. INITIALISATION
   Runs once when the page loads.
   Load saved tasks from localStorage, then render the list.
   ============================================================ */

/**
 * Initialises the application.
 * Called automatically at the bottom of this script.
 */
function init() {
  // Load any previously saved tasks from localStorage
  tasks = loadTasks();

  // Render the initial task list (may be empty on first visit)
  renderTasks();

  // Focus the input so the user can start typing right away
  taskInput.focus();

  console.log(`TaskFlow initialised. Loaded ${tasks.length} task(s) from storage.`);
}

// Kick everything off!
init();
