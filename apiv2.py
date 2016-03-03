#!/usr/bin/env python3

from config import Config

from flask import Flask, session, escape, request, Response, abort, session
from flask.ext.cors import CORS
import pymongo
import json
import sys
from subprocess import Popen, PIPE, check_output
from datetime import date, datetime, timedelta
from bson import json_util
from bson.objectid import ObjectId
from time import mktime
import jwt
import bcrypt
from functools import wraps

# Load config.json
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
    sessionsCollection = C["db"]["collection"]["sessions"]
    collection = None
    users = None
    events = None
    sessions = None
    db = None
    socket = None

    def __init__(self, host = None, port = None, db = None, events = None, users = None, sessions = None):

        # Setup host and port for DB 
        if host != None and port != None:
            self.host = host
            self.port = port
        
        # Set up database name
        if db != None:
            self.dbName = db
        
        # Set up events collection
        if events != None:
            self.eventsCollection = events

        # Set up users collection
        if users != None:
            self.usersCollection = users

        # Connect to database and bind events and users collections 
        try:
            self.socket = pymongo.MongoClient(self.host, self.port, serverSelectionTimeoutMS=100)
            
            # Try to print out server info
            # This raises ServerSelectionTimeoutError
            self.socket.server_info()
            
            self.db = self.socket[self.dbName]
            self.collection = self.events = self.db[self.eventsCollection]
            self.users = self.db[self.usersCollection]
            self.sessions = self.db[self.sessionsCollection]

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

#END db

class Auth(object):
    errors = {
        '0' : 'Username not found.',
        '1' : 'Username and password doesn\'t match.',
        '2' : 'Expired session.',
        '3' : 'Authorization header is missing.'
    }
    
    def check_password(self, password, hash):
        return bcrypt.checkpw(password, hash)

    def create_hash(self, password):
        return bcrypt.hashpw(password, bcrypt.gensalt())
    
    def auth_error(self, code):
        msg = {
            'code' : code,
            'description' : self.errors[str(code)]
        }
        res = json_util.dumps(msg)
        return msg

    def login(self, username, password):
        query = {
            'username' : username
        }
        res = db.users.find_one(query)

        if not res:
            return(0)

        if not self.check_password(password, res['password']):
            return(1)
        
        return(res)

    def jwt_create(self, payload):
        encoded = jwt.encode(payload, app.config['SECRET_KEY'], algorithm='HS256')
        return str(encoded.decode('utf-8'))

    def jwt_decode(self, token):
        decoded = jwt.decode(token, app.config['SECRET_KEY'], algorithm=['HS256'])
        return decoded

    def store_session(self, username, user_id):
        _id = db.sessions.insert({
            "username" : username,
            "expire" : datetime.utcnow(),
            "user_id" : ObjectId(user_id)
        })

        return _id
        
    def get_session(self, _id):
        print(_id)
        res = db.sessions.find_one({"_id" : ObjectId(_id)})
        if res:
            print('We got it in session')
            delta = datetime.utcnow() - res['expire']
            if delta < timedelta(days=31):
                return res
        return False

    # Shift expiry date
    def update_session(self, _id):
        db.sessions.update({
            '_id' : ObjectId(_id)
        },
        {
            "$set" : {
                "expire" : datetime.utcnow()
            }
        })
    def delete_session(self, _id):
        res = db.sessions.remove({"_id" : ObjectId(_id)})
        return res['ok']

    # Decorator for required Authorization JWT token
    def required(self, f):
        @wraps(f)
        def verify_jwt(*args, **kwargs):
            auth = request.headers.get('Authorization', None)
            if not auth:
                return abort(401)
            decoded_token = self.jwt_decode(auth)
            print(decoded_token)
            session_token = self.get_session(decoded_token['_id'])
            print(session_token)
            if not session_token:
                return abort(401)
            else:
                self.update_session(session_token['_id'])
            return f(*args, **kwargs)
        return verify_jwt


db = dbConnector()
auth = Auth()

app = Flask(__name__)
app.debug = C['debug']
app.config['SECRET_KEY'] = 'secret-super'

# Enable Cross-Origin
CORS(app)

@app.route(C['users'] + 'auth', methods=['POST'])
def login():
    user = request.get_json()
    
    # Authorize user using their username and password
    # @return user's document from the DB including config
    auth_user = auth.login(user['username'], user['password'])
    
    if auth_user == 0 or auth_user == 1:
        return auth.errors[str(auth_user)], 401
    
    _id = auth.store_session(auth_user['username'], auth_user['_id'])
    
    # Attach JWT for further authentication
    auth_user['jwt'] = auth.jwt_create({
        'username' : auth_user['username'],
        '_id' : str(_id),
        'created' : mktime(datetime.utcnow().timetuple())
    })
    return(json_util.dumps(auth_user))


