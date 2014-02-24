angular.module('pace').controller('TreatmentPeriodModalCtrl', function($scope, $modalInstance, initialFormData, title) {
    $scope.title = title;
    $scope.formData = initialFormData;

    $scope.submitForm = function() {
        if (validateForm($scope.formData)) {
            $modalInstance.close($scope.formData);
        }
    };

    $scope.closeForm = function() {
        $modalInstance.dismiss();
    };

    function validateForm(data) {
        if (moment(data.endedAt) >= moment(data.startedAt)) {
            return true;
        } else {
            alert('Treatment periods must be at least 1 day long');
            return false;
        }
    }
});
