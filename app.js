// ════════════════════════════════════════════════════
//  UTILITIES
// ════════════════════════════════════════════════════
const USER_NAME_STORAGE_KEY = 'putzplan_user_name';
const ALLOWED_USER_NAMES = ['Alli', 'Tim'];
const USER_COLOR_PALETTE = ['#2f80ed', '#f2994a', '#27ae60', '#eb5757', '#9b51e0', '#2d9cdb', '#56cc9b', '#bb6bd9'];
const SECTION_MAX_SPAN = 4;

function sid() { return 's' + Math.random().toString(36).substr(2, 9); }
function esc(s) { return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function normalizeUserName(value) {
    return (value || '').trim().replace(/\s+/g, ' ');
}
function resolveUserName(value) {
    const normalized = normalizeUserName(value);
    if (!normalized) return '';
    const found = ALLOWED_USER_NAMES.find(name => name.toLowerCase() === normalized.toLowerCase());
    return found || '';
}
function userKey(value) {
    return normalizeUserName(value).toLowerCase();
}
function getUserColor(name) {
    const key = userKey(name);
    if (!key) return 'var(--accent)';
    let hash = 0;
    for (let i = 0; i < key.length; i++) hash += key.charCodeAt(i);
    return USER_COLOR_PALETTE[hash % USER_COLOR_PALETTE.length];
}
function getCheckboxOwner(value) {
    const owner = (typeof value === 'string') ? normalizeUserName(value) : '';
    return owner === 'true' || owner === 'false' ? '' : owner;
}
function normalizeTaskNotes() {
    if (!data || !Array.isArray(data.sections)) return;
    data.sections.forEach(section => {
        (section.categories || []).forEach(category => {
            (category.tasks || []).forEach(task => {
                if (!task || typeof task !== 'object') return;
                task.notes = typeof task.notes === 'string' ? task.notes : '';
            });
        });
    });
}
function normalizeMessages() {
    if (!data) return;
    if (!Array.isArray(data.messages)) data.messages = [];

    const cleaned = [];
    data.messages.forEach(msg => {
        if (!msg || typeof msg !== 'object') return;
        const text = normalizeUserName(msg.text || '');
        const author = normalizeUserName(msg.author || '');
        if (!text) return;
        cleaned.push({
            id: msg.id || sid(),
            text: text.slice(0, 220),
            author: author || 'Freund/in',
            createdAt: Number.isFinite(Number(msg.createdAt)) ? Number(msg.createdAt) : Date.now()
        });
    });

    data.messages = cleaned
        .sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0))
        .slice(-40);
}
function getSectionTileSpan(sec) {
    const span = parseInt(sec && sec.layout && sec.layout.span, 10);
    if (span >= 1 && span <= SECTION_MAX_SPAN) return span;
    if (sec && sec.type === 'daily') return 2;
    return 1;
}
function normalizeSectionLayout() {
    if (!data || !Array.isArray(data.sections)) return;
    data.sections.forEach(section => {
        if (!section || typeof section !== 'object') return;
        const span = parseInt(section.layout && section.layout.span, 10);
        if (span < 1 || span > SECTION_MAX_SPAN) {
            section.layout = section.layout || {};
            section.layout.span = section.type === 'daily' ? 2 : 1;
        }
    });
}
function sectionSpanSelectMarkup(secId, span) {
    const spanOptions = Array.from({ length: SECTION_MAX_SPAN }, (_, i) => i + 1)
        .map(value => `<option value="${value}" ${span === value ? 'selected' : ''}>${value}/${SECTION_MAX_SPAN}</option>`)
        .join('');
    return `
        <label style="font-size:.65rem;color:var(--text-light);display:flex;align-items:center;gap:4px;" title="Kachel-Breite">
            <span>Größe:</span>
            <select class="tile-size-select" data-action="setSectionSpan" data-section="${secId}">
                ${spanOptions}
            </select>
        </label>
    `;
}
function moveSectionByIndex(index, toIndex) {
    if (index === -1 || toIndex < 0 || toIndex >= data.sections.length) return;
    const section = data.sections.splice(index, 1)[0];
    data.sections.splice(toIndex, 0, section);
}

const DESKTOP_MASONRY_BREAKPOINT = 801;

function getPlanBodyGutterPx() {
    const body = document.getElementById('planBody');
    if (!body) return 16;
    const styles = getComputedStyle(body);
    const rawGap = (styles.gap || styles.gridGap || styles.columnGap || '').split(' ')[0];
    const px = parseFloat(rawGap);
    return Number.isFinite(px) ? px : 16;
}

function shouldUseMasonryLayout() {
    return window.innerWidth >= DESKTOP_MASONRY_BREAKPOINT;
}

function getSectionById(id) {
    if (!data || !Array.isArray(data.sections)) return null;
    return data.sections.find(s => s.id === id) || null;
}

