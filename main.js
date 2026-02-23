// main.js

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initUI();
  addRow();
});

/* ── Theme ─────────────────────────────────────────────────────── */

function initTheme() {
  const body    = document.body;
  const toggle  = document.getElementById("theme-toggle-checkbox");
  const stored  = window.localStorage?.getItem("pinout-theme");

  if (stored === "dark") {
    body.setAttribute("data-theme", "dark");
    toggle.checked = true;
  }

  toggle.addEventListener("change", () => {
    const dark = toggle.checked;
    body.setAttribute("data-theme", dark ? "dark" : "light");
    try { window.localStorage?.setItem("pinout-theme", dark ? "dark" : "light"); }
    catch { /* ignore */ }
  });
}

/* ── UI wiring ──────────────────────────────────────────────────── */

function initUI() {
  document.getElementById("add-pin-btn").addEventListener("click", () => {
    const raw   = Number(document.getElementById("add-count").value);
    const count = Math.max(1, Math.min(100, Number.isFinite(raw) ? raw : 1));
    for (let i = 0; i < count; i++) addRow();
  });

  document.getElementById("generate-btn").addEventListener("click", generateAll);
  document.getElementById("save-png-btn").addEventListener("click", savePNG);
  document.getElementById("save-svg-btn").addEventListener("click", saveSVG);

  // Live range-value labels
  [
    ["cfg-pin-w", "cfg-pin-w-val"],
    ["cfg-pin-h", "cfg-pin-h-val"],
    ["cfg-gap",   "cfg-gap-val"],
  ].forEach(([id, spanId]) => {
    const el   = document.getElementById(id);
    const span = document.getElementById(spanId);
    el.addEventListener("input", () => { span.textContent = el.value; });
  });
}

/* ── Config ─────────────────────────────────────────────────────── */

function getConfig() {
  return {
    title:       document.getElementById("cfg-title").value.trim(),
    layout:      document.getElementById("cfg-layout").value,
    pinW:        Number(document.getElementById("cfg-pin-w").value),
    pinH:        Number(document.getElementById("cfg-pin-h").value),
    gap:         Number(document.getElementById("cfg-gap").value),
    bodyColor:   document.getElementById("cfg-body-color").value,
    showNumbers: document.getElementById("cfg-show-numbers").checked,
  };
}

/* ── Generate ───────────────────────────────────────────────────── */

function generateAll() {
  const { colors, texts, n } = collectPinData();
  if (n === 0) {
    showToast("Add at least one pin with a label and color.");
    return;
  }

  const cfg = getConfig();
  renderPinDiagram(colors, texts, cfg);
  renderPinTable(colors, texts);

  document.getElementById("diagram-empty").hidden = true;
  document.getElementById("my-svg").hidden = false;
}

function collectPinData() {
  const tbody  = document.getElementById("myTable").tBodies[0];
  const colors = [], texts = [];
  Array.from(tbody.rows).forEach((row) => {
    const color = (row.cells[1].querySelector("input[type='color']")?.value || "").trim();
    const label = (row.cells[2].querySelector("input[type='text']")?.value  || "").trim();
    if (color && label) { colors.push(color); texts.push(label); }
  });
  return { colors, texts, n: colors.length };
}

/* ── SVG helpers ────────────────────────────────────────────────── */

function svgEl(tag, attrs = {}) {
  const el = document.createElementNS("http://www.w3.org/2000/svg", tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, String(v));
  return el;
}

function drawPin(svg, x, y, w, h, color, label) {
  svg.appendChild(svgEl("rect", {
    x, y, width: w, height: h, rx: 7, ry: 7,
    fill: color,
    stroke: "rgba(0,0,0,0.18)",
    "stroke-width": 1,
  }));

  const lbl     = (label || "").trim();
  const display = lbl.length > 5 ? lbl.slice(0, 4) + "\u2026" : lbl;

  const t = svgEl("text", {
    x: x + w / 2, y: y + h / 2,
    "text-anchor": "middle",
    "dominant-baseline": "central",
    "font-size": lbl.length > 4 ? 9 : 11,
    "font-weight": "600",
    "font-family": "system-ui, sans-serif",
    fill: getContrastColor(color),
  });
  t.textContent = display;
  svg.appendChild(t);
}

function drawPinNum(svg, num, cx, cy) {
  const t = svgEl("text", {
    x: cx, y: cy,
    "text-anchor": "middle",
    "dominant-baseline": "central",
    "font-size": 10,
    "font-weight": "500",
    "font-family": "system-ui, sans-serif",
    fill: "#94a3b8",
  });
  t.textContent = num;
  svg.appendChild(t);
}

