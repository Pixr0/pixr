
<h1 align="center">
  <br>
  <a href="https://pixr0.herokuapp.com/"><img src="https://i.pinimg.com/originals/37/a9/70/37a9707cf8811fb40de24815eb14397c.jpg" alt="Pixr" width="200"></a>
  <br>
  Pixr
  <br>
</h1>

<h4 align="center">A Simple Image Uploading App Based on Node.js :fire:.  </h4>


##### Changelog for Dec. 11, 2017
* Built initial framework from which all future development will be based off from.
* Deployed provisional app on Heroku. (https://pixr0.herokuapp.com/)

##### Main items left to be done:
* Employ user authentication using passport.js.
* Resize uploaded images with sharp.


# Features

# Instructions

# Project Resources

### NPM Install List
#### index.js
* var fs = require('fs');  -- npm install file-system 
* var express = require('express'); -- npm install express
* var parser = require('body-parser'); -- npm install body-parser
* var path = ('path'); -- $ npm install --save path
* var pg = require('pg'); -- npm install pg
* var parseConnectionString = require('pg-connection-string'); -- npm i pg-connection-string
* var multer = require('multer'); -- npm install multer
* var expressValidator = require('express-validator'); -- npm i express-validator
* var flash = require('connect-flash'); -- npm install flash
* var session = require('express-session'); -- npm install express-session
* var passport = require('passport'); -- npm install passport
* var LocalStrategy = require('passport-local').Strategy; -- npm install passport-local

#### models/index.js (see dependecies)
* var fs = require('fs');  -- npm install file-system 
* var path = ('path'); -- $ npm install --save path
* var Sequelize = require('sequelize'); --npm install sequelize
* var basename  = path.basename(__filename);

## Dependecies
* Sequelize CLI - Run 'sequelize init' in your terminal to load models-index.js and config.json files.
