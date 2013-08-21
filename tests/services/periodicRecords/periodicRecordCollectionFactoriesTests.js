// TODO: complete when $http stuff figured out.
xdescribe('periodicRecordCollectionFactories', function() {
    describe('studentRecords', function() {
        // result stores a Collection of periodicRecords objects
        // it respects date
        // it calls endpoints for periodicRecords
        // collection is sorted by period numbers

        var student, dateString, collection;
        describe('instance', function() {
            // set up some values to be used in specs below
            beforeEach(inject(function(Student, periodicRecordCollectionFactories) {
                student = new Student({
                    id: 4,
                    periodicRecordsUrl: '/pace/students/4/periodicrecords/'
                });
                dateString = '2013-01-01';
                collection = periodicRecordCollectionFactories.studentRecords(student, dateString);
            }));

            describe('.getByPeriod', function() {
                it('should return expected model when queried', function() {
                    expect(collection.getByPeriod(1).get('period')).toBe(1);
                });
                it("should return undefined when queried period doesn't exist", function() {
                    expect(collection.getByPeriod(3)).toBeUndefined();
                });
                it('should return the latest period if no argument given', function() {
                    expect(collection.getByPeriod(1).get('period')).toBe(2);
                });
            });

            describe('.getAvailablePeriods', function() {
                it('should return array of periods numbers in collection', function() {
                    expect(collection.getAvailablePeriods()).toEqual([1,2]);
                });
            });
        });
    });
});
