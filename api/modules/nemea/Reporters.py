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

# Python 2 fix for FileNotFoundError
try:
    FileNotFoundError
except NameError:
    FileNotFoundError = IOError

class ReporterError(ApiException):
    status_code = 500

if 'reporters_config' not in config['nemea']:
    raise ReporterError("missing path to reporters configuration file 'reporters_config'")
else:
    rc_path = config['nemea']['reporters_config']

def get_nr_config():
    rconf = None
    try:
        with open(rc_path) as f:
            try:
                rconf = yaml.load(f)
            except Exception as e:
                raise ReporterError("Error while parsing config file")
    except FileNotFoundError as e:
        # report not found file with absolute path
        raise ReporterError("File %s not found" % os.path.abspath(config['nemea']['reporters_config']),
                status_code = 404)
    except Exception as e:
        raise ReporterError(str(e))

    return(json.dumps(rconf))

def edit_nr_config():
    """
    Receive JSON formatted reporter config and dump it as YAML in desired location
    This creates the file if needed
    """
    conf = request.get_json()
    with open(rc_path, 'w') as yf:
        # must use safe_dump and encoding for Python 2
        # https://stackoverflow.com/questions/20352794/pyyaml-is-producing-undesired-python-unicode-output
        yaml.safe_dump(conf, yf,
                default_flow_style=False, indent = 4, encoding='utf-8', allow_unicode=True)

    return json.dumps(conf)

