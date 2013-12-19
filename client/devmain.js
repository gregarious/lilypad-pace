angular.module('pace').controller('devCtrl', function($scope, classroomDataStore) {
    var promise = classroomDataStore.load();
    $scope.status = "Loading";
    promise.then(function(classrooms) {
        _classroom = $scope.classroom = classrooms.models[0];
        _students = $scope.students = $scope.classroom.get('students');
        $scope.status = "";
    }, function(reason) {
        console.error("Failure: %o", reason);
        $scope.status = "error";
    });
});
