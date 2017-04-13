from liberouterapi import app
from ..module import Module

# Register a blueprint
module_bp = Module('nemea_reporters', __name__, url_prefix = '/nemea/reporters', no_version=True)

from .base import *

module_bp.add_url_rule('', view_func = get_reporters, methods=['GET'])
module_bp.add_url_rule('/protected', view_func = protected_hello, methods=['GET'])
