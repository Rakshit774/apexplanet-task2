/* =============================================================
   DAYBOOK — script.js
   Vanilla JavaScript only. No frameworks, no external libraries.
   Two independent features:
     1. Contact form validation
     2. Dynamic to-do list (add / complete / delete / filter)
   ============================================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* ===========================================================
     1. CONTACT FORM VALIDATION
     =========================================================== */
  const contactForm = document.getElementById('contact-form');
  const formSuccess = document.getElementById('form-success');

  // Map of field name -> validation rule
  const fieldRules = {
    name: {
      validate: (value) => value.trim().length > 0,
      message: 'Please enter your name.',
    },
    email: {
      validate: (value) => value.trim().length > 0 && isValidEmail(value.trim()),
      message: (value) => (value.trim().length === 0
        ? 'Please enter your email address.'
        : 'Please enter a valid email address (e.g. name@example.com).'),
    },
    subject: {
      validate: (value) => value.trim().length > 0,
      message: 'Please enter a subject.',
    },
    message: {
      validate: (value) => value.trim().length > 0,
      message: 'Please write a short message.',
    },
  };

  // Simple, reliable email format check
  function isValidEmail(value) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(value);
  }

  // Validate a single field and show/hide its error message
  function validateField(inputEl) {
    const rule = fieldRules[inputEl.name];
    if (!rule) return true;

    const fieldWrapper = inputEl.closest('.field');
    const errorEl = document.getElementById(`${inputEl.name}-error`);
    const value = inputEl.value;
    const isValid = rule.validate(value);

    if (!isValid) {
      const message = typeof rule.message === 'function' ? rule.message(value) : rule.message;
      errorEl.textContent = message;
      fieldWrapper.classList.add('has-error');
    } else {
      errorEl.textContent = '';
      fieldWrapper.classList.remove('has-error');
    }

    return isValid;
  }

  // Validate on blur, so users get feedback as they move through the form
  ['name', 'email', 'subject', 'message'].forEach((fieldName) => {
    const inputEl = document.getElementById(fieldName);
    inputEl.addEventListener('blur', () => validateField(inputEl));
    // Clear the error as soon as the user starts correcting it
    inputEl.addEventListener('input', () => {
      if (inputEl.closest('.field').classList.contains('has-error')) {
        validateField(inputEl);
      }
    });
  });

  contactForm.addEventListener('submit', (event) => {
    event.preventDefault();
    formSuccess.classList.remove('is-visible');

    const inputs = ['name', 'email', 'subject', 'message'].map((id) => document.getElementById(id));
    const results = inputs.map((inputEl) => validateField(inputEl));
    const allValid = results.every(Boolean);

    if (!allValid) {
      // Move focus to the first invalid field for accessibility/usability
      const firstInvalid = inputs.find((inputEl) => inputEl.closest('.field').classList.contains('has-error'));
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    // All checks passed — simulate a successful submission
    formSuccess.classList.add('is-visible');
    contactForm.reset();
  });


  /* ===========================================================
     2. DYNAMIC TO-DO LIST
     =========================================================== */
  const todoForm = document.getElementById('todo-form');
  const todoInput = document.getElementById('todo-input');
  const todoError = document.getElementById('todo-error');
  const todoList = document.getElementById('todo-list');
  const todoEmpty = document.getElementById('todo-empty');
  const todoCount = document.getElementById('todo-count');
  const filterButtons = document.querySelectorAll('.filter-btn');
  const progressFill = document.getElementById('progress-ring-fill');
  const progressLabel = document.getElementById('progress-ring-label');

  const CIRCLE_CIRCUMFERENCE = 169.6; // 2 * PI * radius(27), matches CSS

  // In-memory task store: { id, text, completed }
  let tasks = [];
  let currentFilter = 'all'; // 'all' | 'active' | 'completed'
  let nextId = 1;

  // Seed a couple of example tasks so the list isn't empty on load
  tasks = [
    { id: nextId++, text: 'Review the wireframes', completed: true },
    { id: nextId++, text: 'Reply to the client email', completed: false },
  ];

  function addTask(text) {
    tasks.push({ id: nextId++, text, completed: false });
    render();
  }

  function deleteTask(id) {
    tasks = tasks.filter((task) => task.id !== id);
    render();
  }

  function toggleTask(id) {
    const task = tasks.find((t) => t.id === id);
    if (task) task.completed = !task.completed;
    render();
  }

  function getVisibleTasks() {
    if (currentFilter === 'active') return tasks.filter((t) => !t.completed);
    if (currentFilter === 'completed') return tasks.filter((t) => t.completed);
    return tasks;
  }

  // Build one <li> element for a task
  function createTaskElement(task) {
    const li = document.createElement('li');
    li.className = 'todo-item' + (task.completed ? ' is-complete' : '');
    li.dataset.id = String(task.id);

    // Checkbox / completion toggle
    const checkbox = document.createElement('button');
    checkbox.type = 'button';
    checkbox.className = 'todo-item__checkbox';
    checkbox.setAttribute('aria-label', task.completed ? 'Mark task as active' : 'Mark task as completed');
    checkbox.innerHTML = `
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path d="M2 6l3 3 5-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`;
    checkbox.addEventListener('click', () => toggleTask(task.id));

    // Task text
    const span = document.createElement('span');
    span.className = 'todo-item__text';
    span.textContent = task.text;

    // Delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'todo-item__delete';
    deleteBtn.setAttribute('aria-label', `Delete task: ${task.text}`);
    deleteBtn.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>
      </svg>`;
    deleteBtn.addEventListener('click', () => deleteTask(task.id));

    li.appendChild(checkbox);
    li.appendChild(span);
    li.appendChild(deleteBtn);
    return li;
  }

  // Re-render the whole list, counts, empty state and progress ring
  function render() {
    const visibleTasks = getVisibleTasks();

    todoList.innerHTML = '';
    visibleTasks.forEach((task) => {
      todoList.appendChild(createTaskElement(task));
    });

    // Empty state message depends on whether there are ANY tasks at all
    // vs. simply none matching the current filter
    if (tasks.length === 0) {
      todoEmpty.textContent = 'Your list is empty. Add your first task above.';
      todoEmpty.classList.add('is-visible');
    } else if (visibleTasks.length === 0) {
      todoEmpty.textContent = `No ${currentFilter} tasks right now.`;
      todoEmpty.classList.add('is-visible');
    } else {
      todoEmpty.classList.remove('is-visible');
    }

    // Count summary
    const remaining = tasks.filter((t) => !t.completed).length;
    todoCount.textContent = tasks.length === 0
      ? '0 tasks'
      : `${remaining} of ${tasks.length} task${tasks.length === 1 ? '' : 's'} left`;

    // Progress ring
    const completedCount = tasks.length - remaining;
    const percent = tasks.length === 0 ? 0 : Math.round((completedCount / tasks.length) * 100);
    const offset = CIRCLE_CIRCUMFERENCE - (CIRCLE_CIRCUMFERENCE * percent) / 100;
    progressFill.style.strokeDashoffset = String(offset);
    progressLabel.textContent = `${percent}%`;
  }

  // Handle new task submission
  todoForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const value = todoInput.value.trim();

    if (value.length === 0) {
      todoError.textContent = 'Please enter a task before adding it.';
      todoInput.focus();
      return;
    }

    todoError.textContent = '';
    addTask(value);
    todoInput.value = '';
    todoInput.focus();
  });

  // Clear the inline error as soon as the user starts typing again
  todoInput.addEventListener('input', () => {
    if (todoError.textContent) todoError.textContent = '';
  });

  // Filter button handling
  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      filterButtons.forEach((btn) => btn.classList.remove('is-active'));
      button.classList.add('is-active');
      currentFilter = button.dataset.filter;
      render();
    });
  });

  // Initial paint
  render();
});
