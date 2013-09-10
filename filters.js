// formats durations for behavior incidents
// TODO: Update duration for incidents; card #64
// TODO: Update duration to use minute level fidelity; card #64
app.filter('duration', function () {
    return function (input) {
        if (typeof input !== 'number' || input < 1) {
            return '-';
        }
        var duration = '';
        var longDuration = false;
        if (input > (60 * 60)) {
            duration += Math.floor(input / (60 * 60)) + 'h ';
            longDuration = true;
            input %= 60 * 60;
        }

        if (input > 60) {
            duration += Math.floor(input / (60)) + 'min ';
            input %= 60;
        }

        if (!longDuration) {
            duration += input + 's';
        }

        return duration;

    };
});

// filter for the 'supportsDuration' attribute of behaviorTypes
app.filter('supportsDuration', function () {
    return function (input) {
        return input ? "Duration" : "Frequency";
    }
});

// formats dates like '7/13/2013' or 'Today at 6:07 PM'
app.filter('dateStamp', ['moment', function () {
    return function (input) {
        if (!input)
            return '';
        return moment(input).calendar();
    }
}]);

// formats dates like '7/13/2013' or 'Today at 6:07 PM'
app.filter('stripColons', ['moment', function () {
    return function (input) {
        if (!input)
            return '';
        return input.replace(/:/g, '');
    }
}]);