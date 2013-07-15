// TODO: use proper backbone module, not global `app`
// app.service('studentService', function(){
    var Student = Backbone.Model.extend({
        /* 
            Attributes:
                id : Integer
                url : String
                firstName : String 
                lastName : String
                isPresent : Boolean (not part of resource)

                periodicRecordsUrl : String
                behaviorTypesUrl : String
                behaviorIncidentsUrl : String
        */

        urlRoot: '/pace/students',

        parse: function(request, options) {
            response = Backbone.Model.prototype.parse.apply(this, arguments);
            
            // TODO: determine this from API data. For now just defaulting to absent
            response.isPresent = false;
            return response;
        },

        markAbsent: function() {
            // TODO: mark student absent on server
            this.set('isPresent', false);
        },
        markPresent: function() {
            // TODO: mark student present on server
            this.set('isPresent', true);
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
