var expenses = angular.module('expenses',  ['ngRoute']);

expenses.controller('ShoppingListController', ['$window','$routeParams', '$http', '$scope', '$location', function ShoppingListController($window, $routeParams, $http, $scope, $location) {

  var self = this;
  $scope.pageClass = 'shopping-list';
  $scope.events = [];
  self.new_cost = null;

  $scope.usersId = $window.sessionStorage.loggedInUser;

  //delete cost of an item
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
        self.getUserEvents();
      }
    });
  };

  //add cost to an item
  self.addCost = function (item) {

    //you re only allowed to add cost to an item you re assigned to
    console.log("item", item, "self user", self, "new cost", self.new_cost);

    if(item.assigned_to._id == self.user){
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
          self.getUserEvents();
        }
      });
    }
    else if(item.assigned_to._id != self.user){
      alert("You have to be assigned to this item to be allowed to add cost!");
    }
  };
  //get all events from current user with items
  self.getUserEvents = function() {
    $http({
      method: 'GET',
      url: '/api/events?user=' + $window.sessionStorage.loggedInUser,
      headers: {'authToken': $window.sessionStorage.authToken}
    }).then(function(response) {
      $scope.events = response.data;
      console.log("response data", response.data);
    }, function(error) {
      console.log(error);
    });
  };

  self.getUserEvents();
}]);
//get all items that are assigned to a user from the events
expenses.filter('usersItems', function() {
  return function(items, user_id) {
    var items_out = [];
    if (!user_id) {
      return items; // there's no id to filter by
    }
    if (items) { // sanity check
      for (var i = 0; i < items.length; i++) {
        if (items[i].assigned_to == user_id) {
          items_out.push(items[i]);
        }
      }
    }
    return items_out;
  }
});
