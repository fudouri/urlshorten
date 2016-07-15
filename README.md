# urlshorten
## Installation
 1. Install Node

   See  https://nodejs.org/en/

 2. Install Hapi

   Run `npm install hapi`

 3. Install Sqlite

   Run `npm install sqlite3`

 4. Install Device

   Run `npm install device`

 5. Run server

   Run `node server.js`

##Usage examples

The server runs on port 8080.

 1. Insert new url to shorten

   ```curl fullurl=http://www.google.com" -X POST http://localhost:8080/admin```

   This will return a shortened key XXXXXX.

 2. See list of all urls shortened

   ```curl http://localhost:8080/admin```

 3. Access the redirect

   ```User browser to go to: http://localhost:8080/XXXXXX```

 4. Change urls based on device

   ```curl --data "desktop=http://www.yahoo.com" -X PUT http://localhost:8080/admin/XXXXXX```

   Possible devices list: desktop, tv, tablet, phone, bot, car, default

