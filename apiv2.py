from config import Config

from flask import Flask, session, escape, request
from flask.ext.cors import CORS
import pymongo
import json
import sys
from datetime import date
from bson import json_util
from time import mktime

config = Config()
C = config.data

class jsonReturn(object):
    base = {
        'error' : False,
        'error_msg' : None,
        'success' : True,
        'data' : None
    }

    def error(self, message):
        self.base['error_msg'] = str(message)
        self.base['error'] = True
        self.base['success'] = False
        return(json.dumps(self.base))

    def success(self, data):
        self.base['data'] = data
        return(json.dumps(self.base))

ret = jsonReturn()

class dbConnector(object):
    host = C["db"]["host"]
    port = C["db"]["port"]
    dbName = C["db"]["database"]
    eventsCollection = C["db"]["collection"]["events"]
    usersCollection = C["db"]["collection"]["users"]
    collection = None
    db = None
    socket = None

    def __init__(self, host = None, port = None, db = None, collection = None, users = None):

        # Setup host and port for DB 
        if host != None and port != None:
            self.host = host
            self.port = port
        
        # Set up database and events collection
        if db != None and events != None:
            self.dbName = db
            self.eventsCollection = events

        # Set up users collection
        if users != None:
            self.usersCollection = users

        # Connect to database and events collection 
        try:
            self.socket = pymongo.MongoClient(self.host, self.port, serverSelectionTimeoutMS=100)
            # Try to print out server info
            # This raises ServerSelectionTimeoutError
            self.socket.server_info()
            self.db = self.socket[self.dbName]
            self.collection = self.db[self.eventsCollection]

        # Small trick to catch exception for unavailable database
        except pymongo.errors.ServerSelectionTimeoutError as err:
            print(err)
            sys.exit()

    # Get events by type and limit
    def get_event(self, event_type, limit):
        res = None
        if limit == 0:
            res = ret.error("You cannot dump the whole DB")
        else:
            res = self.collection.find( {"type" : event_type.upper() } ).sort( [( "$natural", -1)] ).limit(limit)
        return(res)
    def parse_doc(self, docs):
        tmp = []
        return(json.dumps(docs, sort_keys=True, indent=4))

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

db = dbConnector()

app = Flask(__name__)
app.debug = C['debug']

CORS(app)

#@app.route(C['base'] + '/<int:limit>')
def home(limit):
    res = db.get_event("portscan_h", limit)
    return(str(res))

@app.route(C['events'] + 'indexes', methods=['GET'])
def indexes():
    indexes = db.collection.index_information()
    for item in indexes.keys():
        if item == "DetectTime":
            print('indexes are here')
            return(json.dumps(indexes))
    db.collection.create_index([( "DetectTime", 1)])
    indexes = db.collection.index_information()
#            mongo.collection.create_index([( "type", 1)])
#            mongo.collection.create_index([( "time_first", 1), ("type", 1)])
    return(json.dumps(indexes))


@app.route(C['events'] + '<int:items>', methods=['GET', 'POST'])
def get_last(items):
    if request.method == 'GET':
        if items != 0:
            docs = list(db.collection.find().sort( [( "DetectTime", -1)] ).limit(items))
        else:
            return("You cannot dump the whole DB!")
    if request.method == 'POST':
        data = request.get_json()
        print(data)
        if data["limit"] != 0:
            query = {  "DetectTime" : { "$lt" : data["to"]}, "DetectTime" : { "$gt" : data["from"]} } 
            print(query)
            docs = list(db.collection.find({ "$and" : [{"DetectTime" : { "$gt" : data["from"]}}, {"DetectTime" : { "$lt" : data["to"]}}] }).sort( [( "DetectTime", -1)] ).limit(int(data["limit"])))
        
#temp = db.parse_doc(docs)

    return (json.dumps(docs, default=json_util.default))

@app.route(C['events'] + 'agg', methods=['POST'])
def aggregate():
    if request.method == 'POST':
        req = request.get_json()
        print(req)
#db.alerts.aggregate([{$match : { "DetectTime" : { "$gt" : "2016-01-27T06:08:17.274Z"}}}, {$group : { _id : {"Categories" : "$Category"}, count : {$sum : 1}}}])
        query = [
            {
                "$match" : {
                    "DetectTime" : {
                        "$gt" : req["begintime"]
                    }
                }
            },
            {
                "$group" : {
                    "_id" : {
                        "Categories" : "$Category"
                    },
                    "count" : { "$sum" : 1}
                }
            }
        ]
        res = list(db.collection.aggregate(query))
        tmp = list()
        print(res)
        for item in res:
            tmp.append({
                "key" : item["_id"]["Categories"],
                "x" : item["count"]
            })
        if req['type'] == "areachart":
            print("areachart here")
            query = { "DetectTime" : {"$gt" : req["begintime"]}}
            res = list(db.collection.find(query))
            #for item in res
    return(json.dumps(tmp, default=json_util.default))

@app.route(C['events'] + 'time', methods=['GET'])
def timeagg():
    query = [{
        "$group": {
            "_id": {
                "year": { "$year": "$DetectTime" },
                "dayOfYear": { "$dayOfYear": "$DetectTime" },
                "interval": {
                    "$subtract": [ 
                        { "$minute": "$DetectTime" },
                        { "$mod": [{ "$minute": "$DetectTime", 15 }] }
                    ]
                }
            }},
        "count": { "$sum": 1 }
        }]

    res = list(db.collection.aggregate(query))
    return(str(res))

@app.route('/events/type/<event_type>/')
def get_event_item(event_type):

    docs = db.get_event(mongo.get_event_type(event_type), 1)

    return(db.parse_doc(docs))

@app.route('/events/type/<event_type>/last/<int:limit>')
def get_type(event_type, limit):
    docs = db.get_event(db.get_event_type(event_type), limit)

    return(db.parse_doc(docs))

@app.route('/events/type/<event_type>/from/<int:from_time>/to/<int:to_time>')
def get_type_time(event_type, from_time, to_time):
    docs = db.get_event_time(db.get_event_type(event_type), from_time, to_time)

    return(db.parse_doc(docs))

@app.route('/events/type/<event_type>/top/<int:limit>')
def get_top_events(event_type, limit):
    docs = db.collection.find( {"type" : db.get_event_type(event_type).upper() } ).sort( [( "scale", -1)] ).limit(limit)

    return(db.parse_doc(docs))



if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5555)


