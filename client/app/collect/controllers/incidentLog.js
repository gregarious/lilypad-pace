// controller for the incident log
app.controller('CollectIncidentLogCtrl', function ($scope, $modal, $rootScope, moment, mixpanel, timeTracker, dailyDataStore, behaviorTypeDataStore) {
    // various view control state values
    $scope.editingIncidents = false;
    $scope.confirmDeleteFor = null;

    // state object needed by modal directive
    $scope.behaviorModalState = {'active': false, 'title': "New Incident", 'timeOpen': 0};

    // form-related objects shared with CollectBehaviorsModalCtrl (needed
    //  in this scope for initiation reasons)
    $scope.incidentFormData = {};

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

    // shows the settings modal
    $scope.showBehaviorModal = function (editIncident) {
        var initialFormData = {};

        var timeModalOpened = null;

        if (editIncident) {
            console.error('Edit incident title not in place');
            // $scope.behaviorModalState.title = "Edit Incident";

            initialFormData = {
                typeModel: editIncident.get('type'),
                startedAt: moment(editIncident.getOccurredAt()).format("HH:mm"),
                comment: editIncident.get('comment'),
                endedAt: editIncident.has('endedAt') ? moment(editIncident.get('endedAt')).format("HH:mm") : '',
            };
        } else {
            // Close editing mode if open
            $scope.editingIncidents = false;
            $scope.confirmDeleteFor = null;

            initialFormData.startedAt = timeTracker.getTimestampAsMoment().format("HH:mm");
            console.error('Add new incident title not in place');
            // $scope.behaviorModalState.title = "Add New Incident";

            timeModalOpened = Date.now();
        }

        var modalInstance = $modal.open({
            templateUrl: 'app/collect/views/incidentModal.html',
            controller: 'IncidentModalCtrl',
            resolve: {
                typeCollection: function() {
                    return behaviorTypeDataStore.getForStudent($scope.viewState.selectedStudent);
                },
                initialFormData: function() {
                    return initialFormData;
                }
            }
        });

        // modal instance returns promise that is fulfilled when modal closes
        modalInstance.result.then(function (incidentFormData) {
            // combine time strings with current date
            var today = timeTracker.getTimestamp();
            incidentFormData.startedAt = replaceTime(today, incidentFormData.startedAt);
            if (incidentFormData.endedAt) {
                incidentFormData.endedAt = replaceTime(today, incidentFormData.endedAt);
            }

            if (editIncident) {
                // we edit both BehaviorIncidents and PointLosses with same form
                if (editIncident.has('periodicRecord')) {
                    editIncident.set('startedAt', incidentFormData.startedAt);
                }
                else {
                    editIncident.set('type', incidentFormData.typeModel);
                    editIncident.set('startedAt', incidentFormData.startedAt);
                    editIncident.set('endedAt', incidentFormData.endedAt);
                }
                // both model types have comments
                editIncident.set('comment', incidentFormData.comment);

                editIncident.save();
            }
            else {
                // track amount of time modal is open on new incident creation
                var duration = (Date.now() - timeModalOpened) / 1000;   // in seconds
                mixpanel.track("Incident added", { 'Time Open (s)': duration }); // mixpanel tracking

                // create a new BehaviorIncident
                var studentData = dailyDataStore.studentData[$scope.viewState.selectedStudent.id];
                if (studentData) {
                    var newIncident = studentData.behaviorIncidents.create({
                        student: $scope.viewState.selectedStudent,
                        type: incidentFormData.typeModel,
                        startedAt: incidentFormData.startedAt,
                        endedAt: incidentFormData.endedAt,
                        comment: incidentFormData.comment
                    });
                    $rootScope.$broadcast('behaviorIncidentRegistered', newIncident);
                }
                else {
                    console.error('Problem creating new behavior incident: daily data source is inconsistent');
                }
            }

        }, function () {
            // nothing to do when modal is cancelled
        });

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

    function submitIncidentForm(formData) {
        var today = timeTracker.getTimestamp();
        $scope.incidentFormData.startedAt = replaceTime(today, $scope.incidentFormData.startedAt);
        if ($scope.incidentFormData.endedAt) {
            $scope.incidentFormData.endedAt = replaceTime(today, $scope.incidentFormData.endedAt);
        }

    }

    function replaceTime(date, timeString) {
        date = new Date(date.getTime());
        var splitTime = timeString.split(':');
        date.setHours(splitTime[0]);
        date.setMinutes(splitTime[1]);
        return date;
    }
});
