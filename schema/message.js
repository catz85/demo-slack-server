const { gql } = require('apollo-server-express');
module.exports = gql`
type Message {
    id: Int!
    text: String!
    user: User!
    channel: Channel!
    createdAt: String!
  }

type Mutation {
    createMessage(text: String!, channelId: Int!): Boolean!
}

type Subscription {
  newChannelMessage(channelId: Int!): Message!
}

type Query {
  messages(channelId: Int!): [Message!]
}

`;