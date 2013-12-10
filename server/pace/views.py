from django.db.models import Q

from pace.models import Classroom, Student, PeriodicRecord, PointLoss,     \
                        BehaviorIncidentType, BehaviorIncident, \
                        Post, ReplyPost, AttendanceSpan

from pace.serializers import ClassroomSerializer, StudentSerializer, PeriodicRecordSerializer,     \
                             PointLossSerializer, BehaviorIncidentSerializer, \
                             BehaviorIncidentTypeSerializer, PostSerializer,  \
                             AttendanceSpanSerializer

from django.http import Http404
from rest_framework import generics

from dateutil import parser

### Classroom resource views ###

class ClassroomViewBase():
    serializer_class = ClassroomSerializer
    def get_queryset(self):
        '''
        Ensure user only gets info for classrooms they have access to
        '''
        if self.request.user.is_authenticated():
            # TODO: not filtering by authorized class viewing
            return Classroom.objects.all()

class ClassroomList(ClassroomViewBase, generics.ListAPIView):
    pass

class ClassroomDetail(ClassroomViewBase, generics.RetrieveAPIView):
    pass

### Student resource views ###

class StudentViewBase():
    queryset = Student.objects.all()
    serializer_class = StudentSerializer
    def get_serializer(self, instance=None, data=None, files=None, many=False, partial=False):
        '''
        Custom serializer to dynamically set the time which the `active_attendance_span`
        query will be based. See StudentSerializer.
        '''
        serializer_class = self.get_serializer_class()
        context = self.get_serializer_context()

        attendance_anchor_dt = None
        request = context.get('request')
        if request and request.GET.get('attendance_anchor'):
            try:
                attendance_anchor_dt = parser.parse(request.GET.get('attendance_anchor'))
            except ValueError:
                pass

        return serializer_class(instance, attendance_anchor_dt=attendance_anchor_dt,
                                data=data, files=files, many=many,
                                partial=partial, context=context)


class StudentList(StudentViewBase, generics.ListAPIView):
    pass

class StudentDetail(StudentViewBase, generics.RetrieveAPIView):
    pass

class ClassroomStudentList(StudentList):
    '''
    Access all Students for a given Classroom.
    '''
    def get_queryset(self):
        pk = self.kwargs.get('pk')
        if pk is None:
            raise Http404
        queryset = super(ClassroomStudentList, self).get_queryset()
        return queryset.filter(classroom__pk=pk)


### PeriodicRecord resource views ###

class PeriodicRecordList(generics.ListCreateAPIView):
    serializer_class = PeriodicRecordSerializer
    def get_queryset(self):
        '''
        Allow filtering by date (equality only).
        '''
        queryset = PeriodicRecord.objects.all()
        date = self.request.QUERY_PARAMS.get('date', None)
        if date:
            queryset = queryset.filter(date=date)
        return queryset

class PeriodicRecordDetail(generics.RetrieveUpdateAPIView):
    queryset = PeriodicRecord.objects.all()
    serializer_class = PeriodicRecordSerializer

# TODO: could post a resource with a different student here. clarify the functionality for that.
class StudentPeriodicRecordList(PeriodicRecordList):
    '''
    Access all PeriodicRecord for a given student.
    '''
    def get_queryset(self):
        pk = self.kwargs.get('pk')
        if pk is None:
            raise Http404
        queryset = super(StudentPeriodicRecordList, self).get_queryset()
        return queryset.filter(student__pk=pk)

### PointLoss resource views ###

class PointLossList(generics.ListCreateAPIView):
    '''
    Note that a side effect of a POST call here is the decrementing
    of the related PeriodicRecord point for the corresponding type.
    '''
    serializer_class = PointLossSerializer

    def get_queryset(self):
        '''
        Allow filtering by related PeriodicRecord's date field.
        '''
        queryset = PointLoss.objects.all()
        for key in ('periodic_record__date__gte', 'periodic_record__date__lt'):
            iso_string = self.request.QUERY_PARAMS.get(key, None)
            if iso_string:
                queryset = queryset.filter(**{key: parser.parse(iso_string)})
        return queryset