function applyMasonryLayout() {
    const body = document.getElementById('planBody');
    if (!body) return;

    const sections = [...body.querySelectorAll('.section[data-section]')];
    const useMasonry = shouldUseMasonryLayout();
    body.classList.toggle('masonry-mode', useMasonry);

    if (sections.length === 0) {
        body.style.height = '';
        return;
    }

    if (!useMasonry) {
        sections.forEach(section => {
            section.style.position = '';
            section.style.top = '';
            section.style.left = '';
            section.style.width = '';
        });
        body.style.height = '';
        return;
    }

    const bodyWidth = body.clientWidth;
    const gutter = getPlanBodyGutterPx();
    const spanCount = SECTION_MAX_SPAN;
    const columnWidth = (bodyWidth - ((spanCount - 1) * gutter)) / spanCount;
    if (!Number.isFinite(columnWidth) || columnWidth <= 0) return;

    const columnHeights = Array.from({ length: spanCount }, () => 0);
    let maxHeight = 0;

    sections.forEach(section => {
        const sec = getSectionById(section.dataset.section);
        const span = getSectionTileSpan(sec);
        const effectiveSpan = Math.min(Math.max(1, span), spanCount);
        const stepWidth = columnWidth + gutter;

        let bestStartCol = 0;
        let bestTop = Infinity;
        for (let startCol = 0; startCol <= spanCount - effectiveSpan; startCol++) {
            const endCol = startCol + effectiveSpan;
            const candidateTop = Math.max(...columnHeights.slice(startCol, endCol));
            if (candidateTop < bestTop) {
                bestTop = candidateTop;
                bestStartCol = startCol;
            }
        }

        const targetWidth = effectiveSpan === spanCount
            ? `${bodyWidth}px`
            : `${(effectiveSpan * columnWidth) + ((effectiveSpan - 1) * gutter)}px`;

        section.style.position = 'absolute';
        section.style.left = `${bestStartCol * stepWidth}px`;
        section.style.top = `${bestTop}px`;
        section.style.width = targetWidth;

        const height = section.getBoundingClientRect().height;
        for (let col = bestStartCol; col < bestStartCol + effectiveSpan; col++) {
            columnHeights[col] = bestTop + height + gutter;
        }
        if (bestTop + height > maxHeight) maxHeight = bestTop + height;
    });

    body.style.height = `${maxHeight}px`;
}

// ════════════════════════════════════════════════════
//  DEFAULT DATA
// ════════════════════════════════════════════════════
function createDefaultData() {
    return {
        month: '',
        messages: [],
        sections: [
            {
                id: sid(), type: 'daily', title: 'Täglich', days: 31,
                layout: { span: 2 },
                columns: [
                    { id: sid(), group: 'Küche & Essbereich', name: 'Küche aufräumen' },
                    { id: sid(), group: 'Küche & Essbereich', name: 'Tisch abwischen' },
                    { id: sid(), group: 'Küche & Essbereich', name: 'Spülmaschine ein-/ausräumen' },
                    { id: sid(), group: 'Küche & Essbereich', name: 'Müll raustragen' },
                    { id: sid(), group: 'Küche & Essbereich', name: 'Staubsaugen' },
                    { id: sid(), group: 'Küche & Essbereich', name: 'Spülbecken reinigen' },
                    { id: sid(), group: 'Schlafzimmer', name: 'Bett machen' },
                    { id: sid(), group: 'Schlafzimmer', name: 'Lüften' },
                ],
                checked: {}
            },
            {
                id: sid(), type: 'weekly', title: 'Wöchentlich', boxes: 4,
                layout: { span: 1 },
                categories: [
                    { id: sid(), name: 'Allgemein', tasks: [
                        { id: sid(), name: 'Staub wischen' },
                        { id: sid(), name: 'Staubsaugen' },
                        { id: sid(), name: 'Böden reinigen' },
                        { id: sid(), name: 'Wäsche waschen' },
                        { id: sid(), name: 'Bügeln' },
                        { id: sid(), name: 'Türklinken abwischen' },
                        { id: sid(), name: 'Blumen giessen' },
                    ]},
                    { id: sid(), name: 'Küche & Essbereich', tasks: [
                        { id: sid(), name: 'Kühlschrank aussortieren' },
                        { id: sid(), name: 'Mülleimer reinigen' },
                        { id: sid(), name: 'Fliesen reinigen' },
                    ]},
                    { id: sid(), name: 'Bad & WC', tasks: [
                        { id: sid(), name: 'Toilette reinigen' },
                        { id: sid(), name: 'Waschbecken reinigen' },
                        { id: sid(), name: 'Spiegel putzen' },
                        { id: sid(), name: 'Dusche reinigen' },
                        { id: sid(), name: 'Badewanne reinigen' },
                        { id: sid(), name: 'Müll raustragen' },
                        { id: sid(), name: 'Handtücher waschen' },
                    ]}
                ], checked: {}
            },
            {
                id: sid(), type: 'weekly', title: '2-Wöchentlich', boxes: 2,
                layout: { span: 1 },
                categories: [
                    { id: sid(), name: 'Schlafzimmer', tasks: [
                        { id: sid(), name: 'Bettwäsche wechseln' },
                    ]}
                ], checked: {}
            },
            {
                id: sid(), type: 'weekly', title: 'Monatlich', boxes: 1,
                layout: { span: 1 },
                categories: [
                    { id: sid(), name: 'Allgemein', tasks: [
                        { id: sid(), name: 'Heizkörper reinigen' },
                        { id: sid(), name: 'Schränke aufräumen' },
                        { id: sid(), name: 'Möbel und Polster säubern' },
                        { id: sid(), name: 'Aussortieren & Ausmisten' },
                        { id: sid(), name: 'Dekorationen abstauben' },
                        { id: sid(), name: 'Blumen düngen' },
                    ]},
                    { id: sid(), name: 'Küche & Essbereich', tasks: [
                        { id: sid(), name: 'Küchengeräte reinigen' },
                        { id: sid(), name: 'Wasserkocher entkalken' },
                        { id: sid(), name: 'Kaffeemaschine entkalken' },
                        { id: sid(), name: 'Kühlschrank putzen' },
                    ]},
                    { id: sid(), name: 'Bad & WC', tasks: [
                        { id: sid(), name: 'Badfliesen reinigen' },
                    ]}
                ], checked: {}
            }
        ]
    };
}

