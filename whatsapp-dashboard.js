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

// ─── PRODUCT CATALOG (synced from thabeha.com / Salla) ───────────────────────
const CATALOG = {
  // ذبائح كاملة — Whole Animals
  tees: [
    { name:'تيس صغير (8-9 كيلو)',    price:1185, sku:'TYS-001' },
    { name:'تيس وسط (10-12 كيلو)',   price:1435, sku:'ZBT-001' },
    { name:'تيس كبير (14-15 كيلو)',  price:1585, sku:'ZBT-002' },
  ],
  najdi: [
    { name:'نجدي لباني (11-12 كيلو)',     price:1420, sku:'ZBG-004' },
    { name:'نجدي لباني (13-14 كيلو)',     price:1510, sku:'ZBG-005' },
    { name:'نجدي هرفي وسط (16-17 كيلو)', price:1740, sku:'ZBG-006' },
    { name:'نجدي هرفي كبير (19-20 كيلو)',price:1970, sku:'ZBG-003' },
    { name:'نجدي جذع وسط (22-23 كيلو)', price:2070, sku:'ZBG-007' },
    { name:'نجدي جذع صغير (25-26 كيلو)',price:2320, sku:'ZBG-001' },
    { name:'نجدي جذع ناهي (28-30 كيلو)',price:2390, sku:'ZBG-002' },
    { name:'نصف نجدي هرفي (7-9 كيلو)',  price:730,  sku:'ZBG-H02' },
    { name:'نصف نجدي جذع (10-11 كيلو)', price:950,  sku:'ZBG-H01' },
    { name:'ربع نجدي هرفي (4-5 كيلو)',  price:475,  sku:'ZBG-R02' },
    { name:'ربع نجدي جذع (6-7 كيلو)',   price:624,  sku:'ZBG-R01' },
  ],
  naimi: [
    { name:'نعيمي لباني (11-12 كيلو)',     price:1420, sku:'ZBN-007' },
    { name:'نعيمي لباني (13-14 كيلو)',     price:1510, sku:'ZBN-006' },
    { name:'نعيمي هرفي وسط (16-17 كيلو)', price:1740, sku:'ZBN-001' },
    { name:'نعيمي هرفي كبير (19-20 كيلو)',price:1970, sku:'ZBN-005' },
    { name:'نعيمي جذع صغير (22-23 كيلو)', price:2070, sku:'ZBN-004' },
    { name:'نعيمي جذع وسط (25-26 كيلو)', price:2320, sku:'ZBN-003' },
    { name:'نعيمي جذع ناهي (28-30 كيلو)',price:2390, sku:'ZBN-002' },
    { name:'نصف نعيمي هرفي (7-8 كيلو)',  price:730,  sku:'ZBN-H02' },
    { name:'نصف نعيمي جذع (10-11 كيلو)', price:950,  sku:'ZBN-H01' },
    { name:'ربع نعيمي هرفي (4-5 كيلو)',  price:475,  sku:'ZBN-R02' },
    { name:'ربع نعيمي جذع (6-7 كيلو)',   price:624,  sku:'ZBN-R01' },
  ],
  hari: [
    { name:'حري لباني (11-12 كيلو)',      price:1370, sku:'ZBH-007' },
    { name:'حري لباني (13-14 كيلو)',      price:1460, sku:'ZBH-002' },
    { name:'حري هرفي وسط (16-17 كيلو)',   price:1690, sku:'ZBH-001' },
    { name:'حري هرفي كبير (19-20 كيلو)',  price:1940, sku:'ZBH-003' },
    { name:'حري جذع صغير (22-23 كيلو)',   price:2020, sku:'ZBH-004' },
    { name:'حري جذع وسط (25-26 كيلو)',    price:2270, sku:'ZBH-005' },
    { name:'حري جذع ناهي (28-30 كيلو)',   price:2340, sku:'ZBH-006' },
    { name:'نصف حري هرفي (7-8 كيلو)',     price:730,  sku:'ZBH-H01' },
    { name:'نصف حري جذع (10-11 كيلو)',    price:950,  sku:'ZBH-H02' },
    { name:'ربع حري هرفي (4-5 كيلو)',     price:475,  sku:'ZBH-R01' },
    { name:'ربع حري جذع (6-7 كيلو)',      price:624,  sku:'ZBH-R02' },
  ],
  swaakni: [
    { name:'سواكني جذع وسط (15-16 كيلو)',  price:1150, sku:'' },
    { name:'سواكني جذع وسط (18-19 كيلو)',  price:1350, sku:'' },
    { name:'سواكني جذع (22-25 كيلو)',       price:1775, sku:'SKN-003' },
  ],
  // ذبائح بتلو وحوار
  batlo: [
    { name:'ربع بتلو (25-30 كيلو)',          price:2270 },
    { name:'نصف بتلو (50-60 كيلو)',          price:4215 },
    { name:'بتلو كامل (100-120 كيلو)',        price:8315 },
    { name:'5 كيلو مفروم بتلو',              price:315,  sku:'MIX-004' },
  ],
  hawar: [
    { name:'ربع حوار (20-22 كيلو)',           price:1835 },
    { name:'نص حوار (40-45 كيلو) مفطح',      price:4430 },
    { name:'نص حوار (40-45 كيلو) تقطيع ثلاجة',price:3565 },
    { name:'حوار كامل (80-90 كيلو)',          price:6999 },
  ],
  // لحم بالكيلو
  meatKilo: [
    { name:'كيلو لحم بتلو مفروم',    price:69,  sku:'GHB-003' },
    { name:'كيلو لحم بتلو بالعظم',   price:63 },
    { name:'كيلو لحم بتلو هبر',      price:69 },
    { name:'كيلو لحم حوار مفروم',    price:87 },
    { name:'كيلو لحم حوار لباني بالعظم', price:73 },
    { name:'كيلو لحم حوار هبر',      price:87 },
    { name:'كيلو لحم غنم جذع بالعظم',price:82,  sku:'GHL-014' },
    { name:'كيلو لحم غنم مفروم',     price:90,  sku:'GHN-012' },
    { name:'كيلو لحم غنم هرفي بالعظم',price:85, sku:'GHN-011' },
    { name:'كيلو لحم غنم جذع هبر',   price:90,  sku:'GHN-013' },
    { name:'كيلو كبدة بتلو',          price:75 },
    { name:'كيلو كبدة حوار',          price:65 },
    { name:'كبدة غنم معلاق كامل',     price:80,  sku:'AJZ-001' },
    { name:'كوارع بتلو (بالحبة)',      price:60 },
    { name:'ريش غنم (8-10 حبات)',     price:92,  sku:'GHN-010' },
    { name:'موزات غنم (2-3 حبات)',    price:92,  sku:'GHN-015' },
  ],
  // بوكسات مشاوي
  boxes: [
    { name:'بوكس مشاوي وناسة - 4 كيلو',   price:212, sku:'BOX-001' },
    { name:'بوكس مشاوي الرحلة - 4 كيلو',  price:252, sku:'BOX-002' },
    { name:'بوكس مشاوي صغير - 3 كيلو',    price:195, sku:'BOX-009' },
    { name:'بوكس مشاوي الكبير - 6 كيلو',  price:390, sku:'BOX-010' },
    { name:'بوكس المفروم البتلو',           price:464, sku:'BOX-003' },
    { name:'بوكس المفروم الغنم',            price:430, sku:'BOX-004' },
    { name:'بوكس المذاق',                   price:430, sku:'BOX-008' },
    { name:'بوكس السمو',                    price:466, sku:'BOX-006' },
    { name:'بوكس البلدي الفاخر',           price:336, sku:'BOX-007' },
    { name:'بوكس الكرم',                    price:954, sku:'BOX-005' },
  ],
  // دجاج
  chicken: [
    { name:'دجاج مبرد 3 حبات (900 جرام)',  price:56,  sku:'DJJ-006' },
    { name:'دجاج مبرد 3 حبات (1000 جرام)', price:59,  sku:'DJJ-007' },
    { name:'دجاج مبرد 3 حبات (1100 جرام)', price:61,  sku:'DJJ-008' },
    { name:'دجاج مبرد 3 حبات (1200 جرام)', price:63,  sku:'DJJ-009' },
    { name:'دجاج مبرد 3 حبات (1300 جرام)', price:65,  sku:'DJJ-010' },
    { name:'مفروم دجاج بالكيلو',            price:65,  sku:'DJJ-004' },
    { name:'شيش طاووق 8 أسياخ (800-900 جرام)',price:55, sku:'DJJ-002' },
    { name:'كباب دجاج 10 أسياخ (800-900 جرام)',price:55,sku:'DJJ-003' },
    { name:'شاورما دجاج بالكيلو',           price:55,  sku:'DJJ-001' },
  ],
  // حمام
  pigeons: [
    { name:'خمس أزواج حمام',   price:235, sku:'HMM-001' },
    { name:'10 أزواج حمام',    price:475, sku:'HMM-002' },
    { name:'15 زوج حمام',      price:715, sku:'HMM-003' },
    { name:'طرب 8 حبات (800-900 جرام)', price:72, sku:'HMM-004' },
  ],
  // أكلات جاهزة
  meals: [
    { name:'شاورما لحم بالكيلو',           price:92, sku:'GHN-004' },
    { name:'كباب لحم 10 أسياخ (800-900 جرام)', price:65, sku:'GHN-009' },
    { name:'أوصال لحم 8 أسياخ (800-900 جرام)', price:65, sku:'GHN-008' },
    { name:'برجر لحم 8 حبات (800-900 جرام)',   price:65, sku:'GHN-005' },
    { name:'ستيك لحم (8-12 حبة)',              price:92, sku:'GHN-006' },
    { name:'كفتة غنم بالكيلو',                price:75, sku:'GHN-003' },
    { name:'فطيرة لحم بالكيلو',               price:92, sku:'GHN-001' },
  ],
  // سمن بلدي
  ghee: [
    { name:'ريع كيلو سمن بلدي',  price:60,  sku:'SHN-001' },
    { name:'نصف كيلو سمن بلدي', price:115, sku:'SHN-002' },
    { name:'كيلو سمن بلدي',      price:220, sku:'SHN-003' },
  ],
};

