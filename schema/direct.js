const { gql } = require('apollo-server-express');
module.exports = gql`
type Direct {
    id: Int!
    text: String!
    sender: User!
    receiverId: Int!
    createdAt: String!
  }

type Mutation {
    createDirect(text: String!, receiverId: Int!, teamId: Int!): Boolean!
}

type Subscription {
  newDirect(teamId: Int!, userId: Int!): Direct!
}

type Query {
  direct(teamId: Int!, otherUserId: Int!): [Direct!]
}

`;