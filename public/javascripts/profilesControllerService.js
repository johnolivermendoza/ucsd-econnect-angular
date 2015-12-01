


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





app.controller('MyProfileCtrl', ['$scope', 'profileService', 'profile', 'authService', '$window', function($scope, profileService, profile, authService, $window) {
	$scope.profile = profile;
	$scope.activeTab = 1;
	$scope.currentUserId = authService.currentUserId;
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

}]);




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
