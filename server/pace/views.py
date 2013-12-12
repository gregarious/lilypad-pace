from django.shortcuts import get_object_or_404

from pace.models import Classroom, Student, PeriodicRecord, PointLoss,     \
                        BehaviorIncidentType, BehaviorIncident, \
                        AttendanceSpan, DailyRecord

from pace.serializers import ClassroomSerializer, DailyRecordSerializer,      \
                             DailyClassroomDigestSerializer,                  \
                             StudentSerializer, PeriodicRecordSerializer,     \
                             PointLossSerializer, BehaviorIncidentSerializer, \
                             BehaviorIncidentTypeSerializer,                  \
                             AttendanceSpanSerializer

from pace.permissions import ClassroomPermission, ClassroomPermissionFilter,  \
                                ClassroomDataPermission,                      \
                                ClassroomDataPermissionFilter,                \
                                StudentDataPermission,                        \
                                StudentDataPermissionFilter,                  \
                                PointLossPermissionFilter,                    \
                                BehaviorIncidentTypePermissionFilter

from django.http import Http404
from rest_framework import generics, viewsets, mixins, status
from rest_framework.views import APIView
from rest_framework.response import Response

from dateutil import parser

### Helper functions that ensure user has access to resources (used in POST methods) ###

class InvalidRelation(Exception):
    pass

def request_has_student_write_permissions(request):
    try:
        student_pk = int(request.DATA.get('student'))
        student = Student.objects.get(pk=student_pk)
    except (ValueError, TypeError, Student.DoesNotExist):
        # if pk is not a PrimaryKey or Student doesn't exist, escape
        raise InvalidRelation()

    # check that user has access to the given student before continuing
    bouncer = ClassroomDataPermission()
    return bouncer.has_object_permission(request, None, student)

def request_has_periodicrecord_write_permissions(request):
    try:
        periodicrecord_pk = int(request.DATA.get('periodic_record'))
        periodicrecord = PeriodicRecord.objects.get(pk=periodicrecord_pk)
    except (ValueError, TypeError, PeriodicRecord.DoesNotExist):
        # if pk is not a PrimaryKey or Student doesn't exist, escape
        raise InvalidRelation()
    bouncer = StudentDataPermission()
    return bouncer.has_object_permission(request, None, periodicrecord)



### Basic API endpoints ###

class ClassroomViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Classroom.objects.all()
    serializer_class = ClassroomSerializer
    filter_backends = (ClassroomPermissionFilter,)


class StudentViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Student.objects.all()
    serializer_class = StudentSerializer
    filter_backends = (ClassroomDataPermissionFilter,)


class BehaviorTypeViewSet(mixins.CreateModelMixin,
                          mixins.RetrieveModelMixin,
                          mixins.ListModelMixin,
                          viewsets.GenericViewSet):
    queryset = BehaviorIncidentType.objects.all()
    serializer_class = BehaviorIncidentTypeSerializer
    filter_backends = (BehaviorIncidentTypePermissionFilter,)


class BehaviorIncidentViewSet(mixins.RetrieveModelMixin,
                              mixins.UpdateModelMixin,
                              mixins.DestroyModelMixin,
                              mixins.CreateModelMixin,
                              viewsets.GenericViewSet):
    queryset = BehaviorIncident.objects.all()
    serializer_class = BehaviorIncidentSerializer
    filter_backends = (StudentDataPermissionFilter,)

    def create(self, request, *args, **kwargs):
        '''
        Includes custom check for parent Student access before allowing POST
        actions.
        '''
        try:
            if not request_has_student_write_permissions(request):
                return Response({"detail": 'You do not have permission to perform this action.'},
                            status=status.HTTP_403_FORBIDDEN)
        except InvalidRelation:
            return Response("Invalid periodic record identifier", status=status.HTTP_400_BAD_REQUEST)

        return super(BehaviorIncidentViewSet, self).create(request, *args, **kwargs)


class PeriodicRecordViewSet(mixins.RetrieveModelMixin,
                            viewsets.GenericViewSet):
    queryset = PeriodicRecord.objects.all()
    serializer_class = PeriodicRecordSerializer
    filter_backends = (StudentDataPermissionFilter,)


class AttendanceSpanViewSet(mixins.RetrieveModelMixin,
                            mixins.UpdateModelMixin,
                            mixins.CreateModelMixin,
                            viewsets.GenericViewSet):
    queryset = AttendanceSpan.objects.all()
    serializer_class = AttendanceSpanSerializer
    filter_backends = (StudentDataPermissionFilter,)

    def create(self, request, *args, **kwargs):
        '''
        Includes custom check for parent Student access before allowing POST
        actions.
        '''
        try:
            if not request_has_student_write_permissions(request):
                return Response({"detail": 'You do not have permission to perform this action.'},
                            status=status.HTTP_403_FORBIDDEN)
        except InvalidRelation:
            return Response("Invalid periodic record identifier", status=status.HTTP_400_BAD_REQUEST)

        return super(AttendanceSpanViewSet, self).create(request, *args, **kwargs)


