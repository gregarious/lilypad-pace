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
            "last_name": "Haverford"
        },
        {
            "_id": "51c89c0b1484e90e5940b022",
            present: true,
            "first_name": "Ann",
            "last_name": "Perkins"
        },
        {
            "_id": "51c89c0b1484e90e5940b023",
            present: true,
            "first_name": "Jerry",
            "last_name": "Gergich"
        },
        {
            "_id": "51c89c0b1484e90e5940b024",
            present: false,
            "first_name": "Donna",
            "last_name": "Meagle"
        },
        {
            "_id": "51c89c0b1484e90e5940b025",
            present: true,
            "first_name": "Andy",
            "last_name": "Dwyer"
        },
        {
            "_id": "51c89c0b1484e90e5940b026",
            present: true,
            "first_name": "Leslie",
            "last_name": "Knope"
        },

        {
            "_id": "51c89c0b1484e90e5940b027",
            present: true,
            "first_name": "April",
            "last_name": "Ludgate"
        },

        {
            "_id": "51c89c0b1484e90e5940b028",
            present: true,
            "first_name": "Ron",
            "last_name": "Swanson"
        }
    ];

    this.students = {};
    for (var i = 0; i < this.serverStudents.length; i++) {
        this.students[this.serverStudents[i]._id] = this.serverStudents[i];
    }
});