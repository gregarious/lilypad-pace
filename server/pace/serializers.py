from rest_framework import serializers

from pace.models import Classroom, Student, DailyRecord,        \
                        PeriodicRecord, PointLoss,              \
                        BehaviorIncidentType, BehaviorIncident, \
                        Post, ReplyPost, AttendanceSpan

class StudentSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Student
        fields = ('url', 'id', 'first_name', 'last_name',)

class ClassroomSerializer(serializers.HyperlinkedModelSerializer):
    students = StudentSerializer(many=True)

    class Meta:
        model = Classroom
        fields = ('id', 'url', 'name', 'students',)

class AttendanceSpanSerializer(serializers.HyperlinkedModelSerializer):
    student = serializers.PrimaryKeyRelatedField()

    class Meta:
        model = AttendanceSpan
        fields = ('id', 'url', 'student', 'date', 'time_in', 'time_out',)

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

class PointLossSerializer(serializers.HyperlinkedModelSerializer):
    periodic_record = serializers.PrimaryKeyRelatedField()

    class Meta:
        model = PointLoss
        fields = ('id', 'url', 'occurred_at', 'periodic_record',
            'point_type', 'comment')

class PeriodicRecordSerializer(serializers.HyperlinkedModelSerializer):
    student = serializers.PrimaryKeyRelatedField()
    point_losses = PointLossSerializer(many=True, required=False)

    class Meta:
        model = PeriodicRecord
        fields = ('id', 'url', 'last_changed_at', 'period', 'date',
            'student', 'is_eligible', 'kind_words_points',
            'complete_work_points', 'follow_directions_points',
            'be_safe_points', 'point_losses')

class BehaviorIncidentTypeSerializer(serializers.HyperlinkedModelSerializer):
    applicable_student = serializers.PrimaryKeyRelatedField(required=False)

    class Meta:
        model = BehaviorIncidentType
        fields = ('id', 'url', 'label', 'code', 'supports_duration',
            'applicable_student')

class BehaviorIncidentSerializer(serializers.HyperlinkedModelSerializer):
    student = serializers.PrimaryKeyRelatedField()
    type = serializers.PrimaryKeyRelatedField()

    class Meta:
        model = BehaviorIncident
        fields = ('id', 'url', 'type', 'started_at', 'ended_at', 'comment',
            'student', 'last_modified_at')

class DeepBehaviorIncidentSerializer(BehaviorIncidentSerializer):
    '''
    More specialized BehaviorIncidentSerializer that includes the full
    type subresource in it.
    '''
    type = BehaviorIncidentTypeSerializer()

class DailyClassroomDigestSerializer(serializers.ModelSerializer):
    date = serializers.DateField()
    current_period = serializers.IntegerField()
    students = StudentSerializer(many=True)
    periodic_records = PeriodicRecordSerializer(many=True)
    behavior_incidents = DeepBehaviorIncidentSerializer(many=True)
    attendance_spans = AttendanceSpanSerializer(many=True)

    class Meta:
        model = DailyRecord
        exclude = ('id',)       # API doesn't use DailyRecord ids as primary keys

class ReplyPostSerializer(serializers.ModelSerializer):
    # TODO: make this a true User stub when user model worked out
    author = serializers.RelatedField()

    class Meta:
        model = ReplyPost
        fields = ('author', 'content', 'created_at')

class PostSerializer(serializers.HyperlinkedModelSerializer):
    # TODO: make this a true User stub when user model worked out
    author = serializers.RelatedField()
    student = serializers.PrimaryKeyRelatedField()
    replies = ReplyPostSerializer(many=True)

    class Meta:
        model = Post
        fields = ('id', 'url', 'author', 'student', 'content', 'created_at', 'replies')
