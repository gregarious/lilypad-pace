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

One of the best things about Angular is that it will *automatically* watch for changes on
these bound variables, so if that timestamp value changes in its controller, the view will
automatically update.

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

If you define a controller within DOM whose parent is already under a controller, that
inner controller's `$scope` will prototypically inherit from the outer controller's
`$scope`. That basically means that the inner `$scope` will get a reference to everything
defined on the outer `$scope`.

HTML
```html
<div id="outer" ng-controller="OuterCtrl">
    Outer: {{outerValue}}, {{innerValue}}
    <div id="inner" ng-controller="InnerCtrl">
        Inner: {{outerValue}}, {{innerValue}}
    </div>
</div>
```

JS
```js
function OuterCtrl($scope) {
    $scope.outerValue = 1;
}
function InnerCtrl($scope) {
    $scope.innerValue = $scope.outerValue + 1;
}
```

Output:

    Outer: 1,
    Inner: 1, 2

This can be useful, but don't abuse it too much. It's not great form if a controller is assuming
that some value will be made available for it in some parent `$scope`. If you need to share view
state between multiple controllers, a service might be a good option (see "Services" below).

Also, be careful when assigning to a variable defined in a parent scope. This is kind of a big topic
that I don't want to be too verbose about now, but read this article sometime to get the details:
[Understanding Scopes](https://github.com/angular/angular.js/wiki/Understanding-Scopes). (This is
something that will most likely bite you if you use the `ng-model` directive.)

Finally, note that in actual non-example code, the declaration of controller isn't that simple.
You'll see something more like this in real code:

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

These are probably the most common directives. There are more we use (e.g. `ng-switch`,
`ng-model`), but you can check out the docs for them. Also, there are custom directives, but
that's outside the scope of this summary. It's definitely recommended that you get the hang
of Angular for a while before diving into custom directives.

### Services

It's hard to define exactly what a service is in a concrete way. The simplest description is
that its a Javascript object that every controller (and every other service) has access to.

Services are pure Javascript -- they know nothing about the DOM.

In our codebase, we use services for 3 main purposes:

#### Global state

The service `mainViewState` is an object that stores the currently selected
student in the sidebar, and whether or not the sidebar is in "edit attendance" mode. By putting
these values in a service, we give any controller the ability to find out these attributes and
don't make them rely on assuming a value will be made available using scope inheritance. It
also lets us keep a lot of non-view related implementation details away from the sidebar
controller.

You can find this file in `services/viewStates/mainViewState.js`.

#### Model definitions

We use Backbone.js's Models to give us a our model layer a bit more structure than we would have
using simple ad hoc Javascript objects. Since many places need to instantiate model objects, we
make them available as services.

#### Data stores

Data stores are the way we connect our controllers to the data our server's API provides. Generally,
these stores provide a set of functions that will either (1) return Backbone Collections (a wrapper around an array
of Backbone Models), or (2) create a new model, post it to the server, and return the new model.

We structure it this way for a few reasons:

1. We don't want the controller to have to worry about the details of instantiating Backbone
Models, or knowing anything about how to interact with the server's API. Controllers should
be concerned with displaying collections of data and defining how to interact with that data.

2. We don't want to wait for the results of an API call every time we click on a button. For
example, if we are looking at Leslie's discussion tab, toggle to Ron for a second, then back
to Leslie, we don't want to start over and ask the server for the data were just looking at.
The data store model lets us cache data without the controller needing to know about it.

3. We can't guarantee that we'll have a reliable connection to the server. This means we have
to try hard to keep the client-side data model consistent and keep track of what data has not
yet been synced with the server. If we let the controllers create models at will, then the
controllers would have to worry about these issues.

You'll typically see stores used this way:

(TODO: highlight the automatic nature of reference filling, also the need to sometimes wait for async)
