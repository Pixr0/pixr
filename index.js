var fs = require('fs');
var S3FS = require('s3fs');
var dotenv = require('dotenv').config()
var multiparty = require('connect-multiparty');
var multipartyMiddleware = multiparty();
var express = require('express');
var app = express();
var aws = require('aws-sdk')
var multerS3 = require('multer-s3')
var parser = require('body-parser');
var path = ('path');
var pg = require('pg');
pg.defaults.ssl = true;
var parseConnectionString = require('pg-connection-string');
var port = process.env.PORT || 5000;
var multer = require('multer');
var user = require('./ormlite');
var images = require('./images');
var sharp = require('sharp');
var comments = require('./comments');
var bodyParser = require('body-parser');
var expressValidator = require('express-validator');
var flash = require('connect-flash');
var session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var s3 = require( 'multer-storage-s3' );

//var conString = 'postgres://' + process.env.POSTGRES_USER + ':' + process.env.POSTGRES_PASSWORD + '@localhost/pixr';

// var conString = 'postgres://' + process.env.POSTGRES_USER + ':' + process.env.POSTGRES_PASSWORD + '@localhost/pixr';

//sequelize models

var User = new user(process.env.DATABASE_URL,'users');
var Images = new images(process.env.DATABASE_URL,'images');
var Comments = new comments(process.env.DATABASE_URL,'comments');

//amazon s3

// var s3 = new S3FS('nycdapixr',{
//   accessKeyId: process.env.AWSAccessKeyId,
//   secretAccessKey: process.env.AWSSecretKey
// });

//middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(__dirname + '/public'));
//app.use(multipartyMiddleware);

//localhost connection string - uncomment line below when testing app locally
//const configuration = 'postgres://' + process.env.POSTGRES_USER + ':' + process.env.POSTGRES_PASSWORD + '@localhost/uploads';

//postgres connection string - uncomment line below when testing app on heroku
// const configuration = process.env.DATABASE_URL;
// console.log(process.env.DATABASE_URL);



app.set('view engine', 'ejs');


//routes for multer-s3

var avatar = s3({
    destination : function( req, file, cb ) {
        cb( null, 'avatars' );
    },
    filename    : function( req, file, cb ) {
        cb( null, file.fieldname + '-' + Date.now() + '.' + file.mimetype.split('/')[1] );
    },
    bucket      : 'nycdapixr',
    region      : 'us-east-1'
});

var image = s3({
    destination : function( req, file, cb ) {
        cb( null, 'original' );
    },
    filename    : function( req, file, cb ) {
        cb( null, file.fieldname + '-' + Date.now() + '.' + file.mimetype.split('/')[1] );
    },
    bucket      : 'nycdapixr',
    region      : 'us-east-1'
});


var avatar = multer({ storage: avatar })
var image = multer({ storage: image })

//bcrypt
var bcrypt = require('bcrypt');
const saltRounds = 10;
const myPlaintextPassword = 'plainPass';
const someOtherPlaintextPassword = 'not_bacon';

//Express Session
app.use(session({
    secret: 'secret',
    saveUninitialized: true,
    resave: true
}));

// Passport init
app.use(passport.initialize());
app.use(passport.session());


// Express Validator
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));

// Connect Flash
app.use(flash());

// Global Vars
app.use(function (req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.user = req.user || null;
  next();
});


//end of required config. main code begins below

//ensure authentication -
function ensureAuthenticated(req, res, next){
	if(req.isAuthenticated()){
		return next();
	} else {
		req.flash('error_msg','You must be logged in to view that page');
		res.redirect('/');
	}
}

//login router
app.get('/', function(req, res) {
    res.render('login');
}); // router close

app.get('/success', function(req, res) {
    res.send('Login successful');
}); // router close

app.get('/fail', function(req, res) {
    req.flash('error_msg','Invalid username or password')
    res.render('login');
}); // router close



//local strategy
passport.use(new LocalStrategy(
  function(username, password, done) {


   User.getUserByUsername(username, function(data,err){
    // console.log('this is the returned data: '+data);
    var user = data[0];
   	if(!user){
			//invalid username
      console.log('invalid user');
   		return done(null, false, {message: 'Unknown User'});
   	}

   	User.comparePassword(password, user.password, function(err, result){
   		if (err)
        return err;
   		if(result){
				//succesful login
        console.log('login succesful');
   			return done(null, user);
     		} else {
  				//invalid password
          console.log('invalid pass');
     			return done(null, false, {message: 'Invalid password'});
   		}
   	});
   });


  }));



