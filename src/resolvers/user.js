export default {
  Query: {
    me: (parent, args, { me }) => me,
    user: (parent, { id }, { models }) => models.users[id],
    users: (parent, args, { models }) => Object.values(models.users),
  },
  User: {
    messages: (user, args, { models }) =>
      Object.values(models.messages).filter(
        message => user.id === message.userId
      ),
  },
};
