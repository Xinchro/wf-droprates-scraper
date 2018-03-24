require("dotenv").config()

const rimraf = require("rimraf")
const fs = require('fs')
const fetcher = require("./src/server/fetcher.js")
const scraper = require("./src/server/scraper.js")
const generator = require("./src/server/generateHTML.js")

function scrape() {
  let data = require(`${process.env.DATA_FOLDER}/stored-data.json`)
  scraper.saveEverything(data)

  return new Promise((resolve, reject) => {
    resolve(data)
  })
}

function clearData() {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(process.env.DATA_FOLDER)){
      rimraf(`${process.env.DATA_FOLDER}/*`, () => {
        console.log("Data folder cleared")
        resolve()
      })
    } else {
      try {
        fs.mkdirSync(process.env.DATA_FOLDER)
        console.log("Data folder created")
      } catch(e) {
        console.error(`Failed top make ${process.env.DATA_FOLDER} folder`)
      }
      resolve()
    }
  })

}
function generateHTML() {
  return new Promise((resolve, reject) => {
    resolve(generator.generateHTML())
  })
}

exports.awsHandler = function() {
  clearData()
    .then(fetcher.fetchData)
    .then(scrape)
    .then(generateHTML)
    .catch((err) => {
      console.error("Error in handler -", err)
      throw err
    })
}

exports.doScrape = function() {
  scrape()
}

exports.doGenerateHTML = function() {
  generateHTML()
}
