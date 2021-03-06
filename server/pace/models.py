from django.db import models
from django.contrib.auth.models import User, Group
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.conf import settings
from django.core.exceptions import ObjectDoesNotExist

import itertools

from pytz import timezone
from datetime import datetime, time, timedelta

class Classroom(models.Model):
    name = models.CharField(max_length=200, unique=True)
    permissions_group = models.OneToOneField(Group, help_text=u'Will be automatically assigned on classroom creation', null=True, blank=True)
    period_labels = models.TextField(help_text=u'Labels for each of the 10 periods, one per line', blank=True)

    def __unicode__(self):
        return self.name

    @property
    def default_permissions_group_name(self):
        '''
        Default name given to the related Group that grants access
        permissions. This name will be used to automatically create a Group
        when a new Classroom is created.
        '''
        return u"%s Accessors" % self.name

# hook to create a new permission group after Classroom creation
@receiver(post_save, sender=Classroom)
def create_permissions_group_for_classroom(sender, instance, created, raw, **kwargs):
    if created and not raw and not instance.permissions_group:
        group_name = instance.default_permissions_group_name
        instance.permissions_group = Group.objects.get_or_create(name=group_name)[0]
        instance.save()

class Student(models.Model):
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100,
        help_text="(or partial last name)", blank=True)

    classroom = models.ForeignKey(Classroom, null=True, blank=True, related_name='students')

    def __unicode__(self):
        return u'%s %s' % (self.first_name, self.last_name)

class DailyRecord(models.Model):
    '''
    Tracks the current status of a classroom on a given day.
    '''
    classroom = models.ForeignKey(Classroom)
    date = models.DateField()
    current_period = models.IntegerField(default=1)

    def __unicode__(self):
        return u"%s: %s" % (unicode(self.date), unicode(self.classroom))

    @models.permalink
    def get_absolute_url(self):
        '''
        Resource URL is identified by classroom id and date
        '''
        return ('dailyrecord-detail', (), {
                    "classroom_pk": self.classroom.pk,
                    "date": self.date.strftime('%Y-%m-%d')})

    def get_fq_absolute_url(self, request):
        '''
        Fully qualified version of absolute url (includes protocol/domain)
        '''
        return request.build_absolute_uri(self.get_absolute_url())

    @property
    def students(self):
        return self.classroom.students.all()

    @property
    def periodic_records(self):
        record_lists = [s.periodic_records.filter(date=self.date) for s in self.students]
        return list(itertools.chain.from_iterable(record_lists))

    @property
    def attendance_spans(self):
        span_lists = [s.attendance_spans.filter(date=self.date) for s in self.students]
        return list(itertools.chain.from_iterable(span_lists))

    @property
    def behavior_incidents(self):
        ## need to only include incidents that started today
        # hardcoding the expectation that "today" starts at the server's TIME_ZONE setting (EST)
        default_tzinfo = timezone(settings.TIME_ZONE)
        start_dt = datetime.combine(self.date, time.min).replace(tzinfo=default_tzinfo)
        end_dt = start_dt + timedelta(days=1)
        qsfilter = lambda qs: qs.filter(started_at__gte=start_dt, started_at__lt=end_dt)
        incident_lists = [qsfilter(s.behavior_incidents) for s in self.students]
        return list(itertools.chain.from_iterable(incident_lists))


class PeriodicRecord(models.Model):
    period = models.IntegerField()
    date = models.DateField()
    student = models.ForeignKey(Student, related_name='periodic_records')

    # these are nullable if not eligible
    kind_words_points = models.IntegerField(null=True, blank=True)
    complete_work_points = models.IntegerField(null=True, blank=True)
    follow_directions_points = models.IntegerField(null=True, blank=True)
    be_safe_points = models.IntegerField(null=True, blank=True)

    last_changed_at = models.DateTimeField(auto_now=True)

    def __unicode__(self):
        return '<%s_%d:%s>' % (self.date.strftime('%Y-%m-%d'), self.period, self.student)

    def _decrement(self, attribute):
        current = getattr(self, attribute)
        if current <= 0:
            raise ValueError('Cannot decrement: Value already 0')
        setattr(self, attribute, current-1)

    def _increment(self, attribute):
        current = getattr(self, attribute)
        setattr(self, attribute, current+1)


    def register_point_loss(self, point_loss):
        '''
        Decrement the point value corresponding to the given point loss.
        `point_loss.point_type` should be a constant from the POINT_CATEGORIES_*
        choices.
        '''
        type_field_name = point_type_to_field_name_map.get(point_loss.point_type)
        if type_field_name:
            self._decrement(type_field_name)
            self.save()
        else:
            raise ValueError('Unsupported point_type: %s' % (str(point_loss.point_type)))

    def deregister_point_loss(self, point_loss):
        '''
        Increment the point value corresponding to the given point loss.
        `point_loss.point_type` should be a constant from the POINT_CATEGORIES_*
        choices.
        '''
        type_field_name = point_type_to_field_name_map.get(point_loss.point_type)
        if type_field_name:
            self._increment(type_field_name)
            self.save()
        else:
            raise ValueError('Unsupported point_type: %s' % (str(point_loss.point_type)))

