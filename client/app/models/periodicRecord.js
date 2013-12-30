angular.module('pace').factory('PeriodicRecord', function(_, Backbone, timeTracker, Student, PointLoss, apiConfig, mixpanel) {
    // utilities in use below
    var validPointpointTypes = ['kw', 'cw', 'fd', 'bs'];
    var isValidPointType = function(code) {
        return _.indexOf(validPointpointTypes, code) !== -1;
    };

    var InnerPointLossCollection = Backbone.Collection.extend({
        model: PointLoss,
        comparator: function(model) {
            return model.get('occurredAt');
        }
    });

    function createPointLoss(periodicRecord, pointType, occurredAt, comment) {
        // set arugment defaults
        comment = _.isUndefined(comment) ? "" : comment;

        // mandate that dates are actual Date objects
        occurredAt = moment(occurredAt).toDate();

        var attrs = {
            periodicRecord: periodicRecord,
            pointType: pointType,
            occurredAt: occurredAt,
            comment: comment
        };

        // mixpanel tracking
        mixpanel.track("Point loss");

        var newLoss = new PointLoss(attrs);
        newLoss.save();
        return newLoss;
    }

    Backbone.AppModels.PeriodicRecord = Backbone.RelationalModel.extend({
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
            Relations:
                pointLosses : Collection <PointLoss>
                student : Student
         */

        relations: [
            {
                key: 'student',
                relatedModel: Student,
                type: Backbone.HasOne,
                includeInJSON: Backbone.Model.prototype.idAttribute     // only send id back to server
            },
            {
                key: 'pointLosses',
                relatedModel: PointLoss,
                type: Backbone.HasMany,
                collectionType: InnerPointLossCollection,
                parse: true,
                includeInJSON: false,                                   // don't send point losses to server
                reverseRelation: {
                    key: 'periodicRecord',
                    type: Backbone.HasOne,
                    includeInJSON: Backbone.Model.prototype.idAttribute,    // only send id back to server
                }
            }
        ],

        defaults: function () {
            return {
                dateString: timeTracker.getTimestampAsMoment().format('YYYY-MM-DD'),
                isEligible: true
            };
        },

        urlRoot: apiConfig.toAPIUrl('periodicrecords/'),

        initialize: function(attributes, options) {
            // define points
            if(!this.get('points')) {
                var pts = {};
                var isEligible = this.get('isEligible');
                _.each(validPointpointTypes, function(code) {
                    pts[code] = isEligible ? 2 : null;
                });
                this.set('points', pts);
            }
        },

        parse: function(response, options) {
            // pack all point records into a `points` object
            response = Backbone.RelationalModel.prototype.parse.apply(this, arguments);

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
            var data = Backbone.RelationalModel.prototype.toJSON.apply(this, arguments);

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
         * get/set point values for particular point types.
         *
         * If student is not eligible, getPointValue will return null and
         * the setPointValue will be no-ops.
         *
         * Point types codes are among: 'kw', 'cw', 'fd', 'bs'
         */
        getPointValue: function(pointType) {
            if (this.get('isEligible') && isValidPointType(pointType)) {
                return this.get('points')[pointType];
            }
            else {
                return null;
            }
        },
        setPointValue: function(pointType, value) {
            if (this.get('isEligible') && isValidPointType(pointType)) {
                this.get('points')[pointType] = value;
                this.save();
            }
        },

        /**
         * Decrements the point value for the given type and returns
         * a new PointLoss instance.
         *
         * @param  {String} pointType   From list of point types
         * @return {PointLoss}
         */
        registerPointLoss: function(pointType) {
            if (this.get('isEligible') && isValidPointType(pointType)) {
                if (this.get('points')[pointType] >= 1) {
                    this.get('points')[pointType]--;
                    var lossRecord = createPointLoss(this, pointType, timeTracker.getTimestamp());

                    // disabled: relying on server to handle this on its own
                    // TODO: consider
                    // this.save();

                    return lossRecord;
                }
            }
            return null;
        },

        reversePointLoss: function(pointType) {
            if(isValidPointType(pointType)) {
                this.get('points')[pointType]++;
            }

            // disabled: relying on server to handle this on its own
            // this.save();
        },

        /**
         * Returns the total points earned for this record. Returns null
         * if student was not eligible for points.
         * @return {Integer or null}
         */
        getTotalPointValue: function() {
            if (!this.get('isEligible')) {
                return null;
            }
            var points = this.get('points');
            return points.kw + points.cw + points.fd + points.bs;
        }
    });

    return Backbone.AppModels.PeriodicRecord;
});
