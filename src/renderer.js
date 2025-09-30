// ------- Projects -------
let projects = []; // {id, name, aim, createdAt, totalTime, sessionCount, notes}
let currentProject = null;

// ------- Timer -------
let elapsedMs = 0;
let ticking = false;
let lastTick = null;
let sessionCount = 0;
let totalTimeMs = 0;

// DOM Elements - Timer
const display = document.getElementById("display");
const btnToggle = document.getElementById("btnToggle");
const btnReset = document.getElementById("btnReset");
const btnAddNote = document.getElementById("btnAddNote");
const timerStatus = document.getElementById("timerStatus");
const sessionCountEl = document.getElementById("sessionCount");
const totalTimeEl = document.getElementById("totalTime");
const noteCountEl = document.getElementById("noteCount");
const progressRing = document.querySelector(".progress-ring-fill");

// DOM Elements - Projects
const projectListView = document.getElementById("projectListView");
const timerView = document.getElementById("timerView");
const addProjectForm = document.getElementById("addProjectForm");
const btnAddProject = document.getElementById("btnAddProject");
const btnDeleteAllProjects = document.getElementById("btnDeleteAllProjects");
const projectName = document.getElementById("projectName");
const projectAim = document.getElementById("projectAim");
const saveProjectBtn = document.getElementById("saveProject");
const cancelProjectBtn = document.getElementById("cancelProject");
const cancelProjectAlt = document.getElementById("cancelProjectAlt");
const projectsList = document.getElementById("projectsList");
const projectsEmpty = document.getElementById("projectsEmpty");
const backToProjects = document.getElementById("backToProjects");
const currentProjectName = document.getElementById("currentProjectName");
const showProjectAim = document.getElementById("showProjectAim");
const projectAimModal = document.getElementById("projectAimModal");
const projectAimText = document.getElementById("projectAimText");
const closeAimModal = document.getElementById("closeAimModal");

// ------- Project Management Functions -------
function createProject(name, aim) {
  const project = {
    id: crypto.randomUUID(),
    name: name.trim(),
    aim: aim.trim(),
    createdAt: Date.now(),
    totalTime: 0,
    sessionCount: 0,
    notes: []
  };
  
  projects.unshift(project);
  saveProjects();
  return project;
}

function getProject(id) {
  return projects.find(p => p.id === id);
}

function formatDate(timestamp) {
  return new Date(timestamp).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

function formatProjectTime(ms) {
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    return `${minutes}m`;
  } else {
    return '0m';
  }
}

function deleteProject(projectId) {
  const project = getProject(projectId);
  if (!project) return;
  
  const confirmMessage = `Are you sure you want to delete "${project.name}"?\n\nThis will permanently delete:\n• ${formatProjectTime(project.totalTime)} of tracked time\n• ${project.sessionCount} sessions\n• ${project.notes.length} notes\n\nThis action cannot be undone.`;
  
  if (confirm(confirmMessage)) {
    // If deleting the current project, reset the timer view
    if (currentProject && currentProject.id === projectId) {
      currentProject = null;
      // Reset timer state
      elapsedMs = 0;
      ticking = false;
      sessionCount = 0;
      totalTimeMs = 0;
      notes = [];
      renderTime();
      renderNotes();
      updateSessionStats();
    }
    
    // Remove project from array
    projects = projects.filter(p => p.id !== projectId);
    saveProjects();
    renderProjects();
    
    showNotification("Project deleted successfully", "info");
    
    // If no projects left, show project list
    if (projects.length === 0) {
      showProjectListView();
    }
  }
}

function switchToProject(projectId) {
  const project = getProject(projectId);
  if (!project) return;
  
  // Save current project state if we have one
  if (currentProject) {
    saveCurrentProjectState();
  }
  
  // Switch to new project
  currentProject = project;
  loadProjectState(project);
  showTimerView();
}

function saveCurrentProjectState() {
  if (!currentProject) return;
  
  // Update project with current timer state
  currentProject.totalTime += elapsedMs;
  currentProject.sessionCount = sessionCount;
  currentProject.notes = [...notes];
  
  saveProjects();
}

function loadProjectState(project) {
  // Reset timer state
  elapsedMs = 0;
  ticking = false;
  
  // Load project-specific data
  sessionCount = project.sessionCount;
  totalTimeMs = project.totalTime;
  notes = [...project.notes];
  
  // Update UI
  currentProjectName.textContent = project.name;
  projectAimText.textContent = project.aim;
  
  // Reset timer display
  btnToggle.innerHTML = '<span class="btn-icon">▶️</span><span class="btn-text">Start</span>';
  updateTimerStatus("Ready to start");
  renderTime();
  renderNotes();
}

