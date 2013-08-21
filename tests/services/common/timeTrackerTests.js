describe("timeTracker", function() {
    it('has attribute `currentDate`', inject(function(timeTracker) {
        expect(timeTracker.currentDate).toBeDefined();
    }));
    it('has attribute `currentPeriod`', inject(function(timeTracker) {
        expect(timeTracker.currentPeriod).toBeDefined();
    }));
});
