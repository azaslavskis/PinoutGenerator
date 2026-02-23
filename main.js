// main.js

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initUI();
  addRow();
});

/* ------------------------------------------------------------------ */
/* Theme                                                                */
/* ------------------------------------------------------------------ */

function initTheme() {
  const body           = document.body;
  const toggleCheckbox = document.getElementById("theme-toggle-checkbox");

  const stored = window.localStorage?.getItem("pinout-theme");
  if (stored === "dark") {
    body.setAttribute("data-theme", "dark");
    toggleCheckbox.checked = true;
  } else {
    body.setAttribute("data-theme", "light");
  }

  toggleCheckbox.addEventListener("change", () => {
    const isDark = toggleCheckbox.checked;
    body.setAttribute("data-theme", isDark ? "dark" : "light");
    try { window.localStorage?.setItem("pinout-theme", isDark ? "dark" : "light"); }
    catch { /* ignore */ }
  });
}

/* ------------------------------------------------------------------ */
/* UI setup                                                             */
/* ------------------------------------------------------------------ */

function initUI() {
  document.getElementById("add-pin-btn").addEventListener("click", () => {
    const raw   = Number(document.getElementById("add-count").value);
    const count = Math.max(1, Math.min(100, Number.isFinite(raw) ? raw : 1));
    for (let i = 0; i < count; i++) addRow();
  });

  document.getElementById("generate-btn").addEventListener("click", generateAll);
  document.getElementById("save-png-btn").addEventListener("click", savePNG);
  document.getElementById("save-svg-btn").addEventListener("click", saveSVG);

  // Live value display for range sliders
  [
    ["cfg-pin-w", "cfg-pin-w-val"],
    ["cfg-pin-h", "cfg-pin-h-val"],
    ["cfg-gap",   "cfg-gap-val"],
  ].forEach(([inputId, spanId]) => {
    const inp  = document.getElementById(inputId);
    const span = document.getElementById(spanId);
    inp.addEventListener("input", () => { span.textContent = inp.value; });
  });
}

/* ------------------------------------------------------------------ */
/* Config                                                               */
/* ------------------------------------------------------------------ */

function getConfig() {
  return {
    title:       document.getElementById("cfg-title").value.trim(),
    layout:      document.getElementById("cfg-layout").value,       // "row" | "dip"
    pinW:        Number(document.getElementById("cfg-pin-w").value),
    pinH:        Number(document.getElementById("cfg-pin-h").value),
    gap:         Number(document.getElementById("cfg-gap").value),
    bodyColor:   document.getElementById("cfg-body-color").value,
    showNumbers: document.getElementById("cfg-show-numbers").checked,
  };
}

/* ------------------------------------------------------------------ */
/* Pin data + rendering                                                 */
/* ------------------------------------------------------------------ */

function generateAll() {
  const { colors, texts, n } = collectPinData();

  if (n === 0) {
    showToast("Add at least one pin with a color and label.");
    return;
  }

  const cfg = getConfig();
  renderPinDiagram(colors, texts, cfg);
  renderPinTable(colors, texts);

  document.getElementById("diagram-empty").hidden = true;
  document.getElementById("my-svg").hidden = false;
}

function collectPinData() {
  const tbody  = document.getElementById("myTable").getElementsByTagName("tbody")[0];
  const colors = [];
  const texts  = [];

  Array.from(tbody.rows).forEach((row) => {
    const color = (row.cells[1].querySelector("input[type='color']")?.value || "").trim();
    const label = (row.cells[2].querySelector("input[type='text']")?.value  || "").trim();
    if (color && label) { colors.push(color); texts.push(label); }
  });

  return { colors, texts, n: colors.length };
}

/* -- SVG helpers ---------------------------------------------------- */

/** Create an SVG element with a set of attributes in one call. */
function svgEl(tag, attrs = {}) {
  const el = document.createElementNS("http://www.w3.org/2000/svg", tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, String(v));
  return el;
}

/** Draw a single colored pin rect + truncated label into `svg`. */
function drawPin(svg, x, y, pinW, pinH, color, label) {
  svg.appendChild(svgEl("rect", {
    x, y, width: pinW, height: pinH, rx: 8, ry: 8,
    fill: color, stroke: "rgba(0,0,0,0.20)", "stroke-width": 1,
  }));

  const lbl     = (label || "").trim();
  const display = lbl.length > 5 ? lbl.slice(0, 4) + "\u2026" : lbl;
  const fs      = lbl.length > 4 ? 9 : 11;

  const t = svgEl("text", {
    x: x + pinW / 2, y: y + pinH / 2,
    "text-anchor": "middle", "dominant-baseline": "central",
    "font-size": fs, "font-weight": "600",
    "font-family": "system-ui, sans-serif",
    fill: getContrastColor(color),
  });
  t.textContent = display;
  svg.appendChild(t);
}

