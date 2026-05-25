/* ══════════════════════════════════════════════════
   Thabeha — WhatsApp Business Dashboard
   Frontend-only demo: state lives in memory.
   For production, swap receiveMessage / sendMessage
   to call the WhatsApp Business Cloud API.
══════════════════════════════════════════════════ */

"use strict";

// ─── COUNTERS ────────────────────────────────────
let _msgId  = 200;
let _convId = 10;
const uid = () => 'm' + (++_msgId);
const cuid = () => 'c' + (++_convId);

// ─── HELPERS ─────────────────────────────────────
const now = () => {
  const d = new Date();
  return d.getHours().toString().padStart(2,'0') + ':' + d.getMinutes().toString().padStart(2,'0');
};
const initials = name =>
  name.split(' ').filter(Boolean).map(w => w[0]).slice(0, 2).join('').toUpperCase();
const esc = s =>
  s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const br  = s => esc(s).replace(/\n/g,'<br>');

// ─── INITIAL CONVERSATION DATA ────────────────────
const conversations = [
  {
    id: 'c1',
    name: 'أحمد الراشد',
    phone: '+966501234567',
    color: '#E91E63',
    status: 'online',
    botEnabled: true,
    date: 'Today',
    messages: [
      { id:'m1',  text:'مرحبا، هل عندكم لحم بقر طازج اليوم؟', dir:'in',  time:'09:30', status:'read' },
      { id:'m2',  text:'أهلاً بك في ذبيحة! 🥩 نعم لدينا لحم بقر طازج ممتاز اليوم.', dir:'out', time:'09:31', status:'read', isBot:true },
      { id:'m3',  text:'ما هو السعر للكيلو؟', dir:'in',  time:'09:32', status:'read' },
      { id:'m4',  text:'أسعارنا:\n🥩 لحم بقر: 65 ريال/كيلو\n🐑 لحم غنم: 75 ريال/كيلو\n🐔 دجاج: 30 ريال/كيلو', dir:'out', time:'09:33', status:'read', isBot:true },
      { id:'m5',  text:'ممتاز! أريد طلب 5 كيلو بقر', dir:'in',  time:'09:35', status:'unread' },
    ]
  },
  {
    id: 'c2',
    name: 'سارة عبدالله',
    phone: '+966551234567',
    color: '#009688',
    status: 'last seen today at 10:15',
    botEnabled: false,
    date: 'Today',
    messages: [
      { id:'m1', text:'السلام عليكم 👋', dir:'in',  time:'10:00', status:'read' },
      { id:'m2', text:'وعليكم السلام سارة! كيف يمكنني مساعدتك اليوم؟', dir:'out', time:'10:01', status:'read', isBot:false },
      { id:'m3', text:'أبي أعرف هل عندكم دجاج بلدي؟', dir:'in',  time:'10:02', status:'read' },
      { id:'m4', text:'نعم لدينا دجاج بلدي طازج اليوم! السعر 45 ريال/كيلو.', dir:'out', time:'10:05', status:'delivered', isBot:false },
      { id:'m5', text:'تمام! بكره أطلب إن شاء الله 😊', dir:'in',  time:'10:06', status:'read' },
    ]
  },
  {
    id: 'c3',
    name: 'محمد العتيبي',
    phone: '+966561234567',
    color: '#2196F3',
    status: 'last seen yesterday',
    botEnabled: true,
    date: 'Yesterday',
    messages: [
      { id:'m1', text:'طلبي رقم 1234 لم يصل وتأخر كثير!', dir:'in',  time:'14:00', status:'read' },
      { id:'m2', text:'نأسف على هذا التأخير محمد. يرجى مشاركة رقم الطلب الكامل لمتابعته فوراً.', dir:'out', time:'14:05', status:'read', isBot:true },
      { id:'m3', text:'الرقم: #TH-1234', dir:'in',  time:'14:06', status:'read' },
      { id:'m4', text:'✅ تم التحقق من طلبك. هو في الطريق إليك الآن! الوقت المتوقع: 20 دقيقة.', dir:'out', time:'14:10', status:'read', isBot:true },
      { id:'m5', text:'شكراً جزيلاً 🙏', dir:'in',  time:'14:12', status:'unread' },
    ]
  },
  {
    id: 'c4',
    name: 'فاطمة الزهراني',
    phone: '+966571234567',
    color: '#FF9800',
    status: 'online',
    botEnabled: false,
    date: 'Today',
    messages: [
      { id:'m1', text:'هلا! كيف أطلب من موقعكم؟', dir:'in',  time:'11:30', status:'read' },
      { id:'m2', text:'أهلاً فاطمة! يمكنك الطلب عبر موقعنا thabeha.com أو مراسلتنا هنا مباشرة 😊', dir:'out', time:'11:32', status:'read', isBot:false },
    ]
  },
  {
    id: 'c5',
    name: 'خالد السعود',
    phone: '+966581234567',
    color: '#9C27B0',
    status: 'last seen today at 08:20',
    botEnabled: true,
    date: 'Today',
    messages: [
      { id:'m1', text:'أبي نفس الطلب اللي سويته الأسبوع الماضي', dir:'in',  time:'08:00', status:'read' },
      { id:'m2', text:'بكل سرور خالد! 🌟 لحم بقر 3 كيلو + دجاج 2 كيلو — هذا صح؟', dir:'out', time:'08:05', status:'read', isBot:true },
      { id:'m3', text:'نعم بالضبط 👍', dir:'in',  time:'08:06', status:'read' },
      { id:'m4', text:'تم تأكيد طلبك! سيصل إليك خلال ساعة إن شاء الله 🚚', dir:'out', time:'08:10', status:'read', isBot:true },
    ]
  },
];

