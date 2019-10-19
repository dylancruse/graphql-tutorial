const { ApolloServer } = require('apollo-server-express');
const express = require('express');
const cors = require('cors');
const { schema } = require('./schema');
const { resolvers } = require('./resolvers');
const { users } = require('../sampleData');

// test
const app = express();

app.use(cors());

const server = new ApolloServer({
  typeDefs: schema,
  resolvers,
  context: {
    me: users[1],
  },
});

server.applyMiddleware({ app, path: '/graphql' });

app.listen({ port: 8000 }, () => {
  console.log('Apollo Server is running on http://localhost:8000/graphql');
});
