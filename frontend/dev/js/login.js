var login = angular.module('login', ['ngRoute']);

login.controller('LoginController', ['$scope', 'DataService',
  function LoginController($scope, DataService) {

    var self = this;
    $scope.pageClass = 'login-page';

    self.login = function() {
      DataService.login(self.username, self.password);
    }
    
  }]
);
