import pymongo

# Connection to Mongo DB
try:
    conn=pymongo.MongoClient()
    print ("Connected successfully!!!")
except pymongo.errors.ConnectionFailure:
   print ("Could not connect to MongoDB: %s" % e) 

db = conn.test_corr_db
print(conn.database_names())

collection = db.events

#'type': 'PORTSCAN_H'
counter = {}

for doc in collection.find()[:1000]:
#	print(doc['type'])
	doctype = doc['type']
	#tmp = counter[doctype]
	if doctype in counter:
		counter[doctype] += 1
	else: 
		counter[doctype] = 1 

#	if doc['type'] == 'PORTSCAN_H':
#		counter += 1

print(counter)
