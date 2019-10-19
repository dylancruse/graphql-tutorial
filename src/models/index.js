const Sequelize = require('sequelize');

const sequelize = new Sequelize('testdb', {
  dialect: 'postgres',
});

const models = {
  User: sequelize.import('./models/user'),
  Message: sequelize.import('./models/message'),
};

Object.keys(models).forEach(key => {
  if ('associate' in models[key]) {
    models[key].associate(models);
  }
});

module.exports = { sequelize, models };
