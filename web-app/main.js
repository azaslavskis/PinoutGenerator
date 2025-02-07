function on_load() {
    window.allow_updated = true;
    console.log("[on_load] Beta features enabled:", window.allow_updated);
}

// Generate Pinout
function generateAll() {
    console.log("[generateAll] Generating pinout...");
    const data = generateList();
    console.log("[generateAll] Data received:", data);

    do_pinout(data.colors, data.texts, data.n, 1, false);
}

// Draw Pinout in SVG
function do_pinout(colors, text, n, x, is_black) {
    console.log(`[do_pinout] Drawing ${n} pins`);
    const svg = document.getElementById("my-svg");
    svg.innerHTML = ""; // Clear previous drawings

    const size = 50;
    const startX = 20, startY = 50;

    for (let i = 0; i < n; i++) {
        let pinX = startX + (i * size);
        let color = colors[i] || "gray";
        let label = text[i] || "N/A";

        let square = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        square.setAttribute("x", pinX);
        square.setAttribute("y", startY);
        square.setAttribute("width", size);
        square.setAttribute("height", size);
        square.setAttribute("stroke", "black");
        square.setAttribute("fill", color);

        let letter = document.createElementNS("http://www.w3.org/2000/svg", "text");
        letter.setAttribute("x", pinX + size / 2);
        letter.setAttribute("y", startY + size / 2);
        letter.setAttribute("text-anchor", "middle");
        letter.setAttribute("alignment-baseline", "central");
        letter.setAttribute("fill", getContrastColor(color));
        letter.textContent = label;

        svg.appendChild(square);
        svg.appendChild(letter);
    }
}

// Determine Text Contrast for Readability
function getContrastColor(bgColor) {
    let r = parseInt(bgColor.substr(1, 2), 16);
    let g = parseInt(bgColor.substr(3, 2), 16);
    let b = parseInt(bgColor.substr(5, 2), 16);
    let brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 125 ? "black" : "white";
}

// Generate List from Table
function generateList() {
    let rows = document.getElementById("myTable").getElementsByTagName("tbody")[0].rows;
    let colors = [], texts = [];

    [...rows].forEach(row => {
        let color = row.cells[1].querySelector("input").value.trim();
        let pin = row.cells[2].querySelector("input").value.trim();
        if (color && pin) {
            colors.push(color);
            texts.push(pin);
        }
    });

    console.log("[generateList] Colors:", colors);
    console.log("[generateList] Texts:", texts);
    return { colors, texts, n: colors.length };
}

// Add Pin Row
function addRow() {
    let table = document.getElementById("myTable").getElementsByTagName("tbody")[0];
    let rowCount = table.rows.length;
    let row = document.createElement("tr");

    row.innerHTML = `
        <td>${rowCount}</td>
        <td><input type="color"></td>
        <td><input type="text"></td>
        <td><button onclick="removeRow(this)">❌</button></td>
    `;

    table.appendChild(row);
}

// Remove Pin Row
function removeRow(button) {
    button.parentElement.parentElement.remove();
}

// Save SVG as PNG
function saveSVG() {
    console.log("[saveSVG] Capturing image...");
    let svgElement = document.getElementById("exportable");
    html2canvas(svgElement).then(canvas => DownloadCanvasAsImage(canvas));
}

// Download PNG
function DownloadCanvasAsImage(canvas) {
    console.log("[DownloadCanvasAsImage] Saving image...");
    let downloadLink = document.createElement('a');
    downloadLink.download = generateFilename();
    canvas.toBlob(blob => {
        downloadLink.href = URL.createObjectURL(blob);
        downloadLink.click();
    });
}

// Generate Filename
function generateFilename() {
    let now = new Date();
    return `pinout_${now.getFullYear()}_${now.getMonth() + 1}_${now.getDate()}_${now.getHours()}_${now.getMinutes()}.png`;
}

// Toggle Theme
function toggleTheme() {
    let stylesheet = document.getElementById("theme-stylesheet");
    stylesheet.setAttribute("href", stylesheet.getAttribute("href") === "modern.css" ? "styles.css" : "modern.css");
}
