angular.module('pace').controller('IncidentModalCtrl', function($scope, $modalInstance, typeCollection, initialFormData) {
    $scope.incidentFormData = initialFormData;
    $scope.behaviorTypeCollection = typeCollection;

    $scope.behaviorTypeFormData = {};
    $scope.addingBehaviorType = false;
    $scope.behaviorTypes = ['Frequency', 'Duration'];

    $scope.submitForm = function() {
        // only close modal if validator OKs the data
        if (validateForm($scope.incidentFormData)) {
            $modalInstance.close($scope.incidentFormData);
        }
    };

    $scope.closeForm = function() {
        $modalInstance.dismiss();
    };

    // set the desired behavior type
    $scope.setBehavior = function(selectedType) {
        $scope.incidentFormData.typeModel = selectedType;
    };

    // open the "add custom behavior" control
    $scope.openNewBehaviorType = function () {
        var confirmNewType = confirm("Are you sure you want to add a new behavior type?");
        if (confirmNewType === true) {
            $scope.addingBehaviorType = true;
        }
    };

    // close and clear the "add custom behavior" control
    $scope.closeNewBehaviorType = function () {
        $scope.addingBehaviorType = false;
        $scope.behaviorTypeFormData.label = null;
        $scope.behaviorTypeFormData.selectedBehaviorType = null;
    };

    // submit a new behavior
    $scope.submitNewBehaviorType = function () {
        console.error('not validating new behavior type form data');
        // Validate presence of behavior type
        if (typeof $scope.behaviorTypeFormData.selectedBehaviorType === "undefined") {
            $scope.missingBehaviorType = true;
            return;
        } else {
            $scope.missingBehaviorType = false;
        }

        mixpanel.track("Custom behavior added"); // mixpanel tracking

        // use the existing student-specific collection to create the new type
        $scope.behaviorTypeCollection.create({
            label: $scope.behaviorTypeFormData.label,
            supportsDuration: $scope.behaviorTypeFormData.selectedBehaviorType === 'Duration'
        });

        $scope.closeNewBehaviorType();
    };

    function validateForm(data) {
        // TODO: validate form data
        console.error('not validating new/edit incident form data');
        return true;
    }
});