//orm test
app.get('/orm', function(req, res) {
    User.getUserByUsername('jmacaldo', function(data){
      User.comparePassword('plpl',data[0].password, function(error,result){
        console.log('result from bcrypt: '+result);
    })

   })
}); // router close


//serialize deserializeUser
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(data,err) {
    var user = data[0];
    console.log(user);
    done(err, user);
  });
});

//passport login
app.post('/login',
  passport.authenticate('local', {
    failureRedirect:'/fail',
    failureFlash: true}),
  function(req, res) {
    req.flash('success_msg','You are now logged in!')
    res.redirect('/images');
  });

//logout router
  app.get('/logout', function(req, res){
    console.log('before logout '+ req.user.username);
  	req.logout();
  	req.flash('success_msg', 'You are logged out');
  	res.redirect('/');
  });

//login router
app.get('/register', function(req, res) {
    res.render('register');
    res.end();
}); // router close

//user page
app.get('/users/:user',ensureAuthenticated, function(req, res) {

  Images.findById(req.user.id, function(data){
    res.render('user', {result: data});
  });
}); // router close





//registration user auth handler
app.post('/register', function(req, res) {
    var fname = req.body.fname;
    var lname = req.body.lname;
  	var email = req.body.email;
  	var username = req.body.username;
  	var password = req.body.password;
  	var password2 = req.body.password2;
    var profImg = req.body.profImg;

  	// Validation
  	req.checkBody('fname', 'First name is required').notEmpty();
    req.checkBody('lname', 'Last name is required').notEmpty();
  	req.checkBody('email', 'Email is required').notEmpty();
  	req.checkBody('email', 'Email is not valid').isEmail();
  	req.checkBody('username', 'Username is required').notEmpty();
  	req.checkBody('password', 'Password is required').notEmpty();
  	req.checkBody('password2', 'Passwords do not match').equals(req.body.password);

    //Error Handling

  	var errors = req.validationErrors();

    if(errors){
      console.log(errors);
      res.render('register', {errors: errors});
	} else {
    //bcrypt followed by input to DB
    console.log('plain string password: '+password);
    bcrypt.hash(password, saltRounds, function(err, hash) {
      console.log('This is the hashed password: '+hash);

      User.insertIntoTable({
        firstName: req.body.fname,
        lastName: req.body.lname,
        email: req.body.email,
        username:req.body.username,
        profImg: 'defaultavatar.png',
        password:hash
      }, function(){
        console.log('Upload to DB succesful!');;
      });

    });
		console.log('everything looks good');
    req.flash('success_msg', 'You are registered and can now login');
    res.redirect('/');
	}
}); // router close


//profile image upload page
app.get('/profimg', function(req,res){
  res.render('profimg', {});
  }); //router close

//prof img upload handler
app.post('/profimg', avatar.single("image"),function (req, res, next) {
//console.log(req.file.path);
  if (!req.file) {
    req.flash('error_msg','File required')
    res.redirect('profimg');

  }else {
    console.log(req.file.filename);
    User.uploadProfImg(req.user.id,req.file.filename);
    res.redirect('manager');
    };



}); //router close

//PREVIOUS PROJECT ROUTERS BELOW

//photo upload page
app.get('/upload', ensureAuthenticated, function(req,res){
  res.render('upload', {});
  }); //router close

//upload handler
app.post('/upload', image.single("image"),function (req, res, next) {
  req.checkBody('description', 'Image description is required').notEmpty();
  req.checkBody('description', 'A description that is not over 150 characters is required').isLength({ max: 150 });

  var errors = req.validationErrors();
  console.log(errors);

  if(errors){
    req.flash('error_msg','A description is required, and it must not be over 150 characters')
    res.redirect('upload');
    return;
  }

  if (!req.file) {
    req.flash('error_msg','File required')
    res.redirect('upload');
    return;

  } else {
    Images.insertIntoTable({
      imgUrl: req.file.filename,
      description: req.body.description,
      tags: req.body.tags,
      ownerusername: req.user.username,
      ownerAvatar: req.user.profImg,
      owner: req.user.id
    }, function(){
    res.redirect('/images');
    });
  };



}); //router close