// ════════════════════════════════════════════════════
//  STATE
// ════════════════════════════════════════════════════
let data = null;
let currentUserName = '';
let db = null;
let docRef = null;
let unsubscribe = null;
let saveTimeout = null;
let firestoreReady = false;
let suppressNextSnapshot = false;
let draggingSectionId = null;

function isOwnerCurrentUser(owner) {
    return userKey(owner) === userKey(currentUserName);
}
function normalizeSectionChecks(section) {
    if (!section.checked || typeof section.checked !== 'object' || Array.isArray(section.checked)) {
        section.checked = {};
        return;
    }
    Object.keys(section.checked).forEach((key) => {
        const owner = getCheckboxOwner(section.checked[key]);
        if (owner) {
            section.checked[key] = owner;
        } else if (section.checked[key] === true) {
            section.checked[key] = 'Anonym';
        } else {
            delete section.checked[key];
        }
    });
}
function normalizeAllChecks() {
    if (!data || !Array.isArray(data.sections)) return;
    data.sections.forEach(normalizeSectionChecks);
    normalizeMessages();
    normalizeSectionLayout();
    normalizeTaskNotes();
}
function renderCheckbox(sectionId, key) {
    const sec = data.sections.find(s => s.id === sectionId);
    if (!sec || !sec.checked) return `<div class="cb" data-section="${sectionId}" data-key="${key}"></div>`;
    const owner = getCheckboxOwner(sec.checked[key]);
    if (!owner) return `<div class="cb" data-section="${sectionId}" data-key="${key}"></div>`;
    const extraClass = isOwnerCurrentUser(owner) ? ' mine' : ' other';
    const color = getUserColor(owner);
    const title = esc(`Erledigt von ${owner}`);
    return `<div class="cb checked${extraClass}" data-section="${sectionId}" data-key="${key}" title="${title}" style="--cb-color:${color};"></div>`;
}
function updateUserBadge() {
    const badge = document.getElementById('userBadge');
    if (!badge) return;
    badge.textContent = currentUserName ? `👤 ${currentUserName}` : '👤 Name wählen';
}
function setCurrentUserName(name) {
    const normalized = resolveUserName(name);
    if (!normalized) {
        currentUserName = '';
        localStorage.removeItem(USER_NAME_STORAGE_KEY);
        updateUserBadge();
        return false;
    }
    currentUserName = normalized;
    localStorage.setItem(USER_NAME_STORAGE_KEY, currentUserName);
    updateUserBadge();
    return true;
}
function openUserNameModal() {
    const select = document.getElementById('userNameSelect');
    if (!select) return;
    select.value = resolveUserName(currentUserName) || ALLOWED_USER_NAMES[0];
    openModal('userModal');
    setTimeout(() => select.focus(), 120);
}
function saveUserNameFromModal() {
    const select = document.getElementById('userNameSelect');
    if (!select) return;
    const name = resolveUserName(select.value);
    if (!name) {
        select.focus();
        return;
    }
    setCurrentUserName(name);
    closeModal('userModal');
    render();
}
function initCurrentUser() {
    const saved = localStorage.getItem(USER_NAME_STORAGE_KEY);
    if (!setCurrentUserName(saved)) openUserNameModal();
}

// ════════════════════════════════════════════════════
//  FIREBASE
// ════════════════════════════════════════════════════
function initApp() {
    initCurrentUser();
    // The firebaseConfig and documentId are now expected to be in firebase-config.js
    if (typeof firebaseConfig !== 'undefined' && firebaseConfig.apiKey) {
        try {
            initFirestore(firebaseConfig, documentId || 'default-putzplan');
        } catch (e) {
            console.error('Firebase init failed:', e);
            startLocal();
        }
    } else {
        console.warn("Firebase config not found. Running in local mode.");
        startLocal();
    }
}

function startLocal() {
    try {
        const saved = localStorage.getItem('putzplan');
        data = saved ? JSON.parse(saved) : createDefaultData();
        if (!data || !Array.isArray(data.sections)) data = createDefaultData();
        normalizeAllChecks();
    } catch { data = createDefaultData(); }
    document.getElementById('appContainer').style.display = '';
    updateSyncStatus('local');
    render();
}

function initFirestore(config, docId) {
    try {
        if (!firebase.apps.length) firebase.initializeApp(config);
        db = firebase.firestore();
        docRef = db.collection('putzplan').doc(docId);
        updateSyncStatus('connecting');
        document.getElementById('appContainer').style.display = '';

        unsubscribe = docRef.onSnapshot(
            (doc) => {
                firestoreReady = true;
                if (suppressNextSnapshot) { suppressNextSnapshot = false; return; }
                if (doc.exists) {
                    data = doc.data();
                    if (!data || !Array.isArray(data.sections)) data = createDefaultData();
                    normalizeAllChecks();
                    localStorage.setItem('putzplan', JSON.stringify(data));
                    updateSyncStatus('connected');
                    render();
                } else {
                    const local = localStorage.getItem('putzplan');
                    data = local ? JSON.parse(local) : createDefaultData();
                    if (!data || !Array.isArray(data.sections)) data = createDefaultData();
                    normalizeAllChecks();
                    docRef.set(data);
                    updateSyncStatus('connected');
                    render();
                }
            },
            (error) => {
                console.error('Firestore error:', error);
                updateSyncStatus('error');
                if (!data) startLocal();
            }
        );
    } catch (e) {
        console.error('Firebase init error:', e);
        startLocal();
    }
}

