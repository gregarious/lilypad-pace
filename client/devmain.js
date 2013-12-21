angular.module('pace').controller('devCtrl', function($scope, classroomDataStore) {
    var promise = classroomDataStore.load();
    $scope.status = "Loading";
    promise.then(function(classrooms) {
        _classroom = $scope.classroom = classrooms.models[0];
        _tr = $scope.todayRecord = $scope.classroom.get('todayRecord');
        _students = $scope.students = $scope.classroom.get('students');
        $scope.status = "";
    }, function(reason) {
        console.error("Failure: %o", reason);
        $scope.status = "error";
    });

    $scope.loadDailyRecord = function() {
        $scope.status = "loading record";
        $scope.classroom.syncTodayRecord().then(function(hasDayBegun) {
            if (hasDayBegun) {
                $scope.status = "";
            }
            else {
                $scope.status = "day has not yet begun";
            }
        }, function(err) {
            console.error("Faiure: %o", err);
            $scope.status = "error loading daily record";
        });
    };

    $scope.startDailyRecord = function() {
        $scope.classroom.initializeTodayRecord().then(function() {
            // student data should be displaying
        }, function(err) {
            console.error("Faiure: %o", err);
            $scope.status = "error starting day";
        });
    };

    $scope.loadStudentData = function() {
        $scope.classroom.loadDailyDigest().then(function(studentCollection) {

        }, function(err) {
            console.error("Faiure: %o", err);
            $scope.status = "error loading student data";
        });
    };
});
