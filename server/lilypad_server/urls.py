from django.conf.urls import patterns, include, url

from rest_framework import routers
from rest_framework.urlpatterns import format_suffix_patterns

# Uncomment the next two lines to enable the admin:
from django.contrib import admin
admin.autodiscover()

from pace import views as pace_views

## set up URLs for API
router = routers.SimpleRouter()
router.register(r'classrooms', pace_views.ClassroomViewSet)
router.register(r'students', pace_views.StudentViewSet)
router.register(r'behaviortypes', pace_views.BehaviorTypeViewSet)
router.register(r'behaviorincidents', pace_views.BehaviorIncidentViewSet)
router.register(r'periodicrecords', pace_views.PeriodicRecordViewSet)
router.register(r'pointlosses', pace_views.PointLossViewSet)
router.register(r'attendancespans', pace_views.AttendanceSpanViewSet)
router.register(r'treatmentperiods', pace_views.TreatmentPeriodViewSet)

apipatterns = router.urls

# add non-router-based API paths
apipatterns += patterns('',
    # classroom day record-related endpoints
    url(r'^classrooms/(?P<classroom_pk>[0-9]+)/dailyrecords/$',
        pace_views.DailyRecordCreateView.as_view()),
    url(r'^classrooms/(?P<classroom_pk>[0-9]+)/dailyrecords/(?P<date>[0-9-].+)/$',
        pace_views.DailyClassroomDigestView.as_view(),
        name="dailyrecord-detail"),

    # student-specific data type lists (for use in analyze)
    url(r'^students/(?P<student_pk>[0-9]+)/attendancespans/$',
        pace_views.StudentAttendanceSpanListView.as_view(),
        name="student_attendancespan-list"),
    url(r'^students/(?P<student_pk>[0-9]+)/periodicrecords/$',
        pace_views.StudentPeriodicRecordListView.as_view(),
        name="student_periodicrecord-list"),
    url(r'^students/(?P<student_pk>[0-9]+)/behaviorincidents/$',
        pace_views.StudentBehaviorIncidentListView.as_view(),
        name="student_behaviorincident-list"),
    url(r'^students/(?P<student_pk>[0-9]+)/pointlosses/$',
        pace_views.StudentPointLossListView.as_view(),
        name="student_pointloss-list"),
    url(r'^students/(?P<student_pk>[0-9]+)/treatmentperiods/$',
        pace_views.StudentTreatmentPeriodListView.as_view(),
        name="student_treatmentperiods-list"),

    # authentication url
    url(r'^authtoken/$', 'rest_framework.authtoken.views.obtain_auth_token'),
)
apipatterns = format_suffix_patterns(apipatterns)

## compile API and non-API url patterns together
urlpatterns = patterns('',
    url(r'^$', 'lilypad_server.views.home'),
    url(r'^admin/', include(admin.site.urls)),
    url(r'^api/', include(apipatterns)),
)
