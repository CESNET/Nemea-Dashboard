import pymongo
import sys
from config import Config


config = Config()
C = config.data


class dbConnector(object):
    host = C["db"]["host"]
    port = C["db"]["port"]
    dbName = C["db"]["database"]
    eventsCollection = C["db"]["collection"]["events"]
    usersCollection = C["db"]["collection"]["users"]
    sessionsCollection = C["db"]["collection"]["sessions"]
    collection = None
    users = None
    events = None
    sessions = None
    db = None
    socket = None

    def __init__(self, host = None, port = None, db = None, events = None, users = None, sessions = None):

        # Setup host and port for DB 
        if host != None and port != None:
            self.host = host
            self.port = port
        
        # Set up database name
        if db != None:
            self.dbName = db
        
        # Set up events collection
        if events != None:
            self.eventsCollection = events

        # Set up users collection
        if users != None:
            self.usersCollection = users

        # Connect to database and bind events and users collections 
        try:
            self.socket = pymongo.MongoClient(self.host, self.port, serverSelectionTimeoutMS=100)
            
            # Try to print out server info
            # This raises ServerSelectionTimeoutError
            self.socket.server_info()
            
            self.db = self.socket[self.dbName]
            self.collection = self.events = self.db[self.eventsCollection]
            self.users = self.db[self.usersCollection]
            self.sessions = self.db[self.sessionsCollection]

        # Small trick to catch exception for unavailable database
        except pymongo.errors.ServerSelectionTimeoutError as err:
            print(err)
            sys.exit()

#END db

