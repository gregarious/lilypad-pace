/**
 * Interface for all Models that can be part of a student's log.
 *
 * Specifications:
 * - getOccurredAt() -> Date
 * - getLabel() -> String
 * - getComment() -> String
 * - getDuration() -> Number (in seconds, null if not applicable)
 *
 *
 * Loggable Mixin:
 *
 * Since it's Javascript, there's no such thing as an explicit interface, but
 * the service below is a Backbone-flavored mixin for implementing the
 * interface in a sane way on a Model. To use this default functionality,
 * extend your new Backbone.Model type attributes with a new copy of the
 * mixin. For example:
 *
 * var NewType = Backbone.Model.extend(_.extend(new LoggableMixin(), {
 *     urlRoot: ...,
 *     ...
 * }));
 */
angular.module('pace').factory('LoggableMixin', function($log, moment) {
	return function() {
		this.getOccurredAt = function() { return this.get('occurredAt'); };
		this.getLabel = function() { return this.get('label'); };
		this.getDuration = function() { return this.get('duration'); };
		this.getComment = function() { return this.get('comment'); };
	};
});
