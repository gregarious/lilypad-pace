#!/usr/bin/env python
# Script to create dummy admin user to unlock admin panel
# IMPORTANT! CHANGE THIS PASSWORD!

from django.contrib.auth.models import User
if User.objects.count() == 0:
    admin = User.objects.create(username='admin')
    admin.set_password('admin')
    admin.is_superuser = True
    admin.is_staff = True
    admin.save()
