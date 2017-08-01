function getData(name) {
  var xmlHttp = new XMLHttpRequest()
  xmlHttp.onreadystatechange = function() { 
      if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
          updateData(xmlHttp.responseText)
  }
  xmlHttp.open("GET", `http://localhost:8080/${name}.json`, true) // true for asynchronous 
  xmlHttp.send(null)

  // console.log()
}

function updateData(data) {
  document.getElementById("wrap").innerHTML = data
}