let app = new Vue({
  el: '#vue-wrapper',
  data: {
    message: "No data selected!",
    filters: [
      "glossary",
      "missionRewards",
      "relicRewards",
      "keyRewards",
      "transientRewards",
      "sortiesRewards",
      "modsByMod",
      "modsByEnemy",
      "blueprintsByBlueprint",
      "blueprintsByEnemy"
    ],
    menuVisible: false
  },
  methods: {
    getData(name) {
      var xmlHttp = new XMLHttpRequest()
      xmlHttp.onreadystatechange = () => { 
          if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            this.updateData(xmlHttp.responseText)
      }
      xmlHttp.open("GET", `http://localhost:8080/${name}.json`, true) // true for asynchronous 
      xmlHttp.send(null)
    },

    updateData(data) {
      document.getElementById("wrap").innerHTML = data
      this.message = data
    },

    toggleMenu() {
      console.log("toggling")
      this.menuVisible = !this.menuVisible
    }
  }
})

// let app = new Vue({
//   el: '#wrap',
//   data: {
//     message: data
//   }
// })