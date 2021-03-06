from rest_framework import serializers

from pace.models import Classroom, Student, DailyRecord,        \
                        PeriodicRecord, PointLoss,              \
                        BehaviorIncidentType, BehaviorIncident, \
                        AttendanceSpan, TreatmentPeriod

class StudentSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Student
        fields = ('url', 'id', 'first_name', 'last_name',)

class ClassroomSerializer(serializers.HyperlinkedModelSerializer):
    students = StudentSerializer(many=True)
    period_labels = serializers.SerializerMethodField('get_period_labels_as_list')

    class Meta:
        model = Classroom
        fields = ('id', 'url', 'name', 'students', 'period_labels')

    def get_period_labels_as_list(self, obj):
        clean_labels = obj.period_labels.strip()
        if clean_labels == '':
            return None
        else:
            return [label.strip() for label in clean_labels.split('\n')]

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
            'student', 'kind_words_points',
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

class DailyRecordBaseSerializer(serializers.ModelSerializer):
    date = serializers.DateField()
    current_period = serializers.IntegerField()

    class Meta:
        model = DailyRecord
        exclude = ('id',)

class DailyClassroomDigestSerializer(DailyRecordBaseSerializer):
    students = StudentSerializer(many=True)
    periodic_records = PeriodicRecordSerializer(many=True)
    behavior_incidents = DeepBehaviorIncidentSerializer(many=True)
    attendance_spans = AttendanceSpanSerializer(many=True)

class TreatmentPeriodSerializer(serializers.HyperlinkedModelSerializer):
    student = serializers.PrimaryKeyRelatedField()

    class Meta:
        model = TreatmentPeriod
        fields = ('id', 'url', 'student', 'date_start', 'date_end',)
