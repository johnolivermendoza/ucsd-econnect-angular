


app.controller('ProfileCtrl', ['$scope', 'profileService', 'authService', '$filter', function($scope, profileService, authService, $filter) {
	$scope.profiles = profileService.profiles;
	$scope.isLoggedIn = authService.isLoggedIn;

	$scope.sortItems = [
        {'predicate': 'firstName', 'label': 'First Name', 'reverse' : false},
        {'predicate': 'lastName', 'label': 'Last Name', 'reverse' : false},
        {'predicate': 'username', 'label': 'Username', 'reverse' : false},
        {'predicate': 'shortDescription', 'label': 'Short Description', 'reverse' : false},
        {'predicate': 'firstName', 'label': 'First Name (reversed)', 'reverse' : true},
        {'predicate': 'lastName', 'label': 'Last Name (reversed)', 'reverse' : true},
        {'predicate': 'username', 'label': 'Username (reversed)', 'reverse' : true},
        {'predicate': 'shortDescription', 'label': 'Short Description (reversed)', 'reverse' : true}
    ];

	$scope.item = {'predicate': 'title', 'label': 'Title', 'reverse' : false};

    var orderBy = $filter('orderBy');
    $scope.updateSort = function(predicate) {
		$scope.profiles = orderBy($scope.profiles, $scope.item.predicate, $scope.item.reverse);
	};






	$scope.getProfileImage = function(image){
        return profileService.getImage(image);
    };

}]);





app.controller('MyProfileCtrl', ['$scope', 'profileService', 'profile', 'authService', '$window', '$uibModal', 'postService',  function($scope, profileService, profile, authService, $window, $uibModal, postService) {
	$scope.profile = profile;
	$scope.activeTab = 1;
	$scope.currentUserId = authService.currentUserId;
	$scope.userId = $scope.currentUserId();
	$scope.currentUser = authService.currentUser;
	$scope.currentUserObj = authService.getCurrentUserObj($scope.userId);
	$scope.isEditing = false;

	$scope.setProfileTab = function(number) {
		$scope.activeTab = number;
	};

	$scope.checkProfileTab = function(id) {
		return $scope.activeTab === id;
	};

	$scope.editProfile = function() {
		$scope.isEditing = true;

	};	

	$scope.cancelEditing = function() {
		$scope.isEditing = false;
		$window.location.reload();
	};	

	$scope.updateProfile = function() {
		console.log("Call Update Profile");
		profileService.updateProfile($scope.profile._id, $scope.profile).error(function(error){
			$scope.error = error;
		}).then(function() {
			console.log("**** Updated");
			$window.location.reload();
		});

	};

	$scope.getUserImage = function(id) {
		$scope.imageData = authService.getImage(id);

		return authService.getImage(id);

	};

	
	$scope.open = function (size) {
		var modalInstance = $uibModal.open({
			animation: true,
			//templateUrl: '/projectConfirm.html',
			controller: 'InviteUserModalCtrl',
			size: size,
			resolve: {
				profile: function () {
					return $scope.profile;
				},
				currentUser: function() {
					return $scope.currentUserObj;
				}
			},
			template: 
				"'<div class='modal-body form-group'>" +
				    "<label>Select which project {{profile.firstName}} {{profile.lastName}} is invited to join:</label>" +
				    "<select name='project_select' style='display: inline-block' class='form-control' ng-options='project as project.name for project in currentUser.projects' ng-model='project'>" +
				    "</select>" +
				"</div>" +
				"<div class='modal-footer'>" +
				    "<button class='btn btn-success' type='button' ng-disabled='!project' ng-click='ok()''>Invite</button>" +
				    "<button class='btn btn-default' type='button' ng-click='cancel()'>Cancel</button>" +
				"</div>"

		});
		modalInstance.result.then(function (project) {
			if (project) {
				profileService.inviteUser($scope.profile._id, $scope.currentUserId(), project._id);

				// Create invite post
				var newPost = {
					title: "Invite Post",
					description: $scope.currentUser() + " has invited " + $scope.profile.username + " to the '" + project.name + "'' project"
				};
				postService.createPost(newPost.title, newPost.description);

				$window.location.reload();
			}
			
		}, function () {
			console.log("**** Successfully invited the user");
		});
	};

}]);

app.controller('InviteUserModalCtrl', function ($scope, $uibModalInstance, profile, currentUser, profileService) {
	$scope.profile = profile;
	$scope.currentUser = currentUser;


  $scope.ok = function () {
  	console.log("***** Choose")
    $uibModalInstance.close($scope.project);
  };

  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
});



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

	profileService.updateProfile = function(id, profile) {
		return $http.post('/profiles/' + id + '/updateprofile', profile).success(function(data){
			console.log("**** Update the profile " + data);
 
		});
	};

	profileService.inviteUser = function(userId, inviterId, projectId) {
		return $http.post('/invite/' + userId + '/' + inviterId + '/' + projectId).success(function(data){
			console.log("**** Successfully invited the user " + data);
		});
	};



	return profileService;
}]);







// Profile Directives

app.directive("contenteditable", function() {
	return {
		require: "ngModel",
		link: function(scope, element, attrs, ngModel) {

			function read() {
				ngModel.$setViewValue(element.html());
			}

			ngModel.$render = function() {
				element.html(ngModel.$viewValue || "");
			};

			element.bind("blur keyup change", function() {
				scope.$apply(read);
			});
		}
	};
});

