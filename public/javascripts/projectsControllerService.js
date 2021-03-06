


app.controller('ProjectCtrl', ['$scope', 'projectService', 'authService', '$filter', function($scope, projectService, authService, $filter) {
	$scope.projects = projectService.projects;
	$scope.isLoggedIn = authService.isLoggedIn;

	$scope.sortItems = [
        {'predicate': 'title', 'label': 'Title', 'reverse' : false},
        {'predicate': 'description', 'label': 'Description', 'reverse' : false},
        {'predicate': 'creationDate', 'label': 'Creation Date', 'reverse' : false},
        {'predicate': 'launchDate', 'label': 'Launch Date', 'reverse' : false},
        {'predicate': 'title', 'label': 'Title (reversed)', 'reverse' : true},
        {'predicate': 'description', 'label': 'Description (reversed)', 'reverse' : true},
        {'predicate': 'creationDate', 'label': 'Creation Date (reversed)', 'reverse' : true},
        {'predicate': 'launchDate', 'label': 'Launch Date (reversed)', 'reverse' : true}
    ];

	$scope.item = {'predicate': 'title', 'label': 'Title', 'reverse' : false};

    var orderBy = $filter('orderBy');
    $scope.updateSort = function(predicate) {
		$scope.projects = orderBy($scope.projects, $scope.item.predicate, $scope.item.reverse);
	};


}]);


app.controller('ProjectViewCtrl', ['$scope', 'projectService', 'authService', 'project', '$window', '$uibModal', '$log', function($scope, projectService, authService, project, $window, $uibModal, $log) {
	$scope.isLoggedIn = authService.isLoggedIn;
	$scope.project = project;

	$scope.activeTab = 1;
	$scope.currentUserId = authService.currentUserId;

	$scope.isEditing = false;

	$scope.editProfile = function() {
		$scope.isEditing = true;

	};	

	$scope.cancelEditing = function() {
		$scope.isEditing = false;
		$window.location.reload();
	};	

	$scope.updateProject = function() {
		console.log("Call Update Project");
		projectService.updateProject($scope.project._id, $scope.project).error(function(error){
			$scope.error = error;
		}).then(function() {
			console.log("**** Updated");
			$window.location.reload();
		});

	};

	// Checks if the current logged in user is a member of the project
	$scope.checkProject = function() {
		var users = $scope.project.users;
		for(var i = 0; i < users.length; i++) {
		    if (users[i]._id == $scope.currentUserId()) {
		        return true;
		    }
		}
		return false;
	};

	$scope.open = function (size) {
		var modalInstance = $uibModal.open({
			animation: true,
			//templateUrl: '/projectConfirm.html',
			controller: 'ConfirmProjectModalCtrl',
			size: size,
			template: 
				"'<div class='modal-body'>" +
				    "Are you sure you want to join this project?" +
				"</div>" +
				"<div class='modal-footer'>" +
				    "<button class='btn btn-primary' type='button' ng-click='ok()''>Yes</button>" +
				    "<button class='btn btn-default' type='button' ng-click='cancel()'>Cancel</button>" +
				"</div>"

		});
		modalInstance.result.then(function (value) {
			if (value) {
				projectService.joinCurrentProject($scope.project._id);
				$window.location.reload();
			}
			
		}, function () {
			console.log("**** Successfully joined the project");
		});
	};	
	
}]);

app.controller('ConfirmProjectModalCtrl', function ($scope, $uibModalInstance) {

  $scope.ok = function () {
    $uibModalInstance.close(true);
  };

  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
});







app.controller('AddProjectCtrl', ['$scope', 'projectService', 'profile', '$state', 'Upload', function($scope, projectService, profile, $state, Upload) {
	$scope.profile = profile;
	$scope.project = {};
	//$scope.isLoggedIn = authService.isLoggedIn;



	$scope.addProject = function(){
		console.log("**** PICNAME PROJECT: " + $scope.project.picName);
		projectService.addProject($scope.profile._id, $scope.project).error(function(error){
			$scope.error = error;
		}).then(function(){
			console.log("ADDED NEW PROJECT!" + $scope.project);
			$state.go('home');
		});
	};

	// upload on file select or drop /*
    $scope.upload = function (file) {
    	$scope.project.picName = file.name;
    	console.log("**** Uploading the image");
        Upload.upload({
            url: '/upload/',
            data: {file: file, 'projectname': $scope.project.name}
        }).then(function (resp) {
            console.log('Success ' + resp.config.data.file.name + 'uploaded. Response: ' + resp.data);
        }, function (resp) {
            console.log('Error status: ' + resp.status);
        }, function (evt) {
            var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
            console.log('progress: ' + progressPercentage + '% ' + evt.config.data.file.name);
        });
    };
	
}]);

app.factory('projectService', ['$http', 'authService', function($http, authService) {
	var projectService = {
		// initialize the posts as empty
		projects: []
	};

	projectService.getAll = function() {
		return $http.get('/projects').success(function(data) {
			angular.copy(data, projectService.projects);

		});
	};

	projectService.get = function(id) {
		return $http.get('/projects/' + id).then(function(res) {
			console.log('**** SHOWING ONE PROJECT');
			return res.data;
		});
	};

	projectService.addProject = function(id, project) {
		return $http.post('/profiles/' + id + '/addproject', project).success(function(data){
			return data;
		});
	};

	projectService.updateProject = function(id, profile) {
		return $http.post('/projects/' + id + '/updateproject', profile).success(function(data){
			console.log("**** Update the profile " + data);
		});
	};

	projectService.joinCurrentProject = function(id, profile) {
		return $http.post('/projects/' + id + '/joinproject/' + authService.currentUserId(), profile).success(function(data){
			console.log("**** Update the profile " + data);
		});
	};


	

	return projectService;
}]);



















