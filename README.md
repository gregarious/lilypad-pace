# Lilypad Pace

A single-page app for Lilypad at Pace.

## Installation for local machines

### Server install

1.  Install `virtualenv` (installation docs: [Mac](http://docs.python-guide.org/en/latest/starting/install/osx/#virtualenv) / [Windows](http://docs.python-guide.org/en/latest/starting/install/win/#virtualenv)) and `virtualenvwrapper` ([installation docs](http://virtualenvwrapper.readthedocs.org/en/latest/install.html)).
    - If you don't have `pip` installed, [see the full guide](http://docs.python-guide.org/en/latest/#getting-started)
      for a great how-to on the best way to set up a local Python installation.

2. Create a new virtual environment for Lilypad:

        $ mkvirtualenv lilypad-pace

3. Install dependencies into the new environment:

        $ pip install -r requirements/development.txt

4. Two environment variables need to be set:
    1. `DJANGO_SETTINGS_MODULE`: tells any Django process which settings file to use.
    2. `DATABASE_URL`: declares the local DB configuration. You'll need to set up the backend on your own. The simplest option is using SQLite.

    The recommended way to do this (for development installations, at least) is to declare these variables when your virtualenv activates. To do so, you'll add the variables to the end of your `~/.virtualenvs/lilypad-pace/bin/postactivate` file (note that your virtualenv files are **NOT** in your repository; this is on purpose). If `postactivate` doesn't exist, create it. Now add these lines, adjusting the filepaths for your environment:

        export DJANGO_SETTINGS_MODULE='lilypad_server.settings.development'
        export DATABASE_URL='sqlite:////path/to/some/file'


    Yes, that's **4** slashes in the URL if you're using SQLite.

    Similarly, to undo these changes when you deactivate your virtualenv, and this to the bottom of `.virtualenvs/lilypad-pace/deactivate`:

        unset DJANGO_SETTINGS_MODULE
        unset DATABASE_URL

5. Initialize the database (run `manage.py` commands from the server/ directory)

        $ python manage.py syncdb
        $ python manage.py migrate

6. (Optional) Load a data fixture

        $ python manage.py loaddata <fixture_file>

7. Launch the server

        $ python manage.py runserver

8. Test the server by visiting [http://127.0.0.1:8000/api/students/](http://127.0.0.1:8000/api/students/). If you don't get an error, things should be set up correctly.

From now on, for every new shell session, you'll need to activate the virtualenv with the following command:

    $ workon lilypad-pace

And if you want to deactivate the virtualenv, simply run:

    $ deactivate


### Accessing the app in a browser

1. Activate the virtualenv

		$ workon lilypad-pace

2. Start the server

		$ python manage.py runserver

3. Visit [http://127.0.0.1:8000/](http://127.0.0.1:8000/)

4. Profit!

## Client-side codebase introduction

See [this article](angular-lilypad-intro.md).
