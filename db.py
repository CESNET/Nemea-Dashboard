#!/usr/bin/python3.4

import pymongo
import time
from datetime import date
from time import mktime

# Connection to Mongo DB
try:
    conn=pymongo.MongoClient()
    print ("Connected successfully!!!")
except pymongo.errors.ConnectionFailure:
   print ("Could not connect to MongoDB: %s" % e) 

db = conn.test_corr_db
print(conn.database_names())


t = time.process_time()

collection = db.events

#'type': 'PORTSCAN_H'
counter = {}

start = date(2015, 7, 3)
unixtime = int(mktime(start.timetuple()))
#collection.create_index([( "scale", -1)])
#collection.create_index([( "time_first" , 1)])
#collection.drop_index([( "scale", -1)])
#collection.drop_index([( "time_first" , 1)])
for doc in collection.find( { "time_first": {"$gt" : unixtime }, "type": "PORTSCAN_H" }).sort( [( "scale", -1)] ).limit(10):
#for doc in collection.find().sort([( "$natural", -1)]).limit(10):
	print(doc)
	doctype = doc['type']
	#tmp = counter[doctype]
	if doctype in counter:
		counter[doctype] += 1
	else: 
		counter[doctype] = 1 

#	if doc['type'] == 'PORTSCAN_H':
#		counter += 1

print(counter)

print(time.process_time() - t)
#print(int(time.time()))
#print(mktime(start.timetuple()))
