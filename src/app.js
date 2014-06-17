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
		.factory('User', ['$http', '$q', '$cookies', function($http, $q, $cookies) {
			var user = {},
				deffered = $q.defer();

			return {
				setUser: function(newUser) {
					$http.post('api/user', newUser)
						.success(function(data) {
							user = data;
							$cookies.user = user._id;
						})
						.error(function(data) {
							throw new Error(data);
						});
				},
				getUser: function() {
					if (!user.name && ($cookies.user && $cookies.user != "undefined")) {
						$http.get('api/user/' + $cookies.user)
							.success(function(data) {
							user = data;
							deffered.resolve();
						});
						return deffered.promise;
					} else {
						return user;
					}
				}
			};
		}])
		.controller('navigation', ['$scope', function($scope) {

		}])
		.controller('login', ['$scope', '$location', 'User', function($scope, $location, User) {

			$scope.user = User.getUser();

			$scope.ok = function() {

				User.setUser($scope.user);
				$location.path('/node');
			};
		}])
		.controller('node', ['$scope', 'User', function($scope, User) {
			//TODO keep this like this but handle promises too
			$scope.user = User.getUser();
		}])
		.directive('cdbFx', [function() {

			return {
				restrict: 'A',
				scope: false,
				link: function(scope, element, attributes) {

					element.addClass("animate");

					angular.forEach(attributes.cdbFx.split(";"), function(effect) {

						var options = effect.split(",");
						setTimeout(function() {
							switch (options[0]) {
								case "removeClass":
									element.removeClass(options[1]);
									break;
								default:
									console.error("Effect " + options[0] + " is not defined.");
									break;
							}
						}, options[2] * 1000);
					});
				}
			}
		}]);
})();