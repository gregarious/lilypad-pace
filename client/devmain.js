angular.module('pace').controller('devCtrl', function($scope, classroomDataStore, todayDataManager) {
    var promise = classroomDataStore.load();
    $scope.status = "Loading classrooms...";
    promise.then(function(classrooms) {
        $scope.classrooms = classrooms.models;
        $scope.status = "";
    }, function(reason) {
        console.error("Failure: %o", reason);
        $scope.status = "error";
    });

    $scope.loadClassroom = function(classroom) {
        $scope.classroom = classroom;
        $scope.students = $scope.classroom.get('students');
        $scope.status = "Loading classroom data for today...";
        var fetchingRecord = todayDataManager.fetchTodayRecordForClassroom($scope.classroom);
        fetchingRecord.then(function(record) {
            _tr = $scope.todayRecord = record;
            if (record.currentPeriod === null) {
                $scope.status = "day has not yet begun";
            }
            else {
                $scope.status = "";
            }
        }, function(err) {
            console.error("Faiure: %o", err);
            $scope.status = "error loading daily record";
        });
    };

    $scope.startDailyRecord = function() {
        $scope.status = "initializing day";
        var initializingRecord = todayDataManager.initializeDayForClassroom($scope.classroom);
        initializingRecord.then(function(record) {
            _tr = $scope.todayRecord = record;
            $scope.status = "";
        }, function(err) {
            console.error("Faiure: %o", err);
            $scope.status = "error initializing daily record";
        });
    };

    $scope.loadStudentData = function() {
        $scope.status = "loading student data for today";
        todayDataManager.fetchTodayDigestForClassroom($scope.classroom).
            then(function(collection) {
                $scope.status = "";
            }, function(err) {
                console.error("Faiure: %o", err);
                $scope.status = "error loading student data";
            });
    };
});
