// ─── CONFIGURATION ─────────────────────────────────────────────────────────────
// Edit this section to set your business info & social URLs.
const config = {
  businessName: "Thabeha",
  tagline: "All our social links in one place",
  logoUrl: "https://cdn.salla.sa/cdn-cgi/image/fit=scale-down,width=400,height=400,onerror=redirect,format=auto/PjvZx/z5c5FGiieo6UGxQ4dlSAM3qtD5blpc4XSqXTPQOD.png",
  shareUrl: "https://thabeha.com/",
  // Default UTM values applied to every outbound link (override per-link with utmOverride)
  utmDefaults: {
    utm_source:   "thabeha_links",
    utm_medium:   "bio",
    utm_campaign: "social_hub"
  },
  links: [
    { id: "website",   title: "Website",   url: "https://thabeha.com/",                       subtitle: "Visit our site",  color: "#06b6d4", icon: "🌐" },
    { id: "x",         title: "X / Twitter", url: "https://x.com/thabeha2",                   subtitle: "@thabeha2",       color: "#1DA1F2", icon: "🐦" },
    { id: "tiktok",    title: "TikTok",    url: "https://www.tiktok.com/@thabeha2",            subtitle: "@thabeha2",       color: "#000000", icon: "🎵" },
    { id: "instagram", title: "Instagram", url: "https://instagram.com/thabehaa",              subtitle: "@thabehaa",       color: "#c13584", icon: "📸" },
    { id: "snapchat",  title: "Snapchat",  url: "https://www.snapchat.com/add/thabehaa",       subtitle: "@thabehaa",       color: "#FFFC00", icon: "👻" },
    { id: "whatsapp",  title: "WhatsApp",  url: "https://wa.me/966598220111",                  subtitle: "+966 59 822 0111", color: "#25D366", icon: "💬",
      // WhatsApp doesn't support UTM params — skip auto-tagging
      utmOverride: null }
  ]
};

// ─── CAMPAIGN QUERY-PARAM OVERRIDES ────────────────────────────────────────────
// Visiting ?campaign=ramadan&utm_campaign=ramadan_sale lets you run targeted
// campaigns without touching the source file.
(function applyCampaignParams() {
  const params = new URLSearchParams(window.location.search);
  const campaign = params.get("campaign");
  if (campaign) {
    config.utmDefaults.utm_campaign = campaign;
  }
  // Allow overriding source / medium too
  ["utm_source", "utm_medium", "utm_campaign", "utm_content"].forEach(key => {
    if (params.has(key)) config.utmDefaults[key] = params.get(key);
  });
})();

// ─── ANALYTICS ─────────────────────────────────────────────────────────────────
// Lightweight click tracking — stores events in localStorage and (optionally)
// sends them as a beacon so they survive navigation.
const analytics = {
  _key: "thabeha_clicks",

  track(linkId, url) {
    const event = {
      id: linkId,
      url,
      ts: Date.now(),
      ref: document.referrer || "",
      campaign: config.utmDefaults.utm_campaign
    };
    try {
      const stored = JSON.parse(localStorage.getItem(this._key) || "[]");
      stored.push(event);
      // Keep the last 200 events to avoid unbounded growth
      if (stored.length > 200) stored.splice(0, stored.length - 200);
      localStorage.setItem(this._key, JSON.stringify(stored));
    } catch (_) { /* localStorage unavailable — no-op */ }
    // Beacon for server-side collection (wire up your own endpoint here)
    // if (navigator.sendBeacon) navigator.sendBeacon("/api/track", JSON.stringify(event));
  },

  getSummary() {
    try {
      const stored = JSON.parse(localStorage.getItem(this._key) || "[]");
      return stored.reduce((acc, e) => {
        acc[e.id] = (acc[e.id] || 0) + 1;
        return acc;
      }, {});
    } catch (_) { return {}; }
  }
};

