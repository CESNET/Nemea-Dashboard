import os
import json
class Config:
    def __init__(self):
        self.raw_data = open(os.path.dirname(os.path.abspath(__file__)) + "/config.json").read()
        self.data = json.loads(self.raw_data)
        self.create_urls()

    def create_urls(self):
        self.data['events'] = '/' + self.data['api']['version'] + '/events/'
        self.data['users'] = '/' + self.data['api']['version'] + '/users/'

