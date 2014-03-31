from subprocess import call
from django.utils import timezone

def db_backup():
    filename = os.path.join(
        os.path.dirname(PROJECT_ROOT),
        'var',
        'lilypad_pace_%s.sql.gz' % timezone.now().date.strftime('%Y%m%d')
    )
    call('mysqldump -p lillypad_pace | gzip > %s' % filename)
