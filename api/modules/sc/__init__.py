from api import app, auth, db, config as conf
from api.module import Module
#from api.modules.nemea import nemea, config

# Own classes and helpers
#from geo import GeoIP

config = conf['api']

# Flask libraries
from flask import escape, request, Response, abort, Blueprint

# Register a blueprint
sc = Module('sc', __name__, url_prefix = '/sc')

from api.modules.sc.base import *

sc.add_url_rule('/', view_func = sc_hello, methods=['GET'])

