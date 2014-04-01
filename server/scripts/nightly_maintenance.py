import os
from subprocess import call
from django.utils import timezone
from django.conf import settings

def db_backup():
    filename = os.path.join(
        os.path.dirname(settings.PROJECT_ROOT),
        'var',
        'lilypad_pace_%s.sql.gz' % timezone.now().date.strftime('%Y%m%d')
    )
    call('mysqldump -p lillypad_pace | gzip > %s' % filename)

if __name__ == 'main':
    db_backup()
