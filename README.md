# Schedule Application and Admin

This project has two parts. The first part is the Firebase hosted admin web page. The second part is an OakOS application container that displays the Firebase data that the admin page stores for a machine.
## Commands

First command to run is:

> ```npm run rebuild```

To run firebase commands you will need some firebase tools:

> ```npm install -g firebase-tools```

To run the firebase server locally run:

> ```firebase serve```

To deploy the application to the firebase hosting service run:

> ```firebase deploy --only hosting```

To compile the local `pug` and `stylus` files for the admin run:

> ```npm run gulp```

To run the project application in electron locally run:

> ```npm run dev```