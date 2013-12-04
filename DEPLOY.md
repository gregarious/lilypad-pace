# Apache deployment instructions (on Kettle)

- Create directory structure:
      site-root/
        lilypad-pace/   # repository
        assets/
            static/
            media/      # (if using media, Apache user must have write-access to assets/media)
        var/            # system-writeable files (Apache user must have write-access)
            log/
        venv/           # virtualenv, create using `virtualenv venv`
        ssl/            # should include files listed in ssl options below

- Use the following for httpd.conf settings for the virtual host (replace all of the [[PLACEHOLDER]] tags):

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

    ## SSL configuration (disabled currently) ##
    # SSLEngine on
    # SSLCertificateKeyFile [[SITE-ROOT]]/ssl/ssl.key/server.key
    # SSLCertificateFile [[SITE-ROOT]]/ssl/ssl.crt/pace.lilypadcmu.com_cert.cer
    # SSLCertificateChainFile [[SITE-ROOT]]/ssl.crt/pace.lilypadcmu.com_interm.cer

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
