require("dotenv").config()

const utils = require("./utils")

function saveEverything(data) {
const dataSet = data.dom[1].children[1]

  saveGlossary(dataSet)
  saveMissionRewards(dataSet)
  saveRelicRewards(dataSet)
  saveKeyRewards(dataSet)
  saveTransientRewards(dataSet)
  saveSortiesRewards(dataSet)
  saveBountyRewards(dataSet)
  saveModsByMod(dataSet)
  saveModsByEnemy(dataSet)
  saveBlueprintsByBlueprint(dataSet)
  saveBlueprintsByEnemy(dataSet)
  saveMiscDrops(dataSet)
}

function saveGlossary(data) {
  let glossary = data.children[4]
  htmlListToJson(glossary, "glossary")
}

function saveMissionRewards(data) {
  let missionRewards = data.children[6]
  htmlTableToJson(missionRewards, "missionRewards")
}

function saveRelicRewards(data) {
  let relicRewards = data.children[8]
  htmlTableToJson(relicRewards, "relicRewards")
}

function saveKeyRewards(data) {
  let keyRewards = data.children[10]
  htmlTableToJson(keyRewards, "keyRewards")
}

function saveTransientRewards(data) {
  let transientRewards = data.children[12]
  htmlTableToJson(transientRewards, "transientRewards")
}

function saveSortiesRewards(data) {
  let sortiesRewards = data.children[14]
  htmlTableToJson(sortiesRewards, "sortiesRewards")
}

function saveBountyRewards(data) {
  let bountyRewards = data.children[16]
  htmlTableToJson(bountyRewards, "bountyRewards")
}

function saveModsByMod(data) {
  let modsByMod = data.children[18]
  htmlTableToJson(modsByMod, "modsByMod")
}

function saveModsByEnemy(data) {
  let modsByEnemy = data.children[20]
  htmlTableToJson(modsByEnemy, "modsByEnemy")
}

function saveBlueprintsByBlueprint(data) {
  let blueprintsByBlueprint = data.children[22]
  htmlTableToJson(blueprintsByBlueprint, "blueprintsByBlueprint")
}

function saveBlueprintsByEnemy(data) {
  let blueprintsByEnemy = data.children[24]
  htmlTableToJson(blueprintsByEnemy, "blueprintsByEnemy")
}

function saveMiscDrops(data) {
  let miscDrops = data.children[26]
  htmlTableToJson(miscDrops, "miscDrops")
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

  utils.saveFileSync(`${process.env.DATA_FOLDER}`, "glossary", data, true)
  .then(utils.uploadToAWS(`${process.env.DATA_FOLDER}/glossary`, "application/json"))
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


  let currentSection, currentSubSection, currentSubSubSection
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
        if(row.children[0].name === "th") {
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

        // check for blank cell (bounties)
        if(row.children[0].children) {
          // check if the item has 2 or 3 columns
          if(row.children.length === 2) {
            currentSubSection.items.push({
              name: row.children[0].children[0].data,
              droprate: row.children[1].children[0].data
            })
            currentSubSection = currentSection.subSections[currentSection.subSections.length-1]
          } else if(row.children.length === 3) {
            currentSubSection.items.push({
              name: row.children[0].children[0].data,
              itemchance: row.children[1].children[0].data,
              droprate: row.children[2].children[0].data
            })
          } else {
            console.error("Irregular number of columns in item")
          }
        } else {
          // bounties (blank first cell)

          // if current subSection doesn't have a subSubSection, make one
          if(!currentSubSection.subSubSections) {
            currentSubSection.subSubSections = []
            currentSubSubSection = null
          }
          
          if(row.children.length === 2) {
            // title
            currentSubSection.subSubSections.push({
              subSubSection: row.children[1].children[0].data,
              items: []
            })
            currentSubSubSection = currentSubSection.subSubSections[currentSubSection.subSubSections.length - 1]
          } else if(row.children.length === 3) {
            // item
            currentSubSubSection.items.push({
              name: row.children[1].children[0].data,
              droprate: row.children[2].children[0].data
            })
          } else {
            console.error("Bounty column error")
          }
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
        } else 
        if(row.children.length === 3) {
          if(row.children[0].children === undefined || row.children[0].children[0] === "") {
            currentSection.items.push({
              name: row.children[1].children[0].data,
              droprate: row.children[2].children[0].data,
            })
          } else {
            currentSection.items.push({
              name: row.children[0].children[0].data,
              itemchance: row.children[1].children[0].data,
              droprate: row.children[2].children[0].data
            })
          }
        } else {
          utils.saveFileSync(`${process.env.DATA_FOLDER}`, "what", row.children, true)
          console.error("Irregular number of columns in item")
        }
      }
    }
  })

  utils.saveFileSync(`${process.env.DATA_FOLDER}`, tableName, data, true)
  .then(utils.uploadToAWS(`${process.env.DATA_FOLDER}/${tableName}`, "application/json"))
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