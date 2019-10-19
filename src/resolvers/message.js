import uuidv4 from 'uuid/v4';

export default {
  Query: {
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
  Message: {
    user: (message, args, { models }) => models.users[message.userId],
  },
};
