describe("BehaviorIncidentType", function() {
  var incidentType;
  beforeEach(inject(function(BehaviorIncidentType, Student) {
    incidentType = new BehaviorIncidentType();
  }));

  describe("constructor", function() {
    it("defaults `supportsDuration` to false", function() {
      expect(incidentType.get('supportsDuration')).toBe(false);
    });
  });

  describe(".parse", function() {
    it("creates a Student instance stub for `applicableStudent`", inject(function(Student) {
      var responseJSON = {
        "id": 1,
        "applicableStudent": {
          "id": 99
        }
      };
      var response = incidentType.parse(responseJSON);
      expect(response.applicableStudent.constructor).toBe(Student);
    }));
  });
});