// ─── UTM HELPERS ───────────────────────────────────────────────────────────────
function buildTrackedUrl(link) {
  // utmOverride: null means skip UTM tagging entirely (e.g. WhatsApp)
  if (Object.prototype.hasOwnProperty.call(link, "utmOverride") && link.utmOverride === null) {
    return link.url;
  }
  try {
    const u = new URL(link.url);
    const utm = Object.assign({}, config.utmDefaults, link.utmOverride || {});
    // utm_content defaults to the link id so each button is distinguishable
    if (!utm.utm_content) utm.utm_content = link.id;
    Object.entries(utm).forEach(([k, v]) => u.searchParams.set(k, v));
    return u.toString();
  } catch (_) {
    return link.url;
  }
}

// ─── DOM RENDERING ─────────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  const businessNameEl = document.getElementById("businessName");
  const taglineEl      = document.getElementById("tagline");
  const logoEl         = document.getElementById("logo");
  const linksEl        = document.getElementById("links");
  const shareUrlEl     = document.getElementById("shareUrl");

  const pageUrl = config.shareUrl && config.shareUrl.trim() !== "" ? config.shareUrl : window.location.href;

  businessNameEl.textContent = config.businessName || "Business";
  taglineEl.textContent      = config.tagline || "";

  if (config.logoUrl) {
    logoEl.src = config.logoUrl;
    logoEl.style.display = "inline-block";
  }

  // Build link buttons
  linksEl.innerHTML = "";
  config.links.forEach(l => {
    const trackedUrl = buildTrackedUrl(l);

    const a = document.createElement("a");
    a.className = "link-btn";
    a.href = trackedUrl;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.dataset.linkId = l.id;

    const icon = document.createElement("div");
    icon.className = "link-icon";
    icon.innerHTML = `<div style="width:28px;height:28px;border-radius:6px;background:${l.color};display:flex;align-items:center;justify-content:center;font-size:14px">${l.icon}</div>`;

    const textWrap = document.createElement("div");
    textWrap.style.cssText = "display:flex;flex-direction:column";

    const title = document.createElement("div");
    title.className = "link-text";
    title.textContent = l.title;

    const subtitle = document.createElement("div");
    subtitle.className = "link-sub";
    subtitle.textContent = l.subtitle || l.url;

    textWrap.appendChild(title);
    textWrap.appendChild(subtitle);
    a.appendChild(icon);
    a.appendChild(textWrap);
    linksEl.appendChild(a);
  });

  // Click tracking delegation
  linksEl.addEventListener("click", e => {
    const btn = e.target.closest(".link-btn");
    if (btn) analytics.track(btn.dataset.linkId, btn.href);
  });

  // QR code
  shareUrlEl.href = pageUrl;
  shareUrlEl.textContent = pageUrl;

  const qrcodeEl = document.getElementById("qrcode");
  qrcodeEl.innerHTML = "";

  // QRCode may not have loaded yet if it was deferred — wait for it
  function initQR() {
    if (typeof QRCode === "undefined") {
      setTimeout(initQR, 50);
      return;
    }
    new QRCode(qrcodeEl, {
      text: pageUrl,
      width: 200,
      height: 200,
      colorDark: "#000000",
      colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel.H
    });
  }
  initQR();

  // Download QR as PNG
  document.getElementById("downloadQr").addEventListener("click", () => {
    const img = qrcodeEl.querySelector("img") || qrcodeEl.querySelector("canvas");
    if (!img) { alert("QR not ready"); return; }
    const a = document.createElement("a");
    if (img.tagName === "IMG") {
      a.href = img.src;
    } else {
      a.href = img.toDataURL("image/png");
    }
    a.download = `${(config.businessName || "business").replace(/\s+/g, "-").toLowerCase()}-qr.png`;
    a.click();
  });

  // Copy link
  document.getElementById("copyLink").addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(pageUrl);
      alert("Link copied to clipboard");
    } catch (_) {
      prompt("Copy this link:", pageUrl);
    }
  });
});
