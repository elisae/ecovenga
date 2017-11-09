var eventForm = angular.module('eventForm', ['ngRoute']);

eventForm.controller('EventFormController', ['$window', '$routeParams', '$http', '$scope', '$location', function EventFormController($window, $routeParams, $http, $scope, $location) {

  var self = this;
  $scope.pageClass = 'event-form';
  self.event = {};

  //editing an event
  if ($routeParams.eventId != 0) {
    $http({
      method: 'GET',
      url: '/api/events/' + $routeParams.eventId,
      headers: {'authToken': $window.sessionStorage.authToken}
    })
    .then(function(response) {
      if(response.status == "200") {
        self.event = response.data;
        console.log(self.event);
        self.event.date = new Date(self.event.date);

        self.submit = function() {
          console.log("submit augerufen");
          $http({
            method: 'PUT',
            url: '/api/events/' + $routeParams.eventId,
            data: self.event,
            headers: {'authToken': $window.sessionStorage.authToken}
          })
          .then(function(response) {
            console.log(response);
            if(response.status == "200") {
              console.log("ok");
              $location.path('/events');
            }
          });
        };
      }
    });
  }
  //creating a new event
  else {
    self.submit = function() {
      console.log("submit augerufen");
      self.event.date = new Date(self.event.date);
      self.event.participants = [$window.sessionStorage.loggedInUser];
      self.event.creator = $window.sessionStorage.loggedInUser;
      $http({
        method: 'POST',
        url: '/api/events',
        data: self.event,
        headers: {'authToken': $window.sessionStorage.authToken}
      })
      .then(function(response) {
        console.log(response);
        if(response.status == "200") {
          console.log("ok");
          $location.path('/events');
        }
      });
    };
  }
}]);
