const fs = require('fs')
const path = require('path')

function localFileHandler (file) {
  return new Promise((resolve, reject) => {
    if (!file) return resolve(null)

    const originalName = file.originalname
    const originPath = file.path
    const newPath = `upload/${originalName}`

    return fs.promises.readFile(path.resolve(__dirname, '..', originPath))
      .then(data => fs.promises.writeFile(path.resolve(__dirname, '..', newPath), data))
      .then(() => resolve(newPath))
      .catch(err => reject(err))
  })
}

module.exports = {
  localFileHandler
}
