function do_pinout(colors,text,n,x,is_black) {
    // Get the SVG element
    var svg = document.getElementById("my-svg");

    // Calculate the size of the squares and circles
    var size = 50;
    var padding = 10;
    var totalSize = (size + padding) * n;
    var startX = 0;
    var startY = 30;

    // Loop through each square and circle
    for (var i = 0; i < n; i++) {
        for (var j = 0; j < x; j++) {

       

            if(i > 0) {
            // Create a square
            var square = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            square.setAttribute("x", startX + i * (size ));
            square.setAttribute("y", startY + j * (size ));
            square.setAttribute("width", size);
            square.setAttribute("height", size);
            square.setAttribute("fill", "none");
            square.setAttribute("stroke", "black");

            // Create a circle
            var circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            circle.setAttribute("cx", startX + i * (size ) + size / 2);
            circle.setAttribute("cy", startY + j * (size ) + size / 2);
            circle.setAttribute("r", size / 2 - 2);
            circle.setAttribute("fill", colors[(i + j) % colors.length]);

            
        }

        if(i==0){
            var square = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            square.setAttribute("x", startX + i * (size ));
            square.setAttribute("y", startY + j * (size ));
            square.setAttribute("width", size);
            square.setAttribute("height", size);
            square.setAttribute("stroke", "black");
            square.setAttribute("fill", colors[i+j]);
          
        }
            
            var letter = document.createElementNS("http://www.w3.org/2000/svg", "text");
            // Create a text element with a letter from the array
            var letter = document.createElementNS("http://www.w3.org/2000/svg", "text");
            letter.setAttribute("x", startX + i * (size ) + size / 2);
            letter.setAttribute("y", startY + j * (size ) + size / 2);
            letter.setAttribute("text-anchor", "middle");
            letter.setAttribute("alignment-baseline", "central");

            letter.textContent = text[(i + j) % text.length];
            var color_now=colors[(i + j) % colors.length];
            console.log(invertColor(color_now,is_black));
            letter.setAttribute("fill", invertColor(color_now,is_black));

            var number = document.createElementNS("http://www.w3.org/2000/svg", "text");
        number.setAttribute("x", startX + i * (size ) + size / 2);
        number.setAttribute("y", startY + j * (size ) -15);
        number.setAttribute("text-anchor", "middle");
        number.setAttribute("alignment-baseline", "central");
        number.setAttribute("fill", "black");
        number.setAttribute("font-size", "24");
        number.textContent = (j * n + i + 1).toString();

        if( i > 0){
            svg.appendChild(square);
            svg.appendChild(circle);
            svg.appendChild(letter);
            svg.appendChild(number);
        }
        else {
            svg.appendChild(square);
            svg.appendChild(letter);
            svg.appendChild(number);
        }
          
        }
    }
}

function invertColor(str,is_black) {
var hash = 0;
for (var i = 0; i < str.length; i++) {
hash = str.charCodeAt(i) + ((hash << 5) - hash);
}
var colour = '#';
for (var i = 0; i < 3; i++) {
var value = 255-(hash >> (i * 8)) & 0xFF;
colour += ('00' + value.toString(16)).substr(-2);
}
// console.log(colour);
if(is_black==true){
return "black";
}
else {
return colour;
}
}

function table_generate(colors,text) {
    // Define the pin texts and colors arrays
		var pinTexts = text;
		var pinColors = colors;

		// Get the table body element
		var tableBody = document.getElementById("pin-table-body");
	       tableBody.innerHTML = "";

		// Loop through each pin and generate a table row
		for (var i = 0; i < pinTexts.length; i++) {
			// Create a new row element
			var row = document.createElement("tr");

			// Create a new cell element for the pin number
			var pinNumberCell = document.createElement("td");
			pinNumberCell.textContent = (i + 1).toString();
			row.appendChild(pinNumberCell);

			// Create a new cell element for the pin text
			var pinTextCell = document.createElement("td");
			pinTextCell.textContent = pinTexts[i];
			row.appendChild(pinTextCell);

			// Create a new cell element for the pin color
			var pinColorCell = document.createElement("td");
			//pinColorCell.style.backgroundColor = pinColors[i];
			pinColorCell.textContent = pinColors[i];
			row.appendChild(pinColorCell);

            var pinColorCell = document.createElement("td");
			pinColorCell.style.backgroundColor = pinColors[i];
			//pinColorCell.textContent = pinColors[i];
			row.appendChild(pinColorCell);

			// Add the row to the table body
			tableBody.appendChild(row);
		}
}
