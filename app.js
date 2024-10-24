const express = require('express')
const app = express()
const port = 3000

app.get('/', (req, res, next) => {
  res.send('success')
})

app.listen(port, () => {
  console.log(`express server running on http://localhost:${port}`)
})
