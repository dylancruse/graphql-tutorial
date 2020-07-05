import { gql } from 'apollo-server-express';

export default gql`
  extend type Query {
    getMessages(cursor: String, limit: Int): MessageConnection!
    getMessage(id: ID!): Message
  }

  extend type Mutation {
    createMessage(text: String!): Message!
    deleteMessage(id: ID!): Boolean!
    updateMessage(id: ID!, text: String!): Boolean!
  }

  type Message {
    id: ID!
    text: String!
    userId: Int!
    createdAt: Date!
  }

  type MessageConnection {
    messages: [Message!]!
    pageInfo: PageInfo!
  }

  type PageInfo {
    hasNextPage: Boolean!
    endCursor: String!
  }

  extend type Subscription {
    messageCreated: MessageCreated!
  }

  type MessageCreated {
    message: Message!
  }
`;