// Progress ring configuration
const PROGRESS_RADIUS = 90;
const PROGRESS_CIRCUMFERENCE = 2 * Math.PI * PROGRESS_RADIUS;
const MAX_PROGRESS_TIME = 60 * 60 * 1000; // 1 hour in milliseconds

function format(ms) {
  const totalSec = Math.floor(ms / 1000);
  const h = String(Math.floor(totalSec / 3600)).padStart(2, "0");
  const m = String(Math.floor((totalSec % 3600) / 60)).padStart(2, "0");
  const s = String(totalSec % 60).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

function updateProgressRing() {
  if (!progressRing) return;
  const progress = Math.min(elapsedMs / MAX_PROGRESS_TIME, 1);
  const offset = PROGRESS_CIRCUMFERENCE - progress * PROGRESS_CIRCUMFERENCE;
  progressRing.style.strokeDashoffset = offset;
}

function updateSessionStats() {
  if (sessionCountEl) sessionCountEl.textContent = sessionCount;
  if (totalTimeEl) totalTimeEl.textContent = format(totalTimeMs + elapsedMs);
  if (noteCountEl) noteCountEl.textContent = notes.length;
}

function updateTimerStatus(status) {
  if (timerStatus) {
    timerStatus.textContent = status;
    timerStatus.className = ticking ? "timer-status active" : "timer-status";
  }
}

function renderTime() {
  display.textContent = format(elapsedMs);
  updateProgressRing();
  updateSessionStats();
}

function tick() {
  if (!ticking) return;
  const now = performance.now();
  elapsedMs += now - lastTick;
  lastTick = now;
  renderTime();
  requestAnimationFrame(tick);
}

btnToggle.addEventListener("click", () => {
  if (!currentProject) {
    showNotification("Please select a project first", "warning");
    return;
  }
  
  if (!ticking) {
    ticking = true;
    lastTick = performance.now();
    btnToggle.innerHTML =
      '<span class="btn-icon">⏸️</span><span class="btn-text">Pause</span>';
    updateTimerStatus("Timer is running...");
    requestAnimationFrame(tick);
  } else {
    ticking = false;
    btnToggle.innerHTML =
      '<span class="btn-icon">▶️</span><span class="btn-text">Start</span>';
    updateTimerStatus("Timer paused");

    // If there's elapsed time, count as a session
    if (elapsedMs > 0) {
      sessionCount++;
      totalTimeMs += elapsedMs;
    }
  }
  saveState();
});

btnReset.addEventListener("click", () => {
  if (!currentProject) {
    showNotification("Please select a project first", "warning");
    return;
  }
  
  const wasRunning = ticking;
  ticking = false;

  // Count session if timer was running or had elapsed time
  if (wasRunning && elapsedMs > 0) {
    sessionCount++;
    totalTimeMs += elapsedMs;
  }

  elapsedMs = 0;
  btnToggle.innerHTML =
    '<span class="btn-icon">▶️</span><span class="btn-text">Start</span>';
  updateTimerStatus("Ready to start");
  renderTime();
  saveState();
});

// ------- Notes -------
const noteEditor = document.getElementById("noteEditor");
const noteTime = document.getElementById("noteTime");
const noteText = document.getElementById("noteText");
const noteStatus = document.getElementById("noteStatus");
const noteCategory = document.getElementById("noteCategory");
const saveNoteBtn = document.getElementById("saveNote");
const cancelNoteBtn = document.getElementById("cancelNote");
const cancelNoteAlt = document.getElementById("cancelNoteAlt");

const notesUl = document.getElementById("notes");
const notesEmpty = document.getElementById("notesEmpty");
const filterStatus = document.getElementById("filterStatus");
const filterCategory = document.getElementById("filterCategory");
const searchNotes = document.getElementById("searchNotes");
const clearAllBtn = document.getElementById("clearAll");
const exportNotes = document.getElementById("exportNotes");

let notes = []; // {id, timeMs, text, status, category}

// Note templates
const noteTemplates = {
  task: "Started working on: ",
  break: "Taking a break - ",
  meeting: "Meeting with: ",
};

btnAddNote.addEventListener("click", () => {
  if (!currentProject) {
    showNotification("Please select a project first", "warning");
    return;
  }
  
  noteTime.value = format(elapsedMs);
  noteText.value = "";
  noteStatus.value = "new";
  if (noteCategory) noteCategory.value = "general";
  noteEditor.hidden = false;
  noteText.focus();
});

cancelNoteBtn.addEventListener("click", () => (noteEditor.hidden = true));
if (cancelNoteAlt)
  cancelNoteAlt.addEventListener("click", () => (noteEditor.hidden = true));

// Quick template buttons
document.querySelectorAll(".quick-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const template = btn.dataset.template;
    if (noteTemplates[template]) {
      noteText.value = noteTemplates[template];
      if (noteCategory) noteCategory.value = template;
      noteText.focus();
      noteText.setSelectionRange(noteText.value.length, noteText.value.length);
    }
  });
});

