(function() {
	'use strict';

	var user = {
			_id: 1234,
			name: 'Bob',
			handle: 'bobby'
		},
		node = [
			{
				id: 5678,
				title: 'This Node',
				content: 'Some information about this node. It could be a lot of information.',
				items: []
			},
			{
				id: 5679,
				title: 'That Node',
				content: 'Here we go!',
				items: []
			}
		];

	//http://cloudspace.com/blog/2014/03/27/backend-less-development-with-angular/#.U5_OovldX_8
	//http://michalostruszka.pl/blog/2013/05/27/easy-stubbing-out-http-in-angularjs-for-backend-less-frontend-development/
	angular.module('breakdown')
		.config(['$provide', function($provide) {
			$provide.decorator('$httpBackend', angular.mock.e2e.$httpBackendDecorator);
		}])
		.run(['$httpBackend', function($httpBackend) {
			//user
			$httpBackend.whenPOST('api/user').respond(user);
			$httpBackend.whenGET('api/user/1234').respond(user);

			//node
			$httpBackend.whenPOST('api/node').respond(node);
			$httpBackend.whenGET('api/node/5678').respond(node);
			$httpBackend.whenDELETE('api/node/5678').respond(5678);

			// Catch-all pass through for all other requests
			$httpBackend.whenGET(/.*/).passThrough();
			$httpBackend.whenPOST(/.*/).passThrough();
			$httpBackend.whenDELETE(/.*/).passThrough();
			$httpBackend.whenPUT(/.*/).passThrough();
		}]);
})();