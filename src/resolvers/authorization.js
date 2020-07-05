import { ForbiddenError } from 'apollo-server';
import { combineResolvers, skip } from 'graphql-resolvers';

// Checks if a user was found during context init
export const isAuthenticated = (_, args, { user }) =>
  user ? skip : new ForbiddenError('User not authenticated.');

// Checks if the current user owns a message
export const isMessageOwner = async (_, { id }, { models, user }) => {
  // Lookup the message
  const message = await models.Message.findByPk(id);

  // Throw an error if we didn't find the message
  if (!message) {
    throw new Error('Unable to find message');
  }

  // Throw an error if the user doesn't own the message
  if (message.userId !== user.id) {
    throw new ForbiddenError('User not authenticated as message owner.');
  }
};

// Checks if the current user is an admin
export const isAdmin = combineResolvers(
  isAuthenticated,
  (_, args, { user: { role } }) =>
    role === 'ADMIN'
      ? skip
      : new ForbiddenError('User not authorized as admin.')
);
