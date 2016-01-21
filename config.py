CONFIG = {
	'db' : {
        'host' : 'localhost',
		'port' : 27017,
		'database' : 'nemeadb',
        'collection' : {
            'events' : 'alerts',
            'users' : 'users'
        },
		'user' : None,
		'password' : None,
	},
	#'unix_socket' : '/Applications/MAMP/tmp/mysql/mysql.sock'
	'debug' : True,
	'version' : '/v2'
}
