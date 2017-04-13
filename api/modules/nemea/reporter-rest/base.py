from liberouterapi import auth
import json
import re

from liberouterapi.modules.nemea_status import get_topology

# Regex to find the argument --config and its content
config_regex = r"(?<=--config=)(.*)\s"

def get_reporters():
    """Fetch all reporters using NEMEA Supervisor's supcli
    """
    reporters = []
    try:
        res = get_topology()

        # Output only *2idea modules and try to find the config file path
        for module in res:
            if "2idea" in module[0]:
                m = re.search(config_regex, module[1]["params"])
                if m is not None:
                    module[1]["config_path"] = m.group(1)
                reporters.append(module)
        return(reporters)
    except Exception as e:
        print(e)
        return(json.dumps({
            "error" : True,
            "msg" : str(e)
            }))

@auth.required()
def protected_hello():
	return("Protected hello")
