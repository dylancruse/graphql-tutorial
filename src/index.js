import express from 'express';
import { ApolloServer, AuthenticationError } from 'apollo-server-express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import schema from './schema';
import resolvers from './resolvers';
import models, { sequelize } from './models';
import 'dotenv/config';

const createUsersWithMessages = async () => {
  await models.User.create(
    {
      username: 'dcruse',
      email: 'dylan@email.com',
      password: 'dcruse',
      messages: [
        {
          text: 'Well hello there.',
        },
      ],
    },
    {
      include: [models.Message],
    }
  );

  await models.User.create(
    {
      username: 'klarberg',
      email: 'kate@email.com',
      password: 'klarberg',
      messages: [
        {
          text: 'Hello',
        },
        {
          text: 'ayyyyyooooo',
        },
      ],
    },
    {
      include: [models.Message],
    }
  );
};

const getMe = async req => {
  const token = req.headers['x-token'];

  if (token) {
    try {
      return await jwt.verify(token, process.env.SECRET);
    } catch (e) {
      throw new AuthenticationError('Session expired. Please sign in again.');
    }
  }
};

const app = express();

app.use(cors());

const server = new ApolloServer({
  typeDefs: schema,
  resolvers,
  formatError: error => {
    const message = error.message
      .replace('SequelizeValidationError: ', '')
      .replace('Validation error: ', '');
    return {
      ...error,
      message,
    };
  },
  context: async ({ req }) => {
    const me = await getMe(req);
    return {
      models,
      me,
      secret: process.env.SECRET,
    };
  },
});

server.applyMiddleware({ app, path: '/graphql' });

const eraseDatabaseOnSync = true;

sequelize.sync({ force: eraseDatabaseOnSync }).then(async () => {
  if (eraseDatabaseOnSync) {
    createUsersWithMessages();
  }
  app.listen({ port: 8000 }, () => {
    console.log('Apollo Server is running on http://localhost:8000/graphql');
  });
});
