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
let QUOTES = [];
let ENGLISH_WORDS = [];

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

// ===== 开屏页 =====
function initSplash() {
    const now = new Date();
    const days = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    $('#splashDate').textContent = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日 ${days[now.getDay()]}`;

    // 每日鼓励语
    const encouragements = [
        '今天也是元气满满的一天，加油！',
        '每一步都算数，你正在变好。',
        '坚持比完美更重要，做就对了。',
        '你比想象中更强大。',
        '今天的努力，是明天的底气。',
        '小步快跑，日拱一卒。',
        '保持热爱，奔赴山海。',
        '种一棵树最好的时间是十年前，其次是现在。',
        '把简单的事做到极致，就是不简单。',
        '你只管努力，剩下的交给时间。'
    ];
    const idx = now.getDate() % encouragements.length;
    $('#splashQuote').textContent = encouragements[idx];
}

function enterApp() {
    $('#splash').classList.add('hide');
    setTimeout(() => {
        $('#splash').style.display = 'none';
    }, 600);
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

// ===== 体重记录（早晚分开保存，按日期索引）=====
function getWeights() {
    // 数据迁移：旧的数组格式转成对象格式
    const raw = Storage.get('weights', {});
    if (Array.isArray(raw)) {
        const migrated = {};
        raw.forEach(w => {
            if (w && w.date) {
                migrated[w.date] = { morning: w.morning || null, evening: w.evening || null };
            }
        });
        Storage.set('weights', migrated);
        return migrated;
    }
    return raw;
}
function saveWeights(data) { Storage.set('weights', data); }

function saveMorningWeight() {
    const val = $('#morningWeight').value;
    if (!val) { alert('请输入早晨体重'); return; }
    const weights = getWeights();
    const t = today();
    if (!weights[t]) weights[t] = { morning: null, evening: null };
    weights[t].morning = +val;
    saveWeights(weights);
    $('#morningWeight').value = '';
    showWeightDiff(weights[t]);
    renderWeights();
}

function saveEveningWeight() {
    const val = $('#eveningWeight').value;
    if (!val) { alert('请输入晚上体重'); return; }
    const weights = getWeights();
    const t = today();
    if (!weights[t]) weights[t] = { morning: null, evening: null };
    weights[t].evening = +val;
    saveWeights(weights);
    $('#eveningWeight').value = '';
    showWeightDiff(weights[t]);
    renderWeights();
}

function showWeightDiff(dayData) {
    if (dayData.morning && dayData.evening) {
        const diff = (dayData.evening - dayData.morning).toFixed(1);
        const text = diff > 0 ? `晚比早重 ${diff} kg` : (diff < 0 ? `晚比早轻 ${Math.abs(diff)} kg` : '早晚相同');
        const el = $('#weightDiff');
        el.textContent = `📊 今日体重差：${text}`;
        el.classList.add('show');
    }
}

function renderWeights() {
    const weights = getWeights();
    const dates = Object.keys(weights).sort().reverse();
    const recent7 = dates.slice(0, 7).reverse();

    // 趋势图
    const allVals = [];
    recent7.forEach(d => {
        if (weights[d].morning) allVals.push(weights[d].morning);
        if (weights[d].evening) allVals.push(weights[d].evening);
    });
    const max = allVals.length ? Math.max(...allVals) : 100;
    const min = allVals.length ? Math.min(...allVals) : 50;
    const range = max - min || 1;

    $('#weightChart').innerHTML = recent7.length ? recent7.map(d => {
        const w = weights[d];
        const mh = w.morning ? ((w.morning - min) / range * 80 + 20) : 0;
        const eh = w.evening ? ((w.evening - min) / range * 80 + 20) : 0;
        return `
            <div class="weight-bar">
                <div class="weight-bar-morning" style="height:${mh}px" title="早: ${w.morning || '-'}kg"></div>
                <div class="weight-bar-evening" style="height:${eh}px" title="晚: ${w.evening || '-'}kg"></div>
                <div class="weight-bar-label">${fmtDate(d)}</div>
            </div>
        `;
    }).join('') : '<div style="color:#aaa;text-align:center;padding:20px;">还没有体重记录</div>';

    // 历史列表
    $('#weightList').innerHTML = dates.length ? dates.slice(0, 10).map(d => {
        const w = weights[d];
        const diff = (w.morning && w.evening) ? (w.evening - w.morning).toFixed(1) : null;
        return `
            <div class="weight-item">
                <span>${fmtDate(d)} 周${getWeekDayName(d)}</span>
                <div class="weight-item-values">
                    <span>🌅 <strong>${w.morning || '-'}</strong></span>
                    <span>🌙 <strong>${w.evening || '-'}</strong></span>
                    ${diff !== null ? `<span style="color:${diff > 0 ? '#E65100' : '#388E3C'};font-size:12px;">差 ${diff > 0 ? '+' : ''}${diff}</span>` : ''}
                </div>
            </div>
        `;
    }).join('') : '<div style="color:#aaa;text-align:center;padding:20px;">还没有体重记录</div>';
}

// ===== 读书进度 =====
function getBooks() { return Storage.get('books', []); }
function saveBooks(data) { Storage.set('books', data); }

function addBook() {
    const name = $('#bookName').value.trim();
    const author = $('#bookAuthor').value.trim();
    const tag = $('#bookTag').value.trim();
    const core = $('#bookCore').value.trim();
    const current = +$('#bookCurrent').value || 0;
    const total = +$('#bookTotal').value || 1;
    if (!name) { alert('请输入书名'); return; }
    const list = getBooks();
    const existing = list.find(b => b.name === name);
    if (existing) {
        existing.author = author;
        existing.tag = tag;
        existing.core = core;
        existing.current = current;
        existing.total = total;
    } else {
        list.unshift({ id: Date.now(), name, author, tag, core, current, total, reflections: [] });
    }
    saveBooks(list);
    $('#bookName').value = '';
    $('#bookAuthor').value = '';
    $('#bookTag').value = '';
    $('#bookCore').value = '';
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

function addBookReflection(id) {
    const list = getBooks();
    const book = list.find(b => b.id === id);
    if (!book) return;
    const anchor = prompt('💡 锚点：这段最戳我的一句话', '');
    if (anchor === null) return;
    const connect = prompt('🔗 连接：想到我生活/工作里的___', '');
    if (connect === null) return;
    const action = prompt('🎯 行动：这周能做的一件小事', '');
    if (action === null) return;
    if (!book.reflections) book.reflections = [];
    book.reflections.unshift({ date: today(), anchor, connect, action });
    saveBooks(list);
    renderBooks();
}

function renderBooks() {
    const list = getBooks();
    $('#bookList').innerHTML = list.length ? list.map(b => {
        const pct = Math.min(100, (b.current / b.total * 100)).toFixed(0);
        const done = b.current >= b.total;
        const reflections = b.reflections || [];
        return `
            <div class="book-item">
                <div class="book-item-header">
                    <span class="book-item-name">${done ? '✅' : '📖'} ${b.name}</span>
                    ${b.tag ? `<span class="book-tag">${b.tag}</span>` : ''}
                    <span class="book-item-progress-text">${pct}%</span>
                </div>
                ${b.author ? `<div class="book-author">${b.author}</div>` : ''}
                <div class="book-progress-bar">
                    <div class="book-progress-fill" style="width:${pct}%"></div>
                </div>
                <div class="book-item-pages">
                    ${b.current} / ${b.total} 页
                    <button class="btn btn-secondary" style="padding:2px 8px;font-size:12px;margin-left:10px;" onclick="updateBookPage(${b.id}, -10)">-10</button>
                    <button class="btn btn-secondary" style="padding:2px 8px;font-size:12px;margin:0 4px;" onclick="updateBookPage(${b.id}, 10)">+10</button>
                    <button class="btn btn-secondary" style="padding:2px 8px;font-size:12px;color:#C0392B;" onclick="deleteBook(${b.id})">删除</button>
                </div>
                ${b.core ? `<div class="book-core">📌 核心观点：${b.core}</div>` : ''}
                <div style="margin-top:8px;">
                    <button class="btn btn-primary" style="padding:4px 12px;font-size:12px;" onclick="addBookReflection(${b.id})">📝 读后三问</button>
                    ${done ? '<span style="color:#4CAF50;font-size:12px;margin-left:8px;">✓ 已读完</span>' : ''}
                </div>
                ${reflections.length ? `
                    <div class="book-reflections">
                        ${reflections.slice(0, 3).map(r => `
                            <div class="reflection-item">
                                <div class="reflection-date">${fmtDate(r.date)}</div>
                                <div>💡 ${r.anchor}</div>
                                <div>🔗 ${r.connect}</div>
                                <div>🎯 ${r.action}</div>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        `;
    }).join('') : '<div style="color:#aaa;text-align:center;padding:20px;">书架空空如也，添加一本书开始阅读吧～</div>';
}

// ===== 每日金句（读书模块）=====
function getQuoteHistory() { return Storage.get('quoteHistory', {}); }
function saveQuoteHistory(data) { Storage.set('quoteHistory', data); }

function getTodayQuote() {
    const history = getQuoteHistory();
    const t = today();
    if (history[t]) return history[t];
    // 根据日期种子生成稳定金句
    const seed = new Date(t).getTime();
    const idx = seed % QUOTES.length;
    const quote = { ...QUOTES[idx], idx };
    history[t] = quote;
    saveQuoteHistory(history);
    return quote;
}

function refreshQuote() {
    if (!QUOTES.length) return;
    const history = getQuoteHistory();
    const t = today();
    const currentIdx = history[t] ? history[t].idx : -1;
    let newIdx;
    do {
        newIdx = Math.floor(Math.random() * QUOTES.length);
    } while (newIdx === currentIdx && QUOTES.length > 1);
    const quote = { ...QUOTES[newIdx], idx: newIdx };
    history[t] = quote;
    saveQuoteHistory(history);
    renderQuote();
}

function renderQuote() {
    if (!QUOTES.length) {
        $('#quoteContent').innerHTML = '<div style="color:#aaa;text-align:center;padding:20px;">金句库加载中...</div>';
        return;
    }
    const q = getTodayQuote();
    $('#quoteContent').innerHTML = `
        <div class="quote-text">${q.text}</div>
        <div class="quote-author">—— ${q.author}</div>
    `;
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

// ===== 小账本（含本周/本月/本年三栏汇总 + 编辑）=====
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

function editExpense(id) {
    const list = getExpenses();
    const e = list.find(x => x.id === id);
    if (!e) return;
    const newAmount = prompt('修改金额（元）：', e.amount);
    if (newAmount === null) return;
    const amt = +newAmount;
    if (!amt || amt <= 0) { alert('金额无效'); return; }
    const newNote = prompt('修改备注：', e.note || '');
    if (newNote === null) return;
    e.amount = amt;
    e.note = newNote.trim();
    saveExpenses(list);
    renderExpenses();
}

function calcWeekTotal() {
    const list = getExpenses();
    const now = new Date();
    // 周一为一周起点
    const dayOfWeek = (now.getDay() + 6) % 7; // 0=周一
    const monday = new Date(now);
    monday.setDate(now.getDate() - dayOfWeek);
    monday.setHours(0, 0, 0, 0);
    const weekList = list.filter(e => new Date(e.date) >= monday);
    return { total: weekList.reduce((s, e) => s + e.amount, 0), count: weekList.length };
}

function calcMonthTotal() {
    const list = getExpenses();
    const now = new Date();
    const prefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const monthList = list.filter(e => e.date.startsWith(prefix));
    return { total: monthList.reduce((s, e) => s + e.amount, 0), count: monthList.length };
}

function calcYearTotal() {
    const list = getExpenses();
    const yearPrefix = `${new Date().getFullYear()}-`;
    const yearList = list.filter(e => e.date.startsWith(yearPrefix));
    return { total: yearList.reduce((s, e) => s + e.amount, 0), count: yearList.length };
}

function renderExpenses() {
    const list = getExpenses();
    const t = today();

    // 三栏汇总
    const week = calcWeekTotal();
    const month = calcMonthTotal();
    const year = calcYearTotal();
    $('#expenseOverview').innerHTML = `
        <div class="overview-card week">
            <div class="overview-label">📅 本周支出</div>
            <div class="overview-amount">¥${week.total.toFixed(2)}</div>
            <div class="overview-count">${week.count} 笔</div>
        </div>
        <div class="overview-card month">
            <div class="overview-label">📆 本月支出</div>
            <div class="overview-amount">¥${month.total.toFixed(2)}</div>
            <div class="overview-count">${month.count} 笔</div>
        </div>
        <div class="overview-card year">
            <div class="overview-label">🎯 本年支出</div>
            <div class="overview-amount">¥${year.total.toFixed(2)}</div>
            <div class="overview-count">${year.count} 笔</div>
        </div>
    `;

    // 今日明细
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
                <span class="todo-delete" style="margin-left:6px;color:#2196F3;" title="修改" onclick="editExpense(${e.id})">✎</span>
                <span class="todo-delete" style="margin-left:6px;" title="删除" onclick="deleteExpense(${e.id})">×</span>
            </div>
        </div>
    `).join('') : '<div style="color:#aaa;text-align:center;padding:20px;">今日还没有支出记录</div>';

    // 本月分类统计
    const monthData = calcMonthTotal();
    const monthList = list.filter(e => e.date.startsWith(`${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`));
    const byCategory = {};
    monthList.forEach(e => { byCategory[e.category] = (byCategory[e.category] || 0) + e.amount; });
    const monthTotal = monthData.total;
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

// ===== 每日单词 =====
function getWordHistory() { return Storage.get('wordHistory', {}); }
function saveWordHistory(data) { Storage.set('wordHistory', data); }

function getTodayWords() {
    const history = getWordHistory();
    const t = today();
    if (history[t]) return history[t];
    // 根据日期种子生成稳定10词
    const seed = new Date(t).getTime();
    const selected = [];
    const used = new Set();
    let rng = seed;
    while (selected.length < 10 && selected.length < ENGLISH_WORDS.length) {
        rng = (rng * 9301 + 49297) % 233280;
        const idx = Math.floor(rng / 233280 * ENGLISH_WORDS.length);
        if (!used.has(idx)) {
            used.add(idx);
            selected.push(ENGLISH_WORDS[idx]);
        }
    }
    history[t] = selected;
    saveWordHistory(history);
    return selected;
}

function refreshWords() {
    if (!ENGLISH_WORDS.length) return;
    const history = getWordHistory();
    const t = today();
    const used = new Set((history[t] || []).map(w => w.word));
    const available = ENGLISH_WORDS.filter(w => !used.has(w.word));
    const pool = available.length >= 10 ? available : ENGLISH_WORDS;
    const selected = [];
    while (selected.length < 10 && selected.length < pool.length) {
        const idx = Math.floor(Math.random() * pool.length);
        if (!selected.includes(pool[idx])) selected.push(pool[idx]);
    }
    history[t] = selected;
    saveWordHistory(history);
    renderWords();
}

function renderWords() {
    if (!ENGLISH_WORDS.length) {
        $('#wordList').innerHTML = '<div style="color:var(--text-light);text-align:center;padding:20px;">单词库加载中...</div>';
        return;
    }
    const words = getTodayWords();
    $('#wordList').innerHTML = words.map((w, i) => `
        <div class="word-item">
            <div class="word-en">${i + 1}. ${w.word}</div>
            <div class="word-phonetic">${w.phonetic}</div>
            <div class="word-cn">${w.meaning}</div>
        </div>
    `).join('');
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

// ===== 播客笔记 =====
function getPodcastNotes() { return Storage.get('podcastNotes', []); }
function savePodcastNotes(data) { Storage.set('podcastNotes', data); }

function addPodcastNote() {
    const podcast = $('#podcastSelect').value;
    const note = $('#podcastNote').value.trim();
    if (!note) { alert('请输入笔记内容'); return; }
    const list = getPodcastNotes();
    list.unshift({ id: Date.now(), date: today(), podcast, note });
    savePodcastNotes(list);
    $('#podcastNote').value = '';
    renderPodcastNotes();
}

function deletePodcastNote(id) {
    savePodcastNotes(getPodcastNotes().filter(n => n.id !== id));
    renderPodcastNotes();
}

function renderPodcastNotes() {
    const list = getPodcastNotes();
    $('#podcastList').innerHTML = list.length ? list.map(n => `
        <div class="podcast-note-item">
            <div class="podcast-note-header">
                <span class="podcast-note-podcast">${n.podcast}</span>
                <span class="podcast-note-date">${fmtDate(n.date)}</span>
                <span class="todo-delete" style="margin-left:auto;" onclick="deletePodcastNote(${n.id})">×</span>
            </div>
            <div class="podcast-note-text">${n.note}</div>
        </div>
    `).join('') : '<div style="color:#aaa;text-align:center;padding:20px;">还没有笔记，记第一笔吧～</div>';
}

// ===== 粤语学习 =====
let CANTONESE_SENTENCES = [];

function getCantonese() { return Storage.get('cantonese', []); }
function saveCantonese(data) { Storage.set('cantonese', data); }

function toggleCantonese() {
    const list = getCantonese();
    const t = today();
    const idx = list.indexOf(t);
    if (idx >= 0) {
        list.splice(idx, 1);
    } else {
        list.push(t);
    }
    saveCantonese(list);
    renderCantonese();
}

function renderCantonese() {
    const list = getCantonese();
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

    $('#streakNumber').textContent = streak;
    const btn = $('#cantoneseBtn');
    btn.textContent = doneToday ? '已打卡 ✓' : '打卡 ✓';
    btn.style.background = doneToday ? 'var(--secondary)' : 'var(--primary)';

    // 50句列表
    $('#cantoneseList').innerHTML = CANTONESE_SENTENCES.length ? CANTONESE_SENTENCES.map((s, i) => `
        <div class="cantonese-item">
            <span class="cantonese-rank">${i + 1}</span>
            <div class="cantonese-text">
                <div class="cantonese-cant">${s.cantonese}</div>
                <div class="cantonese-mand">${s.mandarin}</div>
            </div>
            <span class="cantonese-scene">${s.scene}</span>
        </div>
    `).join('') : '<div style="color:#aaa;text-align:center;padding:20px;">加载中...</div>';
}

// ===== 工作催款（按收货人分组）=====
const PAYMENT_STEPS = [
    { key: 'order',   label: '①下单',     short: '下单' },
    { key: 'inspect', label: '②验货',     short: '验货' },
    { key: 'invoice', label: '③发票',     short: '发票' },
    { key: 'accept',  label: '④验收单',   short: '验收' },
    { key: 'deliver', label: '⑤交付客户', short: '交付' },
    { key: 'upload',  label: '⑥客户上传', short: '上传' },
    { key: 'finance', label: '⑦交财务',   short: '财务' },
    { key: 'paid',    label: '⑧回款到账', short: '到账' }
];

function getPayments() { return Storage.get('payments', []); }
function savePayments(data) { Storage.set('payments', data); }

function addPayment() {
    const receiver = $('#paymentReceiver').value.trim();
    const orderId = $('#paymentOrderId').value.trim();
    const amount = +$('#paymentAmount').value;
    const orderDate = $('#paymentOrderDate').value || today();
    if (!receiver) { alert('请输入收货人'); return; }
    if (!orderId) { alert('请输入订单号'); return; }
    if (!amount || amount <= 0) { alert('请输入有效金额'); return; }

    const list = getPayments();
    const steps = {};
    PAYMENT_STEPS.forEach(s => steps[s.key] = '');
    steps.order = orderDate; // 默认填入下单日期

    list.unshift({
        id: Date.now(),
        receiver,
        orderId,
        amount,
        orderDate,
        steps,
        nextAction: ''
    });
    savePayments(list);
    $('#paymentReceiver').value = '';
    $('#paymentOrderId').value = '';
    $('#paymentAmount').value = '';
    $('#paymentOrderDate').value = '';
    renderPayments();
}

function isClosed(p) { return !!p.steps.paid; }

function getCompletedStepCount(p) {
    return PAYMENT_STEPS.filter(s => p.steps[s.key]).length;
}

function deletePayment(id) {
    if (!confirm('确定删除这笔订单？此操作不可撤销。')) return;
    savePayments(getPayments().filter(p => p.id !== id));
    renderPayments();
}

function togglePaymentStep(id, stepKey) {
    const list = getPayments();
    const p = list.find(x => x.id === id);
    if (!p) return;
    if (p.steps[stepKey]) {
        p.steps[stepKey] = ''; // 取消
    } else {
        p.steps[stepKey] = today(); // 标记完成
    }
    savePayments(list);
    renderPayments();
}

function editPaymentStep(id, stepKey) {
    const list = getPayments();
    const p = list.find(x => x.id === id);
    if (!p) return;
    const newVal = prompt(`${PAYMENT_STEPS.find(s => s.key === stepKey).label} 日期：`, p.steps[stepKey] || '');
    if (newVal === null) return;
    p.steps[stepKey] = newVal.trim();
    savePayments(list);
    renderPayments();
}

function editPaymentAction(id) {
    const list = getPayments();
    const p = list.find(x => x.id === id);
    if (!p) return;
    const newVal = prompt('下一步动作 / 跟进记录：', p.nextAction || '');
    if (newVal === null) return;
    p.nextAction = newVal.trim();
    savePayments(list);
    renderPayments();
}

function renderPayments() {
    const list = getPayments();

    // 整体概览
    const total = list.length;
    const closed = list.filter(isClosed).length;
    const totalAmount = list.reduce((s, p) => s + p.amount, 0);
    const closedAmount = list.filter(isClosed).reduce((s, p) => s + p.amount, 0);
    const avgProgress = total ? (list.reduce((s, p) => s + getCompletedStepCount(p), 0) / (total * 8) * 100).toFixed(0) : 0;

    $('#workOverview').innerHTML = total ? `
        <div class="stat-pill">订单总数 <span class="stat-pill-value">${total}</span></div>
        <div class="stat-pill">已闭环 <span class="stat-pill-value">${closed}</span></div>
        <div class="stat-pill">未闭环 <span class="stat-pill-value">${total - closed}</span></div>
        <div class="stat-pill">总金额 <span class="stat-pill-value">¥${totalAmount.toFixed(0)}</span></div>
        <div class="stat-pill">已回款 <span class="stat-pill-value">¥${closedAmount.toFixed(0)}</span></div>
        <div class="stat-pill">平均进度 <span class="stat-pill-value">${avgProgress}%</span></div>
    ` : '<div style="color:#aaa;text-align:center;padding:20px;">还没有订单记录</div>';

    // 按收货人分组
    const groups = {};
    list.forEach(p => {
        if (!groups[p.receiver]) groups[p.receiver] = [];
        groups[p.receiver].push(p);
    });

    const groupHtml = Object.keys(groups).length ? Object.entries(groups).map(([receiver, items]) => {
        const groupTotal = items.reduce((s, p) => s + p.amount, 0);
        const groupClosed = items.filter(isClosed).length;
        const groupOpen = items.length - groupClosed;
        const groupClosedAmount = items.filter(isClosed).reduce((s, p) => s + p.amount, 0);

        const itemsHtml = items.map(p => {
            const completed = getCompletedStepCount(p);
            const pct = (completed / 8 * 100).toFixed(0);
            const closed = isClosed(p);
            const stepsHtml = PAYMENT_STEPS.map(s => {
                const done = !!p.steps[s.key];
                return `<span class="step-dot ${done ? 'done' : ''} ${s.key === 'paid' ? 'final' : ''}" title="${s.label}: ${p.steps[s.key] || '未完成'}" onclick="editPaymentStep(${p.id}, '${s.key}')">${s.short}</span>`;
            }).join('');
            return `
                <div class="payment-item ${closed ? 'closed' : ''}">
                    <div class="payment-item-header">
                        <span class="payment-order-id">${p.orderId}</span>
                        <span class="payment-amount">¥${p.amount.toFixed(2)}</span>
                        <span class="payment-status ${closed ? 'status-closed' : 'status-open'}">${closed ? '✅ 已闭环' : '⏳ 进行中'}</span>
                        <span class="todo-delete" style="margin-left:auto;" title="删除" onclick="deletePayment(${p.id})">×</span>
                    </div>
                    <div class="payment-progress">
                        <div class="payment-progress-bar"><div class="payment-progress-fill" style="width:${pct}%"></div></div>
                        <span class="payment-progress-text">${completed}/8</span>
                    </div>
                    <div class="payment-steps">${stepsHtml}</div>
                    <div class="payment-action">
                        <span class="payment-action-label" onclick="editPaymentAction(${p.id})">
                            ${p.nextAction ? '📌 ' + p.nextAction : '➕ 点击添加下一步动作'}
                        </span>
                    </div>
                    <div style="font-size:11px;color:#999;margin-top:4px;">下单：${p.orderDate}</div>
                </div>
            `;
        }).join('');

        return `
            <div class="payment-group">
                <div class="payment-group-header">
                    <span class="payment-receiver">👤 ${receiver}</span>
                    <span class="payment-group-meta">
                        ${items.length} 笔 · ¥${groupTotal.toFixed(0)} ·
                        <span style="color:${groupOpen ? '#E65100' : '#388E3C'};">${groupOpen ? groupOpen + ' 笔未闭环' : '全部闭环 ✅'}</span>
                    </span>
                </div>
                <div class="payment-group-items">${itemsHtml}</div>
            </div>
        `;
    }).join('') : '<div style="color:#aaa;text-align:center;padding:20px;">还没有订单，添加第一笔开始追踪</div>';

    $('#paymentGroups').innerHTML = groupHtml;
}

// ===== 初始化 =====
async function init() {
    // 开屏页
    initSplash();

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

    // 加载中文金句库
    try {
        const res = await fetch('quotes.json');
        QUOTES = await res.json();
    } catch (e) {
        console.error('加载金句库失败', e);
        QUOTES = [{ text: '千里之行，始于足下。', author: '《老子》' }];
    }

    // 加载英语单词库
    try {
        const res = await fetch('english-words.json');
        ENGLISH_WORDS = await res.json();
    } catch (e) {
        console.error('加载单词库失败', e);
        ENGLISH_WORDS = [{ word: 'hello', phonetic: '/həˈloʊ/', meaning: 'int. 你好' }];
    }

    // 加载粤语句子库
    try {
        const res = await fetch('cantonese.json');
        CANTONESE_SENTENCES = await res.json();
    } catch (e) {
        console.error('加载粤语库失败', e);
        CANTONESE_SENTENCES = [];
    }

    // 回车添加待办
    $('#todoInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTodo();
    });

    // 默认填入今日日期到下单日期
    $('#paymentOrderDate').value = today();

    // 渲染所有模块
    renderTodos();
    renderExercises();
    renderWeights();
    renderBooks();
    renderQuote();
    renderFootbath();
    renderExpenses();
    renderEnglish();
    renderWords();
    renderDances();
    renderPayments();
    renderPodcastNotes();
    renderCantonese();
}

document.addEventListener('DOMContentLoaded', init);
