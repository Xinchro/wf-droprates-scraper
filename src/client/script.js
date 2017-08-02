let app = new Vue({
  el: '#vue-wrapper',
  data: {
    message: "No data selected!",
    filters: [
      // { name: "glossary",
      //   id: 0 },
      { name: "missionRewards",
        label: "mission rewards",
        id: 1 },
      { name: "relicRewards",
        label: "relic rewards",
        id: 2 },
      { name: "keyRewards",
        label: "key rewards",
        id: 3 },
      { name: "transientRewards",
        label: "transient rewards",
        id: 4 },
      { name: "sortiesRewards",
        label: "sorties rewards",
        id: 5 },
      { name: "modsByMod",
        label: "mods by mod",
        id: 6 },
      { name: "modsByEnemy",
        label: "mods by enemy",
        id: 7 },
      { name: "blueprintsByBlueprint",
        label: "blueprints by blueprint",
        id: 8 },
      { name: "blueprintsByEnemy",
        label: "blueprints by enemy",
        id: 9 }
    ],
    menuVisible: true,
    currentFilters: [],
    dropdata: {}
  },
  methods: {
    getData(name) {
      var xmlHttp = new XMLHttpRequest()
      xmlHttp.onreadystatechange = () => { 
          if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            this.dropdata = JSON.parse(xmlHttp.responseText)
      }
      xmlHttp.open("GET", `http://localhost:8080/${name}.json`, true) // true for asynchronous 
      xmlHttp.send(null)
    },

    updateData(data) {
      // document.getElementById("wrap").innerHTML = data
      this.message = data
    },

    toggleMenu() {
      this.menuVisible = !this.menuVisible
    },

    checkbox(id) {
      return document.getElementById(id)
    },

    updateCurrentFilters() {
      this.currentFilters = []

      for(let i=0;i<this.filters.length;i++) {
        if(this.checkbox(i+1).checked) {
          this.currentFilters.push(i+1)
        }
      }

      this.updateSearchResults()
    },

    updateSearchResults() {
      let tempMsg = ""
      let data = {}
      for(let i=0;i<this.filters.length;i++) {
        for(let j=0;j<this.currentFilters.length;j++) {
          if(this.currentFilters[j] === this.filters[i].id) {
            tempMsg += `${this.filters[i].label} `
            // TODO do this properly
            this.getData(this.filters[i].name)
          }
        }
      }

      if(tempMsg === "") tempMsg = "No data selected!"
      this.message = tempMsg

      // this.dropdata = data
    }
  }
})