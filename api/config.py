import configparser
from api import app

class Config(object):
	"""
	@class Config
	@brief Handle configuration properties and set default values
	"""

	PROPAGATE_EXCEPTIONS = True

	version = 'v1'

	def __init__(self, args):
		"""
		Load configuration
		"""
		app.logger.debug("Loading user configuration")
		self.config = configparser.ConfigParser()

		self.config.read(args['config'])

		self.DEBUG = self.config["api"].getboolean("debug", True)
		self.HOST = self.config["api"].get("host", "localhost")
		self.PORT = self.config["api"].getint("port", 8000)
		self.THREADED = self.config["api"].getboolean("threaded", True)
		self.SECRET_KEY = self.config["api"].get("secret_key", "")

		self.create_urls()

	def create_urls(self):
		"""
		Create URIs for main parts of API
		* events Construct a base URI for events
		*
		"""
		self.events = '/' + self.version + '/events/'
		self.users = '/' + self.version + '/users/'

	def __getitem__(self, key):
		if key == "users":
			return self.users
		elif key == "events":
			return self.users
		else:
			return self.config[key]
