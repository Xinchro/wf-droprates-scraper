const fs = require("fs")
const AWS = require("aws-sdk")

AWS.config.loadFromPath("./config.json")

function saveFile(path, fileName, data, stringify) {
  if(stringify) data = JSON.stringify(data, null, 2)
  fs.writeFile(`${path}/${fileName}.json`, data, function(err) {
    if(err) {
      console.log(`Failed to save ${fileName}!`)
      return console.log(err)
    }
    console.log(`File ${fileName} was saved successfully!`)
  })
}

function saveFileSync(path, fileName, data, stringify) {
  return new Promise((res, rej) => {
    try {
      if(stringify) data = JSON.stringify(data, null, 2)
      fs.writeFileSync(`${path}/${fileName}.json`, data)
      console.log(`File ${fileName} was saved successfully!`)
      res()
    } catch(e) {
      console.error("Failed to save file", fileName)
      rej()
    }
  })
}

function uploadToAWS(fileName) {
  console.log(`Uploading ${fileName} to AWS`)

  // Create S3 service object
  s3 = new AWS.S3({apiVersion: '2006-03-01'})

  // call S3 to retrieve upload file to specified bucket
  let uploadParams = { Bucket: "wf-drops-data.xinchronize.com", Key: '', Body: '' }
  let file = `${fileName}.json`

  let fileStream = fs.createReadStream(file)
  fileStream.on('error', function(err) {
    console.log('File Error', err)
  })
  uploadParams.Body = fileStream

  let path = require('path')
  uploadParams.Key = path.basename(file)

  // call S3 to retrieve upload file to specified bucket
  s3.upload(uploadParams, function (err, data) {
    if (err) {
      console.log("Error", err)
    } if (data) {
      console.log("Upload Success", data.Location)
    }
  })
}

exports.saveFile = saveFile
exports.saveFileSync = saveFileSync
exports.uploadToAWS = uploadToAWS