/* ── Layout: Single Row ──────────────────────────────────────────── */

function renderRow(svg, colors, labels, cfg) {
  const { pinW, pinH, gap, bodyColor, showNumbers, title } = cfg;
  const n     = colors.length;
  const PX    = 20;
  const PY    = 12;
  const TTL_H = title ? 26 : 0;
  const NUM_H = showNumbers ? 26 : 0;

  const svgW = PX * 2 + n * pinW + (n - 1) * gap;
  const svgH = PY + TTL_H + NUM_H + pinH + PY;

  svg.setAttribute("width",   svgW);
  svg.setAttribute("height",  svgH);
  svg.setAttribute("viewBox", `0 0 ${svgW} ${svgH}`);

  if (title) {
    const t = svgEl("text", {
      x: svgW / 2, y: PY + TTL_H / 2,
      "text-anchor": "middle", "dominant-baseline": "central",
      "font-size": 13, "font-weight": "700",
      "font-family": "system-ui, sans-serif",
      fill: "#374151",
    });
    t.textContent = title;
    svg.appendChild(t);
  }

  const pinY = PY + TTL_H + NUM_H;

  // Connector body
  svg.appendChild(svgEl("rect", {
    x: PX - 6, y: pinY - 4,
    width: n * pinW + (n - 1) * gap + 12,
    height: pinH + 8,
    rx: 9, fill: bodyColor, stroke: "#d1d5db", "stroke-width": 1,
  }));

  colors.forEach((color, i) => {
    const x = PX + i * (pinW + gap);
    if (showNumbers) drawPinNum(svg, i + 1, x + pinW / 2, PY + TTL_H + NUM_H / 2);
    drawPin(svg, x, pinY, pinW, pinH, color, labels[i]);
  });
}

/* ── Layout: DIP / IC ───────────────────────────────────────────── */

function renderDIP(svg, colors, labels, cfg) {
  const n = colors.length;
  if (n < 2) { renderRow(svg, colors, labels, cfg); return; }

  const { pinW, pinH, gap, bodyColor, showNumbers, title } = cfg;
  const topCount = Math.ceil(n / 2);
  const botCount = Math.floor(n / 2);
  const PX       = 20;
  const PY       = 12;
  const NUM_H    = showNumbers ? 26 : 0;
  const BODY_H   = 44;

  const svgW = PX * 2 + topCount * pinW + (topCount - 1) * gap;
  const svgH = PY + NUM_H + pinH + BODY_H + pinH + NUM_H + PY;

  svg.setAttribute("width",   svgW);
  svg.setAttribute("height",  svgH);
  svg.setAttribute("viewBox", `0 0 ${svgW} ${svgH}`);

  const topPinY = PY + NUM_H;
  const bodyY   = topPinY + pinH;
  const botPinY = bodyY + BODY_H;

  // Chip body
  svg.appendChild(svgEl("rect", {
    x: PX - 6, y: bodyY,
    width: topCount * pinW + (topCount - 1) * gap + 12,
    height: BODY_H,
    rx: 5, fill: bodyColor,
    stroke: "#d1d5db", "stroke-width": 1.5,
  }));

  // Orientation notch (semicircle on top-center)
  const cx = svgW / 2;
  svg.appendChild(svgEl("path", {
    d: `M ${cx - 9} ${bodyY} a 9 9 0 0 0 18 0`,
    fill: "#d1d5db",
  }));

  // Title in body
  if (title) {
    const t = svgEl("text", {
      x: svgW / 2, y: bodyY + BODY_H / 2,
      "text-anchor": "middle", "dominant-baseline": "central",
      "font-size": 12, "font-weight": "700",
      "font-family": "system-ui, sans-serif",
      fill: "#374151",
    });
    t.textContent = title;
    svg.appendChild(t);
  }

  // Top row: pins 1..topCount
  for (let j = 0; j < topCount; j++) {
    const x = PX + j * (pinW + gap);
    if (showNumbers) drawPinNum(svg, j + 1, x + pinW / 2, PY + NUM_H / 2);
    drawPin(svg, x, topPinY, pinW, pinH, colors[j], labels[j]);
  }

  // Bottom row: pins n..topCount+1 (DIP counterclockwise)
  for (let j = 0; j < botCount; j++) {
    const idx = n - 1 - j;
    const x   = PX + j * (pinW + gap);
    drawPin(svg, x, botPinY, pinW, pinH, colors[idx], labels[idx]);
    if (showNumbers) drawPinNum(svg, idx + 1, x + pinW / 2, botPinY + pinH + NUM_H / 2);
  }
}