class PointLossViewSet(mixins.RetrieveModelMixin,
                       mixins.UpdateModelMixin,
                       mixins.DestroyModelMixin,
                       mixins.CreateModelMixin,
                       viewsets.GenericViewSet):
    queryset = PointLoss.objects.all()
    serializer_class = PointLossSerializer
    filter_backends = (PointLossPermissionFilter,)

    def create(self, request, *args, **kwargs):
        '''
        Includes custom check for parent PeriodicRecord access before allowing
        POST actions.
        '''
        try:
            if not request_has_periodicrecord_write_permissions(request):
                return Response({"detail": 'You do not have permission to perform this action.'},
                            status=status.HTTP_403_FORBIDDEN)
        except InvalidRelation:
            return Response("Invalid periodic record identifier", status=status.HTTP_400_BAD_REQUEST)

        return super(PointLossViewSet, self).create(request, *args, **kwargs)

### API endpoints for DailyRecord-related data views ###

class DailyRecordCreateView(APIView):
    '''
    View to create new DailyRecord entries. Will return 409 on attempting
    to create a duplicate record for the given classroom+date combination.

    Requires url to have `classroom_pk` key value.
    '''
    def post(self, request, *args, **kwargs):
        try:
            classroom = Classroom.objects.get(pk=kwargs['classroom_pk'])
        except Classroom.DoesNotExist:
            return Response({"detail": "Not found"}, status=status.HTTP_404_NOT_FOUND)

        # ensure user has access to the classroom
        bouncer = ClassroomPermission()
        if not bouncer.has_object_permission(request, None, classroom):
            return Response({"detail": "Not found"}, status=status.HTTP_404_NOT_FOUND)

        # parse the date from the request data
        try:
            date = parser.parse(request.DATA.get('date')).date()
        except (ValueError, AttributeError):
            return Response({"detail": "Invalid date format"}, status=status.HTTP_400_BAD_REQUEST)

        # ensure we don't create a duplicate entry for the day
        record, was_created = DailyRecord.objects.get_or_create(
            classroom=classroom, date=date)

        headers = {}

        # if we created a new resource, return typical 201 response
        if was_created:
            http_status = status.HTTP_201_CREATED
            headers["Location"] = record.get_fq_absolute_url(request)
            data = DailyRecordSerializer(record).data
        else:
            # if resource existed, return custom 409 response
            http_status = status.HTTP_409_CONFLICT
            data = {
                "detail": "Record exists",
                "record_location": record.get_fq_absolute_url(request)
            }

        return Response(data, status=http_status, headers=headers)

class DailyRecordRetrieveView(generics.RetrieveAPIView):
    '''
    View to display a DailyRecord entry. Will return 409 on attempting
    to create a duplicate record for the given classroom+date combination.
    '''
    queryset = DailyRecord.objects.all()
    serializer_class = DailyRecordSerializer
    def get_object(self):
        '''
        Override default behavior to enable lookup by classroom pk and date.
        This is the de-facto pk for a DailyRecord as far as the API is
        concerned.
        '''
        try:
            date = parser.parse(self.kwargs["date"]).date()
        except (ValueError, AttributeError):
            raise Http404

        query_kwargs = {
            "classroom__pk": self.kwargs["classroom_pk"],
            "date": date
        }
        record = get_object_or_404(self.get_queryset(), **query_kwargs)

        # before returning, ensure user has access to resource
        bouncer = ClassroomPermission()
        if not bouncer.has_object_permission(self.request, None, record.classroom):
            raise Http404
        return record


class DailyClassroomDigestView(generics.RetrieveAPIView):
    """
    View to display a digest of information containing all classroom data
    on a given day. This includes:
        - date
        - current period number
        - students
        - periodic records (for all students in classroom)
        - behavior incidents (for all students in classroom)
        - attendance spans (for all students in classroom)

    URL to access the view must include classroom id and date in ISO basic
    format (YYYYMMDD).

    Supports GET only.
    """
    queryset = DailyRecord.objects.all()
    serializer_class = DailyClassroomDigestSerializer
    permission_classes = (ClassroomDataPermission,)
    def get_object(self):
        '''
        Override default behavior to enable lookup by classroom pk and date.
        This is the de-facto pk for a DailyRecord as far as the API is
        concerned.
        '''
        try:
            date = parser.parse(self.kwargs["date"]).date()
        except (ValueError, AttributeError):
            raise Http404

        query_kwargs = {
            "classroom__pk": self.kwargs["classroom_pk"],
            "date": date
        }
        record = get_object_or_404(self.get_queryset(), **query_kwargs)

        # before returning, ensure user has access to resource
        bouncer = ClassroomPermission()
        if not bouncer.has_object_permission(self.request, None, record.classroom):
            raise Http404
        return record

