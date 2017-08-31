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
    menuVisible: false,
    dropdata: {},
    filteredData: {},
    renderedData: {},
    searchText: "",
    displayHelp: true,
    busy: false,
    titleDrops: {},
    showTitleDrops: false,
  },
  watch :{
    searchText: function (text) {
      this.search(text)
    }
  },
  methods: {
    start() {
      this.loadParams()
      app.updateCurrentFilters()
    },

    getData(name) {
      return new Promise((resolve, reject) => {
        if(name) {
          var xmlHttp = new XMLHttpRequest()
          xmlHttp.onreadystatechange = () => { 
            if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
              resolve(JSON.parse(xmlHttp.responseText))
            }
          }
          xmlHttp.open("GET", `https://wf-drops-data.xinchronize.com/${name}.json?=${new Date(new Date().getTime()).toLocaleString()}`, true) // true for asynchronous
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

      this.setQueryParam("q", this.searchText)
    },

    updateData(newData) {
      this.$set(this, "dropdata", newData)
      this.search(this.searchText)
    },

    toggleMenu() {
      this.menuVisible = !this.menuVisible
    },

    checkbox(id) {
      return document.getElementById(id)
    },

    updateCurrentFilters(filterID) {
      if(filterID) {
        this.filters[filterID-1].on = this.checkbox(filterID).checked = !this.checkbox(filterID).checked
      }

      renderStart = 0
      renderEnd = 10

      this.updateSearchResults()

      let filterString = ""
      this.filters.forEach(filter=>{
        if(filter.on) filterString += `${filter.id},`
      })
      filterString = filterString.slice(0,-1)
      this.setQueryParam("filters", filterString)
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
    },

    titleSearch(data) {
      let relicRanks = ["(Intact)","(Exceptional)","(Flawless)","(Radiant)"]

      relicRanks.forEach(rank => {
        if(data.toLowerCase().includes(rank.toLowerCase())) {
          data = data.replace(rank, "").toLowerCase()
        }
      })

      if(data != "Nothing related") {
        this.searchText = data
      } else {
        // TODO display error
      }
    },

    resetPopup(data) {
      let element = this.getScrollerElement(data)

      element.className += " invisible"
    },

    getScrollerElement(data) {
      return document.getElementById(`${data}-title-drop-scroller`)
    },

    togglePopup(data) {
      let element = this.getScrollerElement(data)
      if(element.className.includes("invisible")) {
        this.updatePopup(data)
      } else {
        this.resetPopup(data)
      }
    },

    updatePopup(data) {
      let relicRanks = ["(Intact)","(Exceptional)","(Flawless)","(Radiant)"]
      let includingTitles = []
      
      let element = this.getScrollerElement(data)

      let title = data.replace("", "").toLowerCase()

      this.$set(this.titleDrops, "data", "")

      relicRanks.forEach(rank => {
        if(data.toLowerCase().includes(rank.toLowerCase())) {
          data = data.replace(rank, "").toLowerCase()
        }
      })

      data = data.split(" ")

      // new thread for search
      sectionSearchWorker.postMessage([this.dropdata.sections, data])

      // render data when search thread is complete
      sectionSearchWorker.onmessage = (e) => {
        e.data.forEach(section => {
          if(!section.section.toLowerCase().includes(title.toLowerCase())) {
            includingTitles.push(section.section)
          }
        })

        if(includingTitles.length>0) {
          this.$set(this.titleDrops, "data", includingTitles)
        } else {
          this.$set(this.titleDrops, "data", ["Nothing related"])
        }

        setTimeout(()=>{
          element.className = element.className.replace(/ invisible/g, "")
          if(includingTitles.length>0) {
            element.children[1].children[0].style.animationDuration = `${element.offsetWidth/10}s` // picking titles in titles-wrapper
          } else {
            element.children[1].children[0].style.animationDuration = "0s"
          }
        },10)
      }
    },

    getQueryParams() {
      let queries = ""
      let queryParams = []

      queries = window.location.search.split("?")[1] // remove question mark

      if(queries) {
        queries = queries.split("&") // split each query up

        queries.forEach(query => {
          // let ob = {}
          let ob = {
            "key": query.split("=")[0],
            "value": query.split("=")[1]
          } //construct object


          // check if value is an array
          if(query.split("=")[1].includes(",")) {
            let array = ob.value.split(",") // split array at comma

            array.forEach((num, i) => {
              array[i] = parseInt(num)
            })
            ob.value = array// set value as array
          }

          queryParams.push(ob) // push query object to array
        })
      }

      return queryParams
    },

    setQueryParam(key, value) {
      let queryStr = "/?" // set up query string

      let params = this.getQueryParams() // get current params

      let paramExists = false

      // loop through params and check for matches
      params.forEach(query => {
        if(key === query.key) {
          // if param to change is already in url bar, change it
          query.value = value
          // make sure we know it's been changed
          paramExists = true
        }
      })

      // if nothing matched in url, add to url
      if(!paramExists) {
        params.push({
          "key": key,
          "value": value
        })
      }

      // look throught the param array with new values and add to the query string
      params.forEach((param, index) => {
        index > 0 ? queryStr += "&" : "" // only prepend ampersand after first instance
        queryStr += `${param.key}=${param.value}`
      })

      // add to history/url
      if (history.pushState) {
        let state = {}
        let title = ""
        let path  = `${queryStr}`

        history.pushState(state, title, path);
      }
    },

    loadParams() {
      let params = this.getQueryParams() //get params

      // loop through params and assign variables their values
      params.forEach(param => {
        switch(param.key) {
          case "q":
            this.searchText = param.value
            break
          case "filters":
            this.filters.forEach(filter => {
              filter.on = false
            })
            // make sure filters value is object(array)
            if(typeof(param.value) === 'object') {
              param.value.forEach(filterID => {
                // js is stupid and thinks NaN is a number, so check for that
                if(typeof(filterID) === 'number' && !isNaN(filterID)) {
                  this.filters[filterID-1].on = true
                }
              })
            }
            break
          default:
            console.log(`${param.key} is not a valid param`)
            break
        }
      })

    }
  }
})

// launch app
app.start()

Vue.use(infiniteScroll)
