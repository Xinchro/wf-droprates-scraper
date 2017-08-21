let renderStart = 0
let renderEnd = 10

let sectionSearchWorker = new Worker("searchSections.js")

let app = new Vue({
  el: '#vue-wrapper',
  data: {
    filters: [
      // { name: "glossary",
      //   id: 0 },
      { name: "missionRewards",
        label: "Mission Rewards",
        id: 1,
        on: true },
      { name: "relicRewards",
        label: "Relic Rewards",
        id: 2,
        on: true },
      { name: "keyRewards",
        label: "Key Rewards",
        id: 3,
        on: true },
      { name: "transientRewards",
        label: "Transient Rewards",
        id: 4,
        on: true },
      { name: "sortiesRewards",
        label: "Sorties Rewards",
        id: 5,
        on: true },
      { name: "modsByMod",
        label: "Mods by Mod",
        id: 6,
        on: true },
      { name: "modsByEnemy",
        label: "Mods by Enemy",
        id: 7,
        on: true },
      { name: "blueprintsByBlueprint",
        label: "Blueprints by Blueprint",
        id: 8,
        on: true },
      { name: "blueprintsByEnemy",
        label: "Blueprints by Enemy",
        id: 9,
        on: true }
    ],
    menuVisible: true,
    dropdata: {},
    filteredData: {},
    renderedData: {},
    searchText: "",
    displayHelp: true,
    busy: false
  },
  watch :{
    searchText: function (text) {
      this.search(text)
    }
  },
  methods: {
    getData(name) {
      return new Promise((resolve, reject) => {
        if(name) {
          var xmlHttp = new XMLHttpRequest()
          xmlHttp.onreadystatechange = () => { 
            if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
              resolve(JSON.parse(xmlHttp.responseText))
            }
          }
          xmlHttp.open("GET", `https://wf-drops.xinchronize.com/data/${name}.json?=${new Date(new Date().getTime()).toLocaleString()}`, true) // true for asynchronous
          xmlHttp.send(null)
        } else {
          // console.log("empty data")
          resolve()
        }
      })
    },

    getDataList(list) {
      let allSections = []

      return new Promise((resolve, reject) => {
        let filters = this.filters
        let getData = this.getData

        // start loop function
        a(0)

        // setup loop function
        function a(index) {
          // set current filter
          let filter = filters[index]

          // get data only if current filter is on
          getData(
            filter.on ? filter.name : ""
          )
          .then(data => {
            // if filter is on, push to filtered sections
            if(filter.on) {
              data.sections.forEach(section => {
                allSections.push(section)
              })
            }

            // increment loop function index
            index++

            // if index is smaller than filters, call again
            // if not, resolve function and return filtered sections
            if(index < filters.length) {
              a(index)
            } else {
              resolve({ sections: allSections })
            }
          })
        }
      })

    },

    updateSearchResults() {
      this.$set(this.filteredData, "sections", {})

      this.getDataList(this.filters)
      .then((data) => {
        this.updateData(data)
      })
    },

    search(text) {
      this.displayHelp = false

      let searchTerms = text.split(" ")

      renderStart = 0
      renderEnd = 10

      if(!this.filteredData.sections) {
        this.$set(this.filteredData, "sections", [])
        this.addHead()
      }
      if(!this.dropdata.sections) {
        this.$set(this.filteredData, "sections", this.dropdata)
        this.addHead()
      } else {

        // new thread for search
        sectionSearchWorker.postMessage([this.dropdata.sections, searchTerms])

        // render data when search thread is complete
        sectionSearchWorker.onmessage = (e) => {
          this.$set(this.filteredData, "sections", e.data)
          this.addHead()
        }
      }
    },

    updateData(newData) {
      this.$set(this, "dropdata", newData)
      this.searchText = ""
      this.search("")
    },

    toggleMenu() {
      this.menuVisible = !this.menuVisible
    },

    checkbox(id) {
      return document.getElementById(id)
    },

    updateCurrentFilters(filterID) {
      this.displayHelp = false

      if(filterID) {
        this.filters[filterID-1].on = this.checkbox(filterID).checked = !this.checkbox(filterID).checked
      }

      renderStart = 0
      renderEnd = 10

      this.updateSearchResults()
    },

    addHead() {
      this.renderedData = {sections:[]}

      if(this.filteredData.sections && this.filteredData.sections.length > 0) {
        for (let i=0; i<renderEnd; i++) {
          if(this.filteredData.sections[i]) {
            this.renderedData.sections.push(this.filteredData.sections[i])
          }
        }

        if(this.filteredData.sections.length > 0) {
          if(renderEnd+5 > this.filteredData.sections.length) {
            renderEnd = this.filteredData.sections.length
          } else {
            renderStart = renderEnd
            renderEnd += 5
          }
        }
      }

      this.$set(this, "renderedData", this.renderedData)
    },

    setTheme(theme) {
      let element = document.getElementById("vue-wrapper")
      element.className = theme

      if (theme === "dark") {
        element.className = ""
      }
    }
  }
})

// "launch" app and get data
app.updateCurrentFilters()

Vue.use(infiniteScroll)
