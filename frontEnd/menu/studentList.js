// controller for the student list in the left panel
app.controller('MenuStudentListCtrl', function ($scope, mainViewState, viewService, studentAccessors, activeAttendanceManager) {
    var fetchStudents = studentAccessors.allStudents();
    var studentCollection;
    fetchStudents.then(function(collection) {
        studentCollection = collection;
        $scope.students = studentCollection.models; // list of students in class

        activeAttendanceManager.initializeSpans(studentCollection);
        $scope.activeSpans = activeAttendanceManager.activeSpans;
    });

    $scope.$watch(function () {
        return viewService;
    }, function (data) {
        if (data.parameters.id !== undefined) {
            $scope.currentStudentId = data.parameters.id;
        }
        $scope.attendance = data.parameters.attendance; // whether attendance is being taken
    }, true);

    // toggles attendance controls
    $scope.toggleAttendance = function () {
        viewService.parameters.attendance = !viewService.parameters.attendance;
    };

    // handles click events on student list
    $scope.handleClick = function (studentId) {
        var student = studentCollection.get(studentId);
        // are we taking attendance or switching main content views between students?
        if ($scope.attendance) {
            if (student.get('isPresent')) {
                student.markAbsent();
            } else {
                student.markPresent();
            }
        } else {
            // update the view service that we are looking at a different student
            viewService.currentView = 'student';
            viewService.parameters['id'] = studentId;

            mainViewState.setSelectedStudent(student);
        }
    };
});