function updateSyncStatus(status) {
    const el = document.getElementById('syncStatus');
    if (!el) return;
    el.className = 'toolbar-status';
    switch (status) {
        case 'local': el.textContent = '💾 Nur lokal'; break;
        case 'connecting': el.textContent = '🔄 Verbinde...'; break;
        case 'connected': el.textContent = '🟢 Synchronisiert'; el.classList.add('connected'); break;
        case 'saving': el.textContent = '🔄 Speichert...'; break;
        case 'error': el.textContent = '🔴 Fehler'; el.classList.add('error'); break;
    }
}

// ════════════════════════════════════════════════════
//  SAVE (debounced)
// ════════════════════════════════════════════════════
function save() {
    localStorage.setItem('putzplan', JSON.stringify(data));
    if (firestoreReady && docRef) {
        if (saveTimeout) clearTimeout(saveTimeout);
        updateSyncStatus('saving');
        saveTimeout = setTimeout(() => {
            suppressNextSnapshot = true;
            docRef.set(JSON.parse(JSON.stringify(data))).then(() => {
                updateSyncStatus('connected');
            }).catch(err => {
                console.error('Save error:', err);
                suppressNextSnapshot = false;
                updateSyncStatus('error');
            });
        }, 800);
    }
}

// ════════════════════════════════════════════════════
//  RENDER
// ════════════════════════════════════════════════════
function render() {
    if (!data) return;
    const monthInput = document.getElementById('monthInput');
    if (monthInput) monthInput.value = data.month || '';
    renderSloganTicker();
    if (!Array.isArray(data.sections)) data.sections = [];
    normalizeAllChecks();
    const body = document.getElementById('planBody');
    if (!body) return;
    body.innerHTML = '';

    let sections = '';
    data.sections.forEach(sec => {
        if (sec.type === 'daily') sections += renderDailySection(sec);
        else sections += renderWeeklySection(sec);
    });
    body.innerHTML = sections;
    bindEvents();
    applyMasonryLayout();
}

function getSloganTickerText() {
    if (!Array.isArray(data.messages) || data.messages.length === 0) {
        return '';
    }

    const lines = data.messages.map(msg => `${msg.author || 'Freund/in'}: ${msg.text || ''}`);
    return lines.join('   ···   ');
}

function renderSloganTicker() {
    const track = document.getElementById('sloganTrack');
    if (!track) return;

    const text = getSloganTickerText();
    if (!text) {
        track.textContent = '';
        track.style.animation = 'none';
        return;
    }

    const repeated = `${text}   •••   ${text}`;
    const safeText = esc(repeated);

    track.innerHTML = `<span class="slogan-segment">${safeText}</span>`;
    track.style.animation = '';
    const duration = Math.max(16, Math.min(45, Math.round(repeated.length / 5)));
    track.style.setProperty('--slogan-duration', `${duration}s`);
}

function sendSloganMessage() {
    const input = document.getElementById('sloganInput');
    if (!input) return;
    if (!currentUserName) {
        openUserNameModal();
        return;
    }

    const message = normalizeUserName(input.value);
    if (!message) {
        input.focus();
        return;
    }

    data.messages = Array.isArray(data.messages) ? data.messages : [];
    data.messages.push({
        id: sid(),
        author: currentUserName,
        text: message.slice(0, 220),
        createdAt: Date.now()
    });
    normalizeMessages();
    input.value = '';
    render();
    save();
}

function clearSlogans() {
    showConfirmDialog('Slogans löschen?', 'Alle Nachrichten im Slogan-Bereich werden entfernt.', () => {
        data.messages = [];
        render();
        save();
    });
}

