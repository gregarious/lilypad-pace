describe("BehaviorIncident", function() {
    var incident;
    beforeEach(inject(function(BehaviorIncident, BehaviorIncidentType) {
        incident = new BehaviorIncident();
    }));

    it('implements the Loggable interface', function() {
        expect(incident).toImplementLoggable();
    });

    describe('Loggable interface implementation', function() {
        var student;
        beforeEach(inject(function(Student, BehaviorIncident, BehaviorIncidentType) {
            student = new Student();
            incident = new BehaviorIncident({
                student: student,
                startedAt: new Date(2013, 1, 1, 12, 0, 0),
                endedAt: new Date(2013, 1, 1, 12, 1, 0),
                type: new BehaviorIncidentType({label: 'New Type'})
            });

        }));

        it("responds to .getStudent", function() {
            expect(incident.getStudent()).toBe(student);
        });

        it("responds to .getOccurredAt", function() {
            expect(incident.getOccurredAt()).toEqual(new Date(2013, 1, 1, 12, 0, 0));
        });

        describe('.getDuration with no endedAt attribute', function() {
            it('returns null', function() {
                incident.unset('endedAt');
                expect(incident.getDuration()).toBeNull();
            });
        });

        describe('.getDuration with an endedAt attribute', function() {
            it('returns duration', function() {
                expect(incident.getDuration()).toBe(60);
            });
        });

        it("responds to .getLabel with type label", function() {
            expect(incident.getLabel()).toBe('New Type');
        });
    });

    describe(".parse", function() {
        var response;
        beforeEach(function() {
            var responseJSON = {
                id: 1,
                "started_at": "2013-01-01T13:00:00Z",
                "ended_at": "2013-01-01T14:00:00Z",
                "student": {
                    "id": 99
                },
                "type": {
                    "id": 3
                }
            };
            response = incident.parse(responseJSON);
        });

        it("creates a Student instance stub for `student`", inject(function(Student) {
            expect(response.student.constructor).toBe(Student);
        }));

        it("creates a BehaviorIncidentType instance stub for `type`", inject(function(BehaviorIncidentType) {
            expect(response.type.constructor).toBe(BehaviorIncidentType);
        }));

        it("creates a Date object for startedAt", inject(function() {
            expect(response.startedAt).toEqual(moment('2013-01-01T13:00:00Z').toDate());
        }));

        it("creates a Date object for endedAt", inject(function() {
            expect(response.endedAt).toEqual(moment('2013-01-01T14:00:00Z').toDate());
        }));
    });
});
