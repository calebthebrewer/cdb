(function() {
	'use strict';

	var user = {
		name: "Bob",
		handle: "bobby",
		_id: "1234"
	};

	//http://cloudspace.com/blog/2014/03/27/backend-less-development-with-angular/#.U5_OovldX_8
	//http://michalostruszka.pl/blog/2013/05/27/easy-stubbing-out-http-in-angularjs-for-backend-less-frontend-development/
	angular.module('breakdown')
		.config(['$provide', function($provide) {
			$provide.decorator('$httpBackend', angular.mock.e2e.$httpBackendDecorator);
		}])
		.run(['$httpBackend', function($httpBackend) {
			$httpBackend.whenPOST('api/user').respond(user);
			$httpBackend.whenGET('api/user/1234').respond(user);

			// Catch-all pass through for all other requests
			$httpBackend.whenGET(/.*/).passThrough();
			$httpBackend.whenPOST(/.*/).passThrough();
			$httpBackend.whenDELETE(/.*/).passThrough();
			$httpBackend.whenPUT(/.*/).passThrough();
		}]);
})();