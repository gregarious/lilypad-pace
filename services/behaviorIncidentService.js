// // TODO: use proper backbone module, not global `app`
// app.service('periodicRecordService', ['studentService', function(studentService) {

    var BehaviorIncidentType = Backbone.Model.extend({
        /*
            Attibutes:
                id : String
                code : String
                label : String
                supportsDuration : Boolean
                applicableStudent : Student or null
         */
        urlRoot: '/pace/behaviortypes/',

        parse: function(response, options) {
            // transform student stub dict into Student model
            response = Backbone.Model.prototype.parse.apply(this, arguments);
            if (response.applicableStudent) {
                response.applicableStudent = new studentService.Student(response.applicableStudent);
            }
            return response;
        }
    });

    // Collection returned by typesForStudent
    var StudentBehaviorTypeCollection = Backbone.Collection.extend({
        model: BehaviorIncidentType,

        initialize: function(models, options) {
            this._student = options.student;
        },

        url: function() {
            return this._student.get('behaviorTypesUrl');
        },

        /**
         * Creates a custom new incident type for a student.
         * @param  {String} label            
         * @param  {String} supportsDuration (default: false)
         * @param  {String} code             (optional)
         * @return {BehaviorIncidentType}                  
         */
        createIncidentType: function(label, supportsDuration, code, options) {
            return this.create({
                label: label,
                supportsDuration: supportsDuration || false,
                code: code || '',
                applicableStudent: this._student
            }, options);
        }
    });

    // StudentBehaviorTypeCollection store
    var behaviorTypesStore = {};
    /**
     * Returns a StudentBehaviorTypeCollection with models for the 
     * given student.
     * 
     * @param  {Student} student
     * @param  {String} refresh       should a fetch be performed if 
     *                                collection already exists? 
     *                                default: true
     * 
     * @return {StudentBehaviorTypeCollection}
     */
    var typesForStudent = function(student, refresh) {
        refresh = refresh || true;
        if (!behaviorTypesStore[student.id]) {
            behaviorTypesStore[student.id] = new StudentBehaviorTypeCollection([], {
                student: student
            });
            refresh = true;
        }
        if (refresh) {
            behaviorTypesStore[student.id].fetch();
        }
        return behaviorTypesStore[student.id];
    };


    var BehaviorIncident = Backbone.Model.extend({
        /*
            Attributes:
                id : String
                type : BehaviorIncidentType
                startedAt : Date
                endedAt : Date or null
                student : Student
         */

        // needed to allow for creating and saving isolated incidents
        urlRoot: '/pace/behaviorincidents/',

        parse: function(response, options) {
            // do basic parsing and case transformation
            response = Backbone.Model.prototype.parse.apply(this, arguments);

            // transform student stub dict into Student model and
            // type dict into (full) BehaviorIncidentType model
            response.student = new studentService.Student(response.student);
            response.type = new BehaviorIncidentType(response.type);

            return response;
        }
    });

    // Collection returned by dailyStudentIncidents.
    var DailyBehaviorIncidentCollection = Backbone.Collection.extend({
        model: BehaviorIncident,

        /**
         * Collection must be initialized with an options dict that
         * includes `student` and `dateString`.
         */
        initialize: function(models, options) {
            this._student = options.student;
            this._dateString = options.dateString;
        },

        url: function() {
            // Only query incidents that started on this collection's date
            var rangeStart = moment(this._dateString).format();
            var rangeEnd = moment(this._dateString).add('days', 1).format();
            var querystring = 'started_at__gte=' + rangeStart + '&' + 'started_at__lt=' + rangeEnd;
            return this._student.get('behaviorIncidentsUrl') + '?' + querystring;
        },

        /**
         * Wrapper around Collection.create that inserts student into 
         * attributes for new Model. Don't use create directly.
         *
         * TODO: note there's no sanity check that we're actually inserting
         * an incident that is happening on the given day. Need to consider
         * best way to handle this (should we even be using this collection
         * to create incidents?)
         *  
         * @param  {BehaviorIncidentType} type      
         * @param  {Date} startedAt 
         * @param  {Date or null} endedAt
         * @param  {String} comment   
         * @param  {Object} options             Typical Backbone.create options
         * @return {BehaviorIncident}
         */
        createIncident: function(type, startedAt, endedAt, comment, options) {
            // set arugment defaults
            endedAt = _.isUndefined(endedAt) ? null : endedAt;
            comment = _.isUndefined(comment) ? "" : comment;

            return this.create({
                student: this._student,
                type: type,
                startedAt: startedAt,
                endedAt: endedAt,
                comment: comment
            }, options);
        }
    });

    // DailyBehaviorIncidentCollection store
    var dailyIncidentsStore = {};

    /**
     * Returns a DailyBehaviorIncidentCollection with incidents for the 
     * given student and date.
     * 
     * @param  {Student} student
     * @param  {String} dateString    default: today's date as ISO string
     * @param  {String} refresh       should a fetch be performed if 
     *                                collection already exists? 
     *                                default: true
     * 
     * @return {DailyBehaviorIncidentCollection}
     */

    var dailyStudentIncidents = function(student, dateString, refresh) {
        // use today's day if no date was provided
        // TODO: use moment module for Angular
        dateString = dateString || moment().format('YYYY-MM-DD');
        refresh = _.isUndefined(refresh) ? true : refresh;

        if (!dailyIncidentsStore[student.id]) {
            dailyIncidentsStore[student.id] = {};
        }

        var incidentCollection = dailyIncidentsStore[student.id][dateString];
        if (!incidentCollection) {
            incidentCollection = new DailyBehaviorIncidentCollection([], {
                student: student,
                dateString: dateString
            });
            refresh = true;
            dailyIncidentsStore[student.id][dateString] = incidentCollection;
        }
        if (refresh) {
            incidentCollection.fetch();
        }

        return incidentCollection;
    };

    this.typesForStudent = typesForStudent;
    this.dailyStudentIncidents = dailyStudentIncidents;

    // TODO: remove. temporarily making these global for testing purposes
    window.behaviorIncidentService = {
        typesForStudent: typesForStudent,
        dailyStudentIncidents: dailyStudentIncidents
    };

// }]);
