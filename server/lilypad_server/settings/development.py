import os

from lilypad_server.settings.base import *

DEBUG = True
TEMPLATE_DEBUG = DEBUG

# add app files
STATICFILES_DIRS = (
    os.path.join(
    	os.path.dirname(PROJECT_ROOT),	# want to be in repo root
    	'client/'
	),
)

SECRET_KEY = '#zj7j&amp;gk#mklul&amp;pv@%8nq*a2937_d@jfqrhz6nn18!=@w1k^&amp;'
