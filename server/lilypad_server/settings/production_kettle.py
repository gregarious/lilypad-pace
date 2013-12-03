import os
from django.core.exceptions import ImproperlyConfigured

# get SECRET_KEY from application environment (should be set up in Apache
# virtual host settings)
if os.environ.get('SECRET_KEY') is None:
    raise ImproperlyConfigured('Must define environment variable named SECRET_KEY')
SECRET_KEY = os.environ['SECRET_KEY']

from lilypad_server.settings.base import *

# TODO: make False
DEBUG = True
TEMPLATE_DEBUG = DEBUG

# static root is directory above repository, collectstatic moves things there
STATIC_ROOT = os.path.join(
                os.path.dirname(                    # Apache vhost site root (lilypadcmu.com/)
                    os.path.dirname(PROJECT_ROOT)),     # repo root
                'static/')


WSGIScriptAlias / /usr0/wwwsrv/lilypadcmu.com/lilypad-pace/server/lilypad_server/wsgi.py
WSGIPythonPath /path/to/mysite.com

<Directory /path/to/mysite.com/mysite>
<Files wsgi.py>
Order deny,allow
Allow from all
</Files>
</Directory>