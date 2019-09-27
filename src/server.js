
const apiKey = process.env.API_KEY
const scheduleName = process.env.SCHEDULE_NAME
const timezone = process.env.TZ

const oak = require('oak')
const { join } = require('path')
const _ = require('lodash')

oak.catchErrors()

const express = require('express')
const stylus = require('stylus')
const app = express()

const port = process.env.PORT ? _.toNumber(process.env.PORT) : 9000
process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = true
let publicPath = join(__dirname, 'public')
let viewsPath = join(__dirname, 'views')

app.set('views', viewsPath)
app.set('view engine', 'pug')
app.use(stylus.middleware({
  src: viewsPath,
  dest: publicPath
}))
app.use(express.static(publicPath))

app.listen(port, function () {
  oak.on('ready', () => loadWindow())
})

app.get('/', function (req, res) {
  res.render('index')
})
app.get('/env', function (req, res) {
  res.json({ apiKey, scheduleName, timezone })
})
function loadWindow () {
  oak.load({
    url: `http://localhost:${port}/`,
    ontop: false,
    flags: ['enable-vp8-alpha-playback'],
    sslExceptions: ['localhost'],
    background: '#ffffff'
  })
}
