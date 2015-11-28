var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

console.log('**** Booted succesfully, inside index.js');

var mongoose = require('mongoose');

var Post = mongoose.model('Post');
var Comment = mongoose.model('Comment');



// User Auth
var passport = require('passport');
var User = mongoose.model('User');
var jwt = require('express-jwt');
var auth = jwt({secret: 'SECRET', userProperty: 'payload'});








// *************** User Authentication ***************************
router.post('/register', function(req, res, next){
	console.log("CREATING A NEW USER: ");
	console.log(req.body);
	if(!req.body.username || !req.body.password || !req.body.email || !req.body.description
	|| !req.body.experience || !req.body.skills || !req.body.interest ){
		return res.status(400).json({message: 'Please fill out all fields'});
	}
	
	var user = new User();

	user.username = req.body.username;
	user.setPassword(req.body.password);

	user.firstName = req.body.firstName;
	user.lastName = req.body.lastName;
	user.email = req.body.email;
	user.description = req.body.description;
	user.experience = req.body.experience;
	user.skills = req.body.skills;
	user.interest = req.body.skills;
	

	user.save(function (err){
		if(err){ 
			if (err.code == '11000') {
				res.status(400).json({message: 'This account name already exists'});
			}
			

			return next(err); 
		}
		//E11000 duplicate key error index
		return res.json({token: user.generateJWT()})
	});
});

router.post('/login', function(req, res, next){
	if(!req.body.username || !req.body.password){
		return res.status(400).json({message: 'Please fill out all fields'});
	}

	passport.authenticate('local', function(err, user, info){
		if(err){ return next(err); }

		if(user){
			return res.json({token: user.generateJWT()});
		} else {
			return res.status(401).json(info);
		}
	})(req, res, next);
});






// TODO Needs work
router.get('/profileimage',function(req, res){
    fs.readFile('./public/images/' + reg.params.file, function(err, image){
        if(err) return res.status(401).send('Fail');
        var base64Image = new Buffer(image, 'binary').toString('base64');
        return res.sent('data:image/' 
        + 
        reg.params.file.split('.')[1]
        +
        ';base64,'
        +
        base64Image
        );
    });
});






// Preloads all profiles
router.get('/profiles', function(req, res, profiles) {
	User.find(function(err, profiles){
		if(err){ return next(err); }

		res.json(profiles);
	});
});

// Loads an existing profile
router.param('profile', function(req, res, next, id) {
	console.log('**** Loading existing profile');
	var query = User.findById(id);

	query.exec(function (err, profile){
		if (err) { return next(err); }
		if (!post) { return next(new Error('can\'t find user profile')); }

		req.profile = profile;
		return next();
	});
});

// Route to get a specific profile
router.get('/profiles/:profile', function(req, res, next) {
	req.post.populate('comments', function(err, profile) {
		if (err) { return next(err); }

		res.json(profile);
	})
});








router.get('/posts', function(req, res, next) {
	Post.find(function(err, posts){
		console.log('**** GETTING ALL POSTS');

		if(err){ return next(err); }

		res.json(posts);
	});
});

// Route to create a new post
router.post('/posts', auth, function(req, res, next) {
  var post = new Post(req.body);
  post.author = req.payload.username;

  post.save(function(err, post){
    if(err){ return next(err); }

    res.json(post);
  });
});


// Route to load an existing post
router.param('post', function(req, res, next, id) {
	var query = Post.findById(id);

	query.exec(function (err, post){
		if (err) { return next(err); }
		if (!post) { return next(new Error('can\'t find post')); }

		req.post = post;
		return next();
	});
});




// Route to get a specific post
router.get('/posts/:post', function(req, res, next) {
	req.post.populate('comments', function(err, post) {
		if (err) { return next(err); }

		res.json(post);
	})
});
// Route to upvote a specific post by one vote
router.put('/posts/:post/upvote', auth, function(req, res, next) {
	req.post.upvote(function(err, post) {
		if (err) { return next(err); }

		res.json(post);
	});
});

router.delete('/posts/:post/remove', function(req, res, next) {
	Post.remove({ _id: req.post.id }, function(err) {
    	if (err) { return next(err); }

    	res.json({message: "Successfully deleted"});
	});
});


// Gets all comments for that specific post
router.get('/posts/:post/comments', function(req, res, next) {
	var query = Comment.find({post: req.post.id});
	query.exec(function(err, comments){
		if(err){ return next(err); }

		res.json(comments);
	});
});


// Creates a new comment
router.post('/posts/:post/comments', auth, function(req, res, next) {
	var comment = new Comment(req.body);
	comment.post = req.post;
	comment.author = req.payload.username;

	comment.save(function(err, comment) {
		if(err) { return next(err); }

		// Pushes the specific comment to the Comment Schema object
		req.post.comments.push(comment);

		// Saves the post and attach a reference from the post object
		req.post.save(function(err, post) {
			if(err) { return next(err); }

			res.json(comment);
		})
	})
})

// Preloads an existing comment
router.param('comment', function(req, res, next, id) {
	var query = Comment.findById(id);

	query.exec(function (err, comment){
		if (err) { return next(err); }
		if (!comment) { return next(new Error('can\'t find comment')); }

		req.comment = comment;
		return next();
	});
});

// Route to get a specific comment
router.get('/posts/:post/comments/:comment', function(req, res) {
	res.json(req.comment);
	
});

// Route to upvote a specific comment
router.put('/posts/:post/comments/:comment/upvote', auth, function(req, res, next) {
	req.comment.upvote(function(err, comment) {
		if (err) { return next(err); }

		res.json(comment);
	});
});


module.exports = router;


