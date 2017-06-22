from liberouterapi import app, db, config
from ..module import Module

config.load(path = __path__[0] + '/config.ini')

# We need collection for NEMEA Events and Dashboard to be set up
nemea_db = db.socket[config.modules['nemea']['database']]
nemea = nemea_db[config.modules['nemea']['collection']]

# Register a blueprint
nemea_bp = Module('nemea', __name__, url_prefix = '/nemea', no_version=True)

from .events import *
from .Query import query
from .Stats import aggregate, top, count
from .Reporters import *

# Create index for DetectTime
nemea_bp.add_url_rule('/indexes', view_func = indexes, methods=['GET'])

# Get last N events
nemea_bp.add_url_rule('/events/<int:items>', view_func = get_last_events, methods=['GET'])

# Create a query based on GET params
nemea_bp.add_url_rule('/events/query', view_func = query, methods=['GET'])

# Aggregate stats about recent events specified by time range
nemea_bp.add_url_rule('/events/aggregate', view_func = aggregate, methods=['GET'])

# Get TOP events from each category
nemea_bp.add_url_rule('/events/top', view_func = top, methods=['GET'])

# Count events in given time window
nemea_bp.add_url_rule('/events/count', view_func = count, methods=['GET'])

# Get an event by its ID
nemea_bp.add_url_rule('/events/id/<string:id>', view_func = get_by_id, methods=['GET'])

# Whois lookup (unused)
nemea_bp.add_url_rule('/whois/<string:ip>', view_func = whois, methods=['GET'])

nemea_bp.add_url_rule('/reporters/config', view_func = get_nr_config, methods=['GET'])
nemea_bp.add_url_rule('/reporters/config', view_func = edit_nr_config, methods=['PUT'])
