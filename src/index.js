import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import cors from 'cors';
import schema from './schema';
import resolvers from './resolvers';
import models, { sequelize } from './models';

const createUsersWithMessages = async () => {
  await models.User.create(
    {
      username: 'dcruse',
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

const app = express();

app.use(cors());

const server = new ApolloServer({
  typeDefs: schema,
  resolvers,
  context: async () => ({
    models,
    me: await models.User.findByLogin('dcruse'),
  }),
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