// ── Weekly / Biweekly / Monthly ──
function renderWeeklySection(sec) {
    if (!sec.checked) sec.checked = {};
    const span = getSectionTileSpan(sec);
    let cats = '';
    (sec.categories || []).forEach(cat => {
        let tasks = '';
        (cat.tasks || []).forEach(t => {
            const notes = esc(t.notes || '');
            const hasTaskNotes = (t.notes || '').trim().length > 0;
            let boxes = '';
            for (let b = 0; b < sec.boxes; b++) {
                const key = `${t.id}_${b}`;
                boxes += renderCheckbox(sec.id, key);
            }
            tasks += `
                <div class="task-row">
                    <input class="task-label-input" value="${esc(t.name)}" 
                           data-section="${sec.id}" data-cat="${cat.id}" data-task="${t.id}" data-field="taskname">
                    <div class="checkboxes">${boxes}</div>
                    <div class="row-actions no-print">
                        <button class="icon-btn ${hasTaskNotes ? 'note-active' : ''}" title="Aufgaben-Notiz"
                                data-action="toggleTaskNotes" data-section="${sec.id}" data-cat="${cat.id}" data-task="${t.id}">📝</button>
                        <button class="icon-btn danger" title="Aufgabe entfernen" 
                                data-action="removeTask" data-section="${sec.id}" data-cat="${cat.id}" data-task="${t.id}">✕</button>
                    </div>
                </div>
                <div class="task-notes-panel ${hasTaskNotes ? 'open' : ''}" data-section="${sec.id}" data-cat="${cat.id}" data-task="${t.id}">
                    <textarea rows="1" class="task-notes-input" data-section="${sec.id}" data-cat="${cat.id}" data-task="${t.id}" data-field="tasknotes" placeholder="Kurze Notiz...">${notes}</textarea>
                </div>`;
        });
        cats += `
            <div class="category">
                <div class="category-header">
                    <input class="category-name-input" value="${esc(cat.name)}"
                           data-section="${sec.id}" data-cat="${cat.id}" data-field="catname">
                    <button class="icon-btn danger no-print" title="Kategorie entfernen"
                            data-action="removeCat" data-section="${sec.id}" data-cat="${cat.id}" style="flex-shrink:0;">✕</button>
                </div>
                ${tasks}
                <button class="add-btn no-print" data-action="addTask" data-section="${sec.id}" data-cat="${cat.id}">+ Aufgabe</button>
            </div>`;
    });

    return `
        <div class="section tile-span-${span}" data-section="${sec.id}">
            <div class="section-header">
                <input class="section-title-input" value="${esc(sec.title)}"
                       data-section="${sec.id}" data-field="sectiontitle">
                <div class="section-actions no-print">
                    <label style="font-size:.7rem;color:var(--text-light);display:flex;align-items:center;gap:4px;" title="Checkboxen pro Aufgabe">
                        ☑
                        <input type="number" value="${sec.boxes}" min="1" max="31"
                                data-section="${sec.id}" data-field="boxes"
                               style="width:40px;padding:2px 4px;border:1px solid var(--border);border-radius:4px;font-size:.75rem;font-family:inherit;outline:none;text-align:center;">
                    </label>
                    ${sectionSpanSelectMarkup(sec.id, span)}
                    <button class="icon-btn drag-handle" title="Bereich verschieben" type="button" data-section="${sec.id}">⠿</button>
                    <button class="icon-btn" title="Eine Zeile höher" type="button"
                            data-action="moveSectionUp" data-section="${sec.id}">▲</button>
                    <button class="icon-btn" title="Eine Zeile nach unten" type="button"
                            data-action="moveSectionDown" data-section="${sec.id}">▼</button>
                    <button class="icon-btn" title="Nach ganz oben" type="button"
                            data-action="moveSectionTop" data-section="${sec.id}">⤒</button>
                    <button class="icon-btn" title="Nach ganz unten" type="button"
                            data-action="moveSectionBottom" data-section="${sec.id}">⤓</button>
                    <button class="icon-btn" title="Kategorie hinzufügen"
                            data-action="addCat" data-section="${sec.id}">＋</button>
                    <button class="icon-btn danger" title="Bereich löschen"
                            data-action="removeSection" data-section="${sec.id}">🗑</button>
                </div>
            </div>
            ${cats}
            <button class="add-btn no-print" data-action="addCat" data-section="${sec.id}">+ Kategorie</button>
        </div>`;
}

// ── Daily table ──
function renderDailySection(sec) {
    if (!sec.checked) sec.checked = {};
    const span = getSectionTileSpan(sec);
    const groups = [];
    const groupMap = {};
    (sec.columns || []).forEach(col => {
        if (!groupMap[col.group]) {
            groupMap[col.group] = { name: col.group, cols: [] };
            groups.push(groupMap[col.group]);
        }
        groupMap[col.group].cols.push(col);
    });

    let groupHeaderCells = '<th style="border-bottom:none;"></th>';
    groups.forEach(g => {
        groupHeaderCells += `<th colspan="${g.cols.length}" style="text-align:center;font-size:.72rem;font-weight:600;padding:6px 4px;border-bottom:none;color:var(--text);">${esc(g.name)}</th>`;
    });

    let colHeaderCells = '<th style="border-bottom:2px solid var(--border);"></th>';
    groups.forEach(g => {
        g.cols.forEach(col => {
            colHeaderCells += `<th class="col-header">
                <div class="col-header-inner">
                    <span class="col-header-text">${esc(col.name)}</span>
                </div>
                <button class="col-remove-btn no-print"
                        data-action="removeCol" data-section="${sec.id}" data-col="${col.id}"
                        title="Spalte entfernen">✕</button>
            </th>`;
        });
    });

    let rows = '';
    const numDays = sec.days || 31;
    for (let d = 1; d <= numDays; d++) {
        let cells = `<td>${d}</td>`;
        (sec.columns || []).forEach(col => {
            const key = `${col.id}_${d}`;
            cells += `<td>${renderCheckbox(sec.id, key)}</td>`;
        });
        rows += `<tr>${cells}</tr>`;
    }

    return `
        <div class="section tile-span-${span}" data-section="${sec.id}">
            <div class="section-header">
                <input class="section-title-input" value="${esc(sec.title)}"
                       data-section="${sec.id}" data-field="sectiontitle">
                <div class="section-actions no-print">
                    <label style="font-size:.7rem;color:var(--text-light);display:flex;align-items:center;gap:4px;" title="Anzahl Tage">
                        📅
                        <input type="number" value="${numDays}" min="1" max="31"
                               data-section="${sec.id}" data-field="days"
                               style="width:40px;padding:2px 4px;border:1px solid var(--border);border-radius:4px;font-size:.75rem;font-family:inherit;outline:none;text-align:center;">
                    </label>
                    ${sectionSpanSelectMarkup(sec.id, span)}
                    <button class="icon-btn drag-handle" title="Bereich verschieben" type="button" data-section="${sec.id}">⠿</button>
                    <button class="icon-btn" title="Eine Zeile höher" type="button"
                            data-action="moveSectionUp" data-section="${sec.id}">▲</button>
                    <button class="icon-btn" title="Eine Zeile nach unten" type="button"
                            data-action="moveSectionDown" data-section="${sec.id}">▼</button>
                    <button class="icon-btn" title="Nach ganz oben" type="button"
                            data-action="moveSectionTop" data-section="${sec.id}">⤒</button>
                    <button class="icon-btn" title="Nach ganz unten" type="button"
                            data-action="moveSectionBottom" data-section="${sec.id}">⤓</button>
                    <button class="icon-btn" title="Spalte hinzufügen"
                            data-action="showAddCol" data-section="${sec.id}">＋</button>
                    <button class="icon-btn danger" title="Bereich löschen"
                            data-action="removeSection" data-section="${sec.id}">🗑</button>
                </div>
            </div>
            <div class="daily-table-wrapper">
                <table class="daily-table">
                    <thead>
                        <tr>${groupHeaderCells}</tr>
                        <tr>${colHeaderCells}</tr>
                    </thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>
            <button class="add-btn no-print" data-action="showAddCol" data-section="${sec.id}" style="margin-top:12px;">+ Spalte hinzufügen</button>
        </div>`;
}

