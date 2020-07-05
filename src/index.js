import 'dotenv/config';
import http from 'http';
import express from 'express';
import cors from 'cors';
import { ApolloServer } from 'apollo-server-express';

import schema from './schema';
import resolvers from './resolvers';
import models, { sequelize } from './models';
import { getUser } from './authorization';
import { createUsersWithMessages } from './seed';

// Express app
const app = express();

// Add CORS to Express
app.use(cors());

// Apollo Server
const server = new ApolloServer({
  introspection: true,
  playground: true,
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
      return { models };
    }

    if (req) {
      const user = await getUser(req);

      return {
        models,
        user,
        secret: process.env.SECRET,
      };
    }
  },
});

// Set up Apollo Server on Express at /graphql
server.applyMiddleware({ app, path: '/graphql' });

// Use Node http server to host Express server
const httpServer = http.createServer(app);

// Add subscriptions to Apollo Server
server.installSubscriptionHandlers(httpServer);

const isTest = false; // !!process.env.TEST_DATABASE;
const isProduction = false; // !!process.env.DATABASE_URL;
const port = process.env.PORT;

// Sync sequelize models to the DB and run the server
// (Force will cause tables to be overwritten)
sequelize.sync({ force: isTest || isProduction }).then(async () => {
  if (isTest || isProduction) {
    createUsersWithMessages(new Date());
  }
  httpServer.listen({ port }, () => {
    console.log(`Apollo Server is running on http://localhost:${port}/graphql`);
  });
});
