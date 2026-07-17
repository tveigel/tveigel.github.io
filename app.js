/* Francesco's wallpad cleaning plan — intentionally dependency-free. */

const PLAN_VERSION = 4;
const STATE_STORAGE_KEY = 'francesco_wallpad_putzplan_v4';
const CUSTOM_TASKS_STORAGE_KEY = 'francesco_wallpad_custom_tasks_v1';
const PERSON_STORAGE_KEY = 'francesco_wallpad_person';
const ROOM_STORAGE_KEY = 'francesco_wallpad_room';
const PEOPLE = ['Tim', 'Alli'];
const PERSON_COLORS = { Tim: '#2d6cdf', Alli: '#e06a46' };

const ROOMS = [
    {
        id: 'kueche',
        name: 'Küche',
        icon: 'K',
        color: '#4f7c68',
        soft: '#e5f0ea',
        subtitle: 'Geräte, Oberflächen, Schränke und Boden',
        tasks: [
            { id: 'kueche-1', order: 1, title: 'Spülmaschine + Ofen sauber machen', detail: 'Innen und außen' },
            { id: 'kueche-2', order: 2, title: 'Ofenbleche sauber machen', detail: 'Alle Bleche gründlich reinigen' },
            { id: 'kueche-3', order: 3, title: 'Fensterbrett, Rahmen + Heizung', detail: 'Alles sauber machen' },
            { id: 'kueche-4', order: 4, title: 'Oberflächen abstauben + abwischen', detail: 'Z. B. Tische, Brotbox, Kaffeemaschine und Gewürz-/Ölfach' },
            { id: 'kueche-5', order: 5, title: 'Dunstabzugshaube reinigen', detail: 'Rausnehmen und gründlich sauber machen' },
            { id: 'kueche-6', order: 6, title: 'Abtropfstelle sauber machen', detail: 'Erst vollständig abräumen' },
            { id: 'kueche-7', order: 7, title: 'Spülbecken reinigen', detail: 'Auswischen, Sieb leeren und sauber machen' },
            { id: 'kueche-8', order: 8, title: 'Schränke inkl. Griffe wischen', detail: 'Fronten und Griffe mitnehmen' },
            { id: 'kueche-9', order: 9, title: 'Barhocker + Stühle abwischen', detail: 'Inkl. Füße abstauben bzw. abwischen' },
            { id: 'kueche-10', order: 10, title: 'Saugen und wischen', detail: 'Den kompletten Küchenboden' }
        ]
    },
    {
        id: 'klo',
        name: 'Klo',
        icon: 'WC',
        color: '#b95544',
        soft: '#f7e7e2',
        subtitle: 'Rot: WC · Blau: Oberflächen',
        tasks: [
            { id: 'klo-1', order: 1, title: 'Kloschüssel reinigen', detail: 'Mit Kloreiniger' },
            { id: 'klo-2', order: 2, title: 'Toilettenpapier auffüllen', detail: 'Ggf. in die Einkaufsliste eintragen' },
            { id: 'klo-3', order: 3, title: 'Seife auffüllen', detail: 'Vorrat prüfen' },
            { id: 'klo-4', order: 4, title: 'Müll wechseln', detail: 'Mülleimer auch abwischen' },
            { id: 'klo-5', order: 5, title: 'Handtuch wechseln', detail: 'Holzbrett ebenfalls abwischen' },
            { id: 'klo-6', order: 6, title: 'Toilette komplett abwischen', detail: 'Inkl. Sitz, Deckel und Spülschüssel' },
            { id: 'klo-7', order: 7, title: 'Waschbecken + Badspiegel', detail: 'Inkl. Wasserhahn' },
            { id: 'klo-8', order: 8, title: 'Saugen und wischen', detail: 'Den kompletten Boden' },
            { id: 'klo-9', order: 9, title: 'Lichtschalter + Türklinken desinfizieren', detail: 'Türklinken innen und außen' }
        ]
    },
    {
        id: 'bad',
        name: 'Bad',
        icon: 'B',
        color: '#b7832f',
        soft: '#f7edd4',
        subtitle: 'Gelb: Waschbecken und Dusche',
        tasks: [
            { id: 'bad-1', order: 1, title: 'Dusche komplett reinigen', detail: 'Wände, Armaturen, Boden, Abfluss, Duschköpfe und Ablage' },
            { id: 'bad-2', order: 2, title: 'Badspiegel putzen', detail: 'Auch oben drauf' },
            { id: 'bad-3', order: 3, title: 'Waschbecken reinigen', detail: 'Inkl. Wasserhahn, Unterseite, Badschrank; Sieb wechseln' },
            { id: 'bad-4', order: 4, title: 'Seife auffüllen', detail: 'Evtl. Zahnputzbecher auswechseln' },
            { id: 'bad-5', order: 5, title: 'Badvorleger + Handtuch wechseln', detail: 'Frische Textilien bereitlegen' },
            { id: 'bad-6', order: 6, title: 'Evtl. Flecken von der Wand entfernen', detail: 'Vor allem Spritzwasser' },
            { id: 'bad-7', order: 7, title: 'Saugen und wischen', detail: 'Auch unter dem Badschrank' },
            { id: 'bad-8', order: 8, title: 'Lichtschalter + Türklinken desinfizieren', detail: 'Türklinken innen und außen' }
        ]
    },
    {
        id: 'schlafzimmer',
        name: 'Schlafzimmer',
        icon: 'S',
        color: '#426f9b',
        soft: '#e5edf5',
        subtitle: 'Oberflächen, Spiegel und Boden',
        tasks: [
            { id: 'schlafzimmer-1', order: 1, title: 'Klamotten aufräumen', detail: 'Auch Sachen auf dem Schrank etc.' },
            { id: 'schlafzimmer-2', order: 2, title: 'Fensterbrett, Rahmen + Heizung', detail: 'Alles abstauben bzw. abwischen' },
            { id: 'schlafzimmer-3', order: 3, title: 'Schreibtisch, Kommode + Nachtschränke', detail: 'Auch den roten alten Schrank abstauben' },
            { id: 'schlafzimmer-4', order: 4, title: 'Spiegel putzen', detail: 'Streifenfrei' },
            { id: 'schlafzimmer-5', order: 5, title: 'Saugen und wischen', detail: 'Unter dem Bett, in Ritzen, hinter Nachtschränken und großem Schrank' }
        ]
    },
    {
        id: 'wohnzimmer',
        name: 'Wohnzimmer',
        icon: 'W',
        color: '#6b6195',
        soft: '#ece9f5',
        subtitle: 'Oberflächen, Textilien und Holzboden',
        tasks: [
            { id: 'wohnzimmer-1', order: 1, title: 'Fensterbrett, Rahmen + Heizung', detail: 'Alles abstauben bzw. abwischen' },
            { id: 'wohnzimmer-2', order: 2, title: 'Alle Oberflächen abstauben', detail: 'Z. B. TV-Schrank, Regal und Tische' },
            { id: 'wohnzimmer-3', order: 3, title: 'Spiegel putzen', detail: 'Streifenfrei' },
            { id: 'wohnzimmer-4', order: 4, title: 'Couch absaugen', detail: 'Ritzen und unter den Kissen mitnehmen' },
            { id: 'wohnzimmer-5', order: 5, title: 'Evtl. Kissenbezüge / Decke waschen', detail: 'Bei Bedarf in die Wäsche geben' },
            { id: 'wohnzimmer-6', order: 6, title: 'Fernsehtisch wischen', detail: 'Alle Fächer und Oberflächen' },
            { id: 'wohnzimmer-7', order: 7, title: 'Saugen und wischen', detail: 'Achtung Holz; auch beim Kleiderständer' }
        ]
    },
    {
        id: 'flur',
        name: 'Flur',
        icon: 'F',
        color: '#7a684f',
        soft: '#f0e9df',
        subtitle: 'Eingang, Garderobe und Boden',
        tasks: []
    }
];