// ════════════════════════════════════════════════════
//  EVENTS
// ════════════════════════════════════════════════════
function bindEvents() {
    // Checkboxes
    document.querySelectorAll('.cb').forEach(cb => {
        cb.addEventListener('click', () => {
            if (!currentUserName) {
                openUserNameModal();
                return;
            }
            const sec = data.sections.find(s => s.id === cb.dataset.section);
            if (!sec) return;
            if (!sec.checked) sec.checked = {};
            const key = cb.dataset.key;
            const owner = getCheckboxOwner(sec.checked[key]);
            if (isOwnerCurrentUser(owner)) {
                delete sec.checked[key];
            } else {
                sec.checked[key] = currentUserName;
            }
            render();
            save();
        });
    });

    // Inline edits
    document.querySelectorAll('[data-field="sectiontitle"]').forEach(input => {
        input.addEventListener('input', () => {
            const sec = data.sections.find(s => s.id === input.dataset.section);
            if (sec) { sec.title = input.value; save(); }
        });
    });
    document.querySelectorAll('[data-field="catname"]').forEach(input => {
        input.addEventListener('input', () => {
            const sec = data.sections.find(s => s.id === input.dataset.section);
            const cat = sec && sec.categories ? sec.categories.find(c => c.id === input.dataset.cat) : null;
            if (cat) { cat.name = input.value; save(); }
        });
    });
    document.querySelectorAll('[data-field="taskname"]').forEach(input => {
        input.addEventListener('input', () => {
            const sec = data.sections.find(s => s.id === input.dataset.section);
            const cat = sec && sec.categories ? sec.categories.find(c => c.id === input.dataset.cat) : null;
            const task = cat && cat.tasks ? cat.tasks.find(t => t.id === input.dataset.task) : null;
            if (task) { task.name = input.value; save(); }
        });
    });
    document.querySelectorAll('[data-field="tasknotes"]').forEach(input => {
        input.addEventListener('input', () => {
            const sec = data.sections.find(s => s.id === input.dataset.section);
            const cat = sec && sec.categories ? sec.categories.find(c => c.id === input.dataset.cat) : null;
            const task = cat && cat.tasks ? cat.tasks.find(t => t.id === input.dataset.task) : null;
            if (!task) return;

            task.notes = input.value;
            const panel = input.closest('.task-notes-panel');
            const row = panel ? panel.previousElementSibling : null;
            const btn = row ? row.querySelector('[data-action="toggleTaskNotes"]') : null;
            if (btn) {
                if ((input.value || '').trim()) btn.classList.add('note-active');
                else btn.classList.remove('note-active');
                if (!panel.classList.contains('open')) panel.classList.add('open');
            }
            save();
        });
    });
    document.querySelectorAll('[data-field="days"]').forEach(input => {
        input.addEventListener('change', () => {
            const sec = data.sections.find(s => s.id === input.dataset.section);
            if (sec) { sec.days = Math.max(1, Math.min(31, parseInt(input.value) || 31)); render(); save(); }
        });
    });
    document.querySelectorAll('[data-field="boxes"]').forEach(input => {
        input.addEventListener('change', () => {
            const sec = data.sections.find(s => s.id === input.dataset.section);
            if (sec) { sec.boxes = Math.max(1, Math.min(31, parseInt(input.value) || 4)); render(); save(); }
        });
    });

    // Month
    const monthEl = document.getElementById('monthInput');
    if (monthEl) {
        monthEl.addEventListener('input', () => { data.month = monthEl.value; save(); });
    }

    // Action buttons
    document.querySelectorAll('[data-action]').forEach(btn => {
        if (btn.matches('select')) {
            btn.addEventListener('change', handleAction);
        } else {
            btn.addEventListener('click', handleAction);
        }
    });

    bindSectionDragAndDrop();
}

