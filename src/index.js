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

    message(id: ID!): Message
    messages: [Message!]
  }

  type User {
    id: ID!
    username: String!
    messages: [Message!]
  }

  type Message {
    id: ID!
    text: String!
    user: User!
  }
`;

const users = {
  1: {
    id: '1',
    username: 'Dylan Cruse',
    messageIds: [1],
  },
  2: {
    id: '2',
    username: 'Kate Larberg',
    messageIds: [2],
  },
};

const messages = {
  1: {
    id: '1',
    text: 'Hello World :)',
    userId: '1',
  },
  2: {
    id: '2',
    text: 'Goodbye World :(',
    userId: '2',
  },
};

const resolvers = {
  Query: {
    me: (parent, args, { me }) => me,
    user: (parent, { id }) => users[id],
    users: () => Object.values(users),
    message: (parent, { id }) => messages[id],
    messages: () => Object.values(messages),
  },
  User: {
    username: user => user.username.slice(0, 5),
    messages: user =>
      Object.values(messages).filter(message => user.id === message.userId),
  },
  Message: {
    user: message => users[message.userId],
  },
};

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
