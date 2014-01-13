'''
Contains various custom Permission objects to be used with the
django-rest-framework.
'''

from django.db.models import Q

from rest_framework import permissions, filters

class ClassroomPermission(permissions.BasePermission):
    """
    Permission check that user has access to given Classroom.

    Note that we are not using Django object-level permissions here, though
    we could. Since all permissions boil down to the basic question of "Does
    this user have access to this classroom?", we're not stopping short
    of using the permissions framework and just asserting group membership
    directly.

    For details of how to use full object-based permissions in the API, see
    http://django-rest-framework.org/api-guide/permissions#djangoobjectpermissions.
    """
    def has_object_permission(self, request, view, classroom):
        required_group = classroom.permissions_group
        # Note: if required_group is None, this will always return False
        return required_group in request.user.groups.all()


class ClassroomPermissionFilter(filters.BaseFilterBackend):
    '''
    Queryset filter version of ClassroomPermission
    '''
    def filter_queryset(self, request, queryset, view):
        return queryset.filter(
            permissions_group__in=request.user.groups.all())


class ClassroomDataPermission(permissions.BasePermission):
    """
    Permission check that user has access to data related to a classroom (e.g.
    a Student object).
    """
    def has_object_permission(self, request, view, student):
        # guard against sending in a null classroom
        if student.classroom is not None:
            return ClassroomPermission().has_object_permission(request, view, student.classroom)
        else:
            # don't leak any students that are without classrooms
            return False


class ClassroomDataPermissionFilter(filters.BaseFilterBackend):
    '''
    Queryset filter version of ClassroomDataPermission
    '''
    def filter_queryset(self, request, queryset, view):
        return queryset.filter(
            classroom__permissions_group__in=request.user.groups.all())


class StudentDataPermission(permissions.BasePermission):
    """
    Permission check that user has access to any object with a student
    attribute. Can be used for PeriodicRecord, BehaviorIncident, etc.

    This resolves to whether or not the user has access to the related
    student's classroom.
    """
    def has_object_permission(self, request, view, obj):
        # guard against sending in a null student
        if obj.student is not None:
            return ClassroomDataPermission().has_object_permission(request, view, obj.student)
        else:
            # don't leak any data that is student-orphaned
            return False


class StudentDataPermissionFilter(filters.BaseFilterBackend):
    '''
    Queryset filter version of StudentDataPermission
    '''
    def filter_queryset(self, request, queryset, view):
        return queryset.filter(
            student__classroom__permissions_group__in=request.user.groups.all())


class PointLossPermission(permissions.BasePermission):
    """
    Permission check that user has acces to given PointLoss.

    This resolves to whether or not the user has access to the related
    student's classroom.
    """
    def has_object_permission(self, request, view, pointloss):
        # guard against sending in a null PeriodicRecord
        if pointloss.periodic_record is not None:
            return StudentDataPermission().has_object_permission(request, view, pointloss.periodic_record)
        else:
            # don't leak a misconfigured PointLoss
            return False


class PointLossPermissionFilter(filters.BaseFilterBackend):
    '''
    Queryset filter version of PointLossPermission
    '''
    def filter_queryset(self, request, queryset, view):
        return queryset.filter(
            periodic_record__student__classroom__permissions_group__in=request.user.groups.all())


class BehaviorIncidentTypePermission(permissions.BasePermission):
    """
    Permission check that user has acces to given BehaviorIncidentType. Note
    that accessing BehaviorIncidentTypes with no applicable student is allowed
    for all users.

    If applicable student is availble, this resolves to whether or not the user
    the student's classroom.
    """
    def has_object_permission(self, request, view, incidenttype):
        if incidenttype.applicable_student is None:
            # all authenticated users can see non-student specific types
            return True

        return ClassroomDataPermission().has_object_permission(request, view, incidenttype.applicable_student)


class BehaviorIncidentTypePermissionFilter(filters.BaseFilterBackend):
    '''
    Queryset filter version of BehaviorIncidentTypePermission
    '''
    def filter_queryset(self, request, queryset, view):
        return queryset.filter(
            Q(applicable_student__isnull=True) |
            Q(applicable_student__classroom__permissions_group__in=request.user.groups.all()))