saveNoteBtn.addEventListener("click", () => {
  const text = noteText.value.trim();
  if (!text) {
    noteText.focus();
    return;
  }

  const n = {
    id: crypto.randomUUID(),
    timeMs: elapsedMs,
    text: text,
    status: noteStatus.value,
    category: noteCategory ? noteCategory.value : "general",
    timestamp: Date.now(),
  };
  notes.unshift(n);
  noteEditor.hidden = true;
  renderNotes();
  updateSessionStats();
  saveState();

  // Show success feedback
  showNotification("Note saved successfully!", "success");
});

filterStatus.addEventListener("change", renderNotes);
if (filterCategory) filterCategory.addEventListener("change", renderNotes);
if (searchNotes)
  searchNotes.addEventListener("input", debounce(renderNotes, 300));

clearAllBtn.addEventListener("click", () => {
  if (
    confirm(
      "Are you sure you want to clear all notes? This action cannot be undone."
    )
  ) {
    notes = [];
    renderNotes();
    updateSessionStats();
    saveState();
    showNotification("All notes cleared", "info");
  }
});

if (exportNotes) {
  exportNotes.addEventListener("click", () => {
    exportNotesToFile();
  });
}

// Utility function for debouncing
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function badgeClass(status) {
  return status === "done"
    ? "done"
    : status === "processing"
    ? "processing"
    : "new";
}

function getCategoryIcon(category) {
  const icons = {
    general: "📄",
    task: "✅",
    milestone: "🎯",
    break: "☕",
    meeting: "👥",
  };
  return icons[category] || "📄";
}

function getCategoryLabel(category) {
  const labels = {
    general: "General",
    task: "Task",
    milestone: "Milestone",
    break: "Break",
    meeting: "Meeting",
  };
  return labels[category] || "General";
}

