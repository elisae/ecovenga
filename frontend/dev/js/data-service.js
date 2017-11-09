var dataService = angular.module('dataServiceModule', []);

dataService.service('DataService', ['$window', '$routeParams', '$http', '$location', function DataService($window, $routeParams, $http, $location) {

  var self = this;

  self.login = function(user_name, pwd) {
    $http({
      method  : 'POST',
      url     : '/api/login',
      data    : {username: user_name, password: pwd},
      headers : {'Content-Type': 'application/json'}
    })
    .success(function(response) {
      console.log(response);
      if (response.success) {
        // TODO: logout, clear storage
        $window.sessionStorage.authToken = response.authToken;
        $window.sessionStorage.loggedInUser = response.user._id;
        $location.path('/events');
      }
    });
  };

}]);