const BASE_TASK_IDS = new Set(ROOMS.flatMap(function (room) {
    return room.tasks.map(function (task) { return task.id; });
}));

const elements = {
    appShell: document.getElementById('appShell'),
    todayLabel: document.getElementById('todayLabel'),
    progressRing: document.getElementById('progressRing'),
    progressPercent: document.getElementById('progressPercent'),
    progressHeadline: document.getElementById('progressHeadline'),
    progressCount: document.getElementById('progressCount'),
    syncStatus: document.getElementById('syncStatus'),
    roomRail: document.getElementById('roomRail'),
    roomPanel: document.getElementById('roomPanel'),
    roomIcon: document.getElementById('roomIcon'),
    roomTitle: document.getElementById('roomTitle'),
    roomSubtitle: document.getElementById('roomSubtitle'),
    roomScore: document.getElementById('roomScore'),
    addTaskButton: document.getElementById('addTaskButton'),
    taskList: document.getElementById('taskList'),
    lastUpdated: document.getElementById('lastUpdated'),
    celebration: document.getElementById('celebration'),
    resetModal: document.getElementById('resetModal'),
    resetButton: document.getElementById('resetButton'),
    cancelReset: document.getElementById('cancelReset'),
    confirmReset: document.getElementById('confirmReset'),
    addTaskModal: document.getElementById('addTaskModal'),
    addTaskForm: document.getElementById('addTaskForm'),
    addTaskRoom: document.getElementById('addTaskRoom'),
    addTaskTitle: document.getElementById('addTaskTitle'),
    addTaskDetail: document.getElementById('addTaskDetail'),
    cancelAddTask: document.getElementById('cancelAddTask'),
    customTaskManager: document.getElementById('customTaskManager'),
    customTaskList: document.getElementById('customTaskList'),
    closeCelebration: document.getElementById('closeCelebration'),
    toast: document.getElementById('toast')
};

