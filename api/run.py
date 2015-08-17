from flask import Flask, jsonify
import pymongo
import json
import sys
from datetime import date
from time import mktime

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



app = Flask(__name__)
app.debug = True

mongo = db()

@app.route('/')
def hello_world():
    return 'Hello World!'

@app.route('/events/createindex')
def create_index():
	
	#for index in mongo.collection.list_indexes():
	#    print(index)
	indexes = mongo.collection.index_information()
	for item in indexes.iterkeys():
		if item == "scale_1":
			print('index scale is here')
		else:
			mongo.collection.create_index([( "scale", 1)])
		#print(item)
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

@app.route('/events/last/<items>')
def get_last(items):
	docs = mongo.collection.find().sort( [( "$natural", -1)] ).limit(int(items))
	docs_dict = {}
	i = 0

	for doc in docs:
		#print(doc)
		tmp = "item_" + str(i)
		docs_dict[tmp] = doc
		i += 1
		
	return(json.dumps(docs_dict))
	#return(json.dumps(docs_dict, sort_keys=True, indent=4))
	#return ""

if __name__ == '__main__':
    app.run()