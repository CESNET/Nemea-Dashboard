#!/usr/bin/env python3

import argparse

"""
Handle arguments
"""
parser = argparse.ArgumentParser(description="""REST API CESNET 2016.\n\n
		Authors: Petr Stehlik <stehlik@cesnet.cz>""", add_help=False)

parser.add_argument('--config', '-c', default='./config.ini', dest='config',
		help='Load given configuration file')
parser.add_argument('--help', '-h', help="Print this help", action='store_true',
		dest='help')

try:
	args = vars(parser.parse_args())

	if args['help']:
		parser.print_help()
		exit(0)
except:
	print("Failed to parse arguments")
	exit(1)

from api.Router import Router
app = Router(__name__)

# Own classes and helpers
#from geo import GeoIP
from api.auth import Auth
from api.config import Config

# Flask libraries
from flask import escape, request, Response, abort
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

"""
Load user config specified by an argument or in default path.
"""
config = Config(args, base_path = __path__[0])

if config["ssl"].getboolean("enabled"):
    context = ssl.SSLContext(ssl.PROTOCOL_TLSv1_2)
    context.load_cert_chain(config['ssl']['certificate'], config['ssl']['key'])

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

from api.dbConnector import dbConnector
db = dbConnector.from_object(config["database"])

auth = Auth(db, 'secret-super')
#geo = GeoIP('/data/geoIP/GeoLite2-lib/GeoLite2-City.mmdb')

app.config.from_object(config)

# Enable Cross-Origin
CORS(app)

@app.route('/')
def routes():
	routes = []
	for rule in app.url_map.iter_rules():
		routes.append({
			"name": rule.rule,
			"method": rule.methods,
			"desc" : rule.endpoint
		})

	print(json_util.dumps(routes, indent=4))
	return (json_util.dumps(routes))

import pkgutil
from api.module import Module

modules = pkgutil.iter_modules([config.module_path])

for importer, mod_name, _ in modules:
	if mod_name not in sys.modules:
		loaded_mod = __import__("api." +
				config['api']['modules'].split('/')[-1] + "." +  mod_name,
				fromlist=[mod_name])
		print("Imported module \"" + mod_name + "\"")

		for obj in vars(loaded_mod).values():
			if isinstance(obj, Module):
				app.register_blueprint(obj)
