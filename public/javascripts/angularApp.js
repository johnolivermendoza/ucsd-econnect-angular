var app = angular.module('econnect', ['ui.router', 'ngFileUpload']);

app.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {

	$stateProvider
		.state('home', {
			url: '/home',
			templateUrl: '/home.html',
			controller: 'MainCtrl',
			resolve: {
				projectsPromise: ['projectService', function(projectService) {
					return projectService.getAll();
				}]
			}
		})
		// Login page
		.state('login', {
			url: '/login',
			templateUrl: '/login.html',
			controller: 'AuthCtrl',
			onEnter: ['$state', 'authService', function($state, authService){
				if(authService.isLoggedIn()){
					$state.go('home');
				}
			}]
		})
		// Register for a new account
		.state('register', {
			url: '/register',
			templateUrl: '/register.html',
			controller: 'AuthCtrl',
			onEnter: ['$state', 'authService', function($state, authService){
				if(authService.isLoggedIn()){
					$state.go('home');
				}
			}]
		})
		// Show all profiles
		.state('profiles', {
			url: '/profiles',
			templateUrl: '/profiles.html',
			controller: 'ProfileCtrl',
			resolve: {
				profilesPromise: ['profileService', function(profileService) {
					return profileService.getAll();
				}]
			}
			
		})
		// Show a specific profile
		.state('myprofile', {
			url: '/profiles/{id}',
			templateUrl: '/myProfile.html',
			controller: 'MyProfileCtrl',
			resolve: {
				profile: ['$stateParams', 'profileService', function($stateParams, profileService) {
					return profileService.get($stateParams.id);
				}]
			}
		})

		// Show a specific profile
		.state('projects', {
			url: '/projects',
			templateUrl: '/projects.html',
			controller: 'ProjectCtrl',
			resolve: {
				projectsPromise: ['projectService', function(projectService) {
					return projectService.getAll();
				}]
			}
		})
		.state('viewproject', {
			url: '/projects/{id}',
			templateUrl: '/viewProject.html',
			controller: 'ProjectViewCtrl',
			resolve: {
				project: ['$stateParams', 'projectService', function($stateParams, projectService) {
					return projectService.get($stateParams.id);
				}]
			}
		})

		// Show a specific profile
		.state('addproject', {
			url: '/profiles/{id}/addproject',
			templateUrl: '/addProject.html',
			controller: 'AddProjectCtrl',
			resolve: {
				profile: ['$stateParams', 'profileService', function($stateParams, profileService) {
					return profileService.get($stateParams.id);
				}]
			}
		})


		
		.state('posts', {
			url: '/posts/{id}',
			templateUrl: '/posts.html',
			controller: 'PostsCtrl',
			resolve: {
				post: ['$stateParams', 'posts', function($stateParams, posts) {
					return posts.get($stateParams.id);
				}]
			}
		});
		

	$urlRouterProvider.otherwise('/home');

}]);




app.controller('MainCtrl', ['$scope', 'projectService', '$filter', 'authService', function($scope, projectService, $filter, authService) {
	$scope.projects = projectService.projects;
	$scope.isLoggedIn = authService.isLoggedIn;

	$scope.random = function() {
		return 0.5 - Math.random();
	};  


	$scope.addPost = function() {
		if(!$scope.title || $scope.title === '') {
		 return; 
		}

		var newPost = {
			title: $scope.title,
			link: $scope.link,
		};
		// Call the 'posts' Service and create a new post
		posts.create(newPost).success(function(comment) {
			$scope.posts.push({newPost});
		});



		$scope.title = '';
		$scope.link = '';
	};

	$scope.incrementUpvotes = function(post) {
		posts.upvote(post);
	};

	$scope.removePost = function(post) {
		posts.removePost(post);
	};

	var orderBy = $filter('orderBy');
	$scope.order = function(predicate, reverse) {
		$scope.posts = orderBy($scope.posts, predicate, reverse);
	};
	$scope.order('--upvotes', true);
}]);




app.controller('NavCtrl', ['$scope','authService', function($scope, authService) {
	$scope.isLoggedIn = authService.isLoggedIn;
	$scope.currentUser = authService.currentUser;
	$scope.currentUserId = authService.currentUserId;
	$scope.logOut = authService.logOut;
}]);  






app.factory('authService', ['$http', '$window', function($http, $window) {
	var authService = {};

	authService.saveToken = function (token){
		$window.localStorage['econnect-token'] = token;
	};

	authService.getToken = function (){
		return $window.localStorage['econnect-token'];
	};

	authService.isLoggedIn = function(){
		var token = authService.getToken();

		if(token){
			var payload = JSON.parse($window.atob(token.split('.')[1]));

			return payload.exp > Date.now() / 1000;
		} else {
			return false;
		}
	};

	authService.currentUser = function(){
		if(authService.isLoggedIn()){
			var token = authService.getToken();
			var payload = JSON.parse($window.atob(token.split('.')[1]));
			return payload.username;
		}
	};

	authService.currentUserId = function(){
		if(authService.isLoggedIn()){
			var token = authService.getToken();
			var payload = JSON.parse($window.atob(token.split('.')[1]));
			return payload._id;
		}
	};

	authService.register = function(user){
		return $http.post('/register', user).success(function(data){
			authService.saveToken(data.token);
		});
	};

	authService.logIn = function(user){
		return $http.post('/login', user).success(function(data){
			authService.saveToken(data.token);
		});
	};

	authService.logOut = function(){
		$window.localStorage.removeItem('econnect-token');
	};

	return authService;
}]);


app.controller('AuthCtrl', ['$scope', '$state', 'authService', 'Upload', function($scope, $state, authService, Upload) {
	$scope.user = {};

	$scope.register = function(){
		authService.register($scope.user).error(function(error){
			$scope.error = error;
		}).then(function(){
			$state.go('home');
		});
	};

	$scope.logIn = function(){
		authService.logIn($scope.user).error(function(error){
			$scope.error = error;
		}).then(function(){
			$state.go('home');
		});
	};

	$scope.uploadPic = function(file) {
		file.upload = Upload.upload({
			url: 'https://angular-file-upload-cors-srv.appspot.com/upload',
			data: {file: file, username: $scope.username},
		});
	};


}]);





app.directive('footer', function () {
    return {
        restrict: 'A',
        replace: true,
        templateUrl: "/footer.html",
        controller: ['$scope', '$filter', function ($scope, $filter) {
            // Behavior goes here
        }]
    }
});
