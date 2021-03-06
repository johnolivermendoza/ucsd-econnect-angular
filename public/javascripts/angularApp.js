var app = angular.module('econnect', ['ui.router', 'ngFileUpload', 'ngAnimate', 'ui.bootstrap']);

app.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {

	$stateProvider
		.state('home', {
			url: '/home',
			templateUrl: '/home.html',
			controller: 'MainCtrl',
			resolve: {
				projectsPromise: ['projectService', function(projectService) {
					return projectService.getAll();
				}],
				postsPromise: ['postService', function(postService) {
					return postService.getAll();
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
				//profileImage: ['$stateParams', 'authService', function($stateParams, authService) {
				//	return authService.getImage($stateParams.id);
				//}]
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




app.controller('MainCtrl', ['$scope', 'projectService', '$filter', 'authService', 'postService', '$window', function($scope, projectService, $filter, authService, postService, $window) {
	$scope.projects = projectService.projects;
	$scope.posts = postService.posts;
	$scope.isLoggedIn = authService.isLoggedIn;

	$scope.random = function() {
		return 0.5 - Math.random();
	};  


	$scope.addPost = function() {
		if(!$scope.postDesc || $scope.postDesc === '') {
		 return; 
		}

		var newPost = {
			title: "Custom Post",
			date: new Date(),
			description: $scope.postDesc
		};
		// Call the 'posts' Service and create a new post
		postService.createPost(newPost.title, newPost.description).success(function() {
			$window.location.reload();
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



app.factory('postService', ['$http', 'authService', function($http, authService) {
	var postService = {
		// initialize the posts as empty
		posts: []
	};
	
	postService.createPost = function(title, desc) {
		return $http.post('/posts/' + title + '/' + desc).success(function(data){
			postService.posts.push(data);
		});
	};

	postService.getAll = function() {
		return $http.get('/posts').success(function(data) {
			angular.copy(data, postService.posts);
		});
	};



	return postService;
}]);









app.controller('NavCtrl', ['$scope','authService', function($scope, authService) {
	$scope.isLoggedIn = authService.isLoggedIn;
	$scope.currentUser = authService.currentUser;
	$scope.currentUserId = authService.currentUserId;
	$scope.logOut = authService.logOut;
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
