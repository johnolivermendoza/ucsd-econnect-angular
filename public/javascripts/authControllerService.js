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

	authService.getImage = function(id){
		return $http.get('/upload/' + id).then(function(res) {
			console.log('*** PRINTING OUT getImage: ' + res.data);
			return res;
		});
	};

	authService.getCurrentUserObj = function(id){
		return $http.get('/profiles/' + id).then(function(res) {
			return res.data;
		});
	};



	return authService;
}]);


app.controller('AuthCtrl', ['$scope', '$state', 'authService', 'Upload', function($scope, $state, authService, Upload) {
	$scope.user = {};

	$scope.register = function() {

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

	// upload on file select or drop /*
    $scope.upload = function (file) {
    	$scope.user.picName = file.name;

    	console.log("**** Uploading the image");
        Upload.upload({
            url: '/upload/',
            data: {file: file, 'username': $scope.username}
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






