angular.module('pace')

.factory('Classroom', function(_, moment, Backbone, $q, Student, apiConfig, timeTracker) {

    // lightweight model class to more easily handle all the baked-in
    // ajax boilerplate (i.e. auth and JSON case transforms)
    var DailyRecord = Backbone.RelationalModel.extend({
        defaults: {
            // being explicit about this because undefined means
            // unsynced, null means synced but not yet begun
            currentPeriod: undefined
        },

        idAttribute: 'date',

        isSynced: function() {
            return !_.isUndefined(this.get('currentPeriod'));
        },

        urlRoot: function() {
            return this.get('classroom').url() + '/dailyrecords/';
        }
    });


    return Backbone.RelationalModel.extend({
        urlRoot: apiConfig.toAPIUrl('classrooms/'),

        relations: [
            {
                key: 'students',
                relatedModel: Student,
                reverseRelation: {
                    key: 'classroom',
                    includeInJSON: false
                },
                type: Backbone.HasMany,
            }
        ],

        // ensure model always has a default today record
        initialize: function() {
            if(!this.has('todayRecord')) {
                this.set('todayRecord', new DailyRecord({
                    classroom: this,
                    date: timeTracker.getTimestampAsMoment().format('YYYY-MM-DD')
                }));
            }
        },

        // server data will have nested student models that need camelCased
        parse: function(response, options) {
            var camelResponse = Backbone.RelationalModel.prototype.parse.apply(this, arguments);
            if (camelResponse.students) {
                camelResponse.students = _.map(camelResponse.students, Student.prototype.parse);
            }
            return camelResponse;
        },

        /**
         * Async function that updates a Classroom's `todayRecord`
         * attr. Returns a promise for the async call that resolves to a bool.
         *
         * `true` means a record exists for the current period, `false` means
         * it does not yet exist. Promise will be rejected on any non-404
         * server errors (404 means record does not yet exist). When rejected,
         * the `todayRecord` attr will be unset.
         *
         * Current date will always be today when the function is called, but
         * later the date attribute could go stale if the date changes.
         *
         * @return {Promise}    Promise for a boolean
         */
        syncTodayRecord: function() {
            this.ensureTodayRecordIsCurrent();

            var deferredFetch = $q.defer();
            this.get('todayRecord').fetch({
                success: function(model) {
                    deferredFetch.resolve(true);
                },
                error: function(model, response) {
                    if (response[1] == 404) {
                        model.set('currentPeriod', null);
                        deferredFetch.resolve(false);
                    }
                    else {
                        deferredFetch.reject(response);
                    }
                }
            });

            return deferredFetch.promise;
        },

        // TODO: this doesn't follow BB conventions: BB doesn't expect to know ID
        //       when POSTing, but it does expect to know ID when GETing. Se if
        //       we define idAttribute = date, POST is screwed, if we don't, GET
        //       is screwed. Need to consider alternative. Probably something custom
        //       baked in todayDataManager.
        //
        // /**
        //  * Async function that tells the server to start data collection
        //  * for today. Returns promise that resolves to the DailyRecord model.
        //  *
        //  * Will update internal `todayRecord` attr.
        //  *
        //  * @return {Promise}    See description above
        //  */
        // initializeTodayRecord: function() {
        //     this.ensureTodayRecordIsCurrent();

        //     // don't `todayRecord`
        //     var todayRecord = this.get('todayRecord');

        //     // Backbone doesn't play well with our custom URL formats for daily records,
        //     // so we'll just manually POST the record
        //     todayRecord.set('currentPeriod', 1);

        //     var deferredSave = $q.defer();
        //     var classroom = this;
        //     todayRecord.save(null, {
        //         success: function(model) {
        //             deferredSave.resolve(model);
        //         },
        //         error: function(model, response) {
        //             // if response status is 409, it means the record already
        //             // exists. in this case, `syncTodayRecord` does just what
        //             // we need to get the existing record fetched
        //             if (response[1] === 409) {
        //                 classroom.syncTodayRecord().then(function() {
        //                     deferredSave.resolve(classroom.get('todayRecord'));
        //                 }, function() {
        //                     deferredSave.reject(response);
        //                 });
        //             }
        //             else {
        //                 deferredSave.reject(response);
        //             }
        //         }
        //     });

        //     return deferredSave.promise;
        // },

        /**
         * Async function that loads all collect data for the current date.
         * Returns promise that, when resolved, means that all students in
         * this classroom have a fully updated set of collect data. When
         * promise is rejected, student data is incomplete.
         *
         * @return {Promise}    See description above
         */
        loadDailyDigest: function() {
            this.get('students').each(function(s) {
                s.set('todayAttendanceSpans', [1]);
                s.set('todayBehaviorIncidents', [1, 1]);
                s.set('todayPointRecords', [1, 1, 1]);
            });
            var deferredFetch = $q.defer();
            deferredFetch.resolve();
            return deferredFetch.promise;
        },

        // if todayRecord is outdated, create a new one for today
        ensureTodayRecordIsCurrent: function() {
            var now = timeTracker.getTimestampAsMoment();
            if (this.get('todayRecord').get('date') !== now.format('YYYY-MM-DD')) {
                this.set('todayRecord', new DailyRecord({
                    classroom: this,
                    date: now.format()
                }));
            }
        }
    });
})

.factory('classroomDataStore', function(_, Backbone, Classroom, $q, apiConfig) {
    var ClassroomCollection = Backbone.Collection.extend({
        model: Classroom,
        url: apiConfig.toAPIUrl('classrooms/'),
        comparator: 'name',
    });

    // DailyRecords are odd resources that don't quite fit the BB mold -- just
    // handle them ad hoc
    var DailyRecord = function(classroom, date) {
        this.classroom = classroom;
        this.date = date;
        this.currentPeriod = undefined;

        this.urlRoot = function() {
            return this.classroom.url() + '/dailyrecords/';
        };

        this.url = function () {
            return this.urlRoot() + moment(this.get('date')).format('YYYYMMDD');
        };

        this.isSynced = function() {
            return !_.isUndefined(this.currentPeriod);
        };

        this.load = function() {
            var record = this;

            var httpPromise = $http.get({
                url: this.url()
            });

            httpPromise.success(function(data) {
                record.currentPeriod = data['current_period'];
                deferredResponse.resolve(true);
            });

            httpPromise.error(function(data, status) {
                if (response[1] == 404) {
                    record.currentPeriod = null;
                    deferredResponse.resolve(false);
                }
                else {
                    deferredResponse.reject(status);
                }
            });
        };

        this.save = function() {

        };

        this.startDay = function() {
            var httpPromise = $http.get({
                url: this.urlRoot()
            });

        };
    };

    return {
        classrooms: new ClassroomCollection(),

        /**
         * Fetches classrooms and returns a promise for the resulting
         * Collection.
         *
         * @return {Promise}    Promise for a Collection
         */
        load: function() {
            var deferredFetch = $q.defer();
            this.classrooms.fetch({
                success: function(collection) {
                    deferredFetch.resolve(collection);
                },
                error: function(collection, response) {
                    deferredFetch.reject(response);
                }
            });
            return deferredFetch.promise;
        },


    };
});
