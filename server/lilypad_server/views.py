from django.http import HttpResponseRedirect
from datetime import datetime
from pytz import timezone

def home(request):
    return HttpResponseRedirect('/static/index.html')

def erase_new_data(request):
    '''Staging server only function to erase all server data for the day'''
    from pace.models import DailyRecord, AttendanceSpan, PeriodicRecord, BehaviorIncident
    from django.utils import timezone

    # fixture is set up with 
    cutoff_date = datetime(2014, 4, 4)
    
    DailyRecord.objects.filter(date__gt=cutoff_date).delete()
    AttendanceSpan.objects.filter(date__gt=cutoff_date).delete()
    PeriodicRecord.objects.filter(date__gt=cutoff_date).delete()

    cutoff_dt = timezone.now().replace(hour=0, minute=0, second=0, microsecond=0)
    BehaviorIncident.objects.filter(started_at__gt=cutoff_dt).delete()

    return home(request)
