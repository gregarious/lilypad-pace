angular.module('pace').controller('IncidentModalCtrl', function($scope, $modalInstance, typeCollection, initialFormData, isPointLoss, title) {
    $scope.title = title;
    $scope.incidentFormData = initialFormData;
    $scope.behaviorTypeCollection = typeCollection;

    $scope.behaviorTypeFormData = {};
    $scope.addingBehaviorType = false;
    $scope.behaviorTypeCategories = ['Frequency', 'Duration'];

    // form handles both point losses and behavior incidents
    $scope.formMode = isPointLoss ? 'pointLoss' : 'behaviorIncident';

    $scope.submitForm = function() {
        // only close modal if validator OKs the data
        console.log('valid: ' + validateForm($scope.incidentFormData));
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
        $scope.incidentFormData._typeMissing = false;
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
        $scope.behaviorTypeFormData.selectedBehaviorTypeCategory = null;
    };

    // submit a new behavior
    $scope.submitNewBehaviorType = function () {
        console.error('not validating new behavior type form data');
        // Validate presence of behavior type
        if (typeof $scope.behaviorTypeFormData.selectedBehaviorTypeCategory === "undefined") {
            $scope.missingBehaviorType = true;
            return;
        } else {
            $scope.missingBehaviorType = false;
        }

        mixpanel.track("Custom behavior added"); // mixpanel tracking

        // use the existing student-specific collection to create the new type
        $scope.behaviorTypeCollection.create({
            label: $scope.behaviorTypeFormData.label,
            supportsDuration: $scope.behaviorTypeFormData.selectedBehaviorTypeCategory === 'Duration'
        });

        $scope.closeNewBehaviorType();
    };

    function validateForm(data) {
        console.dir(data);
        if ($scope.formMode === 'pointLoss') {
            return !!data.startedAt;
        }
        else {
            data._typeMissing = !data.typeModel;
            return !!(data.startedAt && data.typeModel);
        }
    }
});
