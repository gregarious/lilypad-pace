app.controller('TreatmentPeriodManagerCtrl', function ($scope, $modal, analyzeDataSources, mixpanel) {
    $scope.statusMessage = '';
    $scope.$watch('viewState.selectedStudent', setTreatmentPeriodLogForStudent);

    // collection of Treatment Period models displayed in log
    $scope.treatmentPeriodLogCollection = null;
    mixpanel.track("Viewing Treatment Period Manager");

    // view functions exposed to UI
    $scope.showTreatmentPeriodModal = showTreatmentPeriodModal;
    $scope.editTreatmentPeriods = editTreatmentPeriods;
    $scope.confirmDelete = confirmDelete;
    $scope.removeTreatmentPeriod = removeTreatmentPeriod;

    // various view control state values
    $scope.isEditPeriodsModeActive = false;
    $scope.confirmDeleteFor = null;

    /** Value watches **/

    // on student changes, close the edit mode and reset the loggable collection
    $scope.$watch('viewState.selectedStudent', function(student) {
        $scope.confirmDeleteFor = null;
        $scope.isEditPeriodsModeActive = false;
        resetTreatmentPeriodLogForStudent(student);
    });
    $scope.$watch('collectData', function() {
        resetTreatmentPeriodLogForStudent($scope.viewState.selectedStudent);
    });

    function setTreatmentPeriodLogForStudent(student) {
        $scope.treatmentPeriodLogCollection = null;
        if (student) {
            $scope.statusMessage = "Fetching treatment reports...";

            analyzeDataSources.fetchTreatmentPeriods(student).then(function(collection) {
                $scope.treatmentPeriodLogCollection = collection;

                if (collection.length == 0) {
                    $scope.statusMessage = "No treatment reports found";
                } else {
                    $scope.statusMessage = null;
                }
            }, function(responses) {
                $scope.statusMessage = "Error fetching treatment periods";
            });
        }
        else {
            $scope.statusMessage = "No student selected";
        }
    }

    // shows the settings modal
    function showTreatmentPeriodModal() {
        // Go no further if modal is already opened
        if ($scope.modalInstance) {
            return;
        }

        var initialFormData = {};
        var timeModalOpened = null;
        if ($scope.treatmentPeriodLogCollection.length == 0) {
            var endOfLastPeriod = '2014-01-01'; // Start of deployment
            var lastPeriodNum = 0;
        } else {
            var endOfLastPeriod = $scope.treatmentPeriodLogCollection.models[$scope.treatmentPeriodLogCollection.length-1].attributes.dateEnd;
            var lastPeriodNum = $scope.treatmentPeriodLogCollection.models[$scope.treatmentPeriodLogCollection.length-1].attributes.id;
        }

        initialFormData = {
            startedAt: moment(endOfLastPeriod).add('days', 1).format("YYYY-MM-DD"),
            endedAt: moment(Date.now()).format("YYYY-MM-DD"),
            num: lastPeriodNum + 1
        };

        // open a new modal to present the form
        $scope.modalInstance = $modal.open({
            templateUrl: 'app/analyze/views/treatmentPeriodModal.html',
            controller: 'TreatmentPeriodModalCtrl',
            resolve: {
                initialFormData: function() {
                    return initialFormData;
                },
                title: function() {
                    return "End Current Treatment Period";
                }
            },
            backdrop: 'static'
        });

        // when model closes, handle the response as follows
        $scope.modalInstance.result.then(function (formData) {
            // Create new treatment period
            $scope.treatmentPeriodLogCollection.create({dateStart: formData.startedAt, dateEnd: formData.endedAt});
            delete $scope.modalInstance;
        }, function () {
            delete $scope.modalInstance;
        });

    }

    function editTreatmentPeriods() {
        $scope.isEditPeriodsModeActive = !$scope.isEditPeriodsModeActive;
        $scope.confirmDeleteFor = null;
    }

    function confirmDelete(treatmentPeriod) {
        if ($scope.confirmDeleteFor) {
            if ($scope.confirmDeleteFor === treatmentPeriod) {
                // reset confirm delete state
                $scope.confirmDeleteFor = null;
                return;
            }
        }

        $scope.confirmDeleteFor = treatmentPeriod;
    }

    function removeTreatmentPeriod(treatmentPeriod) {
        treatmentPeriod.destroy();
        mixpanel.track("Deleted a treatment period");
        $scope.editTreatmentPeriods();
    }

    function resetTreatmentPeriodLogForStudent(student) {
        if ($scope.treatmentPeriodLogCollection) {
            // stop listening for the 'change' events set up below
            $scope.treatmentPeriodLogCollection.stopListening();
        }
        $scope.treatmentPeriodLogCollection = null;

        if (student) {
            setTreatmentPeriodLogForStudent(student);
        }
    }
});
