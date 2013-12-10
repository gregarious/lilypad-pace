from django.db import models
from django.contrib.auth.models import User, Group
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver

class Classroom(models.Model):
    name = models.CharField(max_length=200, unique=True)
    permissions_group = models.OneToOneField(Group, null=True, blank=True)

    def __unicode__(self):
        return self.name

# signals to connect point loss creation/destruction to respective PdRecord
@receiver(post_save, sender=Classroom)
def register_permissions_group_for_classroom(sender, instance, created, raw, **kwargs):
    if created and not raw and instance.periodic_record and not instance.permissions_group:
        instance.permissions_group = Group.objects.get_or_create(name=instance.name)[0]
        instance.save()


class Student(models.Model):
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100,
        help_text="(or partial last name)", blank=True)

    classroom = models.ForeignKey(Classroom, null=True, blank=True, related_name='students')

    def __unicode__(self):
        return u'%s %s' % (self.first_name, self.last_name)

class PeriodicRecord(models.Model):
    period = models.IntegerField()
    date = models.DateField()
    student = models.ForeignKey(Student, related_name='periodic_records')

    is_eligible = models.BooleanField(default=True)

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
    if instance.periodic_record:
        instance.periodic_record.deregister_point_loss(instance)


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

class BasePost(models.Model):
    class Meta:
        abstract = True
        ordering = ('created_at',)

    created_at = models.DateTimeField(auto_now_add=True)
    author = models.ForeignKey(User)
    content = models.TextField()

class Post(BasePost):
    student = models.ForeignKey(Student)

class ReplyPost(BasePost):
    parent_post = models.ForeignKey(Post, related_name='replies')

class AttendanceSpan(models.Model):
    student = models.ForeignKey(Student)
    date = models.DateField()
    time_in = models.TimeField(null=True, blank=True)
    time_out = models.TimeField(null=True, blank=True)

    class Meta:
        ordering = ('date', 'time_in', 'time_out',)

    def __unicode__(self):
        return "%s: %s" % (self.student, self.date.strftime('%Y-%m-%d'))

# Token generation hook

from django.dispatch import receiver
from django.db.models.signals import post_save
from rest_framework.authtoken.models import Token

@receiver(post_save, sender=User)
def create_auth_token(sender, instance=None, created=False, **kwargs):
    # don't auto assign token if user is being set from a fixture
    if created and not kwargs.get('raw', False):
        Token.objects.create(user=instance)
