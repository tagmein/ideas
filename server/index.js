const dotenv = require('dotenv')
const express = require('express')
const fs = require('fs')
const path = require('path')
const sqlite3 = require('sqlite3')
const { open } = require('sqlite')

dotenv.config()
const port = process.env.PORT
const app = express()

const contentTypes = {
 html: 'text/html',
 ico: 'image/x-icon',
 js: 'application/javascript',
 map: 'text/plain',
}

Object.entries({
 'favicon.ico': '/favicon.ico',
 'ideas-logo.png': '/ideas-logo.png',
 'index.html': '/',
}).map(function ([file, url]) {
 const extension = file.split('.').pop()
 const fileContents = fs.readFileSync(file)
 app.get(url, function (req, res) {
  res.status(200)
  res.set({
   'Content-Length': fileContents.length,
   'Content-Type': contentTypes[extension],
  })
  res.end(fileContents)
 })
})

app.use('/client', express.static(path.join(__dirname, '..', 'client-dist')))
app.use('/client', express.static(path.join(__dirname, '..', 'client')))

app.use(express.json())

app.post('/data', async function (req, res, next) {
 try {
  const db = await open({
   filename: path.join(__dirname, '..', 'data', 'example-user.db'),
   driver: sqlite3.cached.Database,
  })
  console.log(JSON.stringify({ q: req.body.query, p: req.body.params }))
  const result = await db.all(req.body.query, ...(req.body.params ?? []))
  const response_data = JSON.stringify(result)
  res.status(200)
  res.set({
   'Content-Length': response_data.length,
   'Content-Type': 'application/json',
  })
  res.end(response_data)
 } catch (err) {
  next(err)
 }
})

app.use(function (err, _, res, next) {
 console.error(err)
 if (res.headersSent) {
  return next(err)
 }
 res.status(500)
 res.set({ 'Content-Type': 'application/json' })
 res.end(JSON.stringify({ error: true }))
})

app.listen(port, function () {
 console.log(`[server]: Server is running at http://localhost:${port}`)
})
