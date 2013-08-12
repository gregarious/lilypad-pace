describe("PeriodicRecord", function() {
    describe(".initialize", function() {
        var ineligibleStudentRecord;
        beforeEach(inject(function(PeriodicRecord) {
             ineligibleStudentRecord = new PeriodicRecord({
                isEligible: false,
                points: {kw: 2, cw: 2, fd: 2, bs: 2}
            });
        
        }));

        it('sets all point values to null if initialized to not be eligible', function() {
            expect(ineligibleStudentRecord.get('points')).toBeDefined();
            _.each(ineligibleStudentRecord.get('points'), function(val) {
                expect(val).toBeNull();
            });
        });
    });

    describe('instance', function() {
        var periodicRecord;
        beforeEach(inject(function(PeriodicRecord) {
            periodicRecord = new PeriodicRecord();
        }));

        // TODO: turn .parse/.toJSON tests into side effects of fetch/save calls.
        // don't like testing internal API calls
        describe(".parse", function() {
            var serverResponse, response;
            serverResponse = {
                "id": 1,
                "last_changed_at": "2013-07-13T04:00:00Z",
                "period": 1,
                "date": "2013-07-12",
                "is_eligible": true,
                "kind_words_points": 2,
                "complete_work_points": 1,
                "follow_directions_points": 1,
                "be_safe_points": 0,
                "student": {
                    "id": 99
                }
            };

            beforeEach(function() {
                response = periodicRecord.parse(serverResponse);
            });

            it('packs point values into object', function() {
                expect(response.points).toEqual({kw: 2, cw: 1, fd: 1, bs: 0});
            });

            it('creates Student instance stub', inject(function(Student) {
                expect(response.student.constructor).toEqual(Student);
            }));
        });

        describe(".toJSON", function() {
            var requestData;
            beforeEach(function() {
                periodicRecord.set('points', {kw: 2, cw: 1, fd: 1, bs: 0});
                requestData = periodicRecord.toJSON();
            });

            it('unpacks points object into separate values', function() {
                expect(requestData.kind_words_points).toEqual(2);
                expect(requestData.complete_work_points).toEqual(1);
                expect(requestData.follow_directions_points).toEqual(1);
                expect(requestData.be_safe_points).toEqual(0);
            });
        });

        describe('with point values', function() {
            beforeEach(function() {
                periodicRecord.set({
                    points: {kw: 2, cw: 1, fd: 1, bs: 0},
                    isEligible: true
                });
            });

            describe('.getPointValue', function() {
                it('works with valid category code', function() {
                    expect(periodicRecord.getPointValue('cw')).toBe(1);
                });
                it('returns null if student is not eligible for points', function() {
                    periodicRecord.set('isEligible', false);
                    expect(periodicRecord.getPointValue('cw')).toBeNull();
                });
                it('returns null with invalid category code', function() {
                    expect(periodicRecord.getPointValue('xx')).toBeNull();
                });
            });

            describe('.setPointValue', function() {
                it('sets expected value', function() {
                    periodicRecord.setPointValue('cw', 2);
                    expect(periodicRecord.get('points').cw).toBe(2);
                });
                it('does nothing if category code is invalid', function() {
                    var origPoints = _.clone(periodicRecord.get('points'));
                    periodicRecord.setPointValue('xx', 2);
                    expect(periodicRecord.get('points')).toEqual(origPoints);
                });
                it('does nothing if student is ineligible', function() {
                    var origPoints = _.clone(periodicRecord.get('points'));
                    periodicRecord.set('isEligible', false);
                    periodicRecord.setPointValue('cw', 2);
                    expect(periodicRecord.get('points')).toEqual(origPoints);
                });
            });

            describe('.decrementPointValue', function() {
                it('reduces point value by 1', function() {
                    periodicRecord.decrementPointValue('cw');
                    expect(periodicRecord.get('points').cw).toBe(0);
                });
                it('does nothing if student is ineligible', function() {
                    var origPoints = _.clone(periodicRecord.get('points'));
                    periodicRecord.set('isEligible', false);
                    periodicRecord.decrementPointValue('cw');
                    expect(periodicRecord.get('points')).toEqual(origPoints);
                });
                it('does nothing if value is already 0', function() {
                    periodicRecord.decrementPointValue('bs');
                    expect(periodicRecord.get('points').bs).toBe(0);
                });
                it('does nothing if category code is invalid', function() {
                    var origPoints = _.clone(periodicRecord.get('points'));
                    periodicRecord.decrementPointValue('xx');
                    expect(periodicRecord.get('points')).toEqual(origPoints);
                });
            });
        });
    });
});