let currentPerson = PEOPLE.indexOf(localStorage.getItem(PERSON_STORAGE_KEY)) >= 0
    ? localStorage.getItem(PERSON_STORAGE_KEY)
    : 'Tim';
let activeRoomId = ROOMS.some(function (room) { return room.id === localStorage.getItem(ROOM_STORAGE_KEY); })
    ? localStorage.getItem(ROOM_STORAGE_KEY)
    : ROOMS[0].id;
let customTasks = loadCustomTasks();
let state = loadLocalState();
let toastTimer = null;
let hasCelebrated = Object.keys(state.completed).length === allTaskIds().size;

function dayKey(date) {
    const d = date || new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return year + '-' + month + '-' + day;
}

function emptyState() {
    return {
        version: PLAN_VERSION,
        day: dayKey(),
        completed: {},
        updatedAt: 0,
        updatedBy: ''
    };
}

function sanitizeCustomTask(candidate) {
    if (!candidate || typeof candidate !== 'object') return null;
    const roomExists = ROOMS.some(function (room) { return room.id === candidate.roomId; });
    const id = String(candidate.id || '');
    const title = String(candidate.title || '').trim().slice(0, 90);
    const detail = String(candidate.detail || '').trim().slice(0, 140);
    if (!roomExists || !/^custom-[a-z0-9-]+$/.test(id) || !title) return null;
    return {
        id: id,
        roomId: candidate.roomId,
        title: title,
        detail: detail,
        createdAt: Number.isFinite(Number(candidate.createdAt)) ? Number(candidate.createdAt) : 0
    };
}

function loadCustomTasks() {
    try {
        const raw = JSON.parse(localStorage.getItem(CUSTOM_TASKS_STORAGE_KEY) || '[]');
        if (!Array.isArray(raw)) return [];
        const seen = new Set();
        return raw.map(sanitizeCustomTask).filter(function (task) {
            if (!task || seen.has(task.id)) return false;
            seen.add(task.id);
            return true;
        }).slice(0, 60);
    } catch (error) {
        return [];
    }
}

