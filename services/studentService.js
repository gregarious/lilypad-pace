// TODO: use proper backbone module, not global `app`
app.service('studentService', function(){
    var Student = Backbone.RelationalModel.extend({
        /* 
            Attributes:
                id
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

    var getStudents = function() {
        // TODO: flesh out with fake data
        return new StudentCollection();
    };

    /** Public interface of service **/

    this.Student = Student,
    this.StudentCollection = StudentCollection,
    this.getStudents = getStudents;


    // TODO: remove. temporarily making these global for testing purposes
    window.Student = Student;
    window.StudentCollection = StudentCollection;
    window.getStudents = getStudents;
});
