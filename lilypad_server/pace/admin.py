from pace.models import Student, PeriodicRecord, PointLoss, \
                        BehaviorIncidentType, BehaviorIncident, \
                        Post, ReplyPost, AttendanceSpan, \
                        StaffProfile, Classroom

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.models import User

admin.site.register(Student)
admin.site.register(PeriodicRecord)
admin.site.register(PointLoss)
admin.site.register(BehaviorIncidentType)
admin.site.register(BehaviorIncident)
admin.site.register(AttendanceSpan)
admin.site.register(Classroom)

class ReplyInline(admin.TabularInline):
    model = ReplyPost

class PostAdmin(admin.ModelAdmin):
    inlines = [
        ReplyInline
    ]

admin.site.register(Post, PostAdmin)

class StaffProfileInline(admin.StackedInline):
    model = StaffProfile
    can_delete = False
    verbose_name_plural = 'staff profile'

class UserAdmin(UserAdmin):
    inlines = (StaffProfileInline, )

admin.site.unregister(User)
admin.site.register(User, UserAdmin)