/** Draw a small pin-number label (above or below a pin). */
function drawPinNumber(svg, num, cx, cy) {
  const t = svgEl("text", {
    x: cx, y: cy,
    "text-anchor": "middle", "dominant-baseline": "central",
    "font-size": 10, "font-weight": "500",
    "font-family": "system-ui, sans-serif",
    fill: "#9ca3af",
  });
  t.textContent = num;
  svg.appendChild(t);
}

/* -- Layout: Single Row --------------------------------------------- */

function renderRow(svg, colors, labels, cfg) {
  const { pinW, pinH, gap, bodyColor, showNumbers, title } = cfg;
  const n     = colors.length;
  const PAD_X = 20;
  const PAD_Y = 12;
  const TTL_H = title ? 28 : 0;
  const NUM_H = showNumbers ? 28 : 0;

  const svgW = PAD_X * 2 + n * pinW + (n - 1) * gap;
  const svgH = PAD_Y + TTL_H + NUM_H + pinH + PAD_Y;

  svg.setAttribute("width",   svgW);
  svg.setAttribute("height",  svgH);
  svg.setAttribute("viewBox", `0 0 ${svgW} ${svgH}`);

  // Optional title above connector
  if (title) {
    const t = svgEl("text", {
      x: svgW / 2, y: PAD_Y + TTL_H / 2,
      "text-anchor": "middle", "dominant-baseline": "central",
      "font-size": 13, "font-weight": "700",
      "font-family": "system-ui, sans-serif",
      fill: "#374151",
    });
    t.textContent = title;
    svg.appendChild(t);
  }

  const pinY = PAD_Y + TTL_H + NUM_H;

  // Connector body background
  svg.appendChild(svgEl("rect", {
    x: PAD_X - 6, y: pinY - 4,
    width: n * pinW + (n - 1) * gap + 12, height: pinH + 8,
    rx: 10, fill: bodyColor, stroke: "#d1d5db", "stroke-width": 1,
  }));

  colors.forEach((color, i) => {
    const x = PAD_X + i * (pinW + gap);
    if (showNumbers) drawPinNumber(svg, i + 1, x + pinW / 2, PAD_Y + TTL_H + NUM_H / 2);
    drawPin(svg, x, pinY, pinW, pinH, color, labels[i]);
  });
}

/* -- Layout: DIP / IC ----------------------------------------------- */

function renderDIP(svg, colors, labels, cfg) {
  const n = colors.length;

  // DIP needs at least 2 pins; fall back to row for 1
  if (n < 2) {
    renderRow(svg, colors, labels, cfg);
    return;
  }

  const { pinW, pinH, gap, bodyColor, showNumbers, title } = cfg;
  const topCount = Math.ceil(n / 2);
  const botCount = Math.floor(n / 2);
  const PAD_X    = 20;
  const PAD_Y    = 12;
  const NUM_H    = showNumbers ? 28 : 0;
  const BODY_H   = 44;

  const svgW = PAD_X * 2 + topCount * pinW + (topCount - 1) * gap;
  const svgH = PAD_Y + NUM_H + pinH + BODY_H + pinH + NUM_H + PAD_Y;

  svg.setAttribute("width",   svgW);
  svg.setAttribute("height",  svgH);
  svg.setAttribute("viewBox", `0 0 ${svgW} ${svgH}`);

  const topPinY = PAD_Y + NUM_H;
  const bodyY   = topPinY + pinH;
  const botPinY = bodyY + BODY_H;

  // Chip body
  svg.appendChild(svgEl("rect", {
    x: PAD_X - 6, y: bodyY,
    width: topCount * pinW + (topCount - 1) * gap + 12, height: BODY_H,
    rx: 5, fill: bodyColor, stroke: "#d1d5db", "stroke-width": 1.5,
  }));

  // Orientation notch (semicircle on top edge, indicating pin 1 side)
  svg.appendChild(svgEl("path", {
    d: `M ${PAD_X + topCount * pinW / 2 + (topCount - 1) * gap / 2 - 10} ${bodyY} a 10 10 0 0 0 20 0`,
    fill: "#d1d5db",
  }));

  // Title inside chip body
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

  // Top row: pins 1..topCount (left to right)
  for (let j = 0; j < topCount; j++) {
    const idx = j;
    const x   = PAD_X + j * (pinW + gap);
    if (showNumbers) drawPinNumber(svg, idx + 1, x + pinW / 2, PAD_Y + NUM_H / 2);
    drawPin(svg, x, topPinY, pinW, pinH, colors[idx], labels[idx]);
  }

  // Bottom row: pins n..topCount+1 (left to right → counterclockwise DIP)
  for (let j = 0; j < botCount; j++) {
    const idx = n - 1 - j;
    const x   = PAD_X + j * (pinW + gap);
    drawPin(svg, x, botPinY, pinW, pinH, colors[idx], labels[idx]);
    if (showNumbers) drawPinNumber(svg, idx + 1, x + pinW / 2, botPinY + pinH + NUM_H / 2);
  }
}

