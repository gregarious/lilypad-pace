// maintains shared viewstate
app.service('viewService', function() {
    return {
        data_view: null,
        get currentView() {return this.data_view},
        set currentView(newView) {
            // if the view has changed, old parameters are irrelevant
            if (this.data_view !== newView) {
                this.data_view = newView;
                this.parameters = {};
            }
        },
        parameters: {},
        disabled: false
    };
});


(function(){
    var BehaviorIncidentType = Backbone.Model.extend({
        // defaults included to show the format of the attributes
        defaults: {
            id: '',
            code: '',
            label: '',
            supports_duration: false
        },

        /**
         * Factory function to create a new BehaviorIncident instance
         * @param  {Date} occurred_at   Time of incident (or time it began if has duration)
         * @param  {String} comment
         * @param  {Integer} duration   (Optional) Duration of incident in seconds
         * @return {BehaviorIncident}
         */
        createNewIncident: function(occurred_at, comment, duration) {
            // TODO: just a stub
            console.log('[[createNewIncident for ' + this.get('code') + ' type]]');
            return new BehaviorIncident();
        }
    });

    // Sample BehaviorIncidentTypes created for example. These will come from the server.
    var PDType = new BehaviorIncidentType({
        code: 'PD',
        label: 'Property Destruction',
        supports_duration: false
    });
    var OOAType = new BehaviorIncidentType({
        code: 'OOA',
        label: 'Out of Area',
        supports_duration: true
    });

    var BehaviorIncidentTypeCollection = Backbone.Collection.extend({
        model: BehaviorIncidentType
    });

    var BehaviorIncident = Backbone.Model.extend({
        // defaults included to show the format of the attributes
        defaults: {
            id: '',
            occurred_at: null,
            duration: null,
            comment: '',
            type: null
        }
    });
    var BehaviorIncidentCollection = Backbone.Collection.extend({
        model: BehaviorIncident
    });

    var PeriodicBehaviorRecord = Backbone.Model.extend({
        // defaults included to show the format of the data
        defaults: {
            id: null,
            period: null,
            date: null,
            points: {
                'ukw': 2,
                'dw': 2,
                'fd': 2,
                'bs': 2
            }
        },

        /**
         * Various methods to set point values for particular categories.
         * Category codes are among: 'ukw', 'dw', 'fd', 'bs'
         */
        getPointValue: function(categoryCode) {
            return this.get('points')[categoryCode];
        },
        setPointValue: function(categoryCode, value) {
            this.get('points')[categoryCode] = value;
        },
        decrementPointValue: function(categoryCode) {
            this.get('points')[categoryCode]--;
        },

        /**
         * Returns the total points earned for this record
         * @return {Integer}
         */
        totalPoints: function() {
            var points = this.get('points');
            return points.ukw + points.dw + points.fd + points.bs;
        }
    });
    var PeriodicBehaviorRecordCollection = Backbone.Collection.extend({
        model: PeriodicBehaviorRecord
    });

    var DiscussionThread = Backbone.Model.extend({
        // defaults included to show the format of the attributes
        defaults: {
            id: null,
            notes: [],      // array of {author: <String>, content: <String>, posted_at: <Date>} objects
            title: ''
        },

        /**
         * Adds a new note to the current discussion
         * @param  {String} author  Plain-text name of author
         * @param  {String} content
         * @return {undefined}
         */
        postNote: function(author, content) {
            // TODO: just a stub
        }
    });
    var DiscussionThreadCollection = Backbone.Collection.extend({
        model: DiscussionThread
    });

    var Student = Backbone.Model.extend({
        // defaults included to show the format of the attributes
        defaults: {
            id: null,
            first_name: '',
            last_name: '',
            periodicBehaviorRecords: new PeriodicBehaviorRecordCollection(),
            discussionThreads: new DiscussionThreadCollection(),
            behaviorTypes: new BehaviorIncidentTypeCollection(),
            behaviorIncidents: new BehaviorIncidentCollection()
        },

        /**
         * Sets up and initializes a new PeriodicBehaviorRecord for this student
         * with the given period and date.
         * @param  {Integer} period
         * @param  {String} date   (format "YYYY-MM-DD")
         * @return {PeriodicBehaviorRecord}
         */
        initializePeriod: function(period, date) {
            // TODO: just a stub
            return new PeriodicBehaviorRecord();
        },

        /**
         * Marks the given student as present/absent as of the current time.
         * Calling markPresent/markAbsent for an already present/absent
         * student will be a no-op.
         *
         * @return {undefined}
         */
        markPresent: function() {
            console.log('[[marking present at ' + new Date() + ']]');
        },
        markAbsent: function() {
            console.log('[[marking absent at ' + new Date() + ']]');
        },

        /**
         * Creates a new discussion for the student
         * @param  {string} title
         * @return {Discussion}
         */
        createNewDiscussionThread: function(title) {
            // TODO: just a stub
            return new DiscussionThread();
        },

        /**
         * Creates a new BehaviorIncidentType model custom to the
         * given student.
         * @param  {String} code
         * @param  {String} label
         * @param  {Boolean} supports_duration
         * @return {BehaviorIncidentType}
         */
        registerCustomBehaviorType: function(code, label, supports_duration) {
            console.log('[[registerCustomBehaviorType for ' + this.get('first_name') + ']]');
            // TODO: just a stub
            return new BehaviorIncidentType();
        },

        /**
         * Add a new incident to the student's record
         * @param  {BehaviorIncident} incident
         * @return {undefined}
         */
        addBehaviorIncident: function(incident) {
            // TODO: just a stub
            console.log('[[addBehaviorIncident ' + incident + ' for ' + this.get('first_name') + ']]');
        }
    });

    var StudentCollection = Backbone.Collection.extend({
        model: Student,

        /**
         * Sets up and initializes new PeriodicBehaviorRecords for all present
         * students with the given period and date.
         * @param  {Integer} period
         * @param  {String} date   (format "YYYY-MM-DD")
         * @return {undefined}
         */
        initializePeriod: function(period, date) {
            // TODO: just a stub
        }
    });

    var studentServiceStub = function() {
        this.getStudents = function() {
            return new StudentCollection([
                {
                    id: '18',
                    first_name: 'John',
                    last_name: 'Doe',

                    periodicBehaviorRecords: new PeriodicBehaviorRecordCollection([
                        {
                            id: '122',
                            period: 8,
                            date: '2013-07-03',
                            points: {'ukw': 2, 'dw': 2, 'fd': 2, 'bs': 0}
                        },
                        {
                            id: '123',
                            period: 1,
                            date: '2013-07-04',
                            points: {'ukw': 2, 'dw': 1, 'fd': 0, 'bs': 2}
                        },
                        {
                            id: '124',
                            period: 2,
                            date: '2013-07-04',
                            points: {'ukw': 2, 'dw': 2, 'fd': 1, 'bs': 2}
                        }
                    ]),

                    behaviorIncidentTypes: new BehaviorIncidentTypeCollection([PDType, OOAType]),

                    behaviorIncidents: new BehaviorIncidentCollection([
                        {
                            occurred_at: new Date('2013-07-02T12:05:23'),
                            duration: 60 * 5,   // 5 minutes
                            comment: 'Ran out of classroom',
                            type: OOAType
                        }
                    ]),

                    discussionThreads: new DiscussionThreadCollection([
                        {
                            id: '454',
                            title: 'Issue with John',
                            notes: [
                                {
                                    author: 'April Ludgate',
                                    content: "What's up with John?",
                                    posted_at: new Date('2013-07-03T12:23:52')
                                },
                                {
                                    author: 'Ron Swanson',
                                    content: "I don't know",
                                    posted_at: new Date('2013-07-03T12:23:52')
                                }
                            ]
                        }
                    ])
                }
            ]);
        };
    };

    // Hayden: registering studentServiceStub as a proper Angular service should be all
    // you need to do here to register it with the injector. I just have it as
    // a global object for now so it's easier to play with.
    app.service('studentService', function() {
        return new studentServiceStub()
    });

    //window.studentService = new studentServiceStub();
})();


