from liberouterapi import auth
from ..nemea import nemea

from bson import json_util
from bson.objectid import ObjectId
from flask import request
from datetime import datetime

@auth.required()
def aggregate():
	req = request.args.to_dict()

	match = {
			"$match" : {
				"$and" : [
					{ "DetectTime" : {
						"$gte" : datetime.utcfromtimestamp(int(req["begintime"])),
						"$lte" : datetime.utcfromtimestamp(int(req["endtime"]))
						}}
					]
				}
			}

	tmp = list()

	if req['type'].lower() == 'piechart':
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

		res = list(nemea.aggregate([match, group, sort]))

		for item in res:
			tmp.append({
				"key" : item["_id"][req["metric"]],
				"x" : item["count"]
				})

	elif req['type'] == "barchart":
		project = {
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
				}

		group = {
				"$group" : {
					"_id" : {
						"DetectTime" : "$res",
						"Category" : "$Category"
						},
					"Count" : {"$sum" : 1},
					"FlowCount" : {"$sum" : "$FlowCount"}
					}
				}

		sort = { "$sort" : { "_id.DetectTime" : 1, "_id.Category" : 1 } }

		res = list(nemea.aggregate([match, project, group, sort]))
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
	req = request.args.to_dict()

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
				}
			]
	res = list(nemea.aggregate(query))
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

	res = nemea.find(query).count()
	return(json_util.dumps(res))