//comments handler
app.post('/postcomment',function (req, res) {
  // Validation -
  // req.checkBody('image', 'Image file is required').notEmpty();
  req.checkBody('comment', 'Comment cannot be empty').notEmpty();

  var errors = req.validationErrors();

  if(errors){
    req.flash('error_msg','Comment required')
    res.redirect('upload');
  }


  else {
    Comments.insertIntoTable({
      imageID: req.body.imgid,
      comment: req.body.comment,
      ownerusername: req.user.username,
      ownerAvatar: req.user.profImg
    }, function(){
      req.flash('success_msg','File uploaded!')
      res.redirect('/images/'+req.body.imgid);
      console.log('handler '+req.body.imgid);
    });


};
}); //router close




//public feed
app.get('/images', ensureAuthenticated, function(req, res) {
    Images.getAll(function(data){
      res.render('images', {result: data, user: req.user});
    });
}); // router close

//solo image
app.get('/images/:id', ensureAuthenticated, function(req, res, next) {
    Images.global(req.params.id,function(data){
        Comments.findById(req.params.id, function(comments){
            res.render('soloimage', {result: data, comments:comments, user:req.user, id:req.params.id});
          })
            })
     });



//edit description
app.get('/edit/:id', ensureAuthenticated, function(req, res) {
    Images.global(req.params.id, function(data){
      res.render('edit', {result: data, user: req.user, id: req.params.id});
    });
}); // router close

//prof img upload handler
app.post('/editdescription' ,function (req, res, next) {
    Images.editDesc(req.body.imgid,req.body.descEdit,req.body.tagEdit, function(){
      res.redirect('/manager');
    });
}); //router close

//entry manager
app.get('/manager', ensureAuthenticated, function(req, res) {
   Images.findById(req.user.id, function(data){
     res.render('manager', {result: data});
   });
}); // router close

//photos by tag
app.get('/tags/:tag', ensureAuthenticated, function(req, res) {
   Images.findByTag(req.params.tag, function(data){
     res.render('tags', {result: data, tag:req.params.tag});
   });
}); // router close


//
// app.get('/post/:id', function(request, response) {
//     console.log(`${request.params.id}`);
//     pool.connect(function(err, client, done) {
//       client.query(`select * from uploads where id=${request.params.id}`, function(err, result) {
//          response.render('post', {result: result.rows});
//         done();
//         });
//     });
// });

//blog post page
//  app.get('/post/*', function(req,res){
//    res.render('post', {});
// }); //router close

//blog
// app.get('/', function(req, res) {
//   pool.connect(function(err, client, done) {
//     client.query('select * from blog order by tstamp desc', function(err, result) {
//     res.render('blog', {result: result.rows});
//       done();
//       });
//   });
// }); // router close

//entry manager
// app.get('/manager', function(req, res) {
//   pool.connect(function(err, client, done) {
//     client.query('select * from upload order by tstamp desc', function(err, result) {
//     res.render('manager', {result: result.rows});
//       done();
//       });
//   });
// }); // router close

//submit button post handler
// app.post('/add', function(req,res){
//   pool.connect(function(err, client, done) {
//     client.query(`insert into blog (title,body,image) values ($1, $2, $3)`,[req.body.title,req.body.message,req.body.image]);
//       done();
//       res.redirect('/');
//       });
//   }); //router close

//delete all
app.delete('/delete', function(req, res) {
  pool.connect(function(err, client, done) {
    client.query('delete from uploads', function(err, result) {
      res.sendStatus(200);
      done();
      });
  });
}); // router close


//delete by message id
app.delete('/delete/:id', function(req, res) {
  console.log('id of image being deleted '+req.params.id);
  Images.deleteOne(req.params.id, function(req, res){
    render('/manager');
  });
}); // router close




//No modifications below this line!

//if no routes are matched, return a 404
app.get('*', function(req, res) {
    res.status(404).send('404 error');
});

//have the application listen on a specific port
app.listen(port, function () {
    console.log("App is running on port " + port);
});
