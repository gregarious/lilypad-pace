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
					_.isFunction(this.actual.getStudent) &&
					_.isFunction(this.actual.getComment);
		}
	});
}));

describe('LoggableMixin', function() {
	var LoggableModel;

	beforeEach(inject(function(LoggableMixin, Backbone) {
		LoggableModel = Backbone.Model.extend(_.extend(new LoggableMixin(), {}));
	}));

	it('implements the loggable interface', function() {
		expect(new LoggableModel()).toImplementLoggable();
	});
});
