#!/usr/local/bin/python3
from flask import Flask, redirect, session, escape, request
from flask.ext.cors import CORS
import pymongo
import json
import sys
from datetime import date
from time import mktime

from bson import Binary, Code
from bson.json_util import dumps
from bson.son import SON

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
            self.socket = pymongo.MongoClient(self.host, self.port, serverSelectionTimeoutMS=0)
            self.db = self.socket[self.dbName]
            self.collection = self.db[self.collectionName]

        except pymongo.errors.PyMongoError as err:
            print("\n\n\n\n\n\n")
            print("Cannot establish connection to database")
            sys.exit()
    def get_event(self, event_type, limit):
        if limit == 0:
            return("You cannot dump the whole DB")
        else:
            return(self.collection.find( {"type" : event_type.upper() } ).sort( [( "$natural", -1)] ).limit(limit))
    def parse_doc(self, docs):
        tmp = []
        return(dumps(docs, sort_keys=True, indent=4))

    def get_event_time(self, event_type, from_time, to_time):
        return(self.collection.find( {"type" : event_type.upper(), "time_first" : {"$gt" : from_time},  "time_first" : {"$lt" : to_time} } ).sort( [( "$natural", -1)] )).limit(10000)

    def get_event_type(self, event_type):
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
#END db

print("Starting Nemea Dashboard API")

app = Flask(__name__)
app.debug = True

CORS(app)

mongo = db()

@app.errorhandler(db)
def handle_invalid_usage(error):
    response = jsonify(error.to_dict())
    response.status_code = error.status_code
    return "\n\n\n\n" + response

# @app.after_request
# def after_request(response):
#     response.headers.add('Access-Control-Allow-Origin', '*')
#     response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
#     response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE')
#     return response

@app.route('/')
def hello_world():
    return 'Hello World!'

@app.route('/events/createindex')
def create_index():
    indexes = mongo.collection.index_information()
    for item in indexes.keys():
        if item == "scale_1" and item == "type_1" and item == "time_first":
            print('indexes are here')
        else:
            mongo.collection.create_index([( "scale", 1)])
            mongo.collection.create_index([( "type", 1)])
            mongo.collection.create_index([( "time_first", 1), ("type", 1)])
    return(json.dumps(indexes))

@app.route('/events')
def connect_db():
    doctype = {}

    """print('lets rock')
    #print(mongo.collection.find().limit(10).sort([('scale', -1 )]))
    foo = []
    #tmp = mongo.collection.find( { "time_first": {"$gt" : '1238214400' }, "type": "PORTSCAN_H" }).sort( [( "scale", 1)] ).limit(10)
    #tmp = mongo.collection.find({"type": "PORTSCAN_H"}).sort( [( "scale", 1)] ).limit(10)

    for doc in tmp:
        print('tmp', doc)
        foo.append(doc)

    #temp = mongo.collection.find( { "time_first": {"$gt" : '1238214400' }, "type": "PORTSCAN_H" }).sort( [( "scale", 1)] ).limit(10)
    """
    temp = mongo.collection.find().limit(1000).sort([("$natural", -1)])

    counter = {}

    for doc in temp:
    #for doc in collection.find().sort([( "$natural", -1)]).limit(10):
        print(doc)
        #print('running')
        
        doctype = doc['type']
        #tmp = counter[doctype]
        if doctype in counter:
            counter[doctype] += 1
        else: 
            counter[doctype] = 1 

    return str(counter)

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
        
    temp = mongo.parse_doc(docs)

    return (temp)

@app.route('/events/last/<int:items>/agg')
def get_last_agg(items):
    if items != 0:
        pipeline = [
            {"$sort" : {"time_first" : -1} },
            { "$limit" : items},
            {"$group": {"_id": "$type", "count": {"$sum": 10}}}
        ]
        docs = mongo.collection.aggregate(pipeline)
#temp = mongo.db.command('aggregate', 'collection', pipeline=pipeline, explain=True)
    else:
        return("You cannot dump the whole DB!")
        
    #temp = parse_doc(docs)

    #print(temp)

    return (str(docs))

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
    
    temp = mongo.parse_doc(docs)

    #debug purposes
    #print(temp)

    return (temp)

@app.route('/events/type/<event_type>/')
def get_event_item(event_type):

    docs = mongo.get_event(mongo.get_event_type(event_type), 1)

    return(mongo.parse_doc(docs))

@app.route('/events/type/<event_type>/last/<int:limit>')
def get_type(event_type, limit):
    docs = mongo.get_event(mongo.get_event_type(event_type), limit)

    return(mongo.parse_doc(docs))

@app.route('/events/type/<event_type>/from/<int:from_time>/to/<int:to_time>')
def get_type_time(event_type, from_time, to_time):
    docs = mongo.get_event_time(mongo.get_event_type(event_type), from_time, to_time)

    return(mongo.parse_doc(docs))

@app.route('/events/type/<event_type>/top/<int:limit>')
def get_top_events(event_type, limit):
    docs = mongo.collection.find( {"type" : mongo.get_event_type(event_type).upper() } ).sort( [( "scale", -1)] ).limit(limit)

    return(mongo.parse_doc(docs))

@app.route('/events/ip/<ip>')
def get_by_ip(ip):

    ip =ip.replace('-', '.')

    print(ip)

    docs = mongo.collection.find( {"attacker" : ip } )

    return(mongo.parse_doc(docs))

@app.route('/login', methods=['GET', 'POST'])
def login():
    #data = json.loads(request.data.decode())
    #print(data)

    if request.method == 'POST':
        tmp = request.get_json()
        if tmp["email"] == "a@a.cz":
            tmp["success"] = True
        else:
            tmp["success"] = False
        print(tmp)
        return(json.dumps(tmp))
    if 'username' in session:
        username = session['username']
        print(username)
        return("Logged In As:" + username)
    session['username'] = "john"
    #return("DONE!")
    return("aa")
    

app.secret_key = 'Ugd\d&\y12~\x9d-\x1e0A\xd2)\xbbp\x1d\xfa-\xfc=\xbf\xd9/'

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5555)
