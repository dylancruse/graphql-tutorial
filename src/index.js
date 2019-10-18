const cors = require('cors');

const { ApolloServer, gql } = require('apollo-server-express');

const express = require('express');

const app = express();

app.use(cors());

const schema = gql`
  type Query {
    me: User
  }

  type User {
    username: String!
  }
`;

const resolvers = {
  Query: {
    me: () => ({
      username: 'Dylan Cruse',
    }),
  },
};

const server = new ApolloServer({
  typeDefs: schema,
  resolvers,
});

server.applyMiddleware({ app, path: '/graphql' });

app.listen({ port: 8000 }, () => {
  console.log('Apollo Server is running on http://localhost:8000/graphql');
});
