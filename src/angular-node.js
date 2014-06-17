(function() {
	'use strict';

	angular.module('cdb.node', [])
		.directive('node',
		[
			'$compile',
			'$http',
			'$templateCache',
			function($compile, $http, $templateCache) {

				var nodeControls = angular.element('<div class="node-controls btn-group">'
					+ '<button type="button" class="btn btn-default"><span class="glyphicon glyphicon-plus"></span></button>'
					+ '<button type="button" class="btn btn-default"><span class="glyphicon glyphicon-remove"></span></button>'
					+ '</div>');

				return {
					restrict: 'EA',
					scope: {
						src: '@',
						template: '@'
					},
					controller: ['$scope', function($scope) {

					}],
					compile: function(element, attrs, childTranscludeFn) {

						element.addClass("node");

						element.bind("mouseover", function(){
							element.append(nodeControls);
						});

						element.bind("mouseleave", function() {
							nodeControls.remove();
						});

						return function(scope, element, attrs, controller) {

							scope.$watch('data', function(data, oldData) {
								if (data === oldData) return; // we don't need to run this twice
								if (scope.template) {
									$http.get(scope.template, {cache: $templateCache})
										.then(function(response) {
											$compile(response.data)(scope, function(cloned) {
												element.empty(); // this should probably be animated
												element.append(cloned);
											});
										});
								} else {
									console.log(data);
								}
							});

							if (!scope.data && scope.src) {
								$http.get(scope.src).then(function(response) {
									scope.data = response.data;
								});
							}
						}
					}
				};
			}]);
})();