function persistCustomTasks() {
    localStorage.setItem(CUSTOM_TASKS_STORAGE_KEY, JSON.stringify(customTasks));
}

function tasksForRoom(room) {
    const additions = customTasks.filter(function (task) {
        return task.roomId === room.id;
    }).map(function (task, index) {
        return {
            id: task.id,
            order: room.tasks.length + index + 1,
            title: task.title,
            detail: task.detail,
            isCustom: true
        };
    });
    return room.tasks.concat(additions);
}

function allTaskIds() {
    return new Set(Array.from(BASE_TASK_IDS).concat(customTasks.map(function (task) { return task.id; })));
}

function sanitizeState(candidate) {
    const clean = emptyState();
    if (!candidate || candidate.version !== PLAN_VERSION || candidate.day !== dayKey()) return clean;

    const sourceCompleted = candidate.completed && typeof candidate.completed === 'object'
        ? candidate.completed
        : {};

    const validTaskIds = allTaskIds();
    Object.keys(sourceCompleted).forEach(function (taskId) {
        const entry = sourceCompleted[taskId];
        if (!validTaskIds.has(taskId) || !entry || PEOPLE.indexOf(entry.by) < 0) return;
        clean.completed[taskId] = {
            by: entry.by,
            at: Number.isFinite(Number(entry.at)) ? Number(entry.at) : 0
        };
    });

    clean.updatedAt = Number.isFinite(Number(candidate.updatedAt)) ? Number(candidate.updatedAt) : 0;
    clean.updatedBy = PEOPLE.indexOf(candidate.updatedBy) >= 0 ? candidate.updatedBy : '';
    return clean;
}

function loadLocalState() {
    try {
        return sanitizeState(JSON.parse(localStorage.getItem(STATE_STORAGE_KEY) || 'null'));
    } catch (error) {
        return emptyState();
    }
}

function persistLocalState() {
    localStorage.setItem(STATE_STORAGE_KEY, JSON.stringify(state));
}

function roomById(id) {
    return ROOMS.find(function (room) { return room.id === id; }) || ROOMS[0];
}

function completedCountForRoom(room) {
    return tasksForRoom(room).reduce(function (count, task) {
        return count + (state.completed[task.id] ? 1 : 0);
    }, 0);
}

function totalCompleted() {
    const validTaskIds = allTaskIds();
    return Object.keys(state.completed).filter(function (taskId) {
        return validTaskIds.has(taskId);
    }).length;
}

