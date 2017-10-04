from liberouterapi import auth, config
from .events import EventsException

from bson import json_util
from bson.objectid import ObjectId
from flask import request
from datetime import datetime

from liberouterapi.dbConnector import dbConnector

nemea = dbConnector("nemea")
nemea = nemea.db[config['nemea']['collection']]

"""
NEMEA Events Query Endpoint

Build up a query specified by GET parameters.

Fields available are very limited.

TODO: make it universal for any kind of key:value pair
"""

@auth.required()
def query():
	req = request.args.to_dict()

	if req == {}:
		raise EventsException("missing required arguments")

	query = {
			"$and" : []
			}

	if 'from' in req:
		query["$and"].append({
			"DetectTime" : {
				"$gte" : datetime.utcfromtimestamp(int(req["from"]))
				}
			})

	if 'to' in req:
		query["$and"].append({
			"DetectTime" : {
				"$lt" : datetime.utcfromtimestamp(int(req["to"]))
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

	"""
	The key by which we should order the results.

	Default: DetectTime (we know that DetectTime will always be there)
	"""
	if 'orderby' in req:
		orderby = str(req['orderby'])
	else:
		orderby = 'DetectTime'

	"""
	Search for IPv4 in Source
	"""
	if 'srcip' in req:
		query["$and"].append({
			"Source.IP4" : req['srcip']
			})

	"""
	Search for IPv4 in Target
	"""
	if 'dstip' in req:
		query["$and"].append({
			"Target.IP4" : req['dstip']
			})

	res = list(nemea.find(query).sort([(orderby, dir)]).limit(int(req['limit'])))

	res.append({'total' : nemea.find(query).limit(int(req['limit']) + 1).count(True)})

	return(json_util.dumps(res))

