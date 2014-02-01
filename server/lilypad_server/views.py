from django.http import HttpResponseRedirect

def home(request):
    return HttpResponseRedirect('/static/index.html')

def erase_today(request):
    '''Staging server only function to erase all server data for the day'''
    from pace.models import DailyRecord, AttendanceSpan, PeriodicRecord, BehaviorIncident
    from django.utils import timezone

    today = timezone.now().date()

    DailyRecord.objects.filter(date=today).delete()
    AttendanceSpan.objects.filter(date=today).delete()
    PeriodicRecord.objects.filter(date=today).delete()

    today_midnight = timezone.now().replace(hour=0, minute=0, second=0, microsecond=0)
    BehaviorIncident.objects.filter(started_at__gte=today_midnight).delete()

    return home(request)
