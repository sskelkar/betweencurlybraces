---
title: "Dependency Injection in AngularJS 1.x"
date: 2015-07-19T00:00:00+05:30
draft: false
author: Sojjwal Kelkar
tags:
- JavaScript
- Angular
readingTime: 5
---

AngularJS Dependency Injection works like magic! You pass a service name in your controller constructor function and angular runtime promptly provides you with a suitable object. While this makes development process easier, it might be a little disconcerting if you don’t know what’s happening behind the scene. In this article, I will take a look at how angular DI works.

In an Angular application, user can create different kinds of components like: directives, controllers, services etc. More often than not, a component has a dependency on other components. Let's take a look at this sample controller:

{{< highlight javascript  >}}

var module = angular.module('MyModule', []);
module.controller('MyController', function($http, MyService) {
    // some code
});

{{< / highlight >}}

In the above code we are creating a controller `MyController` on `MyModule` module. It depends on two services: `$http` and `MyService`. While `$http` is an inbuilt angular service. `MyService` must have been defined by the user somewhere in the code like this:

{{< highlight javascript "linenostart=1" >}}
var module = angular.module('MyModule');
//MyService is created by calling angular.module.service method with the name of the service and a constructor function to create the service object.
module.service('MyService', function() {
    //MyService constructor code
});
{{</highlight>}}

When the controller is loaded, Angular runtime automatically provides objects of `MyService` and `$http` services. This is how it works:

Angular run time internally maintains two cache objects: provider cache and instance cache, to hold a _provider_ for an injectable component and the actual instance of that component.

What does it mean?

In above code, when we create a service by calling `module.service` method, Angular does not immediately create an object of this service. Instead, it creates a new property inside the provider cache object by appending ‘Provider’ string at the end of service name. This property is mapped to the constructor function passed to `module.service` method. So provider cache now looks somewhat like this (_NOTE: This representation is an over-simplification._):

{{< highlight javascript "linenostart=1" >}}
providerCache = {
    ...
    $httpProvider: ...,
    ...
    ...
    MyServiceProvider: function() {
        //MyService constructor code
    },
    ...
    ... //other providers
};
{{</highlight>}}

When `MyService` is used somewhere in the application, the internal DI mechanism looks for `MyService` object in instance cache. If it is not present there, then it looks for `MyServiceProvider` in the provider cache. If the provider is found, an object is created using the constructor function and stored in the instance cache. The same object is passed to `MyController` and wherever else in the application `MyService` is used. This is because in Angular, **all services are singleton**. Lazy initialization of services allows the application to load up quickly and remain relatively lightweight.

Angular DI mechanism relies on two important services: `$provide` and `$injector`. Normally you don’t interact with them directly.

`$provide` service is responsible for registering a service with angular run time, i.e., it saves a provider for the service being registered in the provider cache. In the above code, when we call `module.service`, it is actually delegated to `$provide.service` internally. In fact all the functions provided in `angular.Module` API can be thought of as wrappers around the calls to `$provide` or other inbuilt providers. (Eg. a call to module.controller is actually delegated to `$controllerProvider.register` method. But this is out of the scope of this article.)

`$injector` service is responsible for fetching the service object or instantiating it using provider cache.

Finally, a note should be made about the limitation of this DI model. In Angular 1.x, there is only one injector throughout the application, so we can’t have multiple services with the same name and there’s always a risk of namespace collision with a third-party extension that also introduces a service with the name already used in the application. Namespace collisions have to be carefully avoided in user application code, which can be a headache if the application codebase is huge. Also, a service object once created remains in the instance cache till the application is closed. These problems will be resolved in Angular 2.0 which introduces a hierarchical injector mechanism. So we can have a global injector and child injectors specific to different modules wherever required.
