var fs = require('fs')

let rawScrape = require("./raw-scrape.json")

// saveFile("stored-data.json", JSON.stringify(rawScrape, null, 2))
loadFullFile()

function saveFile(fileName, data, stringify) {
  if(stringify) data = JSON.stringify(data, null, 2)
  fs.writeFile(`${fileName}.json`, data, function(err) {
    if(err) {
      console.log(`File to save ${fileName}!`)
      return console.log(err)
    }

    console.log(`File ${fileName} was saved successfully!`)
  })
}

function saveFileSync(fileName, data, stringify) {
  if(stringify) data = JSON.stringify(data, null, 2)
  fs.writeFileSync(`${fileName}.json`, data)
  console.log(`File ${fileName} was saved successfully!`)
}


function loadFullFile() {
  let data = require("./stored-data.json")
  let dom = data.dom
  let html = dom[2]
  let body = html.children[1]
  let glossary = body.children[4]
  // htmlListToJson(glossary, "glossary")
  let missionRewards = body.children[6]
  // htmlTableToJson(missionRewards, "missionRewards")
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
    console.log(child.children[0].attribs.href)
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

  let titleToggle = false

  let currentSection, currentSubSection
  table.children.forEach((row, index) => {
    // console.log(row.children[0])
    if(row.children[0].attribs) {
      if(parseInt(row.children[0].attribs.colspan) === 2
          && !row.children[0].attribs.class) {
        // title(section) or subtitle(subsection) (1 column)
        if(titleToggle) {
          //new subsection
          currentSection.subSections.push({
            subSection: row.children[0].children[0].data,
            items: []
          })

          // set current subsection to last in list
          currentSubSection = currentSection.subSections[currentSection.subSections.length-1]
          titleToggle = false
        } else {
          //new section
          data.sections.push({
            section: row.children[0].children[0].data,
            subSections: []
          })

          // set current section to last in list
          currentSection = data.sections[data.sections.length-1]
          titleToggle = true
        }
      }
    } else {
      // item (2 columns)
      // [0] is name
      // [1] is drop rate
      currentSubSection.items.push({
        name: row.children[0].children[0].data,
        droprate: row.children[1].children[0].data
      })
    }
  })

  saveFileSync("missionRewards", data, true)
}