// ─── BOT RESPONSES ────────────────────────────────
const BOT_RESPONSES = [
  {
    pattern: /سعر|price|كم|بكم|تكلف|how much/i,
    reply: `أسعارنا الحالية:\n🥩 لحم بقر طازج: 65 ريال/كيلو\n🐑 لحم غنم طازج: 75 ريال/كيلو\n🐔 دجاج: 30 ريال/كيلو\n🐔 دجاج بلدي: 45 ريال/كيلو\nللمزيد زوروا: thabeha.com`
  },
  {
    pattern: /طلب|order|اطلب|اشتري|أريد|ابي|أبغى/i,
    reply: `لإتمام طلبك يرجى إرسال:\n1️⃣ نوع المنتج والكمية\n2️⃣ عنوانك للتوصيل\n3️⃣ وقت التسليم المناسب\nسيتواصل معك فريقنا خلال دقائق! 🙏`
  },
  {
    pattern: /توصيل|delivery|يوصل|إيصال|توصل/i,
    reply: `🚚 خدمة التوصيل متاحة لجميع أحياء المدينة!\n• رسوم التوصيل: 15 ريال\n• الوقت المتوقع: 45–90 دقيقة\n• توصيل مجاني للطلبات فوق 300 ريال!`
  },
  {
    pattern: /مرحب|هلا|السلام|hi\b|hello|مساء|صباح|أهلاً|كيف حالك/i,
    reply: `أهلاً وسهلاً! 🌟 مرحباً بك في ذبيحة للحوم الطازجة.\nكيف يمكنني مساعدتك اليوم؟`
  },
  {
    pattern: /شكر|thanks|thank|ممنون|مشكور/i,
    reply: `العفو! 😊 نسعد بخدمتك دائماً.\nهل تحتاج مساعدة في شيء آخر؟`
  },
  {
    pattern: /وقت|ساعة|متى|when|دوام|فتح|بكره/i,
    reply: `⏰ أوقات عملنا:\nالأحد – الخميس: 7 صباحاً – 11 مساءً\nالجمعة – السبت: 8 صباحاً – 12 منتصف الليل`
  },
  {
    pattern: /طازج|fresh|اليوم|متوفر|موجود/i,
    reply: `✅ نعم! جميع منتجاتنا طازجة يومياً.\nنحرص على الجودة في كل طلب 🥩`
  },
  {
    pattern: /#?TH-?\d+|\d{4,}/i,
    reply: `جاري التحقق من طلبك… ✅\nطلبك مؤكد وفي مرحلة التجهيز. ستصلك رسالة تأكيد الشحن قريباً.\nتتبع طلبك: thabeha.com`
  },
];

function getBotReply(text) {
  for (const { pattern, reply } of BOT_RESPONSES) {
    if (pattern.test(text)) return reply;
  }
  return `شكراً لتواصلك مع ذبيحة! 🥩\nسيتواصل معك أحد فريقنا في أقرب وقت.\nيمكنك أيضاً زيارة موقعنا: thabeha.com`;
}

const QUICK_REPLY_PROMPTS = [
  'مرحبا', 'ما هي الأسعار؟', 'أريد طلب', 'كيف يتم التوصيل؟',
  'هل عندكم لحم طازج؟', 'شكراً', 'ما هي أوقات العمل؟'
];

// ─── STATE ───────────────────────────────────────
let selectedConvId = null;
let activeFilter   = 'all';
let searchQuery    = '';
let botTypingTimer = null;