function renderNotes() {
  const statusFilter = filterStatus.value;
  const categoryFilter = filterCategory ? filterCategory.value : "all";
  const searchTerm = searchNotes ? searchNotes.value.toLowerCase().trim() : "";

  const filteredNotes = notes.filter((n) => {
    const matchesStatus = statusFilter === "all" || n.status === statusFilter;
    const matchesCategory =
      categoryFilter === "all" || (n.category || "general") === categoryFilter;
    const matchesSearch =
      !searchTerm || n.text.toLowerCase().includes(searchTerm);
    return matchesStatus && matchesCategory && matchesSearch;
  });

  notesUl.innerHTML = "";

  if (filteredNotes.length === 0) {
    if (notesEmpty) {
      notesEmpty.hidden = false;
      if (searchTerm) {
        notesEmpty.innerHTML = `
          <div class="empty-icon">🔍</div>
          <p>No notes found</p>
          <small>Try adjusting your search or filters</small>
        `;
      } else if (notes.length === 0) {
        notesEmpty.innerHTML = `
          <div class="empty-icon">📝</div>
          <p>No notes yet</p>
          <small>Click "Add Note" to create your first note</small>
        `;
      } else {
        notesEmpty.innerHTML = `
          <div class="empty-icon">🔍</div>
          <p>No notes match your filters</p>
          <small>Try adjusting your search or filters</small>
        `;
      }
    }
    return;
  }

  if (notesEmpty) notesEmpty.hidden = true;

  filteredNotes.forEach((n) => {
    const li = document.createElement("li");
    li.className = "note";
    li.innerHTML = `
      <div class="meta">
        <div class="row">
          <span class="time-badge">🕒 ${format(n.timeMs)}</span>
          <div style="display: flex; gap: 8px; align-items: center;">
            <span class="category-badge">${getCategoryIcon(
              n.category || "general"
            )} ${getCategoryLabel(n.category || "general")}</span>
            <span class="badge ${badgeClass(n.status)}">${label(
      n.status
    )}</span>
          </div>
        </div>
        <div class="actions">
          <button data-action="duplicate" title="Duplicate note">📋</button>
          <button data-action="delete" title="Delete note">🗑️</button>
        </div>
      </div>
      <div>
        <textarea rows="2">${escapeHtml(n.text)}</textarea>
      </div>
      <div class="row">
        <div style="display: flex; gap: 12px; align-items: center;">
          <label>Status:</label>
          <select>
            <option value="new" ${
              n.status === "new" ? "selected" : ""
            }>🆕 Just created</option>
            <option value="processing" ${
              n.status === "processing" ? "selected" : ""
            }>⏳ In progress</option>
            <option value="done" ${
              n.status === "done" ? "selected" : ""
            }>✅ Completed</option>
          </select>
        </div>
      </div>
    `;

    // Wire up interactions
    const textarea = li.querySelector("textarea");
    textarea.addEventListener("input", () => {
      n.text = textarea.value;
      saveStateDebounced();
    });

    const select = li.querySelector("select");
    select.addEventListener("change", () => {
      n.status = select.value;
      renderNotes();
      updateSessionStats();
      saveState();
      showNotification("Note status updated", "success");
    });

    li.querySelector('[data-action="delete"]').addEventListener("click", () => {
      if (confirm("Are you sure you want to delete this note?")) {
        notes = notes.filter((x) => x.id !== n.id);
        renderNotes();
        updateSessionStats();
        saveState();
        showNotification("Note deleted", "info");
      }
    });

    li.querySelector('[data-action="duplicate"]').addEventListener(
      "click",
      () => {
        const duplicate = {
          id: crypto.randomUUID(),
          timeMs: elapsedMs,
          text: n.text + " (copy)",
          status: "new",
          category: n.category || "general",
          timestamp: Date.now(),
        };
        notes.unshift(duplicate);
        renderNotes();
        updateSessionStats();
        saveState();
        showNotification("Note duplicated", "success");
      }
    );

    notesUl.appendChild(li);
  });
}

function label(status) {
  if (status === "done") return "Completed";
  if (status === "processing") return "Processing";
  return "Just created";
}

function escapeHtml(s) {
  return s.replace(
    /[&<>"']/g,
    (m) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[
        m
      ])
  );
}

// Export functionality
function exportNotesToFile() {
  if (notes.length === 0) {
    showNotification("No notes to export", "warning");
    return;
  }

  const exportData = {
    exportDate: new Date().toISOString(),
    sessionStats: {
      sessionCount,
      totalTime: format(totalTimeMs + elapsedMs),
      noteCount: notes.length,
    },
    notes: notes.map((n) => ({
      time: format(n.timeMs),
      text: n.text,
      status: label(n.status),
      category: getCategoryLabel(n.category || "general"),
      timestamp: new Date(n.timestamp || Date.now()).toISOString(),
    })),
  };

  const dataStr = JSON.stringify(exportData, null, 2);
  const dataBlob = new Blob([dataStr], { type: "application/json" });

  const link = document.createElement("a");
  link.href = URL.createObjectURL(dataBlob);
  link.download = `projectclock-export-${new Date().toISOString().split("T")[0]}.json`;
  link.click();

  showNotification("Notes exported successfully!", "success");
}

