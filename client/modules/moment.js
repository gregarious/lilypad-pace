// encapsulate moment in its own Angular module (it's still available
// globally, this is just good form)
angular.module('moment', []).
    constant('moment', window.moment);
