const Sequelize = require('sequelize');
// const Comments = require('./comments');

class Images{
  constructor(conString, tableName){
    this.tableName = tableName;
    this.sequelize = this.init(conString),
    this.model = this.createModel(this.tableName);
    this.authenticate = this.authenticate();
    // this.association = this.association();
  }

  init(conString){
    return new Sequelize(conString);
  }

  authenticate(){
    this.model.sync();
      this.sequelize.authenticate()
    .then(() => {
      console.log('Connection to images table has been established successfully.');
    })
    .catch(err => {
      console.error('Unable to connect to the database:', err);
    });
  }
//
// association(){
//   this.model.belongsTo(Comments, {foreignKey: 'id', targetKey: 'imageID'});
// }


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
    console.log('passed id ' +id);
    this.model.findAll({
      where: {
        owner: id
      }
    }).then(function(rows) {
       var data = [];
       for(var i = 0; i < rows.length; i++) {
         data.push(rows[i].dataValues);
       }
       console.log(rows.length);
       return cb(data);
    });
  }

  global(id, cb){
    console.log('passed id ' +id);
    this.model.findAll({
      where: {
        id: id
      }
    }).then(function(rows) {
       var data = [];
       for(var i = 0; i < rows.length; i++) {
         data.push(rows[i].dataValues);
       }
       console.log(rows.length);
       return cb(data);
    });
  }

  editDesc(id, desc, cb){
    var tableRef = this.model;
    this.model.findOne({
      where: {
        id: id
      }
    })
    .then(function(rows){
      console.log(tableRef);
      tableRef.update({
          description: desc
        }, {where: {id:id}});
    })
    cb();
  };


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
