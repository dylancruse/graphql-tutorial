/* eslint-disable no-return-await */
import { combineResolvers } from 'graphql-resolvers';
import { Sequelize } from 'sequelize';
import { isAuthenticated, isMessageOwner } from './authorization';

const toCursorHash = string => Buffer.from(string).toString('base64');

const fromCursorHash = string =>
  Buffer.from(string, 'base64').toString('ascii');

export default {
  Query: {
    messages: async (parent, { cursor, limit = 100 }, { models }) => {
      const cursorOptions = cursor
        ? {
            where: {
              createdAt: {
                [Sequelize.Op.lt]: fromCursorHash(cursor),
              },
            },
          }
        : {};

      const messages = await models.Message.findAll({
        order: [['createdAt', 'DESC']],
        limit: limit + 1,
        ...cursorOptions,
      });

      const hasNextPage = messages.length > limit;
      const edges = hasNextPage ? messages.slice(0, -1) : messages;

      return {
        edges,
        pageInfo: {
          hasNextPage,
          endCursor: toCursorHash(edges[edges.length - 1].createdAt.toString()),
        },
      };
    },
    message: async (parent, { id }, { models }) =>
      await models.Message.findByPk(id),
  },
  Mutation: {
    createMessage: combineResolvers(
      isAuthenticated,
      async (parent, { text }, { me, models }) =>
        await models.Message.create({
          text,
          userId: me.id,
        })
    ),
    deleteMessage: combineResolvers(
      isAuthenticated,
      isMessageOwner,
      async (parent, { id }, { models }) =>
        await models.Message.destroy({ where: { id } })
    ),
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
