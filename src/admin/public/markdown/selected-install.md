
``` json
{
  "services": [
    {
      "image": "index.docker.io/oaklabs/app-schedule:{{$parent.currentRelease}}",
      "environment": {
        "API_KEY": "{{$parent.user.uid}}",
        "SCHEDULE_NAME": "{{$parent.settings.selectedSchedule.name}}",
        "NODE_ENV": "production"
      }
    }
  ]
}
```