describe("StudentBehaviorTypeCollection", function() {
    // set up some values to be used in specs below
    var student;
    beforeEach(inject(function(Student) {
        student = new Student({
            id: 4,
            behaviorTypesUrl: '/pace/students/4/behaviortypes/'
        });
    }));

    describe("constructor", function() {
        it("should fail if called with no student", inject(function(StudentBehaviorTypeCollection) {
            var newCall = function() {
                new StudentBehaviorTypeCollection();
            };
            expect(newCall).toThrow();
        }));
    });

    describe("instance", function() {
        var collection;
        beforeEach(inject(function(StudentBehaviorTypeCollection) {
            // mock out syncing for now
            spyOn(Backbone, 'sync');

            collection = new StudentBehaviorTypeCollection([], {
                student: student
            });
        }));

        describe('.url', function() {
            it('should return expected url', function() {
                expect(collection.url()).toBe('/pace/students/4/behaviortypes/');
            });
        });

        describe('.createPeriodicRecord', function() {
            beforeEach(function() {
                spyOn(collection, 'create').andCallThrough();
            });

            it('defers to .create', function() {
                var newType = collection.createIncidentType('New Type', true, 'NT');
                expect(collection.create).toHaveBeenCalled();
                // sanity check, just ensure model is in collection
                expect(collection).toContain(newType);
            });

            it('creates an instance with expected student', function() {
                var newType = collection.createIncidentType('New Type');
                expect(newType.get('applicableStudent')).toBe(student);
            });

            it('defaults to creating a record with `supportsDuration` == false', function() {
                var newType = collection.createIncidentType('New Type');
                expect(newType.get('supportsDuration')).toBe(false);
            });

            it('defaults to creating a record with `code` == ""', function() {
                var newType = collection.createIncidentType('New Type');
                expect(newType.get('code')).toBe("");
            });
        });
    });
});
