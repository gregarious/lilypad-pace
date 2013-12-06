"""
WSGI config for lilypad_server project.

This module contains the WSGI application used by Django's development server
and any production WSGI deployments. It should expose a module-level variable
named ``application``. Django's ``runserver`` and ``runfcgi`` commands discover
this application via the ``WSGI_APPLICATION`` setting.

Usually you will have the standard Django WSGI application here, but it also
might make sense to replace the whole Django WSGI application with a custom one
that later delegates to the Django one. For example, you could introduce WSGI
middleware here, or combine a Django application with an application of another
framework.

"""
import os

## Insert other deployment-specific env variables here ##
#
# (Note that all deployment-specific wsgi files are excluded from the
# repository because they contain
#
# os.environ['DJANGO_SETTINGS_MODULE'] = "lilypad_server.settings.<deployment>"
# os.environ['SECRET_KEY'] = "<RANDOM STRING>"
# os.environ['DATABASE_URL'] = "<DB URL>""

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "lilypad_server.settings")

# This application object is used by any WSGI server configured to use this
# file. This includes Django's development server, if the WSGI_APPLICATION
# setting points here.
from django.core.wsgi import get_wsgi_application
application = get_wsgi_application()

# Apply WSGI middleware here.
# from helloworld.wsgi import HelloWorldApplication
# application = HelloWorldApplication(application)