/* -- Dispatcher ----------------------------------------------------- */

function renderPinDiagram(colors, labels, cfg) {
  const svg = document.getElementById("my-svg");
  svg.innerHTML = "";

  if (cfg.layout === "dip") {
    renderDIP(svg, colors, labels, cfg);
  } else {
    renderRow(svg, colors, labels, cfg);
  }
}

/* ------------------------------------------------------------------ */
/* Pin table (left panel)                                              */
/* ------------------------------------------------------------------ */

function renderPinTable(colors, labels) {
  const tbody = document.getElementById("pin-table-body");
  tbody.innerHTML = "";

  colors.forEach((color, i) => {
    const label = labels[i] || "";
    const row   = document.createElement("tr");

    const pinCell     = document.createElement("td");
    pinCell.textContent = i + 1;

    const labelCell   = document.createElement("td");
    labelCell.textContent = label;

    const colorCell   = document.createElement("td");
    colorCell.textContent = color;

    const previewCell = document.createElement("td");
    previewCell.style.cssText = `background-color:${color};width:40px;border-radius:4px;`;

    row.append(pinCell, labelCell, colorCell, previewCell);
    tbody.appendChild(row);
  });
}

/* ------------------------------------------------------------------ */
/* Helpers                                                              */
/* ------------------------------------------------------------------ */

function getContrastColor(bgColor) {
  if (typeof bgColor !== "string" || bgColor[0] !== "#" || bgColor.length < 7) return "black";
  const r = parseInt(bgColor.slice(1, 3), 16);
  const g = parseInt(bgColor.slice(3, 5), 16);
  const b = parseInt(bgColor.slice(5, 7), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 140 ? "black" : "white";
}

function showToast(msg, type = "error") {
  const container = document.getElementById("toast-container");
  const toast     = document.createElement("div");
  toast.className = `toast toast--${type}`;
  toast.textContent = msg;
  container.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add("toast--visible"));
  setTimeout(() => {
    toast.classList.remove("toast--visible");
    toast.addEventListener("transitionend", () => toast.remove(), { once: true });
  }, 3000);
}

/* ------------------------------------------------------------------ */
/* Row management                                                       */
/* ------------------------------------------------------------------ */

function addRow() {
  const tbody    = document.getElementById("myTable").getElementsByTagName("tbody")[0];
  const rowIndex = tbody.rows.length;
  const row      = document.createElement("tr");

  row.innerHTML = `
    <td>${rowIndex + 1}</td>
    <td><input type="color" value="#6366f1" aria-label="Pin color" /></td>
    <td><input type="text" placeholder="e.g. VCC" aria-label="Pin label" /></td>
    <td style="width:1%;">
      <button type="button" class="button--icon button--danger" aria-label="Remove pin">&#x2715;</button>
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
  Array.from(tbody.rows).forEach((row, idx) => { row.cells[0].textContent = idx + 1; });
}

function updatePinCount() {
  const tbody = document.getElementById("myTable").getElementsByTagName("tbody")[0];
  const count = tbody.rows.length;
  const el    = document.getElementById("pin-count");
  if (el) el.textContent = `${count} pin${count !== 1 ? "s" : ""}`;
}

/* ------------------------------------------------------------------ */
/* Export                                                               */
/* ------------------------------------------------------------------ */

function savePNG() {
  const exportArea = document.getElementById("to_export");
  if (!exportArea) return;

  if (document.getElementById("pin-table-body").rows.length === 0) {
    showToast("Generate the pinout before exporting.");
    return;
  }

  const bg = document.body.getAttribute("data-theme") === "dark" ? "#111827" : "#ffffff";

  domtoimage
    .toPng(exportArea, { bgcolor: bg, scale: 2 })
    .then((dataUrl) => {
      const link     = document.createElement("a");
      link.download  = generateFilename("png");
      link.href      = dataUrl;
      link.click();
    })
    .catch(() => showToast("PNG export failed. Try again."));
}

function saveSVG() {
  const svg = document.getElementById("my-svg");
  if (!svg || !svg.getAttribute("width")) {
    showToast("Generate the pinout before exporting.");
    return;
  }

  const svgStr = '<?xml version="1.0" encoding="utf-8"?>\n' +
    new XMLSerializer().serializeToString(svg);
  const blob   = new Blob([svgStr], { type: "image/svg+xml" });
  const url    = URL.createObjectURL(blob);
  const link   = document.createElement("a");
  link.download = generateFilename("svg");
  link.href     = url;
  link.click();
  URL.revokeObjectURL(url);
}

function generateFilename(ext = "png") {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `pinout_${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}.${ext}`;
}
