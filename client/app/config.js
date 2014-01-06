angular.module('pace').config(function(timeTrackerProvider) {
    // override timeTracker for development by setting app time to set app
    // time to 9/5/2013 at 10:10am
    timeTrackerProvider.setAnchorTime(new Date(2013, 8, 5, 10, 10));
});

angular.module('mixpanel').config(function(mixpanelProvider) {
    // uncomment this to track with real Mixpanel
    // mixpanelProvider.activate();

    // this logs all mock Mixpanel calls to the console
    // (only works if not real Mixpanel is not activated)
    mixpanelProvider.logStubCalls();
});

/**
 * Add HTTP interceptors
 **/
angular.module('pace').config(function($httpProvider) {
    // injects auth header into all requests
    $httpProvider.interceptors.push('requestAuthInjector');

    // add request/response transforms that change keys from snake-case
    // to camel-case in JSON responses, and vice-versa in requests
    $httpProvider.defaults.transformRequest.unshift(decamelizeRequestData);
    $httpProvider.defaults.transformResponse.push(camelizeResponseData);

    /** Implementation details for case transformations **/

    /**
     * Returns a version of the data with all camel-case keys in object
     * converted to snake-case.
     */
    function decamelizeRequestData(data) {
        if (data) {
            // If data is part of a Backbone model, Backbone has already
            // stringified the data by the time it gets here, so we have no
            // choice but to unpack it (and have it be re-packed by Angular
            // in the default Angular transformResponse function). It's not
            // trivial to change this. #refactor
            if (_.isString(data) && JSON_START.test(data) && JSON_END.test(data)) {
                data = JSON.parse(data);
            }

            data = recursiveKeyTransform(data, decamelize);
        }
        return data;
    }

    var JSON_START = /^\s*(\[|\{[^\{])/,
        JSON_END = /[\}\]]\s*$/;

    /**
     * Returns a version of the data with all snake-case keys in object
     * converted to camel-case.
     */
    function camelizeResponseData(data) {
        // don't bother processing if it's not an object
        if (_.isObject(data)) {
            data = recursiveKeyTransform(data, camelize);
        }

        return data;
    }


    // case conversion code stolen from Ember.js
    var STRING_CAMELIZE_REGEXP = (/(\-|_|\.|\s)+(.)?/g);
    var camelize = function(str) {
        return str.replace(STRING_CAMELIZE_REGEXP, function(match, separator, chr) {
            return chr ? chr.toUpperCase() : '';
        })
        .replace(/^([A-Z])/, function(match, separator, chr) {
            return match.toLowerCase();
        });
    };
    var STRING_DECAMELIZE_REGEXP = (/([a-z])([A-Z])/g);
    var decamelize = function(str) {
        return str.replace(STRING_DECAMELIZE_REGEXP, '$1_$2').toLowerCase();
    };

    /**
     * Recursive function that returns a cloned version of
     * the given data with all object keys in the data
     * transformed by the given function.
     *
     * @param  {Anything} data
     * @param  {Function: String -> String}
     * @param  {Array} origObjs             (for internal use)
     * @param  {Array} clonedObjs           (for internal use)
     */
    function recursiveKeyTransform(data, keyTransformFunction, origObjs, clonedObjs) {
        origObjs = origObjs || [];
        clonedObjs = clonedObjs || [];

        // if we've already seen this object, it'll be in the origObjs. Just return
        // the corresponding clonedObj item in this case. This avoids a cycle.
        if(_.isObject(data)) {
            var i = _.indexOf(origObjs, data);
            if (i !== -1) {
                return clonedObjs[i];
            }
        }

        // add object references to avoid cycles
        origObjs.push(data);
        data = _.clone(data);
        clonedObjs.push(data);

        if(_.isArray(data)) {
            return _.map(data, function(item) {
                return recursiveKeyTransform(item, keyTransformFunction, origObjs, clonedObjs);
            });
        }
        else if(_.isObject(data)) {
            // for each key
            for (var oldKey in data) {
                var key = keyTransformFunction(oldKey);
                data[key] = recursiveKeyTransform(data[oldKey], keyTransformFunction, origObjs, clonedObjs);
                if (oldKey !== key) {
                    delete data[oldKey];
                }
            }
        }

        origObjs.pop();
        clonedObjs.pop();

        return data;
    }

    /**
     * Returns a version of the data with all snake-case keys in object
     * converted to camel-case.
     */
    function camelizeData(data) {
        return recursiveKeyTransform(data, camelize);
    }

    /**
     * Returns a version of the data with all camel-case keys in object
     * converted to snake-case.
     */
    function decamelizeData(data) {
        return recursiveKeyTransform(data, decamelize);
    }
});
