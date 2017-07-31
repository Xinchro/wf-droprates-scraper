const fs = require("fs")

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
  if(stringify) data = JSON.stringify(data, null, 2)
  fs.writeFileSync(`${path}/${fileName}.json`, data)
  console.log(`File ${fileName} was saved successfully!`)
}

exports.saveFile = saveFile
exports.saveFileSync = saveFileSync