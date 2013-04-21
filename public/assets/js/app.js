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
  .value('alerts', [])
  .run(function($rootScope, $location, alerts) {
    $rootScope.$on('event:auth-loginRequired', function() {
      $location.path('/login');
    });
    $rootScope.$on('event:auth-loginConfirmed', function() {
      $location.path('/');
    });
    $rootScope.alerts = alerts;
    $rootScope.closeAlert = function(index) {
      $rootScope.alerts.splice(index, 1);
    };
  })
  .controller('IndexCtrl', function($scope, $http, $location, $_, alerts) {
    var stats = {};
    $scope.stats = {};
    $scope.btnChecked = true;
    $http.get('/api/record').success(function(data) {
      stats = data.rows;
      calcStats(stats);
    });
    $http.get('/api/task').success(function(data) {
      $scope.tasks = data.rows;
    });
    $scope.logout = function() {
      $location.path('/login');
    };
    $scope.record = function(task) {
      var rec = {
        name: task.value.name,
        taskType: task.value.taskType,
        value: task.value.value
      }
      $http.post('/api/record', rec)
        .success(function(data) {
          stats.push({ value: rec });
          calcStats(stats);
          // alert success
          alerts.push({ type: 'success', msg: 'Recorded!'});
        })
        .error(function(err) {
          alerts.push({ type: 'error', msg: 'Error'});
          
        });
    };
    var calcStats = function(stats) {
      $scope.stats.records = stats.length;
      $scope.stats.quality = 0;
      $scope.stats.savings = 0;

      $scope.stats.quality = $_(stats).reduce(function(total, item) { 
        if (item.value.taskType === 'quality-time') {
          return total + parseInt(item.value.value, 10);
        } else {
          return total + 0;
        }
      }, 0);
      $scope.stats.savings = $_(stats).reduce(function(total, item) { 
        if (item.value.taskType === 'savings') {
          return total + parseInt(item.value.value, 10);
        } else {
          return total + 0;
        }
      }, 0);
      
    };
  })
  .controller('LoginCtrl', function($scope, $http, $location, authService, alerts) {
    $scope.login = function(user) {
      $http.post('/api/login', user)
        .success(function(results) {
          authService.loginConfirmed();
        })
        .error(function(err) {
          alerts.push({ type: 'error', msg: 'Error'});
          
        });
    }
  })
  .controller('SignUpCtrl', function($scope, $http, $location, alerts) {
    $scope.edit = false;
    $scope.save = function(profile) {
      $http.post('/api/signup', profile)
        .success(function(results) {
          console.log(results);
          $location.path('/');
        })
        .error(function(err) {
          alerts.push({ type: 'error', msg: 'Error'});
          
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
  .controller('TaskNewCtrl', function($scope, $location, $http, alerts) {
    $scope.mode = "New";
    $scope.save = function(task) {
      // save task
      $http.post('/api/task', task)
        .success(function(data) {
          $location.path('/tasks');
          // add alert
          alerts.push({ type: 'success', msg: 'Created New Task!'});
        })
        .error(function(err) {
          alerts.push({ type: 'error', msg: 'Error'});
          
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
          alerts.push({ type: 'success', msg: 'Updated Task!'});
        })
        .error(function(err) {
          alerts.push({ type: 'error', msg: 'Error'});
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
          alerts.push({ type: 'success', msg: 'Created Record!'});
        })
        .error(function(err) {
          alerts.push({ type: 'error', msg: 'Error'});
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
  .controller('ProfileCtrl', function($scope, $http, alerts, $location) {
    $scope.edit = true;
    $http.get('/api/profile')
      .success(function(profile) {
        $scope.profile = profile;
      });
    $scope.save = function(profile) {
      $http.put('/api/profile', profile)
        .success(function(data) {
          alerts.push({type: 'success', msg: 'Updated Profile!'});
          $location.path('/');
        })
        .error(function(err) {
          alerts.push({ type: 'error', msg: 'Error'});
        });
    };
    $scope.cancel = function() {
      $location.path('/');
    };
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