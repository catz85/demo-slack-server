const { gql } = require('apollo-server-express');
module.exports = gql`
type Channel {
    id: Int!
    name: String!
    public: Boolean!
    messages: [Message!]!
    users: [User!]!
}

type ChannelResponse {
  ok: Boolean!
  channel: Channel
  errors: [Error!]
}

type Mutation {
    createChannel(teamId: Int!, public: Boolean=false, name: String!): ChannelResponse
}`;