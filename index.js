const rimraf = require("rimraf")
const fetcher = require("./src/server/fetcher.js")
const scraper = require("./src/server/scraper.js")

clearData()
.then(fetcher.fetch)
.then(scrape)

function scrape() {
  let data = require("./data/stored-data.json")
  scraper.saveEverything(data)

  return new Promise((resolve, reject) => {
    resolve()
  })
}

function clearData() {
  return new Promise((resolve, reject) => {
    rimraf("./data/*", () => { 
      console.log("Data folder cleared")
      resolve()
    })
  })
}