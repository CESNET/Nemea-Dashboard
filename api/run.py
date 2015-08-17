from flask import Flask, redirect
import pymongo
import json
import sys
from datetime import date
from time import mktime

from bson import Binary, Code
from bson.json_util import dumps

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



app = Flask(__name__)
app.debug = True

mongo = db()

def parse_doc(docs):
	tmp = []

	for doc in docs:
		tmp.append(doc)
	
	return(dumps(tmp, sort_keys=True, indent=4))

def get_event(event_type, limit):
	if limit == 0:
		return("You cannot dump the whole DB")
	else:
		return(mongo.collection.find( {"type" : event_type.upper() } ).sort( [( "$natural", 1)] ).limit(limit))

def get_event_type(event_type):
	if event_type == "portscan":
		return "PORTSCAN_H"
	elif event_type == "voipguess":
		return "VOIP_PREFIX_GUESS"
	elif event_type == "voipcall":
		return "VOIP_CALL_DIFFERENT_COUNTRY"
	elif event_type == "dnstunnel":
		return "DNS_TUNNEL"
	else:
		return event_type

@app.route('/')
def hello_world():
    return 'Hello World!'

@app.route('/events/createindex')
def create_index():
	indexes = mongo.collection.index_information()
	for item in indexes.keys():
		if item == "scale_1" or item == "type_1":
			print('index scale is here')
		else:
			mongo.collection.create_index([( "scale", 1)])
			mongo.collection.create_index([( "type", 1)])

	return(json.dumps(indexes))

@app.route('/events')
def connect_db():
	doctype = {}

	print('lets rock')
	print(mongo.collection.find().limit(10).sort([('scale', -1 )]))
	foo = []
	#tmp = mongo.collection.find( { "time_first": {"$gt" : '1238214400' }, "type": "PORTSCAN_H" }).sort( [( "scale", 1)] ).limit(10)
	tmp = mongo.collection.find({"type": "PORTSCAN_H"}).sort( [( "scale", 1)] ).limit(10)

	for doc in tmp:
		print('tmp', doc)
		foo.append(doc)

	temp = mongo.collection.find( { "time_first": {"$gt" : '1238214400' }, "type": "PORTSCAN_H" }).sort( [( "scale", 1)] ).limit(10)



	for doc in temp:
	#for doc in collection.find().sort([( "$natural", -1)]).limit(10):
		print(doc)
		print('running')
		
		doctype = doc['type']
		#tmp = counter[doctype]
		if doctype in counter:
			counter[doctype] += 1
		else: 
			counter[doctype] = 1 

	return str(foo)

#############################
#Get the last event
#############################
@app.route('/events/last/')
def redirect_last():
	return(get_last(1))

#############################
#Get last n events
#############################
@app.route('/events/last/<int:items>')
def get_last(items):
	if items != 0:
		docs = mongo.collection.find().sort( [( "$natural", -1)] ).limit(items)
	else:
		return("You cannot dump the whole DB!")
		
	temp = parse_doc(docs)

	print(temp)
	return (temp)

#############################
#Get the first event
#############################
@app.route('/events/first/')
def get_first_item():
	return (get_first(1))

#############################
#Get first n events
#############################
@app.route('/events/first/<int:items>')
def get_first(items):
	if items != 0:
		docs = mongo.collection.find().sort( [( "$natural", 1)] ).limit(items)
	else:
		return("You cannot dump the whole DB!")
	
	temp = parse_doc(docs)

	#debug purposes
	#print(temp)

	return (temp)

@app.route('/events/type/<event_type>/')
def get_event_item(event_type):

	docs = get_event(get_event_type(event_type), 1)

	return(parse_doc(docs))

@app.route('/events/type/<event_type>/last/<int:limit>')
def get_type(event_type, limit):
	docs = get_event(get_event_type(event_type), limit)

	return(parse_doc(docs))

@app.route('/events/type/<event_type>/top/<int:limit>')
def get_top_events(event_type, limit):
	docs = mongo.collection.find( {"type" : get_event_type(event_type).upper() } ).sort( [( "scale", -1)] ).limit(limit)

	return(parse_doc(docs))

if __name__ == '__main__':
    app.run()