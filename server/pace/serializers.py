from rest_framework import serializers
from common.serializers import NamespacedHyperlinkedModelSerializer, NamespacedHyperlinkedModelSerializerWithPKWrite

from pace.models import Classroom, Student,             \
                        PeriodicRecord, PointLoss,      \
                        BehaviorIncidentType, BehaviorIncident, \
                        Post, ReplyPost, AttendanceSpan

class ClassroomSerializer(NamespacedHyperlinkedModelSerializer):
    class Meta:
        model = Classroom
        fields = ('id', 'url', 'name',)

class AttendanceSpanSerializer(NamespacedHyperlinkedModelSerializer):
    student = serializers.PrimaryKeyRelatedField()

    class Meta:
        model = AttendanceSpan
        fields = ('id', 'url', 'student', 'date', 'time_in', 'time_out')

class StudentSerializer(NamespacedHyperlinkedModelSerializer):
    '''
    Student serializer has a few customizations:

    1. Various URL fields to give shortcuts to student-specific data
    2. A field called 'active_attendance_span' which will contain a serialized
        AttendanceSpan object or None. This field is set by looking for an
        AttendanceSpan for the student that is still open as of a set datetime
        (specified in the constructor with the argument
        `attendance_anchor_dt`).

    The code that adds this 'active_attendance_span' field is pretty hacky,
    but it gets the job done. Might want to look into making it more robust
    by playing nicer with the rest_framework API.
    '''
    periodic_records_url = serializers.HyperlinkedIdentityField(
        view_name='pace:student_periodicrecord-list')
    point_losses_url = serializers.HyperlinkedIdentityField(
        view_name='pace:student_pointloss-list')
    behavior_types_url = serializers.HyperlinkedIdentityField(
        view_name='pace:student_behaviortype-list')
    behavior_incidents_url = serializers.HyperlinkedIdentityField(
        view_name='pace:student_behaviorincident-list')
    posts_url = serializers.HyperlinkedIdentityField(
        view_name='pace:student_post-list')
    attendance_spans_url = serializers.HyperlinkedIdentityField(
        view_name='pace:student_attendancespan-list')

    class Meta:
        model = Student
        fields = ('url', 'id', 'first_name', 'last_name',
            'periodic_records_url', 'point_losses_url',
            'behavior_types_url', 'behavior_incidents_url',
            'posts_url', 'attendance_spans_url')

    ### All of the code below is a quick and dirty way to add an
    ### active_attendance_span field to this ModelSerializer. Definitely
    ### a better way to do it than this, but just hacking into the
    ### `data` object right before it's returned was the quickest way
    ### to do it.

    def __init__(self, *args, **kwargs):
        self.attendance_anchor_dt = kwargs.pop('attendance_anchor_dt', None)
        super(StudentSerializer, self).__init__(*args, **kwargs)

    @property
    def data(self):
        # See notes above about this function
        data = super(StudentSerializer, self).data
        student = self.object

        if not self.many:
            data = [data]
            student = [student]

        for (dataset, obj) in zip(data, student):
            active_span = self.get_active_attendance_span(obj)
            if active_span:
                dataset['active_attendance_span'] = active_span.id
            else:
                dataset['active_attendance_span'] = None

        if self.many:
            return data
        else:
            return data[0]

    def get_active_attendance_span(self, obj):
        if self.attendance_anchor_dt:
            date = self.attendance_anchor_dt.date()
            time = self.attendance_anchor_dt.time()

            spans = AttendanceSpan.objects.filter(
                student=obj,
                date=date,
                time_in__lte=time,
                time_out__isnull=True)

            if len(spans) > 0:
                return spans[0]

        return None

class PointLossSerializer(NamespacedHyperlinkedModelSerializer):
    periodic_record = serializers.PrimaryKeyRelatedField()

    class Meta:
        model = PointLoss
        fields = ('id', 'url', 'occurred_at', 'periodic_record',
            'point_type', 'comment')

class PeriodicRecordSerializer(NamespacedHyperlinkedModelSerializer):
    student = serializers.PrimaryKeyRelatedField()
    point_losses = PointLossSerializer(many=True, required=False)

    class Meta:
        model = PeriodicRecord
        fields = ('id', 'url', 'last_changed_at', 'period', 'date',
            'student', 'is_eligible', 'kind_words_points',
            'complete_work_points', 'follow_directions_points',
            'be_safe_points', 'point_losses')

class BehaviorIncidentTypeSerializer(NamespacedHyperlinkedModelSerializer):
    applicable_student = serializers.PrimaryKeyRelatedField(required=False)

    class Meta:
        model = BehaviorIncidentType
        fields = ('id', 'url', 'label', 'code', 'supports_duration',
            'applicable_student')

class NestedBehaviorIncidentTypeSerializer(NamespacedHyperlinkedModelSerializerWithPKWrite):
    applicable_student = serializers.PrimaryKeyRelatedField(required=False)

    class Meta:
        model = BehaviorIncidentType
        fields = ('id', 'url', 'label', 'code', 'supports_duration',
            'applicable_student')

class BehaviorIncidentSerializer(NamespacedHyperlinkedModelSerializer):
    student = serializers.PrimaryKeyRelatedField()
    type = NestedBehaviorIncidentTypeSerializer()

    class Meta:
        model = BehaviorIncident
        fields = ('id', 'url', 'type', 'started_at', 'ended_at', 'comment',
            'student', 'last_modified_at')

class ReplyPostSerializer(serializers.ModelSerializer):
    # TODO: make this a true User stub when user model worked out
    author = serializers.RelatedField()

    class Meta:
        model = ReplyPost
        fields = ('author', 'content', 'created_at')

class PostSerializer(NamespacedHyperlinkedModelSerializer):
    # TODO: make this a true User stub when user model worked out
    author = serializers.RelatedField()
    student = serializers.PrimaryKeyRelatedField()
    replies = ReplyPostSerializer(many=True)

    class Meta:
        model = Post
        fields = ('id', 'url', 'author', 'student', 'content', 'created_at', 'replies')
