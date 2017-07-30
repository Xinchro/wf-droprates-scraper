let fs = require('fs')
let rawScrape = require("./data/raw-scrape.json")
const data = require("./data/stored-data.json")
const body = data.dom[2].children[1]

saveFileSync("stored-data", JSON.stringify(rawScrape, null, 2))
saveEverything()

function saveFile(fileName, data, stringify) {
  if(stringify) data = JSON.stringify(data, null, 2)
  fs.writeFile(`./data/${fileName}.json`, data, function(err) {
    if(err) {
      console.log(`File to save ${fileName}!`)
      return console.log(err)
    }
    console.log(`File ${fileName} was saved successfully!`)
  })
}

function saveFileSync(fileName, data, stringify) {
  if(stringify) data = JSON.stringify(data, null, 2)
  fs.writeFileSync(`./data/${fileName}.json`, data)
  console.log(`File ${fileName} was saved successfully!`)
}


function saveEverything() {
  saveGlossary()
  saveMissionRewards()
  saveRelicRewards()
  saveKeyRewards()
  saveTransientRewards()
  saveSortiesRewards()
  saveModsByMod()
  saveModsByEnemy()
  saveBlueprintsByBlueprint()
  saveBlueprintsByEnemy()
}

function saveGlossary(){
  let glossary = body.children[4]
  htmlListToJson(glossary, "glossary")
}

function saveMissionRewards(){
  let missionRewards = body.children[6]
  htmlTableToJson(missionRewards, "missionRewards")
}

function saveRelicRewards(){
  let relicRewards = body.children[8]
  htmlTableToJson(relicRewards, "relicRewards")
}

function saveKeyRewards(){
  let keyRewards = body.children[10]
  htmlTableToJson(keyRewards, "keyRewards")
}

function saveTransientRewards() {
  let transientRewards = body.children[12]
  htmlTableToJson(transientRewards, "transientRewards")
}

function saveSortiesRewards() {
  let sortiesRewards = body.children[14]
  htmlTableToJson(sortiesRewards, "sortiesRewards")
}

function saveModsByMod() {
  let modsByMod = body.children[16]
  htmlTableToJson(modsByMod, "modsByMod")
}

function saveModsByEnemy() {
  let modsByEnemy = body.children[18]
  htmlTableToJson(modsByEnemy, "modsByEnemy")
}

function saveBlueprintsByBlueprint() {
  let blueprintsByBlueprint = body.children[20]
  htmlTableToJson(blueprintsByBlueprint, "blueprintsByBlueprint")
}

function saveBlueprintsByEnemy() {
  let blueprintsByEnemy = body.children[22]
  htmlTableToJson(blueprintsByEnemy, "blueprintsByEnemy")
}

function htmlListToJson(list, listName) {
  if(list.name != "ul") {
    return console.log("Error reading list to convert")
  }
  if(!listName) {
    return console.log("Error - no filename to save to")
  }

  let data = { glossaryList: [] }

  list.children.forEach((child) => {
    data.glossaryList.push({
      type: child.raw,
      href: child.children[0].attribs.href,
      text: child.children[0].children[0].data
    })
  })

  saveFileSync("glossary", data, true)
}

function htmlTableToJson(table, tableName) {
  if(table.name != "table") {
    return console.log("Error reading table to convert")
  }
  if(!tableName) {
    return console.log("Error - no filename to save to")
  }

  let data = { sections: [] }

  let title = true

  let currentSection, currentSubSection
  table.children.forEach((row, index) => {
    if(row.children[0].attribs) {
      if(row.children[0].attribs.class === "blank-row") {
        title = true
        return 
      }
    }
    if(row.children[0].name === "th") {
      // title(section) or subtitle(subsection) (1 column)
      if(title) {
        if(row.children.length === 1) {
          //new section
          data.sections.push({
            section: row.children[0].children[0].data,
            subSections: []
          })
        } else if(row.children.length === 2) {
           //new section with secondary title
          data.sections.push({
            section: row.children[0].children[0].data,
            secondaryTitle: row.children[1].children[0].data,
            subSections: []
          })
        }

        // set current section to last in list
        currentSection = data.sections[data.sections.length-1]
        currentSubSection = null
        title = false
      } else {
        if(row.children[0] < 2) {
          //new subsection
          currentSection.subSections.push({
            subSection: row.children[0].children[0].data,
            items: []
          })
        } else {
          //new subsection without title
          currentSection.subSections.push({
            items: []
          })
        }

        // set current subsection to last in list
        currentSubSection = currentSection.subSections[currentSection.subSections.length-1]
      }
    } else {
      // item (2 columns)
      // [0] is name
      // [1] is drop rate

      // checks if this is a subsection style table
      if(currentSubSection) {
        // subsection

        // check if the item has 2 or 3 columns
         if(row.children.length === 2) {
           currentSubSection.items.push({
             name: row.children[0].children[0].data,
             droprate: row.children[1].children[0].data
           })
         } else if(row.children.length === 3) {
           currentSubSection.items.push({
             name: row.children[0].children[0].data,
             itemchance: row.children[1].children[0].data,
             specificchance: row.children[2].children[0].data
           })
         } else {
           console.error("Irregular number of columns in item")
         }
      } else {
        // section

        // if there is no items array, creates items array in topmost section and removes the subsection element
        if(!currentSection.items) {
          currentSection.items = []
          delete currentSection.subSections
        }

        // check if the item has 2 or 3 columns
        if(row.children.length === 2) {
          currentSection.items.push({
            name: row.children[0].children[0].data,
            droprate: row.children[1].children[0].data
          })
        } else if(row.children.length === 3) {
          if(row.children[0].children === undefined || row.children[0].children[0] === "") {
            currentSection.items.push({
              name: row.children[1].children[0].data,
              droprate: row.children[2].children[0].data,
            })
          } else {
            currentSection.items.push({
              name: row.children[0].children[0].data,
              itemchance: row.children[1].children[0].data,
              specificchance: row.children[2].children[0].data
            })
          }
        } else {
          console.error("Irregular number of columns in item")
        }
      }
    }
  })

  saveFileSync(tableName, data, true)
}