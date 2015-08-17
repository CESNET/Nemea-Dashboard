MONGO_HOST = 'localhost'
MONGO_PORT = 27017
MONGO_DBNAME = 'test_corr_db'


DOMAIN = {
    'test_corr_db': {
    	'url' : 'events',
        'schema': {
            'type': {
                'type': 'string'
            },
            'scale': {
                'type': 'string'
            },
            'time_first': {
                'type': 'string',
            }
        }
    }
}