// inject the mixpanel download code
(function(){
    // have to load it synchronously
    var async = false;

    (function(e,b){if(!b.__SV){var a,f,i,g;window.mixpanel=b;a=e.createElement("script");a.type="text/javascript";a.async=async;a.src=("https:"===e.location.protocol?"https:":"http:")+'//cdn.mxpnl.com/libs/mixpanel-2.2.min.js';f=e.getElementsByTagName("script")[0];f.parentNode.insertBefore(a,f);b._i=[];b.init=function(a,e,d){function f(b,h){var a=h.split(".");2==a.length&&(b=b[a[0]],h=a[1]);b[h]=function(){b.push([h].concat(Array.prototype.slice.call(arguments,0)))}}var c=b;"undefined"!==
    typeof d?c=b[d]=[]:d="mixpanel";c.people=c.people||[];c.toString=function(b){var a="mixpanel";"mixpanel"!==d&&(a+="."+d);b||(a+=" (stub)");return a};c.people.toString=function(){return c.toString(1)+".people (stub)"};i="disable track track_pageview track_links track_forms register register_once alias unregister identify name_tag set_config people.set people.set_once people.increment people.append people.track_charge people.clear_charges people.delete_user".split(" ");for(g=0;g<i.length;g++)f(c,i[g]);
    b._i.push([a,e,d])};b.__SV=1.2}})(document,window.mixpanel||[]);
})();

// encapsulate mixpanel in its own Angular module
angular.module('mixpanel', []).
    provider('mixpanel', function() {
        var mockMixpanel = {track: function(){}, identify: function(){}};
        var wasActivated;

        // must be called in app.config to use Mixpanel
        this.activate = function() {
            wasActivated = true;
            window.mixpanel.init("5b2907e5a515e9a6c6ab782829af3e73");
        };

        // if using the mock mixpanel call, set it to log all calls to the console
        this.logStubCalls = function() {
            mockMixpanel = {
                track: function() {
                    console.log('Mock: mixpanel.track %o', arguments);
                },
                identify: function() {
                    console.log('Mock: mixpanel.identify %o', arguments);
                },
                people: {
                    set: function() {
                        console.log('Mock: mixpanel.people.set %o', arguments);
                    }
                }
            };
        };

        this.$get = function() {
            return wasActivated ? window.mixpanel : mockMixpanel;
        };
    });
