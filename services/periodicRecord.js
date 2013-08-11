angular.module('pace').factory('PeriodicRecord', function(_, Backbone, Student) {
    // utilities in use below
    var validPointCategoryCodes = ['kw', 'cw', 'fd', 'bs'];
    var isValidPointCategoryCode = function(code) {
        return _.indexOf(validPointCategoryCodes, code) !== -1;
    };

    return Backbone.Model.extend({
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

        initialize: function(attributes, options) {
            dump(attributes);
            if(!this.get('isEligible')) {
                var pts = {};
                _.each(validPointCategoryCodes, function(code) {
                    pts[code] = null;
                });
                this.set('points', pts);
            }
        },

        parse: function(response, options) {
            // transform student stub dict into Student model and pack all
            // point records into a `points` object

            response = Backbone.Model.prototype.parse.apply(this, arguments);
            response.student = new Student(response.student);
            
            var valueOrNull = function(val) {return !_.isUndefined(val) ? val : null; };
            response.points = {
                kw: valueOrNull(response.kindWordsPoints),
                cw: valueOrNull(response.completeWorkPoints),
                fd: valueOrNull(response.followDirectionsPoints),
                bs: valueOrNull(response.beSafePoints)
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
            if (this.get('isEligible') && isValidPointCategoryCode(categoryCode)) {
                return this.get('points')[categoryCode];
            }
            else {
                return null;
            }
        },
        setPointValue: function(categoryCode, value) {
            if (this.get('isEligible') && isValidPointCategoryCode(categoryCode)) {
                this.get('points')[categoryCode] = value;
                this.save();
            }
        },
        decrementPointValue: function(categoryCode) {
            if (this.get('isEligible') && isValidPointCategoryCode(categoryCode)) {
                if (this.get('points')[categoryCode] >= 1) {
                    this.get('points')[categoryCode]--;
                    this.save();
                }
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
});
