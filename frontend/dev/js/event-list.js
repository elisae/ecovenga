var eventList = angular.module('eventList',  ['ngRoute']);

eventList.controller('EventListController', ['$window', '$routeParams', '$http', '$scope', '$location', 'DataService',

  function EventListController($window, $routeParams, $http, $scope, $location, DataService) {

    var self = this;
    self.orderProp = 'date';
    $scope.pageClass = 'event-list';
    self.user = $window.sessionStorage.loggedInUser;

    self.getUserEvents = function () {
      $http({
        method: 'GET',
        url: '/api/events?user=' + $window.sessionStorage.loggedInUser,
        headers: {'authToken': $window.sessionStorage.authToken}
      }).then(function(response) {
        self.events = response.data;
        console.log("response data", response.data);
      }, function(error) {
        console.log(error);
      });
    };

    self.deleteEvent = function (event) {
      $http({
        method: 'DELETE',
        url: '/api/events/' + event._id,
        headers: {'authToken': $window.sessionStorage.authToken}
      })
      .then(function (response) {
        console.log("sollte gelöscht sein", response);
        if(response.status == "200"){
          for(var i=0; i< event.items.length; i++){
            $http({
              method: 'DELETE',
              url: '/api/items/' + event.items[i]._id,
              headers: {'authToken': $window.sessionStorage.authToken}
            });
          }
          self.getUserEvents();
        }
      });
    };

    self.deleteMeAsParticipator = function (event) {
      $http({
        method: 'DELETE',
        url: 'api/events/' + event._id + '/participants/' + $window.sessionStorage.loggedInUser,
        headers: {'authToken': $window.sessionStorage.authToken}
      })
      .then(function (response) {
        console.log(response);
        if(response.status == "200") {
          console.log("ok");

          for(var i=0; i<event.items.length; i++){
            var new_data = {
              assigned_to: null
            };

            $http({
              method: 'PUT',
              url: '/api/items/' + event.items[i]._id,
              data: new_data,
              headers: {'authToken': $window.sessionStorage.authToken}
            })
            .then(function (response) {
              console.log(response);
              if(response.status == "200") {
                console.log("ok");
              }
            });
          }
          self.getUserEvents();
        }
      });
    };

    self.editEvent = function (event_id) {
      console.log("event ", event_id);
      $location.path('/submit/'+event_id);
    };

    self.goToEvent = function (event_id) {
      $location.path('/events/'+event_id);
    }

    self.getUserEvents();

  }]
);
