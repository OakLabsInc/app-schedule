const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();
var ical2json = require("ical2json");
var ICAL = require('ical')
var request = require("request");
const cors = require('cors')({
  origin: true,
});

function parseIcal(data) {
  var jcalData = ICAL.parseICS(data);
  var events = []
  for(var i in jcalData){
    let event = {}
    if(jcalData[i].type.toLowerCase() === 'vevent') {
      events.push({
        start: jcalData[i].start.toISOString(),
        end: jcalData[i].end.toISOString(),
        summary: jcalData[i].summary || '',
        description: jcalData[i].description ||''
    })
    }
  }
  return events
}

exports.convertIcs2Json = functions.https.onRequest((request, response) => {
  console.log("Request: ", request.body.ics)
  var jsonData = ical2json.convert(request.body.ics);
  response.json(jsonData);
  //response.send("Hello from convertIcs2Json!");
});

exports.getIcsContentsFromUrl = functions.https.onRequest((req, res) => {
  console.log("Request: ", req.body)
  var body = req.body
  cors(req, res, () => {
    request({
      method: 'GET',
      uri: body.url
    }).pipe(res)
  });
});

exports.addCalendarSubscriptionForUser = functions.https.onRequest((req, res) => {
  cors(req, res, () => {
    console.log("Request: ", req.body)
    var kbody = req.body
    let setData = {
      url: kbody.calendarUrl,
      name: kbody.name,
      user: kbody.user
    }
    console.log("setData: ", setData)
    admin.firestore().collection('subscriptions').doc(kbody.user).set(setData).then( function () {
      res.send("Subscription Written: ")
        let events = []
        request({
          method: 'GET',
          uri: kbody.calendarUrl,
          followAllRedirects: true
        }, function (error, response, body) {
          if (error) {
            return console.error('upload failed:', error);
          }
          let eventsParsed = parseIcal(body)
          kbody.events = eventsParsed
          console.log('Upload successful!  Server responded with:',kbody);
          admin.firestore().collection('users').doc(kbody.user).collection('schedules').doc(kbody.name).set(kbody)
        })
    })
  });
});

exports.updateUserScheduleSubscriptions = functions.https.onRequest((req, res) => {
  cors(req, res, () => {
    let subscriptions = []
    admin.firestore().collection('subscriptions').get().then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        subscriptions.push({
          name: doc.data().name,
          url: doc.data().url,
          user: doc.data().user
        })
      })
      // go and get all of the new subscriptions and then update the firebase data
      for (let i in subscriptions){
        request({
          method: 'GET',
          uri: subscriptions[i].url,
          followAllRedirects: true
        }, function (error, response, body) {
          if (error) {
            return console.error('request failed:', error);
          }
          let eventsParsed = parseIcal(body)
          //console.log('Upload successful!  Server responded with:',body);
          admin.firestore().collection('users').doc(subscriptions[i].user).collection('schedules').doc(subscriptions[i].name).update({
            events: eventsParsed
          })
        })

      }

      console.log("subscriptions", JSON.stringify(subscriptions, null, 4))
      res.json(subscriptions)
    })
  });
});