// =================================================================
// get the packages we need ========================================
// =================================================================
var express 	= require('express');
var app         = express();
var bodyParser  = require('body-parser');
var morgan      = require('morgan');
var mongoose    = require('mongoose');
var passport = require('passport');
var flash    = require('connect-flash');

var jwt    = require('jsonwebtoken'); // used to create, sign, and verify tokens
var config = require('./config'); // get our config file
var User   = require('./app/models/user'); // get our mongoose model
var Posts   = require('./app/models/posts'); // get our mongoose model
var Channels   = require('./app/models/channel'); // get our mongoose model
var server = require('http').createServer(app);
var io = require('socket.io')(server);

// =================================================================
// configuration ===================================================
// =================================================================
var port = process.env.PORT || 8081; // used to create, sign, and verify tokens
mongoose.connect(config.database); // connect to database
app.set('superSecret', config.secret); // secret variable
app.use(flash()); // use connect-flash for flash messages stored in session

app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
// use body parser so we can get info from POST and/or URL parameters
// app.use(bodyParser.urlencoded({ extended: false }));
// app.use(bodyParser.json());
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());
var urlencodedParser = bodyParser.urlencoded({ extended: false });

// use morgan to log requests to the console
app.use(morgan('dev'));

// =================================================================
// routes ==========================================================
// =================================================================
// app.get('/setup', function(req, res) {
//
// 	// create a sample user
// 	var user = new User({
// 		name: 'Ronen',
// 		password: 'password',
// 		admin: true
// 	});
// 	user.save(function(err) {
// 		if (err) throw err;
//
// 		console.log('User saved successfully');
// 		res.json({ success: true });
// 	});
// });

// app.get('/auth/facebook', passport.authenticate('facebook', {
//     scope : ['public_profile', 'email']
// }));
//
// // handle the callback after facebook has authenticated the user
// app.get('/auth/facebook/callback',
//     passport.authenticate('facebook', {
//         successRedirect : '/profile',
//         failureRedirect : '/'
//     }));

// // route for logging out
// app.get('/logout', function(req, res) {
//     req.logout();
//     res.redirect('/');
// });


/**
 *
 */
app.post('/register',urlencodedParser, function (req,res) {

	var user = new User({
		email: req.body.email,
		name: req.body.name,
		password: req.body.password,
		//admin:false,
        // groups:[],
		// tokenF:req.body.token,
		// profile_id:req.body.profile_id,
        // countOfProjects: 0
	});
    if(req.body.type = 'f'){
    	user.tokenF = req.body.tokenF
		user.profile_id = req.body.profile_id;
    	user.password = null;
    }
	user.save(function(err) {

        if (err) {
        	res.send({error:"check your details, it might be your email is already exists"})
			console.log(err)
		}
		else{

        	console.log('User saved successfully');
        	res.json(user);
        }
    });

});

// basic route (http://localhost:8080)
app.get('/', function(req, res) {
	res.send('Hello! The API is at http://localhost:' + port + '/api');
});

// ---------------------------------------------------------
// get an instance of the router for api routes
// ---------------------------------------------------------
var apiRoutes = express.Router(); 
var token = '';
// ---------------------------------------------------------
// authentication (no middleware necessary since this isnt authenticated)
// ---------------------------------------------------------
// http://localhost:8080/api/authenticate
apiRoutes.post('/authenticate', urlencodedParser,function(req, res) {

	// find the user
	User.findOne({
		email: req.body.email
	}, function(err, user) {

		if (err) throw err;

		if (!user) {
            console.log(JSON.stringify(req.body.email))
			res.json({ success: false, message: 'Authentication failed. User not found.' });
		} else if (user) {

			// check if password matches
			if ((user.password !== req.body.password)||(user.tokenF!==req.body.tokenF)) {
				res.json({ success: false, message: 'Authentication failed. Wrong password.' });
			} else {

				// if user is found and password is right
				// create a token
				console.log(user)
				token = jwt.sign(user, app.get('superSecret'), {
					expiresIn: 864000000000000000000 // expires in 24 hours
				});

				res.json({
					success: true,
					message: 'Enjoy your token!',
					token: token
				});


			}

		}

	});
});

// ---------------------------------------------------------
// route middleware to authenticate and check token
// ---------------------------------------------------------
apiRoutes.use(function(req, res, next) {

	// check header or url parameters or post parameters for token
	var token = req.body.token || req.param('token') || req.headers['x-access-token'];

	// decode token
	if (token) {

		// verifies secret and checks exp
		jwt.verify(token, app.get('superSecret'), function(err, decoded) {			
			if (err) {
				return res.json({ success: false, message: 'Failed to authenticate token.' });		
			} else {
				// if everything is good, save to request for use in other routes
				if(req.body.email === decoded._doc.email){
				req.decoded = decoded;	
				next();
				}else{
                    return res.json({ success: false, message: 'Failed to authenticate token.' });

                }


			}
		});

	} else {

		// if there is no token
		// return an error
		return res.status(403).send({ 
			success: false, 
			message: 'No token provided.'
		});
		
	}
	
});

// ---------------------------------------------------------
// authenticated routes
// ---------------------------------------------------------
apiRoutes.get('/', function(req, res) {
	res.json({ authenticated: true });
});

apiRoutes.get('/users', function(req, res) {
	User.find({}, function(err, users) {
		res.json(users);
	});
});


apiRoutes.get('/check', function(req, res) {
	res.json(req.decoded);
});
apiRoutes.post('/add_project1',function (req,res) {
	//db.scores.findOneAndUpdate
	if(req.decoded._doc.email === req.body.email) {
        var projectJson = {name: req.body.name, description:req.body.description , skills:req.body.skills }
        User.findOneAndUpdate({email: req.body.email}, {$push: {projects: projectJson}} ,function(err, users) {

            if (err)
                res.json({message: "fuck"});
            else
                res.json({message: "yay"})
        })


		var counter = 0;
        User.find({email: req.body.email}, function(err, users) {
            counter = users.countOfProjects;
        });

		User.findOneAndUpdate({email: req.body.email},{$inc: {countOfProjects:counter}})
    }

})

apiRoutes.get('/get_projects',function (req,res) {
    User.find({email: req.body.email}, function(err, users) {
        //counter = users.countOfProjects;
		res.json({projects:users.groups})
    });
});

/**
 * @parameters /api/add_project
 * {
 * 	projectData:{
 * 					tripTitle: String,
 * 					contributors: list of emails,
 * 					isAdmin: boolean,
 * 					start_date: timestamp,
 * 					end_date: timestamp,
 * 					location: city name
 * 				}
 * 	}
 * 	to start new trip.
 */
apiRoutes.post('/add_project',function(req,res){
	var group ={
		trip_name	:req.body.projectData.tripTitle,
		contributors:req.body.projectData.contributors,
		isAdmin		:req.body.projectData.isAdmin,
		start_date	:req.body.projectData.start_date,
		end_date	:req.body.projectData.end_date,
		location	:req.body.projectData.location

	}
    User.findOneAndUpdate({email: req.body.email},{$push: {groups:req.body.projectData}},function (err) {
		if(err!==null){
			res.json({err:err})
		}
		else{
            res.json({status:"success"})
        }
    })
});

app.use('/api', apiRoutes);

// =================================================================
// start the server ================================================
// =================================================================
io.on('connection', function(client) {
    console.log('Client connected...');

    client.on('join', function (data) {
        console.log(data);
    });

});
server.listen(port);
console.log('Magic happens at http://localhost:' + port);

