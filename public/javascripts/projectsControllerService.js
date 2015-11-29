


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



















