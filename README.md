# Nemea Dashboard

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


