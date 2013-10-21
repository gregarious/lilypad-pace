// controller for behavior options modal
app.controller('MainStudentCollectBehaviorsModalCtrl', function ($scope, mainViewState, behaviorIncidentTypeDataStore) {
    $scope.addingBehavior = false;
    $scope.behaviorTypes = ['Frequency', 'Duration'];
    $scope.selectedBehaviorType = null;
    $scope.data = {};

    /** Functions needed to keep scope up to date with store changes **/
    // TODO: not great. could use a refactor; see after completing card #63

    // Hooks $scope.incidentTypeCollection up to the given student's data
    var setIncidentTypesForStudent = function(student) {
        if (student) {
            var incidentTypeCollection = behaviorIncidentTypeDataStore.getTypesForStudent(student, {
                success: function() {
                    updateStudentOnlyTypes(incidentTypeCollection);
                }
            });
        }
        else {
            $scope.studentOnlyTypes = [];
        }
    };

    var updateStudentOnlyTypes = function(incidentTypeCollection) {
        // Note this creates a bare array of IncidentTypes, *not* a Collection!
        $scope.studentOnlyTypes = incidentTypeCollection.filter(function(type) {
            return type.get('applicableStudent') !== null;
        });
    };

    // initialize $scope.incidentTypeCollection and $scope.studentOnlyTypes
    var selectedStudent = mainViewState.getSelectedStudent();
    setIncidentTypesForStudent(selectedStudent);

    // open the "add custom behavior" control
    $scope.openNewBehavior = function () {
        $scope.addingBehavior = true;
    };

    // close and clear the "add custom behavior" control
    $scope.closeNewBehavior = function () {
        $scope.addingBehavior = false;
        $scope.label = $scope.data.selectedBehaviorType = null;
    };

    // submit a new behavior
    // TODO: Should be doing responsive form validation here; card #80
    $scope.submitNewBehavior = function () {
        mixpanel.track("Custom behavior added"); // mixpanel tracking
        behaviorIncidentTypeDataStore.createIncidentType(
            $scope.data.label,
            $scope.data.selectedBehaviorType === 'Duration',
            null,
            mainViewState.getSelectedStudent());
        updateStudentOnlyTypes($scope.incidentTypeCollection);
        $scope.closeNewBehavior();

    };

    /** Listeners to ensure view stays in sync with mainViewState **/

    // listen for the selected student to change
    mainViewState.on('change:selectedStudent', function(newSelected) {
        setIncidentTypesForStudent(newSelected);
    });
});
