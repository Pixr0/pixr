var fs = require('fs');
var express = require('express');
var app = express();
var parser = require('body-parser');
var path = ('path');
var pg = require('pg');
var parseConnectionString = require('pg-connection-string');
var port = process.env.PORT || 5000;
var multer = require('multer');
var user = require('./ormlite');
var bodyParser = require('body-parser');
var expressValidator = require('express-validator');
var flash = require('connect-flash');
var session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var conString = 'postgres://' + process.env.POSTGRES_USER + ':' + process.env.POSTGRES_PASSWORD + '@localhost/uploads';


app.use(parser.json());
app.use(parser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));

//localhost connection string - uncomment line below when testing app locally
const configuration = 'postgres://' + process.env.POSTGRES_USER + ':' + process.env.POSTGRES_PASSWORD + '@localhost/uploads';

//postgres connection string - uncomment line below when testing app on heroku
//const configuration = process.env.DATABASE_URL;


const pool = new pg.Pool(typeof configuration === 'string' ? parseConnectionString.parse(configuration) : configuration);

app.set('view engine', 'ejs');


//multer begin

// diskStorage specifies we're saving the files to disk
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // the directory of where to save the files
    cb(null, 'public/media/uploads')
  },
  filename: function (req, file, cb) {
    // For each request what do we call the file.
    // file.mimetype.split('/')[1] captures the extension (eg png or jpg).
    cb(null, file.originalname.split('.')[0] + '-' + Date.now() + '.' + file.mimetype.split('/')[1])
} });

//upload engine

//name of field comes from the name attr in the html form
const upload = multer({
  storage: storage
}).single('fileUpload');
//end of multer



var requestHandler = multer({ storage: storage })

//bcrypt
var bcrypt = require('bcrypt');
const saltRounds = 10;
const myPlaintextPassword = 'plainPass';
const someOtherPlaintextPassword = 'not_bacon';

// Express Session
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


//photo upload page
app.get('/upload', function(req,res){
  res.render('upload', {});
  }); //router close

//upload handler
app.post('/fileUpload', requestHandler.single('fileUpload'),function (req, res, next) {
  console.log(req.file);
  pool.connect(function(err, client, done) {
     client.query(`insert into uploads (image,title,body) values ($1,$2,$3)`,[req.file.path,req.body.title,req.body.body]);
      console.log('value of fileUpload: '+req.file.path);
      console.log(req.body.title);
      console.log(req.body.body);
      done();
      res.redirect('/');
      });
}); //router close




//main router
app.get('/', function(req, res) {
  pool.connect(function(err, client, done) {
    client.query('select * from uploads order by tstamp desc', function(err, result) {
    res.render('images', {result: result.rows});
      done();
      });
  });
}); // router close

//entry manager
app.get('/manager', function(req, res) {
  pool.connect(function(err, client, done) {
    client.query('select * from uploads order by tstamp desc', function(err, result) {
    res.render('manager', {result: result.rows});
      done();
      });
  });
}); // router close

app.get('/post/:id', function(request, response) {
    console.log(`${request.params.id}`);
    pool.connect(function(err, client, done) {
      client.query(`select * from uploads where id=${request.params.id}`, function(err, result) {
         response.render('post', {result: result.rows});
        done();
        });
    });
});

//login router
app.get('/login', function(req, res) {
    res.render('login', {});
}); // router close

//login router
app.get('/register', function(req, res) {
    res.render('register', {});
}); // router close

//registration user auth handler
app.post('/post/register', function(req, res) {
    var fname = req.body.fname;
    var lname = req.body.lname;
  	var email = req.body.email;
  	var username = req.body.username;
  	var password = req.body.password;
  	var password2 = req.body.password2;


  	// Validation
  	req.checkBody('fname', 'First name is required').notEmpty();
    req.checkBody('lname', 'Last name is required').notEmpty();
  	req.checkBody('email', 'Email is required').notEmpty();
  	req.checkBody('email', 'Email is not valid').isEmail();
  	req.checkBody('username', 'Username is required').notEmpty();
  	req.checkBody('password', 'Password is required').notEmpty();
  	req.checkBody('password2', 'Passwords do not match').equals(req.body.password);



    //bcrypt followed by input to DB
    bcrypt.hash(password, saltRounds, function(err, hash) {
      console.log('This is the hashed password: '+hash);
      var User = new user(conString,'userlog');

      User.insertIntoTable({
        firstName: req.body.fname,
        lastName: req.body.lname,
        email: req.body.email,
        username:req.body.username,
        profImg:req.body.profImg,
        password:hash

      }, function(){
        console.log('Upload to DB succesful!');;
      });

    });


    //Error Handling

  	var errors = req.validationErrors();

    if(errors){
      console.log(errors);
      console.log(errors[2].msg);
      console.log(errors.length);
		// res.render('register',{errors: errors, testvar: 'this is a test'});
    req.flash('error_msg', 'You are registered and can now login');
	} else {
		console.log('everything looks good');
	}
}); // router close



//PREVIOUS PROJECT ROUTERS BELOW

//blog post page
 app.get('/post/*', function(req,res){
   res.render('post', {});
}); //router close

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
app.get('/manager', function(req, res) {
  pool.connect(function(err, client, done) {
    client.query('select * from upload order by tstamp desc', function(err, result) {
    res.render('manager', {result: result.rows});
      done();
      });
  });
}); // router close

//submit button post handler
app.post('/add', function(req,res){
  pool.connect(function(err, client, done) {
    client.query(`insert into blog (title,body,image) values ($1, $2, $3)`,[req.body.title,req.body.message,req.body.image]);
      done();
      res.redirect('/');
      });
  }); //router close

//delete all
app.delete('/delete', function(req, res) {
  pool.connect(function(err, client, done) {
    client.query('delete from uploads', function(err, result) {
      res.sendStatus(200);
      done();
      });
  });
}); // router close

//portfolio page
 app.get('/portfolio', function(req,res){
   res.render('portfolio', {});
}); //router close


//delete by message id
app.delete('/delete/:id', function(req, res) {
  pool.connect(function(err, client, done) {
    client.query('delete from uploads where id = $1',[req.params.id], function(err, result) {
      res.sendStatus(200);
      done();
      });
  });
}); // router close


//No modifications below this line!

//if no routes are matched, return a 404
app.get('*', function(req, res) {
    res.status(404).send('<h1>test err!</h1>');
    res.render('err404', {});
});

//have the application listen on a specific port
app.listen(port, function () {
    console.log("App is running on port " + port);
});
