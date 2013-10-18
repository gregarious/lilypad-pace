// controller for behavior options modal
app.controller('MainStudentCollectBehaviorsModalCtrl', function ($scope, mainViewState, behaviorIncidentTypeDataStore) {
    $scope.addingBehavior = false;
    $scope.behaviorTypes = ['Frequency', 'Duration'];
    $scope.selectedBehaviorType = null;
    $scope.data = {};

    /** Functions needed to keep scope up to date with store changes **/
    // TODO: not great. could use a refactor; see after completing card #63

    // NOTE!!!
    // We are inheriting $scope.collectData from parent controller.
    // TODO: change this

    $scope.$watch('collectData.behaviorTypeCollection', updateStudentOnlyTypes);
    updateStudentOnlyTypes($scope.collectData.behaviorTypeCollection);

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

    function updateStudentOnlyTypes(incidentTypeCollection) {
        // Note this creates a bare array of IncidentTypes, *not* a Collection!
        $scope.studentOnlyTypes = incidentTypeCollection.filter(function(type) {
            return type.get('applicableStudent') !== null;
        });
    }
});
