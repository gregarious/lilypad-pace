angular.module('pace').factory('PeriodicRecord', function(_, Backbone, timeTracker, Student, PointLoss, pointLossDataStore) {
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
                pointLosses : Collection
                student : Object (Student stub)
         */
        urlRoot: '/pace/periodicrecords/',

        initialize: function(attributes, options) {
            if(!this.get('isEligible')) {
                var pts = {};
                _.each(validPointpointTypes, function(code) {
                    pts[code] = null;
                });
                this.set('points', pts);
            }

            var pointLosses = this.get('pointLosses');
            if (pointLosses) {
                // if `pointLosses` is a bare array, make it a Collection
                if(!pointLosses.models) {
                    pointLosses = new InnerPointLossCollection(pointLosses);
                    this.set('pointLosses', pointLosses);
                }
                // ensure each PointLoss has a reference to it's parent PdRecord (this)
                pointLosses.each(function(pl) {
                    pl.set('periodicRecord', this);
                }, this);
            }
        },

        parse: function(response, options) {
            // pack all point records into a `points` object
            var camelResponse = Backbone.Model.prototype.parse.apply(this, arguments);

            var valueOrNull = function(val) {return !_.isUndefined(val) ? val : null; };
            camelResponse.points = {
                kw: valueOrNull(camelResponse.kindWordsPoints),
                cw: valueOrNull(camelResponse.completeWorkPoints),
                fd: valueOrNull(camelResponse.followDirectionsPoints),
                bs: valueOrNull(camelResponse.beSafePoints)
            };

            delete camelResponse.kindWordsPoints;
            delete camelResponse.completeWorkPoints;
            delete camelResponse.followDirectionsPoints;
            delete camelResponse.beSafePoints;

            // transform case for embedded point loss attributes
            if (camelResponse.pointLosses) {
                camelResponse.pointLosses = _.map(camelResponse.pointLosses, function(attrs) {
                    return PointLoss.prototype.parse(attrs);
                });
            }

            return camelResponse;
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

            // remove nested point losses
            delete data.point_losses;

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
                    var lossRecord = pointLossDataStore.createPointLoss(
                        this,
                        pointType,
                        timeTracker.getTimestamp()
                    );

                    // TODO-greg: resolve this potential race condition on the server (have a localSave method?)
                    this.save();

                    return lossRecord;
                }
            }
            return null;
        },

        reversePointLoss: function(pointType) {
            if(isValidPointType(pointType)) {
                this.get('points')[pointType]++;
            }

            // TODO: resolve this potential race condition on the server
            this.save();
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
});