function bindSectionDragAndDrop() {
    const sections = document.querySelectorAll('.section[data-section]');
    const handles = document.querySelectorAll('.drag-handle');
    const sectionsById = {};
    sections.forEach(sec => { sectionsById[sec.dataset.section] = sec; });
    function shouldInsertAfter(targetRect, pointerX, pointerY) {
        const xOffset = pointerX - (targetRect.left + targetRect.width / 2);
        const yOffset = pointerY - (targetRect.top + targetRect.height / 2);
        if (Math.abs(xOffset) >= Math.abs(yOffset)) return xOffset > 0;
        return yOffset > 0;
    }

    handles.forEach((handle) => {
        handle.draggable = true;
        handle.addEventListener('dragstart', (e) => {
            const id = handle.dataset.section;
            if (!id) return;
            draggingSectionId = id;
            const section = sectionsById[id];
            if (section) section.classList.add('is-dragging');
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', id);
        });

        handle.addEventListener('dragend', () => {
            draggingSectionId = null;
            document.querySelectorAll('.section[data-section]').forEach(el => {
                el.classList.remove('is-dragging', 'drop-hover');
            });
        });
    });

    sections.forEach((section) => {
        section.addEventListener('dragover', (e) => {
            if (!draggingSectionId) return;
            if (section.dataset.section === draggingSectionId) return;
            e.preventDefault();
            section.classList.add('drop-hover');
        });

        section.addEventListener('dragleave', () => {
            section.classList.remove('drop-hover');
        });

        section.addEventListener('drop', (e) => {
            e.preventDefault();
            section.classList.remove('drop-hover');

            if (!draggingSectionId) return;
            const targetId = section.dataset.section;
            if (targetId === draggingSectionId) return;

            const from = data.sections.findIndex(s => s.id === draggingSectionId);
            const target = data.sections.findIndex(s => s.id === targetId);
            if (from === -1 || target === -1) return;

            const targetRect = section.getBoundingClientRect();
            const insertAfter = shouldInsertAfter(targetRect, e.clientX, e.clientY);
            let insertIndex = insertAfter ? target + 1 : target;
            if (from < insertIndex) insertIndex -= 1;

            const [moved] = data.sections.splice(from, 1);
            data.sections.splice(insertIndex, 0, moved);
            draggingSectionId = null;
            render();
            save();
        });
    });
}

// ════════════════════════════════════════════════════
//  ACTIONS
// ════════════════════════════════════════════════════
function handleAction(e) {
    e.stopPropagation();
    const btn = e.currentTarget;
    const action = btn.dataset.action;
    const secId = btn.dataset.section;
    const catId = btn.dataset.cat;
    const taskId = btn.dataset.task;
    const colId = btn.dataset.col;

    switch (action) {
        case 'addTask': {
            const sec = data.sections.find(s => s.id === secId);
            const cat = sec.categories.find(c => c.id === catId);
            cat.tasks.push({ id: sid(), name: 'Neue Aufgabe', notes: '' });
            render(); save();
            break;
        }
        case 'removeTask': {
            const sec = data.sections.find(s => s.id === secId);
            const cat = sec.categories.find(c => c.id === catId);
            cat.tasks = cat.tasks.filter(t => t.id !== taskId);
            render(); save();
            break;
        }
        case 'addCat': {
            const sec = data.sections.find(s => s.id === secId);
            sec.categories.push({ id: sid(), name: 'Neue Kategorie', tasks: [{ id: sid(), name: 'Neue Aufgabe', notes: '' }] });
            render(); save();
            break;
        }
        case 'removeCat': {
            showConfirmDialog('Kategorie löschen?', 'Die Kategorie und alle Aufgaben darin werden entfernt.', () => {
                const sec = data.sections.find(s => s.id === secId);
                sec.categories = sec.categories.filter(c => c.id !== catId);
                render(); save();
            });
            break;
        }
        case 'removeSection': {
            showConfirmDialog('Bereich löschen?', 'Der gesamte Bereich wird unwiderruflich entfernt.', () => {
                data.sections = data.sections.filter(s => s.id !== secId);
                render(); save();
            });
            break;
        }
        case 'setSectionSpan': {
            const sec = data.sections.find(s => s.id === secId);
            if (!sec) break;
            const value = parseInt(btn.value, 10);
            if (!Number.isInteger(value) || value < 1 || value > SECTION_MAX_SPAN) break;
            if (!sec.layout || typeof sec.layout !== 'object') sec.layout = {};
            sec.layout.span = value;
            render();
            save();
            break;
        }
        case 'moveSectionTop': {
            const index = data.sections.findIndex(s => s.id === secId);
            if (index > 0) {
                moveSectionByIndex(index, 0);
                render();
                save();
            }
            break;
        }
        case 'moveSectionBottom': {
            const index = data.sections.findIndex(s => s.id === secId);
            if (index >= 0 && index < data.sections.length - 1) {
                moveSectionByIndex(index, data.sections.length - 1);
                render();
                save();
            }
            break;
        }
        case 'moveSectionUp': {
            const index = data.sections.findIndex(s => s.id === secId);
            if (index > 0) {
                moveSectionByIndex(index, index - 1);
                render();
                save();
            }
            break;
        }
        case 'moveSectionDown': {
            const index = data.sections.findIndex(s => s.id === secId);
            if (index >= 0 && index < data.sections.length - 1) {
                moveSectionByIndex(index, index + 1);
                render();
                save();
            }
            break;
        }
        case 'showAddCol': {
            const sec = data.sections.find(s => s.id === secId);
            const lastGroup = sec.columns && sec.columns.length > 0 ? sec.columns[sec.columns.length - 1].group : '';
            document.getElementById('newColGroup').value = lastGroup;
            document.getElementById('newColName').value = '';
            document.getElementById('newColSection').value = secId;
            openModal('addColModal');
            setTimeout(() => document.getElementById('newColName').focus(), 100);
            break;
        }
        case 'removeCol': {
            showConfirmDialog('Spalte entfernen?', 'Die Spalte und alle zugehörigen Häkchen werden gelöscht.', () => {
                const sec = data.sections.find(s => s.id === secId);
                sec.columns = sec.columns.filter(c => c.id !== colId);
                render(); save();
            });
            break;
        }
        case 'toggleTaskNotes': {
            const panel = document.querySelector(`.task-notes-panel[data-section="${secId}"][data-cat="${catId}"][data-task="${taskId}"]`);
            if (!panel) break;
            panel.classList.toggle('open');
            if (btn) btn.classList.toggle('note-active', panel.classList.contains('open'));
            if (panel.classList.contains('open')) {
                const noteInput = panel.querySelector('[data-field="tasknotes"]');
                if (noteInput) noteInput.focus();
            }
            break;
        }
    }
}