// Notification system
function showNotification(message, type = "info") {
  const notification = document.createElement("div");
  notification.className = `notification notification-${type}`;
  notification.textContent = message;

  // Add notification styles if not already added
  if (!document.querySelector("#notification-styles")) {
    const style = document.createElement("style");
    style.id = "notification-styles";
    style.textContent = `
      .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 24px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 1000;
        animation: slideInRight 0.3s ease-out;
      }
      .notification-success { background: var(--success); }
      .notification-info { background: var(--accent-primary); }
      .notification-warning { background: var(--warning); }
      .notification-error { background: var(--danger); }
      @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
  }

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = "slideInRight 0.3s ease-out reverse";
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// ------- Project List Functionality -------
function closeAllModals() {
  if (projectAimModal) projectAimModal.hidden = true;
  if (addProjectForm) addProjectForm.hidden = true;
  if (noteEditor) noteEditor.hidden = true;
}

function renderProjects() {
  // Show/hide delete all button based on project count
  if (btnDeleteAllProjects) {
    btnDeleteAllProjects.hidden = projects.length === 0;
  }
  
  if (projects.length === 0) {
    projectsEmpty.hidden = false;
    projectsList.innerHTML = "";
    return;
  }
  
  projectsEmpty.hidden = true;
  projectsList.innerHTML = "";
  
  projects.forEach(project => {
    const card = document.createElement("div");
    card.className = "project-card";
    card.onclick = () => switchToProject(project.id);
    
    card.innerHTML = `
      <div class="project-card-header">
        <h3 class="project-name">${escapeHtml(project.name)}</h3>
        <button class="delete-project-btn" data-project-id="${project.id}" title="Delete Project">
          <span class="btn-icon">🗑️</span>
        </button>
      </div>
      <div class="project-stats">
        <div class="project-stat">
          <span class="project-stat-value">${formatProjectTime(project.totalTime)}</span>
          <span class="project-stat-label">Time</span>
        </div>
        <div class="project-stat">
          <span class="project-stat-value">${project.sessionCount}</span>
          <span class="project-stat-label">Sessions</span>
        </div>
        <div class="project-stat">
          <span class="project-stat-value">${project.notes.length}</span>
          <span class="project-stat-label">Notes</span>
        </div>
      </div>
      <div class="project-created">Created ${formatDate(project.createdAt)}</div>
    `;
    
    // Add event listener for delete button
    const deleteBtn = card.querySelector('.delete-project-btn');
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent card click
      deleteProject(project.id);
    });
    
    projectsList.appendChild(card);
  });
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function showProjectListView() {
  projectListView.hidden = false;
  timerView.hidden = true;
  addProjectForm.hidden = true;
  renderProjects();
}

function showTimerView() {
  projectListView.hidden = true;
  timerView.hidden = false;
  addProjectForm.hidden = true;
}

function showAddProjectForm() {
  projectListView.hidden = true;
  timerView.hidden = true;
  addProjectForm.hidden = false;
  projectName.focus();
}

// Project Event Listeners
btnAddProject.addEventListener("click", showAddProjectForm);

if (btnDeleteAllProjects) {
  btnDeleteAllProjects.addEventListener("click", () => {
    if (projects.length === 0) return;
    
    const totalTime = projects.reduce((sum, p) => sum + p.totalTime, 0);
    const totalSessions = projects.reduce((sum, p) => sum + p.sessionCount, 0);
    const totalNotes = projects.reduce((sum, p) => sum + p.notes.length, 0);
    
    const confirmMessage = `Are you sure you want to delete ALL ${projects.length} projects?\n\nThis will permanently delete:\n• ${formatProjectTime(totalTime)} of total tracked time\n• ${totalSessions} sessions\n• ${totalNotes} notes\n\nThis action cannot be undone.`;
    
    if (confirm(confirmMessage)) {
      // Reset current project if any
      currentProject = null;
      elapsedMs = 0;
      ticking = false;
      sessionCount = 0;
      totalTimeMs = 0;
      notes = [];
      
      // Clear all projects
      projects = [];
      saveProjects();
      
      // Update UI
      renderTime();
      renderNotes();
      updateSessionStats();
      renderProjects();
      
      showNotification("All projects deleted", "info");
    }
  });
}

cancelProjectBtn.addEventListener("click", () => {
  projectName.value = "";
  projectAim.value = "";
  showProjectListView();
});

cancelProjectAlt.addEventListener("click", () => {
  projectName.value = "";
  projectAim.value = "";
  showProjectListView();
});

saveProjectBtn.addEventListener("click", () => {
  const name = projectName.value.trim();
  const aim = projectAim.value.trim();
  
  if (!name) {
    projectName.focus();
    showNotification("Please enter a project name", "warning");
    return;
  }
  
  const project = createProject(name, aim);
  projectName.value = "";
  projectAim.value = "";
  
  showNotification("Project created successfully!", "success");
  showProjectListView();
});

backToProjects.addEventListener("click", () => {
  if (currentProject) {
    saveCurrentProjectState();
  }
  currentProject = null;
  showProjectListView();
});

if (showProjectAim) {
  showProjectAim.addEventListener("click", () => {
    if (projectAimModal) {
      projectAimModal.hidden = false;
    }
  });
}

if (closeAimModal) {
  closeAimModal.addEventListener("click", () => {
    if (projectAimModal) {
      projectAimModal.hidden = true;
    }
  });
}

// Close modal when clicking outside
if (projectAimModal) {
  projectAimModal.addEventListener("click", (e) => {
    if (e.target === projectAimModal) {
      projectAimModal.hidden = true;
    }
  });
}

// Global modal close handler
document.addEventListener("click", (e) => {
  // Close project aim modal if clicking outside
  if (projectAimModal && !projectAimModal.hidden) {
    const modalContent = projectAimModal.querySelector(".modal-content");
    if (modalContent && !modalContent.contains(e.target) && !showProjectAim.contains(e.target)) {
      projectAimModal.hidden = true;
    }
  }
});

// ------- Persistence -------
const STORAGE_KEY = "projectclock_app_v2";
const PROJECTS_STORAGE_KEY = "projectclock_projects_v1";

function saveState() {
  // Only save state if we have a current project
  if (currentProject) {
    currentProject.totalTime += elapsedMs;
    currentProject.sessionCount = sessionCount;
    currentProject.notes = [...notes];
    saveProjects();
  } else {
    // Legacy fallback for non-project data
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        elapsedMs,
        ticking,
        notes,
        sessionCount,
        totalTimeMs,
      })
    );
  }
}

function saveProjects() {
  localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(projects));
}

function loadProjects() {
  const raw = localStorage.getItem(PROJECTS_STORAGE_KEY);
  if (raw) {
    try {
      projects = JSON.parse(raw);
      return true;
    } catch (error) {
      console.warn("Failed to load projects:", error);
    }
  }
  return false;
}

let saveTimer = null;
function saveStateDebounced() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(saveState, 300);
}

function loadState() {
  // First load projects
  const hasProjects = loadProjects();
  
  // Check for legacy data to migrate
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw && !hasProjects) {
    try {
      const s = JSON.parse(raw);
      
      // Migrate old data to a default project
      if (s.notes && s.notes.length > 0 || s.sessionCount > 0 || s.totalTimeMs > 0) {
        const migrationProject = createProject(
          "Legacy Project", 
          "Migrated from previous version of the app"
        );
        
        // Migrate old notes to include category if missing
        const migratedNotes = Array.isArray(s.notes) ? s.notes.map((note) => ({
          ...note,
          category: note.category || "general",
          timestamp: note.timestamp || Date.now(),
        })) : [];
        
        migrationProject.totalTime = s.totalTimeMs || 0;
        migrationProject.sessionCount = s.sessionCount || 0;
        migrationProject.notes = migratedNotes;
        
        saveProjects();
        
        // Clear old storage
        localStorage.removeItem(STORAGE_KEY);
        
        showNotification("Data migrated to new project system!", "info");
      }
    } catch (error) {
      console.warn("Failed to migrate legacy data:", error);
    }
  }
  
  // Reset state
  elapsedMs = 0;
  ticking = false;
  sessionCount = 0;
  totalTimeMs = 0;
  notes = [];
  
  renderTime();
  renderNotes();
  updateSessionStats();
}

// Keyboard shortcuts
document.addEventListener("keydown", (e) => {
  if (e.ctrlKey || e.metaKey) {
    switch (e.key) {
      case " ":
        e.preventDefault();
        btnToggle.click();
        break;
      case "r":
        e.preventDefault();
        btnReset.click();
        break;
      case "n":
        e.preventDefault();
        btnAddNote.click();
        break;
      case "e":
        if (exportNotes) {
          e.preventDefault();
          exportNotes.click();
        }
        break;
      case "p":
        e.preventDefault();
        if (!projectListView.hidden) {
          btnAddProject.click();
        } else {
          backToProjects.click();
        }
        break;

    }
  }

  // ESC to close modals and forms
  if (e.key === "Escape") {
    if (!noteEditor.hidden) {
      noteEditor.hidden = true;
    } else if (!addProjectForm.hidden) {
      cancelProjectBtn.click();
    } else if (!projectAimModal.hidden) {
      projectAimModal.hidden = true;
    }
  }
});

// Initialize app
loadState();
renderTime();
renderNotes();
updateSessionStats();
closeAllModals();

// Show appropriate view
if (projects.length === 0) {
  showProjectListView();
  // Show helpful tip for new users
  setTimeout(() => {
    showNotification("👋 Welcome! Create your first project to get started", "info");
  }, 1000);
} else {
  showProjectListView();
  // Show keyboard shortcuts tip
  setTimeout(() => {
    showNotification("💡 Tip: Use Ctrl+Space to start/pause timer", "info");
  }, 2000);
}
