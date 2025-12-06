// main.js – modernized, cleaned-up logic

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initUI();
  addRow(); // start with one empty pin row
});

/* ------------------------------------------------------------------ */
/* Theme handling                                                     */
/* ------------------------------------------------------------------ */

function initTheme() {
  const body = document.body;
  const toggleCheckbox = document.getElementById("theme-toggle-checkbox");

  // Optional: restore theme from localStorage
  const storedTheme = window.localStorage?.getItem("pinout-theme");
  if (storedTheme === "dark") {
    body.setAttribute("data-theme", "dark");
    toggleCheckbox.checked = true;
  } else {
    body.setAttribute("data-theme", "light");
  }

  toggleCheckbox.addEventListener("change", () => {
    const isDark = toggleCheckbox.checked;
    body.setAttribute("data-theme", isDark ? "dark" : "light");
    try {
      window.localStorage?.setItem("pinout-theme", isDark ? "dark" : "light");
    } catch {
      /* ignore storage errors */
    }
  });
}

/* ------------------------------------------------------------------ */
/* UI setup                                                           */
/* ------------------------------------------------------------------ */

function initUI() {
  document.getElementById("add-pin-btn").addEventListener("click", addRow);
  document.getElementById("generate-btn").addEventListener("click", generateAll);
  document.getElementById("save-btn").addEventListener("click", savePNG);
}

/* ------------------------------------------------------------------ */
/* Pin data + rendering                                               */
/* ------------------------------------------------------------------ */

function generateAll() {
  const { colors, texts, n } = collectPinData();

  if (n === 0) {
    alert("Please add at least one pin with a color and label.");
    return;
  }

  renderPinDiagram(colors, texts);
  renderPinTable(colors, texts);
}

function collectPinData() {
  const tableBody = document
    .getElementById("myTable")
    .getElementsByTagName("tbody")[0];

  const rows = Array.from(tableBody.rows);
  const colors = [];
  const texts = [];

  rows.forEach((row) => {
    const colorInput = row.cells[1].querySelector("input[type='color']");
    const labelInput = row.cells[2].querySelector("input[type='text']");

    const color = (colorInput?.value || "").trim();
    const label = (labelInput?.value || "").trim();

    if (color && label) {
      colors.push(color);
      texts.push(label);
    }
  });

  return { colors, texts, n: colors.length };
}

function renderPinDiagram(colors, labels) {
  const svg = document.getElementById("my-svg");
  svg.innerHTML = "";

  const size = 50;
  const paddingX = 24;
  const startY = 60;

  colors.forEach((color, index) => {
    const label = labels[index] || "";
    const x = paddingX + index * (size + 8);

    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute("x", x);
    rect.setAttribute("y", startY);
    rect.setAttribute("width", size);
    rect.setAttribute("height", size);
    rect.setAttribute("rx", 7);
    rect.setAttribute("ry", 7);
    rect.setAttribute("stroke", "#111827");
    rect.setAttribute("stroke-width", 1);
    rect.setAttribute("fill", color);

    const text = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "text"
    );
    text.setAttribute("x", x + size / 2);
    text.setAttribute("y", startY + size / 2);
    text.setAttribute("text-anchor", "middle");
    text.setAttribute("dominant-baseline", "central");
    text.setAttribute("font-size", 12);
    text.setAttribute("font-family", "system-ui, sans-serif");
    text.setAttribute("fill", getContrastColor(color));
    text.textContent = label;

    svg.appendChild(rect);
    svg.appendChild(text);
  });
}

function renderPinTable(colors, labels) {
  const tableBody = document.getElementById("pin-table-body");
  tableBody.innerHTML = "";

  colors.forEach((color, index) => {
    const label = labels[index] || "";

    const row = document.createElement("tr");

    const pinCell = document.createElement("td");
    pinCell.textContent = index + 1;

    const labelCell = document.createElement("td");
    labelCell.textContent = label;

    const colorCell = document.createElement("td");
    colorCell.textContent = color;

    const previewCell = document.createElement("td");
    previewCell.style.backgroundColor = color;
    previewCell.style.width = "40px";

    row.appendChild(pinCell);
    row.appendChild(labelCell);
    row.appendChild(colorCell);
    row.appendChild(previewCell);

    tableBody.appendChild(row);
  });
}

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */

function getContrastColor(bgColor) {
  // expects #rrggbb
  if (typeof bgColor !== "string" || bgColor[0] !== "#" || bgColor.length < 7) {
    return "black";
  }

  const r = parseInt(bgColor.substr(1, 2), 16);
  const g = parseInt(bgColor.substr(3, 2), 16);
  const b = parseInt(bgColor.substr(5, 2), 16);

  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 140 ? "black" : "white";
}

/* ------------------------------------------------------------------ */
/* Row management                                                     */
/* ------------------------------------------------------------------ */

function addRow() {
  const tableBody = document
    .getElementById("myTable")
    .getElementsByTagName("tbody")[0];

  const rowIndex = tableBody.rows.length;
  const row = document.createElement("tr");

  row.innerHTML = `
    <td>${rowIndex + 1}</td>
    <td><input type="color" value="#cccccc" aria-label="Pin color" /></td>
    <td><input type="text" placeholder="Pin label" aria-label="Pin label" /></td>
    <td style="width: 1%;">
      <button type="button" class="button--icon button--danger" aria-label="Remove pin">
        ✕
      </button>
    </td>
  `;

  const removeButton = row.querySelector("button");
  removeButton.addEventListener("click", () => {
    row.remove();
    renumberRows(tableBody);
  });

  tableBody.appendChild(row);
}

function renumberRows(tbody) {
  Array.from(tbody.rows).forEach((row, idx) => {
    row.cells[0].textContent = idx + 1;
  });
}

/* ------------------------------------------------------------------ */
/* Export                                                             */
/* ------------------------------------------------------------------ */

function savePNG() {
  const exportArea = document.getElementById("to_export");

  if (!exportArea) return;

  // Ensure there is something to export
  const hasPins = document.getElementById("pin-table-body").rows.length > 0;
  if (!hasPins) {
    alert("Generate the pinout before exporting.");
    return;
  }

  html2canvas(exportArea, {
    backgroundColor: null
  }).then((canvas) => {
    downloadCanvasAsImage(canvas);
  });
}

function downloadCanvasAsImage(canvas) {
  const link = document.createElement("a");
  link.download = generateFilename();
  canvas.toBlob((blob) => {
    if (!blob) return;
    link.href = URL.createObjectURL(blob);
    link.click();
    URL.revokeObjectURL(link.href);
  });
}

function generateFilename() {
  const now = new Date();

  const pad = (n) => String(n).padStart(2, "0");

  const yyyy = now.getFullYear();
  const mm = pad(now.getMonth() + 1);
  const dd = pad(now.getDate());
  const hh = pad(now.getHours());
  const min = pad(now.getMinutes());

  return `pinout_${yyyy}${mm}${dd}_${hh}${min}.png`;
}
