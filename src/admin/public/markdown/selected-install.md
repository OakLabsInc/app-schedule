
``` json
{
  "services": [
    {
      "image": "index.docker.io/oaklabs/app-schedule:release-1.0.0",
      "environment": {
        "API_KEY": "{{$parent.user.uid}}",
        "SCHEDULE_NAME": "{{$parent.settings.selectedSchedule.name}}",
        "NODE_ENV": "production"
      }
    }
  ]
}
```