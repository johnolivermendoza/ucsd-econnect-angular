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
var Project = mongoose.model('Project');


// User Auth
var passport = require('passport');
var User = mongoose.model('User');
var jwt = require('express-jwt');
var auth = jwt({secret: 'SECRET', userProperty: 'payload'});


// Image Upload
var multiparty = require('connect-multiparty'),
	multipartyMiddleware = multiparty(),
    fs = require('fs'),
    Grid = require('gridfs-stream');

var gfs = Grid(mongoose.connection.db, mongoose.mongo);


var putFile = function(path, file, callback) {
    var writestream = gfs.createWriteStream({
        filename: file.name,
        content_type: file.type,
    });
	writestream.on('close', function (file) {
			console.log("The file has been stored to database.");
			callback(null, file);
		
	});
    fs.createReadStream(path).pipe(writestream);
}
//app.post('/profile', upload.single('avatar'), function (req, res, next) {
  // req.file is the `avatar` file
  // req.body will hold the text fields, if there were any
//})


router.post('/upload', multipartyMiddleware, function(req,res){
	var file = req.files.file;
    console.log(file._id);

    putFile(file.path, file, function(req, res, err) {
    	console.log("**** Finished Uploading Image to the database.");
    });
        
});



router.get('/upload/:profile', function(req, res) {
	//console.log("**** Getting profiles image: " + req.profile.picName);

    var da = gfs.files.find({ filename: req.profile.picName }).toArray(function(err, items) {
    	if (err) {return;}
    	//console.log(items[0]._id);
    	var readstream = gfs.createReadStream({
	    	_id: items[0]._id
	  	});

        var mime = 'image/jpeg';
        res.set('Content-Type', mime);
        var read_stream = gfs.createReadStream({filename: req.profile.picName});
		read_stream.pipe(res);
		return res.data;
    });
});





router.get('/upload/project/:project', function(req, res, next) {
	//console.log("**** Getting project image: " + req.project);


    var da = gfs.files.find({ filename: req.project.picName }).toArray(function(err, items) {
    	if (err) { return next(err); }
    	//console.log(items[0]._id);
    	var readstream = gfs.createReadStream({
	    	_id: items[0]._id
	  	});

        var mime = 'image/jpeg';
        res.set('Content-Type', mime);
        var read_stream = gfs.createReadStream({filename: req.project.picName});
		read_stream.pipe(res);
		return res.data;
    }); 
});




// *************** User Authentication ***************************
router.post('/register', function(req, res, next){
	console.log("CREATING A NEW USER: ");
	console.log(req.body);
	if(!req.body.username || !req.body.password || !req.body.email || !req.body.shortDescription
	|| !req.body.aboutMe || !req.body.experience || !req.body.skills || !req.body.interest ){
		return res.status(400).json({message: 'Please fill out all fields'});
	}
	
	var user = new User();

	user.username = req.body.username;
	user.setPassword(req.body.password);

	user.firstName = req.body.firstName;
	user.lastName = req.body.lastName;
	user.email = req.body.email;
	user.job = req.body.job;
	user.shortDescription = req.body.shortDescription;
	user.aboutMe = req.body.shortDescription;
	user.experience = req.body.experience;
	user.skills = req.body.skills;
	user.interests = req.body.interests;
	user.picName = req.body.picName;
	

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





/*
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
});*/






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
		if (!profile) { return next(new Error('can\'t find user profile')); }

		req.profile = profile;
		return next();
	});
});

// Route to get a specific profile
router.get('/profiles/:profile', function(req, res, next) {

	// Populate the profile object with its projects
	req.profile.populate('projects', function(err, profile) {
		if (err) { return next(err); }

		res.json(profile);
	})	
});

router.post('/profiles/:profile/updateprofile', function(req, res, next) {
	console.log('**** UPDATING THE CURRENT PROFILE: ');
	console.log(req.body);
	
	User.findById(req.body._id, function (err, user) {
		if (err) return handleError(err);


		user.firstName = req.body.firstName;
		user.lastName = req.body.lastName;
		user.email = req.body.email;
		user.job = req.body.job;
		user.shortDescription = req.body.shortDescription;
		user.aboutMe = req.body.aboutMe;
		user.experience = req.body.experience;
		user.skills = req.body.skills;
		user.interests = req.body.interests;

		user.save(function (err) {
		if (err) return handleError(err);
		res.send(user);
		});
	});
});









// Preloads an existing comment
router.param('project', function(req, res, next, id) {
	var query = Project.findById(id);

	query.exec(function (err, project){
		if (err) { return next(err); }
		if (!project) { return next(new Error('can\'t find project')); }

		req.project = project;
		return next();
	});
});


// Gets all global projects
router.get('/projects', function(req, res, next) {
	Project.find(function(err, projects){
		console.log("**** GETTING ALL PROJECTS");
		if(err){ return next(err); }

		res.json(projects);
	});
});

// Route to get a specific profile
router.get('/projects/:project', function(req, res, next) {

	// Populate the project with users
	req.project.populate('users', function(err, project) {
		if (err) { return next(err); }

		res.json(project);
	})	
});


router.post('/projects/:project/updateproject', function(req, res, next) {
	console.log('**** UPDATING THE CURRENT PROJECT: ');
	console.log(req.body);
	
	Project.findById(req.body._id, function (err, project) {
		if (err) return handleError(err);

		project.name = req.body.name;
		project.description = req.body.description;
		project.teamDescription = req.body.teamDescription;
		project.skills = req.body.skills;

		project.save(function (err) {
		if (err) return handleError(err);
		res.send(project);
		});
	});
});










// Gets all projects for that specific user
router.get('/profiles/:profile/projects', function(req, res, next) {
	var query = Project.find({post: req.post.id});
	query.exec(function(err, projects) {
		if(err){ return next(err); }

		res.json(projects);
	});
});


// Creates a new project
router.post('/profiles/:profile/addproject', function(req, res, next) {
	console.log('**** CREATING A NEW PROJECT: ');
	console.log(req.body);
	if(!req.body.name || !req.body.description || !req.body.skills){
		return res.status(400).json({message: 'Please fill out all fields'});
	}


	var project = new Project();
	// Adds the current user to the list of project users	
	//project.users = {};
	//console.log('**** Adding current user to project users field: ' + req.profile);
	//project.users.push(req.profile);

	project.name = req.body.name;
	project.description = req.body.description;
	project.teamDescription = req.body.teamDescription;
	project.skills = req.body.skills;
	project.creationDate = req.body.creationDate;
	project.launchDate = req.body.launchDate;
	project.createdBy = req.profile;
	project.users.push(req.profile);
	project.picFile = req.body.picFile;
	project.picName = req.body.picName;

	project.save(function(err, project) {
		console.log('**** Saving the project: ' + err);
		if(err) { return next(err); }

		req.profile.projects.push(project);

		// Saves the post and attach a reference from the post object
		req.profile.save(function(err, profile) {
			if(err) { return next(err); }

			res.json(project);
		})
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

	// Populate comments
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