### Student subresource creation views ###
# class StudentViewBase():
#     queryset = Student.objects.all()
#     serializer_class = StudentSerializer
#     filter_backends = (ClassroomDataPermissionFilter,)

#     def get_serializer(self, instance=None, data=None, files=None, many=False, partial=False):
#         '''
#         Custom serializer to dynamically set the time which the `active_attendance_span`
#         query will be based. See StudentSerializer.
#         '''
#         serializer_class = self.get_serializer_class()
#         context = self.get_serializer_context()

#         attendance_anchor_dt = None
#         request = context.get('request')
#         if request and request.GET.get('attendance_anchor'):
#             try:
#                 attendance_anchor_dt = parser.parse(request.GET.get('attendance_anchor'))
#             except ValueError:
#                 pass

#         return serializer_class(instance,
#                                 data=data, files=files, many=many,
#                                 partial=partial, context=context)


# class StudentList(StudentViewBase, generics.ListAPIView):
#     pass

# class StudentDetail(StudentViewBase, generics.RetrieveAPIView):
#     pass


# class ClassroomStudentList(StudentList):
#     '''
#     Access all Students for a given Classroom.
#     '''
#     filter_backends = (ClassroomDataPermissionFilter,)
#     def get_queryset(self):
#         pk = self.kwargs.get('pk')
#         if pk is None:
#             raise Http404
#         queryset = super(ClassroomStudentList, self).get_queryset()
#         return queryset.filter(classroom__pk=pk)


# ### PeriodicRecord resource views ###

# class PeriodicRecordList(generics.ListCreateAPIView):
#     serializer_class = PeriodicRecordSerializer
#     filter_backends = (StudentDataPermissionFilter,)
#     def get_queryset(self):
#         '''
#         Allow filtering by date (equality only).
#         '''
#         queryset = PeriodicRecord.objects.all()
#         date = self.request.QUERY_PARAMS.get('date', None)
#         if date:
#             queryset = queryset.filter(date=date)
#         return queryset

# class PeriodicRecordDetail(generics.RetrieveUpdateAPIView):
#     queryset = PeriodicRecord.objects.all()
#     serializer_class = PeriodicRecordSerializer
#     filter_backends = (StudentDataPermissionFilter,)

# # TODO: could post a resource with a different student here. clarify the functionality for that.
# class StudentPeriodicRecordList(PeriodicRecordList):
#     '''
#     Access all PeriodicRecord for a given student.
#     '''
#     filter_backends = (StudentDataPermissionFilter,)
#     def get_queryset(self):
#         pk = self.kwargs.get('pk')
#         if pk is None:
#             raise Http404
#         queryset = super(StudentPeriodicRecordList, self).get_queryset()
#         return queryset.filter(student__pk=pk)

# ### PointLoss resource views ###

# class PointLossList(generics.ListCreateAPIView):
#     '''
#     Note that a side effect of a POST call here is the decrementing
#     of the related PeriodicRecord point for the corresponding type.
#     '''
#     serializer_class = PointLossSerializer
#     filter_backends = (PointLossPermissionFilter,)

#     def get_queryset(self):
#         '''
#         Allow filtering by related PeriodicRecord's date field.
#         '''
#         queryset = PointLoss.objects.all()
#         for key in ('periodic_record__date__gte', 'periodic_record__date__lt'):
#             iso_string = self.request.QUERY_PARAMS.get(key, None)
#             if iso_string:
#                 queryset = queryset.filter(**{key: parser.parse(iso_string)})
#         return queryset

# class PointLossDetail(generics.RetrieveUpdateDestroyAPIView):
#     '''
#     Note that a side effect of a DELETE call here is the incrementing
#     of the related PeriodicRecord point for the corresponding type.
#     '''
#     queryset = PointLoss.objects.all()
#     serializer_class = PointLossSerializer
#     filter_backends = (PointLossPermissionFilter,)

# # TODO: could post a resource with a different student here. clarify the functionality for that.
# class StudentPointLossList(PointLossList):
#     '''
#     Access all PointLoss resources for a given student.
#     '''
#     filter_backends = (PointLossPermissionFilter,)
#     def get_queryset(self):
#         pk = self.kwargs.get('pk')
#         if pk is None:
#             raise Http404
#         queryset = super(StudentPointLossList, self).get_queryset()
#         return queryset.filter(periodic_record__student__pk=pk)

