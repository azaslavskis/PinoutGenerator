function addRow() {
    // Get the table element and the tbody element
    var table = document.getElementById("myTable");
    var tbody = table.getElementsByTagName("tbody")[0];
  
    // Get the number of rows currently in the table
    var rowCount = table.rows.length;
  
    // Create a new row element and three new cell elements
    var row = document.createElement("tr");
    var indexCell = document.createElement("td");
    var colorCell = document.createElement("td");
    var pinCell = document.createElement("td");
  
    // Set the text content of the index cell to the row count
    indexCell.textContent = rowCount;
  
    // Create input elements for the color and pin cells
    var colorInput = document.createElement("input");
    var pinInput = document.createElement("input");
    colorInput.setAttribute("type", "text");
    pinInput.setAttribute("type", "text");
  
    // Add the input elements to the color and pin cells
    colorCell.appendChild(colorInput);
    pinCell.appendChild(pinInput);
  
    // Add the cells to the row
    row.appendChild(indexCell);
    row.appendChild(colorCell);
    row.appendChild(pinCell);
  
    // Add the row to the table body
    tbody.appendChild(row);
  }
  
  function generateList() {
    // Get the table element and the tbody element
    var table = document.getElementById("myTable");
    var tbody = table.getElementsByTagName("tbody")[0];
  
    // Check if the table has at least one row
    if (table.rows.length < 1) {
      console.log("Table has no rows!");
      return;
    }
  
    // Check if the tbody element exists
    if (!tbody) {
      console.log("Table body not found!");
      return;
    }
  
    // Get the number of rows currently in the table
    var rowCount = table.rows.length;
  
    // Create two empty arrays
    var texts = [];
    var colors = [];
  
    // Loop through all the rows in the table
    for (var i = 0; i < rowCount; i++) {
      // Get the color and pin input elements for this row
      var colorInput = tbody.rows[i];
      if(colorInput != undefined){

       var cell=colorInput.cells[1];
       var color = cell.getElementsByTagName("input")[0];


       var pin=colorInput.cells[2];
       var pin_val = pin.getElementsByTagName("input")[0];
       texts.push(pin_val.value);
       colors.push(color.value);
      }
     

    }
  
  return {"colors":colors,"texts":texts,"n":rowCount};
  }
