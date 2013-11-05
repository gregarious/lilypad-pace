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
