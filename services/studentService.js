// TODO: put closure around all this global action
// TODO: use proper backbone module

var Student = Backbone.RelationalModel.extend({
    /* Attributes:
        first_name
        last_name

       Reverse relations:
        behaviorIncidents
        periodicBehaviorRecords
       */

    // cache the current status of the student here
    // Note that this isn't an attribute because it's not part of the resource
    _isPresent: false,

    // TODO: hook this function to some kind of model sync event
    _determineIfPresent: function() {
        // TODO: figure out _isPresent status from server
    },

    markAbsent: function() {
        // TODO: mark student absent on server
        this._isPresent = false;
    },
    markPresent: function() {
        // TODO: mark student present on server
        this._isPresent = true;
    },
    isPresent: function() {
        return this._isPresent;
    }
});

var StudentCollection = Backbone.Collection.extend({
    model: Student,
    url: '/students'
});

app.service('studentService', function(){
    this.getStudents = function() {
        // TODO: flesh out with fake data
        return new StudentCollection();
    };
});