function escapeHtml(value) {
    return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function formatToday() {
    return new Intl.DateTimeFormat('de-DE', {
        weekday: 'long',
        day: '2-digit',
        month: 'long'
    }).format(new Date());
}

function formatTime(timestamp) {
    if (!timestamp) return '';
    return new Intl.DateTimeFormat('de-DE', {
        hour: '2-digit',
        minute: '2-digit'
    }).format(new Date(timestamp));
}

function render() {
    const previousScroll = elements.taskList.scrollTop;
    renderPeople();
    renderProgress();
    renderRoomRail();
    renderActiveRoom();
    window.requestAnimationFrame(function () {
        elements.taskList.scrollTop = previousScroll;
    });
}

function renderPeople() {
    document.querySelectorAll('.person-button').forEach(function (button) {
        button.setAttribute('aria-pressed', String(button.dataset.person === currentPerson));
    });
}

function renderProgress() {
    const done = totalCompleted();
    const total = allTaskIds().size;
    const percent = Math.round((done / total) * 100);
    elements.progressRing.style.setProperty('--progress', (percent * 3.6) + 'deg');
    elements.progressPercent.textContent = percent + '%';
    elements.progressCount.textContent = done + ' von ' + total + ' erledigt';

    let headline = 'Los geht’s';
    if (percent === 100) headline = 'Alles blitzblank';
    else if (percent >= 75) headline = 'Fast geschafft';
    else if (percent >= 40) headline = 'Läuft bei euch';
    else if (percent > 0) headline = 'Guter Anfang';
    elements.progressHeadline.textContent = headline;
}

function renderRoomRail() {
    elements.roomRail.innerHTML = ROOMS.map(function (room) {
        const tasks = tasksForRoom(room);
        const done = completedCountForRoom(room);
        const percent = tasks.length ? Math.round((done / tasks.length) * 100) : 0;
        const isActive = room.id === activeRoomId;
        const isComplete = tasks.length > 0 && done === tasks.length;
        return '<button class="room-button' + (isComplete ? ' is-complete' : '') + '"' +
            ' type="button" data-room-id="' + room.id + '"' +
            ' aria-current="' + (isActive ? 'page' : 'false') + '"' +
            ' style="--room-button-color:' + room.color + ';--room-button-soft:' + room.soft + ';--room-progress:' + percent + '%">' +
                '<span class="room-button-icon" aria-hidden="true">' + room.icon + '</span>' +
                '<span class="room-button-copy">' +
                    '<span class="room-button-name">' + escapeHtml(room.name) + '</span>' +
                    '<span class="room-button-meta">' + (tasks.length ? (isComplete ? 'Geschafft' : done + ' von ' + tasks.length) : 'Noch leer') + '</span>' +
                '</span>' +
                '<span class="room-button-count" aria-label="' + done + ' von ' + tasks.length + ' erledigt">' +
                    (isComplete ? '✓' : done + '/' + tasks.length) +
                '</span>' +
            '</button>';
    }).join('');
}

function renderActiveRoom() {
    const room = roomById(activeRoomId);
    const tasks = tasksForRoom(room);
    const done = completedCountForRoom(room);
    elements.roomPanel.style.setProperty('--room', room.color);
    elements.roomPanel.style.setProperty('--room-soft', room.soft);
    elements.roomIcon.textContent = room.icon;
    elements.roomTitle.textContent = room.name;
    elements.roomSubtitle.textContent = room.subtitle;
    elements.roomScore.textContent = tasks.length === 0
        ? 'Noch keine Aufgaben'
        : (done === tasks.length ? '✓ Raum geschafft' : done + ' / ' + tasks.length + ' erledigt');

    elements.taskList.innerHTML = tasks.length ? tasks.map(function (task) {
        const completion = state.completed[task.id];
        const owner = completion ? completion.by : '';
        const ownerColor = owner ? PERSON_COLORS[owner] : PERSON_COLORS[currentPerson];
        const label = completion
            ? task.title + ', erledigt von ' + owner + '. Antippen zum Rückgängigmachen.'
            : task.title + '. Antippen zum Erledigen.';
        return '<button class="task-button" type="button" data-task-id="' + task.id + '"' +
            ' aria-pressed="' + String(Boolean(completion)) + '"' +
            ' aria-label="' + escapeHtml(label) + '"' +
            ' style="--owner-color:' + ownerColor + '">' +
                '<span class="task-order" aria-hidden="true">' + task.order + '</span>' +
                '<span class="task-copy">' +
                    '<span class="task-title">' + escapeHtml(task.title) + '</span>' +
                    (task.detail ? '<span class="task-detail">' + escapeHtml(task.detail) + '</span>' : '') +
                '</span>' +
                '<span class="task-owner">' + escapeHtml(owner) + '</span>' +
                '<span class="task-check" aria-hidden="true">' +
                    '<svg viewBox="0 0 24 24"><path d="m6 12 4 4 8-9"/></svg>' +
                '</span>' +
            '</button>';
    }).join('') : '<div class="empty-room">' +
        '<span class="empty-room-mark" aria-hidden="true">+</span>' +
        '<strong>Der Flur wartet noch auf Aufgaben.</strong>' +
        '<p>Fügt nur das hinzu, was bei euch wirklich gemacht werden soll.</p>' +
        '<button type="button" data-open-add-room="' + room.id + '">Erste Aufgabe hinzufügen</button>' +
    '</div>';

    if (state.updatedAt) {
        elements.lastUpdated.textContent = 'Zuletzt ' + formatTime(state.updatedAt) +
            (state.updatedBy ? ' · ' + state.updatedBy : '');
    } else {
        elements.lastUpdated.textContent = 'Noch keine Änderungen';
    }
}

function selectPerson(person) {
    if (PEOPLE.indexOf(person) < 0) return;
    currentPerson = person;
    localStorage.setItem(PERSON_STORAGE_KEY, currentPerson);
    renderPeople();
    showToast(currentPerson + ' putzt jetzt');
}

function selectRoom(roomId) {
    if (!ROOMS.some(function (room) { return room.id === roomId; })) return;
    activeRoomId = roomId;
    localStorage.setItem(ROOM_STORAGE_KEY, roomId);
    elements.taskList.scrollTop = 0;
    render();
}

function toggleTask(taskId) {
    const validTaskIds = allTaskIds();
    if (!validTaskIds.has(taskId)) return;
    const wasAllComplete = totalCompleted() === validTaskIds.size;
    if (state.completed[taskId]) {
        delete state.completed[taskId];
    } else {
        state.completed[taskId] = { by: currentPerson, at: Date.now() };
    }
    state.updatedAt = Date.now();
    state.updatedBy = currentPerson;
    persistLocalState();
    render();

    const nowAllComplete = totalCompleted() === allTaskIds().size;
    if (nowAllComplete && !wasAllComplete && !hasCelebrated) {
        hasCelebrated = true;
        window.setTimeout(function () { elements.celebration.hidden = false; }, 280);
    }
    if (!nowAllComplete) hasCelebrated = false;
}

function resetToday() {
    state = emptyState();
    state.updatedAt = Date.now();
    state.updatedBy = currentPerson;
    activeRoomId = ROOMS[0].id;
    hasCelebrated = false;
    localStorage.setItem(ROOM_STORAGE_KEY, activeRoomId);
    persistLocalState();
    elements.resetModal.hidden = true;
    elements.taskList.scrollTop = 0;
    render();
    showToast('Bereit für einen frischen Putztag');
}

function renderCustomTaskManager() {
    elements.customTaskManager.hidden = customTasks.length === 0;
    if (!customTasks.length) {
        elements.customTaskList.innerHTML = '';
        return;
    }
    elements.customTaskList.innerHTML = customTasks.map(function (task) {
        const room = roomById(task.roomId);
        return '<div class="custom-task-item">' +
            '<span><small>' + escapeHtml(room.name) + '</small><strong>' + escapeHtml(task.title) + '</strong></span>' +
            '<button type="button" data-remove-custom-task="' + task.id + '" aria-label="' + escapeHtml(task.title) + ' entfernen">Entfernen</button>' +
        '</div>';
    }).join('');
}

function openAddTaskModal(roomId) {
    const selectedRoom = ROOMS.some(function (room) { return room.id === roomId; }) ? roomId : activeRoomId;
    elements.addTaskForm.reset();
    elements.addTaskRoom.innerHTML = ROOMS.map(function (room) {
        return '<option value="' + room.id + '">' + escapeHtml(room.name) + '</option>';
    }).join('');
    elements.addTaskRoom.value = selectedRoom;
    renderCustomTaskManager();
    elements.addTaskModal.hidden = false;
    window.setTimeout(function () { elements.addTaskTitle.focus(); }, 40);
}

function closeAddTaskModal() {
    elements.addTaskModal.hidden = true;
}

function addCustomTask(roomId, title, detail) {
    if (!ROOMS.some(function (room) { return room.id === roomId; }) || !title) return;
    if (customTasks.length >= 60) {
        showToast('Maximal 60 eigene Aufgaben möglich');
        return;
    }
    const task = {
        id: 'custom-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 7),
        roomId: roomId,
        title: title.slice(0, 90),
        detail: detail.slice(0, 140),
        createdAt: Date.now()
    };
    customTasks.push(task);
    hasCelebrated = false;
    persistCustomTasks();
    state.updatedAt = Date.now();
    state.updatedBy = currentPerson;
    persistLocalState();
    activeRoomId = roomId;
    localStorage.setItem(ROOM_STORAGE_KEY, roomId);
    closeAddTaskModal();
    elements.taskList.scrollTop = 0;
    render();
    showToast('Aufgabe zu ' + roomById(roomId).name + ' hinzugefügt');
}

function removeCustomTask(taskId) {
    const task = customTasks.find(function (candidate) { return candidate.id === taskId; });
    if (!task) return;
    customTasks = customTasks.filter(function (candidate) { return candidate.id !== taskId; });
    delete state.completed[taskId];
    state.updatedAt = Date.now();
    state.updatedBy = currentPerson;
    persistCustomTasks();
    persistLocalState();
    hasCelebrated = totalCompleted() === allTaskIds().size;
    render();
    renderCustomTaskManager();
    showToast('Eigene Aufgabe entfernt');
}

function setSyncStatus(text, status) {
    elements.syncStatus.textContent = text;
    elements.syncStatus.dataset.state = status || '';
}

function showToast(message) {
    elements.toast.textContent = message;
    elements.toast.classList.add('is-visible');
    if (toastTimer) window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
        elements.toast.classList.remove('is-visible');
    }, 1900);
}