# ### BehaviorIncidentType resource views ###

# class BehaviorIncidentTypeList(generics.ListCreateAPIView):
#     queryset = BehaviorIncidentType.objects.all()
#     serializer_class = BehaviorIncidentTypeSerializer
#     filter_backends = (BehaviorIncidentTypePermissionFilter,)

# class BehaviorIncidentTypeDetail(generics.RetrieveAPIView):
#     queryset = BehaviorIncidentType.objects.all()
#     serializer_class = BehaviorIncidentTypeSerializer
#     filter_backends = (BehaviorIncidentTypePermissionFilter,)

# # TODO: could post a resource with a different student here. clarify the functionality for that.
# class StudentBehaviorIncidentTypeList(BehaviorIncidentTypeList):
#     '''
#     Access all BehaviorIncidentType resources for a given student. This
#     includes BehaviorIncidentTypes with no particular `applicable_student`.
#     '''
#     filter_backends = (BehaviorIncidentTypePermissionFilter,)
#     def get_queryset(self):
#         pk = self.kwargs.get('pk')
#         if pk is None:
#             raise Http404
#         queryset = super(StudentBehaviorIncidentTypeList, self).get_queryset()
#         return queryset.filter(Q(applicable_student__pk=pk) |
#                                Q(applicable_student__isnull=True))

# ### BehaviorIncident resource views ###

# class BehaviorIncidentList(generics.ListCreateAPIView):
#     serializer_class = BehaviorIncidentSerializer
#     filter_backends = (StudentDataPermissionFilter,)
#     def get_queryset(self):
#         queryset = BehaviorIncident.objects.all()
#         for key in ('started_at__gte', 'started_at__lt'):
#             iso_string = self.request.QUERY_PARAMS.get(key, None)
#             if iso_string:
#                 queryset = queryset.filter(**{key: parser.parse(iso_string)})
#         return queryset

# class BehaviorIncidentDetail(generics.RetrieveUpdateDestroyAPIView):
#     queryset = BehaviorIncident.objects.all()
#     serializer_class = BehaviorIncidentSerializer
#     filter_backends = (StudentDataPermissionFilter,)

# class StudentBehaviorIncidentList(BehaviorIncidentList):
#     '''
#     Access all BehaviorIncident resources for a given student.
#     '''
#     filter_backends = (StudentDataPermissionFilter,)
#     def get_queryset(self):
#         pk = self.kwargs.get('pk')
#         if pk is None:
#             raise Http404
#         queryset = super(StudentBehaviorIncidentList, self).get_queryset()
#         return queryset.filter(student__pk=pk)

# ### Post resource views ###

# class PostList(generics.ListAPIView):
#     queryset = Post.objects.all()
#     serializer_class = PostSerializer
#     filter_backends = (StudentDataPermissionFilter,)

# class PostDetail(generics.RetrieveAPIView):
#     queryset = Post.objects.all()
#     serializer_class = PostSerializer
#     filter_backends = (StudentDataPermissionFilter,)

# class StudentPostList(generics.ListAPIView):
#     '''
#     Access all Post resources about a given student.
#     '''
#     serializer_class = PostSerializer

#     def get_queryset(self):
#         pk = self.kwargs.get('pk')
#         if pk is None:
#             raise Http404
#         posts = Post.objects.filter(student__pk=pk)
#         return posts

# ### Attendance span views ###

# class AttendanceSpanList(generics.ListCreateAPIView):
#     serializer_class = AttendanceSpanSerializer
#     filter_backends = (StudentDataPermissionFilter,)

#     def get_queryset(self):
#         queryset = AttendanceSpan.objects.all()
#         for key in ('date__gte', 'date__lt'):
#             iso_string = self.request.QUERY_PARAMS.get(key, None)
#             if iso_string:
#                 queryset = queryset.filter(**{key: parser.parse(iso_string).date()})

#         return queryset

# class AttendanceSpanDetail(generics.RetrieveUpdateAPIView):
#     queryset = AttendanceSpan.objects.all()
#     serializer_class = AttendanceSpanSerializer
#     filter_backends = (StudentDataPermissionFilter,)

# # TODO: could post a resource with a different student here. clarify the functionality for that.
# class StudentAttendanceSpanList(AttendanceSpanList):
#     '''
#     Access all AttendanceSpan resources for a given student.
#     '''
#     filter_backends = (StudentDataPermissionFilter,)
#     def get_queryset(self):
#         pk = self.kwargs.get('pk')
#         if pk is None:
#             raise Http404
#         queryset = super(StudentAttendanceSpanList, self).get_queryset()
#         return queryset.filter(student__pk=pk)
