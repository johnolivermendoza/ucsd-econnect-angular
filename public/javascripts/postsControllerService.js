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

