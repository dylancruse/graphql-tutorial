/* eslint-disable no-return-await */
import jwt from 'jsonwebtoken';
import { AuthenticationError, UserInputError } from 'apollo-server';
import { combineResolvers } from 'graphql-resolvers';
import { isAdmin } from './authorization';

const createToken = async (user, secret, expiresIn) => {
  const { id, email, username, role } = user;
  return await jwt.sign({ id, email, username, role }, secret, { expiresIn });
};

export default {
  Query: {
    // Return all users
    getUsers: async (parent, args, { models }) => await models.User.findAll(),

    // Return a user by their id
    getUser: async (parent, { id }, { models }) =>
      await models.User.findByPk(id),

    // Return the current user using their token
    getCurrentUser: async (parent, args, { models, user }) => {
      if (!user) {
        return null;
      }
      return await models.User.findByPk(user.id);
    },
  },
  Mutation: {
    // Create a new user and return a token
    signUp: async (_, { username, email, password }, { models, secret }) => {
      const user = await models.User.create({
        username,
        email,
        password,
      });

      return { token: createToken(user, secret, '10000m') };
    },

    // Return a token for a user if their credentials are valid
    signIn: async (parent, { username, password }, { models, secret }) => {
      const user = await models.User.findByUsername(username);

      if (!user) {
        throw new UserInputError('No user found with these login credentials.');
      }

      const isValid = await user.validatePassword(password);

      if (!isValid) {
        throw new AuthenticationError('Invalid password.');
      }

      return { token: createToken(user, secret, '10000m') };
    },

    // Delete a user by their id
    deleteUser: combineResolvers(
      isAdmin,
      async (parent, { id }, { models }) =>
        await models.User.destroy({
          where: { id },
        })
    ),
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
