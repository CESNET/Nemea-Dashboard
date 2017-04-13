from liberouterapi import auth
import json

from liberouterapi.modules.nemea_status import get_topology

def get_reporters():
    """Fetch all reporters using NEMEA Supervisor's supcli
    """
    try:
        res = get_topology()
    except Exception as e:
        print(e)
        return(json.dumps({
            "error" : True,
            "msg" : str(e)
            }))
    return("")

@auth.required()
def protected_hello():
	return("Protected hello")
