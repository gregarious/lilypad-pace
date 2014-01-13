from django.conf.urls import patterns, url
from django.conf import settings
from rest_framework.urlpatterns import format_suffix_patterns

from rest_framework import routers

import views

router = routers.SimpleRouter()

router.register(r'classrooms', views.ClassroomViewSet)
router.register(r'students', views.StudentViewSet)
router.register(r'behaviortypes', views.BehaviorTypeViewSet)

urlpatterns = router.urls

# urlpatterns = patterns('',

#     url(r'^students/$',
#         views.StudentList.as_view(), name='student-list'),
#     url(r'^students/(?P<pk>[0-9]+)/$',
#         views.StudentDetail.as_view(), name='student-detail'),

#     url(r'^students/(?P<pk>[0-9]+)/periodicrecords/$',
#         views.StudentPeriodicRecordList.as_view(), name='student_periodicrecord-list'),
#     url(r'^students/(?P<pk>[0-9]+)/pointlosses/$',
#         views.StudentPointLossList.as_view(), name='student_pointloss-list'),
#     url(r'^students/(?P<pk>[0-9]+)/behaviortypes/$',
#         views.StudentBehaviorIncidentTypeList.as_view(), name='student_behaviortype-list'),
#     url(r'^students/(?P<pk>[0-9]+)/behaviorincidents/$',
#         views.StudentBehaviorIncidentList.as_view(), name='student_behaviorincident-list'),
#     url(r'^students/(?P<pk>[0-9]+)/posts/$',
#         views.StudentPostList.as_view(), name='student_post-list'),
#     url(r'^students/(?P<pk>[0-9]+)/attendancespans/$',
#         views.StudentAttendanceSpanList.as_view(), name='student_attendancespan-list'),

#     url(r'^periodicrecords/$',
#         views.PeriodicRecordList.as_view(), name='periodicrecord-list'),
#     url(r'^periodicrecords/(?P<pk>[0-9]+)/$',
#         views.PeriodicRecordDetail.as_view(), name='periodicrecord-detail'),

#     url(r'^pointlosses/$',
#         views.PointLossList.as_view(), name='pointloss-list'),
#     url(r'^pointlosses/(?P<pk>[0-9]+)/$',
#         views.PointLossDetail.as_view(), name='pointloss-detail'),

#     url(r'^behaviorincidents/$',
#         views.BehaviorIncidentList.as_view(), name='behaviorincident-list'),
#     url(r'^behaviorincidents/(?P<pk>[0-9]+)/$',
#         views.BehaviorIncidentDetail.as_view(), name='behaviorincident-detail'),

#     url(r'^behaviortypes/$',
#         views.BehaviorIncidentTypeList.as_view(), name='behaviorincidenttype-list'),
#     url(r'^behaviortypes/(?P<pk>[0-9]+)/$',
#         views.BehaviorIncidentTypeDetail.as_view(), name='behaviorincidenttype-detail'),

#     url(r'^posts/$',
#         views.PostList.as_view(), name='post-list'),
#     url(r'^posts/(?P<pk>[0-9]+)/$',
#         views.PostDetail.as_view(), name='post-detail'),

#     url(r'^attendancespans/$',
#         views.AttendanceSpanList.as_view(), name='attendancespan-list'),
#     url(r'^attendancespans/(?P<pk>[0-9]+)/$',
#         views.AttendanceSpanDetail.as_view(), name='attendancespan-detail'),
# )

urlpatterns = format_suffix_patterns(urlpatterns)
