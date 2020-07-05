import { ForbiddenError } from 'apollo-server';
import { combineResolvers, skip } from 'graphql-resolvers';

export const isAuthenticated = (parent, args, { user }) =>
  user ? skip : new ForbiddenError('User not authenticated.');

export const isMessageOwner = async (parent, { id }, { models, user }) => {
  const message = await models.Message.findByPk(id, { raw: true });

  if (message.userId !== user.id) {
    throw new ForbiddenError('User not authenticated as message owner.');
  }
};

export const isAdmin = combineResolvers(
  isAuthenticated,
  (parent, args, { user: { role } }) =>
    role === 'ADMIN'
      ? skip
      : new ForbiddenError('User not authorized as admin.')
);
