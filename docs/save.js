function clear() {
    window.location.reload();
    
}

function generateFilename() {
    // Get the current date and time
    var now = new Date();
  
    // Extract the individual components of the timestamp
    var year = now.getFullYear();
    var month = now.getMonth() + 1;
    var day = now.getDate();
    var hours = now.getHours();
    var minutes = now.getMinutes();
    var seconds = now.getSeconds();
  
    // Pad the month, day, hours, minutes, and seconds with leading zeros if needed
    month = month < 10 ? "0" + month : month;
    day = day < 10 ? "0" + day : day;
    hours = hours < 10 ? "0" + hours : hours;
    minutes = minutes < 10 ? "0" + minutes : minutes;
    seconds = seconds < 10 ? "0" + seconds : seconds;
  
    // Assemble the filename using the formatted components
    var filename =
      day +
      "_" +
      month +
      "_" +
      year +
      "_" +
      hours +
      "_" +
      minutes +
      ".png";
  
    // Return the filename
    return filename;
  }
  

function save() {
    html2canvas(document.querySelector("#exportable")).then(data=>DownloadCanvasAsImage(data))

}

function DownloadCanvasAsImage(canvas){
    let downloadLink = document.createElement('a');
    downloadLink.setAttribute('download', generateFilename());

    canvas.toBlob(function(blob) {
      let url = URL.createObjectURL(blob);
      downloadLink.setAttribute('href', url);
      downloadLink.click();
    });
    clear();
}

