#!/usr/bin/env python3

# Own classes and helpers
from config import Config
#from geo import GeoIP
from dbConnector import dbConnector
from auth import Auth

# Flask libraries
from flask import Flask, escape, request, Response, abort
from flask.ext.cors import CORS
import ssl

# System tools
import sys
from subprocess import Popen, PIPE, check_output

# Date manipulations
from datetime import date, datetime, timedelta
from time import mktime

# MongoDB data manipulation
from bson import json_util
from bson.objectid import ObjectId
import pymongo

# Load config.json
config = Config()
C = config.data

if C["ssl"]:
    context = ssl.SSLContext(ssl.PROTOCOL_TLSv1_2)
    context.load_cert_chain(C['ssl_crt'], C['ssl_key'])

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
        return(json_util.dumps(self.base))

    def success(self, data):
        self.base['data'] = data
        return(json_util.dumps(self.base))

ret = jsonReturn()


db = dbConnector()

auth = Auth(db, 'secret-super')
geo = GeoIP('/data/geoIP/GeoLite2-lib/GeoLite2-City.mmdb')

app = Flask(__name__)
app.config['DEBUG'] = C['debug']
app.config['PROPAGATE_EXCEPTIONS'] = True;
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
    print(auth_user)
    
    # Attach JWT for further authentication
    auth_user['jwt'] = auth.jwt_create({
        'username' : auth_user['username'],
        'name' : auth_user.get('name', ""),
        'surname' : auth_user.get('surname', ""),
        'email' : auth_user.get('email', ""),
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
            return(json_util.dumps(indexes))
    db.collection.create_index([( "DetectTime", 1)])
    db.sessions.create_index([("expire", pymongo.ASCENDING), ("expireAfterSeconds", 60*60*24*30)])
    indexes = db.collection.index_information()
    return(json_util.dumps(indexes))

@app.route('/config', methods=['GET'])
@auth.required
def get_config():
    config = {
        'events' : C['events'],
        'users' : C['users'],
        'host' : C['api']['host'],
        'port' : C['api']['port']
    }
    return(json_util.dumps(config))

@app.route(C['events'] + '<int:items>', methods=['GET'])
@auth.required
def get_last(items):
    if items == 0 or items > 10000:
        items = 100
    docs = list(db.collection.find().sort( [( "DetectTime", -1)] ).limit(items))
    
    return (json_util.dumps(docs, default=json_util.default))

@app.route(C['events'] + 'query', methods=['GET'])
@auth.required
def query():
    req = request.args

    req = req.to_dict()

    query = {
        "$and" : []
    }
    
    if 'from' in req:
        part = {"DetectTime" : {"$gte" : datetime.strptime(req["from"],"%Y-%m-%dT%H:%M:%S.%fZ")}}
        query["$and"].append(part)

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

    if 'dir' in req:
        dir = int(req['dir'])
    else:
        dir = 1 # Sort from the start of query results

    if 'orderby' in req:
        orderby = str(req['orderby'])
    else:
        orderby = 'DetectTime'

    if 'srcip' in req:
        part = {"Source.IP4" : req['srcip']}
        query["$and"].append(part)
    
    if 'dstip' in req:
        part = {"Target.IP4" : req['dstip']}
        query["$and"].append(part)

    res = list(db.events.find(query).sort([(orderby, dir)]).limit(int(req['limit'])))

    res.append({'total' : db.events.find(query).limit(10000).count(True)})

    return(json_util.dumps(res))


@app.route(C['events'] + 'agg', methods=['GET'])
@auth.required
def aggregate():
    req = request.args
    
    if req['type'] == 'piechart':
        match = {
            "$match" : {
                "$and" : [
                    { "DetectTime" : {
                        #"$gte" : datetime.strptime(req["begintime"], "%Y-%m-%dT%H:%M:%S.%fZ"),
                        "$gte" : datetime.utcfromtimestamp(int(req["begintime"])),
                        #"$lte" : datetime.strptime(req["endtime"], "%Y-%m-%dT%H:%M:%S.%fZ")
                        "$lte" : datetime.utcfromtimestamp(int(req["endtime"]))
                    }}
                ]
            }
        }
        
        # Custom filter is set
        if req.get("filter", False):
            match["$match"]["$and"].append({ req["filter_field"] : req["filter_value"]})

        group = {
            "$group" : {
                "_id" : {
                    req["metric"] : "$" + req["metric"]
                },
                "count" : { "$sum" : 1}
            }
        }
        sort = {
            "$sort" : { "_id." + req["metric"] : 1 } 
        }
        
        res = list(db.collection.aggregate([match, group, sort]))
        tmp = list()
        
        for item in res:
            tmp.append({
                "key" : item["_id"][req["metric"]],
                "x" : item["count"]
            })

        print(str(tmp))
    elif req['type'] == "barchart":
        time = datetime.utcfromtimestamp(int(req['begintime']))
        query = [
            {
                "$match" : {
                    "DetectTime" : { 
                        "$gte" : time,
                        "$lte" : datetime.utcfromtimestamp(int(req["endtime"]))
                    }
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
                    serie['values'].append({
                        'x' : mktime(item['_id']['DetectTime'].timetuple())*1000, 
                        'FlowCount' : item['FlowCount'], 
                        'Count' : item['Count']
                    })
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
                'DetectTime' : {
                    '$gt' : datetime.utcfromtimestamp(int(req["begintime"])),
                    '$lte' : datetime.utcfromtimestamp(int(req["endtime"]))
                }
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

@app.route(C['events'] + 'count', methods=['GET'])
@auth.required
def events_count():
    req = request.args
    req = req.to_dict()

    query = {
        "$and" : [
            {
                "DetectTime" : {
                    "$gte" : datetime.utcfromtimestamp(int(req["begintime"])),
                    "$lte" : datetime.utcfromtimestamp(int(req["endtime"]))
                }
            }    
        ]
    }

    if req["category"] != "any":
        part = { "Category" : req["category"]}
        query["$and"].append(part)

    res = db.events.find(query).count()
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

@app.route(C['users'], methods=['GET', 'PUT', 'POST', 'DELETE'])
@auth.required
def get_users():
    if request.method == 'GET':
        res = list(db.users.find())
        
        # Remove password hash from the resulting query
        for user in res:
            user.pop("password", None)
        return(json_util.dumps(res))

    # Create user
    if request.method == 'POST':
        user_data = request.get_json()
        hash = auth.create_hash(user_data["password"])
        user_data["password"] = hash

        res = db.users.insert(user_data)
        return(json_util.dumps(res))

    if request.method == 'DELETE':
        req = request.args
        req = req.to_dict()
        #print(req["userId"])
        res = db.users.delete_one({"_id" : ObjectId(req["userId"])})
        return(json_util.dumps(res.deleted_count))

    if request.method == 'PUT':
        user = request.get_json()
        #print(user)
        token = auth.jwt_decode(request.headers.get('Authorization', None))
        user_info = auth.get_session(token['_id'])
        
        # Create basic query for user updating
        query = {
            "$set" : { 
                'settings' : user['settings']
            }
        }

        # If the user updates their profile check for all fields to be updated
        if "name" in user:
            query["$set"]["name"] = user["name"]

        if "surname" in user:
            query["$set"]["surname"] = user["surname"]
        
        if "email" in user:
            query["$set"]["email"] = user["email"]

        # In case of password change, verify that it is really him (revalidate their password)
        if "password" in user:
            verify = auth.login(user["username"], user["password"])
            # This is really stupid, I have to change it
            # TODO: better password verification returning values
            if verify != 0 and verify != 1:
                hash = auth.create_hash(user["password_new"])
                query["$set"]["password"] = hash
            else:
                return (json_util.dumps( {'error' : auth.errors[str(verify)]}), 403)

        # The query is built up, lets update the user and return updated document
        res_raw = db.users.find_one_and_update(
            {'_id' : ObjectId(user_info['user_id'])}, 
            query,
            return_document=pymongo.ReturnDocument.AFTER)

        # Remove password hash from the response
        res = res_raw.pop("password", None)

        jwt_res = auth.jwt_create({
            'username' : res_raw['username'],
            'name' : res_raw.get('name', ""),
            'surname' : res_raw.get('surname', ""),
            'email' : res_raw.get('email', ""),
            '_id' : str(token['_id']),           # Keep the same session ID!
            'created' : mktime(datetime.utcnow().timetuple())
        })

        return(json_util.dumps({"jwt" : jwt_res}))

@app.route(C['users'] + 'logout', methods=['DELETE'])
@auth.required
def delete_user_session():
    #print(request.headers)
    jwt = request.headers.get('Authorization', None)
    decoded_jwt = auth.jwt_decode(jwt)
    res = auth.delete_session(decoded_jwt['_id'])
    return(str(res))   

@app.route(C['events'] + 'whois/<string:ip>', methods=['GET'])
#@auth.required
def whois(ip):
    p =Popen(['whois', ip], stdout=PIPE)
    tmp = ""
    for line in p.stdout:
        tmp += line.decode('utf-8')
    return(json_util.dumps({'output' : tmp }))


if __name__ == '__main__':
    # Start API as local server on given port
    if C['ssl']:
        app.run(host="0.0.0.0", port=int(C['api']['port']), ssl_context=context)
    else:
        app.run(host="0.0.0.0", port=int(C['api']['port']), threaded=True)


