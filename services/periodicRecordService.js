angular.module('pace').service('periodicRecordService', function(Backbone, moment, Student) {
    var PeriodicRecord = Backbone.Model.extend({
        /*
            Attributes:
                id : String
                url : String
                period : Integer
                dateString : String (ISO format)
                points : {
                    'kw' : Integer,
                    'cw' : Integer,
                    'fd' : Integer,
                    'bs' : Integer
                }
                isEligible : Boolean
                student : Student
         */
        urlRoot: '/pace/periodicrecords/',

        parse: function(response, options) {
            // transform student stub dict into Student model and pack all
            // point records into a `points` object

            response = Backbone.Model.prototype.parse.apply(this, arguments);
            response.student = new Student(response.student);
            response.points = {
                kw: response.kindWordsPoints || null,
                cw: response.completeWorkPoints || null,
                fd: response.followDirectionsPoints || null,
                bs: response.beSafePoints || null
            };

            delete response.kindWordsPoints;
            delete response.completeWorkPoints;
            delete response.followDirectionsPoints;
            delete response.beSafePoints;

            return response;
        },

        toJSON: function() {
            // camelize the data keys first
            var data = Backbone.Model.prototype.toJSON.apply(this, arguments);

            // unpack point records
            var points = data.points;
            delete data.points;
            data['kind_words_points'] = points && points.kw;
            data['complete_work_points'] = points && points.cw;
            data['follow_directions_points'] = points && points.fd;
            data['be_safe_points'] = points && points.bs;

            return data;
        },

        /**
         * Various methods to get/set point values for particular categories.
         * 
         * If student is not eligible, getPointValue will return null and
         * the set methods will be no-ops.
         * 
         * Category codes are among: 'kw', 'cw', 'fd', 'bs'
         */
        getPointValue: function(categoryCode) {
            if (this.get('isEligible')) {
                return this.get('points')[categoryCode];
            }
            else {
                return null;
            }
        },
        setPointValue: function(categoryCode, value) {
            if (this.get('isEligible')) {
                this.get('points')[categoryCode] = value;
                this.save();
            }
        },
        decrementPointValue: function(categoryCode) {
            if (this.get('isEligible')) {
                this.get('points')[categoryCode]--;
                this.save();
            }
        },

        /**
         * Returns the total points earned for this record. Returns null
         * if student was not eligible for points.
         * @return {Integer or null}
         */
        totalPoints: function() {
            if (!this.get('isEligible')) {
                return null;
            }
            var points = this.get('points');
            return points.kw + points.cw + points.fd + points.bs;
        }
    });

    // Collection returned by dailyStudentRecords.
    var DailyStudentRecordCollection = Backbone.Collection.extend({
        model: PeriodicRecord,

        /**
         * Collection must be initialized with an options dict that
         * includes `student` and `dateString`.
         */
        initialize: function(models, options) {
            this._student = options.student;
            this._dateString = options.dateString;
        },

        url: function() {
            return this._student.get('periodicRecordsUrl') + '?date=' + this._dateString;
        },

        /**
         * Return the PeriodicRecord model corresponding
         * to the given period number.
         * 
         * @param  {Integer} period
         * @return {PeriodicRecord or undefined}
         */
        getPeriodicRecord: function(period) {
            return this.findWhere({period: period});
        },

        /**
         * Wrapper around Collection.create that inserts student and date into
         * attributes for new Model. Don't use create directly.
         * @param  {Integer}  period           
         * @param  {Boolean}  isEligible         (default true)
         * @param  {Integer}  initialPointValue  (default 2 if eligible, null if not)
         * @param  {Object} options              Typical Backbone.create options
         * @return {PeriodicRecord}
         */
        createPeriodicRecord: function(period, isEligible, initialPointValue, options) {
            isEligible = isEligible || true;
            initialPointValue = initialPointValue || (isEligible ? 2 : null);
            return this.create({
                student: this._student,
                date: this._dateString,
                period: period,
                isEligible: isEligible,
                points: {
                    kw: initialPointValue,
                    cw: initialPointValue,
                    fd: initialPointValue,
                    bs: initialPointValue
                }
            }, options);
        }
    });

    // DailyStudentRecordCollection store
    var dailyRecordsStore = {};
    /**
     * Returns a DailyStudentRecordCollection with records for the 
     * given student and date.
     * 
     * @param  {Student} student
     * @param  {String} dateString    default: today's date as ISO string
     * @param  {String} options       if {refresh: true} in options, a fetch
     *                                will be performed when the collection
     *                                already exists.
     * 
     * @return {DailyStudentRecordCollection}
     */
    var dailyStudentRecords = function(student, dateString, options) {
        // use today's day if no date was provided
        dateString = dateString || moment().format('YYYY-MM-DD');
        var refresh = options && options.refresh;

        if (!dailyRecordsStore[student.id]) {
            dailyRecordsStore[student.id] = {};
        }

        var recordCollection = dailyRecordsStore[student.id][dateString];
        if (!recordCollection) {
            recordCollection = new DailyStudentRecordCollection([], {
                student: student,
                dateString: dateString
            });
            refresh = true;
            dailyRecordsStore[student.id][dateString] = recordCollection;
        }
        if (refresh) {
            // TODO: revisit the non-destructive nature of the fetch
            recordCollection.fetch({remove: false});
        }

        return recordCollection;
    };

    /** Public interface of service **/

    // expose the student accessor function
    this.dailyStudentRecords = dailyStudentRecords;
});
