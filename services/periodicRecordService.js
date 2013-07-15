// TODO: use proper backbone module, not global `app`
// app.service('periodicRecordService', ['studentService', function(studentService) {

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
        urlRoot: '/pace/periodicrecords',

        parse: function(response, options) {
            response = Backbone.Model.prototype.parse.apply(this, arguments);
            response.student = new Student(response.student);
            response.points = {
                kw: response.kindWordsPoints,
                cw: response.completeWorkPoints,
                fd: response.followDirectionsPoints,
                bs: response.beSafePoints
            };
            delete response.kindWordsPoints;
            delete response.completeWorkPoints;
            delete response.followDirectionsPoints;
            delete response.beSafePoints;
            return response;
        },

        toJSON: function() {
            // camelize the data keys
            var data = Backbone.Model.prototype.toJSON.apply(this, arguments);
            var points = data.points;
            delete data.points;

            data.student = data.student && data.student.toJSON();
            data.kindWordsPoints = data.points && data.points.kw;
            data.completeWorkPoints = data.points && data.points.cw;
            data.followDirectionsPoints = data.points && data.points.fd;
            data.beSafePoints = data.points && data.points.bs;

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

    // Collection returned by getDayRecords.
    var DailyStudentRecordCollection = Backbone.Collection.extend({
        model: PeriodicRecord,

        initialize: function(models, options) {
            // if student/date is provided, this collection should deal only with
            // records relevant to them
            this._student = options.student || null;
            this._dateString = options.dateString || null;
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
         * attributes for new Model.
         * @param  {Integer}  period           
         * @param  {Boolean}  isEligible         (default true)
         * @param  {Integer}  initialPointValue  (default 2 if eligible, null if not)
         * @return {PeriodicRecord}
         */
        createPeriodicRecord: function(period, isEligible, initialPointValue) {
            isEligible = isEligible || false;
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
            });
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
     * @param  {String} refresh       should a fetch be performed if 
     *                                collection already exists? 
     *                                default: true
     * 
     * @return {DailyStudentRecordCollection}         [description]
     */
    var getDayRecords = function(student, dateString, refresh) {
        // use today's day if no date was provided
        // TODO: use moment module for Angular
        dateString = dateString || moment().format('YYYY-MM-DD');

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
            recordCollection.fetch();
        }
        
        return recordCollection;
    };

    /** Public interface of service **/

    // expose the model/collection classes
    // this.PeriodicRecord = PeriodicRecord;
    // this.getDayRecords = getDayRecords;

    // TODO: remove. temporarily making these global for testing purposes
    window.periodicRecordService = {
        PeriodicRecord: PeriodicRecord,
        getDayRecords: getDayRecords
    };
// }]);
