from pace.models import AttendanceSpan

for span in AttendanceSpan.objects.filter(time_out__isnull=True):
    span.time_out = datetime.time(15)
    span.save()