class PointLossDetail(generics.RetrieveUpdateDestroyAPIView):
    '''
    Note that a side effect of a DELETE call here is the incrementing
    of the related PeriodicRecord point for the corresponding type.
    '''
    queryset = PointLoss.objects.all()
    serializer_class = PointLossSerializer

# TODO: could post a resource with a different student here. clarify the functionality for that.
class StudentPointLossList(PointLossList):
    '''
    Access all PointLoss resources for a given student.
    '''
    def get_queryset(self):
        pk = self.kwargs.get('pk')
        if pk is None:
            raise Http404
        queryset = super(StudentPointLossList, self).get_queryset()
        return queryset.filter(periodic_record__student__pk=pk)

### BehaviorIncidentType resource views ###

class BehaviorIncidentTypeList(generics.ListCreateAPIView):
    queryset = BehaviorIncidentType.objects.all()
    serializer_class = BehaviorIncidentTypeSerializer

class BehaviorIncidentTypeDetail(generics.RetrieveAPIView):
    queryset = BehaviorIncidentType.objects.all()
    serializer_class = BehaviorIncidentTypeSerializer

# TODO: could post a resource with a different student here. clarify the functionality for that.
class StudentBehaviorIncidentTypeList(BehaviorIncidentTypeList):
    '''
    Access all BehaviorIncidentType resources for a given student. This
    includes BehaviorIncidentTypes with no particular `applicable_student`.
    '''
    def get_queryset(self):
        pk = self.kwargs.get('pk')
        if pk is None:
            raise Http404
        queryset = super(StudentBehaviorIncidentTypeList, self).get_queryset()
        return queryset.filter(Q(applicable_student__pk=pk) |
                               Q(applicable_student__isnull=True))

### BehaviorIncident resource views ###

class BehaviorIncidentList(generics.ListCreateAPIView):
    serializer_class = BehaviorIncidentSerializer
    def get_queryset(self):
        queryset = BehaviorIncident.objects.all()
        for key in ('started_at__gte', 'started_at__lt'):
            iso_string = self.request.QUERY_PARAMS.get(key, None)
            if iso_string:
                queryset = queryset.filter(**{key: parser.parse(iso_string)})
        return queryset

class BehaviorIncidentDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = BehaviorIncident.objects.all()
    serializer_class = BehaviorIncidentSerializer

class StudentBehaviorIncidentList(BehaviorIncidentList):
    '''
    Access all BehaviorIncident resources for a given student.
    '''
    def get_queryset(self):
        pk = self.kwargs.get('pk')
        if pk is None:
            raise Http404
        queryset = super(StudentBehaviorIncidentList, self).get_queryset()
        return queryset.filter(student__pk=pk)

### Post resource views ###

class PostList(generics.ListAPIView):
    queryset = Post.objects.all()
    serializer_class = PostSerializer

class PostDetail(generics.RetrieveAPIView):
    queryset = Post.objects.all()
    serializer_class = PostSerializer

class StudentPostList(generics.ListAPIView):
    '''
    Access all Post resources about a given student.
    '''
    serializer_class = PostSerializer

    def get_queryset(self):
        pk = self.kwargs.get('pk')
        if pk is None:
            raise Http404
        posts = Post.objects.filter(student__pk=pk)
        return posts

### Attendance span views ###

class AttendanceSpanList(generics.ListCreateAPIView):
    serializer_class = AttendanceSpanSerializer

    def get_queryset(self):
        queryset = AttendanceSpan.objects.all()
        for key in ('date__gte', 'date__lt'):
            iso_string = self.request.QUERY_PARAMS.get(key, None)
            if iso_string:
                queryset = queryset.filter(**{key: parser.parse(iso_string).date()})

        return queryset

class AttendanceSpanDetail(generics.RetrieveUpdateAPIView):
    queryset = AttendanceSpan.objects.all()
    serializer_class = AttendanceSpanSerializer

# TODO: could post a resource with a different student here. clarify the functionality for that.
class StudentAttendanceSpanList(AttendanceSpanList):
    '''
    Access all AttendanceSpan resources for a given student.
    '''
    def get_queryset(self):
        pk = self.kwargs.get('pk')
        if pk is None:
            raise Http404
        queryset = super(StudentAttendanceSpanList, self).get_queryset()
        return queryset.filter(student__pk=pk)