function fmtList(items, limit = 8) {
  return items.slice(0, limit)
    .map(p => `• ${p.name} — ${p.price > 0 ? p.price + ' ريال' : 'تواصل معنا'}`)
    .join('\n');
}

// ─── BOT RESPONSES ────────────────────────────────
const BOT_RESPONSES = [
  // ── Greeting ──
  {
    pattern: /مرحب|هلا|السلام|hi\b|hello|مساء|صباح|أهلاً|كيف حالك/i,
    reply: `أهلاً وسهلاً! 🌟 مرحباً بك في ذبيحة للحوم والذبائح الطازجة.\n\nاختر من قائمتنا:\n1️⃣ ذبائح غنم (نجدي، نعيمي، حري، سواكني)\n2️⃣ بتلو وحوار\n3️⃣ لحم بالكيلو\n4️⃣ بوكسات مشاوي\n5️⃣ دجاج وحمام\n6️⃣ أكلات جاهزة\n7️⃣ سمن بلدي\n\nأو اكتب ما تبحث عنه مباشرة 👇`
  },
  // ── Tees (Goats) ──
  {
    pattern: /تيس|عتود/i,
    reply: `🐐 التيوس المتوفرة:\n${fmtList(CATALOG.tees)}\n\nللطلب أو الاستفسار تواصل معنا 📞\nأو زور: thabeha.com`
  },
  // ── Najdi ──
  {
    pattern: /نجدي/i,
    reply: `🐑 النجدي المتوفر:\n${fmtList(CATALOG.najdi, 6)}\n...والمزيد!\n\nأذكر الوزن المطلوب وسنعطيك السعر الدقيق.\nthabeha.com`
  },
  // ── Naimi ──
  {
    pattern: /نعيمي/i,
    reply: `🐑 النعيمي المتوفر:\n${fmtList(CATALOG.naimi, 6)}\n...والمزيد!\n\nللطلب: thabeha.com`
  },
  // ── Hari ──
  {
    pattern: /حري/i,
    reply: `🐑 الحري المتوفر:\n${fmtList(CATALOG.hari, 6)}\n...والمزيد!\n\nللطلب: thabeha.com`
  },
  // ── Swaakni ──
  {
    pattern: /سواكني|سواكن/i,
    reply: `🐑 السواكني المتوفر:\n${fmtList(CATALOG.swaakni)}\n\nللطلب: thabeha.com`
  },
  // ── All sheep/goats ──
  {
    pattern: /خروف|غنم|ذبيح|ذبائح|هرفي|لباني|جذع/i,
    reply: `🐑 أصناف الغنم والذبائح لدينا:\n• نجدي\n• نعيمي\n• حري\n• سواكني\n• تيس\n\nاكتب اسم الصنف لعرض الأحجام والأسعار.\nأو تصفح الكاتالوج: thabeha.com`
  },
  // ── Batlo ──
  {
    pattern: /بتلو|عجل/i,
    reply: `🐄 البتلو المتوفر:\n${fmtList(CATALOG.batlo)}\n\nكيلو لحم بتلو مفروم: 69 ريال\nكيلو هبر: 69 ريال\nكيلو بالعظم: 63 ريال\n\nللطلب: thabeha.com`
  },
  // ── Hawar ──
  {
    pattern: /حوار|هجين/i,
    reply: `🐂 الحوار المتوفر:\n${fmtList(CATALOG.hawar)}\n\nكيلو لحم حوار مفروم: 87 ريال\nكيلو هبر: 87 ريال\nكيلو بالعظم: 73 ريال\n\nللطلب: thabeha.com`
  },
  // ── Boxes ──
  {
    pattern: /بوكس|مشاوي|باكج|package/i,
    reply: `🔥 بوكسات المشاوي:\n${fmtList(CATALOG.boxes)}\n\nجميع البوكسات مجهزة ومتبلة حسب الطلب.\nللطلب: thabeha.com`
  },
  // ── Chicken ──
  {
    pattern: /دجاج|طاووق|شيش|فيليه|chicken/i,
    reply: `🐔 قسم الدجاج:\n${fmtList(CATALOG.chicken)}\n\nجميع منتجاتنا طازجة يومياً ✅\nللطلب: thabeha.com`
  },
  // ── Pigeons ──
  {
    pattern: /حمام|طرب/i,
    reply: `🕊️ الحمام المتوفر:\n${fmtList(CATALOG.pigeons)}\n\nللطلب: thabeha.com`
  },
  // ── Meals ──
  {
    pattern: /شاورما|كباب|برجر|ستيك|كفتة|فطيرة|أوصال|مشاوي جاهز/i,
    reply: `🍢 الأكلات الجاهزة:\n${fmtList(CATALOG.meals)}\n\nشاورما دجاج بالكيلو: 55 ريال\nشاورما لحم بالكيلو: 92 ريال\n\nللطلب: thabeha.com`
  },
  // ── Ghee ──
  {
    pattern: /سمن|ghee/i,
    reply: `🫙 السمن البلدي الأصيل:\n${fmtList(CATALOG.ghee)}\n\nللطلب: thabeha.com`
  },
  // ── Liver / offal ──
  {
    pattern: /كبد|كبدة|كوارع|رأس|موزات|ريش/i,
    reply: `🥩 القطع الخاصة:\n${fmtList(CATALOG.meatKilo.filter(p => ['كبدة','كوارع','ريش','موزات'].some(k => p.name.includes(k))))}\n\nللطلب: thabeha.com`
  },
  // ── Meat per kilo ──
  {
    pattern: /لحم|كيلو|مفروم|هبر|عظم|بالعظم/i,
    reply: `🥩 اللحم بالكيلو:\n\nبتلو:\n• مفروم: 69 ريال\n• هبر: 69 ريال\n• بالعظم: 63 ريال\n\nحوار:\n• مفروم: 87 ريال\n• هبر: 87 ريال\n• بالعظم: 73 ريال\n\nغنم:\n• مفروم: 90 ريال\n• هبر: 90 ريال\n• بالعظم (جذع): 82 ريال\n• بالعظم (هرفي): 85 ريال\n\nللطلب: thabeha.com`
  },
  // ── Prices general ──
  {
    pattern: /سعر|price|كم|بكم|تكلف|how much|أسعار/i,
    reply: `💰 ملخص الأسعار:\n\n🐑 ذبائح غنم: من 475 ريال (ربع) إلى 2390 ريال (جذع ناهي)\n🐐 تيس: 1185 – 1585 ريال\n🐄 بتلو: من 63 ريال/كيلو\n🐂 حوار: من 73 ريال/كيلو\n🔥 بوكسات: من 195 ريال\n🐔 دجاج: من 56 ريال (3 حبات)\n🕊️ حمام: من 72 ريال\n🫙 سمن: من 60 ريال\n\nللكاتالوج الكامل: thabeha.com`
  },
  // ── Order ──
  {
    pattern: /طلب|order|اطلب|اشتري|أريد|ابي|أبغى|ودي/i,
    reply: `🛒 لإتمام طلبك يرجى إرسال:\n1️⃣ الصنف والكمية (مثال: نجدي جذع وسط)\n2️⃣ عنوانك للتوصيل\n3️⃣ الوقت المناسب للاستلام\n\nأو اطلب مباشرة من: thabeha.com 🚀`
  },
  // ── Delivery ──
  {
    pattern: /توصيل|delivery|يوصل|إيصال|توصل/i,
    reply: `🚚 خدمة التوصيل متاحة!\n• رسوم التوصيل: 15 ريال\n• الوقت المتوقع: 45–90 دقيقة\n• توصيل مجاني للطلبات فوق 300 ريال\n\nنغطي جميع أحياء المدينة 📍`
  },
  // ── Thanks ──
  {
    pattern: /شكر|thanks|thank|ممنون|مشكور/i,
    reply: `العفو! 😊 نسعد بخدمتك دائماً.\nهل تحتاج مساعدة في شيء آخر؟`
  },
  // ── Hours ──
  {
    pattern: /وقت|ساعة|متى|when|دوام|فتح|مفتوح/i,
    reply: `⏰ أوقات عملنا:\nالأحد – الخميس: 7 صباحاً – 11 مساءً\nالجمعة – السبت: 8 صباحاً – 12 منتصف الليل`
  },
  // ── Order tracking ──
  {
    pattern: /#?TH-?\d+|\d{4,}/i,
    reply: `🔍 جاري التحقق من طلبك…\nطلبك مؤكد وفي مرحلة التجهيز ✅\nللمتابعة المباشرة: thabeha.com`
  },
];

function getBotReply(text) {
  for (const { pattern, reply } of BOT_RESPONSES) {
    if (pattern.test(text)) return reply;
  }
  return `شكراً لتواصلك مع ذبيحة! 🥩\nسيتواصل معك فريقنا قريباً.\n\nللتصفح والطلب المباشر:\n👉 thabeha.com`;
}

const QUICK_REPLY_PROMPTS = [
  'مرحبا', 'عندكم نجدي؟', 'بوكسات المشاوي', 'أسعار اللحم بالكيلو',
  'دجاج', 'أريد طلب', 'كيف التوصيل؟', 'سمن بلدي'
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
