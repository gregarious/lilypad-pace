// encapsulate _ in its own Angular module (it's still available
// globally, this is just good form)
angular.module('underscore', []).
    constant('_', window._);