function bindEvents() {
    elements.roomRail.addEventListener('click', function (event) {
        const button = event.target.closest('[data-room-id]');
        if (button) selectRoom(button.dataset.roomId);
    });

    elements.taskList.addEventListener('click', function (event) {
        const addButton = event.target.closest('[data-open-add-room]');
        if (addButton) {
            openAddTaskModal(addButton.dataset.openAddRoom);
            return;
        }
        const button = event.target.closest('[data-task-id]');
        if (button) toggleTask(button.dataset.taskId);
    });

    document.querySelectorAll('.person-button').forEach(function (button) {
        button.addEventListener('click', function () { selectPerson(button.dataset.person); });
    });

    elements.resetButton.addEventListener('click', function () {
        elements.resetModal.hidden = false;
        elements.cancelReset.focus();
    });
    elements.cancelReset.addEventListener('click', function () { elements.resetModal.hidden = true; });
    elements.confirmReset.addEventListener('click', resetToday);
    elements.addTaskButton.addEventListener('click', function () { openAddTaskModal(activeRoomId); });
    elements.cancelAddTask.addEventListener('click', closeAddTaskModal);
    elements.addTaskForm.addEventListener('submit', function (event) {
        event.preventDefault();
        const title = elements.addTaskTitle.value.trim();
        if (!title) {
            elements.addTaskTitle.setCustomValidity('Bitte beschreibt kurz die Aufgabe.');
            elements.addTaskTitle.reportValidity();
            return;
        }
        elements.addTaskTitle.setCustomValidity('');
        addCustomTask(elements.addTaskRoom.value, title, elements.addTaskDetail.value.trim());
    });
    elements.addTaskTitle.addEventListener('input', function () { elements.addTaskTitle.setCustomValidity(''); });
    elements.customTaskList.addEventListener('click', function (event) {
        const button = event.target.closest('[data-remove-custom-task]');
        if (button) removeCustomTask(button.dataset.removeCustomTask);
    });
    elements.closeCelebration.addEventListener('click', function () { elements.celebration.hidden = true; });

    elements.resetModal.addEventListener('click', function (event) {
        if (event.target === elements.resetModal) elements.resetModal.hidden = true;
    });
    elements.celebration.addEventListener('click', function (event) {
        if (event.target === elements.celebration) elements.celebration.hidden = true;
    });
    elements.addTaskModal.addEventListener('click', function (event) {
        if (event.target === elements.addTaskModal) closeAddTaskModal();
    });
    document.addEventListener('keydown', function (event) {
        if (event.key !== 'Escape') return;
        elements.resetModal.hidden = true;
        elements.celebration.hidden = true;
        closeAddTaskModal();
    });
}

function init() {
    elements.todayLabel.textContent = formatToday();
    bindEvents();
    render();
    setSyncStatus('Lokal gespeichert', 'local');
}

init();
