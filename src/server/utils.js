const fs = require("fs")
const AWS = require("aws-sdk")
const path = require('path')

AWS.config.loadFromPath("./config.json")

function saveFile(path, fileName, data, stringify) {
  return new Promise((resolve, reject) => {
    if(stringify) data = JSON.stringify(data, null, 2)
    fs.writeFile(`${path}/${fileName}`, data, function(err) {
      if(err) {
        console.error(`Failed to save ${fileName}!`, err)
        reject(err)
      }
      console.log(`File ${fileName} was saved successfully!`)
      resolve(`File ${fileName} was saved successfully!`)
    })
  })
}

function saveFileSync(path, fileName, data, stringify) {
  return new Promise((res, rej) => {
    try {
      if(stringify) data = JSON.stringify(data, null, 2)
      fs.writeFileSync(`${path}/${fileName}`, data)
      console.log(`File ${fileName} was saved successfully!`)
      res()
    } catch(e) {
      console.error("Failed to save file", fileName, e)
      rej()
    }
  })
}

function uploadToAWS(fileName, contentType) {
  console.log(`Uploading ${fileName} to AWS`)

  s3 = new AWS.S3({apiVersion: '2006-03-01'})

  let uploadParams = { 
    Bucket: "wf-drops-data.xinchronize.com", 
    Key: '', 
    Body: '',
    ContentType: contentType 
  }
  let file = `${fileName}`

  let fileStream = fs.createReadStream(file)

  fileStream.on('error', function(err) {
    console.log('File error', err)
  })

  uploadParams.Body = fileStream
  uploadParams.Key = path.basename(file)

  s3.upload(uploadParams, function (err, data) {
    if (err) {
      console.log("Error uploading", err)
    } if (data) {
      console.log("Upload success", data.Location)
    }
  })
}

exports.saveFile = saveFile
exports.saveFileSync = saveFileSync
exports.uploadToAWS = uploadToAWS