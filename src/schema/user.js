import { gql } from 'apollo-server-express';

export default gql`
  extend type Query {
    getUsers: [User!]
    getUser(id: ID!): User
    getCurrentUser: User
  }

  extend type Mutation {
    signUp(username: String!, email: String!, password: String!): Token!
    signIn(username: String!, password: String!): Token!
    deleteUser(id: ID!): Boolean!
  }

  type Token {
    token: String!
  }

  type User {
    id: ID!
    username: String!
    email: String!
    messages: [Message!]
    role: String
  }
`;
