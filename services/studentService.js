// TODO: use proper backbone module, not global `app`
// app.service('studentService', function(){
    var Student = Backbone.Model.extend({
        /* 
            Attributes:
                id : Integer
                url : String
                firstName : String 
                lastName : String

                periodicRecordsUrl : String
                behaviorTypesUrl : String
                behaviorIncidentsUrl : String
        */

        urlRoot: '/pace/students',

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
        url: '/pace/students'
    });

    var getStudents = function() {
        s = new StudentCollection();
        s.fetch();
        return s;
    };

    /** Public interface of service **/

    // this.Student = Student,
    // this.StudentCollection = StudentCollection,
    // this.getStudents = getStudents;


    // TODO: remove. temporarily making these global for testing purposes
    window.studentService = {
        Student: Student,
        StudentCollection: StudentCollection,
        getStudents: getStudents
    };
// });
