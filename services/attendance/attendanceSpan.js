angular.module('pace').factory('AttendanceSpan', function(Backbone) {
	return Backbone.Model.extend({
		urlRoot: '/pace/attendancespans/'
	});
});
