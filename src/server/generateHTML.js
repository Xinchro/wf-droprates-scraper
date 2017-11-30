const fs = require("fs")
const htmltidy = require("htmltidy").tidy
const templateURI = "./src/server/templates/base.html"
const liTemplateURI = "./src/server/templates/li.html"

exports.generateHTML = function() {
  let completeHTML = "<html><body>ya dun goofed</body></html>"

  // generate the JSON listing HTML file
  getTemplate(templateURI)
  .then(fillTemplate, globalReject)
  .then(exportHTML, globalReject)
  .then(console.log, globalReject)
}
  
function getFileNames() {
  // get the file names in directory
  return new Promise((resolve, reject)=> {
    fs.readdir("./tmp", function(err, items) {
      if(err) {
        console.error("Failed to list JSON directory")
        reject("Failed to list JSON directory")
      }

      resolve(items)
    })
  })
}

function getTemplate(uri) {
  // get an html template
  return new Promise((resolve, reject) => {
    fs.readFile(uri, function (err, template) {
      if(err) {
        console.error("Failed to read template")
        reject("Failed to read template")
      }

      resolve(template.toString())
    })
  })
}

function fillTemplate(template) {
  // get the file names of all generated files
  return getFileNames()
  .then((list) => {
    // fill template variables
    return new Promise((resolve, reject) => {
      try {
        getTemplate(liTemplateURI, globalReject)
        .then((liTemplate) => {
          // replace all the template variables
          let rendered = template
          .replace('#list#', () => {
            let li = ""

            // loop through filename list
            list.map((name) => {
              switch(name.toLowerCase().replace(".json", "")) {
                // names to ignore
                case (name.match(/\.html/) || {}).input:
                case "glossary":
                case "stored-data":
                  break
                default:
                  // add to rendered list
                  li += liTemplate
                  .replace(/#url#/g,`/${name}`)
                  .replace(/#name#/g,`${name.replace(".json", "")}`)
              }
            })

            return li
          })
          .replace('#lastgen#', getCurrentDate())

          return rendered
        }, globalReject).then((rendered) => resolve(rendered))
      } catch(err) {
        console.error(err)
        reject("Failed to fill template")
      }
    })
  })
}

function getCurrentDate() {
  let localDate = new Date()

  // current time in UTC, returned as ISO
  let date = new Date(Date.UTC(
    localDate.getUTCFullYear(),//year
    localDate.getUTCMonth(),//month
    localDate.getUTCDate(),//day
    localDate.getUTCHours(),//hour
    localDate.getUTCMinutes(),//minute
    localDate.getUTCSeconds(),//second
    localDate.getUTCMilliseconds()//millisecond
  )).toISOString()

  return date
}

function exportHTML(html) {
  // export generated HTML file
  return new Promise((resolve, reject) => {
    tidy(html)
    .then((tidyHTML) => {
      fs.writeFile("./tmp/index.html", tidyHTML, function(err) {
        if(err) {
          console.log("Failed to generate and save JSON listing!")
          reject(err)
        }
        resolve("JSON listing generated.")
      })
    })
  })
}

function globalReject(message) {
  console.error(message)
}

function tidy(html) {
  // tidy and indent HTML
  return new Promise((resolve, reject) => {
    htmltidy(html, 
      {
        doctype: 'html5',
        hideComments: false,
        indent: true,
        dropEmptyElements: false
      }, (err, html) => resolve(html))
  })
}