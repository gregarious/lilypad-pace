// TODO: use proper backbone module, not global `app`
app.service('periodicRecordService', ['studentService', function(studentService) {

    var PeriodicBehaviorRecord = Backbone.Model.extend({
        /*
            Attributes:
                id : String
                period : Integer
                date : String (ISO format)
                points : {
                    'kw' : Integer,
                    'cw' : Integer,
                    'fd' : Integer,
                    'bs' : Integer
                }
                isEligible : Boolean
            Relations:
                student : Student (HasOne)
         */

        relations: [{
            type: Backbone.HasOne,
            key: 'student',
            relatedModel: studentService.Student,
            reverseRelation: {
                key: 'periodicBehaviorRecords',
                includeInJSON: 'id'
            }
        }],

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

    var PeriodicBehaviorRecordCollection = Backbone.Collection.extend({
        model: PeriodicBehaviorRecord,
        url: '/periodicbehaviorrecords'
    });

    var DailyStudentRecordCollection = PeriodicBehaviorRecordCollection.extend({
        initialize: function(models, options) {
            // if student/date is provided, this collection should deal only with
            // records relevant to them
            this._student = options._student || null;
            this._dateString = options._dateString || null;
        },

        fetch: function() {
            Backbone.Collection.prototype.fetch.apply(this, arguments);
            // TODO: customize various sync methods like this to deal only with this student
        }
    });

    /**
     * Returns a DailyStudentRecordCollection with records for the 
     * given student and date.
     * 
     * @param  {Student} student
     * @param  {String} dateString    ISO-formatted date. Defaults to today's date
     * 
     * @return {DailyStudentRecordCollection}         [description]
     */
    var getDayRecords = function(student, dateString) {
        // use today's day if no date was provided
        // TODO: use moment module for Angular
        var dateQuery = dateString || moment().format('YYYY-MM-DD');
        var records = new DailyStudentRecordCollection([], {
            student: student,
            dateQuery: dateQuery
        });

        // TODO: fetch records
        return records;
    };

    /** Public interface of service **/

    // expose the model/collection classes
    this.PeriodicBehaviorRecord = PeriodicBehaviorRecord;
    this.PeriodicBehaviorRecordCollection = PeriodicBehaviorRecordCollection;
    this.StudentPeriodicRecordCollection = StudentPeriodicRecordCollection;
    this.getDayRecords = getDayRecords;

    // TODO: remove. temporarily making these global for testing purposes
    window.PeriodicBehaviorRecord = PeriodicBehaviorRecord;
    window.PeriodicBehaviorRecordCollection = PeriodicBehaviorRecordCollection;
    window.StudentPeriodicRecordCollection = StudentPeriodicRecordCollection;
    window.getDayRecords = getDayRecords;
}]);
