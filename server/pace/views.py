from django.shortcuts import get_object_or_404

from pace.models import Classroom, Student, PeriodicRecord, PointLoss,     \
                        BehaviorIncidentType, BehaviorIncident, \
                        AttendanceSpan, DailyRecord

from pace.serializers import ClassroomSerializer,                             \
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

    On successful creation, serialized data from a
    DailyClassroomDigestSerializer is returned in the response, not just
    a simple serialized DailyRecord.

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
            data = DailyClassroomDigestSerializer(record).data
        else:
            # if resource existed, return custom 409 response
            http_status = status.HTTP_409_CONFLICT
            data = {
                "detail": "Record exists",
                "record_location": record.get_fq_absolute_url(request)
            }

        return Response(data, status=http_status, headers=headers)


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
