

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
                student : Student
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

    var StudentPeriodicRecordCollection = PeriodicBehaviorRecordCollection.extend({
        initialize: function(models, options) {
            // if student is provided, this collection should deal only with
            // records for the given Student
            this._student = options._student || null;
        },

        fetch: function() {
            Backbone.Collection.prototype.fetch.apply(this, arguments);
            // TODO: customize various sync methods like this to deal only with this student
        }
    });

    // expose the model/collection classes
    this.PeriodicBehaviorRecord = PeriodicBehaviorRecord;
    this.PeriodicBehaviorRecordCollection = PeriodicBehaviorRecordCollection;
    this.StudentPeriodicRecordCollection = StudentPeriodicRecordCollection;

    /**
     * Returns a StudentPeriodicRecordCollection with records for the 
     * given student and period.
     * 
     * @param  {Student} student
     * @param  {String} dateString    ISO-formatted date. Defaults to today's date.
     * @param  {Object} filterParams  Object to limit the scope of records 
     *                                 returned upon server fetch. 
     *                                 Accepted key/value pairs:
     *                                  - period: Integer
     *                                  - date: String (ISO format)
     * 
     * @return {PeriodicBehaviorRecordCollection}         [description]
     */
    this.getDayRecords = function(student, dateString) {
        var records = new StudentPeriodicRecordCollection([], {
            student: student
        });
        // Use today's day if no date was provided

        // TODO: use moment module for Angular
        var dateQuery = dateString || moment().format('YYYY-MM-DD');

        // TODO: fetch records for the given date
        return records;
    };

}]);