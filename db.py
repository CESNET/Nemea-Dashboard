#!/usr/bin/env python3

import pymongo
import time
import sys
from datetime import date
from time import mktime

from eve import Eve
app = Eve()

if __name__ == '__main__':
    app.run()

class db(object):

	host = "localhost"
	port = 27017
	dbName = "test_corr_db"
	collectionName = "events"
	collection = None
	db = None
	socket = None

	def __init__(self, host = None, port = None, db = None, collection = None):

		if host != None and port != None:
			self.host = host
			self.port = port
		
			if db != None and collection != None:
				self.dbName = db
				self.collectionName = collection

		try:
			self.socket = pymongo.MongoClient(self.host, self.port)
			self.db = self.socket[self.dbName]
			self.collection = self.db[self.collectionName]
		except Exception:
			print("Cannot establish connection to database")
			sys.exit()
		
	def indexes(self):
		self.collection.create_index([( "time_first" , 1)])
		print("time_first index created")


mongo = db();
#print(mongo.socket.server_info())

print(mongo.socket.database_names())

mongo.indexes()

sys.exit()


counter = {}

start = date(2015, 7, 3)
unixtime = int(mktime(start.timetuple()))
#collection.create_index([( "scale", -1)])
#conn.collection.create_index([( "time_first" , 1)])
#collection.drop_index([( "scale", -1)])
#collection.drop_index([( "time_first" , 1)])
for doc in mongo.collection.find( { "time_first": {"$gt" : unixtime }, "type": "PORTSCAN_H" }).sort( [( "scale", 1)] ).limit(10):
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

#print(int(time.time()))
#print(mktime(start.timetuple()))
