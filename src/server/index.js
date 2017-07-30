require('dotenv').config()

const fetch = require('node-fetch');
const request = require("request")
const htmlparser = require("htmlparser")
const jsonfile = require('jsonfile')

let getWarframeHTML = (url) => {
  console.log("Getting data...")
  return fetch(url)
  .then(function(res) {
    return res.text()
  }).then(function(body) {
    return body
  })
}

let htmlToJson = (body) => {
  let rawHtml = body
  let handler = new htmlparser.DefaultHandler(function (error, dom) {
    if (error)
      console.log('Error while parsing html', error)
    else
      return dom
  })
  let parser = new htmlparser.Parser(handler)
  parser.parseComplete(rawHtml)

  return new Promise((resolve, reject) => {
    resolve(handler)
  })
}

let saveToJson = (json) => {
  let file = './data/raw-scrape.json'
  let obj = json
   
  jsonfile.writeFile(file, obj, function (err) {
    console.error(err)
  })
}

getWarframeHTML(process.env.DATA_URL)
.then(htmlToJson)
.then(saveToJson)
