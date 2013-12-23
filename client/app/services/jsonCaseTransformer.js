/**
 * Response interceptor that changes keys from snake-case to
 * camel-case in JSON responses, and vice versa in JSON requests.
 */
angular.module('pace').factory('jsonCaseTransformer', function() {

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

    return {
        request: function(request) {
            request.data = decamelizeData(request.data);
            return request;
        },
        response: function(response) {
            if (response.headers('Content-Type') === 'application/json') {
                response.data = camelizeData(response.data);
            }
            return response;
        }
    };
});
