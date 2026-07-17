/* Francesco's wallpad cleaning plan — intentionally dependency-free. */

const PLAN_VERSION = 3;
const STATE_STORAGE_KEY = 'francesco_wallpad_putzplan_v3';
const PERSON_STORAGE_KEY = 'francesco_wallpad_person';
const ROOM_STORAGE_KEY = 'francesco_wallpad_room';
const PEOPLE = ['Tim', 'Alli'];
const PERSON_COLORS = { Tim: '#2d6cdf', Alli: '#e06a46' };

const ROOMS = [
    {
        id: 'kueche',
        name: 'Küche',
        icon: '🍋',
        color: '#4f7c68',
        soft: '#e5f0ea',
        subtitle: 'Aus dem bisherigen digitalen Plan ergänzt',
        tasks: [
            { id: 'kueche-1', order: 1, title: 'Küche aufräumen', detail: 'Geschirr wegräumen und Arbeitsflächen frei machen' },
            { id: 'kueche-2', order: 2, title: 'Tisch und Arbeitsflächen abwischen', detail: 'Alle frei geräumten Flächen gründlich wischen' },
            { id: 'kueche-3', order: 3, title: 'Spülmaschine ein- / ausräumen', detail: 'Geschirr vollständig versorgen' },
            { id: 'kueche-4', order: 4, title: 'Spülbecken reinigen', detail: 'Becken, Rand und Wasserhahn' },
            { id: 'kueche-5', order: 5, title: 'Müll rausbringen', detail: 'Beutel wechseln und Mülleimer abwischen' },
            { id: 'kueche-6', order: 6, title: 'Kühlschrank aussortieren', detail: 'Verdorbenes prüfen, Griffe und Front abwischen' },
            { id: 'kueche-7', order: 7, title: 'Saugen und wischen', detail: 'Auch unter den gut erreichbaren Kanten' }
        ]
    },
    {
        id: 'klo',
        name: 'Klo',
        icon: '🧻',
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
        icon: '🫧',
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
        icon: '🌙',
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
        icon: '🛋️',
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
    }
];