// ─── DOM REFS ────────────────────────────────────
const $ = id => document.getElementById(id);

const convListEl      = $('conversationList');
const emptyStateEl    = $('emptyState');
const chatViewEl      = $('chatView');
const msgContainerEl  = $('messagesContainer');
const typingEl        = $('typingIndicator');
const headerAvatarEl  = $('headerAvatar');
const headerNameEl    = $('headerName');
const headerStatusEl  = $('headerStatus');
const botToggleEl     = $('botToggle');
const msgInputEl      = $('messageInput');
const sendBtnEl       = $('sendBtn');
const searchEl        = $('searchInput');
const sidebarEl       = $('sidebar');

// Modals
const simModalEl      = $('modalOverlay');
const simContactEl    = $('simContact');
const simMsgEl        = $('simMessage');
const newChatModalEl  = $('newChatModal');
const newNameEl       = $('newName');
const newPhoneEl      = $('newPhone');
const newBotEl        = $('newBotEnabled');
const quickRepliesEl  = $('quickReplies');

// ─── GETTERS ─────────────────────────────────────
const getConv    = id => conversations.find(c => c.id === id);
const lastMsg    = conv => conv.messages[conv.messages.length - 1] || null;
const unreadCnt  = conv => conv.messages.filter(m => m.dir === 'in' && m.status === 'unread').length;

// ─── RENDER CONVERSATION LIST ─────────────────────
function renderList() {
  convListEl.innerHTML = '';
  let list = [...conversations];

  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    list = list.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.phone.includes(q)
    );
  }
  if (activeFilter === 'unread') list = list.filter(c => unreadCnt(c) > 0);
  if (activeFilter === 'bot')    list = list.filter(c => c.botEnabled);

  if (!list.length) {
    convListEl.innerHTML = `
      <div class="no-results">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="width:36px;height:36px;display:block;margin:0 auto 10px"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        No conversations found
      </div>`;
    return;
  }

  list.forEach(conv => {
    const last  = lastMsg(conv);
    const unread = unreadCnt(conv);
    const isOnline = conv.status === 'online';

    const preview = last
      ? (last.dir === 'out' ? (last.isBot ? '🤖 ' : '✓ ') : '') + last.text.replace(/\n/g,' ')
      : 'No messages yet';

    const item = document.createElement('div');
    item.className = 'conv-item' + (conv.id === selectedConvId ? ' active' : '');
    item.dataset.id = conv.id;
    item.innerHTML = `
      <div class="conv-avatar" style="background:${conv.color}">
        ${initials(conv.name)}
        ${isOnline ? '<div class="online-dot"></div>' : ''}
      </div>
      <div class="conv-body">
        <div class="conv-row1">
          <span class="conv-name">${esc(conv.name)}</span>
          <span class="conv-time ${unread ? 'has-unread' : ''}">${last ? last.time : ''}</span>
        </div>
        <div class="conv-row2">
          <span class="conv-preview">${esc(preview)}</span>
          <div class="conv-badges">
            ${conv.botEnabled ? '<span class="bot-badge">🤖 Bot</span>' : ''}
            ${unread ? `<span class="unread-badge">${unread}</span>` : ''}
          </div>
        </div>
      </div>`;
    item.addEventListener('click', () => openConv(conv.id));
    convListEl.appendChild(item);
  });
}

// ─── OPEN CONVERSATION ────────────────────────────
function openConv(id) {
  selectedConvId = id;
  const conv = getConv(id);
  if (!conv) return;

  // Mark incoming as read
  conv.messages.forEach(m => {
    if (m.dir === 'in') m.status = 'read';
  });

  // Show chat view, hide empty state
  emptyStateEl.style.display = 'none';
  chatViewEl.style.display   = 'flex';

  // Header
  headerAvatarEl.style.background = conv.color;
  headerAvatarEl.textContent = initials(conv.name);
  headerNameEl.textContent   = conv.name;
  headerStatusEl.textContent = conv.status === 'online'
    ? '🟢 Online'
    : conv.status.startsWith('last seen') ? `🕐 ${conv.status}` : conv.status;

  botToggleEl.checked = conv.botEnabled;

  // Mobile: slide sidebar out
  sidebarEl.classList.add('slide-out');

  renderMessages(conv);
  renderList();
}

