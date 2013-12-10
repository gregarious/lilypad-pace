'''
Contains various custom Permission objects to be used with the
django-rest-framework.
'''

from rest_framework import permissions

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
        if required_group is None:
            # guard against incorrectly configured classroom data leak
            return False

        return required_group in request.user.groups.all()

class StudentPermission(permissions.BasePermission):
    """
    Permission check that user has access to given Student.

    This resolves to whether or not the user has access to the given student's
    classroom.
    """
    def has_object_permission(self, request, view, student):
        if student.classroom is None:
            # guard against classroom-less student data leaks
            return False

        return ClassroomPermission().has_object_permission(request, view, student.classroom)


class StudentDataPermission(permissions.BasePermission):
    """
    Permission check that user has acces to any object with a student
    attribute.

    This resolves to whether or not the user has access to the related
    student's classroom.
    """
    def has_object_permission(self, request, view, obj):
        if obj.student is None:
            # guard against student-less data leaks
            return False

        return StudentPermission().has_object_permission(request, view, obj.student)
