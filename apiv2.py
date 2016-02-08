from config import Config

from flask import Flask, session, escape, request
from flask.ext.cors import CORS
import pymongo
import json
import sys
from datetime import date, datetime, timedelta
from bson import json_util
from bson.objectid import ObjectId
from time import mktime

config = Config()
C = config.data

def roundTime(dt=None, roundTo=60):
    """Round a datetime object to any time laps in seconds
    dt : datetime.datetime object, default now.
    roundTo : Closest number of seconds to round to, default 1 minute.
    Author: Thierry Husson 2012 - Use it as you want but don't blame me.
    """
    if dt == None : dt = datetime.datetime.now()
    seconds = (dt - dt.min).seconds
    # // is a floor division, not a comment on following line:
    rounding = (seconds+roundTo/2) // roundTo * roundTo
    return dt + timedelta(0,rounding-seconds,-dt.microsecond)


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
    users = None
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
            self.users = self.db[self.usersCollection]

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
        #print(data)
        if data["limit"] != 0:
            query = {  
                "DetectTime" : { 
                    "$lt" : datetime.strptime(data["to"], "%Y-%m-%dT%H:%M:%S.%fZ")
                }, 
                "DetectTime" : { 
                    "$gt" : datetime.strptime(data["from"],"%Y-%m-%dT%H:%M:%S.%fZ")
                } 
            } 
            print(query)
            docs = list(db.collection.find({ 
                "$and" : [
                    { "DetectTime" : { "$gt" : datetime.strptime(data["from"],"%Y-%m-%dT%H:%M:%S.%fZ") } }, 
                    { "DetectTime" : { "$lt" : datetime.strptime(data["to"], "%Y-%m-%dT%H:%M:%S.%fZ") } }
                    ] 
                }).sort( [( "DetectTime", -1)] ).limit(int(data["limit"])))
        
#temp = db.parse_doc(docs)

    return (json.dumps(docs, default=json_util.default))

@app.route(C['events'] + 'agg', methods=['POST'])
def aggregate():
    if request.method == 'POST':
        req = request.get_json()
        print(req)
#db.alerts.aggregate([{$match : { "DetectTime" : { "$gt" : "2016-01-27T06:08:17.274Z"}}}, {$group : { _id : {"Categories" : "$Category"}, count : {$sum : 1}}}])
        if req['type'] == 'piechart':
            query = [
                {
                    "$match" : {
                        "DetectTime" : {
                            "$gt" : datetime.strptime(req["begintime"], "%Y-%m-%dT%H:%M:%S.%fZ")
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
        if req['type'] == "barchart":
            time = datetime.strptime(req['begintime'], "%Y-%m-%dT%H:%M:%S.%fZ")
            query = [
                {
                    "$match" : {
                        "DetectTime" : { "$gte" : time }
                    }
                },
                {
                    "$project" : {
                        "_id" : 0,
                        "res" : {
                            "$subtract": [ 
                                "$DetectTime",
                                { "$mod": [{ "$subtract" : ["$DetectTime", time] }, int(req['window'])*60*1000 ]}
                            ]
                        },
                         "Time" : "$DetectTime",
                         "Category" : "$Category",
                         "FlowCount" : "$FlowCount"
                    }
                },
                {
                    "$group" : {
                        "_id" : {
                            "DetectTime" : "$res",
                            "Category" : "$Category"
                        },
                        "Count" : {"$sum" : 1},
                        "FlowCount" : {"$sum" : "$FlowCount"}
                    }
                },
                {
                    "$sort" : { "_id.DetectTime" : 1, "_id.Category" : 1 }
                }
            ]
            res = list(db.collection.aggregate(query))
            data = list()
            for item in res:
                inserted = False
                for serie in data:
                    if serie['key'] == item['_id']['Category'][0]:
                        serie['values'].append({'x' : mktime(item['_id']['DetectTime'].timetuple())*1000, 'FlowCount' : item['FlowCount'], 'Count' : item['Count']})
                        inserted = True
                        break

                if not inserted:
                    data.append({
                            'key' : item['_id']['Category'][0], 
                            'values' : [{
                                'x' : mktime(item['_id']['DetectTime'].timetuple())*1000, 
                                'FlowCount' : item['FlowCount'], 
                                'Count' : item['Count']
                            }]
                        })
            tmp = data


    return(json_util.dumps(tmp))

@app.route(C['events'] + 'top', methods=['POST'])
def top():
    if request.method == 'POST':
        req = request.get_json()
        query = [
            {
                '$match' : {
                    'DetectTime' : {'$gt' : datetime.strptime(req['begintime'], "%Y-%m-%dT%H:%M:%S.%fZ")}
                }
            },
            {
                '$sort' : {'FlowCount' : -1}
            },
            {
                '$group' : {
                    '_id' : '$Category',
                    'FlowCount' : { '$first' : '$FlowCount' },
                    'id' : {'$first' : '$_id'}
                }
            },
            {
                '$unwind' : '$_id'
            }]
        res = list(db.collection.aggregate(query))
    return(json_util.dumps(res))

@app.route(C['events'] + 'id/<string:id>', methods=['GET'])
def get_by_id(id):
    if request.method == 'GET':
        query = {
            '_id' : ObjectId(id)
        }
        
        res = db.collection.find_one(query)
    return(json_util.dumps(res))

@app.route(C['users'], methods=['GET', 'PUT'])
def get_users():
    if request.method == 'GET':
        res = list(db.users.find())

    if request.method == 'PUT':
        print('updating a user')
        user = request.get_json()
        
        res = db.users.find_one_and_update({'_id' : ObjectId(user['id'])}, {"$set" : { 'settings' : user['settings'] }}, return_document=pymongo.ReturnDocument.AFTER)
        print(user)
    return(json_util.dumps(res))



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


