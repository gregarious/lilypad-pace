describe("BehaviorIncident", function() {
    var incident;
    beforeEach(inject(function(BehaviorIncident) {
        incident = new BehaviorIncident();
    }));

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