/* ── Dispatcher ──────────────────────────────────────────────────── */

function renderPinDiagram(colors, labels, cfg) {
  const svg = document.getElementById("my-svg");
  svg.innerHTML = "";
  if (cfg.layout === "dip") renderDIP(svg, colors, labels, cfg);
  else                       renderRow(svg, colors, labels, cfg);
}

/* ── Pin table (left panel) ──────────────────────────────────────── */

function renderPinTable(colors, labels) {
  const tbody = document.getElementById("pin-table-body");
  tbody.innerHTML = "";

  // Remove empty-state row
  const empty = document.getElementById("table-empty-row");
  if (empty) empty.remove();

  colors.forEach((color, i) => {
    const label = labels[i] || "";
    const row   = document.createElement("tr");

    const cells = [
      Object.assign(document.createElement("td"), { textContent: i + 1 }),
      Object.assign(document.createElement("td"), { textContent: label }),
      Object.assign(document.createElement("td"), { textContent: color }),
    ];
    const preview = document.createElement("td");
    preview.style.cssText = `background:${color};width:38px;border-radius:4px;`;

    row.append(...cells, preview);
    tbody.appendChild(row);
  });
}

/* ── Helpers ─────────────────────────────────────────────────────── */

function getContrastColor(hex) {
  if (typeof hex !== "string" || hex[0] !== "#" || hex.length < 7) return "black";
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 140 ? "black" : "white";
}

function showToast(msg) {
  const c     = document.getElementById("toast-container");
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = msg;
  c.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add("toast--visible"));
  setTimeout(() => {
    toast.classList.remove("toast--visible");
    toast.addEventListener("transitionend", () => toast.remove(), { once: true });
  }, 3000);
}

/* ── Row management ──────────────────────────────────────────────── */

function addRow() {
  const tbody = document.getElementById("myTable").tBodies[0];
  const idx   = tbody.rows.length;
  const row   = document.createElement("tr");

  row.innerHTML = `
    <td>${idx + 1}</td>
    <td><input type="color" value="#6366f1" aria-label="Pin color" /></td>
    <td><input type="text" placeholder="e.g. VCC" aria-label="Pin label" /></td>
    <td style="width:1%;text-align:center;">
      <button type="button" class="btn btn--danger" aria-label="Remove pin">&#x2715;</button>
    </td>
  `;

  row.querySelector("button").addEventListener("click", () => {
    row.remove();
    renumberRows(tbody);
    updatePinCount();
  });

  tbody.appendChild(row);
  updatePinCount();
}

function renumberRows(tbody) {
  Array.from(tbody.rows).forEach((r, i) => { r.cells[0].textContent = i + 1; });
}

function updatePinCount() {
  const count = document.getElementById("myTable").tBodies[0].rows.length;
  const el    = document.getElementById("pin-count");
  if (el) el.textContent = `${count} pin${count !== 1 ? "s" : ""}`;
}

/* ── Export ──────────────────────────────────────────────────────── */

function savePNG() {
  const area = document.getElementById("to_export");
  if (!area) return;

  if (document.getElementById("pin-table-body").rows.length === 0) {
    showToast("Generate the pinout first.");
    return;
  }

  const bg = document.body.getAttribute("data-theme") === "dark" ? "#1e293b" : "#ffffff";

  domtoimage.toPng(area, { bgcolor: bg, scale: 2 })
    .then((url) => {
      const a = document.createElement("a");
      a.download = filename("png");
      a.href = url;
      a.click();
    })
    .catch(() => showToast("PNG export failed."));
}

function saveSVG() {
  const svg = document.getElementById("my-svg");
  if (!svg?.getAttribute("width")) {
    showToast("Generate the pinout first.");
    return;
  }
  const str  = '<?xml version="1.0" encoding="utf-8"?>\n' + new XMLSerializer().serializeToString(svg);
  const blob = new Blob([str], { type: "image/svg+xml" });
  const url  = URL.createObjectURL(blob);
  const a    = Object.assign(document.createElement("a"), { download: filename("svg"), href: url });
  a.click();
  URL.revokeObjectURL(url);
}

function filename(ext) {
  const d   = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `pinout_${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}.${ext}`;
}
