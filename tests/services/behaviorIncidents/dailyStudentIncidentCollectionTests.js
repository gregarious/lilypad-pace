describe("DailyStudentIncidentCollection", function() {
    // set up some values to be used in specs below
    var student, dateString;
    beforeEach(inject(function(Student) {
        student = new Student({
            id: 4,
            behaviorIncidentsUrl: '/pace/students/4/behaviorincidents/'
        });
        dateString = '2013-01-01';
    }));

    describe("constructor", function() {
        it("should fail if called with no student", inject(function(DailyStudentIncidentCollection) {
            var newCall = function() {
                new DailyStudentIncidentCollection({dateString: dateString});
            };
            expect(newCall).toThrow();
        }));

        it("should fail if called with no date", inject(function(DailyStudentIncidentCollection) {
            var newCall = function() {
                new DailyStudentIncidentCollection({student: student});
            };
            expect(newCall).toThrow();
        }));
    });

    describe("instance", function() {
        var collection;
        beforeEach(inject(function(DailyStudentIncidentCollection) {
            // mock out syncing for now
            spyOn(Backbone, 'sync');

            collection = new DailyStudentIncidentCollection([], {
                student: student,
                dateString: dateString
            });
        }));

        describe('.url', function() {
            it('should return expected url with date range', function() {
                expect(collection.url()).toBe('/pace/students/4/behaviorincidents/?started_at__gte=2013-01-01T00:00:00-05:00&started_at__lt=2013-01-02T00:00:00-05:00');
            });
        });

        describe('.createIncident', function() {
            var newType, newIncident;
            beforeEach(inject(function(BehaviorIncidentType) {
                spyOn(collection, 'create').andCallThrough();
                newType = new BehaviorIncidentType({
                    label: 'New Type'
                });
                newIncident = collection.createIncident(newType, new Date());
            }));

            it('defers to create', function() {
                expect(collection.create).toHaveBeenCalled();
                // sanity check, just ensure model is in collection
                expect(collection).toContain(newIncident);
            });

            it('creates an instance with expected student', function() {
                expect(newIncident.get('student')).toBe(student);
            });

            it('creates an instance with expected type', function() {
                expect(newIncident.get('type')).toBe(newType);
            });

            it('defaults to creating a record with `endedAt` == null', function() {
                expect(newIncident.get('endedAt')).toBeNull();
            });

            it('defaults to creating a record with `comment` == ""', function() {
                expect(newIncident.get('comment')).toBe("");
            });
        });
    });
});
