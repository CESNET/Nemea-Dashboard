#!/usr/bin/env python3
# System tools
from subprocess import Popen, PIPE, check_output

# Date manipulations
from datetime import date, datetime, timedelta
from time import mktime

# MongoDB data manipulation
from bson import json_util
from bson.objectid import ObjectId

from flask import request

# Own classes and helpers
from liberouterapi import db, auth, config
from liberouterapi.error import ApiException

from liberouterapi.dbConnector import dbConnector

nemea = dbConnector("nemea")
nemea = nemea.db[config['nemea']['collection']]

class EventsException(ApiException):
	status_code = 400

#@auth.required()
def indexes():
	"""
	Check for available indexes in database and recreate them
	"""
	indexes = nemea.index_information()
	for item in indexes.keys():
		if item == "DetectTime":
			print('indexes are here')
			return(json_util.dumps(indexes))
	nemea.create_index([( "DetectTime", 1)])
	indexes = nemea.index_information()
	return(json_util.dumps(indexes))

"""
Find N last events
"""
#@auth.required()
def get_last_events(items):
    if items <= 0 or items > 10000:
        items = 100
    print(nemea)
    events = list(nemea.find().sort( [( "DetectTime", -1)] ).limit(items))

    return(json_util.dumps(events))

# Fetch event with given ID
@auth.required()
def get_by_id(id):
	query = {
		'_id' : ObjectId(id)
	}

	res = nemea.find_one(query)
	return(json_util.dumps(res))

#@auth.required
def whois(ip):
    p = Popen(['whois', ip], stdout=PIPE)
    tmp = ""
    for line in p.stdout:
        tmp += line.decode('utf-8')
    return(json_util.dumps({'output' : tmp }))