# constant values for point loss type
POINT_CATEGORIES_KW = 'kw'
POINT_CATEGORIES_CW = 'cw'
POINT_CATEGORIES_FD = 'fd'
POINT_CATEGORIES_BS = 'bs'
POINT_CATEGORIES = (
    (POINT_CATEGORIES_KW, 'Kind Words'),
    (POINT_CATEGORIES_CW, 'Complete Work'),
    (POINT_CATEGORIES_FD, 'Follow Directions'),
    (POINT_CATEGORIES_BS, 'Be Safe'),
)

point_type_to_field_name_map = {
    POINT_CATEGORIES_KW: 'kind_words_points',
    POINT_CATEGORIES_CW: 'complete_work_points',
    POINT_CATEGORIES_FD: 'follow_directions_points',
    POINT_CATEGORIES_BS: 'be_safe_points'
}

class PointLoss(models.Model):
    occurred_at = models.DateTimeField()
    periodic_record = models.ForeignKey(PeriodicRecord, related_name="point_losses")
    point_type = models.CharField(max_length=4, choices=POINT_CATEGORIES)
    comment = models.TextField(blank=True)

    def __unicode__(self):
        return "<'%s' loss for record #%s @%s>" % (self.point_type, self.periodic_record.id, self.occurred_at.strftime('%Y-%m-%dT%H:%I:%S'),)

# signals to connect point loss creation/destruction to respective PdRecord
@receiver(post_save, sender=PointLoss)
def register_point_loss_with_periodic_record(sender, instance, created, raw, **kwargs):
    if created and not raw and instance.periodic_record:
        instance.periodic_record.register_point_loss(instance)

@receiver(post_delete, sender=PointLoss)
def deregister_point_loss_with_periodic_record(sender, instance, **kwargs):
    try:
        if instance.periodic_record:
            instance.periodic_record.deregister_point_loss(instance)
    except ObjectDoesNotExist:
        # if this is a cascading delete of a PointLoss from a PdRecord,
        # we'll get a DNE error here. ignore it.
        pass


class BehaviorIncidentType(models.Model):
    code = models.CharField(max_length=6, blank=True)
    label = models.CharField(max_length=100)
    supports_duration = models.BooleanField(default=False)

    applicable_student = models.ForeignKey(Student, null=True, blank=True,
        related_name='custom_behavior_types',
        help_text='Set if this type is a custom behavior for a student')

    def __unicode__(self):
        if self.applicable_student:
            return '%s (custom: %s)' % (self.label, self.applicable_student)
        else:
            return self.label

class BehaviorIncident(models.Model):
    type = models.ForeignKey(BehaviorIncidentType)
    started_at = models.DateTimeField()
    ended_at = models.DateTimeField(null=True, blank=True)

    comment = models.TextField(blank=True)
    student = models.ForeignKey(Student, related_name='behavior_incidents')

    last_modified_at = models.DateTimeField(auto_now=True)

    def __unicode__(self):
        return '<%s@%s:%s>' % (self.type.label, self.started_at.strftime('%Y-%m-%d %H:%M:%S'), self.student)

class AttendanceSpan(models.Model):
    student = models.ForeignKey(Student, related_name='attendance_spans')
    date = models.DateField()
    time_in = models.TimeField(null=True, blank=True)
    time_out = models.TimeField(null=True, blank=True)

    class Meta:
        ordering = ('date', 'time_in', 'time_out',)

    def __unicode__(self):
        return "%s: %s" % (self.student, self.date.strftime('%Y-%m-%d'))

class TreatmentPeriod(models.Model):
    student = models.ForeignKey(Student, related_name='treatment_periods')
    date_start = models.DateField(help_text="date period began (inclusive)")
    date_end = models.DateField(help_text="date period ended (inclusive)")


    def __unicode__(self):
        return u'%s: %s - %s' % (unicode(self.student),
            self.date_start.strftime('%Y.%m.%d'), self.date_end.strftime('%Y.%m.%d'))

# Token generation hook

from django.dispatch import receiver
from django.db.models.signals import post_save
from rest_framework.authtoken.models import Token

@receiver(post_save, sender=User)
def create_auth_token(sender, instance=None, created=False, **kwargs):
    # don't auto assign token if user is being set from a fixture
    if created and not kwargs.get('raw', False):
        Token.objects.create(user=instance)