const ALL_TASK_IDS = new Set(ROOMS.flatMap(function (room) {
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
    taskList: document.getElementById('taskList'),
    lastUpdated: document.getElementById('lastUpdated'),
    celebration: document.getElementById('celebration'),
    resetModal: document.getElementById('resetModal'),
    resetButton: document.getElementById('resetButton'),
    cancelReset: document.getElementById('cancelReset'),
    confirmReset: document.getElementById('confirmReset'),
    closeCelebration: document.getElementById('closeCelebration'),
    toast: document.getElementById('toast')
};

let currentPerson = PEOPLE.indexOf(localStorage.getItem(PERSON_STORAGE_KEY)) >= 0
    ? localStorage.getItem(PERSON_STORAGE_KEY)
    : 'Tim';
let activeRoomId = ROOMS.some(function (room) { return room.id === localStorage.getItem(ROOM_STORAGE_KEY); })
    ? localStorage.getItem(ROOM_STORAGE_KEY)
    : ROOMS[0].id;
let state = loadLocalState();
let firestore = null;
let docRef = null;
let writeTimer = null;
let toastTimer = null;
let hasCelebrated = Object.keys(state.completed).length === ALL_TASK_IDS.size;

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

function sanitizeState(candidate) {
    const clean = emptyState();
    if (!candidate || candidate.version !== PLAN_VERSION || candidate.day !== dayKey()) return clean;

    const sourceCompleted = candidate.completed && typeof candidate.completed === 'object'
        ? candidate.completed
        : {};

    Object.keys(sourceCompleted).forEach(function (taskId) {
        const entry = sourceCompleted[taskId];
        if (!ALL_TASK_IDS.has(taskId) || !entry || PEOPLE.indexOf(entry.by) < 0) return;
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
    return room.tasks.reduce(function (count, task) {
        return count + (state.completed[task.id] ? 1 : 0);
    }, 0);
}

function totalCompleted() {
    return Object.keys(state.completed).filter(function (taskId) {
        return ALL_TASK_IDS.has(taskId);
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
    const total = ALL_TASK_IDS.size;
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
        const done = completedCountForRoom(room);
        const percent = Math.round((done / room.tasks.length) * 100);
        const isActive = room.id === activeRoomId;
        const isComplete = done === room.tasks.length;
        return '<button class="room-button' + (isComplete ? ' is-complete' : '') + '"' +
            ' type="button" data-room-id="' + room.id + '"' +
            ' aria-current="' + (isActive ? 'page' : 'false') + '"' +
            ' style="--room-button-color:' + room.color + ';--room-button-soft:' + room.soft + ';--room-progress:' + percent + '%">' +
                '<span class="room-button-icon" aria-hidden="true">' + room.icon + '</span>' +
                '<span class="room-button-copy">' +
                    '<span class="room-button-name">' + escapeHtml(room.name) + '</span>' +
                    '<span class="room-button-meta">' + (isComplete ? 'Geschafft' : done + ' von ' + room.tasks.length) + '</span>' +
                '</span>' +
                '<span class="room-button-count" aria-label="' + done + ' von ' + room.tasks.length + ' erledigt">' +
                    (isComplete ? '✓' : done + '/' + room.tasks.length) +
                '</span>' +
            '</button>';
    }).join('');
}

function renderActiveRoom() {
    const room = roomById(activeRoomId);
    const done = completedCountForRoom(room);
    elements.roomPanel.style.setProperty('--room', room.color);
    elements.roomPanel.style.setProperty('--room-soft', room.soft);
    elements.roomIcon.textContent = room.icon;
    elements.roomTitle.textContent = room.name;
    elements.roomSubtitle.textContent = room.subtitle;
    elements.roomScore.textContent = done === room.tasks.length
        ? '✓ Raum geschafft'
        : done + ' / ' + room.tasks.length + ' erledigt';

    elements.taskList.innerHTML = room.tasks.map(function (task) {
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
                    '<span class="task-detail">' + escapeHtml(task.detail) + '</span>' +
                '</span>' +
                '<span class="task-owner">' + escapeHtml(owner) + '</span>' +
                '<span class="task-check" aria-hidden="true">' +
                    '<svg viewBox="0 0 24 24"><path d="m6 12 4 4 8-9"/></svg>' +
                '</span>' +
            '</button>';
    }).join('');

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
    if (!ALL_TASK_IDS.has(taskId)) return;
    const wasAllComplete = totalCompleted() === ALL_TASK_IDS.size;
    if (state.completed[taskId]) {
        delete state.completed[taskId];
    } else {
        state.completed[taskId] = { by: currentPerson, at: Date.now() };
    }
    state.updatedAt = Date.now();
    state.updatedBy = currentPerson;
    persistLocalState();
    render();
    scheduleRemoteWrite();

    const nowAllComplete = totalCompleted() === ALL_TASK_IDS.size;
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
    scheduleRemoteWrite(true);
    showToast('Bereit für einen frischen Putztag');
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

function scheduleRemoteWrite(immediate) {
    if (!docRef) {
        setSyncStatus('Nur auf diesem Gerät', 'offline');
        return;
    }
    if (writeTimer) window.clearTimeout(writeTimer);
    setSyncStatus('Speichert …', '');
    const write = function () {
        docRef.set(JSON.parse(JSON.stringify(state))).then(function () {
            setSyncStatus('Synchronisiert', 'online');
        }).catch(function (error) {
            console.error('Putzplan konnte nicht synchronisiert werden:', error);
            setSyncStatus('Offline gespeichert', 'offline');
        });
    };
    if (immediate) write();
    else writeTimer = window.setTimeout(write, 250);
}

function initFirestoreSync() {
    if (typeof firebaseConfig === 'undefined' || !firebaseConfig || !firebaseConfig.apiKey || typeof firebase === 'undefined') {
        setSyncStatus('Nur auf diesem Gerät', 'offline');
        return;
    }

    try {
        if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
        firestore = firebase.firestore();
        const id = typeof documentId !== 'undefined' && documentId
            ? documentId
            : 'default-putzplan';
        docRef = firestore.collection('putzplan').doc(id);
        setSyncStatus('Verbindet …', '');

        docRef.onSnapshot(function (snapshot) {
            if (!snapshot.exists) {
                scheduleRemoteWrite(true);
                return;
            }
            const remote = sanitizeState(snapshot.data());
            if (remote.updatedAt > state.updatedAt) {
                state = remote;
                persistLocalState();
                render();
            }
            setSyncStatus(snapshot.metadata.fromCache ? 'Offline gespeichert' : 'Synchronisiert', snapshot.metadata.fromCache ? 'offline' : 'online');
        }, function (error) {
            console.error('Putzplan-Verbindung fehlgeschlagen:', error);
            setSyncStatus('Offline gespeichert', 'offline');
        });
    } catch (error) {
        console.error('Firebase konnte nicht gestartet werden:', error);
        setSyncStatus('Nur auf diesem Gerät', 'offline');
    }
}

function bindEvents() {
    elements.roomRail.addEventListener('click', function (event) {
        const button = event.target.closest('[data-room-id]');
        if (button) selectRoom(button.dataset.roomId);
    });

    elements.taskList.addEventListener('click', function (event) {
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
    elements.closeCelebration.addEventListener('click', function () { elements.celebration.hidden = true; });

    elements.resetModal.addEventListener('click', function (event) {
        if (event.target === elements.resetModal) elements.resetModal.hidden = true;
    });
    elements.celebration.addEventListener('click', function (event) {
        if (event.target === elements.celebration) elements.celebration.hidden = true;
    });
    document.addEventListener('keydown', function (event) {
        if (event.key !== 'Escape') return;
        elements.resetModal.hidden = true;
        elements.celebration.hidden = true;
    });
}

function init() {
    elements.todayLabel.textContent = formatToday();
    bindEvents();
    render();
    initFirestoreSync();
}

init();
