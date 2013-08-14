/**
 * Tests for the Loggable interface
 */

beforeEach(inject(function(_) {
	this.addMatchers({
		/**
		 * Ensure object responds to the 4 Loggable interface functions.
		 */
		toImplementLoggable: function() {
			return _.isFunction(this.actual.getOccurredAt) &&
					_.isFunction(this.actual.getLabel) &&
					_.isFunction(this.actual.getDuration) &&
					_.isFunction(this.actual.getStudent);
		}
	});
}));

describe('Loggable', function() {
	var loggableModel;

	beforeEach(inject(function(Loggable, Backbone) {
		loggableModel = _.extend(new Backbone.Model(), Loggable);
	}));

	it('implements the loggable interface', function() {
		expect(loggableModel).toImplementLoggable();
	});
});
