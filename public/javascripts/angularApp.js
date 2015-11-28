var app = angular.module('econnect', ['ui.router']);

app.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {

	$stateProvider
		.state('home', {
			url: '/home',
			templateUrl: '/home.html',
			controller: 'MainCtrl',
			resolve: {
				postPromise: ['posts', function(posts) {
					return posts.getAll();
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


app.factory('posts', ['$http', 'authService', function($http, authService) {
	var o = {
		// initialize the posts as empty
		posts: []
	};

	o.getAll = function() {
		return $http.get('/posts').success(function(data) {
			angular.copy(data, o.posts);
		});
	};

	o.get = function(id) {
		return $http.get('/posts/' + id).then(function(res) {
			return res.data;
		});
	};

	o.removePost = function(post) {
		return $http.delete('/posts/' + post._id + '/remove');
	};

	o.create = function(post) {
		return $http.post('/posts', post, {
			headers: {Authorization: 'Bearer '+authService.getToken()}
		}).success(function(data){
			o.posts.push(data);
		});
	};

	o.upvote = function(post) {
		return $http.put('/posts/' + post._id + '/upvote', null, {
			headers: {Authorization: 'Bearer '+authService.getToken()}
		}).success(function(data){
			post.upvotes += 1;
		});
	};

	o.addComment = function(id, comment) {
		return $http.post('/posts/' + id + '/comments', comment, {
			headers: {Authorization: 'Bearer '+authService.getToken()}
		});
	};

	o.upvoteComment = function(post, comment) {
		return $http.put('/posts/' + post._id + '/comments/'+ comment._id + '/upvote', null, {
			headers: {Authorization: 'Bearer '+authService.getToken()}
		}).success(function(data){
			comment.upvotes += 1;
		});
	};

	return o;
}]);



app.controller('MainCtrl', ['$scope', 'posts', '$filter', 'authService', function($scope, posts, $filter, authService) {
	$scope.test = 'Hello world!';
	$scope.posts = posts.posts;
	$scope.isLoggedIn = authService.isLoggedIn;

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


app.controller('PostsCtrl', ['$scope', 'posts', 'post', 'authService', function($scope, posts, post, authService) {
	$scope.post = post;
	$scope.isLoggedIn = authService.isLoggedIn;

	$scope.addComment = function(){
		if($scope.body === '') { return; }

		posts.addComment(post._id, {
			body: $scope.body,
			author: 'user',
		}).success(function(comment) {
			$scope.post.comments.push(comment);
		});
		$scope.body = '';
	};

	$scope.incrementUpvotes = function(comment) {
		posts.upvoteComment(post, comment);
	};

}]);




app.controller('ProfileCtrl', ['$scope', 'profileService', 'authService', function($scope, profileService, authService) {
	$scope.profiles = profileService.profiles;
	$scope.isLoggedIn = authService.isLoggedIn;

	// TODO
	$scope.editProfile = function(){
		if($scope.body === '') { return; }

		posts.addComment(post._id, {
			body: $scope.body,
			author: 'user',
		}).success(function(comment) {
			$scope.post.comments.push(comment);
		});
		$scope.body = '';
	};

	$scope.getProfileImage = function(image){
        return profileService.getImage(image);
    };

}]);


app.controller('MyProfileCtrl', ['$scope', 'profileService', 'profile', function($scope, profileService, profile) {
	$scope.profile = profile;
	$scope.activeTab = 1;

	$scope.setProfileTab = function(number) {
		$scope.activeTab = number;
	};

	$scope.checkProfileTab = function(id) {
		return $scope.activeTab === id;
	};


	/*
	$scope.openModal = function(){
		$modal.open({
			templateUrl: '/addProject.html',
		resolve: {
			newPath: function(){
			return 'home'
			},
			oldPath: function(){
				return 'home.modal'
			}
		},
		controller: 'ProjectController'
		});
	}; */



	// TODO
	/*
	$scope.editProfile = function(){
		if($scope.body === '') { return; }

		posts.addComment(post._id, {
			body: $scope.body,
			author: 'user',
		}).success(function(comment) {
			$scope.post.comments.push(comment);
		});
		$scope.body = '';
	};*/

}]);


app.factory('profileService', ['$http', 'authService', function($http, authService) {
	var profileService = {
		// initialize the posts as empty
		profiles: []
	};

	profileService.getAll = function() {
		return $http.get('/profiles').success(function(data) {
			angular.copy(data, profileService.profiles);

		});
	};

	profileService.get = function(id) {
		return $http.get('/profiles/' + id).then(function(res) {
			return res.data;
		});
	};

	/*

	profileService.getImage = function(image) {
		console.log('**** GETTING IMAGE');
		return $http.get('/profileimage/' + image).then(function(result){
			return result;
		});
	};
*/

	return profileService;
}]);


app.controller('ProjectCtrl', ['$scope', 'projectService', 'authService', function($scope, projectService, authService) {
	$scope.projects = projectService.projects;
	$scope.isLoggedIn = authService.isLoggedIn;


	/*
	$scope.addProject = function(){
		if($scope.body === '') { return; }

		prof.addProject(profile._id, {
			body: $scope.body,
			author: 'user',
		}).success(function(comment) {
			$scope.post.comments.push(comment);
		});
		$scope.body = '';
	};*/


	

}]);





app.controller('AddProjectCtrl', ['$scope', 'projectService', 'profile', '$state', function($scope, projectService, profile, $state) {
	$scope.profile = profile;
	$scope.project = {};
	//$scope.isLoggedIn = authService.isLoggedIn;



console.log(profile);

	$scope.addProject = function(){
		console.log("**** AddProject stuff: ");
		projectService.addProject($scope.profile._id, $scope.project).error(function(error){
			$scope.error = error;
		}).then(function(){
			console.log("ADDED NEW PROJECT!");
			$state.go('home');
		});
	};

	/*
	$scope.addProject = function(){
		if($scope.body === '') { return; }

		prof.addProject(profile._id, {
			body: $scope.body,
			author: 'user',
		}).success(function(comment) {
			$scope.post.comments.push(comment);
		});
		$scope.body = '';
	};*/


	

}]);

app.factory('projectService', ['$http', 'authService', function($http, authService) {
	var projectService = {
		// initialize the posts as empty
		projects: []
	};

	projectService.getAll = function() {
		return $http.get('/projects').success(function(data) {
			console.log('**** GET ALL PROJECTS: ' + data);
			angular.copy(data, projectService.projects);

		});
	};

	projectService.get = function(id) {
		return $http.get('/profiles/' + id).then(function(res) {
			return res.data;
		});
	};


	projectService.addProject = function(id, project) {
		//return $http.post('/profiles/' + id + '/addproject', {
		//	headers: {Authorization: 'Bearer '+authService.getToken()}
		//});


		return $http.post('/profiles/' + id + '/addproject', project).success(function(data){
			console.log("CREATED A NEW PROJECT: " + data);
 
		});
	};

	return projectService;
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


app.controller('AuthCtrl', ['$scope', '$state', 'authService', function($scope, $state, authService) {
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

}]);
