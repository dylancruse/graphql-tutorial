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
    getUsers: async (_, args, { models }) => await models.User.findAll(),

    // Return a user by their id
    getUser: async (_, { id }, { models }) => await models.User.findByPk(id),

    // Return the current user using their token
    getCurrentUser: async (_, args, { models, user }) => {
      if (!user) {
        return null;
      }
      return await models.User.findByPk(user.id);
    },
  },
  Mutation: {
    // Create a new user and return a token
    signUp: async (
      _,
      // Args
      { username, email, password },
      // Context
      { models, secret, tokenDuration }
    ) => {
      const user = await models.User.create({
        username,
        email,
        password,
      });

      return { token: createToken(user, secret, tokenDuration) };
    },

    // Return a token for a user if their credentials are valid
    signIn: async (
      _,
      // Args
      { username, password },
      // Context
      { models, secret, tokenDuration }
    ) => {
      // Look up the user
      const user = await models.User.findByUsername(username);

      // Throw an error if we didn't find the user
      if (!user) {
        throw new UserInputError('No user found with these login credentials.');
      }

      // Check their password
      const isValid = await user.validatePassword(password);

      // Throw an error if their password was incorrect
      if (!isValid) {
        throw new AuthenticationError('Invalid password.');
      }

      // Create a return a token for that user
      return { token: createToken(user, secret, tokenDuration) };
    },

    // Delete a user by their id
    deleteUser: combineResolvers(
      isAdmin,
      async (_, { id }, { models }) =>
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
