describe("behaviorIncidentAccessors", function() {
    // TODO: re-enable (and reconfigure for promises) once I figure out why we're having trouble with $http
    xdescribe(".studentBehaviorTypes", function() {
        var student, studentBehaviorTypes, types;
        beforeEach(inject(function(Student, behaviorIncidentAccessors) {
            studentBehaviorTypes = behaviorIncidentAccessors.studentBehaviorTypes;

            // mock out syncing for now
            spyOn(Backbone, 'sync');

            student = new Student({id: 4});
            types = studentBehaviorTypes(student);
        }));

        it('returns a StudentBehaviorTypeCollection with expected settings', inject(function(StudentBehaviorTypeCollection) {
            expect(types.constructor).toBe(StudentBehaviorTypeCollection);
            expect(types._student).toBe(student);
        }));

        it('returns the same collection instance when called twice', function() {
            var types2 = studentBehaviorTypes(student);
            expect(types2).toBe(types);
        });
    });

    describe(".createIncident", function() {
        var type, student, newIncident, incidentDate;

        beforeEach(inject(function(Student, BehaviorIncidentType, behaviorIncidentAccessors) {
            type = new BehaviorIncidentType({
                label: 'The Type'
            });
            student = new Student({
                id: 4,
                behaviorIncidentsUrl: '/pace/students/4/behaviorincidents/'
            });
            incidentDate = new Date();
            newIncident = behaviorIncidentAccessors.createIncident(
                student, type, incidentDate);
        }));

        xit('POSTs new incident resource', function() {
            // expect POST to new incident endpoint
        });

        it('creates an instance with expected student', function() {
            expect(newIncident.get('student')).toBe(student);
        });

        it('creates an instance with expected type', function() {
            expect(newIncident.get('type')).toBe(type);
        });

        it('creates an instance with expected `startedAt`', function() {
            expect(newIncident.get('startedAt')).toEqual(incidentDate);
        });

        it('defaults to creating a record with `endedAt` == null', function() {
            expect(newIncident.get('endedAt')).toBeNull();
        });

        it('defaults to creating a record with `comment` == ""', function() {
            expect(newIncident.get('comment')).toBe("");
        });
    });

    xdescribe(".dailyStudentIncidents", function() {
        var student, dateString, dailyStudentIncidents, incidents;
        beforeEach(inject(function(Student, behaviorIncidentAccessors) {
            dailyStudentIncidents = behaviorIncidentAccessors.dailyStudentIncidents;

            // mock out syncing for now
            spyOn(Backbone, 'sync');

            student = new Student({id: 4});
            dateString = '2013-01-01';
            incidents = dailyStudentIncidents(student, dateString);
        }));

        it('returns a DailyStudentIncidentCollection with expected settings', inject(function(DailyStudentIncidentCollection) {
            expect(incidents.constructor).toBe(DailyStudentIncidentCollection);
            expect(incidents._student).toBe(student);
            expect(incidents._dateString).toBe('2013-01-01');
        }));

        it('returns the same collection instance when called twice', function() {
            var incidents2 = dailyStudentIncidents(student, dateString);
            expect(incidents).toBe(incidents2);
        });

        it("returns collection for today's date if none is specified", function() {
            var today = moment().format('YYYY-MM-DD');
            var todayIncidents = dailyStudentIncidents(student);
            expect(todayIncidents._dateString).toBe(today);
        });
    });
});
