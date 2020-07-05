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
    // Returns all messages
    getMessages: async (_, { cursor, limit = 100 }, { models }) => {
      // Add a where clause to the messages query if we received a cursor
      const cursorOptions = cursor
        ? {
            where: {
              createdAt: {
                [Sequelize.Op.lt]: fromCursorHash(cursor),
              },
            },
          }
        : {};

      // Get all of the messages using options (1 more than the limit)
      const messages = await models.Message.findAll({
        order: [['createdAt', 'DESC']],
        limit: limit + 1,
        ...cursorOptions,
      });

      // If we found more messages than the passed in limit,
      // we know there are more messages to fetch
      const hasNextPage = messages.length > limit;

      // If there are more messages to be fetched, return the messages
      // we got minus the extra one we queried for
      const returnedMessages = hasNextPage ? messages.slice(0, -1) : messages;

      return {
        messages: returnedMessages,
        pageInfo: {
          hasNextPage,
          // Create a cursor out of the createdAt value of the last message
          endCursor: toCursorHash(
            returnedMessages[returnedMessages.length - 1].createdAt.toString()
          ),
        },
      };
    },

    // Returns a single message by its id
    getMessage: async (_, { id }, { models }) =>
      await models.Message.findByPk(id),
  },

  Mutation: {
    // Creates a new message
    createMessage: combineResolvers(
      isAuthenticated,
      async (_, { text }, { user, models }) => {
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

    // Deletes a message by its id
    deleteMessage: combineResolvers(
      isAuthenticated,
      isMessageOwner,
      async (_, { id }, { models }) =>
        await models.Message.destroy({ where: { id } })
    ),

    // Updates a message by its id
    updateMessage: async (_, { id, text }, { models }) => {
      const message = await models.Message.findOne({
        where: {
          id,
        },
      });

      if (!message) {
        throw new Error('Unable to find message');
      }

      try {
        await message.update({ text });
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