// ─── RENDER ALL MESSAGES ──────────────────────────
function renderMessages(conv) {
  msgContainerEl.innerHTML = '';

  // Group by date
  let lastDate = null;
  conv.messages.forEach(msg => {
    const dateLabel = msg.time.includes(':') ? conv.date : msg.time;
    if (dateLabel !== lastDate) {
      const div = document.createElement('div');
      div.className = 'date-divider';
      div.innerHTML = `<span>${esc(dateLabel || conv.date)}</span>`;
      msgContainerEl.appendChild(div);
      lastDate = dateLabel;
    }
    appendBubble(msg, false);
  });

  typingEl.classList.remove('visible');
  scrollBottom();
}

// ─── APPEND A SINGLE BUBBLE ──────────────────────
function appendBubble(msg, animate = true) {
  const isBot = !!msg.isBot;
  const dir   = msg.dir === 'out' || isBot ? 'out' : 'in';
  const cls   = isBot ? 'message bot' : `message ${dir}`;

  let tick = '';
  if (dir === 'out') {
    if      (msg.status === 'read')      tick = '<span class="tick read">✓✓</span>';
    else if (msg.status === 'delivered') tick = '<span class="tick delivered">✓✓</span>';
    else                                 tick = '<span class="tick sent">✓</span>';
  }

  const el = document.createElement('div');
  el.className = cls;
  if (!animate) el.style.animation = 'none';
  el.innerHTML = `
    ${isBot ? '<div class="bot-indicator">🤖 Bot</div>' : ''}
    <div class="bubble">${br(msg.text)}</div>
    <div class="message-meta">
      <span>${esc(msg.time)}</span>
      ${tick}
    </div>`;
  msgContainerEl.appendChild(el);
}

// ─── SEND (outgoing manual) ───────────────────────
function sendManual() {
  const text = msgInputEl.value.trim();
  if (!text || !selectedConvId) return;

  const conv = getConv(selectedConvId);
  if (!conv) return;

  const msg = { id: uid(), text, dir: 'out', time: now(), status: 'sent', isBot: false };
  conv.messages.push(msg);
  appendBubble(msg, true);
  scrollBottom();
  renderList();

  msgInputEl.value = '';
  autoResize();

  // Simulate delivered after 900ms
  setTimeout(() => {
    msg.status = 'delivered';
    refreshLastBubbleTick(conv, msg.id);
  }, 900);
}

// ─── RECEIVE (simulate incoming) ─────────────────
function receiveMessage(convId, text) {
  const conv = getConv(convId);
  if (!conv) return;

  const isSelected = selectedConvId === convId;
  const msg = {
    id:     uid(),
    text,
    dir:    'in',
    time:   now(),
    status: isSelected ? 'read' : 'unread'
  };
  conv.messages.push(msg);

  if (isSelected) {
    appendBubble(msg, true);
    scrollBottom();
  }
  renderList();

  // Trigger bot if enabled
  if (conv.botEnabled) scheduleBotReply(conv, text);
}

// ─── BOT REPLY ────────────────────────────────────
function scheduleBotReply(conv, incomingText) {
  const isSelected = selectedConvId === conv.id;

  if (isSelected) {
    typingEl.classList.add('visible');
    scrollBottom();
  }

  if (botTypingTimer) clearTimeout(botTypingTimer);
  const delay = 1100 + Math.random() * 900; // 1.1s – 2s

  botTypingTimer = setTimeout(() => {
    const replyText = getBotReply(incomingText);
    const msg = {
      id:     uid(),
      text:   replyText,
      dir:    'out',
      time:   now(),
      status: 'sent',
      isBot:  true
    };
    conv.messages.push(msg);

    if (selectedConvId === conv.id) {
      typingEl.classList.remove('visible');
      appendBubble(msg, true);
      scrollBottom();
    }

    renderList();

    // Mark delivered after 600ms
    setTimeout(() => { msg.status = 'delivered'; renderList(); }, 600);
  }, delay);
}

// ─── SCROLL HELPERS ──────────────────────────────
function scrollBottom() {
  const area = $('messagesArea');
  requestAnimationFrame(() => { area.scrollTop = area.scrollHeight; });
}

function refreshLastBubbleTick(conv, msgId) {
  // Re-render all messages to reflect updated status
  if (selectedConvId === conv.id) renderMessages(conv);
}

// ─── TEXTAREA AUTO-RESIZE ─────────────────────────
function autoResize() {
  msgInputEl.style.height = 'auto';
  msgInputEl.style.height = Math.min(msgInputEl.scrollHeight, 130) + 'px';
}

