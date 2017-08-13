let app = new Vue({
  el: '#vue-wrapper',
  data: {
    filters: [
      // { name: "glossary",
      //   id: 0 },
      { name: "missionRewards",
        label: "Mission Rewards",
        id: 1,
        on: false },
      { name: "relicRewards",
        label: "Relic Rewards",
        id: 2,
        on: false },
      { name: "keyRewards",
        label: "Key Rewards",
        id: 3,
        on: false },
      { name: "transientRewards",
        label: "Transient Rewards",
        id: 4,
        on: false },
      { name: "sortiesRewards",
        label: "Sorties Rewards",
        id: 5,
        on: false },
      { name: "modsByMod",
        label: "Mods by Mod",
        id: 6,
        on: false },
      { name: "modsByEnemy",
        label: "Mods by Enemy",
        id: 7,
        on: false },
      { name: "blueprintsByBlueprint",
        label: "Blueprints by Blueprint",
        id: 8,
        on: false },
      { name: "blueprintsByEnemy",
        label: "Blueprints by Enemy",
        id: 9,
        on: false }
    ],
    menuVisible: true,
    dropdata: {},
    filteredData: {},
    searchText: "",
    displayHelp: true
  },
  watch :{
    searchText: function (text) {
      this.search(text)
    }
  },
  methods: {
    getData(name) {
      // console.log("getting data", name)
      return new Promise((resolve, reject) => {
        if(name) {
          var xmlHttp = new XMLHttpRequest()
          xmlHttp.onreadystatechange = () => { 
            if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
              resolve(JSON.parse(xmlHttp.responseText))
            }
          }
          xmlHttp.open("GET", `http://wf-drops.xinchronize.com/data/${name}.json?=${new Date(new Date().getTime()).toLocaleString()}`, true) // true for asynchronous
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

      if(!this.filteredData.sections) {
        this.$set(this.filteredData, "sections", [])
      }
      if(!this.dropdata.sections) {
        this.$set(this.filteredData, "sections", this.dropdata)
      } else {
        this.$set(this.filteredData, "sections", this.searchSections(this.dropdata.sections, searchTerms))
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
      this.filters[filterID-1].on = this.checkbox(filterID).checked = !this.checkbox(filterID).checked

      this.updateSearchResults()
    },

    searchSections(sections, terms) {
      let sectionsToAdd = []

      if(!sections) return []

      sections.forEach((section) => {
        let tempSection = {}
        let addSection = true

        tempSection.section = JSON.parse(JSON.stringify(section.section))
        if(section.subSections) tempSection.subSections = JSON.parse(JSON.stringify(section.subSections))
        if(section.items) tempSection.items = JSON.parse(JSON.stringify(section.items))

        terms.forEach(searchTerm => {
          if(searchTerm.length >= 3) {
            if(!section.section.toLowerCase().includes(searchTerm.toLowerCase())) {
              addSection = false
            }
          }
        })

        if(addSection) {
          sectionsToAdd.push(tempSection)
        } else if(section.subSections) {
          tempSection.subSections = this.searchSubsections(section.subSections, terms)
          if(tempSection.subSections.length > 0) sectionsToAdd.push(tempSection)
        } else if(section.items) {
          tempSection.items = this.searchItems(section.items, terms)
          if(tempSection.items.length > 0) sectionsToAdd.push(tempSection)
        } else {
          // do nothing
        }
      })

      return sectionsToAdd
    },

    searchSubsections(subSections, terms) {
      let subSectionsToAdd = []

      subSections.forEach(subSection => {
        let addSubSection = true

        terms.forEach(searchTerm => {
          if(searchTerm.length >= 3) {
            if(!subSection.subSection.toLowerCase().includes(searchTerm.toLowerCase())) {
              addSubSection = false
            }
          }
        })

        if(addSubSection) {
          subSectionsToAdd.push(subSection)
        } else {
          let items = this.searchItems(subSection.items, terms)

          if(items.length > 0) {
            subSection.items = items
            subSectionsToAdd.push(subSection)
          }
        }
      })

      return subSectionsToAdd
    },

    searchItems(items, terms) {
      let itemsToAdd = []

      items.forEach(item => {
        let addItem = true

        terms.forEach(searchTerm => {
          if(searchTerm.length >= 3) {
            if(!item.name.toLowerCase().includes(searchTerm.toLowerCase())) {
              addItem = false
            }
          }
        })

        if(addItem) {
          itemsToAdd.push(item)
        }
      })

      return itemsToAdd
    }
  }
})
