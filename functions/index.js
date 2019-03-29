const functions = require('firebase-functions')
const admin = require('firebase-admin')
admin.initializeApp()
var ical2json = require('ical2json')
var ICAL = require('ical')
var request = require('request')
const cors = require('cors')({
  origin: true
})

function parseIcal (data) {
  console.log('###########################', new Date(), '###########################')
  let type = 'apple/office'
  if (data.indexOf('Google') > -1) {
    type = 'google'
  }
  var jcalData = ICAL.parseICS(data)
  var events = []
  for (var i in jcalData) {
    let event = {}
    if (jcalData[i].type.toLowerCase() === 'vevent') {
      if (type !== 'google') {
        events.push({
          type: type,
          start: jcalData[i].start.toLocaleString('en-US', { timeZone: 'UTC' }),
          end: jcalData[i].end.toLocaleString('en-US', { timeZone: 'UTC' }),
          summary: jcalData[i].summary || '',
          description: jcalData[i].description || ''
        })
      } else {
        events.push({
          type: type,
          start: jcalData[i].start.toISOString(),
          end: jcalData[i].end.toISOString(),
          summary: jcalData[i].summary || '',
          description: jcalData[i].description || ''
        })
      }
    }
  }
  return events
}

exports.convertIcs2Json = functions.https.onRequest((request, response) => {
  console.log('Request: ', request.body.ics)
  var jsonData = ICAL.parseICS(request.body.ics)
  response.json(jsonData)
  // response.send("Hello from convertIcs2Json!");
})

exports.getIcsContentsFromUrl = functions.https.onRequest((req, res) => {
  console.log('Request: ', req.body)
  var body = req.body
  cors(req, res, () => {
    request({
      method: 'GET',
      uri: body.url
    }).pipe(res)
  })
})

exports.addCalendarSubscriptionForUser = functions.https.onRequest((req, res) => {
  cors(req, res, () => {
    console.log('Request: ', req.body)
    var kbody = req.body
    let setData = {
      url: kbody.calendarUrl,
      name: kbody.name,
      user: kbody.user
    }
    console.log('setData: ', setData)
    admin.firestore().collection('subscriptions').doc(kbody.user).collection('schedules').doc(kbody.name).set(setData).then(function () {
      res.send('Subscription Written: ')
      let events = []
      request({
        method: 'GET',
        uri: kbody.calendarUrl,
        followAllRedirects: true
      }, function (error, response, body) {
        if (error) {
          return console.error('upload failed:', error)
        }
        let eventsParsed = parseIcal(body)
        kbody.events = eventsParsed
        console.log('Upload successful!  Server responded with:', kbody)
        admin.firestore().collection('users').doc(kbody.user).collection('schedules').doc(kbody.name).set(kbody)
      })
    })
  })
})

function updateSubscription (subscription) {
  return new Promise((resolve, reject) => {
    request({
      method: 'GET',
      uri: subscription.url + '?time=' + Date.now(),
      followAllRedirects: true
    }, function (error, response, body) {
      if (error) {
        console.error('request failed:', error)
        return reject(error)
      }
      let eventsParsed = parseIcal(body)
      console.log('Parse successful!', eventsParsed)
      admin.firestore().collection('users').doc(subscription.user).collection('schedules').doc(subscription.name).update({
        events: eventsParsed
      }).then(
        function () {
          console.log('Updated: ', subscription.name)
          resolve()
        },
        function (err) {
          reject(err)
        }
      )
    })
  })
}

exports.updateUserScheduleSubscriptions = functions.https.onRequest((req, res) => {
  cors(req, res, async function () {
    const subscriptions = await admin.firestore().collection('subscriptions').get()

    const subscriptionsArray = []
    for (const user in subscriptions.docs) {
      const schedules = await subscriptions.docs[user].ref.collection('schedules').get()
      for (const schedule in schedules.docs) {
        const data = await schedules.docs[schedule].data()
        subscriptionsArray.push(data)
      }
    }

    for (var subscription in subscriptionsArray) {
      await updateSubscription(subscriptionsArray[subscription])
    }
    console.log('done with everything')
    res.status(200).send(subscriptionsArray)
  })
})
