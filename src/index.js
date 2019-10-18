const { ApolloServer, gql } = require('apollo-server-express');
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());

const schema = gql`
  type Query {
    me: User
    user(id: ID!): User
    users: [User!]
  }

  type User {
    id: ID!
    username: String!
  }
`;

const users = {
  1: {
    id: '1',
    username: 'Dylan Cruse',
  },
  2: {
    id: '2',
    username: 'Kate Larberg',
  },
};

const me = users[1];

const resolvers = {
  Query: {
    me: () => me,
    user: (parent, { id }) => users[id],
    users: () => Object.values(users),
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
