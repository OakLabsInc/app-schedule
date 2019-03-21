
# Documentation

**Welcome** 

email: {{$parent.user.email}}

api key: XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

## What this is

The purpose of this app is to demonstrate:

- Integrate Firebase Database, Hosting and Functions
- An admin hosting pattern that allows data management

The audiences for this app are:

- Developers wanting to use it as a starting point
- Sales people to demonstrate examples of OakOS
- Zivelo internal usage

## What this is **Not**

- Meant to be used as for production
- Perscriptive of UI patterns

## How to Start in the Admin

- Add a schedule from the left column
- Add a calendar subscription to that schedule
- Reload this page after a few minutes to allow for the cloud functions to update the database

## Install the App on OakOS

- If you dont have the OakOS Postman API setup first install [Postman Application](https://www.getpostman.com/downloads/)  onto your local machine.
- Then trigger the postman [OakOS API](postman://app/collections/import/2669279-0f82deec-19ba-4dea-ac2f-7242b0560ffd-RWaGT9F8?referrer=https%3A%2F%2Fapi.docs.zivelo.com%2F#?) install

- Install this app using the OakOS API `Application -> Install` endpoint from postman

``` html
http://dashboard/api/v5/machine/xxxxxxxxxx/application/install?streaming=true&timeout=5000
```

  Where the dashboard machine is your machine mac address that OakOS is installed on.

- Here is a request body to use

``` json
{
  "services": [
    {
      "image": "index.docker.io/oaklabs/app-schedule:1.0.0",
      "environment": {
        "API_KEY": "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
        "SCHEDULE_NAME": "google_calendar",
        "NODE_ENV": "production"
      }
    }
  ]
}
```

## Demo Videos