import os
from django.core.exceptions import ImproperlyConfigured

# get SECRET_KEY from application environment (should be set up in Apache
# virtual host settings)
if os.environ.get('SECRET_KEY') is None:
    raise ImproperlyConfigured('Must define environment variable named SECRET_KEY')
SECRET_KEY = os.environ['SECRET_KEY']

from lilypad_server.settings.base import *

DEBUG = False
TEMPLATE_DEBUG = DEBUG

# required setting for production mode in Django 1.5+
ALLOWED_HOSTS = ['pace.staging.lilypadcmu.com',]

# static root is directory above repository, collectstatic moves things there
STATIC_ROOT = os.path.join(
                os.path.dirname(                    # Apache vhost site root (lilypadcmu.com/)
                    os.path.dirname(PROJECT_ROOT)),     # repo root
                'assets/static/')