// placeholder student service
//app.service('studentService', function() {
//    this.serverStudents = [
//        {
//            "_id": "51c89c0b1484e90e5940b021",
//            present: false,
//            "first_name": "Tom",
//            "last_name": "Haverford",
//            "bs": 2,
//            "kw": 0,
//            "cw": 0,
//            "fd": 0
//        },
//        {
//            "_id": "51c89c0b1484e90e5940b022",
//            present: true,
//            "first_name": "Ann",
//            "last_name": "Perkins",
//            "bs": 2,
//            "kw": 2,
//            "cw": 2,
//            "fd": 2
//        },
//        {
//            "_id": "51c89c0b1484e90e5940b023",
//            present: true,
//            "first_name": "Jerry",
//            "last_name": "Gergich",
//            "bs": 0,
//            "kw": 2,
//            "cw": 1,
//            "fd": 2
//        },
//        {
//            "_id": "51c89c0b1484e90e5940b024",
//            present: false,
//            "first_name": "Donna",
//            "last_name": "Meagle",
//            "bs": 1,
//            "kw": 0,
//            "cw": 1,
//            "fd": 1
//        },
//        {
//            "_id": "51c89c0b1484e90e5940b025",
//            present: true,
//            "first_name": "Andy",
//            "last_name": "Dwyer",
//            "bs": 0,
//            "kw": 2,
//            "cw": 1,
//            "fd": 1
//        },
//        {
//            "_id": "51c89c0b1484e90e5940b026",
//            present: true,
//            "first_name": "Leslie",
//            "last_name": "Knope",
//            "bs": 1,
//            "kw": 1,
//            "cw": 2,
//            "fd": 1
//        },
//
//        {
//            "_id": "51c89c0b1484e90e5940b027",
//            present: true,
//            "first_name": "April",
//            "last_name": "Ludgate",
//            "bs": 2,
//            "kw": 0,
//            "cw": 0,
//            "fd": 0
//        },
//
//        {
//            "_id": "51c89c0b1484e90e5940b028",
//            present: true,
//            "first_name": "Ron",
//            "last_name": "Swanson",
//            "bs": 0,
//            "kw": 0,
//            "cw": 0,
//            "fd": 0
//        }
//    ];
//
//    this.students = {};
//    for (var i = 0; i < this.serverStudents.length; i++) {
//        this.students[this.serverStudents[i]._id] = this.serverStudents[i];
//    }
//});