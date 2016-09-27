from api import app, auth, db, config as conf
#from api.modules.nemea import nemea, config

# Own classes and helpers
#from geo import GeoIP

config = conf['api']

# Flask libraries
from flask import escape, request, Response, abort

from api.module import Module

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

# Register a blueprint
nemea = Module('nemea', __name__, url_prefix='/nemea')

# Create indexes
@nemea.route('/db/indexes', methods=['GET'])
#@auth.required
def indexes():
	print(config["events"])
	indexes = db.collection.index_information()
	for item in indexes.keys():
		if item == "DetectTime":
			print('indexes are here')
			return(json_util.dumps(indexes))
	db.collection.create_index([( "DetectTime", 1)])
	db.sessions.create_index([("expire", pymongo.ASCENDING), ("expireAfterSeconds", 60*60*24*30)])
	indexes = db.collection.index_information()
	return(json_util.dumps(indexes))

@nemea.route('/config', methods=['GET'])
@auth.required
def get_config():
	config = {
			'events' : config['events'],
			'users' : config['users'],
			'host' : config['api']['host'],
			'port' : config['api']['port']
			}
	return(json_util.dumps(config))

@nemea.route('/events/<int:items>', methods=['GET'])
@auth.required
def get_last(items):
	if items == 0:
		items = 100
	elif items > 10000:
		items = 10000
	docs = list(db.collection.find().sort( [( "DetectTime", -1)] ).limit(items))

	return (json_util.dumps(docs, default=json_util.default))

@nemea.route('/query', methods=['GET'])
@auth.required
def query():
	req = request.args.to_dict()

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


@nemea.route('/events/aggregate', methods=['GET'])
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

@nemea.route('/events/top', methods=['GET'])
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

@nemea.route('/events/count', methods=['GET'])
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
@nemea.route('/events/id/<string:id>', methods=['GET'])
@auth.required
def get_by_id(id):
	if request.method == 'GET':
		query = {
				'_id' : ObjectId(id)
				}

		res = db.collection.find_one(query)
	return(json_util.dumps(res))
