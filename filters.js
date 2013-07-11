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