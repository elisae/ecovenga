"use strict";

var eventDetail = angular.module('eventDetail', ['ngRoute']);

eventDetail.controller('EventDetailController', ['$routeParams', '$http', '$scope', '$window', '$location', function EventDetailController($routeParams, $http, $scope, $window, $location) {

    var self = this;
    self.new_cost = null;
    self.user = $window.sessionStorage.loggedInUser;
    self.participator = null;
    self.partOfMyEvents = null;
    
    $scope.pageClass = 'event-detail';

    self.checkRights = function () {
      self.partOfMyEvents = false;
      for (var i = 0; i < $scope.event.participants.length; i++){
        if ($scope.event.participants[i]._id == $window.sessionStorage.loggedInUser) {
          self.partOfMyEvents = true;
          break;
        }
      }
    };

    self.editEvent = function () {
      console.log("event edit von", $scope.event._id);
      $location.path('/submit/'+ $scope.event._id);
    };

    self.getEventDetails = function (callback) {
      $http({
        method: 'GET',
        url: '/api/events/' + $routeParams.eventId,
        headers: {'authToken': $window.sessionStorage.authToken}
      })
      .then(function (response) {
        $scope.event = response.data;
        console.log("$scope.event", $scope.event);
        self.checkRights();
        if (callback) {
          return callback();
        }
      });
    };

    self.addSomething = function () {
      $scope.event.items.push({
        label : ""
      });
      self.new_label = "";
    };

    self.makeMeResponsible = function (item_id) {
      var new_data = {
        assigned_to: $window.sessionStorage.loggedInUser
      };

      $http({
        method: 'PUT',
        url: '/api/items/' + item_id,
        data: new_data,
        headers: {'authToken': $window.sessionStorage.authToken}
      })
      .then(function (response) {
        console.log(response);
        if(response.status == "200") {
          console.log("ok");
          self.getEventDetails();
        }
      });
    };

    self.deleteResponsibility = function (item_id) {
      var new_data = {
        assigned_to: null
      };

      $http({
        method: 'PUT',
        url: '/api/items/' + item_id,
        data: new_data,
        headers: {'authToken': $window.sessionStorage.authToken}
      })
      .then(function (response) {
        console.log(response);
        if(response.status == "200") {
          console.log("ok");
          self.getEventDetails();
        }
      });
    };

    self.createItem = function () {
      var new_item = {
        label: self.new_label,
        assigned_to: null,
        event: $scope.event._id,
        cost: null
      };

      $http({
        method: 'POST',
        url: '/api/items/',
        data: new_item,
        headers: {'authToken': $window.sessionStorage.authToken}
      })
      .then(function (response) {
        console.log("ressss", response);
        if(response.status == "200") {
          console.log("ok");
          self.getEventDetails();
        }
      });
    };

    self.deleteItem = function (item_id) {
      $http({
        method: 'DELETE',
        url: '/api/items/' + item_id,
        headers: {'authToken': $window.sessionStorage.authToken}
      })
      .then(function (response) {
        console.log("sollte gelöscht sein", response);
        if(response.status == "200"){
          self.getEventDetails();
        }
      });
    };

    self.addToMyEvents = function () {
      $http({
        method: 'PUT',
        url: 'api/events/'+$scope.event._id+'/participants/' + $window.sessionStorage.loggedInUser,
        headers: {'authToken': $window.sessionStorage.authToken}
      })
      .then(function (response) {
        console.log(response);
        if(response.status == "200") {
          console.log("ok");
          self.getEventDetails();
        }
      });
    };

    self.deleteCost = function (item_id) {
      console.log("kosten", self.new_cost, item_id);

      var new_data = {
        cost: 0
      };

      $http({
        method: 'PUT',
        url: '/api/items/' + item_id,
        data: new_data,
        headers: {'authToken': $window.sessionStorage.authToken}
      })
      .then(function (response) {
        console.log(response);
        if(response.status == "200") {
          console.log("ok");
          self.getEventDetails();
        }
      });
    };

    self.addCost = function (item) {

      //you re only allowed to add cost to an item you re assigned to
      console.log("item", item, "self user", self, "new cost", self.new_cost);

      if(!item.assigned_to || $scope.event.creator._id == self.user || item.assigned_to._id == self.user){
        console.log("kosten", self.new_cost, item._id);

        var new_data = {
          cost: self.new_cost
        };

        $http({
          method: 'PUT',
          url: '/api/items/' + item._id,
          data: new_data,
          headers: {'authToken': $window.sessionStorage.authToken}
        })
        .then(function (response) {
          console.log(response);
          if(response.status == "200") {
            console.log("ok");
            self.getEventDetails();
          }
        });
      }
      else if(item.assigned_to._id != self.user){
        alert("You have to be assigned to this item to be allowed to add cost!");
      }
    };

    self.deleteMeAsParticipator = function () {
      $http({
        method: 'DELETE',
        url: 'api/events/' + $scope.event._id + '/participants/' + $window.sessionStorage.loggedInUser,
        headers: {'authToken': $window.sessionStorage.authToken}
      })
      .then(function (response) {
        console.log(response);
        if(response.status == "200") {
          console.log("ok");

          for(var i=0; i<$scope.event.items.length; i++){
            var new_data = {
              assigned_to: null
            };

            $http({
              method: 'PUT',
              url: '/api/items/' + $scope.event.items[i]._id,
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
          self.getEventDetails();
        }
      });
    };

    self.deleteEvent = function () {
      $http({
        method: 'DELETE',
        url: '/api/events/' + $scope.event._id,
        headers: {'authToken': $window.sessionStorage.authToken}
      })
      .then(function (response) {
        console.log("sollte gelöscht sein", response);
        if(response.status == "200"){
          for(var i=0; i< $scope.event.items.length; i++){
            $http({
              method: 'DELETE',
              url: '/api/items/' + $scope.event.items[i]._id,
              headers: {'authToken': $window.sessionStorage.authToken}
            });
          }
          $location.path('/events');
        }
      });
    };

    self.updateDebtlist = function() {
      try {
        $scope.result = debtCalculator.transformIntoDebtlist($scope.event.items, $scope.event.participants);
        console.log($scope.result);
      } catch (err) {
        console.log(err.message);
      }
    }

    self.update = function() {
      self.getEventDetails(self.updateDebtlist); // wait for getEventDetails to finish before updating
    }

    // end of definitions, now action:
    self.update();
}]);
