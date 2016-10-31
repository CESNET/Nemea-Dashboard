#!/usr/bin/env python3

# Own classes and helpers
from api import db, auth, config

# System tools
from subprocess import Popen, PIPE, check_output

# Date manipulations
from datetime import date, datetime, timedelta
from time import mktime

# MongoDB data manipulation
from bson import json_util
from bson.objectid import ObjectId

@auth.required()
def indexes():
	"""
	Check for available indexes in database and recreate them
	"""
    indexes = db.collection.index_information()
    for item in indexes.keys():
        if item == "DetectTime":
            print('indexes are here')
            return(json_util.dumps(indexes))
    db.collection.create_index([( "DetectTime", 1)])
    indexes = db.collection.index_information()
    return(json_util.dumps(indexes))

@auth.required()
def get_last_events(items):
    if items == 0 or items > 10000:
        items = 100
    docs = list(nemea.find().sort( [( "DetectTime", -1)] ).limit(items))

    return(json_util.dumps(docs))

@auth.required()
def query():

    req = request.args.to_dict()

    query = {
        "$and" : []
    }

    if 'from' in req:
        query["$and"].append({
        	"DetectTime" : {
        		"$gte" : datetime.strptime(req["from"],"%Y-%m-%dT%H:%M:%S.%fZ")
        	}
        })

    if 'to' in req:
        query["$and"].append({
        	"DetectTime" : {
        		"$lt" : datetime.strptime(req["to"],"%Y-%m-%dT%H:%M:%S.%fZ")
        	}
        })

    if 'category' in req:
        query["$and"].append({
        	"Category" : {
        		"$regex" : ".*" + req['category'] + ".*", '$options' : 'i'
        	}
        })

    if 'description' in req:
        query["$and"].append({
			"Description" : {
				"$regex" : ".*" + req['description'] + ".*", '$options' : 'i'
			}
		})

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
        query["$and"].append({
        	"Source.IP4" : req['srcip']
        })

    if 'dstip' in req:
        query["$and"].append({
        	"Target.IP4" : req['dstip']
        })

    res = list(nemea.find(query).sort([(orderby, dir)]).limit(int(req['limit'])))

    res.append({'total' : nemea.find(query).limit(10000).count(True)})

    return(json_util.dumps(res))


@auth.required()
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

		# print(str(tmp))
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

@auth.required()
def top():
    # Get URL params
    req = request.args

    # Query date shifted by period set up in front-end
	#time = datetime.utcnow() - timedelta(hours=int(req['period']))
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

@auth.required()
def count():
    req = request.args.to_dict()

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
@auth.required()
def get_by_id(id):
	query = {
		'_id' : ObjectId(id)
	}

	res = db.collection.find_one(query)
    return(json_util.dumps(res))

#@auth.required
def whois(ip):
    p = Popen(['whois', ip], stdout=PIPE)
    tmp = ""
    for line in p.stdout:
        tmp += line.decode('utf-8')
    return(json_util.dumps({'output' : tmp }))
