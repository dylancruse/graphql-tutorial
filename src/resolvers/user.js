export default {
  Query: {
    users: async (parent, args, { models }) => await models.User.findAll(),
    user: async (parent, { id }, { models }) => await models.User.findByPk(id),
    me: async (parent, args, { models, me }) =>
      await models.User.findByPk(me.id),
  },
  User: {
    messages: async (user, args, { models }) =>
      await models.Message.findAll({
        where: {
          userId: user.id,
        },
      }),
  },
};
