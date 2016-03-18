import sys

sys.path.append('/Users/petrstehlik/dev/Nemea-Dashboard')

activate_this = '/Users/petrstehlik/dev/Nemea-Dashboard/venv/bin/activate_this.py'
execfile(activate_this, dict(__file__=activate_this))

from apiv2 import app as application
