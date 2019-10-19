import uuidv4 from 'uuid/v4';

const resolvers = {
  Query: {
    me: (parent, args, { me }) => me,
    user: (parent, { id }, { models }) => models.users[id],
    users: (parent, args, { models }) => Object.values(models.users),
    message: (parent, { id }, { models }) => models.messages[id],
    messages: (parent, args, { models }) => Object.values(models.messages),
  },
  Mutation: {
    createMessage: (parent, { text }, { me, models }) => {
      const id = uuidv4();
      const message = {
        id,
        text,
        userId: me.id,
      };

      models.messages[id] = message;
      models.users[me.id].messageIds.push(id);

      return message;
    },
    deleteMessage: (parent, { id }, { models }) => {
      const { [id]: message } = models.messages;
      if (!message) {
        return false;
      }
      delete models.messages[id];
      return true;
    },
    updateMessage: (parent, { id, text }, { models }) => {
      const { [id]: message } = models.messages;
      if (!message) {
        return false;
      }
      models.messages[id].text = text;
      return true;
    },
  },
  User: {
    username: user => user.username,
    messages: (user, args, { models }) =>
      Object.values(models.messages).filter(
        message => user.id === message.userId
      ),
  },
  Message: {
    user: (message, args, { models }) => models.users[message.userId],
  },
};

export default resolvers;