// ─── POPULATE SIMULATE MODAL ─────────────────────
function openSimModal(preSelectId) {
  simContactEl.innerHTML = '';
  conversations.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c.id;
    opt.textContent = `${c.name}  (${c.phone})`;
    if (c.id === (preSelectId || selectedConvId)) opt.selected = true;
    simContactEl.appendChild(opt);
  });

  // Quick reply chips
  quickRepliesEl.innerHTML = '';
  QUICK_REPLY_PROMPTS.forEach(q => {
    const chip = document.createElement('button');
    chip.className = 'qr-chip';
    chip.textContent = q;
    chip.addEventListener('click', () => { simMsgEl.value = q; simMsgEl.focus(); });
    quickRepliesEl.appendChild(chip);
  });

  simMsgEl.value = '';
  simModalEl.classList.add('open');
  setTimeout(() => simMsgEl.focus(), 120);
}

// ─── CLOSE MODALS ────────────────────────────────
function closeModal(el) { el.classList.remove('open'); }

// ══════════════════════════════════════════════════
//  EVENT LISTENERS
// ══════════════════════════════════════════════════

// Send
sendBtnEl.addEventListener('click', sendManual);
msgInputEl.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendManual(); }
});
msgInputEl.addEventListener('input', autoResize);

// Bot toggle
botToggleEl.addEventListener('change', () => {
  const conv = getConv(selectedConvId);
  if (!conv) return;
  conv.botEnabled = botToggleEl.checked;
  renderList();
  // Visual feedback on the header
  const wrap = document.querySelector('.bot-toggle-wrap');
  if (wrap) {
    wrap.style.background = conv.botEnabled
      ? 'rgba(108,53,222,0.18)' : 'rgba(134,150,160,0.1)';
  }
});

// Search
searchEl.addEventListener('input', () => {
  searchQuery = searchEl.value.trim();
  renderList();
});

// Filter tabs
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    activeFilter = tab.dataset.filter;
    renderList();
  });
});

// Open simulate modal (sidebar button)
$('simulateIncomingBtn').addEventListener('click', () => openSimModal(null));
// Open simulate modal (header button, pre-select current conv)
$('simulateMsgBtn').addEventListener('click',       () => openSimModal(selectedConvId));
// Open simulate modal (empty state CTA)
$('emptySimBtn').addEventListener('click',          () => openSimModal(null));

// Simulate modal — confirm
$('modalSendBtn').addEventListener('click', () => {
  const convId = simContactEl.value;
  const text   = simMsgEl.value.trim();
  if (!text) { simMsgEl.focus(); return; }

  closeModal(simModalEl);

  // Switch to that conversation first
  if (selectedConvId !== convId) openConv(convId);
  receiveMessage(convId, text);
});

// Simulate modal — close
$('modalClose').addEventListener('click',    () => closeModal(simModalEl));
$('modalCancelBtn').addEventListener('click',() => closeModal(simModalEl));
simModalEl.addEventListener('click', e => { if (e.target === simModalEl) closeModal(simModalEl); });

// Simulate: Enter key in textarea
simMsgEl.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    $('modalSendBtn').click();
  }
});

// New chat
$('newChatBtn').addEventListener('click', () => {
  newNameEl.value = '';
  newPhoneEl.value = '';
  newBotEl.checked = true;
  newChatModalEl.classList.add('open');
  setTimeout(() => newNameEl.focus(), 120);
});
$('newChatClose').addEventListener('click',     () => closeModal(newChatModalEl));
$('newChatCancelBtn').addEventListener('click', () => closeModal(newChatModalEl));
newChatModalEl.addEventListener('click', e => { if (e.target === newChatModalEl) closeModal(newChatModalEl); });

$('newChatCreateBtn').addEventListener('click', () => {
  const name  = newNameEl.value.trim();
  const phone = newPhoneEl.value.trim();
  if (!name)  { newNameEl.focus();  return; }
  if (!phone) { newPhoneEl.focus(); return; }

  const PALETTE = ['#E91E63','#009688','#2196F3','#FF9800','#9C27B0','#F44336','#3F51B5','#00BCD4','#8BC34A','#FF5722'];
  const conv = {
    id:         cuid(),
    name,
    phone,
    color:      PALETTE[Math.floor(Math.random() * PALETTE.length)],
    status:     'online',
    botEnabled: newBotEl.checked,
    date:       'Today',
    messages:   []
  };
  conversations.unshift(conv);
  closeModal(newChatModalEl);
  renderList();
  openConv(conv.id);
});

// Mobile back button
$('backBtn').addEventListener('click', () => {
  sidebarEl.classList.remove('slide-out');
  emptyStateEl.style.display = '';
  chatViewEl.style.display   = 'none';
  selectedConvId = null;
  renderList();
});

// ─── INIT ────────────────────────────────────────
renderList();
