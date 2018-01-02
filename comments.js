const Sequelize = require('sequelize');

class Comments{
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
      console.log('Connection to comments table has been established successfully.');
    })
    .catch(err => {
      console.error('Unable to connect to the database:', err);
    });
  }

  createModel(tablename){
    console.log('creating comments table with '+ tablename);
    return this.sequelize.define(tablename, {
    imageID: Sequelize.INTEGER,
    comment: Sequelize.STRING,
    ownerusername: Sequelize.STRING,
    ownerAvatar: Sequelize.STRING},
    {freezeTableName: true});
  }

  getAll(cb){
    this.model.sync();
    this.model.findAll().then(function(rows) {
       var data = [];
       for(var i = 0; i < rows.length; i++) {
         data.unshift(rows[i].dataValues);
       }
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
        imageID: id
      }
    }).then(function(rows) {
       var comments = [];
       for(var i = 0; i < rows.length; i++) {
         comments.push(rows[i].dataValues);
       }
       return cb(comments);
    });
  }

  deleteOne(id,cb){
    this.model.destroy({
    where: {
        id:id
      }
    })
    cb();
  }


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
}




// export Table class
module.exports = Comments;

//
