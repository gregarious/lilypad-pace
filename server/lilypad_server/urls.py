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

apipatterns = router.urls
# add non-router-based API paths
apipatterns += patterns('',
    url(r'^authtoken/$', 'rest_framework.authtoken.views.obtain_auth_token'),
)
apipatterns = format_suffix_patterns(apipatterns)

## compile API and non-API url patterns together
urlpatterns = patterns('',
    url(r'^$', 'lilypad_server.views.home'),
    url(r'^admin/', include(admin.site.urls)),
    url(r'^api/', include(apipatterns)),
)
