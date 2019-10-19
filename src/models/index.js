const users = {
  1: {
    id: '1',
    username: 'Dylan Cruse',
    messageIds: [1],
  },
  2: {
    id: '2',
    username: 'Kate Larberg',
    messageIds: [2],
  },
};

const messages = {
  1: {
    id: '1',
    text: 'Hello World :)',
    userId: '1',
  },
  2: {
    id: '2',
    text: 'Goodbye World :(',
    userId: '2',
  },
};

export default { users, messages };

// const Sequelize = require('sequelize');

// const sequelize = new Sequelize('testdb', {
//   dialect: 'postgres',
// });

// const models = {
//   User: sequelize.import('./models/user'),
//   Message: sequelize.import('./models/message'),
// };

// Object.keys(models).forEach(key => {
//   if ('associate' in models[key]) {
//     models[key].associate(models);
//   }
// });

// module.exports = { sequelize, models };
