// controller for the incident log
app.controller('CollectIncidentLogCtrl', function ($scope, moment, timeTracker, dailyDataStore) {
    // various view control state values
    $scope.editingIncidents = false;
    $scope.confirmDeleteFor = null;

    // state object needed by modal directive
    $scope.behaviorModalState = {'active': false, 'title': "New Incident", 'timeOpen': 0};

    // form-related objects shared with CollectBehaviorsModalCtrl (needed
    //  in this scope for initiation reasons)
    $scope.incidentFormData = {};
    $scope.currentIncidentEditing = null;

    var LoggableCollection = Backbone.Collection.extend({
        comparator: function(loggableModel) {
            return -loggableModel.getOccurredAt();
        }
    });

    $scope.incidentLogCollection = null;

    // on student changes, close the edit mode and reset the loggable collection
    $scope.$watch('viewState.selectedStudent', function(student) {
        $scope.confirmDeleteFor = null;
        $scope.editingIncidents = false;
        resetIncidentLogForStudent(student);
    });

    // listen for new point losses (from our sister controller)
    $scope.$on('pointLossRegistered', function(event, lossRecord) {
        if (lossRecord.get('periodicRecord') && lossRecord.get('periodicRecord').get('student')) {
            var student = lossRecord.get('periodicRecord').get('student');
            if (student === $scope.viewState.selectedStudent && $scope.incidentLogCollection) {
                $scope.incidentLogCollection.add(lossRecord);
            }
        }
    });

    // listen for new incidents (from the modal controller)
    // TODO: would be better to listen to dailyDataStore behaviorIncident collection changes
    $scope.$on('behaviorIncidentRegistered', function(event, incident) {
        var student = incident.get('student');
        if (student === $scope.viewState.selectedStudent && $scope.incidentLogCollection) {
            $scope.incidentLogCollection.add(incident);
        }
    });


    /** View functions **/

    // closes and clears the "new incident" control
    $scope.closeBehaviorModel = function () {
        $scope.behaviorModalState.active = false;
        $scope.incidentFormData = {};
    };

    // shows the settings modal
    $scope.showBehaviorModel = function (incident) {
        if (incident) {
            if (!$scope.editingIncidents) {
                return;
            }

            $scope.currentIncidentEditing = incident;
            $scope.behaviorModalState.title = "Edit Incident";

            $scope.incidentFormData.typeModel = incident.get('type');

            $scope.incidentFormData.startedAt = moment(incident.getOccurredAt()).format("HH:mm");
            $scope.incidentFormData.comment = incident.get('comment');

            if (incident.attributes.endedAt) {
                $scope.incidentFormData.endedAt = moment(incident.get('endedAt')).format("HH:mm");
            }

        } else {
            // Close editing mode if open
            $scope.editingIncidents = false;
            $scope.confirmDeleteFor = null;
            $scope.currentIncidentEditing = null;

            $scope.incidentFormData.startedAt = timeTracker.getTimestampAsMoment().format("HH:mm");
            $scope.behaviorModalState.title = "Add New Incident";
            $scope.behaviorModalState.timeOpen = Date.now();
        }

        $scope.behaviorModalState.active = true;
    };

    $scope.editIncidents = function() {
        $scope.editingIncidents = !$scope.editingIncidents;
        $scope.confirmDeleteFor = null;
    };

    $scope.confirmDelete = function(incident) {
        if ($scope.confirmDeleteFor) {
            if ($scope.confirmDeleteFor === incident) {
                // reset confirm delete state
                $scope.confirmDeleteFor = null;
                return;
            }
        }

        $scope.confirmDeleteFor = incident;
    };

    $scope.removeIncident = function(logEntry) {
        // if record has a periodicRecord, it's a PointLoss and needs to go
        // through its parent PeriodicRecord to be destoryed correctly
        // #refactor
        var record = logEntry.get('periodicRecord');
        if (record) {
            record.reversePointLoss(logEntry.get('pointType'));
        }

        logEntry.destroy();
        $scope.editIncidents();
    };

    function resetIncidentLogForStudent(student) {
        if($scope.incidentLogCollection) {
            // stop listening for the 'change' events set up below
            $scope.incidentLogCollection.stopListening();
        }
        $scope.incidentLogCollection = null;

        if (student) {
            var studentData = dailyDataStore.studentData[student.id];
            if (studentData) {
                var incidentModels = [];
                incidentModels = incidentModels.concat(studentData.behaviorIncidents.models);

                var collection = new LoggableCollection();

                // when something is added to log, watch for changes on it: a time change
                // might necessitate a re-sort
                collection.on('add', function(model) {
                    collection.listenTo(model, 'change', function() {collection.sort();});
                });

                // finally ready to all the models: point losses & behavior incidents
                studentData.periodicRecords.each(function(record) {
                    collection.add(record.get('pointLosses').models);
                });
                collection.add(studentData.behaviorIncidents.models);

                $scope.incidentLogCollection = collection;
            }
        }
    }
});
