/* ============================================================
   个人工作台 - 主脚本
   数据存储: localStorage
   ============================================================ */

// ===== 工具函数 =====
const $ = (sel) => document.querySelector(sel);
const today = () => new Date().toISOString().split('T')[0];
const fmtDate = (d) => {
    const date = new Date(d);
    return `${date.getMonth() + 1}月${date.getDate()}日`;
};
const getWeekDays = () => {
    const days = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        days.push(d.toISOString().split('T')[0]);
    }
    return days;
};
const getWeekDayName = (dateStr) => ['日', '一', '二', '三', '四', '五', '六'][new Date(dateStr).getDay()];

const Storage = {
    get: (key, def = {}) => {
        try { return JSON.parse(localStorage.getItem(key)) || def; }
        catch { return def; }
    },
    set: (key, val) => localStorage.setItem(key, JSON.stringify(val)),
};

let ENGLISH_SENTENCES = [];

// ===== 页面切换 =====
function initNavigation() {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
            document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
            item.classList.add('active');
            document.getElementById(item.dataset.page).classList.add('active');
        });
    });
}

// ===== 显示当前日期 =====
function showCurrentDate() {
    const now = new Date();
    const days = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    $('#currentDate').textContent = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日 ${days[now.getDay()]}`;
}

// ===== 每日计划 =====
function getTodos() { return Storage.get('todos', {}); }
function saveTodos(data) { Storage.set('todos', data); }

function addTodo() {
    const input = $('#todoInput');
    const text = input.value.trim();
    if (!text) return;
    const todos = getTodos();
    const t = today();
    if (!todos[t]) todos[t] = [];
    todos[t].push({ id: Date.now(), text, done: false });
    saveTodos(todos);
    input.value = '';
    renderTodos();
}

function toggleTodo(id) {
    const todos = getTodos();
    const t = today();
    if (todos[t]) {
        const todo = todos[t].find(x => x.id === id);
        if (todo) todo.done = !todo.done;
        saveTodos(todos);
        renderTodos();
    }
}

function deleteTodo(id) {
    const todos = getTodos();
    const t = today();
    if (todos[t]) {
        todos[t] = todos[t].filter(x => x.id !== id);
        saveTodos(todos);
        renderTodos();
    }
}

function renderTodos() {
    const todos = getTodos();
    const t = today();
    const list = todos[t] || [];
    const done = list.filter(x => x.done).length;
    const pct = list.length ? (done / list.length * 100) : 0;
    $('#planProgress').style.width = pct + '%';
    $('#planProgressText').textContent = `${done}/${list.length}`;

    const ul = $('#todoList');
    ul.innerHTML = list.length ? list.map(todo => `
        <li class="todo-item">
            <div class="todo-check ${todo.done ? 'checked' : ''}" onclick="toggleTodo(${todo.id})"></div>
            <span class="todo-text ${todo.done ? 'done' : ''}">${todo.text}</span>
            <span class="todo-delete" onclick="deleteTodo(${todo.id})">×</span>
        </li>
    `).join('') : '<li style="color:#aaa;text-align:center;padding:20px;">还没有任务，添加一个开始吧～</li>';

    // 周统计
    const weekDays = getWeekDays();
    const weekStats = $('#weekStats');
    weekStats.innerHTML = weekDays.map(d => {
        const dayTodos = todos[d] || [];
        const dayDone = dayTodos.filter(x => x.done).length;
        const dayPct = dayTodos.length ? (dayDone / dayTodos.length * 100) : 0;
        const isToday = d === t;
        return `
            <div class="week-day">
                <div class="week-day-label">${getWeekDayName(d)}</div>
                <div class="week-day-bar">
                    <div class="week-day-fill ${isToday ? 'today' : ''}" style="height:${dayPct}%"></div>
                </div>
                <div class="week-day-value">${dayDone}/${dayTodos.length}</div>
            </div>
        `;
    }).join('');
}

// ===== 运动记录 =====
function getExercises() { return Storage.get('exercises', []); }
function saveExercises(data) { Storage.set('exercises', data); }

function addExercise() {
    const type = $('#exerciseType').value;
    const duration = $('#exerciseDuration').value;
    const note = $('#exerciseNote').value.trim();
    if (!duration) { alert('请输入运动时长'); return; }
    const list = getExercises();
    list.unshift({ id: Date.now(), date: today(), type, duration: +duration, note });
    saveExercises(list);
    $('#exerciseDuration').value = '';
    $('#exerciseNote').value = '';
    renderExercises();
}

function renderExercises() {
    const list = getExercises();
    const recent = list.slice(0, 10);
    $('#exerciseList').innerHTML = recent.length ? recent.map(e => `
        <div class="exercise-item">
            <div class="exercise-item-info">
                <span class="exercise-item-type">${e.type}</span>
                <span>${e.duration}分钟</span>
                ${e.note ? `<span class="exercise-item-note">${e.note}</span>` : ''}
            </div>
            <span class="exercise-item-time">${fmtDate(e.date)}</span>
        </div>
    `).join('') : '<div style="color:#aaa;text-align:center;padding:20px;">还没有运动记录</div>';

    // 本周统计
    const weekDays = getWeekDays();
    const weekList = list.filter(e => weekDays.includes(e.date));
    const totalMin = weekList.reduce((s, e) => s + e.duration, 0);
    const count = weekList.length;
    $('#exerciseStats').innerHTML = `
        <div class="stat-pill">本周运动 <span class="stat-pill-value">${count}</span> 次</div>
        <div class="stat-pill">累计时长 <span class="stat-pill-value">${totalMin}</span> 分钟</div>
        <div class="stat-pill">日均 <span class="stat-pill-value">${(totalMin / 7).toFixed(0)}</span> 分钟</div>
    `;
}

// ===== 体重记录 =====
function getWeights() { return Storage.get('weights', []); }
function saveWeights(data) { Storage.set('weights', data); }

function saveWeight() {
    const morning = $('#morningWeight').value;
    const evening = $('#eveningWeight').value;
    if (!morning && !evening) { alert('请至少输入一个体重值'); return; }
    const list = getWeights();
    const t = today();
    const existing = list.find(w => w.date === t);
    if (existing) {
        if (morning) existing.morning = +morning;
        if (evening) existing.evening = +evening;
    } else {
        list.unshift({ date: t, morning: morning ? +morning : null, evening: evening ? +evening : null });
        list.sort((a, b) => b.date.localeCompare(a.date));
    }
    saveWeights(list);
    $('#morningWeight').value = '';
    $('#eveningWeight').value = '';

    // 显示差值
    if (morning && evening) {
        const diff = (+evening - +morning).toFixed(1);
        const text = diff > 0 ? `晚比早重 ${diff} kg` : `晚比早轻 ${Math.abs(diff)} kg`;
        const el = $('#weightDiff');
        el.textContent = `📊 今日体重差：${text}`;
        el.classList.add('show');
        setTimeout(() => el.classList.remove('show'), 5000);
    }
    renderWeights();
}

function renderWeights() {
    const list = getWeights();
    const recent = list.slice(0, 7).reverse();

    // 趋势图
    const allVals = recent.flatMap(w => [w.morning, w.evening].filter(v => v != null));
    const max = allVals.length ? Math.max(...allVals) : 100;
    const min = allVals.length ? Math.min(...allVals) : 50;
    const range = max - min || 1;

    $('#weightChart').innerHTML = recent.length ? recent.map(w => {
        const mh = w.morning ? ((w.morning - min) / range * 80 + 20) : 0;
        const eh = w.evening ? ((w.evening - min) / range * 80 + 20) : 0;
        return `
            <div class="weight-bar">
                <div class="weight-bar-morning" style="height:${mh}px" title="早: ${w.morning || '-'}kg"></div>
                <div class="weight-bar-evening" style="height:${eh}px" title="晚: ${w.evening || '-'}kg"></div>
                <div class="weight-bar-label">${fmtDate(w.date)}</div>
            </div>
        `;
    }).join('') : '<div style="color:#aaa;text-align:center;padding:20px;">还没有体重记录</div>';

    // 历史列表
    $('#weightList').innerHTML = list.length ? list.slice(0, 10).map(w => `
        <div class="weight-item">
            <span>${fmtDate(w.date)}</span>
            <div class="weight-item-values">
                <span>早: <strong>${w.morning || '-'}</strong> kg</span>
                <span>晚: <strong>${w.evening || '-'}</strong> kg</span>
            </div>
        </div>
    `).join('') : '<div style="color:#aaa;text-align:center;padding:20px;">还没有体重记录</div>';
}

// ===== 读书进度 =====
function getBooks() { return Storage.get('books', []); }
function saveBooks(data) { Storage.set('books', data); }

function addBook() {
    const name = $('#bookName').value.trim();
    const current = +$('#bookCurrent').value || 0;
    const total = +$('#bookTotal').value || 1;
    if (!name) { alert('请输入书名'); return; }
    const list = getBooks();
    const existing = list.find(b => b.name === name);
    if (existing) {
        existing.current = current;
        existing.total = total;
    } else {
        list.unshift({ id: Date.now(), name, current, total });
    }
    saveBooks(list);
    $('#bookName').value = '';
    $('#bookCurrent').value = '';
    $('#bookTotal').value = '';
    renderBooks();
}

function updateBookPage(id, delta) {
    const list = getBooks();
    const book = list.find(b => b.id === id);
    if (book) {
        book.current = Math.max(0, Math.min(book.total, book.current + delta));
        saveBooks(list);
        renderBooks();
    }
}

function deleteBook(id) {
    const list = getBooks().filter(b => b.id !== id);
    saveBooks(list);
    renderBooks();
}

function renderBooks() {
    const list = getBooks();
    $('#bookList').innerHTML = list.length ? list.map(b => {
        const pct = Math.min(100, (b.current / b.total * 100)).toFixed(0);
        const done = b.current >= b.total;
        return `
            <div class="book-item">
                <div class="book-item-header">
                    <span class="book-item-name">${done ? '✅' : '📖'} ${b.name}</span>
                    <span class="book-item-progress-text">${pct}%</span>
                </div>
                <div class="book-progress-bar">
                    <div class="book-progress-fill" style="width:${pct}%"></div>
                </div>
                <div class="book-item-pages">
                    ${b.current} / ${b.total} 页
                    <button class="btn btn-secondary" style="padding:2px 8px;font-size:12px;margin-left:10px;" onclick="updateBookPage(${b.id}, -10)">-10</button>
                    <button class="btn btn-secondary" style="padding:2px 8px;font-size:12px;margin:0 4px;" onclick="updateBookPage(${b.id}, 10)">+10</button>
                    <button class="btn btn-secondary" style="padding:2px 8px;font-size:12px;color:#C0392B;" onclick="deleteBook(${b.id})">删除</button>
                </div>
            </div>
        `;
    }).join('') : '<div style="color:#aaa;text-align:center;padding:20px;">书架空空如也，添加一本书开始阅读吧～</div>';
}

// ===== 泡脚打卡 =====
function getFootbath() { return Storage.get('footbath', []); }
function saveFootbath(data) { Storage.set('footbath', data); }

function toggleFootbath() {
    const list = getFootbath();
    const t = today();
    const idx = list.indexOf(t);
    if (idx >= 0) {
        list.splice(idx, 1);
    } else {
        list.push(t);
    }
    saveFootbath(list);
    renderFootbath();
}

function renderFootbath() {
    const list = getFootbath();
    const t = today();
    const doneToday = list.includes(t);

    // 连续天数
    let streak = 0;
    const checkDate = new Date();
    while (true) {
        const ds = checkDate.toISOString().split('T')[0];
        if (list.includes(ds)) {
            streak++;
            checkDate.setDate(checkDate.getDate() - 1);
        } else {
            break;
        }
    }

    const status = $('#footbathStatus');
    status.querySelector('.footbath-icon').classList.toggle('done', doneToday);
    status.querySelector('.footbath-text').textContent = doneToday ? '今日已泡脚 ✨' : '今日还未泡脚';
    $('#footbathStreak').textContent = `连续打卡 ${streak} 天`;

    const btn = $('#footbathBtn');
    btn.textContent = doneToday ? '取消今日打卡' : '打卡泡脚';
    btn.style.background = doneToday ? 'var(--secondary)' : 'var(--primary)';

    // 日历
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const headers = ['日', '一', '二', '三', '四', '五', '六'];
    let html = headers.map(h => `<div class="calendar-header">${h}</div>`).join('');
    for (let i = 0; i < firstDay; i++) html += '<div class="calendar-day other-month"></div>';
    for (let d = 1; d <= daysInMonth; d++) {
        const ds = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const isDone = list.includes(ds);
        const isToday = ds === t;
        html += `<div class="calendar-day ${isDone ? 'done' : ''} ${isToday ? 'today' : ''}">${d}</div>`;
    }
    $('#footbathCalendar').innerHTML = html;
}

// ===== 每日花销 =====
function getExpenses() { return Storage.get('expenses', []); }
function saveExpenses(data) { Storage.set('expenses', data); }

function addExpense() {
    const amount = +$('#expenseAmount').value;
    const category = $('#expenseCategory').value;
    const note = $('#expenseNote').value.trim();
    if (!amount || amount <= 0) { alert('请输入有效金额'); return; }
    const list = getExpenses();
    list.unshift({ id: Date.now(), date: today(), amount, category, note });
    saveExpenses(list);
    $('#expenseAmount').value = '';
    $('#expenseNote').value = '';
    renderExpenses();
}

function deleteExpense(id) {
    const list = getExpenses().filter(e => e.id !== id);
    saveExpenses(list);
    renderExpenses();
}

function renderExpenses() {
    const list = getExpenses();
    const t = today();
    const todayList = list.filter(e => e.date === t);
    const total = todayList.reduce((s, e) => s + e.amount, 0);
    $('#todayTotal').textContent = `¥${total.toFixed(2)}`;

    $('#expenseList').innerHTML = todayList.length ? todayList.map(e => `
        <div class="expense-item">
            <div class="expense-item-left">
                <span class="expense-category-tag tag-${e.category}">${e.category}</span>
                ${e.note ? `<span style="color:#7A7A7A;font-size:13px;">${e.note}</span>` : ''}
            </div>
            <div>
                <span class="expense-item-amount">¥${e.amount.toFixed(2)}</span>
                <span class="todo-delete" style="margin-left:10px;" onclick="deleteExpense(${e.id})">×</span>
            </div>
        </div>
    `).join('') : '<div style="color:#aaa;text-align:center;padding:20px;">今日还没有支出记录</div>';

    // 本月分类统计
    const now = new Date();
    const monthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const monthList = list.filter(e => e.date.startsWith(monthPrefix));
    const byCategory = {};
    monthList.forEach(e => { byCategory[e.category] = (byCategory[e.category] || 0) + e.amount; });
    const monthTotal = monthList.reduce((s, e) => s + e.amount, 0);
    const colors = { '餐饮': '#FF9800', '交通': '#2196F3', '购物': '#9C27B0', '娱乐': '#4CAF50', '学习': '#00BCD4', '医疗': '#F44336', '其他': '#9E9E9E' };

    $('#expenseStats').innerHTML = Object.keys(byCategory).length ? Object.entries(byCategory)
        .sort((a, b) => b[1] - a[1])
        .map(([cat, amt]) => {
            const pct = (amt / monthTotal * 100).toFixed(0);
            return `
                <div class="expense-stat-item">
                    <span class="expense-stat-label">${cat}</span>
                    <div class="expense-stat-bar">
                        <div class="expense-stat-fill" style="width:${pct}%;background:${colors[cat] || '#9E9E9E'};"></div>
                    </div>
                    <span class="expense-stat-value">¥${amt.toFixed(0)}</span>
                </div>
            `;
        }).join('') : '<div style="color:#aaa;text-align:center;padding:20px;">本月还没有支出记录</div>';
}

// ===== 英语学习 =====
function getEnglishHistory() { return Storage.get('englishHistory', {}); }
function saveEnglishHistory(data) { Storage.set('englishHistory', data); }

function getTodayEnglish() {
    const history = getEnglishHistory();
    const t = today();
    if (history[t]) return history[t];
    // 根据日期生成稳定随机10句
    const seed = new Date(t).getTime();
    const selected = [];
    const used = new Set();
    let rng = seed;
    while (selected.length < 10 && selected.length < ENGLISH_SENTENCES.length) {
        rng = (rng * 9301 + 49297) % 233280;
        const idx = Math.floor(rng / 233280 * ENGLISH_SENTENCES.length);
        if (!used.has(idx)) {
            used.add(idx);
            selected.push(ENGLISH_SENTENCES[idx]);
        }
    }
    history[t] = selected;
    saveEnglishHistory(history);
    return selected;
}

function refreshEnglish() {
    const history = getEnglishHistory();
    const t = today();
    const used = new Set((history[t] || []).map(s => s.en));
    const available = ENGLISH_SENTENCES.filter(s => !used.has(s.en));
    const selected = [];
    const pool = available.length >= 10 ? available : ENGLISH_SENTENCES;
    while (selected.length < 10 && selected.length < pool.length) {
        const idx = Math.floor(Math.random() * pool.length);
        if (!selected.includes(pool[idx])) selected.push(pool[idx]);
    }
    history[t] = selected;
    saveEnglishHistory(history);
    renderEnglish();
}

function renderEnglish() {
    const sentences = getTodayEnglish();
    $('#englishDate').textContent = fmtDate(today());
    $('#englishSentences').innerHTML = sentences.map((s, i) => `
        <div class="english-item" onclick="this.querySelector('.english-cn').style.opacity=this.querySelector('.english-cn').style.opacity==='0.5'?'1':'0.5'">
            <div class="english-en">${i + 1}. ${s.en}</div>
            <div class="english-cn" style="opacity:0.7;">${s.cn}</div>
        </div>
    `).join('');

    // 历史
    const history = getEnglishHistory();
    const dates = Object.keys(history).sort().reverse().slice(0, 7);
    $('#englishHistory').innerHTML = dates.length ? dates.map(d => `
        <div class="english-history-item">${fmtDate(d)} - 学习了 ${history[d].length} 句</div>
    `).join('') : '<div style="color:#aaa;text-align:center;padding:20px;">还没有学习记录</div>';
}

// ===== 舞蹈学习 =====
function getDances() { return Storage.get('dances', []); }
function saveDances(data) { Storage.set('dances', data); }

function addDance() {
    const name = $('#danceName').value.trim();
    const duration = +$('#danceDuration').value || 0;
    const level = $('#danceLevel').value;
    const content = $('#danceContent').value.trim();
    if (!name) { alert('请输入舞蹈名称'); return; }
    const list = getDances();
    list.unshift({ id: Date.now(), date: today(), name, duration, level, content });
    saveDances(list);
    $('#danceName').value = '';
    $('#danceDuration').value = '';
    $('#danceContent').value = '';
    renderDances();
}

function deleteDance(id) {
    const list = getDances().filter(d => d.id !== id);
    saveDances(list);
    renderDances();
}

function renderDances() {
    const list = getDances();
    const recent = list.slice(0, 20);
    $('#danceList').innerHTML = recent.length ? recent.map(d => `
        <div class="dance-item">
            <div class="dance-item-header">
                <span class="dance-item-name">💃 ${d.name}</span>
                <span class="dance-level-badge level-${d.level}">${d.level}</span>
            </div>
            <div class="dance-item-meta">
                <span>📅 ${fmtDate(d.date)}</span>
                <span>⏱ ${d.duration} 分钟</span>
            </div>
            ${d.content ? `<div class="dance-item-content">${d.content}</div>` : ''}
            <div style="margin-top:8px;text-align:right;">
                <button class="btn btn-secondary" style="padding:2px 10px;font-size:12px;color:#C0392B;" onclick="deleteDance(${d.id})">删除</button>
            </div>
        </div>
    `).join('') : '<div style="color:#aaa;text-align:center;padding:20px;">还没有舞蹈练习记录</div>';

    // 统计
    const weekDays = getWeekDays();
    const weekList = list.filter(d => weekDays.includes(d.date));
    const totalMin = weekList.reduce((s, d) => s + d.duration, 0);
    const uniqueDances = new Set(list.map(d => d.name));
    const levelCounts = {};
    list.forEach(d => { levelCounts[d.level] = (levelCounts[d.level] || 0) + 1; });

    $('#danceStats').innerHTML = `
        <div class="stat-pill">学习舞种 <span class="stat-pill-value">${uniqueDances.size}</span> 支</div>
        <div class="stat-pill">总记录 <span class="stat-pill-value">${list.length}</span> 次</div>
        <div class="stat-pill">本周时长 <span class="stat-pill-value">${totalMin}</span> 分钟</div>
        ${Object.entries(levelCounts).map(([lv, n]) => `<div class="stat-pill">${lv} <span class="stat-pill-value">${n}</span></div>`).join('')}
    `;
}

// ===== 初始化 =====
async function init() {
    showCurrentDate();
    initNavigation();

    // 加载英语句子库
    try {
        const res = await fetch('english-sentences.json');
        ENGLISH_SENTENCES = await res.json();
    } catch (e) {
        console.error('加载英语库失败', e);
        ENGLISH_SENTENCES = [{ en: 'Hello!', cn: '你好！' }];
    }

    // 回车添加待办
    $('#todoInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTodo();
    });

    // 渲染所有模块
    renderTodos();
    renderExercises();
    renderWeights();
    renderBooks();
    renderFootbath();
    renderExpenses();
    renderEnglish();
    renderDances();
}

document.addEventListener('DOMContentLoaded', init);
