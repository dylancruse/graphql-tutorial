/* eslint-disable no-return-await */

export default {
  Query: {
    messages: async (parent, args, { models }) =>
      await models.Message.findAll(),
    message: async (parent, { id }, { models }) =>
      await models.Message.findByPk(id),
  },
  Mutation: {
    createMessage: async (parent, { text }, { me, models }) =>
      await models.Message.create({
        text,
        userId: me.id,
      }),
    deleteMessage: async (parent, { id }, { models }) =>
      await models.Message.destroy({ where: { id } }),
    updateMessage: async (parent, { id, text }, { models }) =>
      await models.Message.update({ text }, { where: { id } })
        .then(result => {
          if (Object.values(result)[0] === 1) {
            return true;
          }
          return false;
        })
        .catch(error => false),
  },
  Message: {
    user: async (message, args, { models }) =>
      await models.User.findByPk(message.userId),
  },
};
