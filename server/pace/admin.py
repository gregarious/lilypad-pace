from pace.models import Student, PeriodicRecord, PointLoss, \
                        BehaviorIncidentType, BehaviorIncident, \
                        DailyRecord
                        AttendanceSpan, Classroom, \

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.models import User

admin.site.register(Student)
admin.site.register(PeriodicRecord)
admin.site.register(PointLoss)
admin.site.register(BehaviorIncidentType)
admin.site.register(BehaviorIncident)
admin.site.register(AttendanceSpan)
admin.site.register(DailyRecord)

class ClassroomAdmin(admin.ModelAdmin):
    model = Classroom
    exclude = ('permissions_group',)

admin.site.register(Classroom, ClassroomAdmin)

class ReplyInline(admin.TabularInline):
    model = ReplyPost

class PostAdmin(admin.ModelAdmin):
    inlines = [
        ReplyInline
    ]

admin.site.register(Post, PostAdmin)

admin.site.unregister(User)
admin.site.register(User, UserAdmin)