# Create indexes
@app.route(C['events'] + 'indexes', methods=['GET'])
@auth.required
def indexes():
    indexes = db.collection.index_information()
    for item in indexes.keys():
        if item == "DetectTime":
            print('indexes are here')
            return(json.dumps(indexes))
    db.collection.create_index([( "DetectTime", 1)])
    indexes = db.collection.index_information()
    return(json.dumps(indexes))

@app.route('/config', methods=['GET'])
@auth.required
def get_config():
    config = {
        'events' : C['events'],
        'users' : C['users'],
        'host' : C['api']['host'],
        'port' : C['api']['port']
    }
    return(json.dumps(config))

@app.route(C['events'] + '<int:items>', methods=['GET'])
@auth.required
def get_last(items):
    if items == 0 or items > 10000:
        items = 100
    docs = list(db.collection.find().sort( [( "DetectTime", -1)] ).limit(items))
    
    return (json.dumps(docs, default=json_util.default))

@app.route(C['events'] + 'query', methods=['GET'])
@auth.required
def query():
    req = request.args

    req = req.to_dict()

    query = {
        "$and" : [
            {"DetectTime" : {"$gte" : datetime.strptime(req["from"],"%Y-%m-%dT%H:%M:%S.%fZ")}}
        ]
    }

    if 'to' in req:
        part = {"DetectTime" : {"$lt" : datetime.strptime(req["to"],"%Y-%m-%dT%H:%M:%S.%fZ")}}
        query["$and"].append(part)

    if 'category' in req:
        part = {"Category" : {"$regex" : ".*" + req['category'] + ".*", '$options' : 'i'}}
        query["$and"].append(part)

    if 'description' in req:
        part = {"Description" : {"$regex" : ".*" + req['description'] + ".*", '$options' : 'i'}}
        query["$and"].append(part)

    if 'limit' not in req:
        req['limit'] = 100

    if int(req['limit']) > 1000:
        req['limit'] = 1000

    res = list(db.events.find(query).sort([("DetectTime", 1)]).limit(int(req['limit'])))

    return(json_util.dumps(res))


@app.route(C['events'] + 'agg', methods=['GET'])
@auth.required
def aggregate():
    req = request.args
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
            },
            {
                "$sort" : { "_id.Categories" : 1 } 
            }
        ]
        res = list(db.collection.aggregate(query))
        tmp = list()
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
                        }] # values
                    }) # data
        tmp = data


    return(json_util.dumps(tmp))

@app.route(C['events'] + 'top', methods=['GET'])
@auth.required
def top():
    # Get URL params
    req = request.args

    # Query date shifted by period set up in front-end
    time = datetime.utcnow() - timedelta(hours=int(req['period']))
    query = [
        {
            '$match' : {
                'DetectTime' : {'$gt' : time}
            }
        },
        {
            '$sort' : {'FlowCount' : -1}
        },
        {
            '$group' : {
                '_id' : '$Category',
                'FlowCount' : { '$first' : '$FlowCount' },
                'id' : {'$first' : '$_id'},
                'DetectTime' : {'$first' : '$DetectTime'}
            }
        },
        {
            '$unwind' : '$_id'
        }]
    res = list(db.collection.aggregate(query))
    return(json_util.dumps(res))

# Fetch event with given ID
@app.route(C['events'] + 'id/<string:id>', methods=['GET'])
@auth.required
def get_by_id(id):
    if request.method == 'GET':
        query = {
            '_id' : ObjectId(id)
        }
        
        res = db.collection.find_one(query)
    return(json_util.dumps(res))

@app.route(C['users'], methods=['GET', 'PUT'])
@auth.required
def get_users():
    if request.method == 'GET':
        res = list(db.users.find())

    if request.method == 'PUT':
        print('updating a user')
        user = request.get_json()
        token = auth.jwt_decode(request.headers.get('Authorization', None))
        
        res = db.users.find_one_and_update({'_id' : ObjectId(token['_id'])}, {"$set" : { 'settings' : user['settings'] }}, return_document=pymongo.ReturnDocument.AFTER)
        print(user)
    return(json_util.dumps(res))

@app.route(C['users'] + 'logout', methods=['DELETE'])
#@auth.required
def delete_user_session():
    print(request.headers)
    jwt = request.headers.get('Authorization', None)
    decoded_jwt = auth.jwt_decode(jwt)
    res = auth.delete_session(decoded_jwt['_id'])
    return(str(res))   

@app.route(C['events'] + 'whois/<string:ip>', methods=['GET'])
@auth.required
def whois(ip):
    p =Popen(['whois', ip], stdout=PIPE)
    tmp = ""
    for line in p.stdout:
        tmp += line.decode('utf-8')
    return(json.dumps({'output' : tmp }))


if __name__ == '__main__':
    # Start API as local server on given port
    app.run(host="0.0.0.0", port=int(C['api']['port']))


