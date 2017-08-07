"""
Advanced reporter configuration module

This module retrieves configuration in YAML format and converts it to JSON

There is only PUT method for editing the configuration

Path to configuration is specified in config.ini in this folder.
"""
from liberouterapi import config
from liberouterapi.error import ApiException
from bson import json_util as json
import yaml
from flask import request
import os

class ReporterError(ApiException):
    status_code = 500

if 'reporters_config' not in config.modules['nemea']:
    if 'reporters_config' not in config['nemea']:
        raise ReporterError("missing path to reporters configuration file 'reporters_config'")
    else:
        rc_path = config['nemea']['reporters_config']
else:
    rc_path = config.modules['nemea']['reporters_config']

def get_nr_config():
    rconf = None
    try:
        with open(rc_path) as f:
            try:
                rconf = yaml.load(f)
            except Exception as e:
                raise ReporterError("Error while parsing config file")
    except FileNotFoundError as e:
        raise ReporterError("File %s not found" % config.modules['nemea']['reporters_config'],
                status_code = 404)
    except Exception as e:
        raise ReporterError(str(e))

    return(json.dumps(rconf))

def edit_nr_config():
    conf = request.get_json()
    with open(rc_path, 'w') as yf:
        yaml.dump(conf, yf, default_flow_style=False, indent = 4)

    return json.dumps(conf)

