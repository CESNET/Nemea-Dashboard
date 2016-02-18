# Nemea Dashboard

##Installing Nemea-Dashboard
###Prequisites
You'll need `python3`, `pip3`, `bower`, `mongoDB` and any HTTP server (tested and run on `httpd`)

###Installing
1. Clone this repository
2. Configure front-end (js/config.js) and back-end (config.json) accordingly
2. (Optional) create python virtual environment (`virtualenv <name>`) and activate it
3. Run `pip3 install -r requirements.txt`
5. Start mongoDB (demo database TBD)
6. Start web server
7. Start Python API (`python3 apiv2.py`)
8. Navigate to the web server

Default user login : `default`
Password: `test`

##API Endpoints
The API is versioned in the URL and every endpoint starts with the version number (currently `/v2`)

###User Management
Starts with prefix `/users`
User authorization
```
/auth
```

User logout
```
/logout
```

###Events
Starts with prefix `/events`


Create indexes in MongoDB and return all created indexes
```
/indexes
```

View on aggregated events
```
/agg
```

Get last `n` events in DB
```
/<n>
```

Specific query
```
/query
```

Get top event in each category
```
/top
```

Get one specified event
```
/id/<event_id>
```

