# Apache deployment instructions (on Kettle)

## Create directory structure

Perform the following steps in the root site directory (currently `pace.lilypadcmu.com` on Kettle).

1. Create the public asset directories for static file serving:
        mkdir -p assets/static
        mkdir assets/media

    Currently, there is no need for uploaded media in the app, but if that ever happens, Apache
    will need write access to the `assets/media/` directory.

2. Create the var directory for server-writable files (currently just Apache error log):

        mkdir -p var/log

    Apache needs write access to this `var/log` directory.

3. Check out repository:

        git clone https://github.com/gregarious/lilypad-pace.git

4. Create virtualenv for third-party package installation:

        virtualenv venv

5. Create ssl directories:

        mkdir -p ssl/ssl.key
        mkdir ssl/ssl.csr

    Ensure only Apache has read access to the `ssl/ssl.key` directory. Then copy the various
    certificate/key files necessary for SSL support to work (see the Apache host config template
    below for the file names).

## Configure the application

1. Check out the `deploy` branch:

        cd lilypad-pace
        git checkout deploy

2. Install the required third party packages in the virtual env:

        . ../venv/bin/activate
        pip install -r requirements/production_kettle.txt

3. Create a virtual host entry for Apache with the following configuration settings. *Be sure to replace all of the tags in double square brackets (e.g. `[[SITE-ROOT]]`).*

        ## Basic vhost/wsgi config ##

        ServerName pace.lilypadcmu.com
        ErrorLog [[SITE-ROOT]]/var/log/apache.error.log

        WSGIScriptAlias / [[SITE-ROOT]]/lilypad-pace/server/lilypad_server/wsgi.py
        WSGIPythonPath [[SITE-ROOT]]/lilypad-pace/server:[[SITE-ROOT]]/venv/lib/python2.7/site-packages

        # allow access to only root wsgi application file
        <Directory [[SITE-ROOT]]/lilypad-pace/server/lilypad_server>
        <Files wsgi.py>
        Order deny,allow
        Allow from all
        </Files>
        </Directory>

        ## SSL configuration ##
        SSLEngine on
        SSLCertificateKeyFile /usr0/wwwsrv/pace.lilypadcmu.com/ssl/ssl.key/pace.lilypadcmu.com.key
        SSLCertificateFile /usr0/wwwsrv/pace.lilypadcmu.com/ssl/ssl.crt/pace.lilypadcmu.com_cert.cer
        SSLCertificateChainFile /usr0/wwwsrv/pace.lilypadcmu.com/ssl/ssl.crt/pace.lilypadcmu.com_interm.cer

        ## App-specific configuration ##

        # aliases for assets which we'll serve with the same vhost
        Alias /robots.txt [[SITE-ROOT]]/assets/static/robots.txt
        Alias /favicon.ico [[SITE-ROOT]]/assets/static/favicon.ico
        Alias /static/ [[SITE-ROOT]]/assets/static/
        Alias /media/ [[SITE-ROOT]]/assets/media/

        <Directory [[SITE-ROOT]]/assets/static/>
        Order deny,allow
        Allow from all
        </Directory>

        <Directory [[SITE-ROOT]]/assets/media/>
        Order deny,allow
        Allow from all
        </Directory>

        # environment variables
        SetEnv DATABASE_URL [[DATABASE-CONNECTION-URL]]
        SetEnv SECRET_KEY [[RANDOM-CHARACTER-STRING]]
