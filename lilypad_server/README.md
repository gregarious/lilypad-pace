# Lilypad Server

A Django-based HTTP server hosting the Lilypad API.

## Server Installation (for dev machines)

1.  Install `virtualenv` (installation docs: [Mac](http://docs.python-guide.org/en/latest/starting/install/osx/#virtualenv) / [Windows](http://docs.python-guide.org/en/latest/starting/install/win/#virtualenv)) and `virtualenvwrapper` ([installation docs](http://virtualenvwrapper.readthedocs.org/en/latest/install.html)).
    - If you don't have `pip` installed, [see the full guide](http://docs.python-guide.org/en/latest/#getting-started)
      for a great how-to on the best way to set up a local Python installation.

2. Create a new virtual environment for Lilypad:

        $ mkvirtualenv lilypad

3. Install dependencies into the new environment:

        $ pip install -r requirements.txt

4. Three environment variables need to be set:
    1. `DJANGO_SETTINGS_MODULE`: tells any Django process which settings file to use.
    2. `DATABASE_URL`: declares the local DB configuration. You'll need to set up the backend on your own. The simplest option is using SQLite.
    3. `CLIENT_APP_PARENT`: the directory that houses various client-side app repositories. See the note below.

    The recommended way to do this (for development installations, at least) is to add this variable to your virtualenv. To do so, add the following lines to your `.virtualenvs/lilypad/bin/postactivate`, adjusting anything for your environment:

        export DJANGO_SETTINGS_MODULE='lilypad_server.settings.development'
        export DATABASE_URL='sqlite:////path/to/some/file'
        export CLIENT_APP_PARENT='/path/to/client/repos/parent'

        # this should be the `lilypad_server` folder in the root of the repository
        add2virtualenv '/path/to/lilypad-server/lilypad_server'

    And this to `.virtualenvs/lilypad/bin/predeactivate`:

        unset DJANGO_SETTINGS_MODULE
        unset DATABASE_URL
        unset CLIENT_APP_PARENT

    _(As an example for_ `CLIENT_APP_PARENT`, _if the `lilypad-pace` repository is cloned at `/home/john/lilypad/lilypad-pace`, the setting would be `/home/john/lilypad`. See "Serving the client app" below for more details.)_

5. Initialize the database

        $ python manage.py syncdb
        $ python manage.py migrate

6. (Optional) Load a data fixture

        $ python manage.py loaddata <fixture_file>

7. Launch the server

        $ python manage.py runserver

8. Test the server by visiting a valid URL (e.g. http://127.0.0.1:8000/pace/students/). The full API is browsable in a very human-friendly way thanks to the `djangorestframework` we're using.

From now on, for every new shell session, you'll need to activate the virtualenv with the following command:

    $ workon lilypad

And if you want to deactivate the virtualenv, simply run:

    $ deactivate

## Serving the client app (for dev machines)

To avoid cross-site scripting problems, it's easiest to have the Django dev server serve the client apps.

However, since the client apps are in separate repositories, some care must be taken to set up the
environment. The dev server looks in the directory set in the `CLIENT_APP_PARENT` repository for the
cloned client repositories.

For example, to set up the Pace app, assuming you have a directory called `/home/john/lilypad` to house
all your lilypad code:

> 1. Ensure `CLIENT_APP_PARENT` is set to `/home/john/lilypad` (see "Server Installation", step 4)
> 2. Clone the `lilypad-pace` repository into `/home/john/lilypad`
> 3. Profit!

Once it's set up (and the dev server is running locally), you'll be able to access the app from [http://127.0.0.1:8000/pace/](http://127.0.0.1:8000/pace/) or [http://127.0.0.1:8000/plea/](http://127.0.0.1:8000/plea/).

## Production Install Notes

Only the development environment is configured to serve the client apps out of the box. Some care will have to be taken to hook
up the static URLs and index.html pages on a real web server.
