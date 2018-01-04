const Sequelize = require('sequelize');
const bcrypt = require('bcryptjs');

class User{
  constructor(conString, tableName){
    this.tableName = tableName;
    this.sequelize = this.init(conString),
    this.model = this.createModel(this.tableName);
    this.authenticate = this.authenticate();
  }

  init(conString){
    return new Sequelize(conString);
  }

  authenticate(){
    this.model.sync();
      this.sequelize.authenticate()
    .then(() => {
      console.log('Connection to users table has been established successfully.');
    })
    .catch(err => {
      console.error('Unable to connect to the database:', err);
    });
  }

  createModel(tablename){
    console.log('creating users table with '+ tablename);
    return this.sequelize.define(tablename, {
    firstName: Sequelize.STRING,
    lastName: Sequelize.STRING,
    email: Sequelize.STRING,
    password: Sequelize.STRING,
    username: Sequelize.STRING,
    profImg: Sequelize.STRING},
    {freezeTableName: true});
  }



  getAll(cb){
    this.model.sync();
    this.model.findAll().then(function(rows) {
       var data = [];
       for(var i = 0; i < rows.length; i++) {
         data.push(rows[i].dataValues);
       }
       console.log(data);
       return cb(data);
    });
  }

  insertIntoTable(values, callback){
    var tableRef = this.model;
    this.model.sync().then(function(){
      tableRef.create(values);
      callback();
    });
  }

  findById(id, cb){
    this.model.findAll({
      where: {
        id: id
      }
    }).then(function(rows) {
       var data = [];
       for(var i = 0; i < rows.length; i++) {
         data.push(rows[i].dataValues);
       }
      // console.log(data);
       return cb(data);
    });
  }

  uploadProfImg(id, profImgUrl){
    var tableRef = this.model;
    this.model.findOne({
      where: {
        id: id
      }
    })
    .then(function(rows){
      console.log(tableRef);
      tableRef.update({
          profImg: profImgUrl
        }, {where: {id:id}});
    })
  };


  getUserByUsername(username, callback){
    this.model.findAll({
      where: {
        username: username
      }
    })

    .then(function(rows) {
       var data = [];
       for(var i = 0; i < rows.length; i++) {
         data.push(rows[i].dataValues);
       }

       //console.log(data);
       return callback(data);
    })



  }

  comparePassword(candidatePassword, hash, callback){
    bcrypt.compare(candidatePassword, hash, function(err, result) {
      	if(err) return err;
      	callback(false, result);
  	});
  }
}






// export Table class
module.exports = User;

//
