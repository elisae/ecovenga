var ecovenga = angular.module('ecovenga', ['ngRoute', 'ngAnimate', 'login', 'eventList', 'eventDetail', 'eventForm', 'expenses', 'dataServiceModule']);

ecovenga.config(['$routeProvider', '$locationProvider',
  function config($routeProvider, $locationProvider) {
    // TODO: use .html5Mode(true); so that we get "clean" URLs.
    // Need <base> tag in index.html, but doesn't seem to work properly right away...
    $locationProvider.hashPrefix("!");

    $routeProvider
      .when('/', {
        templateUrl: '../views/login.html',
        controller: 'LoginController as $ctrl'
      })
      .when('/events', {
        templateUrl: '../views/event-list.html',
        controller: 'EventListController as $ctrl'
      })
      .when('/events/:eventId', {
        templateUrl: '../views/event-detail.html',
        controller: 'EventDetailController as $ctrl'
      })
      .when('/submit/:eventId', {
        templateUrl: '../views/event-form.html',
        controller: 'EventFormController as $ctrl'
      })
      .when('/expenses', {
        templateUrl: '../views/shopping-list.html',
        controller: 'ShoppingListController as $ctrl'
      })
      .otherwise('/');
  }
]);
