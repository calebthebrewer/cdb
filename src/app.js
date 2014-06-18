(function() {
	'use strict';

	angular.module('breakdown', ['ui.bootstrap', 'ngRoute', 'ngCookies'])
		.config(['$routeProvider', function($routeProvider) {
			$routeProvider.when('/', {
				templateUrl: 'login.html',
				controller: 'login'
			});
			$routeProvider.when('/home', {
				templateUrl: 'home.html',
				controller: 'home'
			});
			$routeProvider.when('/node', {
				templateUrl: 'breakdown.html',
				controller: 'node'
			});
			$routeProvider.otherwise({redirectTo: '/'});
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
		.controller('node', ['$scope', '$location', 'User', function($scope, $location, User) {
			User.getUser().then(function(user) {
				if (!user._id) {
					$location.path('/');
				}
				$scope.user = user;
			});

			$scope.logout = function() {
				User.logout();
				$location.path('/');

			};
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
							case "removeClass":
								return function() {
									element.removeClass(effectParams[1]);
								}
							default:
								console.error("Effect " + effectParams[0] + " is not defined.");
								break;
						}
					};

					element.addClass("animate");

					angular.forEach(attributes.cdbFx.split(";"), function(effect) {
						var options = effect.split(",");

						var effect = effects(options[0].split(":"))

						//trigger
						var triggerParams = options[1].split(':') || [null];
						switch (triggerParams[0]) {
							case 'after':
								setTimeout(effect, parseFloat(triggerParams[1]) * 1000);
								break;
							case 'on':
								scope.$on(triggerParams[1], effect)
								break;
							default:
								effect();
								break;
						}
					});
				}
			}
		}]);
})();