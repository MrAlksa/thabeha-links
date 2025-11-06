// EDIT THIS SECTION to set your business info & social URLs
const config = {
  businessName: "Thabeha",
  tagline: "All our social links in one place",
  // using the site favicon as the logo fallback
  logoUrl: "https://cdn.salla.sa/cdn-cgi/image/fit=scale-down,width=400,height=400,onerror=redirect,format=auto/PjvZx/z5c5FGiieo6UGxQ4dlSAM3qtD5blpc4XSqXTPQOD.png",
  // shareUrl set to your business domain:
  shareUrl: "https://thabeha.com/",
  links: [
    { id: "website", title: "Website", url: "https://thabeha.com/", subtitle: "Visit our site", color: "#06b6d4", icon: "🌐" },
    { id: "x", title: "X / Twitter", url: "https://x.com/thabeha2", subtitle: "@thabeha2", color: "#1DA1F2", icon: "🐦" },
    { id: "tiktok", title: "TikTok", url: "https://www.tiktok.com/@thabeha2", subtitle: "@thabeha2", color: "#000000", icon: "🎵" },
    { id: "instagram", title: "Instagram", url: "https://instagram.com/thabehaa", subtitle: "@thabehaa", color: "#c13584", icon: "📸" },
    { id: "snapchat", title: "Snapchat", url: "https://www.snapchat.com/add/thabehaa", subtitle: "@thabehaa", color: "#FFFC00", icon: "👻" },
    // WhatsApp adjusted to international format (assumed +966)
    { id: "whatsapp", title: "WhatsApp", url: "https://wa.me/966598220111", subtitle: "+966 59 822 0111", color: "#25D366", icon: "💬" }
  ]
};

document.addEventListener("DOMContentLoaded", () => {
  const businessNameEl = document.getElementById("businessName");
  const taglineEl = document.getElementById("tagline");
  const logoEl = document.getElementById("logo");
  const linksEl = document.getElementById("links");
  const shareUrlEl = document.getElementById("shareUrl");

  const pageUrl = config.shareUrl && config.shareUrl.trim() !== "" ? config.shareUrl : window.location.href;
  businessNameEl.textContent = config.businessName || "Business";
  taglineEl.textContent = config.tagline || "";
  if (config.logoUrl) {
    logoEl.src = config.logoUrl;
    logoEl.style.display = "inline-block";
  }

  // Build link buttons
  linksEl.innerHTML = "";
  config.links.forEach(l => {
    const a = document.createElement("a");
    a.className = "link-btn";
    a.href = l.url;
    a.target = "_blank";
    a.rel = "noopener noreferrer";

    const icon = document.createElement("div");
    icon.className = "link-icon";
    icon.innerHTML = `<div style="width:28px;height:28px;border-radius:6px;background:${l.color};display:flex;align-items:center;justify-content:center;font-size:14px">${l.icon}</div>`;

    const textWrap = document.createElement("div");
    textWrap.style.display = "flex";
    textWrap.style.flexDirection = "column";

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

  // QR code
  shareUrlEl.href = pageUrl;
  shareUrlEl.textContent = pageUrl;

  const qrcodeEl = document.getElementById("qrcode");
  // clear
  qrcodeEl.innerHTML = "";
  const qr = new QRCode(qrcodeEl, {
    text: pageUrl,
    width: 200,
    height: 200,
    colorDark: "#000000",
    colorLight: "#ffffff",
    correctLevel: QRCode.CorrectLevel.H
  });

  // Download QR as PNG
  document.getElementById("downloadQr").addEventListener("click", () => {
    // qrcode library creates an img or canvas inside qrcodeEl
    const img = qrcodeEl.querySelector("img") || qrcodeEl.querySelector("canvas");
    if (!img) return alert("QR not ready");
    // If it's an img with a data URL
    if (img.tagName === "IMG") {
      const a = document.createElement("a");
      a.href = img.src;
      a.download = `${(config.businessName || "business")}-qr.png`;
      a.click();
      return;
    }
    // If it's a canvas
    const dataUrl = img.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `${(config.businessName || "business")}-qr.png`;
    a.click();
  });

  // Copy link
  document.getElementById("copyLink").addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(pageUrl);
      alert("Link copied to clipboard");
    } catch (e) {
      prompt("Copy this link:", pageUrl);
    }
  });
});
