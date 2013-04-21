var app = angular.module('App', ['ui.bootstrap','http-auth-interceptor'])
  .config(function($routeProvider, $locationProvider){
    $routeProvider
      .when('/', { controller: 'IndexCtrl', templateUrl: '/assets/templates/index.html'})
      .when('/signup', {controller: 'SignUpCtrl', templateUrl: '/assets/templates/profile/form.html'})
      .when('/login', {controller: 'LoginCtrl', templateUrl: '/assets/templates/login.html'})
      .when('/profile', {controller: 'ProfileCtrl', templateUrl: '/assets/templates/profile/form.html'})
      .when('/tasks', {controller: 'TasksCtrl', templateUrl: '/assets/templates/tasks/index.html'})
      .when('/tasks/new', {controller: 'TaskNewCtrl', templateUrl: '/assets/templates/tasks/form.html'})
      .when('/tasks/:id', {controller: 'TaskShowCtrl', templateUrl: '/assets/templates/tasks/show.html'})
      .when('/tasks/:id/edit', {controller: 'TaskEditCtrl', templateUrl: '/assets/templates/tasks/form.html'})
      .when('/records', {controller: 'RecordsCtrl', templateUrl: '/assets/templates/records/index.html'})
      .when('/records/new', {controller: 'RecordNewCtrl', templateUrl: '/assets/templates/records/form.html'})
      .when('/records/:id', {controller: 'RecordShowCtrl', templateUrl: '/assets/templates/records/show.html'})
      .when('/records/:id/edit', {controller: 'RecordEditCtrl', templateUrl: '/assets/templates/records/form.html'})
      ;
    $locationProvider.html5Mode(true);
  })
  .run(function($rootScope, $location) {
    $rootScope.$on('event:auth-loginRequired', function() {
      $location.path('/login');
    });
    $rootScope.$on('event:auth-loginConfirmed', function() {
      $location.path('/');
    });
  })
  .controller('IndexCtrl', function($scope, $http) {
    $scope.stats = {};
    $http.get('/api/record').success(function(data) {
      $scope.stats.records = data.rows.length;
    });
  })
  .controller('LoginCtrl', function($scope, $http, $location, authService) {
    $scope.login = function(user) {
      $http.post('/api/login', user)
        .success(function(results) {
          authService.loginConfirmed();
        });
    }
  })
  .controller('SignUpCtrl', function($scope, $http, $location) {
    $scope.save = function(profile) {
      $http.post('/api/signup', profile)
        .success(function(results) {
          console.log(results);
          $location.path('/');
        });
    };
    $scope.cancel = function() {
      $location.path('/login');
    };
  })
  .controller('TasksCtrl', function($scope, $http, $_, $location) {
    $http.get('/api/task').success(function(data) {
      $scope.tasks = $_(data.rows).pluck('value');
    });
    $scope.edit = function(task) {
      $location.path('/tasks/' + task._id + '/edit');
    };
  })
  .controller('TaskNewCtrl', function($scope, $location, $http) {
    $scope.mode = "New";
    $scope.save = function(task) {
      // save task
      $http.post('/api/task', task)
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
  .controller('TaskEditCtrl', function($scope, $http, $routeParams, $location) {
    $scope.mode = "Edit";
    $http.get('/api/task/' + $routeParams.id).success(function(data) {
      $scope.task = data.rows[0].value;
    });
    $scope.save = function(task) {
      // save task
      $http.put('/api/task/' + task._id, task)
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
  .controller('TaskShowCtrl', function($scope) {
    
  })
  .controller('RecordNewCtrl', function($scope, $routeParams, $http, $location) {
    $scope.mode = "New";
    $scope.record = { task: $routeParams.task };
    $http.get('/api/task/' + $scope.record.task)
      .success(function(results) {
        var task = results.rows[0].value;
        $scope.record.name = task.name;
        $scope.record.taskType = task.taskType
        $scope.record.value = task.value;
      });
    $scope.save = function(record) {
      // save record
      record.task = $routeParams.task;
      $http.post('/api/record', record)
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