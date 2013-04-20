var app = angular.module('App', ['ui.bootstrap'])
  .config(function($routeProvider, $locationProvider){
    $routeProvider
      .when('/', { controller: 'IndexCtrl', templateUrl: '/assets/templates/index.html'})
      .when('/signup', {controller: 'SignUpCtrl', templateUrl: '/assets/templates/profile/form.html'})
      .when('/profile', {controller: 'ProfileCtrl', templateUrl: '/assets/templates/profile/form.html'})
      .when('/tasks', {controller: 'TasksCtrl', templateUrl: '/assets/templates/tasks/index.html'})
      .when('/tasks/new', {controller: 'TaskNewCtrl', templateUrl: '/assets/templates/tasks/form.html'})
      .when('/tasks/:id', {controller: 'TaskShowCtrl', templateUrl: '/assets/templates/tasks/show.html'})
      .when('/tasks/:id/edit', {controller: 'TaskEditCtrl', templateUrl: '/assets/templates/tasks/form.html'})
      .when('/records', {controller: 'TasksCtrl', templateUrl: '/assets/templates/records/index.html'})
      .when('/records/new', {controller: 'TaskNewCtrl', templateUrl: '/assets/templates/records/form.html'})
      .when('/records/:id', {controller: 'TaskShowCtrl', templateUrl: '/assets/templates/records/show.html'})
      .when('/records/:id/edit', {controller: 'TaskEditCtrl', templateUrl: '/assets/templates/records/form.html'})
      ;
    $locationProvider.html5Mode(true);
  })
  .controller('IndexCtrl', function($scope) {
    
  })
  .controller('TasksCtrl', function($scope, $http, $_) {
    $http.get('/api/tasks').success(function(data) {
      console.log(data);
      $scope.tasks = $_(data.rows).pluck('value');
    });
    console.log('tasks');
  })
  .controller('TaskNewCtrl', function($scope, $location, $http) {
    $scope.mode = "New";
    $scope.save = function(task) {
      // save task
      $http.post('/api/tasks', task)
        .success(function(data) {
          $location.path('/tasks');
          // add alert
        })
        .error(function(err) {
          // add alert
        });
    };
    $scope.cancel = function() { $location.path('/tasks'); }
  })
  .controller('TaskEditCtrl', function($scope) {
    $scope.mode = "Edit";
    $scope.task = $get('/api/tasks/' + task._id);
    $scope.save = function(task) {
      // save task
      $http.put('/api/tasks/' + task._id)
        .success(function(data) {
          $location.path('/tasks/' + task._id);
          // add alert
        })
        .error(function(err) {
          // add alert
        });
    };
    $scope.cancel = function() { $location.path('/tasks'); }
    
  })
  .controller('TaskShowCtrl', function($scope) {
    
  })
  .controller('RecordNewCtrl', function($scope) {
    $scope.mode = "New";
  })
  .controller('RecordEditCtrl', function($scope) {
    $scope.mode = "Edit";
  })
  .controller('RecordShowCtrl', function($scope) {

  })
  .controller('HeaderCtrl', function($scope) {
    
  })
  .controller('ProfileCtrl', function($scope) {
    
  })
  .directive('navbar', function() {
    return {
      restrict: 'E',
      replace: true,
      template: '<div class="navbar navbar-inverted navbar-fixed-top">' +
                  '<div class="navbar-inner"><div class="container">' +
                    '<div ng-transclude></div>' +
                  '</div>' +
                '</div>'
    }
  })
  .factory('$_', function() {
    return _;
  })
  ;