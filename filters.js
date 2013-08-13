// Returns an appropriately rounded time measure given some number of seconds
// 37s, 1h 24min, 3min 47s... etc.
app.filter('duration', function() {
    return function(input) {
        if (typeof input !== 'number' || input < 1) {
            return '';
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

app.filter('supportsDuration', function() {
    return function(input) {
        return input ? "Duration" : "Frequency";
    }
})

app.filter('dateStamp', ['moment', function() {
    return function(input) {
        if (!input)
            return ''
        return moment(input).calendar();
    }
}])