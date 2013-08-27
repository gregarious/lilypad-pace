// controller for behavior options modal
app.controller('MainStudentCollectBehaviorsModalCtrl', function ($scope, mainViewState, behaviorIncidentDataStore) {
    $scope.addingBehavior = false;
    $scope.behaviorTypes = ['Frequency', 'Duration'];
    $scope.selectedBehaviorType = null;
    $scope.data = {};

    // initialize $scope.incidentTypeCollection and $scope.studentTypes
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
    // TODO: Should be doing responsive form validation here
    $scope.submitNewBehavior = function () {
        $scope.incidentTypeCollection.createIncidentType(
            $scope.label,
            $scope.data.selectedBehaviorType === 'Duration',
            null);
        $scope.closeNewBehavior();
    };

    /** Listeners to ensure view stays in sync with mainViewState **/

    // listen for the selected student to change
    mainViewState.on('change:selectedStudent', function(newSelected) {
        setIncidentTypesForStudent(newSelected);
    });

    // Hooks $scope.incidentTypeCollection up to the given student's data
    function setIncidentTypesForStudent(student) {
        if (student) {
            var incidentTypeCollection = behaviorIncidentDataStore.getTypesForStudent(student);

            // Note this creates a bare array of IncidentTypes, *not* a Collection!
            $scope.studentTypes = incidentTypeCollection.filter(function(type) {
                return type.get('applicableStudent') !== null;
            });
        }
        else {
            $scope.studentTypes = [];
        }
    }
});
