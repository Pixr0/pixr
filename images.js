const Sequelize = require('sequelize');

class Images{
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
      this.sequelize.authenticate()
    .then(() => {
      console.log('Connection has been established successfully.');
    })
    .catch(err => {
      console.error('Unable to connect to the database:', err);
    });
  }

  createModel(tablename){
    console.log('creating images table with '+ tablename);
    return this.sequelize.define(tablename, {
    imgUrl: Sequelize.STRING,
    description: Sequelize.STRING,
    ownerusername: Sequelize.STRING,
    ownerAvatar: Sequelize.STRING,
    owner: Sequelize.INTEGER},
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
        owner: id
      }
    }).then(function(rows) {
       var data = [];
       for(var i = 0; i < rows.length; i++) {
         data.push(rows[i].dataValues);
       }
       console.log(data);
       return cb(data);
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
module.exports = Images;

//