// ════════════════════════════════════════════════════
//  CONFIRM DIALOG
// ════════════════════════════════════════════════════
let confirmCallback = null;

function showConfirmDialog(title, message, onConfirm) {
    document.getElementById('confirmTitle').textContent = title;
    document.getElementById('confirmMessage').textContent = message;
    confirmCallback = onConfirm;
    openModal('confirmModal');
}

document.getElementById('confirmYesBtn').addEventListener('click', () => {
    closeModal('confirmModal');
    if (confirmCallback) { confirmCallback(); confirmCallback = null; }
});

const userNameSelect = document.getElementById('userNameSelect');
if (userNameSelect) {
    userNameSelect.addEventListener('change', saveUserNameFromModal);
    userNameSelect.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') saveUserNameFromModal();
    });
}

// ════════════════════════════════════════════════════
//  MODAL HELPERS
// ════════════════════════════════════════════════════
function openModal(id) { document.getElementById(id).classList.add('active'); }
function closeModal(id) { document.getElementById(id).classList.remove('active'); }

document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) overlay.classList.remove('active');
    });
});

// ════════════════════════════════════════════════════
//  TOOLBAR ACTIONS
// ════════════════════════════════════════════════════
function showAddSectionModal() {
    document.getElementById('newSectionName').value = '';
    document.getElementById('newSectionBoxes').value = '4';
    openModal('addSectionModal');
    setTimeout(() => document.getElementById('newSectionName').focus(), 100);
}

function confirmAddSection() {
    const name = document.getElementById('newSectionName').value.trim() || 'Neuer Bereich';
    const boxes = parseInt(document.getElementById('newSectionBoxes').value) || 4;
    data.sections.push({
        id: sid(), type: 'weekly', title: name, boxes,
        layout: { span: 1 },
        categories: [{ id: sid(), name: 'Allgemein', tasks: [{ id: sid(), name: 'Neue Aufgabe', notes: '' }] }],
        checked: {}
    });
    closeModal('addSectionModal');
    render(); save();
}

function addDailySection() {
    data.sections.unshift({
        id: sid(), type: 'daily', title: 'Täglich', days: 31,
        layout: { span: 2 },
        columns: [
            { id: sid(), group: 'Allgemein', name: 'Aufgabe 1' },
            { id: sid(), group: 'Allgemein', name: 'Aufgabe 2' },
        ],
        checked: {}
    });
    render(); save();
}

function confirmAddCol() {
    const secId = document.getElementById('newColSection').value;
    const group = document.getElementById('newColGroup').value.trim() || 'Allgemein';
    const name = document.getElementById('newColName').value.trim() || 'Neue Spalte';
    const sec = data.sections.find(s => s.id === secId);
    if (!sec) return;
    sec.columns.push({ id: sid(), group, name });
    closeModal('addColModal');
    render(); save();
}

function resetAllChecks() {
    showConfirmDialog('Alle Häkchen zurücksetzen?', 'Alle Checkboxen in allen Bereichen werden geleert.', () => {
        data.sections.forEach(sec => { sec.checked = {}; });
        render(); save();
    });
}

let masonryRelayoutTimer = null;
function scheduleMasonryRelayout() {
    if (masonryRelayoutTimer) clearTimeout(masonryRelayoutTimer);
    masonryRelayoutTimer = setTimeout(() => {
        applyMasonryLayout();
        masonryRelayoutTimer = null;
    }, 80);
}
window.addEventListener('resize', scheduleMasonryRelayout);

// ── Print: scale the entire layout to fit one A4 landscape page ──
// A4 landscape printable area (mm) with 5mm margins: 287 × 200
// At 96dpi that's roughly 1085 × 755 CSS px, but we measure dynamically.
let _printBackup = null;

function preparePrintLayout() {
    const main = document.querySelector('.main');
    const body = document.getElementById('planBody');
    if (!main || !body) return;

    // Measure content at its natural web size
    const contentW = main.scrollWidth;
    const contentH = main.scrollHeight;
    if (!contentW || !contentH) return;

    // A4 landscape printable area with 5mm margin ≈ 287mm × 200mm
    // Convert to CSS px: 1mm ≈ 3.7795px at 96dpi
    const pageW = 287 * 3.7795;
    const pageH = 200 * 3.7795;

    const scaleX = pageW / contentW;
    const scaleY = pageH / contentH;
    const scale = Math.min(scaleX, scaleY, 1); // never scale up

    _printBackup = {
        transform: main.style.transform,
        transformOrigin: main.style.transformOrigin,
        width: main.style.width,
        maxWidth: main.style.maxWidth,
        padding: main.style.padding,
    };

    main.style.transformOrigin = 'top left';
    main.style.transform = `scale(${scale})`;
    main.style.width = contentW + 'px';
    main.style.maxWidth = 'none';
    main.style.padding = '12px 18px 20px';
}

function restorePrintLayout() {
    if (!_printBackup) return;
    const main = document.querySelector('.main');
    if (!main) return;

    main.style.transform = _printBackup.transform || '';
    main.style.transformOrigin = _printBackup.transformOrigin || '';
    main.style.width = _printBackup.width || '';
    main.style.maxWidth = _printBackup.maxWidth || '';
    main.style.padding = _printBackup.padding || '';
    _printBackup = null;
}

window.addEventListener('beforeprint', preparePrintLayout);
window.addEventListener('afterprint', () => {
    restorePrintLayout();
    scheduleMasonryRelayout();
});

// ════════════════════════════════════════════════════
//  INIT
// ════════════════════════════════════════════════════
initApp();
