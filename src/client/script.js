let app = new Vue({
  el: '#vue-wrapper',
  data: {
    message: "No data selected!",
    filters: [
      // { name: "glossary",
      //   id: 0 },
      { name: "missionRewards",
        label: "mission rewards",
        id: 1,
        on: false },
      { name: "relicRewards",
        label: "relic rewards",
        id: 2,
        on: false },
      { name: "keyRewards",
        label: "key rewards",
        id: 3,
        on: false },
      { name: "transientRewards",
        label: "transient rewards",
        id: 4,
        on: false },
      { name: "sortiesRewards",
        label: "sorties rewards",
        id: 5,
        on: false },
      { name: "modsByMod",
        label: "mods by mod",
        id: 6,
        on: false },
      { name: "modsByEnemy",
        label: "mods by enemy",
        id: 7,
        on: false },
      { name: "blueprintsByBlueprint",
        label: "blueprints by blueprint",
        id: 8,
        on: false },
      { name: "blueprintsByEnemy",
        label: "blueprints by enemy",
        id: 9,
        on: false }
    ],
    appliedFilters: 0,
    menuVisible: true,
    dropdata: {},
    filteredData: {},
    searchText: ""
  },
  watch :{
    searchText: function (text) {
      this.search(text)
    }
  },
  methods: {
    getData(name) {
      // console.log("getting data", name)
      if(name) {
        var xmlHttp = new XMLHttpRequest()
        xmlHttp.onreadystatechange = () => { 
          if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
            if(this.appliedFilters > 0) {
              this.updateData(JSON.parse(xmlHttp.responseText))
            }
          }
        }
        xmlHttp.open("GET", `http://localhost:8080/${name}.json?=${new Date(new Date().getTime()).toLocaleString()}`, true) // true for asynchronous 
        xmlHttp.send(null)
      } else {
        // console.log("empty data")
        this.updateData({})
      }
    },

    updateData(newData) {
      // console.log("updating data", newData)
      this.dropdata = newData
      this.search("")
    },

    toggleMenu() {
      this.menuVisible = !this.menuVisible
    },

    checkbox(id) {
      return document.getElementById(id)
    },

    updateCurrentFilters(filterID) {
      this.appliedFilters = 0

      for(let i=0;i<this.filters.length;i++) {
        if(this.checkbox(i+1).checked) {
          this.filters[i].on = true
          this.appliedFilters++
        }else{
          this.filters[i].on = false
        }
      }

      this.updateSearchResults()
    },

    updateSearchResults() {
      let tempMsg = ""

      for(let i=0;i<this.filters.length;i++) {
        if(this.filters[i].on) {
          tempMsg += `${this.filters[i].label} `
          // TODO do this properly
          this.getData(this.filters[i].name)
        }
      }
      if(this.appliedFilters > 0) {
        this.getData()
      }

      if(tempMsg === "") {
        tempMsg = "No data selected!"
      }
      this.message = tempMsg

      // this.dropdata = data
    },

    search(text) {
      this.filteredData = {}
      let searchTerms = text.split(" ")
      let allSearchTerms

      if(text != "") {
        try {
          this.dropdata.sections.forEach((section) => {
            allSearchTerms = true
            searchTerms.forEach((searchTerm) => {
              if(!section.section.toLowerCase().includes(searchTerm.toLowerCase())) {
                allSearchTerms = false
              }
            })

            if(allSearchTerms) {
              if(!this.filteredData.sections) this.filteredData.sections = []
              this.filteredData.sections.push(section)
            }
          })
        } catch(err) {
          console.log(err)
        }
      } else {
        this.filteredData = this.dropdata
      }

    }

  }
})