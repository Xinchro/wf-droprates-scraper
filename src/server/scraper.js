const utils = require("./utils")

function saveEverything(data) {
  saveGlossary(data)
  saveMissionRewards(data)
  saveRelicRewards(data)
  saveKeyRewards(data)
  saveTransientRewards(data)
  saveSortiesRewards(data)
  saveModsByMod(data)
  saveModsByEnemy(data)
  saveBlueprintsByBlueprint(data)
  saveBlueprintsByEnemy(data)
}

function saveGlossary(data) {
  let glossary = data.dom[2].children[1].children[4]
  htmlListToJson(glossary, "glossary")
}

function saveMissionRewards(data) {
  let missionRewards = data.dom[2].children[1].children[6]
  htmlTableToJson(missionRewards, "missionRewards")
}

function saveRelicRewards(data) {
  let relicRewards = data.dom[2].children[1].children[8]
  htmlTableToJson(relicRewards, "relicRewards")
}

function saveKeyRewards(data) {
  let keyRewards = data.dom[2].children[1].children[10]
  htmlTableToJson(keyRewards, "keyRewards")
}

function saveTransientRewards(data) {
  let transientRewards = data.dom[2].children[1].children[12]
  htmlTableToJson(transientRewards, "transientRewards")
}

function saveSortiesRewards(data) {
  let sortiesRewards = data.dom[2].children[1].children[14]
  htmlTableToJson(sortiesRewards, "sortiesRewards")
}

function saveModsByMod(data) {
  let modsByMod = data.dom[2].children[1].children[16]
  htmlTableToJson(modsByMod, "modsByMod")
}

function saveModsByEnemy(data) {
  let modsByEnemy = data.dom[2].children[1].children[18]
  htmlTableToJson(modsByEnemy, "modsByEnemy")
}

function saveBlueprintsByBlueprint(data) {
  let blueprintsByBlueprint = data.dom[2].children[1].children[20]
  htmlTableToJson(blueprintsByBlueprint, "blueprintsByBlueprint")
}

function saveBlueprintsByEnemy(data) {
  let blueprintsByEnemy = data.dom[2].children[1].children[22]
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

  utils.saveFileSync("./data", "glossary", data, true)
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

  utils.saveFileSync("./data", tableName, data, true)
}

exports.saveEverything = saveEverything
exports.saveGlossary = saveGlossary
exports.saveMissionRewards = saveMissionRewards
exports.saveRelicRewards = saveRelicRewards
exports.saveKeyRewards = saveKeyRewards
exports.saveTransientRewards = saveTransientRewards
exports.saveSortiesRewards = saveSortiesRewards
exports.saveModsByMod = saveModsByMod
exports.saveModsByEnemy = saveModsByEnemy
exports.saveBlueprintsByBlueprint = saveBlueprintsByBlueprint
exports.saveBlueprintsByEnemy = saveBlueprintsByEnemy