angular.module('pace').controller('devCtrl', function($scope, classroomDataStore, todayDataManager) {
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

    $scope.loadDailyRecord = function() {
        $scope.status = "loading record";
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
        todayDataManager.fetchTodayDigestForClassroom($scope.classroom).
            then(function(collection) {

            }, function(err) {
                console.error("Faiure: %o", err);
                $scope.status = "error loading student data";
            });
    };
});
