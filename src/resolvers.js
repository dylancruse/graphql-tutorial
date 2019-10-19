const uuidv4 = require('uuid/v4');
const { users, messages } = require('./models');

const resolvers = {
  Query: {
    me: (parent, args, { me }) => me,
    user: (parent, { id }) => users[id],
    users: () => Object.values(users),
    message: (parent, { id }) => messages[id],
    messages: () => Object.values(messages),
  },
  Mutation: {
    createMessage: (parent, { text }, { me }) => {
      const id = uuidv4();
      const message = {
        id,
        text,
        userId: me.id,
      };

      messages[id] = message;
      users[me.id].messageIds.push(id);

      return message;
    },
    deleteMessage: (parent, { id }) => {
      const { [id]: message } = messages;
      if (!message) {
        return false;
      }
      delete messages[id];
      return true;
    },
    updateMessage: (parent, { id, text }) => {
      const { [id]: message } = messages;
      if (!message) {
        return false;
      }
      messages[id].text = text;
      return true;
    },
  },
  User: {
    username: user => user.username.slice(0, 5),
    messages: user =>
      Object.values(messages).filter(message => user.id === message.userId),
  },
  Message: {
    user: message => users[message.userId],
  },
};

module.exports = { resolvers };
