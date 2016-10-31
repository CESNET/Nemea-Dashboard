from api import app, db, config
from api.module import Module

nemea_db = db.db[config['nemea']['database']]
nemea = nemea_db[config['nemea']['collection']]

# Register a blueprint
nemea_bp = Module('module', __name__, url_prefix = '/nemea', no_version=True)

from api.modules.nemea.events import *

nemea_bp.add_url_rule('/indexes', view_func = indexes, methods=['GET'])
nemea_bp.add_url_rule('/events/<int:items>', view_func = get_last_events, methods=['GET'])
nemea_bp.add_url_rule('/events/query', view_func = query, methods=['GET'])
nemea_bp.add_url_rule('/events/agg', view_func = aggregate, methods=['GET'])
nemea_bp.add_url_rule('/events/top', view_func = top, methods=['GET'])
nemea_bp.add_url_rule('/events/count', view_func = count, methods=['GET'])
nemea_bp.add_url_rule('/events/id/<string:id>', view_func = get_by_id, methods=['GET'])
nemea_bp.add_url_rule('/whois/<string:ip>', view_func = whois, methods=['GET'])
