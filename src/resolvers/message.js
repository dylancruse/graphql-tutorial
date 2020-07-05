/* eslint-disable no-return-await */
import { combineResolvers } from 'graphql-resolvers';
import { Sequelize } from 'sequelize';
import pubsub, { EVENTS } from '../subscription';
import { isAuthenticated, isMessageOwner } from './authorization';

const toCursorHash = string => Buffer.from(string).toString('base64');

const fromCursorHash = string =>
  Buffer.from(string, 'base64').toString('ascii');

export default {
  Query: {
    getMessages: async (parent, { cursor, limit = 100 }, { models }) => {
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

    getMessage: async (parent, { id }, { models }) =>
      await models.Message.findByPk(id),
  },

  Mutation: {
    createMessage: combineResolvers(
      isAuthenticated,
      async (parent, { text }, { user, models }) => {
        const message = await models.Message.create({
          text,
          userId: user.id,
        });
        pubsub.publish(EVENTS.MESSAGE.CREATED, {
          messageCreated: { message },
        });
        return message;
      }
    ),

    deleteMessage: combineResolvers(
      isAuthenticated,
      isMessageOwner,
      async (parent, { id }, { models }) =>
        await models.Message.destroy({ where: { id } })
    ),

    updateMessage: async (parent, { id, text }, { models }) => {
      try {
        await models.Message.update({ text }, { where: { id } });
      } catch (e) {
        throw new Error('Unable to update message');
      }

      return true;
    },
  },

  Subscription: {
    messageCreated: {
      subscribe: () => pubsub.asyncIterator(EVENTS.MESSAGE.CREATED),
    },
  },
};
