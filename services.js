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


// placeholder student service
app.service('students', function() {
    this.serverStudents = [
        {
            "_id": "51c89c0b1484e90e5940b021",
            present: false,
            "first_name": "Tom",
            "last_name": "Haverford",
            "bs": 2,
            "kw": 0,
            "cw": 0,
            "fd": 0
        },
        {
            "_id": "51c89c0b1484e90e5940b022",
            present: true,
            "first_name": "Ann",
            "last_name": "Perkins",
            "bs": 10,
            "kw": 2,
            "cw": 2,
            "fd": 2
        },
        {
            "_id": "51c89c0b1484e90e5940b023",
            present: true,
            "first_name": "Jerry",
            "last_name": "Gergich",
            "bs": 0,
            "kw": 2,
            "cw": 1,
            "fd": 2
        },
        {
            "_id": "51c89c0b1484e90e5940b024",
            present: false,
            "first_name": "Donna",
            "last_name": "Meagle",
            "bs": 1,
            "kw": 0,
            "cw": 1,
            "fd": 1
        },
        {
            "_id": "51c89c0b1484e90e5940b025",
            present: true,
            "first_name": "Andy",
            "last_name": "Dwyer",
            "bs": 0,
            "kw": 2,
            "cw": 1,
            "fd": 1
        },
        {
            "_id": "51c89c0b1484e90e5940b026",
            present: true,
            "first_name": "Leslie",
            "last_name": "Knope",
            "bs": 1,
            "kw": 1,
            "cw": 2,
            "fd": 1
        },

        {
            "_id": "51c89c0b1484e90e5940b027",
            present: true,
            "first_name": "April",
            "last_name": "Ludgate",
            "bs": 2,
            "kw": 0,
            "cw": 0,
            "fd": 0
        },

        {
            "_id": "51c89c0b1484e90e5940b028",
            present: true,
            "first_name": "Ron",
            "last_name": "Swanson",
            "bs": 0,
            "kw": 0,
            "cw": 0,
            "fd": 0
        }
    ];

    this.students = {};
    for (var i = 0; i < this.serverStudents.length; i++) {
        this.students[this.serverStudents[i]._id] = this.serverStudents[i];
    }
});