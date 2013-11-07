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

## Code introduction

See [this article](angular-lilypad-intro.md).

## Server deployment on AWS

No need to read this section unless you're redeploying the app on AWS. This is mostly notes to myself to help recreating the deployment.

This won't be as detailed as the local install instructions, but here's the basics. Follow along with this guide starting at Step 3: [Deploying a Django Application to AWS Elastic Beanstalk](http://docs.aws.amazon.com/elasticbeanstalk/latest/dg/create_deploy_Python_django.html). (We already have our git repository, so forget all the stuff about initializing a repo.)

1. Download the "AWS Elastic Beanstalk Command Line Tool" linked to in the guide

2. Set up the `eb` alias mentioned

3. Initialize EB application.

        $ eb init

    The prompts and guide are fairly self-explanatory. A few selected settings I used:

        - AWS Elastic Beanstalk application name: lilypad-pace
        - AWS Elastic Beanstalk environment name: lilypad-pace-master
        - Solution stack: 64-bit Amazon Linux Running Python

4. Before starting the service, link the repository's master branch with the lilypad-pace-master application environment.

        $ eb branch
        The current branch is "master".
        Enter an AWS Elastic Beanstalk environment name (auto-generated value is "lilypad-pace-master-env"): lilypad-pace-master
        Do you want to copy the settings from environment "lilypad-pace-master" for the new branch? [y/n]: y

5. Start the application.

        $ eb start

    This won't succeed because we don't have all the required environment variables set up yet, but this will at least set up all the config files with good defaults.

    You can keep an eye on the progress of this with [the web interface](https://console.aws.amazon.com/elasticbeanstalk). It takes a long time to set up.

6. Open the new `.elasticbeanstalk/optionsettings.lilypad-pace-master` file and replace all variable declarations from the `[aws:elasticbeanstalk:application:environment]` section with:

        SECRET_KEY="<SOME LONG STRING OF CHARACTERS>"

    This is the file where any secrets should be stored. It is not checked into version control, and should remain that way. We cleared out all other variables to emphasize the fact that
    the other non-private values are set in `.ebextensions/lilypad-pace.config`.

7. Save the new configuration:

        $ eb update

8. Push the repository:

        $ git aws:push

9. Hopefully, that will do it. Check out the Elastic Beanstalk tools (Dashboard, Configuration, Logs, etc.) to work through any deployment problems.

10. **Be sure to log into the Django admin console (username/password are declared in `scripts/createadmin.py` to change the default password.**

### A word about environment configuration

If you're having trouble, first make sure the `SECRET_KEY`, `PYTHONPATH`, and `DJANGO_SETTINGS_MODULE` variables are all set correctly on the "Software Configuration" section of the "Configuration" tab. There's two places values can be defined (`.elasticbeanstalk/optionsettings.lilypad-pace-master` is the base, and `.ebextensions/lilypad-pace.config` overrides many of them), so it's easy to confuse the server. There's a serious disconnect between the web interface and the CLI interface, so try to stick with the CLI interface for edits since that's how we configured everything.

If everything looks alright but still isn't working, you can choose the "Rebuild Environment" option from the EB dashboard. It takes forever (35 min when I tried it), but did the trick for me when everything was configured correctly but I was still having problems.
