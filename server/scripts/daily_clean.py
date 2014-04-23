import datetime
from pace.models import AttendanceSpan

spans = AttendanceSpan.objects.filter(time_out__isnull=True)
print 'Checking out %d students' % spans.count()

for span in spans:
    span.time_out = datetime.time(15)
    span.save()
