import 'dotenv/config';
import express from 'express';
import { ApolloServer, AuthenticationError } from 'apollo-server-express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import http from 'http';
import DataLoader from 'dataloader';
import loaders from './loaders';
import schema from './schema';
import resolvers from './resolvers';
import models, { sequelize } from './models';

const createUsersWithMessages = async date => {
  await models.User.create(
    {
      username: 'dcruse',
      email: 'dylan@email.com',
      password: 'dcruseeeeee',
      role: 'ADMIN',
      messages: [
        {
          text: 'Well hello there.',
          createdAt: date.setSeconds(date.getSeconds() + 1),
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
          createdAt: date.setSeconds(date.getSeconds() + 1),
        },
        {
          text: 'ayyyyyooooo',
          createdAt: date.setSeconds(date.getSeconds() + 1),
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
  context: async ({ req, connection }) => {
    if (connection) {
      return {
        models,
        loaders: {
          user: new DataLoader(keys => loaders.user.batchUsers(keys, models)),
        },
      };
    }
    if (req) {
      const me = await getMe(req);
      return {
        models,
        me,
        secret: process.env.SECRET,
        loaders: {
          user: new DataLoader(keys => loaders.user.batchUsers(keys, models)),
        },
      };
    }
  },
});

server.applyMiddleware({ app, path: '/graphql' });

const httpServer = http.createServer(app);
server.installSubscriptionHandlers(httpServer);

// const eraseDatabaseOnSync = true;

const isTest = !!process.env.TEST_DATABASE;

sequelize.sync({ force: isTest }).then(async () => {
  if (isTest) {
    createUsersWithMessages(new Date());
  }
  httpServer.listen({ port: 8000 }, () => {
    console.log('Apollo Server is running on http://localhost:8000/graphql');
  });
});
