(function() {
	'use strict';

	angular.module('breakdown', [
		'ui.bootstrap',
		'ngRoute',
		'ngCookies',
		'ngAnimate',
		'ui.tree',
		'cdb-nodes-templates'])
		.config(['$routeProvider', function($routeProvider) {
			$routeProvider.when('/', {
				templateUrl: 'views/login.html',
				controller: 'login'
			});
			$routeProvider.when('/home', {
				templateUrl: 'views/home.html',
				controller: 'home'
			});
			$routeProvider.when('/node', {
				templateUrl: 'views/breakdown.html',
				controller: 'breakdown'
			});
			$routeProvider.otherwise({redirectTo: '/'});
		}])
		.factory('Node', ['$http', '$q', function($http, $q) {

			return {
				get: function(id) {
					var url = 'api/node',
						deferred = $q.defer();
					if (id !== undefined) {
						url += '/' + id;
					}
					$http.get(url)
						.success(function(data) {
							deferred.resolve(data);
						});
					return deferred.promise;
				},
				post: function(node) {
					var deferred = $q.defer();
					$http.post('api/node', node)
						.success(function(data) {
							deferred.resolve(data);
						});
					return deferred.promise;
				}
			};
		}])
		.factory('User', ['$http', '$q', '$cookieStore', function($http, $q, $cookies) {
			var user = {};

			return {
				login: function(newUser) {
					var deferred = $q.defer();

					$http.post('api/user', newUser)
						.success(function(data) {
							user = data;
							$cookies.put('user', parseInt(user._id));
							deferred.resolve(user);
						})
						.error(function(data) {
							$cookies.remove('user');
							deferred.resolve();
							throw new Error(data);
						});
					return deferred.promise;
				},
				logout: function() {
					var deferred = $q.defer();

					$cookies.remove('user');
					user = {};
					deferred.resolve();
					return deferred.promise;
				},
				getUser: function() {
					var deferred = $q.defer();

					if (!user.name && $cookies.get('user')) {
						$http.get('api/user/' + $cookies.get('user'))
							.success(function(data) {
								user = data;
								deferred.resolve(user);
							})
							.error(function() {
								user = {};
								$cookies.remove('user');
								deferred.resolve();
							});
					} else {
						deferred.resolve(user);
					}
					return deferred.promise;
				}
			};
		}])
		.controller('login', ['$scope', '$location', 'User', function($scope, $location, User) {

			User.getUser().then(function(user) {
				$scope.user = user;
			});

			$scope.ok = function() {

				User.login($scope.user).then(function(user) {
					if (user._id) {
						$location.path('/node');
					}
				});
			};
		}])
		.controller('navigation', ['$scope', '$location', 'User', function($scope, $location, User) {

			User.getUser().then(function(user) {
				$scope.user = user;
			});

			$scope.logout = function() {
				User.logout();
				$location.path('/');
			};
		}])
		.controller('breakdown', ['$scope', 'Node', function($scope, Node) {

			$scope.remove = function(scope) {
				scope.remove();
			};

			$scope.addNode = function(scope) {
				var nodeData = scope.$modelValue;
				nodeData.items.push({
					id: nodeData.id * 10 + nodeData.items.length,
					title: scope.nodeName,
					items: []
				});
				scope.nodeName = '';
			};

			Node.get('5678').then(function(data) {
				$scope.nodes = data;
			});
		}])
	/**
	 * action:parameter,trigger:value[;effect;effect...]
	 */
		.directive('cdbFx', [function() {

			return {
				restrict: 'A',
				scope: false,
				link: function(scope, element, attributes) {

					//effects
					function effects(effectParams) {
						switch (effectParams[0]) {
							case 'removeClass':
								return function() {
									element.removeClass(effectParams[1]);
								};
							default:
								console.error('Effect ' + effectParams[0] + ' is not defined.');
								break;
						}
					}

					element.addClass('animate');

					angular.forEach(attributes.cdbFx.split(';'), function(rawEffect) {
						var options = rawEffect.split(','),
							effect = effects(options[0].split(':'));

						//trigger
						var triggerParams = options[1].split(':') || [null];
						switch (triggerParams[0]) {
							case 'after':
								setTimeout(effect, parseFloat(triggerParams[1]) * 1000);
								break;
							case 'on':
								scope.$on(triggerParams[1], effect);
								break;
							default:
								effect();
								break;
						}
					});
				}
			};
		}]);
})();