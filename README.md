# Lilypad Pace

A single-page app for Lilypad at Pace.

## Installation (for dev machines)

If using on a development machine in conjunction with `lilypad-server`, this repository's
directory __must__ be named `lilypad-pace`, and it's parent directory must be set in the
server's virtual environment (see `lilypad-server`'s README for details).

## Quick Angular primer

Here's an overview of our stack, as well as an overview of Angular.js and the features we
use most. This guide will go from the View layer (HTML) to the API with the server.

### View/DOM (HTML)

Views in Angular are just straight HTML. To give them access to things in the Javascript
world, you bind parts of the DOM to controllers with the HTML attribute `ng-controller`.

The details on controllers are spelled out more below, but for now just look at this
example HTML to get an idea of how it works:

```html
    <div id="outer">
        <div id="inner" ng-controller="SimpleCtrl">
            <h1>The time is: {{timestamp}}</h1>
            <button ng-click="updateTimestamp()">Update Time</button>
        </div>
    </div>
```

This hooks a controller called `SimpleCtrl` to the "inner" div, meaning that the div and everything
inside it has access to values that `SimpleCtrl` makes available (in this case,
a Date object called `timestamp` and a function called `updateTimestamp`).

Note that the "outer" div can't access anything in `SimpleCtrl`.

### Controllers

A controller is a Javascript function. The function always has an argument called `$scope`,
and it's this `$scope` that declares the public interface of the controller (i.e. the values
the HTML can access). So here's an example implementation of the `SimpleCtrl` from above.

```js
    function SimpleCtrl($scope) {
        $scope.timestamp = new Date();
        $scope.updateTimestamp = function() {
            $scope.timestamp = new Date();
        }
    }
```

This controller initializes the timestamp and also declares a function that will update
that timestamp anytime its called.

Note that in actual non-example code, the declaration of `SimpleCtrl` isn't that simple. You'll
see something more like this:

```js
angular.module('pace').controller('SimpleCtrl', function($scope) {
    // function code from before
});
```

This declares the Controller as part of a module (kind of like a namespace) called
"pace" that was declared somewhere else. Most of the controllers and services (see below)
are declared as part of this module. This is a lot better than just having a bunch of
globally defined controllers floating around.

### Directives

I didn't explain the `ng-click` in the HTML example above. It's what Angular calls a
"directive", which is is a *really* big topic, but for now it will suffice to say that
that a directive is an instruction to the DOM to do "something" based on a value it's
given.

The best way to explain is an example:

HTML:
```html
<div ng-controller="DirectiveExampleCtrl">
    <button ng-click="toggleNames()">Show the names</button>
    <ul ng-show="areNamesVisible">
        <li ng-repeat="name in names">{{name}}</li>
    </ul>
</div>
```

JS:
```js
function DirectiveExampleCtrl($scope) {
    $scope.areNamesVisible = false;
    $scope.names = ['Leslie', 'Ron', 'Tom'];
    $scope.showNames = function() {
        $scope.areNamesVisible = !$scope.areNamesVisible;
    }
}
```

In this example, I'm using 3 directives:

- `ng-click`: Executes any code given to it once the DOM element is clicked.
- `ng-show`: Only shows the DOM when the value given to it is truthy
- `ng-repeat`: Given an argument `"item in items"`, where `items` is an array, copies its DOM
                `items.length` times and declares the a variable `item` on each copy's $scope
                that gets the respective item from the array.

These are probably the most common directives. There are more we use (e.g. `ng-switch`), but
you can check out the docs for them. Also, there are custom directives, but that's outside the
scope of this summary. It's definitely recommended that you get the hang of Angular for a
while before diving into custom directives.

