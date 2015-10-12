# Nemea Dashboard

##Installing Nemea-Dashboard
###Prequisites
You'll need `python3`, `pip`, `bower`, `mongoDB` and any HTTP server (tested and run on `httpd`)

###Installing
1. Clone this repository
2. (Optional) create python virtual environment (`virtualenv <name>`) and activate it
3. Run pip install
4. Run bower install
5. Start mongoDB (demo DB TBD)
6. Start web server
7. Start Python API (`python api.py`)
8. Navigate to the server

User login (if needed) : `a@a.cz`
Password: `aa`

##API endpoints

###User control
Check if user is logged in (built upon Session in Flask)
```
/login
```

Log in a user
```
/login/<user>/<password>
```

###Event correlation database
Sample output from actual database (last 100 events)
```
/events
```

Create indexes in MongoDB and return all created indexes
```
/events/createindex
```

Get last event in DB
```
/events/last
```

Get last `n` events in DB
```
/events/last/<n>
```

Get last `n` events in DB aggregated
```
/events/last/<n>/agg
```

Get first event in DB
```
/events/first
```

Get first `n` events in DB
```
/events/first/<n>
```

Get last event by type
```
/events/type/<event_type>
```

Get last n events by type
```
/events/type/<event_type>/last/<n>
```

Get top n events by type
```
/events/type/<event_type>/top/<n>
```

Get all events by attacker IP
>IPv4 address in format: `192-0-0-1`

```
/events/ip/<ip>


