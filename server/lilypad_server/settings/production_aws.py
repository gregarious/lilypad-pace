import os
from django.core.exceptions import ImproperlyConfigured

# AWS only makes DB creds available as custom environment vbls. Need
# to massage them into DATABASE_URL before importing base settings.
os.environ['DATABASE_URL'] = "mysql://%s:%s@%s:%s/%s" % (
	os.environ['RDS_USERNAME'],
	os.environ['RDS_PASSWORD'],
	os.environ['RDS_HOSTNAME'],
	str(os.environ['RDS_PORT']),
	os.environ['RDS_DB_NAME']
)

# get SECRET_KEY from application environment (should be set
# in .elasticbeanstalk/optionsettings.lilypad-pace-env)
if os.environ.get('SECRET_KEY') is None:
    raise ImproperlyConfigured('Must define environment variable named SECRET_KEY')
SECRET_KEY = os.environ['SECRET_KEY']

from lilypad_server.settings.base import *

# TODO: make False
DEBUG = True
TEMPLATE_DEBUG = DEBUG

# The next two settings should match the key/value pair set in
# `lilypad-server.config` for the namespace
# `aws:elasticbeanstalk:container:python:staticfiles`

# Should be the path matching the `option_name`
STATIC_URL = '/static/'

# Should be the directory matching the `value` setting
STATIC_ROOT = os.path.join(
				os.path.dirname(		# lilypad-pace/ (repo root)
					os.path.dirname(		# server/ (project root)
						os.path.dirname(		# lilypad_server/ (configuration app root)
							os.path.dirname(		# settings/
								os.path.abspath(__file__))))),
				'client/')
