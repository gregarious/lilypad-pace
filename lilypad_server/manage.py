#!/usr/bin/env python
import os
import sys

if __name__ == "__main__":
    # Must already be set in environment
    # os.environ.setdefault("DJANGO_SETTINGS_MODULE", "lilypad_server.settings")

    from django.core.management import execute_from_command_line

    execute_from_command_line(sys.argv)
